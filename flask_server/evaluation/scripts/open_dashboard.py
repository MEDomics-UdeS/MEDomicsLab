import sys
import os
import threading
import time
import json
from pathlib import Path
from explainerdashboard import RegressionExplainer, ClassifierExplainer, ExplainerDashboard

sys.path.append(
    str(Path(os.path.dirname(os.path.abspath(__file__))).parent.parent))

from utils.server_utils import go_print, find_next_available_port, get_model_from_medmodel, load_csv, \
    get_model_from_path, is_port_in_use
from utils.GoExecutionScript import GoExecutionScript, parse_arguments
from utils.CustomZipFile import CustomZipFile

json_params_dict, id_ = parse_arguments()


class GoExecScriptOpenDashboard(GoExecutionScript):
    """
        This class is used to run a script from Go to open a dashboard
    """

    def __init__(self, json_params: dict, _id: str = "default_id"):
        super().__init__(json_params, _id)
        self.model = None
        self.port = None
        self.now = 0
        self._progress["type"] = "dashboard"
        self.thread_delay = 2
        self.speed = 2  # rows/second
        self.row_count = 10000
        self.ed:ExplainerDashboard = None
        self.CustZipFileModel = CustomZipFile(".medmodel")
        self.is_calculating = True
        self.progress_thread = threading.Thread(target=self._update_progress_periodically, args=())
        self.progress_thread.daemon = True
        self.progress_thread.start()
        self.dashboard_thread = threading.Thread(target=self._server_dashboard, args=())
        self.dashboard_thread.daemon = True

    def _custom_process(self, json_config: dict) -> dict:
        """
        This function is the main script opening the dashboard
        """
        go_print(json.dumps(json_config, indent=4))
        model_infos = json_config['model']
        ml_type = model_infos['metadata']['ml_type']
        dashboard_name = json_config['dashboardName']
        dataset_infos = json_config['dataset']
        dataset_path = dataset_infos['path']
        sample_size = json_config['sampleSizeFrac']
        pickle_path = json_config['modelObjPath']
        self.model = get_model_from_path(pickle_path)
        os.remove(pickle_path)

        go_print(f"model loaded: {self.model}")

        temp_df = load_csv(dataset_path, model_infos['metadata']['target'])
        if sample_size < 1:
            temp_df = temp_df.sample(frac=sample_size)

        X_test = temp_df.drop(columns=model_infos['metadata']['target'])
        y_test = temp_df[model_infos['metadata']['target']]
        explainer = None
        if ml_type == "classification":
            explainer = ClassifierExplainer(self.model, X_test, y_test)
        elif ml_type == "regression":
            explainer = RegressionExplainer(self.model, X_test, y_test)

        self.row_count = len(y_test)
        self._progress["duration"] = "{:.2f}".format(self.row_count / self.speed / 60.0)
        self.now = 0
        self.ed = ExplainerDashboard(explainer, title=dashboard_name, mode="dash")
        self.now = 100
        go_print(f"dashboard created")
        self.port = find_next_available_port()
        self.dashboard_thread.start()
        self.progress_thread.join()
        self.dashboard_thread.join()
        return {"results_html": "html"}

    def _update_progress_periodically(self):
        """
        This function is used to update the progress of the pipeline execution.
        """
        while self.is_calculating:
            if self.port is not None:
                if is_port_in_use(self.port):
                    self._progress["dashboard_url"] = f"http://localhost:{self.port}/"
                    self._progress["port"] = self.port
                    go_print("self.ed run state" + str(self.ed.app))
                    self.is_calculating = False

            self.now += round(self.thread_delay * self.speed / self.row_count * 100, 2)
            self._progress["now"] = "{:.2f}".format(self.now)
            self.push_progress()
            time.sleep(self.thread_delay)

    def _server_dashboard(self):
        """
        This function is used to run the dashboard
        """
        self.ed.run(host="localhost", port=self.port, use_waitress=True, mode="dash")


open_dashboard = GoExecScriptOpenDashboard(json_params_dict, id_)
open_dashboard.start()
