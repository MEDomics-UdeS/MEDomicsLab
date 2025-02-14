import json
import sys
import numpy as np
import os
import pandas as pd
from pathlib import Path
sys.path.append(
    str(Path(os.path.dirname(os.path.abspath(__file__))).parent.parent))
from concurrent.futures import ThreadPoolExecutor, as_completed
from med_libs.GoExecutionScript import GoExecutionScript, parse_arguments
from med_libs.server_utils import go_print

# To deal with the DB
from pymongo import MongoClient

json_params_dict, id_ = parse_arguments()
go_print("running script.py:" + id_)

class GoExecScriptGetSubsetData(GoExecutionScript):
    """
        This class is used to execute the get subset data script

        Args:
            json_params: The input json params
            _id: The id of the page that made the request if any
    """

    def __init__(self, json_params: dict, _id: str = None):
        super().__init__(json_params, _id)
        self.results = {"data": "nothing to return"}

    def _custom_process(self, json_config: dict) -> dict:
        """
        This function is used to get the subset data from the database

        Args:
            json_config: The input json params
        """

        # Get the Data from the JsonToSend
        database_name = json_config["database_name"]
        collection_id = json_config["collection"]
        
        # Connect to the database and connect to the tag_collection
        client = MongoClient('localhost', 54017)
        db = client[database_name]
        collection = db[collection_id]

        def fetch_data():
            return list(collection.find({}))

        def process_data(data):
            data = pd.DataFrame(data)
            data = data.drop("_id", axis=1)
            return data

        def transform_data(data):
            return data.to_dict(orient='records')

        def extract_columns(data):
            return [{"field": col, "header": col} for col in data.columns]

        # Use ThreadPoolExecutor to fetch and process data in parallel
        with ThreadPoolExecutor() as executor:
            future_data = executor.submit(fetch_data)
            data = future_data.result()

            future_processed_data = executor.submit(process_data, data)
            data = future_processed_data.result()

            future_transformed_data = executor.submit(transform_data, data)
            transformed_data = future_transformed_data.result()

            future_columns = executor.submit(extract_columns, data)
            columns = future_columns.result()

        # Return the transformed data and columns
        return {"data": transformed_data, "columns": columns}

script = GoExecScriptGetSubsetData(json_params_dict, id_)
script.start()