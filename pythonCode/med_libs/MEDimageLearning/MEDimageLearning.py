import os
import pprint
import shutil
import sys
from copy import deepcopy
from pathlib import Path

import pandas as pd
from numpyencoder import NumpyEncoder

MODULE_DIR = str(Path(os.path.dirname(os.path.abspath(__file__))).parent / 'submodules' / 'MEDimage')
sys.path.append(MODULE_DIR)
path = r"C:\Users\mehdi\Desktop\MEDomicsLab\MEDomicsLab\flask_server\submodules\MEDimage"
SUBMODULE_DIR = str(Path(os.path.dirname(os.path.abspath(__file__))).parent.parent)
sys.path.append(SUBMODULE_DIR)

pp = pprint.PrettyPrinter(width=1)  # allow pretty print of datatypes in console

import MEDimage

import utils


class MEDimageLearning:
    def __init__(self, json_config: dict) -> None:
        self.json_config = json_config
        self._progress = {'currentLabel': '', 'now': 0.0}
    
    def __round_dict(self, dict, decimals):
        for key, value in dict.items():
            if (type(value) is list):
                dict[key] = [round(x, decimals) for x in value]
            else:
                dict[key] = round(value, decimals)

        return dict
    
    def generate_all_pips(self, id: str, node_content, pip, json_scene, pips, counter):
        # -------------------------------------------------- NODE ADD ---------------------------------------------------
        pip.append(id)  # Current node added to pip

        # ---------------------------------------------- NEXT NODES COMPUTE ----------------------------------------------
        # NO OUPUT CONNECTION
        if not "output_1" in node_content["outputs"]:  # if no ouput connection
            print(node_content["name"])
            pips.append(deepcopy(pip))  # Add the current pip to pips
            return pip

        # ONE OUPUT CONNECTION
        elif len(node_content["outputs"]["output_1"]["connections"]) == 1:
            out_node_id = node_content["outputs"]["output_1"]["connections"][0]["node"]
            out_node_content = utils.get_node_content(out_node_id, json_scene)
            print(out_node_content["name"])
            pip = self.generate_all_pips(out_node_id, out_node_content, pip, json_scene, pips, counter)

        # MORE ONE OUPUT CONNECTION
        else:
            connections = node_content["outputs"]["output_1"]["connections"]  # output connections of last node added to pip
            for connection in connections:
                pip_copy = deepcopy(pip)  # Copy the current pip
                out_node_id = connection["node"]  # Retrieve all nodes connected to the current node output
                out_node_content = utils.get_node_content(out_node_id, json_scene)  # Retrieve all nodes content
                print(out_node_content["name"])
                pip_copy = self.generate_all_pips(out_node_id, out_node_content, pip_copy, json_scene, pips, counter)

        return pip
    
    def execute_pips(self, pips, json_scene):
        # Init RUNS dict for store instances and logs (xxx_obj)
        pips_obj = {}

        # Init results dict for result response (xxx_res)
        pips_res = {}
        scan_res = {}
        filename_loaded = ""
        results_avg = []
        analysis_dict = {}
        splitted_data = False

        # ------------------------------------------ PIP EXECUTION ------------------------------------------
        for pip_idx, pip in enumerate(pips):

            pip_name = "pipeline" + str(pip_idx+1)

            print("\n\n!!!!!!!!!!!!!!!!!! New pipeline execution !!!!!!!!!!!!!!!!!! \n --> Pip : ", pip)

            # Init object and variables for new pipeline
            pip_obj = {}
            pip_name_obj = ""
            pip_res = {}
            pip_name_res = "pip"
            holdout_test = False
            cleaned_data = False
            normalized_features = False
            reduced_features = False
            designed_experiment = False
            loaded_data = False
            split_counter = 0
            saved_results = False
            
            # ------------------------------------------ NODE EXECUTION ------------------------------------------
            while True:
                for node in pip:
                    content = utils.get_node_content(node, json_scene)
                    print("\n\n\n///////////////// CURRENT NODE :", content["name"], "-", node, " /////////////////")

                    # Update RUNS dict for store instances and logs (xxx_obj)
                    update_pip = False
                    pip_name_obj += node
                    id_obj = {}
                    output_obj = {}
                    id_obj["type"] = content["name"]
                    id_obj["settings"] = content["data"]

                    # Update results dict for result response (xxx_res)
                    pip_name_res += "/" + node

                    # ------------------------------------------ HOME ------------------------------------------
                    # Split
                    if (content["name"].lower() == "split"):
                        print("\n********SPLIT execution********")
                        try:
                            if not splitted_data:
                                learning_progress = 0
                                # Retrieve data from json request
                                if "path_outcome_file" in content["data"].keys() and content["data"]["path_outcome_file"] != "":
                                    path_outcome_file = Path(content["data"]["path_outcome_file"])
                                else:
                                    return {"error": "Split: Path to outcome file is not given!"}
                                if "path_save_experiments" in content["data"].keys() and content["data"]["path_save_experiments"] != "":
                                    path_save_experiments = Path(content["data"]["path_save_experiments"])
                                if "outcome_name" in content["data"].keys() and content["data"]["outcome_name"] != "":
                                    outcome_name = content["data"]["outcome_name"]
                                else:
                                    return {"error":  "Split: Outcome name is not given!"}
                                if "method" in content["data"].keys() and content["data"]["method"] != "":
                                    method = content["data"]["method"]
                                else:
                                    return {"error":  "Split: Method is not given!"}
                                if method == "all_learn":
                                    holdout_test = False
                                else:
                                    holdout_test = True

                                # Generate the machine learning experiment
                                path_study, _ = MEDimage.learning.ml_utils.create_holdout_set(
                                    path_outcome_file=path_outcome_file,
                                    path_save_experiments=path_save_experiments,
                                    outcome_name=outcome_name,
                                    method=method
                                )
                            splitted_data = True
                        except Exception as e:
                            return {"error": str(e)}

                    # Design
                    if (content["name"].lower() == "design"):
                        print("\n********DESIGN execution********")
                        try:
                            if not designed_experiment:
                                # Initialization
                                path_settings = Path.cwd() / "flask_server" / "learning_MEDimage" / "settings"
                                desing_settings = {}

                                # Retrieve data from json request
                                if splitted_data and path_study is None:
                                    if "path_study" in content["data"].keys() and content["data"]["path_study"] != "":
                                        path_study = Path(content["data"]["path_study"])
                                    else:
                                        return {"error":  "Desing: Path to study is not given!"}
                                if "expName" in content["data"].keys() and content["data"]["expName"] != "":
                                    experiment_label = content["data"]["expName"]
                                else:
                                    return {"error":  "Desing: Experiment label is not given!"}
                                
                                # Fill design settings
                                desing_settings['design'] = content["data"]
                                method_desing = desing_settings['design']['testSets'][0]
                                nb_split = desing_settings['design'][method_desing]['nSplits'] if 'nSplits' in desing_settings['design'][method_desing].keys() else 10

                                # Initialize the DesignExperiment class
                                experiment = MEDimage.learning.DesignExperiment(path_study, path_settings, experiment_label)

                                # Generate the machine learning experiment
                                tests_dict = experiment.create_experiment(desing_settings)

                                paths_splits = []
                                for run in tests_dict.keys():
                                    paths_splits.append(tests_dict[run])
                                
                                # Set up the split counter
                                split_counter = 0
                                designed_experiment = True
                                learning_progress += 1
                        except Exception as e:
                            return {"error": str(e)}

                    # Model training/testing part
                    if designed_experiment:            
                        # Data
                        if (content["name"].lower() == "data"):
                            print("\n********DATA execution********")
                            try:
                                if not designed_experiment:
                                    return {"error":  "Data: Experiment must be designed first! Re-organize nodes."}
                                
                                # --> A. Initialization phase
                                learner = MEDimage.learning.RadiomicsLearner(path_study=path_study, path_settings=Path.cwd(), experiment_label=experiment_label)

                                # Load the test dictionary and machine learning information
                                path_ml = paths_splits[split_counter]
                                ml_dict_paths = MEDimage.utils.load_json(path_ml)      # Test information dictionary

                                # Machine learning information dictionary
                                ml_info_dict = dict()

                                # Training and test patients
                                ml_info_dict['patientsTrain'] = MEDimage.utils.load_json(ml_dict_paths['patientsTrain'])
                                ml_info_dict['patientsTest'] = MEDimage.utils.load_json(ml_dict_paths['patientsTest'])

                                # Outcome table for training and test patients
                                outcome_table = pd.read_csv(ml_dict_paths['outcomes'], index_col=0)
                                ml_info_dict['outcome_table_binary'] = outcome_table.iloc[:, [0]]
                                if outcome_table.shape[1] == 2:
                                    ml_info_dict['outcome_table_time'] = outcome_table.iloc[:, [1]]
                                
                                # Machine learning dictionary
                                ml_info_dict['path_results'] = ml_dict_paths['results']
                                del outcome_table

                                # Machine learning assets
                                patients_train = ml_info_dict['patientsTrain']
                                patients_test = ml_info_dict['patientsTest']
                                patients_holdout = MEDimage.utils.load_json(path_study / 'patientsHoldOut.json') if holdout_test else None
                                outcome_table_binary = ml_info_dict['outcome_table_binary']
                                path_results = ml_info_dict['path_results']
                                patient_ids = list(outcome_table_binary.index)
                                outcome_table_binary_training = outcome_table_binary.loc[patients_train]
                                flags_preprocessing = []
                                flags_preprocessing_test = []
                                rad_tables_learning = list()

                                # --> B. Pre-processing phase
                                # B.1. Pre-processing initialization, settings tables paths
                                rad_var_struct = dict()

                                # For each variable, organize the option in the ML dictionary
                                if "nameType" in content["data"].keys() and content["data"]["nameType"] != "":
                                    name_type = content["data"]["nameType"]
                                else:
                                    name_type = "radiomics"
                                # Radiomics variables
                                if 'radiomics' in name_type.lower():
                                    # Get radiomics features folder
                                    if "path" in content["data"].keys() and content["data"]["path"] != "":
                                        path_features = Path(content["data"]["path"])
                                    else:
                                        return {"error":  "Data: Path to radiomics features is not given!"}
                                    if "featuresFiles" in content["data"].keys() and content["data"]["featuresFiles"] != "":
                                        features_files = content["data"]["featuresFiles"]
                                        for file in features_files:
                                            if not file.endswith('.csv'):
                                                return {"error":  "Data node: Only csv files are supported!"}
                                    else:
                                        return {"error":  "Data node: No features files were selected!"}
                                    
                                    # Initialize dict to hold all paths to radiomics features (csv and txt files)
                                    path = dict() 
                                    for idx, feature_file in enumerate(features_files):
                                        rad_tab_x = {}
                                        name_tab = 'radTab' + str(idx+1)
                                        rad_tab_x['csv'] = Path(path_features / feature_file)
                                        rad_tab_x['txt'] = Path(path_features / (feature_file.split('.')[0] + '.txt'))
                                        rad_tab_x['type'] = feature_file.split('__')[1].split('_')[0] if '__' in feature_file else 'None'

                                        # check if file exist
                                        if not rad_tab_x['csv'].exists():
                                            raise FileNotFoundError(f"File {rad_tab_x['csv']} does not exist.")
                                        if not rad_tab_x['txt'].exists():
                                            raise FileNotFoundError(f"File {rad_tab_x['txt']} does not exist.")
                                        
                                        path[name_tab] = rad_tab_x
                                        
                                        # Add path to ml dict for the current variable
                                        rad_var_struct['path'] = path
                                    
                                    # Update
                                    loaded_data = True
                                # Clinical or other variables (For ex: Volume)
                                else:
                                    return {"error":  "Variable type not implemented yet, only Radiomics variables are supported!"}
                                learning_progress += 1
                            except Exception as e:
                                return {"error": str(e)}

                        # Cleaning
                        if (content["name"].lower() == "cleaning"):
                            try:
                                if not loaded_data:
                                    return {"error":  "Cleaning: Data must be loaded first! Use Data node."}
                                if path_study is None:
                                    return {"error":  "Cleaning: Path to study is not given!"}
                                if experiment_label is None:
                                    return {"error":  "Cleaning: Experiment label is not given!"}

                                # Pre-processing
                                for item in rad_var_struct['path'].values():
                                    # Loading the table
                                    path_radiomics_csv = item['csv']
                                    path_radiomics_txt = item['txt']
                                    image_type = item['type']
                                    rad_table_learning = MEDimage.learning.ml_utils.get_radiomics_table(path_radiomics_csv, path_radiomics_txt, image_type, patient_ids)

                                    # Avoid future bugs (caused in Windows)
                                    if type(rad_table_learning.Properties['Description']) not in [str, Path]:
                                        rad_table_learning.Properties['Description'] = str(rad_table_learning.Properties['Description'])

                                    # Data cleaning
                                    data_cln_method = list(content["data"].keys())[0]
                                    cleaning_dict = content['data'][data_cln_method]['feature']['continuous']
                                    data_cleaner = MEDimage.learning.DataCleaner(rad_table_learning)
                                    rad_table_learning = data_cleaner(cleaning_dict)
                                    if rad_table_learning is None:
                                        continue
                                    rad_tables_learning.append(rad_table_learning)
                                
                                # Finalization steps
                                flags_preprocessing.append("var_datacleaning")
                                flags_preprocessing_test.append("var_datacleaning")
                                cleaned_data = True
                                learning_progress += 1
                            except Exception as e:
                                return {"error": str(e)}
                        
                        if (content["name"].lower() == "normalization"):
                            try:
                                if not loaded_data:
                                    return {"error":  "Cleaning: Data must be loaded first! Use Data node."}
                                if "method" in content["data"].keys() and content["data"]["method"] != "":
                                    normalization_method = content["data"]["method"]
                                else:
                                    normalization_method = ""
                                
                                # If there was no cleaning step, the data must be loaded
                                if not cleaned_data:
                                    for item in rad_var_struct['path'].values():
                                        # Loading the table
                                        path_radiomics_csv = item['csv']
                                        path_radiomics_txt = item['txt']
                                        image_type = item['type']
                                        rad_table_learning = MEDimage.learning.ml_utils.get_radiomics_table(path_radiomics_csv, path_radiomics_txt, image_type, patient_ids)
                                        rad_tables_learning.append(rad_table_learning)

                                # Start features normalization for each table
                                for rad_table_learning in rad_tables_learning:
                                    # Some information must be stored to re-apply combat for testing data
                                    if 'combat' in normalization_method.lower():
                                        # Training data
                                        rad_table_learning.Properties['userData']['normalization'] = dict()
                                        rad_table_learning.Properties['userData']['normalization']['original_data'] = dict()
                                        rad_table_learning.Properties['userData']['normalization']['original_data']['path_radiomics_csv'] = str(path_radiomics_csv)
                                        rad_table_learning.Properties['userData']['normalization']['original_data']['path_radiomics_txt'] = str(path_radiomics_txt)
                                        rad_table_learning.Properties['userData']['normalization']['original_data']['image_type'] = str(image_type)
                                        rad_table_learning.Properties['userData']['normalization']['original_data']['patient_ids'] = patient_ids
                                        if cleaned_data:
                                            data_cln_method = data_cln_method
                                            rad_table_learning.Properties['userData']['normalization']['original_data']['datacleaning_method'] = data_cln_method
                                        
                                        # Apply ComBat
                                        normalization = MEDimage.learning.Normalization('combat')
                                        rad_table_learning = normalization.apply_combat(variable_table=rad_table_learning)  # Training data
                                    else:
                                        return {"error":  f"Normalization: method {normalization_method} not implemented yet!"}
                                    
                                normalized_features = True
                                learning_progress += 1
                            except Exception as e:
                                return {"error": str(e)}

                        if (content["name"].lower() == "feature_reduction"):
                            # Load data if cleaning step or normalization step was not performed
                            try:
                                if not loaded_data:
                                    return {"error":  "Cleaning: Data must be loaded first! Use Data node."}
                                if not cleaned_data and not normalized_features:
                                    for item in rad_var_struct['path'].values():
                                        # Loading the table
                                        path_radiomics_csv = item['csv']
                                        path_radiomics_txt = item['txt']
                                        image_type = item['type']
                                        rad_table_learning = MEDimage.learning.ml_utils.get_radiomics_table(path_radiomics_csv, path_radiomics_txt, image_type, patient_ids)
                                        rad_tables_learning.append(rad_table_learning)

                                # Seperate training and testing data before feature set reduction
                                rad_tables_testing = deepcopy(rad_tables_learning)
                                rad_tables_training = []
                                for rad_tab in rad_tables_learning:
                                    patients_ids = MEDimage.learning.ml_utils.intersect(patients_train, list(rad_tab.index))
                                    rad_tables_training.append(deepcopy(rad_tab.loc[patients_ids]))

                                # Deepcopy properties
                                temp_properties = list()
                                for rad_tab in rad_tables_testing:
                                    temp_properties.append(deepcopy(rad_tab.Properties))
                                
                                # Feature set reduction
                                if "method" in content["data"].keys() and content["data"]["method"] != "":
                                    f_set_reduction_method = content["data"]["method"]
                                else:
                                    f_set_reduction_method = "FDA"

                                # Check if method is FDA (the only one implemented for the moment)
                                if f_set_reduction_method.lower() != "fda":
                                    return {"error":  "Feature Reduction: Method not implemented yet (check FSR class)!"}
                                
                                # Prepare settings dict
                                fsr_dict = dict()
                                fsr_dict['fSetReduction'] = dict()
                                fsr_dict['fSetReduction']['FDA'] = content["data"]['FDA']

                                # Initialize the FSR class
                                fsr = MEDimage.learning.FSR(f_set_reduction_method)
                                
                                # Apply FDA
                                rad_tables_training = fsr.apply_fsr(
                                    fsr_dict, 
                                    rad_tables_training, 
                                    outcome_table_binary_training, 
                                    path_save_logging=path_results
                                )
                            
                                # Finalize processing tables
                                # Re-assign properties
                                for i in range(len(rad_tables_testing)):
                                    rad_tables_testing[i].Properties = temp_properties[i]
                                del temp_properties

                                # Finalization steps
                                rad_tables_training.Properties['userData']['flags_preprocessing'] = flags_preprocessing
                                rad_tables_testing = MEDimage.learning.ml_utils.combine_rad_tables(rad_tables_testing)
                                rad_tables_testing.Properties['userData']['flags_processing'] = flags_preprocessing_test
                                reduced_features = True
                                learning_progress += 1
                            except Exception as e:
                                return {"error": str(e)}

                        # --------------------------- MODEL TRAINING ---------------------------
                        if content["name"].lower() == "radiomics_learner":
                            # If no cleaning, normalization or feature set reduction step was performed, the data must be loaded
                            try:
                                if not loaded_data:
                                    return {"error":  "Cleaning: Data must be loaded first! Use Data node."}
                                if not cleaned_data and not normalized_features and not reduced_features:
                                    for item in rad_var_struct['path'].values():
                                        # Loading the table
                                        path_radiomics_csv = item['csv']
                                        path_radiomics_txt = item['txt']
                                        image_type = item['type']
                                        rad_table_learning = MEDimage.learning.ml_utils.get_radiomics_table(path_radiomics_csv, path_radiomics_txt, image_type, patient_ids)
                                        rad_tables_learning.append(rad_table_learning)
                                
                                # Seperate training and testing if no feature set reduction step was performed
                                if not reduced_features:
                                    rad_tables_testing = deepcopy(rad_tables_learning)
                                    rad_tables_training = []
                                    for rad_tab in rad_tables_learning:
                                        patients_ids = MEDimage.learning.ml_utils.intersect(patients_train, list(rad_tab.index))
                                        rad_tables_training.append(deepcopy(rad_tab.loc[patients_ids]))
                                
                                # B.2. Pre-learning initialization
                                # Patient definitions (training and test sets)
                                patient_ids = list(outcome_table_binary.index)
                                patients_train = MEDimage.learning.ml_utils.intersect(MEDimage.learning.ml_utils.intersect(patient_ids, patients_train), rad_tables_training.index)
                                patients_test = MEDimage.learning.ml_utils.intersect(MEDimage.learning.ml_utils.intersect(patient_ids, patients_test), rad_tables_testing.index)
                                patients_holdout = MEDimage.learning.ml_utils.intersect(patient_ids, patients_holdout) if holdout_test else None

                                # Initializing outcome tables for training and test sets
                                outcome_table_binary_train = outcome_table_binary.loc[patients_train, :]
                                outcome_table_binary_test = outcome_table_binary.loc[patients_test, :]
                                outcome_table_binary_holdout = outcome_table_binary.loc[patients_holdout, :] if holdout_test else None

                                # Initializing XGBoost model settings
                                if "model" in content["data"].keys() and content["data"]["model"] is not None:
                                    model_name = content["data"]["model"]
                                if "varImportanceThreshold" in content["data"][model_name].keys() and content["data"][model_name]["varImportanceThreshold"] is not None:
                                    var_importance_threshold = content["data"][model_name]["varImportanceThreshold"]
                                else:
                                    return {"error":  "Radiomics learner: Radiomics learner: variable importance threshold not provided"}
                                if "optimalThreshold" in content["data"][model_name].keys() and content["data"][model_name]["optimalThreshold"] is not None:
                                    optimal_threshold = content["data"][model_name]["optimalThreshold"]
                                else:
                                    optimal_threshold = None
                                if "optimizationMetric" in content["data"][model_name].keys() and content["data"][model_name]["optimizationMetric"] is not None:
                                    optimization_metric = content["data"][model_name]["optimizationMetric"]
                                else:
                                    return {"error":  "Radiomics learner: Optimization metric was not provided"}
                                if "method" in content["data"][model_name].keys() and content["data"][model_name]["method"] is not None:
                                    method = content["data"][model_name]["method"]
                                else:
                                    return {"error":  "Radiomics learner: Training method was not provided"}
                                if "use_gpu" in content["data"][model_name].keys() and content["data"][model_name]["use_gpu"] is not None:
                                    use_gpu = content["data"][model_name]["use_gpu"]
                                else:
                                    use_gpu = False
                                if "seed" in content["data"][model_name].keys() and content["data"][model_name]["seed"] is not None:
                                    seed = content["data"][model_name]["seed"]
                                else:
                                    return {"error":  "Radiomics learner: seed was not provided"}

                                # Serperate variable table for training sets (repetitive but double-checking)
                                var_table_train = rad_tables_training.loc[patients_train, :]

                                # Training the model
                                model = learner.train_xgboost_model(
                                    var_table_train, 
                                    outcome_table_binary_train, 
                                    var_importance_threshold, 
                                    optimal_threshold,
                                    method=method,
                                    use_gpu=use_gpu,
                                    optimization_metric=optimization_metric,
                                    seed=seed
                                )

                                # Update progress
                                learning_progress += 5

                                # Saving the trained model using pickle
                                if "nameSave" in content["data"][model_name].keys() and content["data"][model_name]["nameSave"] is not None:
                                    name_save_model = content["data"][model_name]["nameSave"]
                                else:
                                    return {"error":  "Radiomics learner: Name to save model was not provided"}
                                model_id = name_save_model + '_' + "var1"
                                path_model = os.path.dirname(path_results) + '/' + (model_id + '.pickle')
                                model_dict = MEDimage.learning.ml_utils.save_model(name_type, model, "var1", path_model)

                                # --> C. Testing phase        
                                # C.1. Testing the XGBoost model and computing model response
                                response_train, response_test = learner.test_xgb_model(
                                    model,
                                    rad_tables_testing,
                                    [patients_train, patients_test]
                                )                
                                if holdout_test:
                                    # --> D. Holdoutset testing phase
                                    # D.1. Prepare holdout test data
                                    # Loading and pre-processing
                                    rad_tables_holdout = list()
                                    for item in rad_var_struct['path'].values():
                                        # Reading the table
                                        path_radiomics_csv = item['csv']
                                        path_radiomics_txt = item['txt']
                                        image_type = item['type']
                                        rad_table_holdout = MEDimage.learning.ml_utils.get_radiomics_table(path_radiomics_csv, path_radiomics_txt, image_type, patients_holdout)
                                        rad_tables_holdout.append(rad_table_holdout)
                                    
                                    # Combine the tables
                                    var_table_all_holdout = MEDimage.learning.ml_utils.combine_rad_tables(rad_tables_holdout)
                                    var_table_all_holdout.Properties['userData']['flags_processing'] = {}

                                    # D.2. Testing the XGBoost model and computing model response on the holdout set
                                    response_holdout = learner.test_xgb_model(model, var_table_all_holdout, [patients_holdout])[0]
                                                
                                # E. Computing performance metrics
                                # Initialize the Results class
                                result = MEDimage.learning.Results(model_dict, model_id)
                                if holdout_test:
                                    run_results = result.to_json(
                                        response_train=response_train, 
                                        response_test=response_test,
                                        response_holdout=response_holdout, 
                                        patients_train=patients_train, 
                                        patients_test=patients_test, 
                                        patients_holdout=patients_holdout
                                    )
                                else:
                                    run_results = result.to_json(
                                        response_train=response_train, 
                                        response_test=response_test,
                                        response_holdout=None, 
                                        patients_train=patients_train, 
                                        patients_test=patients_test, 
                                        patients_holdout=None
                                    )
                                
                                # Calculating performance metrics for training phase and saving the ROC curve
                                run_results[model_id]['train']['metrics'] = result.get_model_performance(
                                    response_train,
                                    outcome_table_binary_train
                                )
                                
                                # Calculating performance metrics for testing phase and saving the ROC curve
                                run_results[model_id]['test']['metrics'] = result.get_model_performance(
                                    response_test,
                                    outcome_table_binary_test
                                )

                                if holdout_test:
                                    # Calculating performance metrics for holdout phase and saving the ROC curve
                                    run_results[model_id]['holdout']['metrics'] = result.get_model_performance(
                                        response_holdout, 
                                        outcome_table_binary_holdout
                                    )

                                # F. Saving the results dictionary
                                MEDimage.utils.json_utils.save_json(path_results, run_results, cls=NumpyEncoder)
                                saved_results = True

                                # Increment the split counter
                                split_counter += 1

                                # If progress is not a multiple of 10, make it a multiple of 10
                                if learning_progress % 10 != 0:
                                    learning_progress = int(learning_progress / 10) * 10
                            except Exception as e:
                                return {"error": str(e)}

                    # add relevant nodes
                    if (update_pip):
                        pip_obj[content["id"]] = id_obj

                        # Break the loop
                        break

                if saved_results and split_counter == len(paths_splits):
                    try:
                        # Average results of the different splits/runs
                        MEDimage.learning.ml_utils.average_results(Path(path_study) / f'learn__{experiment_label}', save=True)

                        # Analyze the features importance for all the runs
                        MEDimage.learning.ml_utils.feature_imporance_analysis(Path(path_study) / f'learn__{experiment_label}')

                        # Find analyze node after all splits are done
                        for node in pip:
                            analysis_dict = {}
                            # --------------------------- ANALYSIS ---------------------------
                            if content["name"].lower() == "analyze":
                                # Initializing options
                                if "histogram" in content["data"].keys() and content["data"]["histogram"]:
                                    if "histParams" not in content["data"].keys() or content["data"]["histParams"] is None:
                                        return {"error":  "Analyze: Histogram parameters were not provided"}
                                    if "sortOption" not in content["data"]["histParams"].keys() or content["data"]["histParams"]["sortOption"] is None:
                                        return {"error":  "Analyze: Sort option was not provided"}
                                    
                                    # Plot histogram
                                    try:
                                        result.plot_features_importance_histogram(
                                            Path(path_study), 
                                            experiment=experiment_label.split("_")[0], 
                                            level=experiment_label.split("_")[1], 
                                            modalities=[experiment_label.split("_")[-1]],
                                            sort_option=content["data"]["histParams"]["sortOption"],
                                            figsize=(20, 20),
                                            save=True
                                        )
                                    except Exception as e:
                                        return {"error": str(e)}
                                    
                                    # Move images to public folder
                                    level = experiment_label.split("_")[1]
                                    modality = experiment_label.split("_")[-1]
                                    sort_option = content["data"]["histParams"]["sortOption"]
                                    path_image = Path(path_study) / f'features_importance_histogram_{level}_{modality}_{sort_option}.png'
                                    path_save = Path.cwd().parent / "renderer/public/images/analyze" / f'features_importance_histogram_{level}_{modality}_{sort_option}_{pip_name}.png'
                                    path_save = shutil.copy(path_image, path_save)

                                    # Update Analysis dict
                                    analysis_dict = {}
                                    analysis_dict[experiment_label] = {}
                                    analysis_dict[experiment_label]["histogram"] = {}
                                    analysis_dict[experiment_label]["histogram"]["path"] = '.' + str(path_save).split('public')[-1].replace('\\', '/')

                                # Break the loop
                                break

                        # Update results dict
                        results_avg_dict = MEDimage.utils.load_json(Path(path_study) / f'learn__{experiment_label}' / 'results_avg.json')
                        
                        # Add experiment label to results, analysis results and round all the values
                        if "train" in results_avg_dict.keys() and results_avg_dict["train"] != {}:
                            results_avg_dict["train"] = self.__round_dict(results_avg_dict["train"], 2)
                        if "test" in results_avg_dict.keys() and results_avg_dict["test"] != {}:
                            results_avg_dict["test"] = self.__round_dict(results_avg_dict["test"], 2)
                        if "holdout" in results_avg_dict.keys() and results_avg_dict["holdout"] != {}:
                            results_avg_dict["holdout"] = self.__round_dict(results_avg_dict["holdout"], 2)
                        results_avg.append({pip_name: {experiment_label: results_avg_dict, "analysis": analysis_dict}})

                    except Exception as e:
                        return {"error": "Reults averaging & Features analysis:" + str(e)}
                
                # Check if all the splits are done
                if designed_experiment and split_counter == len(paths_splits):
                    learning_progress = 100
                    break

        # After all pips are executed, analyze both
        # Find pips linked to analyze nodes
        experiments_labels = []
        for pip in pips:
            have_analyze = True
            for node in pip:
                content = utils.get_node_content(node, json_scene)
                if content["name"].lower() == "analyze":
                    have_analyze = True
                    break
            for node in pip:
                content = utils.get_node_content(node, json_scene)
                if content["name"].lower() == "design" and have_analyze and content["data"]["expName"] not in experiments_labels:
                    experiments_labels.append(content["data"]["expName"])
                    break
        
        # Check
        experiment = experiments_labels[0].split("_")[0]
        for exp_label in experiments_labels:
            if exp_label.split("_")[0] != experiment:
                return {"error": f"To analyze experiments, labels must start with the same name! {experiment} != {exp_label}"}
            
        # Analyze all pips linked to analyze nodes
        figures_dict = {}
        for pip in pips:
            for node in pip:
                content = utils.get_node_content(node, json_scene)
                if content["name"].lower() == "analyze":
                    # --------------------------- ANALYSIS ---------------------------
                    # Initializing options
                    if "heatmap" in content["data"].keys() and content["data"]["heatmap"]:
                        if "heatmapParams" not in content["data"].keys() or content["data"]["heatmapParams"] is None:
                            return {"error":  "Analyze: Heatmap parameters were not provided"}
                        if "metric" not in content["data"]["heatmapParams"].keys() or content["data"]["heatmapParams"]["metric"] is None:
                            return {"error":  "Analyze: Heatmap metric was not provided"}
                        if "pValues" not in content["data"]["heatmapParams"].keys() or content["data"]["heatmapParams"]["pValues"] is None:
                            return {"error":  "Analyze: Heatmap p-values option was not provided"}
                        if "pValuesMethod" not in content["data"]["heatmapParams"].keys() or content["data"]["heatmapParams"]["pValuesMethod"] is None:
                            return {"error":  "Analyze: Heatmap p-value method was not provided"}
                        
                        # If no errors, retrieve the heatmap parameters
                        metric = content["data"]["heatmapParams"]["metric"]
                        plot_p_values = content["data"]["heatmapParams"]["pValues"]
                        p_value_test = content["data"]["heatmapParams"]["pValuesMethod"]

                        # Other params
                        if "title" in content["data"]["heatmapParams"].keys() and content["data"]["heatmapParams"]["title"] is not None:
                            title = content["data"]["heatmapParams"]["title"]
                        else:
                            title = None
                        if "extraMetrics" in content["data"]["heatmapParams"].keys() and content["data"]["heatmapParams"]["extraMetrics"] is not None:
                            stat_extra = content["data"]["heatmapParams"]["extraMetrics"].split(',')
                        else:
                            stat_extra = None

                        # Plot histogram
                        try:
                            result.plot_heatmap(
                                Path(path_study), 
                                experiment=experiment, 
                                levels=[exp_label.split("_")[1] for exp_label in experiments_labels],
                                modalities=list(set([exp_label.split("_")[-1] for exp_label in experiments_labels])),
                                metric=metric,
                                stat_extra=stat_extra,
                                title=title,
                                plot_p_values=plot_p_values,
                                p_value_test=p_value_test,
                                nb_split=nb_split,
                                save=True)
                        except Exception as e:
                            return {"error": str(e)}
                        
                        # Move images to public folder
                        path_image = Path(path_study) / f'{title}.png' if title else Path(path_study) / f'{metric}_heatmap.png'
                        path_save = Path.cwd().parent / "renderer/public/images/analyze" / f'{title}_{pip_name}.png' if title else Path.cwd().parent / "renderer/public/images/analyze" / f'{metric}_heatmap_{pip_name}.png'
                        path_save = shutil.copy(path_image, path_save)

                        # Update results dict with new figures
                        figures_dict["heatmap"] = {}
                        figures_dict["heatmap"]["path"] = '.' + str(path_save).split('public')[-1].replace('\\', '/')

                    # Find optimal level
                    if "optimalLevel" in content["data"].keys() and content["data"]["optimalLevel"] is not None:
                        find_optimal_level = content["data"]["optimalLevel"]
                    else:
                        find_optimal_level = False
                    if "tree" in content["data"].keys() and content["data"]["tree"] is not None:
                        plot_tree = content["data"]["tree"]
                    else:
                        plot_tree = False
                    if find_optimal_level:
                        try:
                            optimal_levels = result.get_optimal_level(
                                Path(path_study), 
                                experiment=experiment, 
                                levels=list(set([exp_label.split("_")[1] for exp_label in experiments_labels])),
                                modalities=list(set([exp_label.split("_")[-1] for exp_label in experiments_labels])),
                                metric=metric,
                                p_value_test=p_value_test,
                                nb_split=nb_split
                                )
                        except Exception as e:
                            return {"error": str(e)}
                    
                        # Update Analysis dict
                        figures_dict["optimal_level"] = {}
                        figures_dict["optimal_level"]["name"] = optimal_levels

                        # Extra optimal level analysis
                        if plot_tree:
                            try:
                                modalities = list(set([exp_label.split("_")[-1] for exp_label in experiments_labels]))
                                for idx_m, optimal_level in enumerate(optimal_levels):
                                    path_tree = None
                                    if "Text" in optimal_level:
                                        # Plot tree
                                        result.plot_original_level_tree(
                                            Path(path_study), 
                                            experiment=experiment,
                                            level=optimal_level,
                                            modalities=[modalities[idx_m]] if len(modalities) == 1 else modalities[idx_m],
                                            figsize=(25, 10),
                                        )
                                        # Get image path
                                        path_tree = Path(path_study) / f'Original_level_{experiment}_{optimal_level}_{modalities[idx_m]}_explanation_tree.png'
                                        
                                    elif "LF" in optimal_level:
                                        result.plot_lf_level_tree(
                                            Path(path_study), 
                                            experiment=experiment,
                                            level=optimal_level,
                                            modalities=[modalities[idx_m]] if len(modalities) == 1 else modalities[idx_m],
                                            figsize=(25, 10),
                                        )
                                        # Get image path
                                        path_tree = Path(path_study) / f'LF_level_{experiment}_{optimal_level}_{modalities[idx_m]}_explanation_tree.png'
                                    
                                    elif "TF" in optimal_level:
                                        result.plot_tf_level_tree(
                                            Path(path_study), 
                                            experiment=experiment,
                                            level=optimal_level,
                                            modalities=[modalities[idx_m]] if len(modalities) == 1 else modalities[idx_m],
                                            figsize=(25, 10),
                                        )
                                        # Get image path
                                        path_tree = Path(path_study) / f'TF_level_{experiment}_{optimal_level}_{modalities[idx_m]}_explanation_tree.png'
                                    
                                    # Move plot to public folder
                                    if path_tree is not None:
                                        if 'Text' in optimal_level:
                                            path_save = Path.cwd().parent / "renderer/public/images/analyze" / f'Original_level_{experiment}_{optimal_level}_{modalities[idx_m]}_explanation_tree_{pip_name}.png'
                                        elif 'LF' in optimal_level:
                                            path_save = Path.cwd().parent / "renderer/public/images/analyze" / f'LF_level_{experiment}_{optimal_level}_{modalities[idx_m]}_explanation_tree_{pip_name}.png'
                                        elif 'TF' in optimal_level:
                                            path_save = Path.cwd().parent / "renderer/public/images/analyze" / f'TF_level_{experiment}_{optimal_level}_{modalities[idx_m]}_explanation_tree_{pip_name}.png'
                                        path_save = shutil.copy(path_tree, path_save)

                                        # Update Analysis dict
                                        figures_dict["optimal_level"]["tree"] = {}
                                        figures_dict["optimal_level"]["tree"][optimal_level] = {}
                                        figures_dict["optimal_level"]["tree"][optimal_level]["path"] = '.' + str(path_save).split('public')[-1].replace('\\', '/')
                            except Exception as e:
                                return {"error": str(e)}
                    
                    # Break the nodes loop
                    break

            # Break the pips loop (only one analyze node is allowed per scence)
            break
        
        # pip features and settings updateded
        scan_res[pip_name_res] = pip_res
    
        # pips response update
        pips_res[filename_loaded] = scan_res
        pips_res["experiments"] = experiments_labels
        pips_res["results_avg"] = results_avg
        pips_res["figures"] = figures_dict
        pips_res["pips"] = pips

        # pips object update
        pips_obj[pip_name_obj] = pip_obj  

        return pips_res

    def run_all(self):
        # Retrieve the json scene from frontend
        json_scene = self.json_config
        drawflow_scene = json_scene['drawflow']

        # Initialize pipeline list
        pips = []
        counter = 0

        # Check if every design node has a split node as input
        for module in drawflow_scene:
            for node_id in drawflow_scene[module]['data']:
                node_content = drawflow_scene[module]['data'][node_id]
                if node_content["name"].lower() == "design":
                    if len(node_content["inputs"]) == 0:
                        return {"error": "Every design node must have a split node as input!"}

        # Check if there is more than one analyze node
        analyze_nodes = 0
        for module in drawflow_scene:
            for node_id in drawflow_scene[module]['data']:
                node_content = drawflow_scene[module]['data'][node_id]
                if node_content["name"].lower() == "analyze":
                    analyze_nodes += 1
                if analyze_nodes > 1:
                    return {"error": "Only one analyze node is allowed!"}
        
        # Process Piplines starting with split
        for module in drawflow_scene:  # We scan all module in scene
            for node_id in drawflow_scene[module]['data']:  # We scan all node of each module in scene
                node_content = drawflow_scene[module]['data'][node_id]  # Getting node content
                if len(node_content["inputs"]) == 0:
                    self.generate_all_pips(str(node_content["id"]), node_content, [], json_scene, pips, counter)
                    counter += 1
        
        # Full expeience check
        design_nodes = 0
        for module in drawflow_scene:
            for node_id in drawflow_scene[module]['data']:
                node_content = drawflow_scene[module]['data'][node_id]
                if node_content["name"].lower() == "design":
                    design_nodes += 1

        # Full experiment check
        warn_msg = ""
        if design_nodes != len(pips):
            warn_msg =  f"{str(len(pips))} detected pipelines, but only {str(design_nodes)} design nodes were found! This may cause errors!"

        print("\n The pipelines found in the current drawflow scene are : ", pips)
        json_res = self.execute_pips(pips, json_scene)

        if warn_msg:
            json_res["warning"] = warn_msg

        return json_res  # return pipeline results in the form of a dict