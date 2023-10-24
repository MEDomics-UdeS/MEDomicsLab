
from utils.server_utils import go_print
from utils.GoExecutionScript import GoExecutionScript
import argparse
import pickle
import os
import sys
from pathlib import Path
import json
sys.path.append(
    str(Path(os.path.dirname(os.path.abspath(__file__))).parent.parent))

USE_RAM_FOR_EXPERIMENTS_STORING = 1
USE_SAVE_FOR_EXPERIMENTS_STORING = 0

parser = argparse.ArgumentParser()
parser.add_argument('--json-param', type=str, default='.')
args = parser.parse_args()
json_param_str = args.json_param


class GoExecScriptCreateDashboard(GoExecutionScript):
    """
        This class is used to run the pipeline execution of pycaret
    """

    def __init__(self, json_params: str, process_fn: callable = None, isProgress: bool = False):
        super().__init__(json_params, process_fn, isProgress)

    def _custom_process(self, json_config: dict) -> dict:
        go_print(json.dumps(json_config, indent=4))
        scene_id = json_config['pageId']

        return results_pipeline


create_dashboard = GoExecScriptCreateDashboard(json_param_str)
create_dashboard.start()
