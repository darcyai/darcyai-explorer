from darcyai_engine.pipeline import Pipeline
from darcyai_engine.input.video_file_stream import VideoFileStream
from darcyai_engine.input.camera_stream import CameraStream
from darcyai_engine.output.live_feed_stream import LiveFeedStream
from darcyai_coral.people_perceptor import PeoplePerceptor
import os
import time

absolutepath = os.path.dirname(os.path.abspath(__file__))

class ExplorerPipeline():    
    def __init__(self):
        self.__stopped = False
        self.__pipeline = Pipeline(input_stream=VideoFileStream(os.path.join(absolutepath, "video.mp4")),
                                   universal_rest_api=True,
                                   rest_api_host="0.0.0.0",
                                   rest_api_port=8080,
                                   rest_api_base_path="/")
        self.__output_stream = LiveFeedStream(host="0.0.0.0", port=3456, path="/live_feed")
        self.__pipeline.add_output_stream("live_feed", self.__output_stream_callback, self.__output_stream)

        self.__summary = {
            "inScene": 0,
            "visitors": 0,
            "faceMasks": 0,
            "qrCodes": 0
        }

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

    def __reset_summary(self):
        self.__summary = {
            "inScene": 0,
            "visitors": 0,
            "faceMasks": 0,
            "qrCodes": 0
        }

    def __on_new_person_entered_scene(self, event_data):
        self.__summary["visitors"] += 1

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
        # TODO: Move this logic to pulse_completion_callback
        self.__summary["inScene"] = pom.get_perceptor(self.__people_perceptor_name).peopleCount()
        return input_data.data.copy()

    # Passthrough callback
    def __perceptor_input_callback(self, input_data, pom, config):
        return input_data.data.copy()

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

    def get_latest_output_frame(self):
        return self.__output_stream.get_latest_frame()
    
    def get_summary(self):
        return self.__summary

if __name__ == "__main__":
    explorer = ExplorerPipeline()
    explorer.run()