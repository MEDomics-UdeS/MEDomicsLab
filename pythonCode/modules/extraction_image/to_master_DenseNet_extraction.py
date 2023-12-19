import json
import os
import pandas as pd
import re
import sys

from pathlib import Path

sys.path.append(
    str(Path(os.path.dirname(os.path.abspath(__file__))).parent.parent))
from med_libs.server_utils import go_print
from med_libs.GoExecutionScript import GoExecutionScript, parse_arguments

json_params_dict, id_ = parse_arguments()
go_print("running script.py:" + id_)


class GoExecScriptToMasterDenseNetExtraction(GoExecutionScript):
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
        Run format extracted data to master table from image extraction using DenseNet model.

        Returns: self.results : dict containing data relative to extraction.
        """
        go_print(json.dumps(json_config, indent=4))
        
        # Initialize data
        depth = json_config["depth"]
        extracted_data_file = json_config["csvResultsPath"]
        patient_id_level = json_config["relativeToExtractionType"]["patientIdentifierLevel"]
        info_dataframe = json_config["relativeToExtractionType"]["selectedDataset"]
        selected_columns = json_config["relativeToExtractionType"]["selectedColumns"]
        filename_col = selected_columns["filename"]
        date_col = selected_columns["date"]
        df_info = pd.read_csv(info_dataframe)
        df_info = df_info[[filename_col, date_col]].rename(columns={filename_col: "filename"})
        extracted_data = pd.read_csv(extracted_data_file)

        # Merge df_info on extracted data
        tmp = df_info.merge(extracted_data, on="filename", how='inner')
        extracted_data = tmp
        for i in range(1, depth + 1):
            if i != patient_id_level:
                extracted_data.drop(["level_" + str(i)], axis=1, inplace=True)
        extracted_data.drop(["filename"], axis=1, inplace=True)
        columns = extracted_data.columns
        new_columns = [columns[1]] + [columns[0]] + list(columns[2:])
        extracted_data = extracted_data.reindex(columns=new_columns)
        if json_config["relativeToExtractionType"]["parsePatientIdAsInt"]:
            parsed_col = extracted_data[extracted_data.columns[0]].apply(lambda x: int(re.findall(r'\d+', x)[0]))
            extracted_data[extracted_data.columns[0]] = parsed_col

        # Save data
        extracted_data.to_csv(extracted_data_file, index=False)

        self.results = json_config

        return self.results


script = GoExecScriptToMasterDenseNetExtraction(json_params_dict, id_)
script.start()
