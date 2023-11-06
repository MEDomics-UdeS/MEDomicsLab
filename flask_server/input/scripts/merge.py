import os
import sys
from pathlib import Path
import json
import pandas as pd
sys.path.append(
    str(Path(os.path.dirname(os.path.abspath(__file__))).parent.parent))
    
from input.input_utils.dataframe_utilities import load_data_file, save_dataframe
from utils.GoExecutionScript import GoExecutionScript, parse_arguments
from utils.server_utils import go_print

json_params_dict, id_ = parse_arguments()
go_print("running script.py:" + id_)



class GoExecScriptMerge(GoExecutionScript):
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
        TODO: add your doc here
        """
        go_print(json.dumps(json_config, indent=4))
        # Set local variables
        payload = json_config["payload"]
        self.set_progress(now=0, label="None")

        length = (len(payload.keys())-1)*2
        progress_step = 100/length
        progress = 0

        

        self.set_progress(now=progress, label="Initialisation")

        first_dataset_path = payload["0"]["path"]
        first_dataset_extension = payload["0"]["extension"]
        first_dataset_selected_columns = payload["0"]["selectedColumns"]
        first_dataset_selected_columns = [
            column for column in first_dataset_selected_columns if column != None]
        self.set_progress(now=progress, label="Initialisation : Loading the first dataset")
        first_dataset = load_data_file(first_dataset_path, first_dataset_extension)[
            first_dataset_selected_columns]

        for dataset in payload.keys():
            if (dataset == "0"):
                continue
            else:
                dataset_path = payload[dataset]["path"]
                dataset_name = payload[dataset]["name"]
                dataset_extension = payload[dataset]["extension"]
                dataset_selected_columns = payload[dataset]["selectedColumns"]
                dataset_merge_on = payload[dataset]["mergeOn"]
                dataset_merge_type = payload[dataset]["mergeType"]

                # Update the progress
                self.set_progress(now=progress, label="Initialisation : Loading the first dataset")
                progress += progress_step

                # Load the dataset
                new_dataframe = load_data_file(dataset_path, dataset_extension)[
                    dataset_selected_columns]
                self.set_progress(now=progress, label="Merging with " + dataset_name)
                progress += progress_step

                # Merge the dataset
                first_dataset = first_dataset.merge(
                    new_dataframe, how=dataset_merge_type, on=dataset_merge_on)

        # Save the merged dataset
        final_dataset_extension = json_config["finalDatasetExtension"]
        final_dataset_path = json_config["finalDatasetPath"]
        save_dataframe(final_dataset_path, final_dataset_extension, first_dataset)
        self.set_progress(now=100, label="Done, saving the file at " + final_dataset_path)

        json_config["final_path"] = final_dataset_path
        self.results = json_config

        return self.results


script = GoExecScriptMerge(json_params_dict, id_)
script.start()
