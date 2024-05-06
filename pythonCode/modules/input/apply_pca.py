import json
import sys
import numpy as np
import os
import pandas as pd
from pathlib import Path
sys.path.append(
    str(Path(os.path.dirname(os.path.abspath(__file__))).parent.parent))
from med_libs.GoExecutionScript import GoExecutionScript, parse_arguments
from med_libs.server_utils import go_print

json_params_dict, id_ = parse_arguments()
go_print("running script.py:" + id_)



class GoExecScriptApplyPCA(GoExecutionScript):
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
        This function is used to compute PCA from a dataset
        and a given PCA transformation.

        Args:
            json_config: The input json params
        """
        go_print(json.dumps(json_config, indent=4))
        # Set local variables
        selected_dataset_path = json_config["selectedDatasetPath"]
        transformation_path = json_config["transformationPath"]
        columns = json_config["columns"]
        data_folder_path = json_config["dataFolderPath"]
        keep_unselected_columns = json_config["keepUnselectedColumns"]
        results_filename = json_config["resultsFilename"]
        file_extension = json_config["fileExtension"]
        overwrite = json_config["overwrite"]

        # Read data
        df = pd.read_csv(selected_dataset_path)
        df_filtered = df[columns]
        transformation = pd.read_csv(transformation_path)
        transformation["index"] = columns
        transformation.set_index("index", inplace=True)
        
        # Matrix multiplication or dot Product
        extracted_features_pca = df_filtered @ transformation

        # Concatenate PCA with the unselected columns
        if keep_unselected_columns:
            unselected_columns = [x for x in df.columns if x not in columns]
            extracted_features_pca = pd.concat([df[unselected_columns], extracted_features_pca], axis=1)
        
        # Create folder for reduced features and transformations if not exists and is necessary
        if not overwrite:
            reduced_features_path = os.path.join(str(Path(data_folder_path)), "reduced_features")
            if not os.path.exists(reduced_features_path):
                os.makedirs(reduced_features_path)
            json_config["reduced_features_path"] = reduced_features_path
            results_path = os.path.join(reduced_features_path, results_filename + "." + file_extension)

        # If overwrite option
        if overwrite:
            results_path = selected_dataset_path

        # Save data
        json_config["results_path"] = results_path
        extracted_features_pca.to_csv(results_path, index=False)

        # Get results
        self.results = json_config

        return self.results


script = GoExecScriptApplyPCA(json_params_dict, id_)
script.start()
