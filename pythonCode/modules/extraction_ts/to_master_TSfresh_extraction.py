import json
import os
import pandas as pd
import sys

from pathlib import Path

sys.path.append(
    str(Path(os.path.dirname(os.path.abspath(__file__))).parent.parent))
from med_libs.server_utils import go_print
from med_libs.GoExecutionScript import GoExecutionScript, parse_arguments

json_params_dict, id_ = parse_arguments()
go_print("running script.py:" + id_)


class GoExecScriptToMasterTSfreshExtraction(GoExecutionScript):
    """
        This class is used to execute a process from Go

        Args:
            json_params: The input json params
            _id: The id of the page that made the request if any
    """

    def __init__(self, json_params: dict, _id: str = None):
        super().__init__(json_params, _id)
        self.results = {"data": "nothing to return"}

    def _custom_process(self, json_config: dict) -> dict:
        """
        Run format extracted data to master table from time series extraction using TSfresh library.

        Returns: self.results : dict containing data relative to extraction.
        """
        go_print(json.dumps(json_config, indent=4))

        # Check if the process is necessary
        frequency = json_config["relativeToExtractionType"]["frequency"]
        if frequency != "Admission" and frequency != "HourRange":
            return self.results
        
        # Initialize data
        extracted_data_file = json_config["csvResultsPath"]
        extracted_data = pd.read_csv(extracted_data_file)
        selected_columns = json_config["relativeToExtractionType"]["selectedColumns"]

        # Set master table format depending on frequency (for notes there is nothing to do)
        if frequency == "Admission":
            extracted_data.drop(columns=[selected_columns["admissionIdentifier"]], inplace=True)
        elif frequency == "HourRange":
            extracted_data.drop(columns=["end_date"], inplace=True)

        # Save data
        extracted_data.to_csv(extracted_data_file, index=False)

        return self.results


script = GoExecScriptToMasterTSfreshExtraction(json_params_dict, id_)
script.start()
