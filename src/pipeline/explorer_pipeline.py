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

        # QRCode Perceptor
        self.__qrcode_perceptor_name = "qrcode"
        qrcode_perceptor = QRCodePerceptor()
        self.__pipeline.add_perceptor(self.__qrcode_perceptor_name, qrcode_perceptor, accelerator_idx=0, input_callback=self.__perceptor_input_callback)

        # Face mask Perceptor
        self.__face_mask_perceptor_name = "facemask"
        face_mask_perceptor = FaceMaskPerceptor()
        self.__pipeline.add_perceptor(self.__face_mask_perceptor_name, face_mask_perceptor, accelerator_idx=0, parent=self.__people_perceptor_name, input_callback=self.__face_mask_input_callback, multi=True)

    def __on_perception_complete(self, pom):
        # All perceptors are done running
        self.__summary["inScene"] = pom.get_perceptor(self.__people_perceptor_name).peopleCount()
    
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
        data = [pom.get_perceptor(self.__people_perceptor_name).faceImage(person_id) for person_id in pom.get_perceptor(self.__people_perceptor_name).people()]
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
