import cv2
import os
import pathlib

from darcyai_coral.people_perceptor import PeoplePerceptor
from darcyai_engine.input.camera_stream import CameraStream
from darcyai_engine.output.live_feed_stream import LiveFeedStream
from darcyai_engine.pipeline import Pipeline

class ExplorerPipeline():
    def __init__(self) -> None:
        #Instantiate an Camera Stream input stream object
        self.input_stream = CameraStream(video_device="/dev/video0", fps=20)

        #Instantiate the Pipeline object and pass it the Camera Stream object as its input stream source
        self.pipeline = Pipeline(
            input_stream=self.input_stream, 
            universal_rest_api=True,
            rest_api_base_path="/",
            rest_api_host="0.0.0.0",
            rest_api_port=8080
        )

        #Create a Live Feed output stream object and specify some URL parameters
        self.output_stream = LiveFeedStream(path="/", port=3456, host="0.0.0.0")
    
    def run(self) -> None:
        #Create a callback function for handling the Live Feed output stream data before it gets presented
        def live_feed_callback(pom, input_data):
            #Start wth the annotated video frame available from the People Perceptor
            frame = pom.peeps.annotatedFrame().copy()

            #Add some text telling how many people are in the scene
            label = "{} peeps".format(pom.peeps.peopleCount())
            color = (0, 255, 0)
            cv2.putText(frame, str(label), (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 1, color, 1, cv2.LINE_AA)

            #If we have anyone, demonstrate looking up that person in the POM by getting their face size
            #And then put it on the frame as some text
            #NOTE: this will just take the face size from the last person in the array
            if pom.peeps.peopleCount() > 0:
                for person_id in pom.peeps.people():
                    face_size = pom.peeps.faceSize(person_id)
                    face_height = face_size[1]
                    label2 = "{} face height".format(face_height)
                    color = (0, 255, 255)
                    cv2.putText(frame, str(label2), (10, 80), cv2.FONT_HERSHEY_SIMPLEX, 1, color, 1, cv2.LINE_AA)

            #Pass the finished frame out of this callback so the Live Feed output stream can display it
            return frame
            
        #Add the Live Feed output stream to the Pipeline and use the callback from above as the handler
        self.pipeline.add_output_stream("output", live_feed_callback, self.output_stream)

        #Create a callback function for handling the input that is about to pass to the People Perceptor
        def people_input_callback(input_data, pom, config):
            #Just take the frame from the incoming Input Stream and send it onward - no need to modify the frame
            frame = input_data.data.copy()
            return frame
            
        #Create a callback function for handling the "New Person" event from the People Perceptor
        #Just print the person ID to the console
        def new_person_callback(person_id):
            print("New person: {}".format(person_id))
            
        #Instantiate a People Perceptor
        people_ai = PeoplePerceptor()

        #Subscribe to the "New Person" event from the People Perceptor and use our callback from above as the handler
        people_ai.on("new_person_entered_scene", new_person_callback)

        #Add the People Perceptor instance to the Pipeline and use the input callback from above as the input preparation handler
        self.pipeline.add_perceptor("peeps", people_ai, input_callback=people_input_callback)

        #Update the configuration of the People Perceptor to show the pose landmark dots on the annotated video frame
        self.pipeline.set_perceptor_config("peeps", "show_pose_landmark_dots", True)
        self.pipeline.set_perceptor_config("peeps", "pose_landmark_dot_size", 2)
        self.pipeline.set_perceptor_config("peeps", "pose_landmark_dot_color", "0,255,0")

        #Start the Pipeline
        self.pipeline.run()