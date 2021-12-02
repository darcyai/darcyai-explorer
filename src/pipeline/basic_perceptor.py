import time
from random import random

from darcyai_engine.perceptor.perceptor import Perceptor
from darcyai_engine.config import Config
from darcyai_engine.serializable import Serializable


class BasicPOM(Serializable):
    def __init__(self, value):
        super().__init__()

        self.__value = value

    def serialize(self):
        return {"value": self.__value}


class BasicPerceptor(Perceptor):
    def __init__(self, sleep=0.05):
        super().__init__(model_path="")

        self.config_schema = [
            Config("int_config", "int", 666, "Integer Config"),
            Config("str_config", "str", "Something", "String Config"),
            Config("bool_config", "bool", True, "Boolean Config"),
        ]

        self.event_names = [
            "event_1",
        ]

        self.__counter = 0
        if sleep is not None:
            self.__sleep = sleep
        else:
            self.__sleep = int(random() * 4) + 1

    def run(self, input_data, config):
        time.sleep(self.__sleep)
        self.__counter += 1

        result = "Hello World #{}".format(self.__counter)

        self.emit("event_1", result)

        return BasicPOM(result)

    def load(self, accelerator_idx=None):
        super().set_loaded(True)