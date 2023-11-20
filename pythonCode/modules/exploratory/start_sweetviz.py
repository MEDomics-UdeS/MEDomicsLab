import os
import json
import pandas as pd
import sweetviz as sv
import sys
from pathlib import Path
sys.path.append(
    str(Path(os.path.dirname(os.path.abspath(__file__))).parent.parent))
from med_libs.server_utils import go_print
from med_libs.GoExecutionScript import GoExecutionScript, parse_arguments

json_params_dict, id_ = parse_arguments()
go_print("running script.py:" + id_)


class StartSweetviz(GoExecutionScript):
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
        dataset1 = json_config['mainDataset']
        dataset2 = json_config['compDataset']
        target = json_config['target']
        dataset1_df = pd.read_csv(dataset1['path'])
        dataset1_name = dataset1['name'].split(".")[0].capitalize()
        if dataset2 != "":
            self.set_progress(label="Loading dataset", now=50)
            dataset2_df = pd.read_csv(dataset2['path'])
            dataset2_name = dataset2['name'].split(".")[0].capitalize()
            self.set_progress(label="Comparing reports", now=75)
            final_report = sv.compare([dataset1_df, dataset1_name], [dataset2_df, dataset2_name], target)
        else:
            self.set_progress(label="Calculating report", now=75)
            final_report = sv.analyze(dataset1_df, target)

        self.set_progress(label="Saving report", now=90)
        final_report.show_html(json_config['savingPath'], False, 'vertical' )
        self.results["savingPath"] = json_config['savingPath']
        return self.results


script = StartSweetviz(json_params_dict, id_)
script.start()
