import os
import pathlib
from typing import Any, List

from darcyai.perceptor.image_classification_perceptor import ImageClassificationPerceptor
from darcyai.perceptor.processor import Processor
from darcyai.config import Config
from darcyai.config_registry import ConfigRegistry
from .face_mask_detection_model import FaceMaskDetectionModel

import json


RAW_MASK_EVENT = "raw_mask_event"
NO_MASK_EVENT = "no_mask"

class FaceMaskPerceptor(ImageClassificationPerceptor):
    """
    This class is a subclass of ImageClassificationPerceptor.
    It is used to detect face mask in an image.
    """

    def __init__(self):
        script_dir = pathlib.Path(__file__).parent.absolute()
        coral_model_file = os.path.join(script_dir, "face_mask_detection_coral.tflite")
        cpu_model_file = os.path.join(script_dir, "face_mask_detection_cpu.tflite")

        labels = {
            0: "No Mask",
            1: "Mask",
        }

        super().__init__(processor_preference={
                             Processor.CORAL_EDGE_TPU: {
                                 "model_path": coral_model_file,
                                 "labels": labels,
                             },
                             Processor.CPU: {
                                 "model_path": cpu_model_file,
                                 "labels": labels,
                             },
                         },
                         threshold=0,
                         top_k=2)

        self.set_event_names([RAW_MASK_EVENT, NO_MASK_EVENT])
        
        self.set_config_schema([
            Config("threshold", "Confidence percentage threshold for mask detection.", "float", 85, "Percentage of confidence from the AI model above which the face mask is considered detected."),
        ])


    def run(self, input_data:Any, config:ConfigRegistry=None) -> FaceMaskDetectionModel:
        """
        This function is used to run the face mask detection.

        Arguments:
            input_data (Any): The input data.
            config (ConfigRegistry): The configuration.

        Returns:
            FaceMaskDetectionModel: The face mask detection model.
        """
        input = input_data['input']
        person_id = input_data['person_id']
        perception_result = super().run(input_data=input, config=config)

        has_mask = False
        if len(perception_result) > 0:
            try:
                idx = [i for i, x in enumerate(perception_result) if x.name == 'Mask']
                if len(idx) > 0:
                    threshold = self.get_config_value("threshold") / 100
                    has_mask = bool(perception_result[idx[0]].confidence >= threshold)
            except:
                has_mask = False

        if has_mask:
            self.emit(RAW_MASK_EVENT, person_id)
        else:
            self.emit(NO_MASK_EVENT, person_id)

        return FaceMaskDetectionModel(has_mask, person_id)
