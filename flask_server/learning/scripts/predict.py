import os
import sys
from pathlib import Path
import json

import pandas as pd

sys.path.append(
    str(Path(os.path.dirname(os.path.abspath(__file__))).parent.parent))

from utils.server_utils import go_print, get_model_from_medmodel
from utils.GoExecutionScript import GoExecutionScript, parse_arguments

json_params_dict, id_ = parse_arguments()
go_print("running script.py:" + id_)


class GoExecScriptPredict(GoExecutionScript):
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
            This function predicts from a model, a dataset, and a new dataset
        """
        go_print(json.dumps(json_config, indent=4))
        model_infos = json_config['model']
        data = json_config['data']
        model = get_model_from_medmodel(model_infos['path'])
        data_df = pd.DataFrame(data)
        y_pred = model.predict(data_df)
        self.results = {"prediction": str(y_pred[0])}
        return self.results


script = GoExecScriptPredict(json_params_dict, id_)
script.start()
