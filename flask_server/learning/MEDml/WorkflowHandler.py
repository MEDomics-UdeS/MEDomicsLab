import copy
import pandas as pd
import numpy as np
import json
from typing import Any, Union
DATAFRAME_LIKE = Union[dict, list, tuple, np.ndarray, pd.DataFrame]
TARGET_LIKE = Union[int, str, list, tuple, np.ndarray, pd.Series]


class hashabledict(dict):
    def __hash__(self):
        return hash(tuple(sorted(self.items())))


class WorkflowHandler:

    def __init__(self, scene_json: json, up_to_id="") -> None:
        self.scene_json = scene_json
        self.pipelines = {}
        self.pipelines_up_to_id = {}
        self.pipelines_list = []
        self.pipelines_results_list = []
        self.n_iter = 0
        self.n_iter_up_to_id = 0
        self.up_to_id = up_to_id

        self._create_pipelines()
        self._get_pipelines_up_to_id()

        # Affichage des pipelines
        pipelines, nb_node = self.get_pipelines()
        print(f"Number of Nodes to calculate : {nb_node}")
        print("pipelines to be executed:")
        print(json.dumps(pipelines['pipelines'] if self.up_to_id == "" else pipelines['pipelines_up_to_id'], indent=4))

    def _extract_path(self, test_dict, path_way):
        if not test_dict:
            return [path_way]
        temp = []
        for key in test_dict:
            temp.extend(self._extract_path(test_dict[key], path_way + [key]))
        return temp

    def _inverse_dict(self, test_dict):
        all_paths = self._extract_path(test_dict, [])
        res = {}
        for path in all_paths:
            front = res
            for ele in path[::-1]:
                if ele not in front:
                    front[ele] = {}
                front = front[ele]
        return res

    def _get_pipelines_up_to_id(self):
        # pipelines_inverse = self._inverse_dict(self.pipelines)
        # for id_, content in pipelines_inverse.items():
        #     if id_ != self.up_to_id:
        #         self._find_recursivly(content)
        #     else:
        #         self.pipelines_up_to_id[id_] = content
        self._find_recursivly(self._inverse_dict(self.pipelines))
        self.pipelines_up_to_id = self._inverse_dict(self.pipelines_up_to_id)

    def _find_recursivly(self, new_content: dict):
        self.n_iter_up_to_id += 1
        for id_, content in new_content.items():
            if id_ != self.up_to_id:
                self._find_recursivly(content)
            else:
                self.pipelines_up_to_id[id_] = content

    def _create_pipelines(self):
        nodes = self.scene_json['nodes']
        for id_, content in nodes.items():
            if content['name'] == 'dataset':
                self.pipelines[id_] = self._add_node_to_pipeline(id_)

    def _add_node_to_pipeline(self, id_: str) -> dict:
        self.n_iter += 1
        nodes = {}
        current_node = self.scene_json['nodes'][id_]
        if current_node['outputs'] != {}:
            connections = current_node['outputs']['output_1']['connections']
            for connection in connections:
                nodes[connection['node']] = self._add_node_to_pipeline(connection['node'])
        return nodes

    def _get_pipelines_list(self, d, s=""):
        [self._get_pipelines_list(d[x], s + "." + x) for x in d] or self.pipelines_list.append(s)

    def get_pipelines_list(self) -> list:
        self._get_pipelines_list(self.pipelines)
        pipelines = []
        for pipeline in self.pipelines_list:
            pipelines.append(pipeline.split('.')[1:])
        self.pipelines_list = pipelines
        return self.pipelines_list

    def _get_pipelines_results_list(self, d, s=[]):
        [self.get_pipelines_results_list(d[x]['next_nodes'], s + [{'id': x, 'results': d[x]['results']}]) for x in d] or self.pipelines_results_list.append(s)

    def get_pipelines_results_list(self, d, s=[]) -> list:
        self._get_pipelines_results_list(d, s)
        return self.pipelines_results_list

    def _get_name_and_id(self, id_) -> str:
        return f"{self.scene_json['nodes'][id_]['name']}_{id_}"

    def get_pipelines(self) -> tuple[dict[str, dict[Any, Any]], int]:
        self.n_iter = 0
        if self.up_to_id == "":
            self._count(copy.deepcopy(self.pipelines))
        else:
            self._count(copy.deepcopy(self.pipelines_up_to_id))
        return {"pipelines": self.pipelines, "pipelines_up_to_id": self.pipelines_up_to_id}, self.n_iter

    def _count(self, pipelines: dict) -> int:
        for id_, content in pipelines.items():
            self.n_iter += 1
            self._count(content)
