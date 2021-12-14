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

        self.__summary = {
            "inScene": 0,
            "visitors": 0,
            "faceMasks": 0,
            "qrCodes": 0
        }
        self.__previous_mask_results = []
        self.__previous_qr_codes = []

        self.__event_cb = event_cb

        self.__latest_pom = None

        # People Perceptor
        self.__people_perceptor_name = "people"
        people_perceptor = PeoplePerceptor()
        self.__pipeline.add_perceptor(self.__people_perceptor_name, people_perceptor, accelerator_idx=0, input_callback=self.__perceptor_input_callback)
        ## Event callbacks
        people_perceptor.on("new_person_entered_scene", self.__on_new_person_entered_scene)
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
        # Find if we detected new facemasks
        for mask_result in mask_results:
            has_mask = mask_result.has_mask()
            # Compare with previous results
            # Comparing with the previous frame prevent us from counting the same mask multiple times,
            # but allow for someone putting and removing his mask
            # This needs to be improved for production use, a single frame without conclusive mask detection will trigger a double count
            prev_has_mask = False
            for prev_mask_result in self.__previous_mask_results:
                if mask_result.get_person_id() == prev_mask_result.get_person_id():
                    prev_has_mask = prev_mask_result.has_mask()
            if has_mask and not prev_has_mask:
                self.__summary["faceMasks"] += 1
        self.__previous_mask_results = mask_results

    def __update_qr_code_count(self, pom):
        qr_code_results = pom.get_perceptor(self.__qrcode_perceptor_name).get_qrcodes()
        for qr_code in qr_code_results:
            # Compare with previous results
            # Comparing with the previous frame prevent us from counting the same qr code multiple times,
            # This needs to be improved for production use, a single frame without conclusive qr code detection will trigger a double count
            if qr_code.get_qrcode_data() not in self.__previous_qr_codes:
                self.__summary["qrCodes"] += 1
            
        self.__previous_qr_codes = [qr_code.get_qrcode_data() for qr_code in qr_code_results]

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
        self.__previous_qr_codes = []

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
