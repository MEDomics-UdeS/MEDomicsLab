import pandas as pd
import copy
import numpy as np
import json

from sklearn.pipeline import Pipeline

from .NodeObj import Node, format_model
from typing import Union
from colorama import Fore
from med_libs.server_utils import go_print

DATAFRAME_LIKE = Union[dict, list, tuple, np.ndarray, pd.DataFrame]
TARGET_LIKE = Union[int, str, list, tuple, np.ndarray, pd.Series]


class GroupModels(Node):
    """
    This class represents the GroupModels node.
    """

    def __init__(self, id_: int, global_config_json: json) -> None:
        """
        Args:
            id_ (int): The id of the node.
            global_config_json (json): The global config json.
        """
        super().__init__(id_, global_config_json)
        self.config_json['instance'] = 0
        # print(f"GroupModels: {json.dumps(self.global_config_json, indent=4)}")
        self.models_list = sorted(self.config_json['associated_id'].split('.'))
        self.config_json['cur_models_list_id'] = []
        self.config_json['cur_models_list_obj'] = []
        print(f"GroupModels: {self.models_list}")
        print(f"{self.config_json['cur_models_list_id']}")

    def _execute(self, experiment: dict = None, **kwargs) -> json:
        """
        This function is used to execute the node.
        """
        self.config_json['instance'] += 1
        self.config_json['cur_models_list_id'] += [kwargs['id'].split('*')[0]]
        print()
        print(Fore.BLUE + "=== GroupModels === " + Fore.YELLOW + f"({self.username})" + Fore.RESET)
        print(self.config_json['instance'])
        trained_models = kwargs['models']
        trained_models_json = {}

        for model in kwargs['models']:
            model = format_model(model)
            print(Fore.CYAN + f"Grouping: {model.__class__.__name__}" + Fore.RESET)

        trained_models_copy = trained_models.copy()
        self.config_json['cur_models_list_obj'] += trained_models_copy
        self._info_for_next_node = {'models': self.config_json['cur_models_list_obj'], 'id': self.id}
        isLast = sorted(self.config_json['cur_models_list_id']) == self.models_list or len(self.config_json['cur_models_list_id']) > len(self.models_list)
        return {"prev_node_complete": isLast}
