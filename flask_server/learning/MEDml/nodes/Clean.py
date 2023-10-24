import pandas as pd
import numpy as np
import os
import json
from typing import Union
from learning.MEDml.nodes.NodeObj import *
from typing import Union
from colorama import Fore
from learning.MEDml.CodeHandler import convert_dict_to_params


DATAFRAME_LIKE = Union[dict, list, tuple, np.ndarray, pd.DataFrame]
TARGET_LIKE = Union[int, str, list, tuple, np.ndarray, pd.Series]


class Clean(Node):
    """
    This class represents the Clean node.
    """

    def __init__(self, id_: int, global_config_json: json) -> None:
        """
        Args:
            id_ (int): The id of the node.
            global_config_json (json): The global config json. 
        """
        super().__init__(id_, global_config_json)
        self.df = None

    def _execute(self, experiment: dict = None, **kwargs) -> json:
        """
        This function is used to execute the node.
        """
        print()
        print(Fore.BLUE + "=== cleaning === " +
              Fore.YELLOW + f"({self.username})" + Fore.RESET)
        ml_obj = experiment['pycaret_exp'].setup(
            data=kwargs['dataset'],
            target=kwargs['target'],
            log_experiment=experiment['medml_logger'],
            log_plots=True,
            log_data=True,
            **self.settings
        )
        self.CodeHandler.add_line(
            "code", f"ml_obj = pycaret_exp.setup(data=dataset, target='{kwargs['target']}', {self.CodeHandler.convert_dict_to_params(self.settings)})")
        self.CodeHandler.add_line(
            "code", f"dataset = ml_obj.get_config('X').join(ml_obj.get_config('y'))")
        return {
            "table": "dataset",
            "paths": ["path"],
        }
