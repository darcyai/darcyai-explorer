from darcyai_engine.serializable import Serializable

class QRCode(Serializable):
    def __init__(self, qrcode_data, bbox):
        self.__qrcode_data = qrcode_data

        self.__x0 = bbox.xmin
        self.__y0 = bbox.ymin
        self.__x1 = bbox.xmax
        self.__y1 = bbox.ymax

    def get_qrcode_data(self):
        return self.__qrcode_data

    def get_bbox(self):
        return ((self.__x0, self.__y0), (self.__x1, self.__y1))
    
    def serialize(self):
        return {
            "data": self.__qrcode_data,
            "bbox": ((self.__x0, self.__y0), (self.__x1, self.__y1))
        }
