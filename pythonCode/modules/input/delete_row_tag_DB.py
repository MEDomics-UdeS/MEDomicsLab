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



class GoExecScriptDeleteRowTagDB(GoExecutionScript):
    """
        This class is used to execute the delete row tag DB script.

        Args:
            json_params: The input json params
            _id: The id of the page that made the request if any
    """

    def __init__(self, json_params: dict, _id: str = None):
        super().__init__(json_params, _id)
        self.results = {"data": "nothing to return"}

    def _custom_process(self, json_config: dict) -> dict:
            tagToDelete = json_config["tagToDelete"]
            db_name = json_config["databaseName"]
            rowId = json_config["rowId"]

            client = MongoClient('localhost', 54017)
            db = client[db_name]
            row_tags_collection = db["row_tags"]

            document = row_tags_collection.find_one()
            if document is None:
                raise Exception("No document found in the DB")

            row = next((item for item in document["data"] if item["row"]["_id"] == rowId), None)
            if row is None:
                raise Exception("Row not found in the DB")

            groupNames = row["groupNames"]
            if tagToDelete in groupNames:
                groupNames.remove(tagToDelete)
                row_tags_collection.update_one(
                    {"_id": document["_id"]},
                    {"$set": {"data.$[elem].groupNames": groupNames}},
                    array_filters=[{"elem.row._id": rowId}]
                )
            else:
                raise Exception("Tag not found in the row")

            return {"data": "Tag deleted successfully"}

script = GoExecScriptDeleteRowTagDB(json_params_dict, id_)
script.start()