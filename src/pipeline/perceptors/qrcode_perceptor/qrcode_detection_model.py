import cv2
from typing import List

from darcyai.config import Config
from darcyai.serializable import Serializable
from .qrcode import QRCode

class QRCodeDetectionModel(Serializable):
    def __init__(self, qrcodes:List[QRCode], rectangle_color=(0, 255, 0)):
        self.__qrcodes = qrcodes
        self.__rectangle_color = rectangle_color

    def get_qrcodes(self) -> List[QRCode]:
        """
        Returns the list of detected qrcodes
        """
        return self.__qrcodes
    
    def serialize(self):
        return { "qrcodes": [qrcode.serialize() for qrcode in self.__qrcodes] }

    def draw_rectangles(self, image):
        """
        Draws rectangles around detected qrcodes on the given frame.

        # Arguments:
            image (np.Array): The image to draw the rectangles on.
        
        # Returns:
            np.Array: The image with the rectangles drawn on it.
        """
        frame = image.copy()
        for qrcode in self.__qrcodes:
            bbox = qrcode.get_bbox()
            frame = cv2.rectangle(frame, bbox[0], bbox[1], self.__rectangle_color, 2)

        return frame