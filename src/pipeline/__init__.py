from darcyai_engine.pipeline import Pipeline
from darcyai_engine.input.video_file_stream import VideoFileStream
from darcyai_engine.output.live_feed_stream import LiveFeedStream
from .basic_perceptor import BasicPerceptor
import os

absolutepath = os.path.dirname(os.path.abspath(__file__))
video_path = os.path.join(absolutepath, 'video.mp4')

class ExplorerPipeline():    
    def __init__(self, app, event_cb):
        video_file = VideoFileStream(file_name=video_path)
        self.__pipeline = Pipeline(input_stream=video_file,
                                   universal_rest_api=True,
                                   rest_api_flask_app=app,
                                   rest_api_base_path="/pipeline")
        # self.__pipeline = Pipeline(input_stream=video_file,
        #                            universal_rest_api=True,
        #                            rest_api_host="0.0.0.0",
        #                            rest_api_port=8080,
        #                            rest_api_base_path="/")
        live_feed = LiveFeedStream(flask_app=app, path="/live_feed")
        # live_feed = LiveFeedStream(host="0.0.0.0", port=3456, path="/")
        self.__pipeline.add_output_stream("live_feed", self.__output_stream_callback, live_feed)
        basic_perceptor = BasicPerceptor()
        self.__pipeline.add_perceptor("basic", basic_perceptor, accelerator_idx=0, input_callback=self.__perceptor_input_callback)
        basic_perceptor.on("event_1", event_cb("event_1"))

    def run(self):
        self.__pipeline.run()

    def __output_stream_callback(self, pom, input_data):
        return input_data.data.copy()

    def __perceptor_input_callback(self, input_data, pom, config):
        return input_data

    def get_pom(self):
        return self.__pipeline.get_pom()

    def get_latest_input(self):
        return self.__pipeline.get_latest_input()

    def get_current_pulse_number(self):
        return self.__pipeline.get_current_pulse_number()

    def get_historical_input(self, pulse_number):
        return self.__pipeline.get_historical_input(pulse_number)

    def get_historical_pom(self, pulse_number):
        return self.__pipeline.get_historical_pom(pulse_number)

if __name__ == "__main__":
    explorer = ExplorerPipeline()
    explorer.run()