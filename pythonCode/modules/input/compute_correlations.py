import json
import sys
import os
import pandas as pd
from pathlib import Path
sys.path.append(
    str(Path(os.path.dirname(os.path.abspath(__file__))).parent.parent))
from med_libs.GoExecutionScript import GoExecutionScript, parse_arguments
from med_libs.server_utils import go_print

json_params_dict, id_ = parse_arguments()
go_print("running script.py:" + id_)



class GoExecScriptComputeCorrelations(GoExecutionScript):
    """
        This class is used to execute the merge script

        Args:
            json_params: The input json params
            _id: The id of the page that made the request if any
    """

    def __init__(self, json_params: dict, _id: str = None):
        super().__init__(json_params, _id)
        self.results = {"data": "nothing to return"}

    def _custom_process(self, json_config: dict) -> dict:
        """
        This function is used to compute correlations from a dataset, 
        a set of the dataset columns and a target column.

        Args:
            json_config: The input json params
        """
        go_print(json.dumps(json_config, indent=4))

        # Set local variables
        csv_path = json_config["csvPath"]
        columns = json_config["columns"]
        target = json_config["target"]
        if target in columns:
            columns.remove(target)

        # Read data
        df = pd.read_csv(csv_path)
        extracted_features = df[columns + [target]]

        # Compute correlation
        df_corr = extracted_features.corr(method='spearman')
        corr_with_target = df_corr['target'].abs().sort_values(ascending=False).drop(target)
        results = corr_with_target.to_dict()

        # Get results
        json_config["correlations"] = results
        self.results = json_config

        return self.results


script = GoExecScriptComputeCorrelations(json_params_dict, id_)
script.start()