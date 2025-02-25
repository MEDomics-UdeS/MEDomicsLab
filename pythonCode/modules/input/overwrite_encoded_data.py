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
import pandas as pd

# To deal with the DB
from pymongo import MongoClient
import math

json_params_dict, id_ = parse_arguments()
go_print("running script.py:" + id_)




class GoExecScriptOverwrite(GoExecutionScript):
    """
    This class overwrites data in a MongoDB collection.

    Args:
        json_params: Input JSON parameters
        _id: Request ID (optional)
    """

    def __init__(self, json_params: dict, _id: str = None):
        super().__init__(json_params, _id)
        self.results = None  # Initially set to None

    def _custom_process(self, json_config: dict) -> dict:
        """
        Overwrites the specified collection with new data.

        Args:
            json_config: Input JSON parameters
        """
        try:
            go_print(json.dumps(json_config, indent=4))

            # Set local variables
            database_name = json_config["databaseName"]
            collection_name = json_config["collectionName"]
            new_data = json_config["data"]

            # column_to_transform = json_config.get("columnToTransform", "")
            # transformed_data = []
            # for record in new_data:
            #     transformed_record = {}
            #     for key, value in record.items():
            #         # Ajouter un préfixe uniquement si nécessaire
            #         if key.startswith(column_to_transform):
            #             transformed_record[f"{column_to_transform}__{key}"] = value
            #         else:
            #             transformed_record[key] = value
            #     transformed_data.append(transformed_record)

            # Connect to MongoDB
            client = MongoClient('localhost', 54017)
            db = client[database_name]
            collection = db[collection_name]


            # Overwrite the data
            go_print(f"Overwriting data in collection: {collection_name}")
            collection.drop()
            collection.insert_many(new_data)

            # Return success
            self.results = {"status": "success", "message": "Data overwritten successfully."}
        except Exception as e:
            # Handle exceptions
            self.results = {"status": "error", "message": str(e)}
            go_print(f"Error: {str(e)}")

        return self.results


# Start the script
script = GoExecScriptOverwrite(json_params_dict, id_)
script.start()
