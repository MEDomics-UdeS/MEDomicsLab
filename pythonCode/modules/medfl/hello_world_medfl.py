from med_libs.GoExecutionScript import GoExecutionScript, parse_arguments
from med_libs.server_utils import go_print
import os
import json
import sys
from pathlib import Path
import time
sys.path.append(
    str(Path(os.path.dirname(os.path.abspath(__file__))).parent.parent))

json_params_dict, id_ = parse_arguments()
go_print("running hello_world_medfl.py:" + id_)


class GoExecScriptHelloWorldFromMEDfl(GoExecutionScript):
    """
        This class is used to execute a process from Go

        Args:
            json_params: The json params of the execution
            _id: The id of the execution
    """

    def __init__(self, json_params: dict, _id: str = None):
        super().__init__(json_params, _id)
        self.results = {"data": "nothing to return"}

    def _custom_process(self, json_config: dict) -> dict:
        """
        This function is the main script of the execution of the process from Go
        """
        string_received = json_config["stringFromFrontend"]
        self.results = {"data": "Backend received: " + string_received, "stringFromBackend":
                        "Hello World from MEDfl backend @ " + time.strftime("%Y-%m-%d %H:%M:%S", time.localtime()) + " !"}

        self.set_progress(label="Hello World is ready !", now=100)
        return self.results


helloWorldTest = GoExecScriptHelloWorldFromMEDfl(json_params_dict, id_)
helloWorldTest.start()
