import cv2
import os
import pathlib
from pyzbar import pyzbar
from typing import Any, List

from darcyai_coral.object_detection_perceptor import ObjectDetectionPerceptor
from darcyai_engine.config import Config
from darcyai_engine.config_registry import ConfigRegistry
from .qrcode_detection_model import QRCodeDetectionModel
from .qrcode import QRCode


class QRCodePerceptor(ObjectDetectionPerceptor):
    """
    QRCodePerceptor is a subclass of ObjectDetectionPerceptor.
    """
    def __init__(self):
        script_dir = pathlib.Path(__file__).parent.absolute()
        model_file = os.path.join(script_dir, "qrcode.tflite")

        super().__init__(model_path=model_file,
                         threshold=0)

        self.config_schema = [
            Config("threshold", "float", 0.85, "Threshold"),
        ]

    def run(self, input_data:Any, config:ConfigRegistry=None) -> QRCodeDetectionModel:
        perception_result, _ = super().run(input_data=input_data, config=config)

        filtered_results = list(filter(lambda x: x.score > self.get_config_value("threshold"), perception_result))

        if len(filtered_results) == 0:
            return QRCodeDetectionModel([])

        frame_height = input_data.shape[0]
        frame_width = input_data.shape[1]

        qrcodes = []
        for qrcode in filtered_results:
            factor = 0.01
            x0 = max(int(qrcode.bbox.xmin * (1 - factor)), 0)
            y0 = max(int(qrcode.bbox.ymin * (1 - factor)), 0)
            x1 = min(int(qrcode.bbox.xmax * (1 + factor)), frame_width)
            y1 = min(int(qrcode.bbox.ymax * (1 + factor)), frame_height)

            qrcode_frame = input_data[y0:y1, x0:x1]
            color_cvt = cv2.cvtColor(qrcode_frame, cv2.COLOR_RGB2BGR)
            barcodes = pyzbar.decode(qrcode_frame)

            if len(barcodes) == 0:
                continue

            for barcode in barcodes:
                if barcode.type != 'QRCODE':
                    continue

                qrcode_data = barcode.data.decode("utf-8")

                qrcodes.append(QRCode(qrcode_data, qrcode.bbox))

        return QRCodeDetectionModel(qrcodes)
