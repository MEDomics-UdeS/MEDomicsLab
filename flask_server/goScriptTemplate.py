import os
import sys
from pathlib import Path
import json

sys.path.append(
    str(Path(os.path.dirname(os.path.abspath(__file__))).parent.parent))

from utils.server_utils import go_print
from utils.GoExecutionScript import GoExecutionScript, parse_arguments

json_params_dict, id_ = parse_arguments()
go_print("running script.py:" + id_)


class GoExecScriptCustom(GoExecutionScript):
    """
        This class is used to execute a process from Go

        Args:
            json_params: The input json params
            _id: The id of the page that made the request if any
    """

    def __init__(self, json_params: dict, _id: str = None):
        super().__init__(json_params, _id)
        self.results = {"data": "nothing to return"}

    def _custom_process(self, json_config: dict) -> dict:
        """
        TODO: add your doc here
        """
        go_print(json.dumps(json_config, indent=4))
        # TODO: add your code here
        return self.results


script = GoExecScriptCustom(json_params_dict, id_)
script.start()
