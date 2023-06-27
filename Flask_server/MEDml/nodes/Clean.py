import pandas as pd
from itertools import chain, combinations
import csv
import os
import numpy as np
# from pycaret.survival_analysis.oop import SurvivalAnalysisExperiment
from pycaret.classification import ClassificationExperiment
from pycaret.regression import RegressionExperiment
import json
from MEDml.utils.loading import Loader
from MEDml.nodes.NodeObj import *
from typing import Any, Callable, Dict, List, Optional, Tuple, Union
from termcolor import colored


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
        print(colored("=== cleaning ===", 'blue'))
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