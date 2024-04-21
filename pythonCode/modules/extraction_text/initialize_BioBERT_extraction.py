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


class GoExecScriptInitializeBioBERTExtraction(GoExecutionScript):
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
        Run intitialization of text extraction using BioBERT model.

        Returns: self.results : dict containing data relative to extraction.
        """
        go_print(json.dumps(json_config, indent=4))

        # Read data
        selected_columns = json_config["relativeToExtractionType"]["selectedColumns"]
        df_notes = pd.read_csv(json_config["csvPath"])

        # Get list for processing the extraction into batch
        extraction_frequency = json_config["relativeToExtractionType"]["frequency"]
        if extraction_frequency == "Admission":
            df_notes = df_notes.dropna(subset=[selected_columns["patientIdentifier"], selected_columns["admissionIdentifier"]])
            json_config["processing_list"] = df_notes[[selected_columns["patientIdentifier"], selected_columns["admissionIdentifier"]]].drop_duplicates().values.tolist()
        else:
            df_notes = df_notes.dropna(subset=[selected_columns["patientIdentifier"]])
            json_config["processing_list"] = list(set(df_notes[selected_columns["patientIdentifier"]]))
        
        # Create folder for extracted features if not exists
        data_folder_path = json_config["dataFolderPath"]
        extracted_folder_path = os.path.join(str(Path(data_folder_path)), "extracted_features")
        if not os.path.exists(extracted_folder_path):
            os.makedirs(extracted_folder_path)
        json_config["extracted_folder_path"] = extracted_folder_path

        # Create csv file for data
        results_filename = json_config["filename"]
        csv_path = os.path.join(extracted_folder_path, str(Path(results_filename)))
        df = pd.DataFrame([])
        df.to_csv(csv_path, index=False)

        # Save csv result path
        json_config["csv_result_path"] = csv_path

        self.results = json_config

        return self.results


script = GoExecScriptInitializeBioBERTExtraction(json_params_dict, id_)
script.start()
