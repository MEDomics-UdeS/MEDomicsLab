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


def is_primitive(obj):
    """
    Checks if the object is a primitive type.
    """
    primitive_types = (int, float, bool, str, bytes, type(
        None), dict, list, tuple, np.ndarray, pd.DataFrame, pd.Series)
    # print(type(obj).__name__, isinstance(obj, primitive_types))
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

            glbal_json_config: Should have this structure:
            {
                "nbNodes2Run": 0,
                "paths": {
                    "ws": "./",
                    "tmp": "./tmp/",
                    "models": "./models/"
                },
                "pipelines": {
                    "pipeline1": {
                        "nodes": {
                            "node1": {
                                "type": "node_type",
                                "params": {
                                    "param1": "value1",
                                    "param2": "value2"
                                }
                            },
                            "node2": {
                                "type": "node_type",
                                "params": {
                                    "param1": "value1",
                                    "param2": "value2"
                                }
                            }
                        },
                        "connections": {

                        }
                    }
                }
            }


        """
        self.experiment_name = "Default experiment name"
        self.experiment = {}
        self.pipelines = global_json_config['pipelines']
        self.pipelines_to_execute = self.pipelines
        self.global_json_config = global_json_config
        self.global_variables = {}
        self._results_pipeline = {}
        self._progress = {'currentLabel': '', 'now': 0.0}
        self._nb_nodes = global_json_config['nbNodes2Run']
        self._nb_nodes_done: float = 0.0
        self.global_json_config['unique_id'] = 0
        self.pipelines_objects = self.create_next_nodes(self.pipelines, {})
        if self.global_json_config['paths']['ws'][0] == '.':
            self.global_json_config['paths']['ws'] = get_repo_path() + self.global_json_config['paths']['ws'][1:]
            self.global_json_config['paths']['tmp'] = get_repo_path() + self.global_json_config['paths']['tmp'][1:]
            self.global_json_config['paths']['models'] = get_repo_path() + self.global_json_config['paths']['models'][
                                                                           1:]
        os.chdir(str(Path(os.path.dirname(os.path.abspath(__file__))).parent.parent))
        print("current working directory: ", os.getcwd())
        for f in os.listdir(self.global_json_config['paths']['tmp']):
            if f != '.gitkeep':
                os.remove(os.path.join(self.global_json_config['paths']['tmp'], f))

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
        self._progress = {'currentLabel': 'Updating pipeline\'s informations', 'now': 0.0}
        print("Experiment already exists. Updating experiment...")
        self.pipelines_objects = self.create_next_nodes(self.pipelines, self.pipelines_objects)

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
                # if it is a create_model node, we need to point to the model node
                # To be consistent with the rest of the nodes,
                # we create a new node with the same parameters but with the model id
                tmp_subid_list = current_node_id.split('*')
                if len(tmp_subid_list) > 1:
                    self.global_json_config['nodes'][current_node_id] = \
                        copy.deepcopy(
                            self.global_json_config['nodes'][tmp_subid_list[0]])
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
