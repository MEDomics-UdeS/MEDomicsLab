import os
import sys
from pathlib import Path

sys.path.append(
    str(Path(os.path.dirname(os.path.abspath(__file__))).parent.parent))
from bson import ObjectId
from med_libs.GoExecutionScript import GoExecutionScript, parse_arguments
from med_libs.mongodb_utils import connect_to_mongo
from med_libs.server_utils import go_print

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
        data_query = json_config["query"]
        sort_query = json_config["sortCriteria"]

        print("Starting creating group DB script")

        # Connect to MongoDB
        db = connect_to_mongo()

        # Get data from the collection
        collection = db[collectionName]
        data = None
        if data_query:
            data = list(collection.find(data_query) if not sort_query else collection.find(data_query).sort(sort_query))
        else:
            data = list(collection.find() if not sort_query else collection.find().sort(sort_query))
        if not data:
            raise Exception("No data found in the collection")

        # Create or get the 'row_tags' collection
        list_collections = db.list_collection_names()
        if "row_tags" not in list_collections:
            row_tags_collection = db.create_collection("row_tags")
        row_tags_collection = db["row_tags"]


        # Create a document to hold the group information
        group_document = {
            "collectionName": collectionName,
            "data": [{"row": row, "groupNames": [groupName]} for row in data]  # Store groupName as a list
        }

        # Check if a document for this collectionName already exists
        existing_document = row_tags_collection.find_one({"collectionName": collectionName})
        existings_rows = []
        if existing_document:
            # Retrieve existing rows
            for new_entry in existing_document["data"]:
                if '_id' in new_entry["row"]:
                    new_entry["row"]["_id"] = str(new_entry["row"]["_id"])
                existings_rows.append(new_entry["row"])
            
            # Update existing documents
            for new_entry in group_document["data"]:
                if '_id' in new_entry["row"]:
                    new_entry["row"]["_id"] = str(new_entry["row"]["_id"])
                # Check if the row already exists
                if new_entry["row"] in existings_rows:
                    existing_row = next((item for item in existing_document["data"] if item["row"] == new_entry["row"]), None)
                    if existing_row is None:
                        raise Exception("Row not found in the DB")
                    # If so, add the new group name to the list
                    existing_group_names = existing_row.get("groupNames", [])
                    # Only add the group name if it's not already present
                    if groupName not in existing_group_names:
                        existing_group_names.append(groupName)
                    else:
                        continue
                    # Update the existing document
                    if '_id' in new_entry["row"] and type(new_entry["row"]["_id"]) == str:
                        new_entry["row"]["_id"] = ObjectId(new_entry["row"]["_id"])
                    result = row_tags_collection.update_one(
                        {"collectionName": collectionName, "data.row": new_entry["row"]},
                        {"$set": {"data.$.groupNames": existing_group_names}}
                    )
                    if result.matched_count <= 0:
                        raise Exception("Failed to update the group name")
                else:
                    if '_id' in new_entry["row"] and type(new_entry["row"]["_id"]) == str:
                        new_entry["row"]["_id"] = ObjectId(new_entry["row"]["_id"])
                    # If the row does not exist, insert it as a new entry
                    result = row_tags_collection.update_one(
                        {"collectionName": collectionName},
                        {"$addToSet": {"data": new_entry}}  # Use $addToSet to avoid duplicates
                    )
                    if result.modified_count <= 0:
                        raise Exception("Failed to insert the new row")
        else:
            # Insert the new document
            row_tags_collection.insert_one(group_document)
            return {"data": f"Created new group '{groupName}' for collection '{collectionName}'."}

        return {"data": f"Updated group '{groupName}' for collection '{collectionName}'."}


script = GoExecScriptCreateGroupDB(json_params_dict, id_)
script.start()
