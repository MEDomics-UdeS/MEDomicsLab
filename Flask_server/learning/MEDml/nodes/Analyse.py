import os
import copy
import pandas as pd
import os
import numpy as np
import json
from learning.MEDml.nodes.NodeObj import Node
from typing import Any, Dict, List, Union
from termcolor import colored
from explainerdashboard import ClassifierExplainer, RegressionExplainer, ExplainerDashboard
from learning.MEDml.nodes.NodeObj import Node
from colorama import Fore


DATAFRAME_LIKE = Union[dict, list, tuple, np.ndarray, pd.DataFrame]
TARGET_LIKE = Union[int, str, list, tuple, np.ndarray, pd.Series]


class Analyse(Node):

    def __init__(self, id_: int, global_config_json: json) -> None:
        super().__init__(id_, global_config_json)

    def get_final_code(self) -> str:
        return self._code

    def _execute(self,  experiment: dict = None, **kwargs) -> json:
        print()
        print(Fore.BLUE + "=== Analysing === " + Fore.YELLOW + f"({self.username})" + Fore.RESET)
        selection = self.config_json['data']['internal']['selection']
        print(Fore.CYAN + f"Using {selection}" + Fore.RESET)
        settings = copy.deepcopy(self.settings)
        plot_paths = {}
        if selection == 'plot_model' or selection == 'interpret_model':
            settings.update({'save': True})
            if selection == 'plot_model':
                settings.update({"plot_kwargs": {}})
        for model in kwargs['models']:
            # explainer = ClassifierExplainer(model, global_variables[pipe_name]['X_test'], global_variables[pipe_name]['y_test'])
            # ExplainerDashboard(explainer, server=self._flask_app, url_base_pathname="/dashboard/")
            return_value = getattr(experiment['pycaret_exp'], selection)(model, **settings)
            if 'save' in settings and settings['save'] and return_value is not None:
                path = return_value
                new_path = os.path.join(self.global_config_json["saving_path"], f'{self.global_config_json["unique_id"]}-{model.__class__.__name__}.png')
                self.global_config_json["unique_id"] += 1
                if os.path.isfile(new_path):
                    os.remove(new_path)
                os.rename(path, new_path)
                plot_paths[model.__class__.__name__] = new_path
        return plot_paths

