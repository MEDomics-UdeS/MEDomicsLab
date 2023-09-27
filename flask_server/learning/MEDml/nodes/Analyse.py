import os
import copy
import pandas as pd
import os
import numpy as np
import json
from learning.MEDml.nodes.NodeObj import Node
from typing import Union
from colorama import Fore
from learning.MEDml.CodeHandler import convert_dict_to_params


DATAFRAME_LIKE = Union[dict, list, tuple, np.ndarray, pd.DataFrame]
TARGET_LIKE = Union[int, str, list, tuple, np.ndarray, pd.Series]


class Analyse(Node):
    """
    This class represents the Analyse node.
    """

    def __init__(self, id_: int, global_config_json: json) -> None:
        """
        Args:
            id_ (int): The id of the node.
            global_config_json (json): The global config json.
        """
        super().__init__(id_, global_config_json)

    def _execute(self,  experiment: dict = None, **kwargs) -> json:
        """
        This function is used to execute the node.
        """
        selection = self.config_json['data']['internal']['selection']
        print()
        print(Fore.BLUE + "=== Analysing === " +
              Fore.YELLOW + f"({self.username})" + Fore.RESET)
        print(Fore.CYAN + f"Using {selection}" + Fore.RESET)
        settings = copy.deepcopy(self.settings)
        plot_paths = {}
        if selection == 'plot_model' or selection == 'interpret_model':
            settings.update({'save': True})
            if selection == 'plot_model':
                settings.update({"plot_kwargs": {}})

        self.CodeHandler.add_line("code", f"for model in trained_models:")
        print_settings = copy.deepcopy(settings)
        if 'save' in print_settings:
            del print_settings['save']
        self.CodeHandler.add_line(
            "code", f"pycaret_exp.{selection}(model, {convert_dict_to_params(print_settings)})", 1)
        for model in kwargs['models']:
            return_value = getattr(
                experiment['pycaret_exp'], selection)(model, **settings)
            if 'save' in settings and settings['save'] and return_value is not None:
                path = return_value
                print(path)
                new_path = os.path.join(
                    self.global_config_json["tmp_path"], f'{self.global_config_json["unique_id"]}-{model.__class__.__name__}.png')
                self.global_config_json["unique_id"] += 1
                if os.path.isfile(new_path):
                    os.remove(new_path)
                os.rename(path, new_path)

                plot_paths[model.__class__.__name__] = new_path
        return plot_paths
