import json
import os
import pickle
import sys
import threading
from pathlib import Path
import time

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
    def __init__(self, json_params: str, _id: str = "default_id"):
        super().__init__(json_params, _id)
        self.storing_mode = USE_SAVE_FOR_EXPERIMENTS_STORING
        self.current_experiment = None
        self._progress_update_frequency_HZ = 1.0
        self.progress_thread = threading.Thread(target=self._update_progress_periodically, args=())
        self.progress_thread.daemon = True
        self.progress_thread.start()

    def _custom_process(self, json_config: dict) -> dict:
        go_print(json.dumps(json_config, indent=4))

        # Instanciate the MEDimageExtraction object
        self.current_experiment = MEDimageExtraction(json_config)

        # Run all pipelines
        if self._id.lower().startswith("node"):
            results_pipeline = self.current_experiment.run()
        elif self._id == "dm":
            results_pipeline = self.current_experiment.run_dm()
        elif self._id.lower() == "prechecks":
            results_pipeline = self.current_experiment.run_pre_checks()
        elif self._id.lower() == "be":
            results_pipeline = self.current_experiment.run_be()
        elif self._id.lower() == "be_json":
            results_pipeline = self.current_experiment.run_be_get_json()
        elif self._id.lower() == "be_count":
            results_pipeline = self.current_experiment.run_be_count()
        elif self._id.lower() == "be_save_json":
            results_pipeline = self.current_experiment.run_be_save_json()
        else:
            results_pipeline = self.current_experiment.run_all()

        return results_pipeline
    
    def update_progress(self):
        """
        This function is used to update the progress of the pipeline execution.
        It is called periodically by the thread self.progress_thread
        """
        if self.current_experiment is not None:
            progress = self.current_experiment.get_progress()
            self.set_progress(now=progress['now'], label=progress['currentLabel'])
        else:
            self.set_progress(now=0, label="")

    def _update_progress_periodically(self):
        while True:
            self.update_progress()
            self.push_progress()
            time.sleep(1.0 / self._progress_update_frequency_HZ)


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


run_all_extraction = GoExecScriptRunExperiment(json_params_dict, id_)
run_all_extraction.start()
