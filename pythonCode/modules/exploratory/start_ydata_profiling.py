import os
import json
from ydata_profiling import ProfileReport
import pandas as pd
import sys
import pymongo

from pathlib import Path
sys.path.append(
    str(Path(os.path.dirname(os.path.abspath(__file__))).parent.parent))
from med_libs.server_utils import go_print
from med_libs.GoExecutionScript import GoExecutionScript, parse_arguments

json_params_dict, id_ = parse_arguments()
go_print("running script.py:" + id_)


class StartYDataProfiling(GoExecutionScript):
    """
        This class is used to execute a process from Go

        Args:
            json_params: The input json params
            _id: The id of the page that made the request if any
    """

    def __init__(self, json_params: dict, _id: str = None):
        super().__init__(json_params, _id)
        self.results = {"data": "nothing to return"}
        self._progress["type"] = "process"

    def _custom_process(self, json_config: dict) -> dict:
        """
        This function is the main script of the execution of the process from Go
        """
        go_print(json.dumps(json_config, indent=4))

        # MongoDB setup
        mongo_client = pymongo.MongoClient("mongodb://localhost:54017/")
        database = mongo_client["data"]
        collection1 = database[json_config["mainDataset"]["id"]]

        # Set first collection as pandas dataframe and calculate report
        self.set_progress(label="Loading dataset", now=20)
        collection1_data = collection1.find({}, {'_id': False})
        collection1_df = pd.DataFrame(list(collection1_data))
        collection1_name = json_config["mainDataset"]['name'].split(".")[0].capitalize()
        self.set_progress(label="Calculating report", now=35)
        collection1_report = ProfileReport(collection1_df, title=collection1_name, minimal=True)
        final_report = collection1_report

        # Set second collection as pandas dataframe and calculate report
        if json_config["compDataset"] != "":
            self.set_progress(label="Loading dataset", now=50)
            collection2 = database[json_config["compDataset"]["id"]]
            collection2_data = collection2.find({}, {'_id': False})
            collection2_df = pd.DataFrame(list(collection2_data))
            collection2_name = json_config["compDataset"]['name'].split(".")[0].capitalize()
            self.set_progress(label="Calculating report", now=60)
            collection2_report = ProfileReport(collection2_df, title=collection2_name, minimal=True)
            self.set_progress(label="Comparing reports", now=75)
            final_report = collection1_report.compare(collection2_report)

        # Save results
        self.set_progress(label="Saving report", now=90)
        if not os.path.exists(os.path.dirname(json_config['savingPath'])):
            os.makedirs(os.path.dirname(json_config['savingPath']))
        final_report.to_file(json_config['savingPath'])
        self.results["savingPath"] = json_config['savingPath']
        self.set_progress(label="Done!", now=100)

        # Get results
        return self.results


script = StartYDataProfiling(json_params_dict, id_)
script.start()
