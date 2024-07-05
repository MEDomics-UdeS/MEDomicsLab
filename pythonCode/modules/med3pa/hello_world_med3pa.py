import os
import json
import sys
from pathlib import Path
import time
sys.path.append(
    str(Path(os.path.dirname(os.path.abspath(__file__))).parent.parent))
from med_libs.server_utils import go_print
from med_libs.GoExecutionScript import GoExecutionScript, parse_arguments

json_params_dict, id_ = parse_arguments()
go_print("running hello_world_med3pa.py:" + id_)


class GoExecScriptHelloWorldFromMED3pa(GoExecutionScript):
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
        
        self.results = {
        "json_config": json_config,
        "data": "Backend received Information",
        "path": ['det3pa_config1','med3pa_config2','detectron_config3','med3pa_config4'],
        "stringFromBackend": "Hello World from med3pa backend @ " + time.strftime("%Y-%m-%d %H:%M:%S", time.localtime()) + " !"
        }
        
        go_print("RECEIVED RESULTS:" + str(json_config))
        self.set_progress(label="Hello World is ready !", now=100)
        return self.results


helloWorldTest = GoExecScriptHelloWorldFromMED3pa(json_params_dict, id_)
helloWorldTest.start()
