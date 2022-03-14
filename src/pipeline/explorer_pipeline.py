from darcyai.pipeline import Pipeline
from darcyai.input.video_file_stream import VideoFileStream
from darcyai.input.camera_stream import CameraStream
from darcyai.output.live_feed_stream import LiveFeedStream
from darcyai.perceptor.coral.people_perceptor import PeoplePerceptor
from .perceptors.qrcode_perceptor import QRCodePerceptor
from .perceptors.face_mask_perceptor import FaceMaskPerceptor
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
    def __init__(self, app, input, event_cb):
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
        ## Store the last 10 pulses for facemask and qr codes
        self.__previous_mask_results = {}
        self.__detected_face_masks = {}
        self.__previous_qr_codes_results = []
        self.__detected_qr_codes = {}
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
        self.__pipeline.set_perceptor_config(self.__people_perceptor_name, "body_rectangle_color", "255,255,255")
        self.__pipeline.set_perceptor_config(self.__people_perceptor_name, "show_face_rectangle", True)
        self.__pipeline.set_perceptor_config(self.__people_perceptor_name, "face_rectangle_color", "255,255,255")
        self.__pipeline.set_perceptor_config(self.__people_perceptor_name, "show_person_id", True)
        self.__pipeline.set_perceptor_config(self.__people_perceptor_name, "person_data_identity_text_font_size", 0.5)
        self.__pipeline.set_perceptor_config(self.__people_perceptor_name, "object_tracking_allowed_missed_frames", 10)
        self.__pipeline.set_perceptor_config(self.__people_perceptor_name, "object_tracking_removal_count", 15)

        # QRCode Perceptor
        self.__qrcode_perceptor_name = "qrcode"
        qrcode_perceptor = QRCodePerceptor()
        self.__pipeline.add_perceptor(self.__qrcode_perceptor_name, qrcode_perceptor, accelerator_idx=0, parent=self.__people_perceptor_name, input_callback=self.__qr_code_input_callback)
        ## Event callbacks
        qrcode_perceptor.on("qrcode_detected", self.__event_cb(self.__qrcode_perceptor_name, "qrcode_detected"))
        
        # Face mask Perceptor
        self.__face_mask_perceptor_name = "facemask"
        face_mask_perceptor = FaceMaskPerceptor()
        self.__pipeline.add_perceptor(self.__face_mask_perceptor_name, face_mask_perceptor, accelerator_idx=0, parent=self.__people_perceptor_name, input_callback=self.__face_mask_input_callback, multi=True)
        ## Event callbacks
        face_mask_perceptor.on("mask_detected", self.__event_cb(self.__face_mask_perceptor_name, "mask_detected"))
        face_mask_perceptor.on("no_mask", self.__event_cb(self.__face_mask_perceptor_name, "no_mask"))
        
        # Update configuration
        self.__pipeline.set_perceptor_config(self.__face_mask_perceptor_name, "threshold", 0.85)

        self.__qrcode_person_id = None

    def __update_masks_count(self, pom):
        pulse_number = pom.get_pulse_number()
        mask_results = pom.get_perceptor(self.__face_mask_perceptor_name)
        if len(mask_results) == 0:
            return

        for mask_result in mask_results:
            if not mask_result.has_mask():
                continue

            person_id = mask_result.get_person_id()
            if not person_id in self.__previous_mask_results:
                self.__previous_mask_results[person_id] = {
                    "count": 1,
                    "pulse_number": pulse_number,
                }
                continue

            self.__previous_mask_results[person_id]["count"] += 1
            self.__previous_mask_results[person_id]["pulse_number"] = pulse_number
            if self.__previous_mask_results[person_id]["count"] == 5:
                self.__summary["faceMasks"] += 1
        
        to_delete = []
        for person_id in self.__previous_mask_results:
            if self.__previous_mask_results[person_id]["pulse_number"] < pulse_number - 20:
                to_delete.append(person_id)
        for person_id in to_delete:
            del self.__previous_mask_results[person_id]

    def __update_qr_code_count(self, pom):
        qr_code_results = pom.get_perceptor(self.__qrcode_perceptor_name).get_qrcodes()
        if len(qr_code_results) > 0:
            self.__summary["qrCodes"] += 1

    def __on_perception_complete(self, pom):
        # All perceptors are done running
        self.__summary["inScene"] = pom.get_perceptor(self.__people_perceptor_name).peopleCount()
        self.__update_masks_count(pom)
        self.__update_qr_code_count(pom)
    
    def __on_pulse_completion(self, pom):
        # Pipeline has completed
        self.__latest_pom = pom

        people_perceptor_pom = pom.get_perceptor(self.__people_perceptor_name)
        qrcode_perceptor_pom = pom.get_perceptor(self.__qrcode_perceptor_name)
        poi = people_perceptor_pom.personInFront()
        if poi is not None and len(qrcode_perceptor_pom.get_qrcodes()) > 0:
            self.__qrcode_person_id = poi["person_uuid"]

    def __reset_summary(self):
        self.__summary = {
            "inScene": 0,
            "visitors": 0,
            "faceMasks": 0,
            "qrCodes": 0
        }
        self.__previous_mask_results = {}
        self.__previous_qr_codes_results = []
        self.__detected_face_masks = {}
        self.__detected_qr_codes = {}

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
        return pom.get_perceptor(self.__people_perceptor_name).annotatedFrame()

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
        peeps = people_perceptor_pom.peopleCount()

        if peeps == 0:
            return None

        poi = people_perceptor_pom.personInFront()
        if poi is None or not poi["has_face"] or self.__get_face_height(poi) < 200:
            return None

        if poi["person_uuid"] == self.__qrcode_person_id:
            return None

        return input_data.data.copy()

    def __get_face_height(self, person):
        if not person["has_face"]:
            return 0

        rectangle = person["face_rectangle"]
        return rectangle[1][1] - rectangle[0][1]

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
