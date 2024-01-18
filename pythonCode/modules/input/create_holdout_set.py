import json
import pandas as pd
from sklearn.model_selection import train_test_split
import numpy as np
import sys
from pathlib import Path
import os
sys.path.append(
    str(Path(os.path.dirname(os.path.abspath(__file__))).parent.parent))
from med_libs.input_utils.dataframe_utilities import load_data_file, save_dataframe, assert_no_nan_values_for_each_column, handle_tags_in_dataframe
from med_libs.GoExecutionScript import GoExecutionScript, parse_arguments
from med_libs.server_utils import go_print

json_params_dict, id_ = parse_arguments()
go_print("running script.py:" + id_)



class GoExecScriptCreateHoldoutSet(GoExecutionScript):
    """
        This class is used to execute the holdout set creation script

        Args:
            json_params: The input json params
            _id: The id of the page that made the request if any
    """

    def __init__(self, json_params: dict, _id: str = None):
        super().__init__(json_params, _id)
        self.results = {"data": "nothing to return"}

    def _custom_process(self, json_config: dict) -> dict:
        """
        This function is used to create a holdout set
        and a train set with Pandas

        Args:
            json_config: The input json params

        """
        go_print(json.dumps(json_config, indent=4))
        # Set local variables
        payload = json_config["payload"]

        request_id = json_config["pageId"]
        self.set_progress(now=0, label="None")

        # length = len(payload.keys())*2
        progress_step = 100/5
        progress = 0
        self.set_progress(now=progress, label="Initialisation")
       

        final_dataset_path = json_config["finalDatasetPath"]
        final_dataset_extension = json_config["finalDatasetExtension"]
        main_dataset_path = payload["datasetPath"]
        main_dataset_extension = payload["extension"]
        holdout_size = payload["holdoutSetSize"]/100
        shuffle_bool = payload["shuffle"]
        stratify_bool = payload["stratify"]
        columns_to_stratify_with = payload["columnsToStratifyWith"]
        random_state = payload["randomState"]
        nan_method = payload["nanMethod"]
        final_name = payload["name"]

        if not stratify_bool:
            columns_to_stratify_with = []

        # Load the dataset
        progress += progress_step
        self.set_progress(now=progress, label="Initialisation : Loading the dataset")
        
        main_dataset = load_data_file(main_dataset_path, main_dataset_extension)
        main_dataset, tags = handle_tags_in_dataframe(main_dataset)
        progress += progress_step
        self.set_progress(now=progress, label="Initialisation : Creating stratifying subset")
        
        stratify = main_dataset.copy(deep=True) if (
            (len(columns_to_stratify_with) > 0) and stratify_bool) else pd.DataFrame()

        progress += progress_step
        self.set_progress(now=progress, label="Cleaning stratifying subset")
        
        df_cleaned = main_dataset.replace(float('nan'), np.nan)
        # Clean the stratifying subset
        if stratify_bool:
            stratify = stratify.loc[:, columns_to_stratify_with]
            assert_no_nan_values_for_each_column(stratify)
            stratify = stratify.dropna(axis=0, how='any')

        if stratify[columns_to_stratify_with].isnull().values.any() and len(columns_to_stratify_with) > 0 and stratify_bool:
            if nan_method == 'drop':
                df_cleaned = df_cleaned.dropna(
                    subset=columns_to_stratify_with, axis=0)

        holdout_set = {}
        train_set = {}
        stratify_df = df_cleaned.loc[:, columns_to_stratify_with] if (
            len(columns_to_stratify_with) > 0 and stratify_bool) else None

        # stratify_df = None
        if stratify_df is not None:
            assert_no_nan_values_for_each_column(stratify_df)

        # Create the holdout set
        progress += progress_step
        self.set_progress(now=progress, label="Creating holdout set")

        if (shuffle_bool):
            train_set, holdout_set = train_test_split(df_cleaned, test_size=holdout_size, random_state=random_state,
                                                    stratify=stratify_df, shuffle=shuffle_bool)
        else:
            train_set, holdout_set = train_test_split(
                df_cleaned, test_size=holdout_size, random_state=random_state)

        # Save the datasets
        progress += progress_step
        self.set_progress(now=progress, label="Saving the datasets with " + final_name )

        save_dataframe(final_dataset_path+"train_"+final_name,
                    final_dataset_extension, train_set, tags=tags)
        save_dataframe(final_dataset_path+"holdout_"+final_name,
                    final_dataset_extension, holdout_set, tags=tags)
        self.set_progress(now=100, label="Done, saving the file at " + final_dataset_path)

        json_config["final_path"] = final_dataset_path
        self.results = json_config
        return self.results


script = GoExecScriptCreateHoldoutSet(json_params_dict, id_)
script.start()
