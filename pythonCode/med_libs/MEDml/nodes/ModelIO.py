import copy
import pandas as pd
import os
import numpy as np
import json
import uuid
from .NodeObj import Node, format_model
from typing import Union
from colorama import Fore
import sys
import os
from pathlib import Path
sys.path.append(str(Path(os.path.dirname(os.path.abspath(__file__))).parent.parent))
from MEDDataObject import MEDDataObject
from mongodb_utils import insert_med_data_object_if_not_exists


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
        #self.CustZipFileModel = CustomZipFile(self.model_extension)

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
            self.CodeHandler.add_line(
                "code", f"for model in trained_models:")
            for model in kwargs['models']:
                model = format_model(model)
                if 'model_name' not in settings.keys():
                    # .medmodel object
                    model_med_object = MEDDataObject(id = str(uuid.uuid4()),
                    name = model.__class__.__name__ + ".medmodel",
                    type = "medmodel",
                    parentID = self.global_config_json['identifiers']['models'],
                    childrenIDs = [],
                    inWorkspace = False)
                    model_med_object_id = insert_med_data_object_if_not_exists(model_med_object, None)

                    settings_copy = copy.deepcopy(settings)
                    settings_copy['model_name'] = model_med_object.name
                    getattr(experiment['pycaret_exp'],
                            self.type)(model, **settings_copy)
                    self.CodeHandler.add_line(
                        "code", f"pycaret_exp.save_model(model, {self.CodeHandler.convert_dict_to_params(settings_copy)})", 1)
                    
                    # .medmodel metadata
                    metadata_med_object = MEDDataObject(id=str(uuid.uuid4()),
                    name = "metadata.json",
                    type = "json",
                    parentID = model_med_object_id,
                    childrenIDs = [],
                    inWorkspace = False)

                    to_write = {"columns": self.global_config_json["columns"],
                                    "target": self.global_config_json["target_column"],
                                    "steps": self.global_config_json["steps"],
                                    "ml_type": self.global_config_json["MLType"]
                                    }
                    if 'selectedTags' in self.global_config_json:
                        to_write['selectedTags'] = self.global_config_json['selectedTags']
                    if 'selectedVariables' in self.global_config_json:
                        to_write['selectedVariables'] = self.global_config_json['selectedVariables']

                    insert_med_data_object_if_not_exists(metadata_med_object, [to_write])
                    return_val[model.__class__.__name__] = metadata_med_object.id

        elif self.type == 'load_model':
           """  original_path = settings['model_to_load']['path']
            print('original_path:', original_path)

            def load_model_from_zip(path):
                models_path = os.path.join(path, "model")
                settings_copy = copy.deepcopy(settings)
                settings_copy['model_name'] = models_path
                del settings_copy['model_to_load']
                trained_model: Pipeline = experiment['pycaret_exp'].load_model(
                    **settings_copy)
                self.CodeHandler.add_line(
                    "code", f"pycaret_exp.load_model({self.CodeHandler.convert_dict_to_params(settings_copy)})")
                self._info_for_next_node = {'models': [trained_model]}
                print('trained_model:', trained_model)

            self.CustZipFileModel.read_in_zip(
                original_path, load_model_from_zip) """

        return return_val
