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

from utils.server_utils import go_print, find_next_available_port, get_model_from_medmodel, load_csv
from utils.GoExecutionScript import GoExecutionScript, parse_arguments
from utils.CustomZipFile import CustomZipFile

json_params_dict, id_ = parse_arguments()


class GoExecScriptOpenDashboard(GoExecutionScript):
    """
        This class is used to run the pipeline execution of pycaret
    """

    def __init__(self, json_params: dict, _id: str = "default_id"):
        super().__init__(json_params, _id)
        self.model = None
        self.port = None
        self.now = 0
        self._progress["type"] = "dashboard"
        self.thread_delay = 0.5
        self.speed = 2  # rows/second
        self.row_count = 10000
        self.CustZipFileModel = CustomZipFile(".medmodel")
        self.is_calculating = True
        self.progress_thread = threading.Thread(target=self._update_progress_periodically, args=())
        self.progress_thread.daemon = True
        self.progress_thread.start()

    def _custom_process(self, json_config: dict) -> dict:
        go_print(json.dumps(json_config, indent=4))
        scene_id = json_config['pageId']

        model_infos = json_config['model']
        dashboard_name = json_config['dashboardName']
        medmodel_path = model_infos['path']
        dataset_infos = json_config['dataset']
        dataset_path = dataset_infos['path']
        sample_size = json_config['sampleSizeFrac']
        pikle_path = model_infos['modelObjPath']
        go_print(f"model string: {pikle_path}")
        with open(pikle_path, "rb") as f:
            model = joblib.load(f)
        if isinstance(model, Pipeline):
            model = model.steps[-1][1]
        os.remove(pikle_path)

        # ml_type = model_infos['ml_type'] # TODO add this to the json config and use it to load the corresponding explainer

        self.model = get_model_from_medmodel(medmodel_path)
        go_print(f"model loaded: {self.model}")
        go_print(f"model loaded 2: {model}")

        temp_df = load_csv(dataset_path, model_infos['columns']['target'])
        if sample_size < 1:
            temp_df = temp_df.sample(frac=sample_size)

        X_test = temp_df.drop(columns=model_infos['columns']['target'])
        y_test = temp_df[model_infos['columns']['target']]
        explainer = ClassifierExplainer(self.model, X_test, y_test)
        self.row_count = len(y_test)
        self._progress["duration"] = "{:.2f}".format(self.row_count / self.speed / 60.0)
        self.now = 0
        ed = ExplainerDashboard(explainer, title=dashboard_name, mode="dash")
        self.now = 100
        go_print(f"dashboard created")
        self.port = find_next_available_port()
        self.progress_thread.join()
        # ed.run(host="localhost", port=self.port, use_waitress=True)
        html = ed.to_html()
        return {"results_html": html}

    def _update_progress_periodically(self):
        while self.is_calculating:
            if self.port is not None:
                self._progress["dashboard_url"] = f"http://localhost:{self.port}"
                self._progress["port"] = self.port
                self.is_calculating = False

            self.now += round(self.thread_delay * self.speed / self.row_count * 100, 2)
            self._progress["now"] = "{:.2f}".format(self.now)
            self.push_progress()
            time.sleep(self.thread_delay)


open_dashboard = GoExecScriptOpenDashboard(json_params_dict, id_)
open_dashboard.start()
