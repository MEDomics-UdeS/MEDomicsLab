import copy
import os
import tempfile
import traceback
from pathlib import Path
from typing import TYPE_CHECKING, Any, Dict, List, Optional

import numpy as np
import pandas as pd
import json

from pycaret.internal.meta_estimators import get_estimator_from_meta_estimator
from pycaret.internal.pipeline import get_pipeline_estimator_label
from termcolor import colored
from pycaret.loggers.base_logger import BaseLogger

if TYPE_CHECKING:
    from pycaret.internal.pycaret_experiment.tabular_experiment import (
        _TabularExperiment,
    )


class MEDml_logger(BaseLogger):
    def __init__(self) -> None:
        self.current_experiment = None
        self.results = {}
        self.counter = 0

    def init_logger():
        print("init logger")

    def __del__(self):
        try:
            self.finish_experiment()
        except Exception as e:
            print(e)

    def __repr__(self) -> str:
        return self.__class__.__name__

    def log_params(self, params, model_name=None):
        print()
        print(colored(f"log params: {params}, {model_name}", 'green'))
        if self.current_experiment is not None:
            self.results['models'][self.current_experiment]['params'].append(params)
        else:
            self.results['setup'] = params

    def init_experiment(self, exp_name_log, full_name=None, **kwargs):
        print()
        print(colored(f"init experiment: {exp_name_log}, {full_name}", 'green'))
        count = self.counter
        if full_name is not None:
            if 'models' not in self.results:
                self.results['models'] = {}
            exist = False
            for model in self.results['models'].keys():
                if model.split('-')[1] == full_name:
                    exist = True
                    self.current_experiment = f"{model.split('-')[0]}-{full_name}"
            if not exist:
                self.results['models'][f"{count}-{full_name}"] = {}
                self.results['models'][f"{count}-{full_name}"]['params'] = []
                self.results['models'][f"{count}-{full_name}"]['metrics'] = []
                self.counter += 1
                self.current_experiment = f"{count}-{full_name}"
        else:
            # check if list is empty
            if 'setup' not in self.results:
                self.results['setup'] = []
            self.current_experiment = None


    def set_tags(self, source, experiment_custom_tags, runtime):
        # print(colored(f"set tags: {source}, {experiment_custom_tags}, {runtime}", 'green'))
        pass

    def log_sklearn_pipeline(self, experiment, prep_pipe, model, path=None):
        print(colored(f"log sklearn pipeline: {experiment}, {prep_pipe}, {model}, {path}", 'green'))

    def log_model_comparison(self, model_result, source):
        print(colored(f"log model comparison: {model_result.__class__}, {source}", 'green'))
        # if self.current_experiment is not None:
        #     if 'models' not in self.results:
        #         self.results['models'] = {self.current_experiment: {}}
        #     if 'model comparison' not in self.results['models'][self.current_experiment]:
        #         self.results['models'][self.current_experiment]['model comparison'] = []
        #     self.results['models'][self.current_experiment]['model comparison'].append(json.loads(model_result.to_json(orient='columns', force_ascii=True)))

    def log_metrics(self, metrics, source=None):
        print()
        print(colored(f"log metrics: {metrics}, {source}", 'green'))
        result_type = 'models' if self.current_experiment is not None else 'setup'
        self.results[result_type][self.current_experiment]['metrics'].append(metrics)

    def log_plot(self, plot, title):
        print(colored(f"log plot: {plot}, {title}", 'green'))

    def log_hpram_grid(self, html_file, title="hpram_grid"):
        print(colored(f"log hpram grid: {html_file}, {title}", 'green'))

    def log_artifact(self, file, type="artifact"):
        # print(colored(f"log artifact: {file}, {type}", 'green'))
        pass

    def finish_experiment(self) -> dict:
        print(colored("finish experiment", 'green'))
        cleaned_results = str(self.results)\
            .replace('\'', '\"')\
            .replace('(', '[')\
            .replace(')', ']')\
            .replace('True', '\"true\"')\
            .replace('False', '\"false\"')\
            .replace('MEDml_logger', '\"MEDml_logger\"')\
            .replace('None', '\"None\"')\
            .replace('\"\"true\"\"', '\"true\"')\
            .replace(' nan,', '\"nan\",')
        # err_index = 1131
        # print(cleaned_results[err_index-20:err_index+20])
        return json.loads(cleaned_results)

    def get_results(self):
        print(colored(f"gathering results", 'green'))
        results = copy.deepcopy(self.results)
        if 'setup' in results:
            del results['setup']['Log Experiment']
        # for model in results['models'].keys():
        #     for metric in results['models'][model]['metrics']:
        #         for key in metric.keys():
        #             if isinstance(metric[key], np.float64):
        #                 metric[key] = float(metric[key])
        self.results = {}
        self.counter = 0
        return results

    def info(self, msg):
        print(colored(f"{msg}", 'green'))
