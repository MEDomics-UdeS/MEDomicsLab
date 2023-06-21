import random
import os
import sys
import copy
import pandas as pd
from itertools import chain, combinations
import csv
import os
import numpy as np
# from pycaret.survival_analysis.oop import SurvivalAnalysisExperiment
from pycaret.classification import ClassificationExperiment
from pycaret.regression import RegressionExperiment
import json

# from MEDml.utils.loading import Loader
from MEDml.nodes.NodeObj import Node
from typing import Any, Callable, Dict, List, Optional, Tuple, Union
from termcolor import colored
from explainerdashboard import ClassifierExplainer, RegressionExplainer, ExplainerDashboard


DATAFRAME_LIKE = Union[dict, list, tuple, np.ndarray, pd.DataFrame]
TARGET_LIKE = Union[int, str, list, tuple, np.ndarray, pd.Series]


class Analyse(Node):

    def __init__(self, id_: int, global_config_json: json) -> None:
        super().__init__(id_, global_config_json)

    def get_final_code(self) -> str:
        return self._code

    def _execute(self,  experiment: dict = None, **kwargs) -> json:
        print()
        print(colored("=== analysing ===", 'blue'))
        selection = self.config_json['data']['selection']
        print(colored(f"method : {selection}", 'cyan'))
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
                new_path = os.path.join("static/tmp/", f'{self.global_config_json["unique_id"]}-{model.__class__.__name__}.png')
                self.global_config_json["unique_id"] += 1
                if os.path.isfile(new_path):
                    os.remove(new_path)
                os.rename(path, new_path)
                plot_paths[model.__class__.__name__] = new_path
        return plot_paths

