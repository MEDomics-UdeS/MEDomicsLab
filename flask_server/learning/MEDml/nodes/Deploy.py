import copy
import pandas as pd
import os
import numpy as np
import json
from learning.MEDml.nodes.NodeObj import Node
from typing import Any, Dict, List, Union
from termcolor import colored
from colorama import Fore, Back, Style
from learning.MEDml.nodes.NodeObj import Node
from typing import Union
from colorama import Fore

DATAFRAME_LIKE = Union[dict, list, tuple, np.ndarray, pd.DataFrame]
TARGET_LIKE = Union[int, str, list, tuple, np.ndarray, pd.Series]


class Deploy(Node):

    def __init__(self, id_: int, global_config_json: json) -> None:
        super().__init__(id_, global_config_json)

    def get_final_code(self) -> str:
        return self._code

    def _execute(self, experiment: dict = None, **kwargs) -> json:
        print()
        print(Fore.BLUE + "=== Deploy === " + Fore.YELLOW + f"({self.username})" + Fore.RESET)
        selection = self.config_json['data']['internal']['selection']
        print(Fore.CYAN + f"Using {selection}" + Fore.RESET)
        settings = copy.deepcopy(self.settings)
        path_folder = ""
        if selection == 'predict_model':
            settings['data'] = pd.read_csv(settings['data'])
        elif selection == 'save_model':
            if 'data' in settings.keys():
                del settings['data']
            if 'folder_path' in settings.keys():
                path_folder = settings['folder_path']
                del settings['folder_path']
        model_paths = {}
        for model in kwargs['models']:
            deploy_res = getattr(experiment['pycaret_exp'], selection)(model, **settings)

            if selection == 'save_model':
                path = deploy_res[1]
                new_path = os.path.join(self.global_config_json['saving_path'], f"{self.global_config_json['unique_id']}-{settings['model_name']}-{model.__class__.__name__}.pkl")
                self.global_config_json["unique_id"] += 1
                if os.path.isfile(new_path):
                    os.remove(new_path)
                os.rename(path, new_path)
                model_paths[model.__class__.__name__] = new_path

        return model_paths
