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



class GoExecScriptComputeSpearman(GoExecutionScript):
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
        This function is used to compute Spearman from a dataset, 
        a set of the dataset columns and a target column.

        Args:
            json_config: The input json params
        """
        go_print(json.dumps(json_config, indent=4))

        # Set local variables
        csv_path = json_config["csvPath"]
        selected_columns = json_config["selectedColumns"]
        selected_rows = json_config["selectedSpearmanRows"]
        target = json_config["selectedTarget"]
        data_folder_path = json_config["dataFolderPath"]
        keep_unselected_columns = json_config["keepUnselectedColumns"]
        keep_target = json_config["keepTarget"]
        results_filename = json_config["resultsFilename"]
        file_extension = json_config["fileExtension"]
        overwrite = json_config["overwrite"]

        if target in selected_columns:
            selected_columns.remove(target)

        # Read data
        df = pd.read_csv(csv_path)

        # Format selected rows
        formatted_selected_rows = [x["index"] for x in selected_rows]
        
        # Columns to keep in dataframe
        columns_to_keep = formatted_selected_rows
        if keep_unselected_columns:
            unselected_columns = [x for x in df.columns if x not in selected_columns + [target]]
            columns_to_keep = unselected_columns + columns_to_keep
        if keep_target:
            columns_to_keep = columns_to_keep + [target]

        # Compute result dataframe
        result_df = df[columns_to_keep]

        # If overwrite option
        if overwrite:
            results_path = csv_path
        # Else create folder for reduced features if not exists
        else:
            reduced_features_path = os.path.join(str(Path(data_folder_path)), "reduced_features")
            if not os.path.exists(reduced_features_path):
                os.makedirs(reduced_features_path)
            json_config["reduced_features_path"] = reduced_features_path
            results_path = os.path.join(reduced_features_path, results_filename + "." + file_extension)
        json_config["results_path"] = results_path

        # Save data
        result_df.to_csv(results_path, index=False)

        # Get results
        self.results = json_config

        return self.results


script = GoExecScriptComputeSpearman(json_params_dict, id_)
script.start()
