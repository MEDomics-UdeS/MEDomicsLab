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


class GoExecScriptGetUpload(GoExecutionScript):
    """
        This class is used to run the pipeline execution of pycaret
    """
    def __init__(self, json_params: str):
        super().__init__(json_params)

    def _custom_process(self, json_config: dict) -> dict:
        go_print(json.dumps(json_config, indent=4))
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


get_upload = GoExecScriptGetUpload(json_params_dict)
get_upload.start()
