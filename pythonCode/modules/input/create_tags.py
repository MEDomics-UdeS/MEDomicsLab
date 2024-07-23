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
        This function is used to assign the tags to the right columns in MongoDB

        Args:
            json_config: The input json params
        """
        # Logic here
        # ...
        
        return
       
        

script = GoExecScriptCreateTags(json_params_dict, id_)
script.start()
