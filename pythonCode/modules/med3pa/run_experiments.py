import os
import json
import sys
from pathlib import Path
import time
from datetime import datetime

sys.path.append(
    str(Path(os.path.dirname(os.path.abspath(__file__))).parent.parent))

from med_libs.server_utils import go_print
from med_libs.GoExecutionScript import GoExecutionScript, parse_arguments

from MED3pa.med3pa import *
from MED3pa.detectron import *
from MED3pa.datasets import *
from MED3pa.models import *

json_params_dict, id_ = parse_arguments()
go_print("running send_params_med3pa.py:" + id_)


def _is_detectron_experiment(experiment):
    for node in experiment:
        if node["label"] == "Detectron":
            return True
    return False


def _flatten_med3pa_experiment(experiment):
    flattened_experiment = []
    base_nodes = [node for node in experiment if node["label"] in ["Dataset Loader", "Base Model"]]
    med3pa_nodes = [node for node in experiment if node["label"] == "MED3pa"]

    for med3pa_node in med3pa_nodes:
        if "children" in med3pa_node:
            for child_group in med3pa_node["children"]:
                flattened_group = base_nodes + child_group
                flattened_experiment.append(flattened_group)
        else:
            flattened_experiment.append(base_nodes + [med3pa_node])

    return flattened_experiment


def _transform_datasets_node(experiment):
    datasets_node = next((node for node in experiment if node["label"] == "Dataset Loader"), None)
    if datasets_node:
        datasets = {
            "training": {
                "path": datasets_node["settings"]["file_0"]["path"],
                "target": datasets_node["settings"]["target_0"]
            },
            "validation": {
                "path": datasets_node["settings"]["file_1"]["path"],
                "target": datasets_node["settings"]["target_1"]
            },
            "reference": {
                "path": datasets_node["settings"]["file_2"]["path"],
                "target": datasets_node["settings"]["target_2"]
            },
            "testing": {
                "path": datasets_node["settings"]["file_3"]["path"],
                "target": datasets_node["settings"]["target_3"]
            }
        }
        return datasets
    return {}


def _transform_base_model_node(experiment):
    base_model_node = next((node for node in experiment if node["label"] == "Base Model"), None)
    if base_model_node:
        return base_model_node["settings"]["file"]["path"]
    return ""


def format_string(input_string):
    formatted_string = input_string.lower().replace(" ", "_")
    return formatted_string


def _transform_detectron_node(node):
    return {
        "sample_size": node["settings"].get("sample_size", None),
        "ensemble_size": node["settings"].get("ensemble_size", None),
        "num_runs": node["settings"].get("num_rounds", None),
        "patience": node["settings"].get("patience", None),
        "test_strategies": [format_string(strategy["name"]) for strategy in node["settings"].get("detectron_test", [])]
    }


def _transform_ipc_model_node(node):
    file_settings = node["settings"].get("file", {})
    file_path = file_settings.get("path", None)  # Default to None if path is not found

    if node["settings"]["optimize"] is True:
        optimize_params = node["settings"].get("grid_params", None)
    else:
        optimize_params = None

    return {
        "model_type": node["settings"].get("model_type", None),
        "hyperparameters": node["settings"].get("hyperparameters", None),
        "optimize_params": optimize_params,
        "pretrained_ipc": file_path if file_path is not "" else None,
        "save_ipc": node["settings"].get("save_pickled", False),
    }


def _transform_apc_model_node(node):
    file_settings = node["settings"].get("file", {})
    file_path = file_settings.get("path", None)  # Default to None if path is not found

    if node["settings"]["optimize"] is True:
        optimize_params = node["settings"].get("grid_params", None)
    else:
        optimize_params = None

    return {
        "hyperparameters": node["settings"].get("hyperparameters", None),
        "optimize_params": optimize_params,
        "pretrained_apc": file_path if file_path is not "" else None,
        "save_apc": node["settings"].get("save_pickled", False),
        "max_samples_ratio": node["settings"].get("maximum_min_samples_ratio", 50)
    }


def _transform_uncertainty_metric_node(node):
    return format_string(node["settings"].get("uncertainty_metric", None))


def _transform_experiment(experiment):
    datasets = _transform_datasets_node(experiment)
    base_model = _transform_base_model_node(experiment)
    detectron_params = None
    ipc_model = None
    apc_model = None
    mpc_model = None
    uncertainty_metrics = None
    mode = None

    for node in experiment:
        if node["label"] == "Detectron":
            detectron_params = _transform_detectron_node(node)
        elif node["label"] == "MED3pa.Detectron Profiles":
            detectron_params = _transform_detectron_node(node)
        elif node["label"] == "MED3pa.IPC Model":
            ipc_model = _transform_ipc_model_node(node)
            mode = "ipc"
        elif node["label"] == "MED3pa.APC Model":
            apc_model = _transform_apc_model_node(node)
            mode = "apc"
        elif node["label"] == "MED3pa.MPC Model":
            mpc_model = True
            mode = "mpc"
        elif node["label"] == "MED3pa.Uncertainty Metric":
            uncertainty_metrics = _transform_uncertainty_metric_node(node)

    transformed_data = {
        "datasets": datasets,
        "base_model": base_model,
    }

    if detectron_params:
        transformed_data["detectron_params"] = detectron_params

    if ipc_model:
        transformed_data["ipc_model"] = ipc_model

    if apc_model:
        transformed_data["apc_model"] = apc_model

    if mode:
        transformed_data["mode"] = mode

    if uncertainty_metrics:
        transformed_data["uncertainty_metric"] = uncertainty_metrics

    return transformed_data


def _process_experiments(data):
    processed_experiments = []

    for experiment in data:
        if _is_detectron_experiment(experiment):
            transformed_data = _transform_experiment(experiment)
            processed_experiments.append({
                "experiment_name": "detectron_experiment",
                "experiment_data": transformed_data
            })
        else:
            flattened_experiments = _flatten_med3pa_experiment(experiment)
            for flat_exp in flattened_experiments:
                experiment_name = "unknown"
                if any(node["label"] == "MED3pa.IPC Model" for node in flat_exp):
                    experiment_name = "med3pa_experiment"
                if any(node["label"] == "MED3pa.Detectron Profiles" for node in flat_exp):
                    experiment_name = "med3pa_detectron_experiment"
                transformed_data = _transform_experiment(flat_exp)
                processed_experiments.append({
                    "experiment_name": experiment_name,
                    "experiment_data": transformed_data
                })

    return processed_experiments


def _handle_detectron_experiment(experiment):
    # harcoded test_strategies, model_path
    # Ensure the experiment is of type detectron_experiment
    if experiment.get("experiment_name") != "detectron_experiment":
        raise ValueError("The provided experiment is not a detectron_experiment")

    datasets = experiment["experiment_data"].get("datasets", {})
    base_model = experiment["experiment_data"].get("base_model", "")

    # Check that all datasets and their targets are filled
    required_datasets = ["training", "validation", "reference", "testing"]
    for key in required_datasets:
        if key not in datasets or not datasets[key].get("path") or not datasets[key].get("target"):
            raise ValueError(f"The {key} dataset or its target is missing or empty")

    # Check that the base model path is not empty
    if not base_model:
        raise ValueError("The base model path is empty")

    detectron_params = experiment["experiment_data"].get("detectron_params", {})

    # Extract relevant detectron_params if they exist
    sample_size = detectron_params.get("sample_size", 20)
    ensemble_size = detectron_params.get("ensemble_size", 10)
    num_runs = detectron_params.get("num_runs", 100)
    patience = detectron_params.get("patience", 3)
    test_strategies = detectron_params.get("test_strategies",
                                           ["enhanced_disagreement_strategy", "mannwhitney_strategy"])

    manager = DatasetsManager()
    manager.set_from_file(dataset_type="training", file=datasets['training']['path'],
                          target_column_name=datasets['training']['target'])
    manager.set_from_file(dataset_type="validation", file=datasets['validation']['path'],
                          target_column_name=datasets['validation']['target'])
    manager.set_from_file(dataset_type="reference", file=datasets['reference']['path'],
                          target_column_name=datasets['reference']['target'])
    manager.set_from_file(dataset_type="testing", file=datasets['testing']['path'],
                          target_column_name=datasets['testing']['target'])

    factory = ModelFactory()
    model = factory.create_model_from_pickled(base_model)

    # Set the base model using BaseModelManager
    base_model_manager = BaseModelManager()
    base_model_manager.set_base_model(model=model)

    experiment_kwargs = {
        "datasets": manager,
        "base_model_manager": base_model_manager,
    }

    # Include optional parameters only if they are provided
    if sample_size is not None:
        experiment_kwargs["samples_size"] = sample_size
    if ensemble_size is not None:
        experiment_kwargs["ensemble_size"] = ensemble_size
    if num_runs is not None:
        experiment_kwargs["num_calibration_runs"] = num_runs
    if patience is not None:
        experiment_kwargs["patience"] = patience

    experiment_results = DetectronExperiment.run(**experiment_kwargs)
    experiment_results.analyze_results(test_strategies)

    BaseModelManager.reset()

    return experiment_results


def _handle_med3pa_experiment(experiment):
    # Ensure the experiment is of type med3pa_experiment
    if experiment.get("experiment_name") != "med3pa_experiment":
        raise ValueError("The provided experiment is not a med3pa_experiment")

    datasets = experiment["experiment_data"].get("datasets", {})
    base_model = experiment["experiment_data"].get("base_model", "")

    # Check that all datasets and their targets are filled
    required_datasets = ["training", "validation", "reference", "testing"]
    for key in required_datasets:
        if key not in datasets or not datasets[key].get("path") or not datasets[key].get("target"):
            raise ValueError(f"The {key} dataset or its target is missing or empty")

    # Check that the base model path is not empty
    if not base_model:
        raise ValueError("The base model path is empty")

    ipc_model = experiment["experiment_data"].get("ipc_model", {})
    apc_model = experiment["experiment_data"].get("apc_model", {})
    uncertainty_metric = experiment["experiment_data"].get("uncertainty_metric", "absolute_error")
    mode = experiment["experiment_data"].get("mode", "mpc")

    # Extract relevant detectron_params
    ipc_hyperparameters = ipc_model.get("hyperparameters", None)
    ipc_optimize_params = ipc_model.get("optimize_params", None)
    ipc_type = ipc_model.get("model_type", "RandomForestRegressor")
    pretrained_ipc = ipc_model.get('pretrained_ipc', None)

    apc_hyperparameters = apc_model.get("hyperparameters", None)
    apc_optimize_params = apc_model.get("optimize_params", None)
    pretrained_apc = apc_model.get('pretrained_apc', None)
    max_samples_ratio = apc_model.get('max_samples_ratio', 10)

    manager = DatasetsManager()
    manager.set_from_file(dataset_type="training", file=datasets['training']['path'],
                          target_column_name=datasets['training']['target'])
    manager.set_from_file(dataset_type="validation", file=datasets['validation']['path'],
                          target_column_name=datasets['validation']['target'])
    manager.set_from_file(dataset_type="reference", file=datasets['reference']['path'],
                          target_column_name=datasets['reference']['target'])
    manager.set_from_file(dataset_type="testing", file=datasets['testing']['path'],
                          target_column_name=datasets['testing']['target'])

    factory = ModelFactory()
    model = factory.create_model_from_pickled(base_model)

    # Set the base model using BaseModelManager
    base_model_manager = BaseModelManager()
    base_model_manager.set_base_model(model=model)

    experiment_kwargs = {
        "datasets_manager": manager,
        "base_model_manager": base_model_manager,
    }

    # Include optional parameters only if they are provided
    if uncertainty_metric is not None:
        experiment_kwargs["uncertainty_metric"] = uncertainty_metric

    if ipc_type is not None:
        experiment_kwargs["ipc_type"] = ipc_type
    if ipc_hyperparameters is not None:
        experiment_kwargs["ipc_params"] = ipc_hyperparameters
    if ipc_optimize_params is not None:
        experiment_kwargs["ipc_grid_params"] = ipc_optimize_params
    if pretrained_ipc is not None:
        experiment_kwargs["pretrained_ipc"] = pretrained_ipc

    if apc_hyperparameters is not None:
        experiment_kwargs["apc_params"] = apc_hyperparameters
    if apc_optimize_params is not None:
        experiment_kwargs["apc_grid_params"] = apc_optimize_params
    if pretrained_apc is not None:
        experiment_kwargs["pretrained_apc"] = pretrained_apc

    if mode is not None:
        experiment_kwargs["mode"] = mode

    experiment_kwargs["evaluate_models"] = True
    experiment_kwargs["samples_ratio_max"] = int(max_samples_ratio)
    experiment_kwargs["uncertainty_metric"] = uncertainty_metric

    experiment_results = Med3paExperiment.run(**experiment_kwargs)

    BaseModelManager.reset()

    return experiment_results


def _handle_det3pa_experiment(experiment):
    # hardcoded uncertainty metrics, test_strategies, model and samples_ratio
    # Ensure the experiment is of type med3pa_experiment
    if experiment.get("experiment_name") != "med3pa_detectron_experiment":
        raise ValueError("The provided experiment is not a med3pa_detectron_experiment")

    datasets = experiment["experiment_data"].get("datasets", {})
    base_model = experiment["experiment_data"].get("base_model", "")

    # Check that all datasets and their targets are filled
    required_datasets = ["training", "validation", "reference", "testing"]
    for key in required_datasets:
        if key not in datasets or not datasets[key].get("path") or not datasets[key].get("target"):
            raise ValueError(f"The {key} dataset or its target is missing or empty")

    # Check that the base model path is not empty
    if not base_model:
        raise ValueError("The base model path is empty")

    detectron_params = experiment["experiment_data"].get("detectron_params", {})

    # Extract relevant detectron_params if they exist
    sample_size = detectron_params.get("sample_size", 20)
    ensemble_size = detectron_params.get("ensemble_size", 10)
    num_runs = detectron_params.get("num_runs", 100)
    patience = detectron_params.get("patience", 3)
    test_strategies = detectron_params.get("test_strategies",
                                           ["enhanced_disagreement_strategy", "mannwhitney_strategy"])

    ipc_model = experiment["experiment_data"].get("ipc_model", {})
    apc_model = experiment["experiment_data"].get("apc_model", {})
    uncertainty_metric = experiment["experiment_data"].get("uncertainty_metric", "absolute_error")
    mode = experiment["experiment_data"].get("mode", "mpc")

    # Extract relevant detectron_params
    ipc_hyperparameters = ipc_model.get("hyperparameters", None)
    ipc_optimize_params = ipc_model.get("optimize_params", None)
    ipc_type = ipc_model.get("model_type", "RandomForestRegressor")
    pretrained_ipc = ipc_model.get('pretrained_ipc', None)

    apc_hyperparameters = apc_model.get("hyperparameters", None)
    apc_optimize_params = apc_model.get("optimize_params", None)
    pretrained_apc = apc_model.get('pretrained_apc', None)
    max_samples_ratio = apc_model.get('max_samples_ratio', None)

    manager = DatasetsManager()
    manager.set_from_file(dataset_type="training", file=datasets['training']['path'],
                          target_column_name=datasets['training']['target'])
    manager.set_from_file(dataset_type="validation", file=datasets['validation']['path'],
                          target_column_name=datasets['validation']['target'])
    manager.set_from_file(dataset_type="reference", file=datasets['reference']['path'],
                          target_column_name=datasets['reference']['target'])
    manager.set_from_file(dataset_type="testing", file=datasets['testing']['path'],
                          target_column_name=datasets['testing']['target'])

    factory = ModelFactory()
    model = factory.create_model_from_pickled(base_model)

    # Set the base model using BaseModelManager
    base_model_manager = BaseModelManager()
    base_model_manager.set_base_model(model=model)

    experiment_kwargs = {
        "datasets": manager,
        "base_model_manager": base_model_manager,
    }

    # Include optional parameters only if they are provided
    if uncertainty_metric is not None:
        experiment_kwargs["uncertainty_metric"] = uncertainty_metric

    if ipc_type is not None:
        experiment_kwargs["ipc_type"] = ipc_type
    if ipc_hyperparameters is not None:
        experiment_kwargs["ipc_params"] = ipc_hyperparameters
    if ipc_optimize_params is not None:
        experiment_kwargs["ipc_grid_params"] = ipc_optimize_params
    if pretrained_ipc is not None:
        experiment_kwargs["pretrained_ipc"] = pretrained_ipc

    if apc_hyperparameters is not None:
        experiment_kwargs["apc_params"] = apc_hyperparameters
    if apc_optimize_params is not None:
        experiment_kwargs["apc_grid_params"] = apc_optimize_params
    if pretrained_apc is not None:
        experiment_kwargs["pretrained_apc"] = pretrained_apc

    if mode is not None:
        experiment_kwargs["mode"] = mode

    # Include optional parameters only if they are provided
    if sample_size is not None:
        experiment_kwargs["samples_size"] = sample_size
        experiment_kwargs["samples_size_profiles"] = sample_size
    if ensemble_size is not None:
        experiment_kwargs["ensemble_size"] = ensemble_size
    if num_runs is not None:
        experiment_kwargs["num_calibration_runs"] = num_runs
    if patience is not None:
        experiment_kwargs["patience"] = patience

    experiment_kwargs["evaluate_models"] = True
    experiment_kwargs["samples_ratio_max"] = int(max_samples_ratio)
    experiment_kwargs["uncertainty_metric"] = uncertainty_metric
    experiment_kwargs["test_strategies"] = test_strategies

    experiment_results = Med3paDetectronExperiment.run(**experiment_kwargs)

    BaseModelManager.reset()

    return experiment_results


def _save_med3pa_models(experiment):
    ipc_model = experiment["experiment_data"].get("ipc_model", {})
    apc_model = experiment["experiment_data"].get("apc_model", {})

    save_ipc = ipc_model.get("save_ipc", False)
    save_apc = apc_model.get("save_apc", False)

    if save_ipc and save_apc:
        mode = "all"
    elif save_ipc:
        mode = "ipc"
    elif save_apc:
        mode = "apc"
    else:
        mode = "nothing"
    return mode


def _compare_detectron_experiments(base_path, experiment1, experiment2, name1, name2):
    comparison = DetectronComparison(experiment1, experiment2)
    if comparison.is_comparable():
        comparison.compare_experiments()
        saving_dir = os.path.join(base_path, f"compare_{name1}_{name2}")
        comparison.save(saving_dir)
        return f"compare_{name1}_{name2}"
    else:
        comparison.compare_config()
        return ""


def _compare_med3pa_experiments(base_path, experiment1, experiment2, name1, name2):
    comparison = Med3paComparison(experiment1, experiment2)
    if comparison.is_comparable():
        comparison.compare_experiments()
        saving_dir = os.path.join(base_path, f"compare_{name1}_{name2}")
        comparison.save(saving_dir)
        return f"compare_{name1}_{name2}"
    else:
        return ""


def _compare_experiments(saving_paths: dict, experiments_names: dict, base_path) -> dict:
    """
    Compares experiments by their paths and saves the comparison results in another dictionary.

    Args:
    saving_paths (dict): A dictionary where the keys are experiment names and the values are lists of saving paths.
    base_path (str): The base directory where comparison results will be saved.

    Returns:
    dict: A dictionary where the keys are experiment names and the values are lists of comparison paths.
    """
    comparison_results = []

    for experiment_name, paths in saving_paths.items():
        names = experiments_names.get(experiment_name)
        if len(paths) < 2:
            continue  # Skip if there are less than 2 paths to compare
        for i in range(len(paths)):
            for j in range(i + 1, len(paths)):
                path1 = paths[i]
                path2 = paths[j]
                name1 = names[i]
                name2 = names[j]

                if experiment_name == "detectron_experiment":
                    comparison_path = _compare_detectron_experiments(base_path, path1, path2, name1, name2)
                else:
                    comparison_path = _compare_med3pa_experiments(base_path, path1, path2, name1, name2)

                if comparison_path != "":
                    comparison_results.append(comparison_path)

    return comparison_results


class GoExecScriptRunExperiments(GoExecutionScript):
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
        This function is the main script of the execution of the process from Go.
        """
        configs = json_config['config']
        base_path = json_config['path']
        saving_mode = 'nothing'
        print(configs)
        experiments = _process_experiments(configs)
        paths = []
        saving_paths = {}
        experiments_names = {}
        model_saving_paths = []
        path_to_results_dir = os.path.join(base_path, "MED3paResults")
        path_to_comparison_dir = os.path.join(base_path, "MED3paResults", "ComparisonResults")
        path_to_models_dir = os.path.join(base_path, "MED3paResults", "SavedModels")
        total_experiments = len(experiments)

        for index, experiment in enumerate(experiments):
            experiment_name = experiment['experiment_name']
            progress = int((index) / total_experiments * 100)
            self.set_progress(label=f"Processing {experiment_name} ({index+1}/{total_experiments})", now=progress)

            current_timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")  # Get the current date in YYYYMMDD format
            experiment_path = f"{experiment_name}_{current_timestamp}"
            saving_path = os.path.join(path_to_results_dir, experiment_path)

            if experiment_name == 'detectron_experiment':
                results = _handle_detectron_experiment(experiment)
                saving_path = os.path.join(saving_path, "detectron_results")
                models_folder = ""
            elif experiment_name == 'med3pa_experiment':
                results = _handle_med3pa_experiment(experiment)
                saving_mode = _save_med3pa_models(experiment)
                if saving_mode in ["all", "ipc", "apc"]:
                    models_saving_path = os.path.join(path_to_models_dir, f'saved_model_{experiment_path}')
                    models_folder = f'saved_model_{experiment_path}'
                    results.save_models(models_saving_path, saving_mode, experiment_path)
                else:
                    models_folder = ""
            elif experiment_name == 'med3pa_detectron_experiment':
                results = _handle_det3pa_experiment(experiment)
                saving_mode = _save_med3pa_models(experiment)
                if saving_mode in ["all", "ipc", "apc"]:
                    models_saving_path = os.path.join(path_to_models_dir, f'saved_model_{experiment_path}')
                    models_folder = f'saved_model_{experiment_path}'
                    results.save_models(models_saving_path, saving_mode, experiment_path)
                else:
                    models_folder = ""

            results.save(saving_path)

            paths.append(experiment_path)
            model_saving_paths.append(models_folder)

            if experiment_name not in experiments_names:
                experiments_names[experiment_name] = []
            experiments_names[experiment_name].append(experiment_path)

            if experiment_name not in saving_paths:
                saving_paths[experiment_name] = []
            saving_paths[experiment_name].append(saving_path)

        comparison_paths = _compare_experiments(saving_paths, experiments_names, path_to_comparison_dir)
        self.results = {'path_to_results': paths, 'path_to_comparison': comparison_paths,
                        'models_paths': model_saving_paths}
        go_print("RECEIVED RESULTS:" + str(self.results))
        self.set_progress(label="Finished Processing all experiments!", now=100)
        return self.results


helloWorldTest = GoExecScriptRunExperiments(json_params_dict, id_)
helloWorldTest.start()