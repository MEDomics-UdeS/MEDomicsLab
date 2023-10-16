from .MEDexperiment import MEDexperiment
import copy
import pandas as pd
import os
import numpy as np
from pycaret.classification.oop import ClassificationExperiment
from pycaret.regression.oop import RegressionExperiment
from learning.MEDml.logger.MEDml_logger_pycaret import MEDml_logger
import json
from learning.MEDml.nodes.NodeObj import *
from learning.MEDml.nodes import *
from typing import Any, Dict, List, Union
from typing import Union
from pathlib import Path
from utils.server_utils import get_repo_path


def create_pycaret_exp(ml_type: str) -> json:
    """
    Creates a pycaret experiment object depending on the ml_type.
    """
    if ml_type == "classification":
        return ClassificationExperiment()
    elif ml_type == "regression":
        return RegressionExperiment()
    # elif ml_type == "survival_analysis":
    #     return SurvivalAnalysisExperiment()
    else:
        raise ValueError("ML type is not valid")


class MEDexperimentLearning(MEDexperiment):

    def __init__(self, global_config_json: json) -> None:
        """
        Args:

        """
        super().__init__(global_config_json)

    def copy_experiment(self, exp: dict):
        temp_df = copy.deepcopy(exp['pycaret_exp'].data)
        copied_exp = copy.deepcopy(exp)
        copied_exp['pycaret_exp'].data = temp_df

        return copied_exp

    def modify_node_info(self, node_info: dict, node: Node, experiment: dict):
        node_info['results']['logs'] = experiment['medml_logger'].get_results()
        node_info['results']['code'] = {'content': node.CodeHandler.get_code(),
                                        'imports': node.CodeHandler.get_imports()}

    def experiment_setup(self, node_info: dict, node: Node):
        experiment = self.setup_dataset(node)
        node_info['results']['code'] = {'content': node.CodeHandler.get_code(),
                                        'imports': node.CodeHandler.get_imports()}
        node_info['results']['logs'] = experiment['medml_logger'].get_results()
        return experiment

    def create_Node(self, node_config: dict):
        node_type = node_config['data']['internal']['type']
        if node_type == "dataset":
            from learning.MEDml.nodes.Dataset import Dataset
            return Dataset(node_config['id'], self.global_json_config)
        elif node_type == "clean":
            from learning.MEDml.nodes.Clean import Clean
            return Clean(node_config['id'], self.global_json_config)
        elif node_type == "compare_models" or node_type == "train_model":
            from learning.MEDml.nodes.ModelHandler import ModelHandler
            return ModelHandler(node_config['id'], self.global_json_config)
        elif node_type == "tune_model" or node_type == "ensemble_model" or node_type == "blend_models" or node_type == "stack_models" or node_type == "calibrate_model":
            from learning.MEDml.nodes.Optimize import Optimize
            return Optimize(node_config['id'], self.global_json_config)
        elif node_type == "analyze":
            from learning.MEDml.nodes.Analyze import Analyze
            return Analyze(node_config['id'], self.global_json_config)
        elif node_type == "save_model" or node_type == "load_model":
            from learning.MEDml.nodes.ModelIO import ModelIO
            return ModelIO(node_config['id'], self.global_json_config)
        elif node_type == "finalize":
            from learning.MEDml.nodes.Finalize import Finalize
            return Finalize(node_config['id'], self.global_json_config)

    def setup_dataset(self, node: Node):
        """Sets up the dataset for the experiment.\n
        This function is used to create the pycaret experiment and the logger used for retrieving the results from pycaret object execution.

        Args:
            node (Node): The dataset node.
        """
        kwargs = node.settings.copy()
        df = node.df.copy()
        if 'files' in kwargs:
            del kwargs['files']
        if 'time-point' in kwargs:
            del kwargs['time-point']
        if 'split_experiment_by_institutions' in kwargs:
            del kwargs['split_experiment_by_institutions']
        if 'filesFromInput' in kwargs:
            del kwargs['filesFromInput']
        if 'data' in kwargs:
            del kwargs['data']

        # add the imports
        node.CodeHandler.add_import("import numpy as np")
        node.CodeHandler.add_import("import pandas as pd")
        node.CodeHandler.add_import(
            f"from pycaret.{self.global_json_config['MLType']} import *")

        # create the experiment
        pycaret_exp = create_pycaret_exp(
            ml_type=self.global_json_config['MLType'])
        node.CodeHandler.add_line(
            "code", f"pycaret_exp = {self.global_json_config['MLType'].capitalize()}Experiment()")

        # clean the dataset
        # df[kwargs['target']].notna() --> keep only the rows where the target is not null
        # df[df[kwargs['target']].notna()] --> keep only the rows where the target is not null
        temp_df = df[df[kwargs['target']].notna()]
        node.CodeHandler.add_line(
            "code", f"temp_df = df[df['{kwargs['target']}'].notna()]")
        nan_value = float("NaN")
        node.CodeHandler.add_line("code", f"nan_value = float('NaN')")
        temp_df.replace("", nan_value, inplace=True)
        node.CodeHandler.add_line(
            "code", f"temp_df.replace('', nan_value, inplace=True)")
        temp_df.dropna(how='all', axis=1, inplace=True)
        node.CodeHandler.add_line(
            "code", f"temp_df.dropna(how='all', axis=1, inplace=True)")
        medml_logger = MEDml_logger()

        # setup the experiment
        pycaret_exp.setup(temp_df, log_experiment=medml_logger, **kwargs)
        node.CodeHandler.add_line(
            "code", f"pycaret_exp.setup(temp_df, {node.CodeHandler.convert_dict_to_params(kwargs)})")
        node.CodeHandler.add_line(
            "code", f"dataset = pycaret_exp.get_config('X').join(pycaret_exp.get_config('y'))")
        dataset_metaData = {
            'dataset': pycaret_exp.get_config('X').join(pycaret_exp.get_config('y')),
            'X_test': pycaret_exp.get_config('X_test'),
            'y_test': pycaret_exp.get_config('y_test'),
        }
        self.pipelines_objects[node.id]['results']['data'] = {
            "table": dataset_metaData['dataset'].to_json(orient='records'),
            "paths": node.get_path_list(),
        }

        return {
            'pycaret_exp': pycaret_exp,
            'medml_logger': medml_logger,
            'dataset_metaData': dataset_metaData
        }
