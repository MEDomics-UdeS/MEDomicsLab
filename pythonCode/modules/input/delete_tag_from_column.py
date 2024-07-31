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

json_params_dict, id_ = parse_arguments()
go_print("running script.py:" + id_)



class GoExecScriptCreateTags(GoExecutionScript):
    """
        This class is used to execute the tags creation script

        Args:
            json_params: The input json params
            _id: The id of the page that made the request if any
    """

    def __init__(self, json_params: dict, _id: str = None):
        super().__init__(json_params, _id)
        self.results = {"data": "nothing to return"}

    def _custom_process(self, json_config: dict) -> dict:
        """
        This function is used to delete a tag from a column in MongoDB

        Args:
            json_config: The input json params
        """

        # Get the Data from the JsonToSend
        tag_to_delete = json_config["tagToDelete"]
        column_name = json_config["columnName"]
        tag_collection = json_config["tagCollection"]
        database_name = json_config["databaseName"]

        print("tag_to_delete", tag_to_delete)
        print("column_name", column_name)
        print("tag_collection", tag_collection)
        print("database_name", database_name)

        # Connect to the database and connect to the tag_collection
        client = MongoClient('localhost', 27017)
        db = client[database_name]
        tag_collection_to_work_with = db[tag_collection]
        
        # In tag_collection_to_work_with, look for the column_name, and if you do, delete the tag_to_delete from tags
        def delete_tag_from_column(tag_collection, column_name, tag_to_delete):
            for item in tag_collection.find({"column_name": column_name}):
                if 'tags' in item and tag_to_delete in item['tags']:
                    item['tags'].remove(tag_to_delete)
                    if not item['tags']:
                        tag_collection.delete_one({'_id': item['_id']})
                    else:
                        tag_collection.update_one({'_id': item['_id']}, {"$set": {'tags': item['tags']}})

            if tag_collection.count_documents({}) == 0:
                tag_collection.drop()
            else:
                print('Tag deleted from column.')
        
        delete_tag_from_column(tag_collection_to_work_with, column_name, tag_to_delete)
        
        return

script = GoExecScriptCreateTags(json_params_dict, id_)
script.start()
