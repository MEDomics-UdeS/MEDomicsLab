import json
import pandas as pd
from sklearn.model_selection import train_test_split
import numpy as np
import sys
from pathlib import Path
import os
sys.path.append(
    str(Path(os.path.dirname(os.path.abspath(__file__))).parent.parent))
from med_libs.input_utils.dataframe_utilities import load_data_file, save_dataframe, assert_no_nan_values_for_each_column, handle_tags_in_dataframe, clean_columns
from med_libs.GoExecutionScript import GoExecutionScript, parse_arguments
from med_libs.server_utils import go_print

# To deal with the DB
from pymongo import MongoClient
import math

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
        holdout_size = json_config["holdoutSetSize"]/100
        shuffle_bool = json_config["shuffle"]
        stratify_bool = json_config["stratify"]
        columns_to_stratify_with = json_config["columnsToStratifyWith"]
        random_state = json_config["randomState"]
        nan_method = json_config["nanMethod"]
        final_name = json_config["name"]
        database_name = json_config["databaseName"]
        collection_name = json_config["collectionName"]

        # Connect to MongoDB
        client = MongoClient('localhost', 27017)
        db = client[database_name]
        collection = db[collection_name]

        # Fetch data and convert to DataFrame 
        data = list(collection.find())
        df = pd.DataFrame(data)
        df = df.drop('_id', axis=1)

        if not stratify_bool:
            columns_to_stratify_with = []
        
        stratify = df.copy(deep=True) if (
            (len(columns_to_stratify_with) > 0) and stratify_bool) else pd.DataFrame()
        
        df_cleaned = df.replace(float('nan'), np.nan)

        # Clean the stratifying subset
        if stratify_bool:
            stratify = stratify.loc[:, columns_to_stratify_with]

        if stratify[columns_to_stratify_with].isnull().values.any() and len(columns_to_stratify_with) > 0:
            if nan_method == 'drop':
                df_cleaned = clean_columns(df_cleaned, columns_to_stratify_with, "drop empty")
            else:
                df_cleaned = clean_columns(df_cleaned, columns_to_stratify_with, nan_method)

        holdout_set = {}
        train_set = {}
        stratify_df = df_cleaned.loc[:, columns_to_stratify_with] if (
            len(columns_to_stratify_with) > 0 and stratify_bool) else None

        # stratify_df = None
        if stratify_df is not None:
            assert_no_nan_values_for_each_column(stratify_df)

        # Create the holdout set
        if (shuffle_bool):
            train_set, holdout_set = train_test_split(df_cleaned, test_size=holdout_size, random_state=random_state,
                                                    stratify=stratify_df, shuffle=shuffle_bool)
        else:
            train_set, holdout_set = train_test_split(
                df_cleaned, test_size=holdout_size, random_state=random_state)

        # Save the datasets
        learningCollection = "learning_"+final_name
        db.create_collection(learningCollection)
        learningCollection = db[learningCollection]
        data_dict = train_set.where(pd.notnull(train_set), None).to_dict(orient='records')
        learningCollection.insert_many(data_dict)

        holdoutCollection = "holdout_"+final_name
        db.create_collection(holdoutCollection)
        holdoutCollection = db[holdoutCollection]
        data_dict = holdout_set.where(pd.notnull(holdout_set), None).to_dict(orient='records')
        holdoutCollection.insert_many(data_dict)

        return

script = GoExecScriptCreateHoldoutSet(json_params_dict, id_)
script.start()
