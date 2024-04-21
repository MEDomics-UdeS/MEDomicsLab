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



class GoExecScriptComputePCA(GoExecutionScript):
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
        csv_path = json_config["csvPath"]
        columns = json_config["columns"]
        n_components = json_config["nComponents"]
        data_folder_path = json_config["dataFolderPath"]
        column_prefix = json_config["columnPrefix"]
        keep_unselected_columns = json_config["keepUnselectedColumns"]
        results_filename = json_config["resultsFilename"]

        # Read data
        df = pd.read_csv(csv_path)

        # Remove columns containing only 0 values
        zero_columns = df.columns[df.eq(0).all()]
        filtered_columns = [x for x in columns if x not in zero_columns]

        # Keep extracted features columns
        extracted_features = df[filtered_columns]

        # Mean
        extracted_features_mean = extracted_features.mean()
        # Standard deviation
        extracted_features_std = extracted_features.std()
        # Standardization
        extracted_features_standardized = (extracted_features - extracted_features_mean) / extracted_features_std
        # Covariance
        c = extracted_features_standardized.cov()   

        # Get eigenvalues
        eigenvalues, eigenvectors = np.linalg.eig(c)
        # Index the eigenvalues in descending order
        idx = eigenvalues.argsort()[::-1]
        # Sort the eigenvalues in descending order
        eigenvalues = eigenvalues[idx]
        # Sort the corresponding eigenvectors accordingly
        eigenvectors = eigenvectors[:,idx]

        # PCA component or unit matrix
        u = eigenvectors[:,:n_components]
        pca_component = pd.DataFrame(u,
                                    index = filtered_columns,
                                    columns = [column_prefix + '_attr' + str(i) for i in range(n_components)]
                                    )
        
        # Matrix multiplication or dot Product
        extracted_features_pca = extracted_features @ pca_component

        # Concatenate PCA with the unselected columns
        if keep_unselected_columns:
            unselected_columns = [x for x in df.columns if x not in columns]
            extracted_features_pca = pd.concat([df[unselected_columns], extracted_features_pca], axis=1)

        # Create folder for reduced features if not exists
        reduced_features_path = os.path.join(str(Path(data_folder_path)), "reduced_features")
        if not os.path.exists(reduced_features_path):
            os.makedirs(reduced_features_path)
        json_config["reduced_features_path"] = reduced_features_path
        results_path = os.path.join(reduced_features_path, results_filename)
        json_config["results_path"] = results_path

        # Save data
        extracted_features_pca.to_csv(results_path, index=False)

        # Get results
        self.results = json_config

        return self.results


script = GoExecScriptComputePCA(json_params_dict, id_)
script.start()
