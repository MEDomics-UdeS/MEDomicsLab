


import argparse
import pickle
import os
import sys
from pathlib import Path
import json
sys.path.append(
    str(Path(os.path.dirname(os.path.abspath(__file__))).parent.parent))

from utils.server_utils import go_print
from utils.GoExecutionScript import GoExecutionScript
from learning.MEDml.MEDexperiment_learning import MEDexperimentLearning

USE_RAM_FOR_EXPERIMENTS_STORING = 1
USE_SAVE_FOR_EXPERIMENTS_STORING = 0

parser = argparse.ArgumentParser()
parser.add_argument('--json-param', type=str, default='.')
args = parser.parse_args()
json_param_str = args.json_param


class GoExecScriptRunExperiment(GoExecutionScript):
    def __init__(self, json_params: str, process_fn: callable = None, isProgress: bool = False):
        super().__init__(json_params, process_fn, isProgress)
        self.storing_mode = USE_SAVE_FOR_EXPERIMENTS_STORING
        self.current_experiment = None

    def _custom_process(self, json_config: dict) -> dict:
        go_print(json.dumps(json_config, indent=4))
        scene_id = json_config['pageId']
        # check if experiment already exists
        exp_already_exists = is_experiment_exist(scene_id)
        # create experiment or load it
        if not exp_already_exists:
            self.current_experiment = MEDexperimentLearning(json_config)
        else:
            self.current_experiment = load_experiment(scene_id)
            self.current_experiment.update(json_config)
        self.current_experiment.start()
        results_pipeline = self.current_experiment.get_results()
        self.current_experiment.set_progress(
            label='Saving the experiment')
        save_experiment(self.current_experiment)
        return results_pipeline


def save_experiment(experiment: MEDexperimentLearning):
    """
    triggered by the button save in the dashboard, it saves the pipeline execution

    Returns: the results of the pipeline execution
    """
    go_print("saving experiment")
    experiment.make_save_ready()
    with open('local_dir/MEDexperiment_' + experiment.id + '.medexp', 'wb') as f:
        pickle.dump(experiment, f)
        del experiment


def load_experiment(id_):
    """
    triggered by the button load in the dashboard, it loads the pipeline execution

    Returns: the previously saved MEDexperiment
    """
    go_print("loading experiment")
    with open('local_dir/MEDexperiment_' + id_ + '.medexp', 'rb') as f:
        experiment = pickle.load(f)
        experiment.init_obj()
        return experiment


def is_experiment_exist(id_):
    """
    triggered by the button load in the dashboard, it loads the pipeline execution

    Returns: the results of the pipeline execution
    """
    return os.path.exists('local_dir/MEDexperiment_' + id_ + '.medexp')


run_experiment = GoExecScriptRunExperiment(json_param_str)
run_experiment.start()
