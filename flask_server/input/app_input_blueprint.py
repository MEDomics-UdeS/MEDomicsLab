import dask.dataframe as dd
import os

from flask import request, Blueprint
from pathlib import Path
from utils.server_utils import get_json_from_request

# blueprint definition
app_input = Blueprint('app_input', __name__,
                      template_folder='templates', static_folder='static')

# global variable
progress = 0
step = "initialization"


def load_data_file(path, extension):
    """
    Load data from a file
    Args:
        path (basestring): path to the file
        extension (basestring): extension of the file
    Returns:
        df (pandas.DataFrame): dataframe containing the data
    """
    import pandas as pd
    if extension == "csv":
        df = pd.read_csv(path)
    elif extension == "xlsx":
        df = pd.read_excel(path)
    elif extension == "json":
        df = pd.read_json(path)
    else:
        print("Extension not supported, cannot load the file")
        return None
    return df


def save_dataframe(path, extension, df):
    """
    Save a dataframe to a file
    Args:
        path (basestring): path to the file
        extension (basestring): extension of the file
        df (pandas.DataFrame): dataframe to save
    """
    if extension == ".csv":
        df.to_csv(path, index=False)
    elif extension == ".xlsx":
        df.to_excel(path, index=False)
    elif extension == ".json":
        df.to_json(path, index=False)
    else:
        print("Extension not supported, cannot save the file")
        return None



@app_input.route("/merge_datasets", methods=["GET", "POST"])
def merge():
    """
    Merge the datasets with Pandas
    """
    # global variables
    global progress
    global label
    progress = 0
    label = "initialization"

    # Set local variables
    json_config = get_json_from_request(request)
    print(json_config)
    payload = json_config["payload"]
    first_dataset_path = payload["0"]["path"]
    first_dataset_extension = payload["0"]["extension"]
    first_dataset_selected_columns = payload["0"]["selectedColumns"]
    first_dataset = load_data_file(first_dataset_path, first_dataset_extension)[first_dataset_selected_columns]
    for dataset in payload.keys():
        if(dataset=="0"):
            continue
        else:
            dataset_path = payload[dataset]["path"]
            dataset_extension = payload[dataset]["extension"]
            dataset_selected_columns = payload[dataset]["selectedColumns"]
            new_dataframe = load_data_file(dataset_path, dataset_extension)[dataset_selected_columns]
            dataset_merge_on = payload[dataset]["mergeOn"]
            dataset_merge_type = payload[dataset]["mergeType"]
            first_dataset = first_dataset.merge(new_dataframe, how=dataset_merge_type, on=dataset_merge_on)

    # Save the merged dataset
    final_dataset_extension = json_config["finalDatasetExtension"]
    final_dataset_path = json_config["finalDatasetPath"]
    save_dataframe(final_dataset_path, final_dataset_extension, first_dataset)

    json_config["final_path"] = final_dataset_path
    return json_config


@app_input.route("/progress", methods=["POST"])
def input_progress():
    """
    Return the progress of the input module
    """
    global progress
    global label
    return {"progress": progress, "label": label}
