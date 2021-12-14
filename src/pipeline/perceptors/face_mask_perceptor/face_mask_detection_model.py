from darcyai_engine.serializable import Serializable

class FaceMaskDetectionModel(Serializable):
    def __init__(self, has_mask:bool):
        self.__has_mask = has_mask


    def has_mask(self):
        """
        Returns:
            bool: True if the face has a mask, False otherwise.
        """
        return self.__has_mask
    
    def serialize(self):
        return {
            "hasMask": self.__has_mask
        }
