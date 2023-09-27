import pandas as pd
import numpy as np
import os
import json
from learning.MEDml.nodes.NodeObj import *
from typing import Any, Dict, List, Union
from learning.MEDml.nodes.NodeObj import *
from typing import Union
from colorama import Fore
from learning.MEDml.CodeHandler import convert_dict_to_params


DATAFRAME_LIKE = Union[dict, list, tuple, np.ndarray, pd.DataFrame]
TARGET_LIKE = Union[int, str, list, tuple, np.ndarray, pd.Series]


class Clean(Node):

    def __init__(self, id_: int, global_config_json: json) -> None:
        super().__init__(id_, global_config_json)
        self.df = None

    def _execute(self, experiment: dict = None, **options) -> json:
        print()
        print(Fore.BLUE + "=== cleaning === " +
              Fore.YELLOW + f"({self.username})" + Fore.RESET)
        ml_obj = experiment['pycaret_exp'].setup(
            data=experiment['dataset_metaData']['dataset'],
            target=options['target'],
            log_experiment=experiment['medml_logger'],
            log_plots=True,
            log_data=True,
            **self.settings
        )
        self.CodeHandler.add_line(
            "code", f"ml_obj = pycaret_exp.setup(data=dataset, target='{options['target']}', {convert_dict_to_params(self.settings)})")
        self.CodeHandler.add_line(
            "code", f"dataset = ml_obj.get_config('X').join(ml_obj.get_config('y'))")
        experiment['dataset_metaData']['dataset'] = ml_obj.get_config(
            'X').join(ml_obj.get_config('y'))
        experiment['dataset_metaData']['X_test'] = ml_obj.get_config('X_test')
        experiment['dataset_metaData']['y_test'] = ml_obj.get_config('y_test')
        # save json object to file
        path = os.path.join(
            "./", self.global_config_json['tmp_path'], f"{self.global_config_json['unique_id']}-dataset.json")
        experiment['dataset_metaData']['dataset'].to_csv(path)
        return {
            "table": "dataset",
            "paths": [path],
        }
