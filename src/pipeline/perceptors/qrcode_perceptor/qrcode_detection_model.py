from typing import List

from .qrcode import QRCode

class QRCodeDetectionModel:
    def __init__(self, qrcodes:List[QRCode]):
        self.__qrcodes = qrcodes

    def get_qrcodes(self) -> List[QRCode]:
        """
        Returns the list of detected qrcodes
        """
        return self.__qrcodes
