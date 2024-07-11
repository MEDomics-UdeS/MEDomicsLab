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

def filter_important_params(models_structure, important_params_dict):
    """
    Filters the given models' params structure to keep only the important parameters.

    Args:
    - models_structure (dict): The input dictionary containing models and their params/grid_params.
    - important_params_dict (dict): Dictionary with model names as keys and lists of important parameter names as values.

    Returns:
    - dict: A filtered dictionary with only the important parameters for each model.
    """
    filtered_structure = {}
    
    for model, param_data in models_structure.items():
        if model in important_params_dict:
            important_params = important_params_dict[model]
            filtered_structure[model] = {'params': [], 'grid_params': []}
            
            for param in param_data['params']:
                if param['name'] in important_params:
                    filtered_structure[model]['params'].append(param)
            
            for grid_param in param_data['grid_params']:
                if grid_param['name'] in important_params:
                    filtered_structure[model]['grid_params'].append(grid_param)
    
    return filtered_structure

important_params_ipc = {
    'RandomForestRegressor': ['n_estimators', 'max_depth', 'min_samples_leaf'],
}

important_params_apc = {
    'DecisionTreeRegressor': ['max_depth', 'min_samples_leaf'],
}
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
        filtered_ipc_params = filter_important_params(IPCModel.supported_models_params(), important_params_ipc)
        filtered_apc_params = filter_important_params(APCModel.supported_models_params(), important_params_apc)
        
        self.results = {
        "uncertainty_metrics": UncertaintyCalculator.supported_metrics(),
        "detetron_strategies":DetectronResult.get_supported_strategies(),
        "ipc_models":filtered_ipc_params,
        "apc_models":filtered_apc_params
        }
        
        go_print("RECEIVED RESULTS:" + str(self.results))
        self.set_progress(label="Hello World is ready !", now=100)
        return self.results


helloWorldTest = GoExecScriptParamsFromMed3pa(json_params_dict, id_)
helloWorldTest.start()