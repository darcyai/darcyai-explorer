from darcyai.pipeline import Pipeline
from darcyai.config import RGB
from darcyai.input.video_file_stream import VideoFileStream
from darcyai.input.camera_stream import CameraStream
from darcyai.output.live_feed_stream import LiveFeedStream
from darcyai.perceptor.coral.people_perceptor import PeoplePerceptor

from .perceptors.qrcode_perceptor import QRCodePerceptor, RAW_QRCODE_EVENT
from .perceptors.face_mask_perceptor import FaceMaskPerceptor, NO_MASK_EVENT, RAW_MASK_EVENT
import os
import time
import logging
import json
import cv2

absolutepath = os.path.dirname(os.path.abspath(__file__))
camera_streams = {}

def get_input_stream(input, process_all_frames: bool = False):
    if input["type"] == "video_file":
        return VideoFileStream(os.path.join(absolutepath, input["file"]), process_all_frames=process_all_frames)
    
    if not input["video_device"] in camera_streams:
        camera_streams[input["video_device"]] = CameraStream(video_device=input["video_device"])
    return camera_streams[input["video_device"]]

class ExplorerPipeline():    
    def __init__(self, app, input, event_cb, logger):
        self._logger = logger
        self.__stopped = False
        self.__pipeline = Pipeline(input_stream=get_input_stream(input),
                                   universal_rest_api=True,
                                   rest_api_flask_app=app,
                                   rest_api_base_path="/pipeline",
                                   perception_completion_callback=self.__on_perception_complete,
                                   pulse_completion_callback=self.__on_pulse_completion)
        self.__output_stream = LiveFeedStream(flask_app=app, path="/live_feed")
        self.__pipeline.add_output_stream("live_feed", self.__output_stream_callback, self.__output_stream)
 
        self.__event_cb = event_cb

        # Business logic storage
        self.__summary = {
            "inScene": 0,
            "visitors": 0,
            "faceMasks": 0,
            "qrCodes": 0
        }
        self.__pps_stats = {
            "last_pps_time": 0,
            "pps": []
        }
        ## Store the last 10 pulses for facemask and qr codes
        self.__previous_mask_results = {}
        ## Store the latest completed pom,
        ## allows for "pausing" and inspecting the latest POM in UI 
        self.__latest_pom = None

        # People Perceptor
        self.__people_perceptor_name = "people"
        people_perceptor = PeoplePerceptor()
        self.__pipeline.add_perceptor(self.__people_perceptor_name, people_perceptor, accelerator_idx=0, input_callback=self.__perceptor_input_callback)
        ## Event callbacks
        people_perceptor.on("new_person_entered_scene", self.__on_new_person_entered_scene)
        people_perceptor.on("person_left_scene", self.__event_cb(self.__people_perceptor_name, "person_left_scene"))
        people_perceptor.on("person_occluded", self.__event_cb(self.__people_perceptor_name, "person_occluded"))
        ## Update configuration
        self.__pipeline.set_perceptor_config(self.__people_perceptor_name, "show_body_rectangle", True)
        self.__pipeline.set_perceptor_config(self.__people_perceptor_name, "body_rectangle_color", RGB(255, 255, 255))
        self.__pipeline.set_perceptor_config(self.__people_perceptor_name, "show_face_rectangle", True)
        self.__pipeline.set_perceptor_config(self.__people_perceptor_name, "face_rectangle_color", RGB(255, 255, 255))
        self.__pipeline.set_perceptor_config(self.__people_perceptor_name, "show_person_id", True)
        self.__pipeline.set_perceptor_config(self.__people_perceptor_name, "person_data_identity_text_font_size", 0.5)
        self.__pipeline.set_perceptor_config(self.__people_perceptor_name, "object_tracking_allowed_missed_frames", 5)
        self.__pipeline.set_perceptor_config(self.__people_perceptor_name, "object_tracking_removal_count", 5)

        # QRCode Perceptor
        self.__qrcode_perceptor_name = "qrcode"
        qrcode_perceptor = QRCodePerceptor()
        self.__pipeline.add_perceptor(self.__qrcode_perceptor_name, qrcode_perceptor, accelerator_idx=0, parent=self.__people_perceptor_name, input_callback=self.__qr_code_input_callback)
        ## Event callbacks
        qrcode_perceptor.on(RAW_QRCODE_EVENT, self.__event_cb(self.__qrcode_perceptor_name, RAW_QRCODE_EVENT))
        
        # Face mask Perceptor
        self.__face_mask_perceptor_name = "facemask"
        face_mask_perceptor = FaceMaskPerceptor()
        self.__pipeline.add_perceptor(self.__face_mask_perceptor_name, face_mask_perceptor, accelerator_idx=0, parent=self.__people_perceptor_name, input_callback=self.__face_mask_input_callback, multi=True)
        ## Event callbacks
        face_mask_perceptor.on(RAW_MASK_EVENT, self.__event_cb(self.__face_mask_perceptor_name, RAW_MASK_EVENT))
        face_mask_perceptor.on(NO_MASK_EVENT, self.__event_cb(self.__face_mask_perceptor_name, NO_MASK_EVENT))

        self.__qrcode_person_id = None
        self.__previous_qr_code_frame_number = 0
        self.__minimum_face_height = int(os.getenv("MINIMUM_FACE_HEIGHT", 200))
        self.__minimum_body_width = int(os.getenv("MINIMUM_BODY_WIDTH", 210))
        self.__qrcode_frame_number_interval = int(os.getenv("QRCODE_FRAME_NUMBER_INTERVAL", 25))

    def __update_masks_count(self, pom):
        pulse_number = pom.get_pulse_number()
        mask_results = pom.get_perceptor(self.__face_mask_perceptor_name)
        if len(mask_results) == 0:
            return

        for mask_result in mask_results:
            person_id = mask_result.get_person_id()
            if not person_id in self.__previous_mask_results:
                self.__previous_mask_results[person_id] = {
                    "count": [1 if mask_result.has_mask() else 0],
                    "pulse_number": pulse_number,
                    "has_mask": False
                }
                continue

            # Rolling window of 10 frames
            self.__previous_mask_results[person_id]["count"].append(1 if mask_result.has_mask() else 0)
            if len(self.__previous_mask_results[person_id]["count"]) > 10:
                self.__previous_mask_results[person_id]["count"].pop(0)
            
            # Store latest pulse number where we saw the person
            self.__previous_mask_results[person_id]["pulse_number"] = pulse_number

            # If we have seen a mask for at least 6 frames out of the last 10, we consider them wearing a mask
            if sum(self.__previous_mask_results[person_id]["count"]) >= 6:
                # If we haven't counted the mask yet, we update the counter
                if self.__previous_mask_results[person_id]["has_mask"] == False:
                    self.__summary["faceMasks"] += 1
                    self.__previous_mask_results[person_id]["has_mask"] = True
            # Otherwise, the person is not wearing a mask
            else:
                self.__previous_mask_results[person_id]["has_mask"] = False

        # Remove from memory any person we haven't seen in the last 20 pulses
        to_delete = []
        for person_id in self.__previous_mask_results:
            if self.__previous_mask_results[person_id]["pulse_number"] < pulse_number - 20:
                to_delete.append(person_id)
        for person_id in to_delete:
            del self.__previous_mask_results[person_id]

    def __update_qr_code_count(self, pom):
        qr_code_results = pom.get_perceptor(self.__qrcode_perceptor_name).get_qrcodes()
        if len(qr_code_results[0]) > 0:
            self.__summary["qrCodes"] += 1

    def __on_perception_complete(self, pom):
        # All perceptors are done running
        self.__summary["inScene"] = pom.get_perceptor(self.__people_perceptor_name).peopleCount()
        self.__update_masks_count(pom)
        self.__update_qr_code_count(pom)
    
    def __on_pulse_completion(self, pom):
        # Pipeline has completed
        self.__latest_pom = pom

        qrcode_perceptor_pom = pom.get_perceptor(self.__qrcode_perceptor_name)
        qrcode_results = qrcode_perceptor_pom.get_qrcodes()
        if len(qrcode_results[0]) > 0:
            self.__qrcode_person_id = qrcode_results[1]
            frame_number = self.__pipeline.get_current_pulse_number()
            self.__previous_qr_code_frame_number = frame_number
        
        # Show Pulse per second for debug purposes
        now = time()
        current_pps = pom.get_pps()
        self.__pps_stats["pps"].append(current_pps)
        try:
            pps_time_interval = int(os.getenv("PPS_TIME_INTERVAL", "5"))
        except ValueError:
            pps_time_interval = 5
        if now - self.__pps_stats["last_pps_time"] > pps_time_interval:
            highest_pps = max(self.__pps_stats["pps"])
            lowest_pps = min(self.__pps_stats["pps"])
            average_pps = sum(self.__pps_stats["pps"]) / len(self.__pps_stats["pps"])
            self._logger.info({ pps_time_interval: pps_time_interval, current_pps: current_pps, highest_pps: highest_pps, lowest_pps: lowest_pps, average_pps: average_pps })
            # Reset stats
            self.__pps_stats["pps"] = []
            self.__pps_stats["last_pps_time"] = now
        

    def __reset_summary(self):
        self.__summary = {
            "inScene": 0,
            "visitors": 0,
            "faceMasks": 0,
            "qrCodes": 0
        }
        self.__previous_mask_results = {}
        self.__qrcode_person_id = ''
        self.__previous_qr_code_frame_number = 0

    def __on_new_person_entered_scene(self, event_data):
        self.__summary["visitors"] += 1
        self.__event_cb(self.__people_perceptor_name, "new_person_entered_scene")(event_data)

    def run(self):
        while True:
            if self.__stopped:
                time.sleep(0.01)
            else:
                try:
                    self.__pipeline.run()
                except Exception as e:
                    time.sleep(1)
                    logging.error(json.dumps({'message': str(e)}))
                    pass

    def __output_stream_callback(self, pom, input_data):
        annotated_frame = pom.get_perceptor(self.__people_perceptor_name).annotatedFrame()
        annotated_frame = pom.get_perceptor(self.__qrcode_perceptor_name).draw_rectangles(annotated_frame)
        return annotated_frame

    def change_input(self, input, process_all_frames: bool = False):
        self.__stopped = True
        self.__pipeline.stop()
        self.__pipeline.update_input_stream(get_input_stream(input, process_all_frames))
        self.__reset_summary()
        self.__stopped = False

    # Passthrough callback
    def __perceptor_input_callback(self, input_data, pom, config):
        return input_data.data.copy()

    def __face_mask_input_callback(self, input_data, pom, config):
        data = []
        people = pom.get_perceptor(self.__people_perceptor_name).people()
        for person_id in people:
            person = people[person_id]
            if not person["has_face"]:
                continue

            face = pom.get_perceptor(self.__people_perceptor_name).faceImage(person_id)
            rgb_face = cv2.cvtColor(face, cv2.COLOR_BGR2RGB)
            data.append({"input": rgb_face, "person_id": person_id})

        return data

    # Only run QRCode perceptor if we have a person in front
    def __qr_code_input_callback(self, input_data, pom, config):
        people_perceptor_pom = pom.get_perceptor(self.__people_perceptor_name)
        people_count = people_perceptor_pom.peopleCount()

        if people_count == 0:
            return None

        poi = self.__get_poi(people_perceptor_pom.people())

        if poi is None:
            return None

        if self.__get_face_height(poi) < self.__minimum_face_height \
            and self.__get_body_width(poi) < self.__minimum_body_width:
            return None

        if poi["person_uuid"] == self.__qrcode_person_id:
            return None

        frame_number = self.__pipeline.get_current_pulse_number()
        if frame_number - self.__previous_qr_code_frame_number < self.__qrcode_frame_number_interval:
            return None

        return (input_data.data.copy(), poi["person_uuid"])

    def __get_poi(self, people):
        poi = None
        max_body_width = 0
        for person_id in people:
            person = people[person_id]

            if person["is_poi"]:
                return person

            if not person["has_body"]:
                continue

            body_width = self.__get_body_width(person)
            if body_width >= max_body_width:
                poi = person
                max_body_width = body_width

        return poi

    def __get_face_height(self, person):
        if not person["has_face"]:
            return 0

        rectangle = person["face_rectangle"]
        return rectangle[1][1] - rectangle[0][1]

    def __get_body_width(self, person):
        if not person["has_body"]:
            return 0

        rectangle = person["body_rectangle"]
        return rectangle[1][0] - rectangle[0][0]

    def get_pom(self):
        return self.__pipeline.get_pom()

    def get_pom_history(self):
        return self.__pipeline.get_pom_history()

    def get_latest_input(self):
        return self.__pipeline.get_latest_input()

    def get_current_pulse_number(self):
        return self.__pipeline.get_current_pulse_number()

    def get_historical_input(self, pulse_number):
        return self.__pipeline.get_historical_input(pulse_number)

    def get_historical_pom(self, pulse_number):
        return self.__pipeline.get_historical_pom(pulse_number)

    def get_latest_pom(self):
        return self.__latest_pom
    
    def get_summary(self):
        return self.__summary

if __name__ == "__main__":
    explorer = ExplorerPipeline()
    explorer.run()
