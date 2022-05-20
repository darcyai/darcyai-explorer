import os
import pathlib
from pyzbar import pyzbar
from typing import Any

from darcyai.perceptor.object_detection_perceptor import ObjectDetectionPerceptor
from darcyai.perceptor.processor import Processor
from darcyai.config import Config, RGB
from darcyai.config_registry import ConfigRegistry
from .qrcode_detection_model import QRCodeDetectionModel
from .qrcode import QRCode

RAW_QRCODE_EVENT = "raw_qrcode_event"

class QRCodePerceptor(ObjectDetectionPerceptor):
    """
    QRCodePerceptor is a subclass of ObjectDetectionPerceptor.
    """
    def __init__(self):
        script_dir = pathlib.Path(__file__).parent.absolute()
        coral_model_file = os.path.join(script_dir, "qrcode_coral.tflite")
        cpu_model_file = os.path.join(script_dir, "qrcode_cpu.tflite")

        super().__init__(processor_preference={
                             Processor.CORAL_EDGE_TPU: { "model_path": coral_model_file },
                             Processor.CPU: { "model_path": cpu_model_file },
                         },
                         threshold=0,
                         quantized=False)

        self.set_event_names([RAW_QRCODE_EVENT])

        self.set_config_schema([
            Config("threshold", "Confidence percentage threshold for QRCode detection.", "float", 85, "Percentage of confidence from the AI model above which the QRCode is considered detected."),
            Config("color", "Rectangle Color", "rgb", RGB(0,255,0), "Rectangle Color"),
        ])

    def run(self, input_data:Any, config:ConfigRegistry=None) -> QRCodeDetectionModel:
        if input_data is None:
            return QRCodeDetectionModel([], None)

        frame = input_data[0]
        person_uuid = input_data[1]

        perception_result = super().run(input_data=frame, config=config)

        threshold = self.get_config_value("threshold") / 100
        filtered_results = list(filter(lambda x: x.confidence > threshold, perception_result))

        if len(filtered_results) == 0:
            return QRCodeDetectionModel([], None)

        frame_height = frame.shape[0]
        frame_width = frame.shape[1]

        qrcodes = []
        for qrcode in filtered_results:
            factor = 0.03
            x0 = max(int(qrcode.xmin * (1 - factor)), 0)
            y0 = max(int(qrcode.ymin * (1 - factor)), 0)
            x1 = min(int(qrcode.xmax * (1 + factor)), frame_width)
            y1 = min(int(qrcode.ymax * (1 + factor)), frame_height)

            qrcode_frame = frame[y0:y1, x0:x1]
            barcodes = pyzbar.decode(qrcode_frame)

            if len(barcodes) == 0:
                continue

            for barcode in barcodes:
                if barcode.type != 'QRCODE':
                    continue

                qrcode_data = barcode.data.decode("utf-8")
                self.emit(RAW_QRCODE_EVENT, qrcode_data)

                bbox = {
                    "xmin": x0,
                    "ymin": y0,
                    "xmax": x1,
                    "ymax": y1,
                }
                qrcodes.append(QRCode(qrcode_data, bbox))
        color: RGB = self.get_config_value("color")
        return QRCodeDetectionModel(qrcodes=qrcodes, person_uuid=person_uuid, rectangle_color=(color.blue(), color.green(), color.red()))
