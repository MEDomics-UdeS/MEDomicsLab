import dask.dataframe as dd
import os

from flask import request, Blueprint
from pathlib import Path
from utils.server_utils import get_json_from_request
import pandas as pd
# blueprint definition
app_input = Blueprint('app_input', __name__,
                      template_folder='templates', static_folder='static')

# global variable
input_progress = {}


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
        df.to_json(path, orient="records")
    else:
        print("Extension not supported, cannot save the file")
        return None


@app_input.route("/merge_datasets", methods=["GET", "POST"])
def merge():
    """
    Merge the datasets with Pandas
    """
    # global variables
    global input_progress

    # Set local variables
    json_config = get_json_from_request(request)
    print(json_config)
    payload = json_config["payload"]

    request_id = json_config["pageId"]
    input_progress[request_id] = {"now": 0, "currentLabel": "None"}

    length = (len(payload.keys())-1)*2
    progress_step = 100/length
    progress = 0
    input_progress[request_id] = {
        "now": progress, "currentLabel": "Initialisation"}

    first_dataset_path = payload["0"]["path"]
    first_dataset_extension = payload["0"]["extension"]
    first_dataset_selected_columns = payload["0"]["selectedColumns"]
    first_dataset_selected_columns = [
        column for column in first_dataset_selected_columns if column != None]
    input_progress[request_id] = {
        "now": progress, "currentLabel": "Initialisation : Loading the first dataset"}
    first_dataset = load_data_file(first_dataset_path, first_dataset_extension)[
        first_dataset_selected_columns]

    for dataset in payload.keys():
        if (dataset == "0"):
            continue
        else:
            dataset_path = payload[dataset]["path"]
            dataset_name = payload[dataset]["name"]
            dataset_extension = payload[dataset]["extension"]
            dataset_selected_columns = payload[dataset]["selectedColumns"]
            dataset_merge_on = payload[dataset]["mergeOn"]
            dataset_merge_type = payload[dataset]["mergeType"]

            # Update the progress
            input_progress[request_id] = {
                "now": progress, "currentLabel": "Initialisation : Loading the first dataset"}
            progress += progress_step

            # Load the dataset
            new_dataframe = load_data_file(dataset_path, dataset_extension)[
                dataset_selected_columns]
            input_progress[request_id] = {
                "now": progress, "currentLabel": "Merging with " + dataset_name}
            progress += progress_step

            # Merge the dataset
            first_dataset = first_dataset.merge(
                new_dataframe, how=dataset_merge_type, on=dataset_merge_on)

    # Save the merged dataset
    final_dataset_extension = json_config["finalDatasetExtension"]
    final_dataset_path = json_config["finalDatasetPath"]
    save_dataframe(final_dataset_path, final_dataset_extension, first_dataset)
    input_progress[request_id] = {
        "now": progress, "currentLabel": "Saving with " + final_dataset_path}

    json_config["final_path"] = final_dataset_path
    return json_config


def assert_no_nan_values_for_each_column(df: pd.DataFrame, cols: list = None):
    """
    Assert that there is no nan values for each column
    Args:
        df: DataFrame to check
        cols: Columns to check

    Returns: None

    """
    if cols is None:
        cols = df.columns
    for col in cols:
        print(col)
        print(df[col].unique())
        print(df[col].isnull().values.any())
        if df[col].isnull().values.any():
            df[col].fillna(method='ffill', inplace=True)
            if df[col].isnull().values.any():
                df[col].fillna(method='bfill', inplace=True)
        print("\n")


@app_input.route("/create_holdout_set", methods=["GET", "POST"])
def create_holdout_set():
    """
    Create a holdout set
    and a train set with Pandas
    """
    # global variables
    global input_progress
    from sklearn.model_selection import train_test_split
    import numpy as np
    import pandas as pd
    # Set local variables
    json_config = get_json_from_request(request)
    print(json_config)
    payload = json_config["payload"]

    request_id = json_config["pageId"]
    input_progress[request_id] = {"now": 0, "currentLabel": "None"}

    # length = len(payload.keys())*2
    progress_step = 100/5
    progress = 0
    input_progress[request_id] = {
        "now": progress, "currentLabel": "Initialisation"}

    final_dataset_path = json_config["finalDatasetPath"]
    final_dataset_extension = json_config["finalDatasetExtension"]
    main_dataset_path = payload["datasetPath"]
    main_dataset_extension = payload["extension"]
    holdout_size = payload["holdoutSetSize"]/100
    shuffle_bool = payload["shuffle"]
    stratify_bool = payload["stratify"]
    columns_to_stratify_with = payload["columnsToStratifyWith"]
    random_state = payload["randomState"]
    nan_method = payload["nanMethod"]
    final_name = payload["name"]

    if not stratify_bool:
        columns_to_stratify_with = []

    # Load the dataset
    progress += progress_step
    input_progress[request_id] = {
        "now": progress, "currentLabel": "Initialisation : Loading the dataset"}
    main_dataset = load_data_file(main_dataset_path, main_dataset_extension)
    print("main_dataset", main_dataset)
    progress += progress_step
    input_progress[request_id] = {
        "now": progress, "currentLabel": "Initialisation : Creating stratifying subset"}
    stratify = main_dataset.copy(deep=True) if (
        (len(columns_to_stratify_with) > 0) and stratify_bool) else pd.DataFrame()

    progress += progress_step
    input_progress[request_id] = {"now": progress,
                                  "currentLabel": "Cleaning stratifying subset"}
    df_cleaned = main_dataset.replace(float('nan'), np.nan)
    # print("df_cleaned #1", df_cleaned)
    # Clean the stratifying subset
    if stratify_bool:
        stratify = stratify.loc[:, columns_to_stratify_with]
        print("stratify", stratify)
        assert_no_nan_values_for_each_column(stratify)
        print("stratify #2", stratify)
        stratify = stratify.dropna(axis=0, how='any')
        print("stratify #3", stratify)

    if stratify[columns_to_stratify_with].isnull().values.any() and len(columns_to_stratify_with) > 0 and stratify_bool:
        if nan_method == 'drop':
            print("Dropping null values")
            df_cleaned = df_cleaned.dropna(
                subset=columns_to_stratify_with, axis=0)

    holdout_set = {}
    train_set = {}
    stratify_df = df_cleaned.loc[:, columns_to_stratify_with] if (
        len(columns_to_stratify_with) > 0 and stratify_bool) else None

    # stratify_df = None
    print("stratify_df", stratify_df)
    if stratify_df is not None:
        assert_no_nan_values_for_each_column(stratify_df)

    # Create the holdout set
    progress += progress_step
    input_progress[request_id] = {"now": progress,
                                  "currentLabel": "Creating holdout set"}

    if (shuffle_bool):
        train_set, holdout_set = train_test_split(df_cleaned, test_size=holdout_size, random_state=random_state,
                                                  stratify=stratify_df, shuffle=shuffle_bool)
    else:
        train_set, holdout_set = train_test_split(
            df_cleaned, test_size=holdout_size, random_state=random_state)

    # Save the datasets
    progress += progress_step
    input_progress[request_id] = {"now": progress,
                                  "currentLabel": "Saving with " + final_name}

    save_dataframe(final_dataset_path+"train_"+final_name,
                   final_dataset_extension, train_set)
    save_dataframe(final_dataset_path+"holdout_"+final_name,
                   final_dataset_extension, holdout_set)

    json_config["final_path"] = final_dataset_path
    return json_config


@app_input.route("/progress/<id>", methods=["POST"])
def input_progress_request(id):
    """
    Return the progress of the input module
    """
    global progress
    global label
    if id in input_progress.keys():
        print(input_progress[id])
        return input_progress[id]
    else:
        return {"now": 0, "currentLabel": "None"}
