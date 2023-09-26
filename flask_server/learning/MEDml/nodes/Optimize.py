
import pandas as pd
import copy
import numpy as np
import json
from learning.MEDml.nodes.NodeObj import Node
from typing import Any, Dict, List, Union
from termcolor import colored
from colorama import Fore, Back, Style
from learning.MEDml.nodes.NodeObj import Node
from typing import Union
from colorama import Fore
from learning.MEDml.CodeHandler import convert_dict_to_params

DATAFRAME_LIKE = Union[dict, list, tuple, np.ndarray, pd.DataFrame]
TARGET_LIKE = Union[int, str, list, tuple, np.ndarray, pd.Series]


class Optimize(Node):

    def __init__(self, id_: int, global_config_json: json) -> None:
        super().__init__(id_, global_config_json)

    def _execute(self, experiment: dict = None, **kwargs) -> json:
        print()
        print(Fore.BLUE + "=== optimizing === " + Fore.YELLOW + f"({self.username})" + Fore.RESET)
        settings = copy.deepcopy(self.settings)
        trained_models = []
        trained_models_json = {}
        for model in kwargs['models']:
            print(Fore.CYAN + f"optimizing: {model.__class__.__name__}" + Fore.RESET)
            trained_models.append(getattr(experiment['pycaret_exp'], self.type)(model, **settings))
        trained_models_copy = trained_models.copy()
        self._info_for_next_node = {'models': trained_models}
        for model in trained_models_copy:
            model_copy = copy.deepcopy(model)
            trained_models_json[model_copy.__class__.__name__] = model_copy.__dict__
            for key, value in model_copy.__dict__.items():
                if isinstance(value, np.ndarray):
                    trained_models_json[model_copy.__class__.__name__][key] = value.tolist()
        return trained_models_json
