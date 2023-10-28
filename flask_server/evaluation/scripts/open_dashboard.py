import copy
import sys
import os
import threading
import time
import argparse
import json
from pathlib import Path
import pandas as pd
import pickle
import joblib
from sklearn.pipeline import Pipeline
from explainerdashboard import ClassifierExplainer, ExplainerDashboard

sys.path.append(
    str(Path(os.path.dirname(os.path.abspath(__file__))).parent.parent))

from utils.server_utils import go_print
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
        self._progress["is_server"] = True
        self.thread_delay = 0.5
        self.speed = 2  # rows/second
        self.row_count = 10000
        self.CustZipFileModel = CustomZipFile(".medmodel")
        self.is_caluculating = True
        self.progress_thread = threading.Thread(target=self._update_progress_periodically, args=())
        self.progress_thread.daemon = True
        self.progress_thread.start()

    def _custom_process(self, json_config: dict) -> dict:
        go_print(json.dumps(json_config, indent=4))
        # write the json config to a file
        with open(
                "C:\\Users\\gblai\\Documents\\github\\MEDomicsLab\\flask_server\\evaluation\\scripts\\json_params.json",
                "w") as f:
            json.dump(json_config, f, indent=4)
        scene_id = json_config['pageId']

        model_infos = json_config['model']
        dashboard_name = json_config['dashboardName']
        medmodel_path = model_infos['path']
        dataset_infos = json_config['dataset']
        sample_size = json_config['sampleSizeFrac']
        # ml_type = model_infos['ml_type'] # TODO add this to the json config and use it to load the corresponding explainer

        def load_model_from_zip(path):
            pkl_path = os.path.join(path, "model.pkl")
            with open(pkl_path, 'rb') as f:
                model = joblib.load(f)
                self.model = model

        self.CustZipFileModel.read_in_zip(
            medmodel_path, load_model_from_zip)
        go_print(f"model loaded: {self.model}")
        dataset_path = dataset_infos['path']
        with open(dataset_path, 'rb') as f:
            dataset = pd.read_csv(f)

        df = dataset.copy()
        temp_df = df[df[model_infos['columns']['target']].notna()]
        temp_df.replace("", float("NaN"), inplace=True)
        temp_df.dropna(how='all', axis=1, inplace=True)
        temp_df = temp_df.sample(frac=sample_size)
        X_test = temp_df.drop(columns=model_infos['columns']['target'])
        y_test = temp_df[model_infos['columns']['target']]
        explainer = ClassifierExplainer(self.model, X_test, y_test)
        self.row_count = len(y_test)
        self.now = 0
        ed = ExplainerDashboard(explainer, title=dashboard_name, mode="dash", use_waitress=True)
        self.now = 100
        go_print(f"dashboard created")
        self.port = self.find_next_avaliable_port()
        ed.app.run(port=self.port)
        html = ed.to_html()
        go_print(f"dashboard served {html}")
        return {"results_html": html}

    def _update_progress_periodically(self):
        while self.is_caluculating:
            if self.port is not None:
                self._progress["dashboard_url"] = f"http://localhost:{self.port}"
                self.is_caluculating = False

            self.now += round(self.thread_delay * self.speed / self.row_count * 100, 2)
            self._progress["now"] = "{:.2f}".format(self.now)
            self.push_progress()
            time.sleep(self.thread_delay)

    def find_next_avaliable_port(self, start_port: int = 5001) -> int:
        """
            This function is used to find the next available port
        """
        port = start_port
        while self.is_port_in_use(port):
            port += 1
        return port

    def is_port_in_use(self, port: int) -> bool:
        """
            This function is used to check if a port is in use
        """
        go_print(f"checking port {port}")
        import socket
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            return s.connect_ex(('localhost', port)) == 0


open_dashboard = GoExecScriptOpenDashboard(json_params_dict, id_)
open_dashboard.start()
