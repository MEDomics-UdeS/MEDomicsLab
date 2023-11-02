from explainerdashboard import ExplainerDashboard

import base64
import copy
import sys
import os
import threading
import time
import argparse
import json
from pathlib import Path
import pandas as pd
import jsonpickle
import pickle
import joblib
from pycaret.internal.patches import sklearn
from sklearn.pipeline import Pipeline
from explainerdashboard import ClassifierExplainer, ExplainerDashboard

sys.path.append(
    str(Path(os.path.dirname(os.path.abspath(__file__))).parent.parent))

from utils.GoExecutionScript import GoExecutionScript, parse_arguments

json_params_dict, id_ = parse_arguments()


class GoExecScriptOpenDashboard(GoExecutionScript):
    """
        This class is used to run the pipeline execution of pycaret
    """

    def __init__(self, json_params: dict, _id: str = "default_id"):
        super().__init__(json_params, _id)
        self.port = json_params['port']

    def _custom_process(self, json_config: dict) -> dict:
        ExplainerDashboard.terminate(self.port)
        return {"data": "nothing to return"}


terminate_dashboard = GoExecScriptOpenDashboard(json_params_dict, id_)
terminate_dashboard.start()
