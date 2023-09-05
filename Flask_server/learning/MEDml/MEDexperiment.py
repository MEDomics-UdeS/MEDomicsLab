import copy

import pandas as pd
from itertools import chain, combinations
import csv
import os
import numpy as np


# from pycaret.survival_analysis.oop import SurvivalAnalysisExperiment
from pycaret.classification import ClassificationExperiment
from pycaret.regression import RegressionExperiment
from learning.MEDml.logger.MEDml_logger import MEDml_logger
import mlflow
import json

from learning.MEDml.nodes.NodeObj import *
from learning.MEDml.nodes import *
from learning.MEDml.utils.loading import Loader
from typing import Any, Callable, Dict, List, Optional, Tuple, Union
from termcolor import colored

DATAFRAME_LIKE = Union[dict, list, tuple, np.ndarray, pd.DataFrame]
TARGET_LIKE = Union[int, str, list, tuple, np.ndarray, pd.Series]
FOLDER, FILE, INPUT = 1, 2, 3


def create_pycaret_exp(ml_type: str) -> json:
        if ml_type == "classification":
            return ClassificationExperiment()
        elif ml_type == "regression":
            return RegressionExperiment()
        # elif ml_type == "survival_analysis":
        #     return SurvivalAnalysisExperiment()
        else:
            raise ValueError("ML type is not valid")


def isPrimitive2(obj):
    # print(type(obj), not hasattr(obj, '__dict__') and "sklearn" not in str(type(obj)))
    if type(obj).__name__ == "RandomState" or type(obj).__name__ == "DecisionTreeClassifier" or type(obj).__name__ == "DecisionTreeRegressor" or type(obj).__name__ == "RandomForestClassifier" or type(obj).__name__ == "RandomForestRegressor" or type(obj).__name__ == "LogisticRegression" or type(obj).__name__ == "LinearRegression" or type(obj).__name__ == "KNeighborsClassifier" or type(obj).__name__ == "KNeighborsRegressor" or type(obj).__name__ == "SVC" or type(obj).__name__ == "SVR" or type(obj).__name__ == "GaussianNB" or type(obj).__name__ == "GaussianProcessClassifier" or type(obj).__name__ == "GaussianProcessRegressor" or type(obj).__name__ == "AdaBoostClassifier" or type(obj).__name__ == "AdaBoostRegressor" or type(obj).__name__ == "GradientBoostingClassifier" or type(obj).__name__ == "GradientBoostingRegressor" or type(obj).__name__ == "XGBClassifier" or type(obj).__name__ == "XGBRegressor" or type(obj).__name__ == "LGBMClassifier" or type(obj).__name__ == "LGBMRegressor" or type(obj).__name__ == "CatBoostClassifier" or type(obj).__name__ == "CatBoostRegressor" or type(obj).__name__ == "LinearDiscriminantAnalysis" or type(obj).__name__ == "QuadraticDiscriminantAnalysis" or type(obj).__name__ == "MLPClassifier" or type(obj).__name__ == "MLPRegressor" or type(obj).__name__ == "RidgeClassifier" or type(obj).__name__ == "RidgeRegressor" or type(obj).__name__ == "RidgeClassifierCV" or type(obj).__name__ == "RidgeCV" or type(obj).__name__ == "Lasso" or type(obj).__name__ == "LassoCV" or type(obj).__name__ == "LassoLars" or type(obj).__name__ == "LassoLarsCV" or type(obj).__name__ == "LassoLarsIC" or type(obj).__name__ == "ElasticNet" or type(obj).__name__ == "ElasticNetCV" or type(obj).__name__ == "BayesianRidge" or type(obj).__name__ == "ARDRegression" or type(obj).__name__ == "OrthogonalMatchingPursuit":
        return False
    return not hasattr(obj, '__dict__') and "sklearn" not in str(type(obj))


def isPrimitive(obj):
    primitive_types = (int, float, bool, str, bytes, type(None), dict, list, tuple, np.ndarray, pd.DataFrame, pd.Series)
    print(type(obj).__name__, isinstance(obj, primitive_types))
    if isinstance(obj, primitive_types):
        # Check if the object is one of the primitive types
        return True

    return False


class MEDexperiment:
    """Class that represents an experiment. It contains all the information about the experiment, the pipelines, the nodes, the dataframes, etc.
    It also contains the methods to execute the experiment.

    """

    def __init__(self, global_json_config: json = None):
        """Constructor of the class. It initializes the experiment with the pipelines and the global configuration.

        Args:
            pipelines (json, optional): The pipelines of the experiment. Defaults to None.
            global_json_config (json, optional): The global configuration of the experiment. Defaults to None.
            nb_nodes (float, optional): The number of nodes in the experiment. Defaults to 0.
        """
        self.dfs = {}
        self.dfs_combinations = {}
        self.experiment_name = "Default experiment name"
        self.experiment = {}
        self.pipelines = global_json_config['pipelines']
        self.pipelines_to_execute = self.pipelines
        self.global_json_config = global_json_config
        self.pipelines_objects = {}
        self.global_variables = {}
        self._results_pipeline = {}
        self._progress = {'cur_node': '', 'progress': 0.0}
        self._nb_nodes = global_json_config['nbNodes2Run']
        self._nb_nodes_done: float = 0.0
        self.global_json_config['unique_id'] = 0
        self.pipelines_objects = self.create_next_nodes(self.pipelines, copy.deepcopy(self.pipelines_objects))
        # tmp_dir = global_json_config['saving_path']
        global_json_config['saving_path'] = "local_dir"
        tmp_dir = "local_dir"
        for f in os.listdir(tmp_dir):
            if f != '.gitkeep':
                os.remove(os.path.join(tmp_dir, f))

    def update(self, global_json_config: json = None):
        """Updates the experiment with the pipelines and the global configuration.

        Args:
            pipelines (json, optional): The pipelines of the experiment. Defaults to None.
            global_json_config (json, optional): The global configuration of the experiment. Defaults to None.
            nb_nodes (float, optional): The number of nodes in the experiment. Defaults to 0.
        """
        self.pipelines = global_json_config['pipelines']
        self.pipelines_to_execute = self.pipelines
        self.global_json_config = global_json_config
        self.global_variables = {}
        self.global_json_config['unique_id'] = 0
        self._nb_nodes = global_json_config['nbNodes2Run']
        self._nb_nodes_done: float = 0.0
        self._progress = {'cur_node': '', 'progress': 0.0}
        self.pipelines_objects = self.create_next_nodes(self.pipelines, copy.deepcopy(self.pipelines_objects))

    def create_next_nodes(self, next_nodes: json, pipelines_objects: dict) -> dict:
        """Recursive function that creates the next nodes of the experiment.

        Args:
            next_nodes (json): The next nodes of the experiment.
            pipelines_objects (dict): The pipelines objects of the experiment.

        Returns:
            dict: The next nodes of the recursive sequence.
        """
        nodes = {}
        if next_nodes != {}:
            for current_node_id, next_nodes_id_json in next_nodes.items():
                # if it is a create model node, we need to point to the model node
                # To be consistent with the rest of the nodes,
                # we create a new node with the same parameters but with the model id
                tmp_subid_list = current_node_id.split('*')
                if len(tmp_subid_list) > 1:
                    self.global_json_config['nodes'][current_node_id] = \
                        copy.deepcopy(self.global_json_config['nodes'][tmp_subid_list[0]])
                    self.global_json_config['nodes'][current_node_id]['associated_model_id'] = \
                        tmp_subid_list[1]
                    self.global_json_config['nodes'][current_node_id]['id'] = current_node_id
                # then, we create the node normally
                node = self.create_Node(self.global_json_config['nodes'][current_node_id])
                nodes[current_node_id] = self.handle_Node_creation(node, pipelines_objects)
                nodes[current_node_id]['obj'].just_run = False
                if current_node_id in pipelines_objects:
                    nodes[current_node_id]['next_nodes'] = \
                        self.create_next_nodes(next_nodes_id_json,
                                                pipelines_objects[current_node_id]['next_nodes'])
                else:
                    nodes[current_node_id]['next_nodes'] = \
                        self.create_next_nodes(next_nodes_id_json, {})
        return nodes

    def handle_Node_creation(self, node: Node, pipelines_objects: dict) -> dict:
        """Handles the creation of a node by checking if it already exists in the pipelines objects.

        Args:
            node (Node): The node to handle.
            pipelines_objects (dict): The pipelines objects of the experiment.

        Returns:
            dict: The node information containing the node and the next nodes.
        """
        if node.id in pipelines_objects:
            if node != pipelines_objects[node.id]['obj']:
                return {'obj': node, 'next_nodes': {}}
            else:
                tmp = copy.deepcopy(pipelines_objects[node.id])
                tmp['next_nodes'] = {}
                return tmp
        else:
            return {'obj': node, 'next_nodes': {}}

    def start(self) -> None:
        """Starts the experiment by executing recursively each nodes of the pipelines to execute  and by saving the results.\n
        *Take note that the first iterations of the recursive function are the dataset nodes so the experiment object
         (pycaret) is created in setup_dataset() only called here in start()*
        """
        if self.pipelines is not None:
            # it starts the recursive with a dataset node
            for current_node_id, next_nodes_id_json in self.pipelines_to_execute.items():
                node_info = self.pipelines_objects[current_node_id]
                node = node_info['obj']
                self._progress['cur_node'] = node.username
                has_been_run = node.has_run()
                if not has_been_run:
                    node_info['results'] = { 
                        'prev_node_id': None,
                        'data': node.execute()
                    }
                    experiment = self.setup_dataset(node)
                    node_info['experiment'] = experiment
                else:
                    print(f"already run {node.username} -----------------------------------------------------------------------------")
                    experiment = node_info['experiment']
                self._nb_nodes_done += 1.0
                self._progress['progress'] = round(self._nb_nodes_done / self._nb_nodes * 100.0, 2)
                if not has_been_run:
                    node_info['results']['logs'] = experiment['medml_logger'].get_results()
                self._results_pipeline[current_node_id] = {
                    'next_nodes': copy.deepcopy(next_nodes_id_json),
                    'results': copy.deepcopy(node_info['results'])
                }
                self.execute_next_nodes(
                    prev_node=node,
                    next_nodes_to_execute=next_nodes_id_json,
                    next_nodes=node_info['next_nodes'],
                    results=self._results_pipeline[current_node_id]['next_nodes'],
                    experiment=copy.deepcopy(experiment)
                )

            print('finished')

    def execute_next_nodes(self, prev_node: Node, next_nodes_to_execute: json, next_nodes: json, results: json, experiment: json):
        """Recursive function that executes the next nodes of the experiment pipeline.

        Args:
            prev_node (Node): The previous node already executed.
            next_nodes_to_execute (json): The next nodes to execute of the experiment.
            next_nodes (json): The next nodes of the experiment.
            results (json): The results of the experiment.
            experiment (json): The experiment object (pycaret).
        """
        if next_nodes_to_execute != {}:
            for current_node_id, next_nodes_id_json in next_nodes_to_execute.items():
                node_info = next_nodes[current_node_id]
                node = node_info['obj']
                self._progress['cur_node'] = node.username
                if not node.has_run() or prev_node.has_changed():
                    node_info['results'] = {
                        'prev_node_id': prev_node.id,
                        'data': node.execute(experiment, **prev_node.get_info_for_next_node()),
                        'logs': experiment['medml_logger'].get_results()
                    }
                    node_info['experiment'] = experiment
                else:
                    experiment = node_info['experiment']
                    print(f"already run {node.username} -----------------------------------------------------------------------------")

                self._nb_nodes_done += 1
                self._progress['progress'] = round(self._nb_nodes_done / self._nb_nodes * 100, 2)
                results[current_node_id] = {
                    'next_nodes': copy.deepcopy(next_nodes_id_json),
                    'results': copy.deepcopy(node_info['results'])
                }
                self.execute_next_nodes(
                    prev_node=node,
                    next_nodes_to_execute=next_nodes_id_json,
                    next_nodes=node_info['next_nodes'],
                    results=results[current_node_id]['next_nodes'],
                    experiment=copy.deepcopy(experiment)
                )

    def join_codes(self, pipeline: list[Node]) -> str:
        """Joins the codes of each nodes of the pipeline.

        Args:
            pipeline (list[Node]): The pipeline to join.

        Returns:
            str: The joined codes.
        """
        codes = []
        for node in pipeline:
            codes.append(node.get_final_code())
        return "".join(codes)

    def create_Node(self, node_config: json) -> Node:
        """Creates a node from a json config composed of the node settings and other metadata.

        Args:
            node_config (json): The json config of the node.

        Returns:
            Node: The created node.
        """

        node_type = node_config['data']['internal']['type']

        if node_type == "dataset":
            from MEDml.nodes.Dataset import Dataset
            return Dataset(node_config['id'], self.global_json_config)
        elif node_type == "clean":
            from MEDml.nodes.Clean import Clean
            return Clean(node_config['id'], self.global_json_config)
        elif node_type == "compare_models" or node_type == "create_model":
            from MEDml.nodes.ModelHandler import ModelHandler
            return ModelHandler(node_config['id'], self.global_json_config)
        elif node_type == "tune_model" or node_type == "ensemble_model" or node_type == "blend_models" or node_type == "stack_models" or node_type == "calibrate_model":
            from MEDml.nodes.Optimize import Optimize
            return Optimize(node_config['id'], self.global_json_config)
        elif node_type == "analyse":
            from MEDml.nodes.Analyse import Analyse
            return Analyse(node_config['id'], self.global_json_config)
        elif node_type == "deploy":
            from MEDml.nodes.Deploy import Deploy
            return Deploy(node_config['id'], self.global_json_config)

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
        pycaret_exp = create_pycaret_exp(ml_type=self.global_json_config['MLType'])
        temp_df = df[df[kwargs['target']].notna()]
        nan_value = float("NaN")
        temp_df.replace("", nan_value, inplace=True)
        temp_df.dropna(how='all', axis=1, inplace=True)
        medml_logger = MEDml_logger()
        pycaret_exp.setup(data=temp_df, log_experiment=medml_logger, **kwargs)
        dataset_metaData = {
            'dataset': pycaret_exp.get_config('X').join(pycaret_exp.get_config('y')),
            'X_test': pycaret_exp.get_config('X_test'),
            'y_test': pycaret_exp.get_config('y_test'),
        }
        self.pipelines_objects[node.id]['results']['data'] = dataset_metaData['dataset'].to_json(orient='records')
        return {'pycaret_exp': pycaret_exp,
                'medml_logger': medml_logger,
                'dataset_metaData': dataset_metaData
                }

    def get_results(self) -> dict:
        """Returns the results of the pipeline execution using some cleaning.

        Returns:
            dict: The results of the pipeline execution.
        """
        return_dict = {}
        for key, value in self._results_pipeline.items():
            if isPrimitive(value):
                if isinstance(value, dict):
                    return_dict[key] = self.add_only_object(value)
                else:
                    return_dict[key] = value
        return return_dict

    def add_only_object(self, next: json) -> dict:
        """Recursively adding only primitive objects.

        Args:
            next (json): The json to check.

        Returns:
            dict: The cleaned json.
        """
        return_dict = {}
        for key, value in next.items():
            # print(key, value, isPrimitive(value))
            if isPrimitive(value):
                if isinstance(value, dict):
                    return_dict[key] = self.add_only_object(value)
                else:
                    return_dict[key] = value
        return return_dict

    def get_progress(self) -> dict:
        """Returns the progress of the pipeline execution.\n
        self._progress is a dict containing the current node in execution and the current progress of all processed nodes.\n
        this function is called by the frontend to update the progress bar continuously when the pipeline is running.

        Returns:
            dict: The progress of all pipelines execution.
        """
        return self._progress

    def get_results_Models_test_set(self) -> tuple:
        """Returns the models and the test set of the last pipeline.\n
        This function is used to get the models and the test set of the last pipeline to be used in the analyse node.

        Returns:
            list: The models of the last pipeline.
            pd.DataFrame: The test set of the last pipeline.
        """
        models = []
        X_test = None
        y_test = None
        for pipe_name, pipe_dict in self.global_variables.items():
            if pipe_name.startswith('pipeline'):
                print(pipe_name, pipe_dict)
                print(pipe_dict.__class__)
                models = pipe_dict['models']
                X_test = pipe_dict['X_test']
                # X_test = pd.DataFrame(data=pipe_dict['X_test'].data)
                # X_test["target"] = pipe_dict['X_test'].target
                y_test = pipe_dict['y_test']
                # y_test = pd.DataFrame(data=pipe_dict['y_test'].data)
                # y_test["target"] = pipe_dict['y_test'].target
        return models, X_test, y_test
