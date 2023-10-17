import copy
import pandas as pd
import os
import numpy as np
import json
from learning.MEDml.nodes.NodeObj import Node
from typing import Union
from colorama import Fore
import os
from sklearn.pipeline import Pipeline
from utils.CustomZipFile import CustomZipFile


DATAFRAME_LIKE = Union[dict, list, tuple, np.ndarray, pd.DataFrame]
TARGET_LIKE = Union[int, str, list, tuple, np.ndarray, pd.Series]


class ModelIO(Node):
    """
    This class represents the ModelIO node.
    """

    def __init__(self, id_: int, global_config_json: json) -> None:
        """
        Args:
            id_ (int): The id of the node.
            global_config_json (json): The global config json.
        """
        super().__init__(id_, global_config_json)
        self.model_extension = '.medmodel'
        self.CustZipFile = CustomZipFile(self.model_extension)

    def _execute(self, experiment: dict = None, **kwargs) -> json:
        """
        This function is used to execute the node.
        """
        print()
        print(Fore.BLUE + "=== model io === " + Fore.YELLOW +
              f"({self.username})" + Fore.RESET)
        print(Fore.CYAN + f"Using {self.type}" + Fore.RESET)
        settings = copy.deepcopy(self.settings)
        return_val = {}
        if self.type == 'save_model':
            self.CodeHandler.add_line("code", f"for model in trained_models:", 1)
            for model in kwargs['models']:
                if 'model_name' not in settings.keys():
                    settings['model_name'] = "model"
                new_path = os.path.join(self.global_config_json['paths']['models'],
                    f"{self.global_config_json['unique_id']}-{settings['model_name']}-{model.__class__.__name__}.medmodel")
                self.global_config_json["unique_id"] += 1

                def add_model_to_zip(path):
                    model_path = os.path.join(path, "model")
                    settings['model_name'] = model_path
                    getattr(experiment['pycaret_exp'], self.type)(model, **settings)
                    self.CodeHandler.add_line("code", f"pycaret_exp.save_model(model, {self.CodeHandler.convert_dict_to_params(settings)})", 1)

                self.CustZipFile.create_zip(new_path, add_model_to_zip)

                return_val[model.__class__.__name__] = new_path + self.model_extension

        elif self.type == 'load_model':
            original_path = settings['model_to_load']['path']
            print('original_path:', original_path)

            def load_model_from_zip(path):
                models_path = os.path.join(path, "model")
                settings['model_name'] = models_path
                del settings['model_to_load']
                trained_model: Pipeline = experiment['pycaret_exp'].load_model(**settings)
                self.CodeHandler.add_line("code", f"pycaret_exp.load_model({self.CodeHandler.convert_dict_to_params(settings)})")
                self._info_for_next_node = {'models': [trained_model.named_steps['trained_model']]}

            self.CustZipFile.unzip_actions(original_path, load_model_from_zip)

        return return_val
