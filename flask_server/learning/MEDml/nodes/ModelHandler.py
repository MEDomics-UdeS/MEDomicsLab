import copy

import pandas as pd
import numpy as np
import json
from learning.MEDml.nodes.NodeObj import Node
from typing import Any, Dict, List, Union
from termcolor import colored
from colorama import Fore
from learning.MEDml.nodes.NodeObj import Node
from typing import Union
from colorama import Fore

DATAFRAME_LIKE = Union[dict, list, tuple, np.ndarray, pd.DataFrame]
TARGET_LIKE = Union[int, str, list, tuple, np.ndarray, pd.Series]


class ModelHandler(Node):

    def __init__(self, id_: int, global_config_json: json) -> None:
        super().__init__(id_, global_config_json)
        if self.type == 'create_model':
            self.model_id = self.config_json['associated_model_id']
            model_obj = self.global_config_json['nodes'][self.model_id]
            self.config_json['data']['estimator'] = {
                "type": model_obj['data']['internal']['selection'],
                "settings": model_obj['data']['internal']['settings']
            }

    def get_final_code(self) -> str:
        return self._code

    def _execute(self, experiment: dict = None, **kwargs) -> json:
        print()
        print(Fore.BLUE + "=== fit === " + Fore.YELLOW + f"({self.username})" + Fore.RESET)
        print(Fore.CYAN + f"Using {self.type}" + Fore.RESET)

        trained_models = None
        trained_models_json = {}
        settings = copy.deepcopy(self.settings)
        if self.type == 'compare_models':
            models = experiment['pycaret_exp'].compare_models(**settings)
            if isinstance(models, list):
                trained_models = models
            else:
                trained_models = [models]
        elif self.type == 'create_model':
            settings.update(self.config_json['data']['estimator']['settings'])
            settings.update({'estimator': self.config_json['data']['estimator']['type']})
            trained_models = [experiment['pycaret_exp'].create_model(**settings)]
        trained_models_copy = trained_models.copy()
        self._info_for_next_node = {'models': trained_models}
        for model in trained_models_copy:
            model_copy = copy.deepcopy(model)
            trained_models_json[model_copy.__class__.__name__] = model_copy.__dict__
            for key, value in model_copy.__dict__.items():
                if isinstance(value, np.ndarray):
                    trained_models_json[model_copy.__class__.__name__][key] = value.tolist()
        return trained_models_json

    def set_model(self, model_id: str) -> None:
        # self.model_id = model_id
        model_obj = self.global_config_json['nodes'][model_id]
        self.config_json['data']['estimator'] = {
            "type": model_obj['data']['selection'],
            "settings": model_obj['data']['settings']
        }
