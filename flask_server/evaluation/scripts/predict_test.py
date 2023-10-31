import os
import sys
from pathlib import Path
import json
from pycaret.classification.oop import ClassificationExperiment
from pycaret.regression.oop import RegressionExperiment

sys.path.append(
    str(Path(os.path.dirname(os.path.abspath(__file__))).parent.parent))

from utils.server_utils import go_print, get_model_from_medmodel, load_csv
from utils.GoExecutionScript import GoExecutionScript, parse_arguments

json_params_dict, id_ = parse_arguments()
go_print("running predict_test.py:" + id_)


class GoExecScriptPredictTest(GoExecutionScript):
    """
        This class is used to execute a process from Go

        Args:
            json_params: The json params of the execution
            _id: The id of the execution
    """

    def __init__(self, json_params: dict, _id: str = None):
        super().__init__(json_params, _id)
        self.results = {"data": "nothing to return"}
        self._progress["type"] = "process"


    def _custom_process(self, json_config: dict) -> dict:
        go_print(json.dumps(json_config, indent=4))
        model_infos = json_config['model']
        medmodel_path = model_infos['path']
        dataset_infos = json_config['dataset']
        dataset_path = dataset_infos['path']
        self.set_progress(label="Loading the model", now=10)
        model = get_model_from_medmodel(medmodel_path)
        self.set_progress(label="Loading the dataset", now=20)
        dataset = load_csv(dataset_path, model_infos['columns']['target'])

        # caluclate the predictions
        self.set_progress(label="Setting up the experiment", now=30)
        exp = ClassificationExperiment()
        self.set_progress(label="Setting up the experiment", now=40)
        exp.setup(data=dataset, target=model_infos['columns']['target'])
        self.set_progress(label="Predicting...", now=50)
        pred_unseen = exp.predict_model(model, data=dataset)
        self.results = {"data": pred_unseen.to_dict(orient='records')}
        self.set_progress(label="Predicting...", now=50)
        return self.results


predictTest = GoExecScriptPredictTest(json_params_dict, id_)
predictTest.start()
