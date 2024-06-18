import json
import sys
import os
import collections
from pathlib import Path
sys.path.append(
    str(Path(os.path.dirname(os.path.abspath(__file__))).parent.parent))
from med_libs.input_utils.dataframe_utilities import load_data_file, save_dataframe, handle_tags_in_dataframe
from med_libs.GoExecutionScript import GoExecutionScript, parse_arguments
from med_libs.server_utils import go_print

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
        This function is used to merge datasets with Pandas

        Args:
            json_config: The input json params
        """
        go_print(json.dumps(json_config, indent=4))
        # Set local variables
        payload = json_config["payload"]
        self.set_progress(now=0, label="None")

        length = (len(payload.keys())-1)*2
        progress_step = 100/length
        progress = 0
        tags = {}
        

        self.set_progress(now=progress, label="Initialisation")

        first_dataset_path = payload["0"]["path"]
        first_dataset_extension = payload["0"]["extension"]
        first_dataset_selected_columns = payload["0"]["selectedColumns"]
        first_dataset_selected_columns = [
            column for column in first_dataset_selected_columns if column != None]
        self.set_progress(now=progress, label="Initialisation : Loading the first dataset")
        first_dataset = load_data_file(first_dataset_path, first_dataset_extension)
        first_dataset, first_dataset_tags = handle_tags_in_dataframe(first_dataset)
        first_dataset = first_dataset[first_dataset_selected_columns]
        if first_dataset_tags != None:
            tags.update(first_dataset_tags)
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

                # Dataset name without extension
                dataset_name_without_ext = dataset_name.split(".")
                if len(dataset_name_without_ext) > 2:
                    dataset_name_without_ext = dataset_name_without_ext[:-1]
                    dataset_name_without_ext = ".".join(dataset_name_without_ext)
                else:
                    dataset_name_without_ext = dataset_name_without_ext[0]

                # Update the progress
                self.set_progress(now=progress, label="Initialisation : Loading the first dataset")
                progress += progress_step

                # Load the dataset
                new_dataframe = load_data_file(dataset_path, dataset_extension)
                new_dataframe, new_dataframe_tags = handle_tags_in_dataframe(new_dataframe)
                new_dataframe = new_dataframe[dataset_selected_columns]
                self.set_progress(now=progress, label="Merging with " + dataset_name)
                progress += progress_step
                # Check if the new dataframe has tags
                if new_dataframe_tags != None:
                    # Check if the column names of the new dataframe are already present in the first dataset
                    first_dataset_columns = first_dataset.columns
                    intersection = collections.Counter(first_dataset_columns) & collections.Counter(new_dataframe.columns)
                    if len(intersection) > 0:
                        # Remove the merge on column from the intersection
                        for column in dataset_merge_on:
                            if column in intersection.keys():
                                intersection.pop(column)
                        # Add the dataset name to the column names of the new dataframe to avoid duplicates and modify the column names acting as keys in the new_dataframe_tags dictionary
                        for duplicate_column_name in intersection.keys():
                            new_dataframe.rename(
                                columns={duplicate_column_name: duplicate_column_name + "_" + dataset_name_without_ext}, inplace=True)
                            new_dataframe_tags[duplicate_column_name + "_" + dataset_name_without_ext] = new_dataframe_tags.pop(duplicate_column_name)
                # Merge the dataset
                first_dataset = first_dataset.merge(
                    new_dataframe, how=dataset_merge_type, on=dataset_merge_on)

                # Update the tags
                if new_dataframe_tags != None:
                    tags.update(new_dataframe_tags)



        # Save the merged dataset
        final_dataset_extension = json_config["finalDatasetExtension"]
        final_dataset_path = json_config["finalDatasetPath"]
        save_dataframe(final_dataset_path, final_dataset_extension, first_dataset, tags=tags)
        self.set_progress(now=100, label="Done, saving the file at " + final_dataset_path)

        json_config["final_path"] = final_dataset_path
        self.results = json_config

        return self.results


script = GoExecScriptMerge(json_params_dict, id_)
script.start()
