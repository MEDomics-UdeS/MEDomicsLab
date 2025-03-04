import json
import os
import sys
from pathlib import Path

sys.path.append(
    str(Path(os.path.dirname(os.path.abspath(__file__))).parent.parent))
from med_libs.GoExecutionScript import GoExecutionScript, parse_arguments
from med_libs.server_utils import go_print
from med_libs.mongodb_utils import connect_to_mongo

# Parse arguments
json_params_dict, id_ = parse_arguments()
go_print("running script.py:" + id_)

class GoExecScriptAppend(GoExecutionScript):
    """
    This class appends data to an existing MongoDB collection.

    Args:
        json_params: Input JSON parameters
        _id: Request ID (optional)
    """

    def __init__(self, json_params: dict, _id: str = None):
        super().__init__(json_params, _id)
        self.results = {"status": "error", "message": "Process not completed."}  # Default error response

    def _custom_process(self, json_config: dict) -> dict:
        """
        Appends new data to the specified collection.

        Args:
            json_config: Input JSON parameters
        """
        go_print("Received JSON Config:")
        go_print(json.dumps(json_config, indent=4))  # Log input JSON

        # Extract data from the JSON config
        collection_name = json_config["collectionName"]
        new_data = json_config["data"]

        # Connect to MongoDB
        db = connect_to_mongo()
        collection = db[collection_name]

        # Append data while avoiding duplicates (_id conflicts)
        go_print(f"Appending data to collection: {collection_name}")
        for record in new_data:
            if "_id" in record:
                collection.update_one(
                    {"_id": record["_id"]},
                    {"$set": record},
                    upsert=True  # Create a new document if no match is found
                )

        # Set the response result
        self.results = {"status": "success", "message": "Data appended successfully."}
        go_print(f"Final results: {json.dumps(self.results)}")  # Log final results

        return self.results


if __name__ == "__main__":
    script = GoExecScriptAppend(json_params_dict, id_)
    script.start()  # Start the process and execute `_custom_process`