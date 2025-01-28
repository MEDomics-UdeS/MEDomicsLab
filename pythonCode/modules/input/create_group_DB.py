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

# To deal with the DB
from pymongo import MongoClient
import math

# to deal with the ObjectID
from bson import ObjectId

json_params_dict, id_ = parse_arguments()
go_print("running script.py:" + id_)



class GoExecScriptCreateGroupDB(GoExecutionScript):
    """
        This class is used to execute the create group DB script.

        Args:
            json_params: The input json params
            _id: The id of the page that made the request if any
    """

    def __init__(self, json_params: dict, _id: str = None):
        super().__init__(json_params, _id)
        self.results = {"data": "nothing to return"}

    def _custom_process(self, json_config: dict) -> dict:
        """
        This function is used to create the group DB.

        Args:
            json_config: The input JSON params.
        """

        collectionName = json_config["collectionName"]
        groupName = json_config["groupName"]
        data = json_config["data"]
        db_name = json_config["databaseName"]

        print("Starting creating group DB script")

        # Connect to MongoDB
        client = MongoClient('localhost', 54017)
        db = client[db_name]
        collection = db[collectionName]

        # Check if groupName already exists under the 'Group' Column
        if collection.find_one({"Group": groupName}):
            return {"error": f"The Group '{groupName}' already exists in the collection."}
        

        # Step 1: Add the 'Group' column to all documents if it doesn't exist
        collection.update_many(
            {"Group": {"$exists": False}},  # Only update documents without the 'Group' field
            {"$set": {"Group": None}}  # Add the 'Group' field with a default value of None
        )

        # Step 2: Update the 'Group' field only for the documents in `data`
        for document in data:
            # Ensure the `_id` is properly formatted as an ObjectId
            document_id = ObjectId(document["_id"]) if not isinstance(document["_id"], ObjectId) else document["_id"]
            # print(f"Updating document with _id: {document_id}") -- Uncomment to see prints
            collection.update_one(
                {"_id": document_id},  # Match the document by its unique _id
                {"$set": {"Group": groupName}}  # Set the group name
            )

        return {"data": f"Group '{groupName}' added to {len(data)} documents successfully"}



script = GoExecScriptCreateGroupDB(json_params_dict, id_)
script.start()
