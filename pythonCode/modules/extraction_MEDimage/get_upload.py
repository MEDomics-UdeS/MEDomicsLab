import json
import os
import pickle
import sys
from pathlib import Path

sys.path.append(str(Path(os.path.dirname(os.path.abspath(__file__))).parent.parent))
from med_libs.GoExecutionScript import GoExecutionScript, parse_arguments
from med_libs.MEDimageApp.MEDimageExtraction import MEDimageExtraction
from med_libs.server_utils import go_print

USE_RAM_FOR_EXPERIMENTS_STORING = 1
USE_SAVE_FOR_EXPERIMENTS_STORING = 0

json_params_dict, id_ = parse_arguments()
go_print("running MEDimage get_upload.py:" + id_)


class GoExecScriptRunExperiment(GoExecutionScript):
    """
        This class is used to run the pipeline execution of pycaret
    """
    def __init__(self, json_params: str, process_fn: callable = None, isProgress: bool = False):
        super().__init__(json_params, process_fn, isProgress)
        self.storing_mode = USE_SAVE_FOR_EXPERIMENTS_STORING
        self.current_experiment = None

    def _custom_process(self, json_config: dict) -> dict:
        go_print({'json_config': json_config})
        go_print(json.dumps(json_config, indent=4))
        # check if experiment already exists
        """exp_already_exists = is_experiment_exist(scene_id)
        # create experiment or load it
        if not exp_already_exists:
            self.current_experiment = MEDimageLearning(json_config)
        else:
            self.current_experiment = load_experiment(scene_id)
            self.current_experiment.update(json_config)
        self.current_experiment.start()"""
        self.current_experiment = MEDimageExtraction(json_config)
        results_pipeline = self.current_experiment.get_upload()
        return results_pipeline


def save_experiment(experiment: MEDimageExtraction):
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


get_upload = GoExecScriptRunExperiment(json_params_dict)
get_upload.start()
