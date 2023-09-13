import pandas as pd
import numpy as np
# from pycaret.survival_analysis.oop import SurvivalAnalysisExperiment
import json
from learning.MEDml.nodes.NodeObj import *
from typing import Any, Dict, List, Union
from colorama import Fore, Back, Style
from learning.MEDml.nodes.NodeObj import *
from typing import Union
from colorama import Fore


DATAFRAME_LIKE = Union[dict, list, tuple, np.ndarray, pd.DataFrame]
TARGET_LIKE = Union[int, str, list, tuple, np.ndarray, pd.Series]


class Clean(Node):

    def __init__(self, id_: int, global_config_json: json) -> None:
        super().__init__(id_, global_config_json)
        self.df = None

    def get_final_code(self) -> str:
        return self._code

    def _execute(self, experiment: dict = None, **options) -> json:
        print()
        print(Fore.BLUE + "=== cleaning === " + Fore.YELLOW + f"({self.username})" + Fore.RESET)
        ml_obj = experiment['pycaret_exp'].setup(
            data=experiment['dataset_metaData']['dataset'],
            target=options['target'],
            log_experiment=experiment['medml_logger'],
            log_plots=True,
            log_data=True,
            **self.settings
        )
        experiment['dataset_metaData']['dataset'] = ml_obj.get_config('X').join(ml_obj.get_config('y'))
        experiment['dataset_metaData']['X_test'] = ml_obj.get_config('X_test')
        experiment['dataset_metaData']['y_test'] = ml_obj.get_config('y_test')
        return experiment['dataset_metaData']['dataset'].to_json(orient='records')
