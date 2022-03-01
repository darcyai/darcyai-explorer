from typing import List

from darcyai.serializable import Serializable
from .qrcode import QRCode

class QRCodeDetectionModel(Serializable):
    def __init__(self, qrcodes:List[QRCode]):
        self.__qrcodes = qrcodes

    def get_qrcodes(self) -> List[QRCode]:
        """
        Returns the list of detected qrcodes
        """
        return self.__qrcodes
    
    def serialize(self):
        return { "qrcodes": [qrcode.serialize() for qrcode in self.__qrcodes] }

