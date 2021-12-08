from darcyai_engine.pipeline import Pipeline
from darcyai_engine.input.video_file_stream import VideoFileStream
from darcyai_engine.input.camera_stream import CameraStream
from darcyai_engine.output.live_feed_stream import LiveFeedStream
from .basic_perceptor import BasicPerceptor
import os
import time
import platform


absolutepath = os.path.dirname(os.path.abspath(__file__))

def is_mac_osx():
    return platform.system() == "Darwin"

def get_input_stream(input):
    if input["type"] == "video_file":
        return VideoFileStream(os.path.join(absolutepath, input["file"]))
    elif input["type"] == "live_feed":
        return CameraStream(video_device=0 if is_mac_osx() else "/dev/video0")
    else:
        return CameraStream(video_device=0 if is_mac_osx() else "/dev/video0")

class ExplorerPipeline():    
    def __init__(self, app, input, event_cb):
        self.__stopped = False
        self.__pipeline = Pipeline(input_stream=get_input_stream(input),
                                   universal_rest_api=True,
                                   rest_api_flask_app=app,
                                   rest_api_base_path="/pipeline")
        # self.__pipeline = Pipeline(input_stream=video_file,
        #                            universal_rest_api=True,
        #                            rest_api_host="0.0.0.0",
        #                            rest_api_port=8080,
        #                            rest_api_base_path="/")
        self.__output_stream = LiveFeedStream(flask_app=app, path="/live_feed")
        # live_feed = LiveFeedStream(host="0.0.0.0", port=3456, path="/")
        self.__pipeline.add_output_stream("live_feed", self.__output_stream_callback, self.__output_stream)
        basic_perceptor = BasicPerceptor()
        self.__pipeline.add_perceptor("basic", basic_perceptor, accelerator_idx=0, input_callback=self.__perceptor_input_callback)
        basic_perceptor.on("event_1", event_cb("basic", "event_1"))

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
        return input_data.data.copy()

    def change_input(self, input):
        self.__stopped = True
        self.__pipeline.stop()
        self.__pipeline.update_input_stream(get_input_stream(input))
        self.__stopped = False

    def __perceptor_input_callback(self, input_data, pom, config):
        return input_data

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

if __name__ == "__main__":
    explorer = ExplorerPipeline()
    explorer.run()