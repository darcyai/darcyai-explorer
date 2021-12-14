from darcyai_engine.serializable import Serializable

class FaceMaskDetectionModel(Serializable):
    def __init__(self, has_mask:bool, person_id: str):
        self.__has_mask = has_mask
        self.__person_id = person_id


    def has_mask(self):
        """
        Returns:
            bool: True if the face has a mask, False otherwise.
        """
        return self.__has_mask

    def get_person_id(self):
        """
        Returns:
            str: person_id.
        """
        return self.__person_id
    
    def serialize(self):
        return {
            "hasMask": self.__has_mask,
            "personID": self.__person_id
        }
