from darcyai_engine.pipeline import Pipeline
from darcyai_engine.input.video_file_stream import VideoFileStream
from darcyai_engine.output.live_feed_stream import LiveFeedStream
from darcyai_engine.tests.perceptor_mock import PerceptorMock

class ExplorerPipeline():    
    def __init__(self, send_frame_callback):
        video_file = VideoFileStream(file_name="video.mp4")
        self.__pipeline = Pipeline(input_stream=video_file,
                                   universal_rest_api=True,
                                   rest_api_base_path="",
                                   rest_api_host="0.0.0.0",
                                   rest_api_port=8080)
        live_feed = LiveFeedStream(port=3456, host="0.0.0.0", path="/")
        self.__pipeline.add_output_stream("live_feed", send_frame_callback, live_feed)
        mock_perceptor = PerceptorMock(model_path="models/p1.tflite", sleep=0.1)
        self.__pipeline.add_perceptor("mock", mock_perceptor, accelerator_idx=0, input_callback=self.__perceptor_input_callback)

    def run(self):
        self.__pipeline.run()

    def __perceptor_input_callback(self, input_data, pom, config):
        return input_data

    def get_latest_pom(self):
        return self.__pipeline.get_pom()

if __name__ == "__main__":
    explorer = ExplorerPipeline()
    explorer.run()