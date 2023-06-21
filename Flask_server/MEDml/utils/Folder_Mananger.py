
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


class FolderManager:

    def __init__(self) -> None:
        self.temp_folder_path = '/temp/'

    def get_json(self, path: str) -> json:
        with open(path, 'r') as f:
            return json.load(f)

    def get_json_from_df(self, df: pd.DataFrame) -> json:
        return df.to_json(orient='records')

    def get_df_from_json(self, json: json) -> pd.DataFrame:
        return pd.read_json(json, orient='records')

    def get_df_from_csv(self, path: str) -> pd.DataFrame:
        return pd.read_csv(path, sep=',', encoding='utf-8')

    def get_csv_from_df(self, df: pd.DataFrame, path: str) -> None:
        df.to_csv(path, index=False, encoding='utf-8')

    def get_df_from_csv_in_folder(self, folder_name: str) -> List[pd.DataFrame]:
        loader = Loader("Loading all csv...", "Finished!").start()
        dfs = []
        for file_name in os.listdir(folder_name):
            f = os.path.join(folder_name, file_name)
            if f.endswith(".csv"):
                dfs.append(pd.read_csv(f, sep=',', encoding='utf-8'))
        loader.stop()
        return dfs

    def get_csv_from_df_in_folder(self, dfs: List[pd.DataFrame], folder_name: str) -> None:
        loader = Loader("Saving all csv...", "Finished!").start()
        for i, df in enumerate(dfs):
            df.to_csv(folder_name + str(i) + '.csv', index=False, encoding='utf-8')
        loader.stop()

    def get_df_from_json_in_folder(self, folder_name: str) -> List[pd.DataFrame]:
        loader = Loader("Loading all json...", "Finished!").start()
        dfs = []
        for file_name in os.listdir(folder_name):
            f = os.path.join(folder_name, file_name)
            if f.endswith(".json"):
                dfs.append(pd.read_json(f, orient='records'))
        loader.stop()
        return dfs

    def save_workspace(self, path: str):
        pass # TODO
