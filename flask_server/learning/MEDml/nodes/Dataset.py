import pandas as pd
from itertools import chain, combinations
import os
import numpy as np
import json
from learning.MEDml.utils.loading import Loader
from learning.MEDml.nodes.NodeObj import *
from typing import Union


DATAFRAME_LIKE = Union[dict, list, tuple, np.ndarray, pd.DataFrame]
TARGET_LIKE = Union[int, str, list, tuple, np.ndarray, pd.Series]
FOLDER, FILE, INPUT = 1, 2, 3


class Dataset(Node):

    def __init__(self, id_: int, global_config_json: json) -> None:
        super().__init__(id_, global_config_json)
        self.df = None
        self._dfs = {}
        self.entry_file_type = None
        self.dfs_combinations = None
        self.output_dataset = {}

    def _execute(self, experiment: dict = None, **kwargs) -> json:
        if self.settings['files'] != '':
            self.entry_file_type = FOLDER if os.path.isdir(
                self.settings['files']) else FILE
            if self.entry_file_type == FOLDER:
                self.load_csv_in_folder(self.settings['files'])
                self.dfs_combinations = self._merge_dfs(self.settings['time-point'],
                                                        self.settings['split_experiment_by_institutions'])
            else:
                self.df = pd.read_csv(
                    self.settings['files'], sep=',', encoding='utf-8')
                self.CodeHandler.add_line(
                    "code", f"df = pd.read_csv({json.dumps(self.settings['files'])}, sep=',', encoding='utf-8')")
                self.CodeHandler.add_seperator()
        else:
            self.entry_file_type = INPUT
            self.df = self.global_config_json['dfs_from_input'][self.settings['filesFromInput']]
        self._info_for_next_node = {'target': self.settings['target']}
        return {}

    def load_csv_in_folder(self, folder_name: str) -> None:
        loader = Loader("Loading all csv...", "Finished!").start()
        for file_name in os.listdir(folder_name):
            f = os.path.join(folder_name, file_name)
            if f.endswith(".csv"):
                name_info_list = file_name.split('.')
                csv_type = name_info_list[1]
                timepoint = int(name_info_list[2].replace('time', ''))
                if not self._dfs.keys().__contains__(csv_type):
                    self._dfs[csv_type] = {}
                if not self._dfs[csv_type].keys().__contains__(timepoint):
                    self._dfs[csv_type][timepoint] = []
                self._dfs[csv_type][timepoint].append(
                    {name_info_list[3]: pd.read_csv(f, sep=',', encoding='utf-8')})
                # +"pd.read_csv(f, sep=',', encoding='utf-8')"
        loader.stop()

    def _merge_dfs(self, timePoint: str, split_by_institutions: bool) -> dict:
        loader = Loader("Merging multi-omics combinations...",
                        "Finished!").start()
        timePoint_int = int(timePoint.replace('time', ''))
        (k, df_outcome_col), = self._dfs['outcome'][timePoint_int][0].items()
        combinations_element = []
        for k, v in self._dfs['variable'].items():
            if int(k) <= timePoint_int:
                combinations_element.append(v)
        combinations = self._get_combinations(combinations_element)
        combinations_dict = {}
        for combination in combinations:
            df_temp = pd.DataFrame()
            comb_name = ""
            for elem in combination:
                if comb_name == "":
                    # print(elem)
                    (k, v), = elem.items()
                    comb_name = comb_name + k
                    df_temp = v
                else:
                    (k, v), = elem.items()
                    comb_name = comb_name + "-" + k
                    df_temp = df_temp.merge(v, how='inner', on='ID')
            combinations_dict[comb_name] = df_temp.merge(
                df_outcome_col, how='inner', on='ID')
        if split_by_institutions:
            combinations_dict_institutions = {}
            for exp_name, df in combinations_dict.items():
                combinations_dict_institutions[exp_name] = {}
                institutions_list = []
                for id in df['ID'].to_list():
                    inst = id.split('-')[1]
                    if not institutions_list.__contains__(inst):
                        institutions_list.append(inst)
                        # combinations_dict_institutions[exp_name][inst] = pd.DataFrame()
                        combinations_dict_institutions[exp_name][inst] = (
                            df.loc[df['ID'] == id])
                    else:
                        new_row = df.loc[df['ID'] == id]
                        # combinations_dict_institutions[exp_name][inst].append(pd.DataFrame(new_row, columns=df.columns))
                        combinations_dict_institutions[exp_name][inst] = pd.concat(
                            [new_row, combinations_dict_institutions[exp_name][inst].loc[:]]).reset_index(drop=True)
            loader.stop()
            return combinations_dict_institutions
        else:
            loader.stop()
            return combinations_dict

    def _get_combinations(self, items):
        l_items = list(items)
        raw_list = list(chain.from_iterable(combinations(l_items, r)
                        for r in range(len(l_items) + 1)))[1:]
        clean_list = []
        for elem_list in raw_list:
            temp1 = []
            for elem in elem_list:
                temp1.append(elem)
            clean_list.append([j for i in temp1 for j in i])
        return clean_list

    def get_json_dataset(self) -> json:
        return self.df.to_json(orient='records')

    # TODO
    def get_path_list(self) -> list:
        return [self.settings['files']]
