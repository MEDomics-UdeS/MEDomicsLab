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

        # Create or get the 'row_tags' collection
        row_tags_collection = db["row_tags"]

        # Create a document to hold the group information
        group_document = {
            "collectionName": collectionName,
            "data": [{"row": row, "groupNames": [groupName]} for row in data]  # Store groupName as a list
        }

        # Check if a document for this collectionName already exists
        existing_document = row_tags_collection.find_one({"collectionName": collectionName})

        if existing_document:
            # Prepare to update existing document
            for i, new_entry in enumerate(group_document["data"]):
                existing_row = existing_document["data"][i]
                # Check if the row already exists
                if existing_row["row"] == new_entry["row"]:
                    # If so, add the new group name to the list
                    existing_group_names = existing_row.get("groupNames", [])
                    # Only add the group name if it's not already present
                    if groupName not in existing_group_names:
                        existing_group_names.append(groupName)
                    # Update the existing document
                    row_tags_collection.update_one(
                        {"collectionName": collectionName, "data.row": new_entry["row"]},
                        {"$set": {"data.$.groupNames": existing_group_names}}
                    )
                else:
                    # If the row does not exist, insert it as a new entry
                    row_tags_collection.update_one(
                        {"collectionName": collectionName},
                        {"$addToSet": {"data": new_entry}}  # Use $addToSet to avoid duplicates
                    )
        else:
            # Insert the new document
            row_tags_collection.insert_one(group_document)
            return {"data": f"Created new group '{groupName}' for collection '{collectionName}'."}

        return {"data": f"Updated group '{groupName}' for collection '{collectionName}'."}


script = GoExecScriptCreateGroupDB(json_params_dict, id_)
script.start()
