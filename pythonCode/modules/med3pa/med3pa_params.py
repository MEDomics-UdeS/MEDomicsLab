import os
import json
import sys
from pathlib import Path
import time
sys.path.append(
    str(Path(os.path.dirname(os.path.abspath(__file__))).parent.parent))
from med_libs.server_utils import go_print
from med_libs.GoExecutionScript import GoExecutionScript, parse_arguments

from MED3pa.med3pa import UncertaintyCalculator, IPCModel, APCModel
from MED3pa.detectron import DetectronResult

json_params_dict, id_ = parse_arguments()
go_print("running send_params_med3pa.py:" + id_)


class GoExecScriptParamsFromMed3pa(GoExecutionScript):
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
        "uncertainty_metrics": UncertaintyCalculator.supported_metrics(),
        "detetron_strategies":DetectronResult.get_supported_strategies(),
        "ipc_models":IPCModel.supported_models_params(),
        "apc_models":APCModel.supported_models_params()
        }
        
        go_print("RECEIVED RESULTS:" + str(self.results))
        self.set_progress(label="Hello World is ready !", now=100)
        return self.results


helloWorldTest = GoExecScriptParamsFromMed3pa(json_params_dict, id_)
helloWorldTest.start()
