import pandas as pd
from abc import ABC, abstractmethod
import numpy as np
import json
from typing import Any, Dict, List, Union
DATAFRAME_LIKE = Union[dict, list, tuple, np.ndarray, pd.DataFrame]
TARGET_LIKE = Union[int, str, list, tuple, np.ndarray, pd.Series]
from colorama import Fore, Back, Style
from termcolor import colored


def str2bool(v: str) -> bool:
    return v.lower() == "true"


def is_float(element: Any) -> bool:
    try:
        float(element)
        return True
    except ValueError:
        return False


class Node(ABC):
    """
    Abstract class for all nodes
    """

    def __init__(self, id_: int, global_config_json: json) -> None:
        """
        Constructor for Node class
        Args:
            id_: the corresponding id of the node
            global_config_json: specifies the configuration of the node (e.g. settings, inputs, outputs)
        """
        print(colored(f"Node {id_} created", "green"))
        self.global_config_json = global_config_json
        self.config_json = global_config_json['nodes'][str(id_)]
        self._code = self.config_json['data']['internal']['code']
        self.settings = self.config_json['data']['internal']['settings']
        self.type = self.config_json['data']['internal']['type']
        self.username = self.config_json['data']['internal']['name']
        self._class = self.config_json['className']
        self.id = id_
        self._has_run = False
        self.just_run = False
        self._info_for_next_node = {}
        for setting, value in self.settings.items():
            if isinstance(value, str):
                if is_float(value):
                    if len(value.split('.')) > 1:
                        self.settings[setting] = float(value)
                    else:
                        self.settings[setting] = int(value)

    def has_run(self):
        """
        Returns whether the node has been executed or not
        Returns:
            True if the node has been executed, False otherwise
        """
        return self._has_run

    def has_changed(self):
        """
        Returns whether the node has been changed or not, if true, the node should be executed just like the following ones
        Returns:
            True if the node has been changed (or "just run" because it has to be re-run if changed), False otherwise
        """
        return self.just_run

    def get_info_for_next_node(self) -> json:
        """
        Returns the information that the node has to pass to the next node
        Returns:
            the information that the node has to pass to the next node
        """
        return self._info_for_next_node

    def execute(self, experiment: dict = None, **kwargs) -> json:
        """
        Executes the node (at the Parent level, it just sets the "just_run" flag to True and calls the _execute method)
        Args:
            experiment: dictionary containing the experiment information
            **kwargs: dictionary containing the information that the node receives from the previous node

        Returns:
            result of the execution of the node
        """
        self.just_run = True
        self._has_run = True

        return self._execute(experiment, **kwargs)

    def __eq__(self, other):
        """
        Checks if two nodes are equal (useful when comparing saved pipelines with new run request)\n
        Equality is defined by the id and the configuration of the node
        Args:
            other: an Node object to compare with

        Returns:
            True if the two nodes are equal, False otherwise
        """
        return self.id == other.id and self.config_json == other.config_json

    @abstractmethod
    def get_final_code(self) -> str:
        """
        not implemented yet
        Returns:
            string
        """
        # todo
        pass

    @abstractmethod
    def _execute(self, experiment: dict = None, **kwargs) -> json:
        """
        Abstract method that has to be implemented by the child classes. \n
        It is called by the execute method and it is the one that actually executes the node
        Args:
            experiment: dictionary containing the experiment information
            **kwargs: dictionary containing the information that the node receives from the previous node

        Returns:
            result of the execution of the node
        """
        pass

