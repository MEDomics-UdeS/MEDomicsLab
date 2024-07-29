import os
import json
import uuid
from pycaret.classification.oop import ClassificationExperiment
from pycaret.regression.oop import RegressionExperiment
import sys
from pathlib import Path
sys.path.append(
    str(Path(os.path.dirname(os.path.abspath(__file__))).parent.parent))
from med_libs.server_utils import go_print
from med_libs.GoExecutionScript import GoExecutionScript, parse_arguments
from med_libs.mongodb_utils import get_child_id_by_name, connect_to_mongo, get_pickled_model_from_collection, get_dataset_as_pd_df, insert_med_data_object_if_not_exists, overwrite_med_data_object_content
from med_libs.MEDDataObject import MEDDataObject

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
        """
        This function is the main script of the execution of the process from Go
        """
        go_print(json.dumps(json_config, indent=4))

        # Initialize data and load model
        db = connect_to_mongo()
        model_infos = json_config['model']
        model_metadata_id = get_child_id_by_name(model_infos['id'], 'metadata.json')
        model_metadata = dict(db[model_metadata_id].find_one({}))
        dataset_infos = json_config['dataset']
        ml_type = model_metadata['ml_type']
        self.set_progress(label="Loading the model", now=10)
        pickle_object_id = get_child_id_by_name(model_infos['id'], "model.pkl")
        model = get_pickled_model_from_collection(pickle_object_id)
        go_print(f"model loaded: {model}") 

        
        columns_to_keep = None
        # if model.__class__.__name__ != 'LGBMClassifier':
            # Get the feature names from the model
        if dir(model).__contains__('feature_names_in_'):
            columns_to_keep = model.__getattribute__('feature_names_in_').tolist()
        
        if dir(model).__contains__('feature_name_') and columns_to_keep is None:
            columns_to_keep = model.__getattribute__('feature_name_')
    
        
        self.set_progress(label="Loading the dataset", now=20)
        use_med_standard = json_config['useMedStandard']
        """ if use_med_standard:
            dataset = load_med_standard_data(dataset_infos['selectedDatasets'], model_infos['metadata']['selectedTags'], model_infos['metadata']['selectedVariables'], model_infos['metadata']['target'])
        else:
            dataset = load_csv(dataset_infos['path'], model_infos['metadata']['target']) """
        dataset = get_dataset_as_pd_df(dataset_infos['id'])

        if columns_to_keep is not None:
            # Add the target to the columns to keep if it's not already there
            if model_metadata['target'] not in columns_to_keep:
                columns_to_keep.append(model_metadata['target'])
            dataset = dataset[columns_to_keep]

        # calculate the predictions
        self.set_progress(label="Setting up the experiment", now=30)
        exp = None
        if ml_type == 'regression':
            exp = RegressionExperiment()
        elif ml_type == 'classification':
            exp = ClassificationExperiment()
        self.set_progress(label="Setting up the experiment", now=50)
        exp.setup(data=dataset, target=model_metadata['target'])
        self.set_progress(label="Predicting...", now=70)
        pred_unseen = exp.predict_model(model, data=dataset)
        
        # Save predictions
        prediction_object = MEDDataObject(id=str(uuid.uuid4()),
                    name = "predictions.csv",
                    type = "csv",
                    parentID = json_config["pageId"],
                    childrenIDs = [],
                    inWorkspace = False)
        prediction_med_object_id = insert_med_data_object_if_not_exists(prediction_object, pred_unseen.to_dict(orient="records"))
        # If the prediction already exists we update the content
        if prediction_med_object_id != prediction_object.id:
            overwrite_med_data_object_content(prediction_med_object_id, pred_unseen.to_dict(orient="records"))
        self.results = {"collection_id": prediction_med_object_id}
        self.set_progress(label="Compiling results ...", now=80)
        return self.results


predictTest = GoExecScriptPredictTest(json_params_dict, id_)
predictTest.start()
