from darcyai_engine.pipeline import Pipeline
from darcyai_engine.input.video_file_stream import VideoFileStream
from darcyai_engine.input.camera_stream import CameraStream
from darcyai_engine.output.live_feed_stream import LiveFeedStream
from darcyai_coral.people_perceptor import PeoplePerceptor
from .perceptors.qrcode_perceptor import QRCodePerceptor
from .perceptors.face_mask_perceptor import FaceMaskPerceptor
import os
import time
import platform
import cv2


absolutepath = os.path.dirname(os.path.abspath(__file__))

def is_mac_osx():
    return platform.system() == "Darwin"

def get_input_stream(input):
    if input["type"] == "video_file":
        return VideoFileStream(os.path.join(absolutepath, input["file"]))
    else:
        return CameraStream(video_device=0 if is_mac_osx() else "/dev/video0")

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
        self.__previous_mask_results = []
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

        # QRCode Perceptor
        self.__qrcode_perceptor_name = "qrcode"
        qrcode_perceptor = QRCodePerceptor()
        self.__pipeline.add_perceptor(self.__qrcode_perceptor_name, qrcode_perceptor, accelerator_idx=0, input_callback=self.__perceptor_input_callback)

        # Face mask Perceptor
        self.__face_mask_perceptor_name = "facemask"
        face_mask_perceptor = FaceMaskPerceptor()
        self.__pipeline.add_perceptor(self.__face_mask_perceptor_name, face_mask_perceptor, accelerator_idx=0, parent=self.__people_perceptor_name, input_callback=self.__face_mask_input_callback, multi=True)

    def __update_masks_count(self, pom):
        mask_results = pom.get_perceptor(self.__face_mask_perceptor_name)
        self.__previous_mask_results.append(mask_results)
        if len(self.__previous_mask_results) < 10:
            # Less than 10 pulses, the data is not reliable enough
            return
        self.__previous_mask_results.pop(0)
        # For the last 10 pulses, check to see which person had a mask in >= 6 pulses
        mask_count_per_person_id = {}
        for frame in self.__previous_mask_results:
            for mask_result in frame:
                if mask_result.has_mask():
                    person_id = mask_result.get_person_id()
                    if person_id in mask_count_per_person_id:
                        mask_count_per_person_id[person_id] += 1
                    else:
                        mask_count_per_person_id[person_id] = 1
        for person_id, mask_count in mask_count_per_person_id.items():
            if mask_count >= 6:
                if person_id not in self.__detected_face_masks:
                    self.__summary["faceMasks"] += 1
                    self.__detected_face_masks[person_id] = True
        # Remove persons we haven't seen for 10 frames
        to_remove = []
        for person_id in self.__detected_face_masks:
            found = False
            for frame in self.__previous_mask_results:
                for mask_result in frame:
                    if mask_result.get_person_id() == person_id:
                        found = True
                        break
                if found:
                    break
            if not found:
                to_remove.append(person_id)
        for person_id in to_remove:
            self.__detected_face_masks.pop(person_id)


    def __update_qr_code_count(self, pom):
        qr_code_results = pom.get_perceptor(self.__qrcode_perceptor_name).get_qrcodes()
        self.__previous_qr_codes_results.append(qr_code_results)
        if len(self.__previous_qr_codes_results) < 10:
            # Less than 10 pulses, the data is not reliable enough
            return
        self.__previous_qr_codes_results.pop(0)
        # For the last 10 pulses, check to see which qr code was read for >= 6 pulses
        qr_code_count_per_data = {}
        for frame in self.__previous_qr_codes_results:
            for qr_code in frame:
                qr_code_data = qr_code.get_qrcode_data()
                if qr_code_data in qr_code_count_per_data:
                    qr_code_count_per_data[qr_code_data] += 1
                else:
                    qr_code_count_per_data[qr_code_data] = 1
        for qr_code_data, qr_code_cound in qr_code_count_per_data.items():
            if qr_code_cound >= 6:
                if qr_code_data not in self.__detected_qr_codes:
                    self.__summary["qrCodes"] += 1
                    self.__detected_qr_codes[qr_code_data] = True
        # Remove qr codes we haven't seen for 10 frames
        to_remove = []
        for qr_code_data in self.__detected_qr_codes:
            found = False
            for frame in self.__previous_qr_codes_results:
                if qr_code_data in [qr_code.get_qrcode_data() for qr_code in frame]:
                    found = True
                    break
            if not found:
                to_remove.append(qr_code_data)
        for qr_code in to_remove:
            self.__detected_qr_codes.pop(qr_code_data)

    def __on_perception_complete(self, pom):
        # All perceptors are done running
        self.__summary["inScene"] = pom.get_perceptor(self.__people_perceptor_name).peopleCount()
        self.__update_masks_count(pom)
        self.__update_qr_code_count(pom)
    
    def __on_pulse_completion(self, pom):
        # Pipeline has completed
        self.__latest_pom = pom

    def __reset_summary(self):
        self.__summary = {
            "inScene": 0,
            "visitors": 0,
            "faceMasks": 0,
            "qrCodes": 0
        }
        self.__previous_mask_results = []
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
                    print(e)
                    pass

    def __output_stream_callback(self, pom, input_data):
        return pom.get_perceptor(self.__people_perceptor_name).annotatedFrame()

    def change_input(self, input):
        self.__stopped = True
        self.__pipeline.stop()
        self.__pipeline.update_input_stream(get_input_stream(input))
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
