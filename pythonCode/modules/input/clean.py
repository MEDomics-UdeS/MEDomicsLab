import json
import sys
import os
import pandas as pd
from pathlib import Path
sys.path.append(
    str(Path(os.path.dirname(os.path.abspath(__file__))).parent.parent))
from med_libs.GoExecutionScript import GoExecutionScript, parse_arguments
from med_libs.server_utils import go_print
from med_libs.input_utils.dataframe_utilities import clean_columns, clean_rows, save_dataframe

json_params_dict, id_ = parse_arguments()
go_print("running script.py:" + id_)



class GoExecScriptClean(GoExecutionScript):
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
        This function is used to compute PCA from a dataset, 
        a set of the dataset columns and a number of principal
        components to keep.

        Args:
            json_config: The input json params
        """
        go_print(json.dumps(json_config, indent=4))
        # Set local variables
        processing_type = json_config["type"]
        clean_method = json_config["cleanMethod"]
        overwrite = json_config["overwrite"]
        path = json_config["path"]
        dataset_name = json_config["newDatasetName"]
        dataset_extension = json_config["newDatasetExtension"]
        columns_to_clean = json_config["columnsToClean"]
        rows_to_clean = json_config["rowsToClean"]

        # Read data
        df = pd.read_csv(path)

        # Process
        if processing_type == "columns":
            df = clean_columns(df, columns_to_clean, clean_method)
        elif processing_type == "rows":
            df = clean_rows(df, rows_to_clean, clean_method)
        elif processing_type == "all":
            start_with = json_config["startWith"]
            clean_considering = json_config["cleanConsidering"]
            if start_with == "Columns":
                df = clean_columns(df, columns_to_clean, clean_method)
                if clean_considering == "Threshold":
                    rows_to_clean = df.index[df.isna().sum(axis=1) / len(df.columns) * 100 > json_config["rowThreshold"]].to_list()
                df = clean_rows(df, rows_to_clean, clean_method)
            else:
                df = clean_rows(df, rows_to_clean, clean_method)
                if clean_considering == "Threshold":
                    columns_to_clean = df.columns[df.isna().sum(axis=0) / len(df) * 100 > json_config["columnThreshold"]].to_list()
                df = clean_columns(df, columns_to_clean, clean_method)

        # Save the dataset
        if overwrite:
            result_path = path
            save_dataframe(path, os.path.splitext(path)[1][1:], df)
        else:
            result_path = os.path.join(os.path.dirname(path), dataset_name + "." + dataset_extension)
            save_dataframe(result_path, dataset_extension, df)

        # Get results
        json_config["result_path"] = result_path
        self.results = json_config

        return self.results


script = GoExecScriptClean(json_params_dict, id_)
script.start()
