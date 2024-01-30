import os
import json
from ydata_profiling import ProfileReport
import pandas as pd
import sys
from pathlib import Path
sys.path.append(
    str(Path(os.path.dirname(os.path.abspath(__file__))).parent.parent))
from med_libs.server_utils import go_print
from med_libs.GoExecutionScript import GoExecutionScript, parse_arguments

json_params_dict, id_ = parse_arguments()
go_print("running script.py:" + id_)


class StartYDataProfiling(GoExecutionScript):
    """
        This class is used to execute a process from Go

        Args:
            json_params: The input json params
            _id: The id of the page that made the request if any
    """

    def __init__(self, json_params: dict, _id: str = None):
        super().__init__(json_params, _id)
        self.results = {"data": "nothing to return"}
        self._progress["type"] = "process"

    def _custom_process(self, json_config: dict) -> dict:
        """
        This function is the main script of the execution of the process from Go
        """
        go_print(json.dumps(json_config, indent=4))
        dataset1 = json_config['mainDataset']['path']
        dataset2 = json_config['compDataset']
        self.set_progress(label="Loading dataset", now=20)
        dataset1_df = pd.read_csv(dataset1)
        self.set_progress(label="Calculating report", now=35)
        dataset1_report = ProfileReport(dataset1_df, title=json_config['mainDataset']['name'].split(".")[0].capitalize(), minimal=True)
        final_report = dataset1_report
        if dataset2 != "":
            self.set_progress(label="Loading dataset", now=50)
            dataset2_df = pd.read_csv(dataset2['path'])
            self.set_progress(label="Calculating report", now=60)
            dataset2_report = ProfileReport(dataset2_df, title=json_config['compDataset']['name'].split(".")[0].capitalize(), minimal=True)
            self.set_progress(label="Comparing reports", now=75)
            final_report = dataset1_report.compare(dataset2_report)

        self.set_progress(label="Saving report", now=90)
        if not os.path.exists(os.path.dirname(json_config['savingPath'])):
            os.makedirs(os.path.dirname(json_config['savingPath']))
        final_report.to_file(json_config['savingPath'])
        self.results["savingPath"] = json_config['savingPath']
        self.set_progress(label="Done!", now=100)
        return self.results


script = StartYDataProfiling(json_params_dict, id_)
script.start()
