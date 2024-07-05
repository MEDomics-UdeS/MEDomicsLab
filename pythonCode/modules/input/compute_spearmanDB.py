import json
import sys
import os
import pandas as pd
from pathlib import Path
sys.path.append(
    str(Path(os.path.dirname(os.path.abspath(__file__))).parent.parent))
from med_libs.GoExecutionScript import GoExecutionScript, parse_arguments
from med_libs.server_utils import go_print

# To deal with the DB
from pymongo import MongoClient
import math

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
        selected_columns = json_config["selectedColumns"]
        selected_rows = json_config["selectedSpearmanRows"]
        target = json_config["target"]
        keep_unselected_columns = json_config["keepUnselectedColumns"]
        keep_target = json_config["keepTarget"]
        overwrite = json_config["overwrite"]
        collection_name = json_config["collection"]
        database_name = json_config["databaseName"]
        new_collection_name = json_config["newCollectionName"]


        if target in selected_columns:
            selected_columns.remove(target)

        # Connect to MongoDB
        client = MongoClient('localhost', 27017)
        db = client[database_name]
        collection = db[collection_name]

        # Fetch data and convert to DataFrame 
        data = list(collection.find())
        df = pd.DataFrame(data)
        df = df.drop('_id', axis=1)

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
            collection.delete_many({})
            collection.insert_many(result_df.to_dict(orient='records'))
            return
 
        else:
            db.create_collection(new_collection_name + "_reduced_spearman")
            collection = db[new_collection_name + "_reduced_spearman"]
            collection.insert_many(result_df.to_dict(orient='records'))
            return

script = GoExecScriptComputeSpearman(json_params_dict, id_)
script.start()
