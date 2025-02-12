import os
import copy
import pandas as pd
import os
import numpy as np
import json
from sklearn.pipeline import Pipeline
from .NodeObj import Node, format_model
from typing import Union
from colorama import Fore
from med_libs.server_utils import go_print

DATAFRAME_LIKE = Union[dict, list, tuple, np.ndarray, pd.DataFrame]
TARGET_LIKE = Union[int, str, list, tuple, np.ndarray, pd.Series]


class Analyze(Node):
    """
    This class represents the Analyze node.
    """

    def __init__(self, id_: int, global_config_json: json) -> None:
        """
        Args:
            id_ (int): The id of the node.
            global_config_json (json): The global config json.
        """
        super().__init__(id_, global_config_json)

    def _execute(self, experiment: dict = None, **kwargs) -> json:
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

        # debbuging
        if 'models' not in kwargs:
            raise ValueError("No models provided to the Analyze node.")
        

        # If 'plot_model', handle plotting logic
        if selection == 'plot_model':
            settings.update({'save': True})
            settings.update({"plot_kwargs": {}})

        # If 'interpret_model', handle model interpretation logic
        if selection == 'interpret_model':
            settings.update({'save': self.global_config_json["tmp_path"]})

        self.CodeHandler.add_line("code", f"for model in trained_models:")
        print_settings = copy.deepcopy(settings)
        if 'save' in print_settings:
            del print_settings['save']
        self.CodeHandler.add_line(
            "code", f"pycaret_exp.{selection}(model, {self.CodeHandler.convert_dict_to_params(print_settings)})", 1)

        # Exécuter pour chaque modèle dans kwargs['models']
        for model in kwargs['models']:
            model = format_model(model)
            os.chdir(self.global_config_json['paths']['ws'])

            # Vérification du support de `predict_proba`
            if selection == 'plot_model' and not hasattr(model, "predict_proba"):
                print(Fore.YELLOW + f"Warning: AUC plot not available for model {model.__class__.__name__} as it does not support predict_proba." + Fore.RESET)
                continue

            # Appel à la fonction PyCaret (plot_model ou autre)
            return_value = getattr(experiment['pycaret_exp'], selection)(model, **settings)

            # Si l'option 'save' est activée et qu'il y a un fichier à sauvegarder
            if 'save' in settings and settings['save'] and return_value is not None:
                return_path = return_value

                def move_file(return_path, new_path):
                    """
                    This function is used to move and replace a file from return_path to new_path.
                    """
                    if os.path.isfile(new_path):
                        os.remove(new_path)
                    os.rename(return_path, new_path)

                # Créer un chemin unique pour l'image sauvegardée
                new_path = os.path.join(
                    self.global_config_json['internalPaths']['tmp'], f'{self.global_config_json["unique_id"]}-{model.__class__.__name__}.png')
                self.global_config_json["unique_id"] += 1

                self.CustZipFile.write_to_zip(
                    custom_actions=lambda path: move_file(return_path, new_path))

                plot_paths[model.__class__.__name__] = new_path

        return plot_paths
