import os
import json
import sys
from pathlib import Path
import time

sys.path.append(
    str(Path(os.path.dirname(os.path.abspath(__file__))).parent.parent))

from med_libs.GoExecutionScript import GoExecutionScript, parse_arguments
from med_libs.server_utils import go_print

#  MEDfl imports 
from sklearn.model_selection import train_test_split
import pandas as pd

# MEDfl imports 
from MEDfl.LearningManager.params_optimiser import ParamsOptimiser

json_params_dict, id_ = parse_arguments()
go_print(json_params_dict['path'])


class GoExecScriptParamOptimFromMEDfl(GoExecutionScript):
    """
        This class is used to execute a process from Go

        Args:
            json_params: The json params of the execution
            _id: The id of the execution
    """

    def __init__(self, json_params: dict, _id: str = None):
        super().__init__(json_params, _id)
        self.results = {"data": "nothing to return"}

    def _custom_process(self, json_config: dict) -> dict:
        """
        This function is the main script of the execution of the process from Go
        """
      
        self.set_progress(label="Reading dataset", now=20)
        data = pd.read_csv( json_config["dataset"])
        # Define features and target variable
        features = [col for col in data.columns if col != json_config["target"]]
        target = json_config["target"]
        
        X_train, X_test, y_train, y_test = train_test_split(data[features], data[target], test_size=0.2, random_state=42)

        # Initiate the ParamsOptimiser class 
        trainer = ParamsOptimiser(X_train, y_train, X_test, y_test)
        
        self.set_progress(label="Model optimisation", now=30)
        recall_grid_search = trainer.perform_grid_search(json_config["param_grid"], scoring_metric='f1')


        self.set_progress(label="Getting params", now=90)

        self.results = {
        "data" : {
            "Best Parameters" : recall_grid_search.best_params_  , 
            "Best Score": recall_grid_search.best_score_
        } ,  
        "stringFromBackend" : "Best params returned"}

        self.set_progress(label="Best hyperparameters are ready", now=100)
        return self.results


fl_db_config = GoExecScriptParamOptimFromMEDfl(json_params_dict, id_)
fl_db_config.start()
