import os
import sys
import traceback
from pathlib import Path

import numpy as np
import pandas
import sklearn
from flask import jsonify
from pycaret.internal.pipeline import Pipeline

from .figure import Figure


def get_json_from_request(request):
    """
    Gets the json from the request
    """
    data = request.get_json()
    data = jsonify(data)
    json_config = data.json
    return json_config['json2send']


def get_response_from_error(e=None, toast=None):
    """
    Gets the response from an error
    """
    if e is not None:
        print(e)
        ex_type, ex_value, ex_traceback = sys.exc_info()
        trace_back = traceback.extract_tb(ex_traceback)
        stack_trace = ''
        for trace in trace_back:
            stack_trace += \
                "\nFile -> %s \nLine -> %d\nFunc.Name -> %s\nMessage -> %s\n" % (trace[0], trace[1], trace[2], trace[3])

        print("Exception type : %s " % ex_type.__name__)
        print("Exception message : %s" % ex_value)
        print("Stack trace : %s" % stack_trace)
        return jsonify({"error": {"message": str(e), "stack_trace": str(stack_trace), "value": str(ex_value)}})
    elif toast is not None:
        return jsonify({"toast": toast})


def get_repo_path():
    """
    Gets the path of the repository
    """
    return str(Path(os.path.dirname(os.path.abspath(__file__))).parent.parent)


def go_print(msg):
    """
    This function is used to print a message to the stdout pipeline wich go is listening to
    """
    sys.stdout.flush()
    sys.stdout.write(msg + "\n")
    sys.stdout.flush()


def find_next_available_port(start_port: int = 5001) -> int:
    """
        This function is used to find the next available port
    """
    port = start_port
    while is_port_in_use(port):
        port += 1
    return port


def is_port_in_use(port: int) -> bool:
    """
        This function is used to check if a port is in use
    """
    go_print(f"checking port {port}")
    import socket
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        return s.connect_ex(('localhost', port)) == 0


def get_free_space_mb(folder):
    """
        This function is used to get the free space in a folder
    """
    import shutil
    total, used, free = shutil.disk_usage(folder)
    return free / (1024.0 ** 3)


def get_model_from_medmodel(medmodel_path: str) -> sklearn.base.BaseEstimator:
    """
        This function is used to get the model from a medmodel
    """
    import joblib
    from CustomZipFile import CustomZipFile

    cust_zip_file_model = CustomZipFile(".medmodel")

    def load_model_from_zip(path):
        pkl_path = os.path.join(path, "model.pkl")
        with open(pkl_path, "rb") as f:
            model = joblib.load(f)
        if isinstance(model, Pipeline):
            model = model.steps[-1][1]
        return model

    return cust_zip_file_model.read_in_zip(
        medmodel_path, load_model_from_zip)


def get_model_from_path(path: str) -> sklearn.base.BaseEstimator:
    """
        This function is used to get the model from a medmodel
    """
    import joblib
    with open(path, "rb") as f:
        model = joblib.load(f)
    if isinstance(model, Pipeline):
        model = model.steps[-1][1]
    return model


def load_csv(path: str, target: str) -> pandas.DataFrame:
    """
        This function is used to load a csv file

        Args:
            path: The path of the csv file
            target: The target column name
    """
    df = pandas.read_csv(path)
    temp_df = df[df[target].notna()]
    temp_df.replace("", float("NaN"), inplace=True)
    temp_df.dropna(how='all', axis=1, inplace=True)
    return temp_df


def load_med_standard_data(dataset_list, tags_list, vars_list, target) -> pandas.DataFrame:
    """
    This function is used to combine the dataframes.
    Args:
        df_list: list of dataframes
        tags_list: list of tags

    Returns: the combined dataframe

    """

    # load the dataframes
    df_dict = {}  # dict containing time points to their associated files
    df_path_list = [file['path'] for file in dataset_list]
    df_name_list = [file['name'] for file in dataset_list]
    for i, name in enumerate(
            df_name_list):  # if the filename not contains T+number we don't keep it, else we associate it to his time point number
        number = ''
        T_in_name = False
        for char in name:
            if char == 'T':
                T_in_name = True
            elif T_in_name and char.isdigit():
                number += char
            elif T_in_name:
                break
        if len(number) > 0:
            df_dict['_T' + number] = pandas.read_csv(df_path_list[i], sep=',', encoding='utf-8')
    first_col = df_dict['_T' + number].columns[0]

    # for each dataframe, add a suffix to their columns
    for key in df_dict:
        df_dict[key].columns = [f'{col}{key}' if col != target and col != first_col else col for col in
                                df_dict[key].columns]

    sorted_keys = sorted(df_dict.keys(), key=lambda x: int(x.split('_T')[1]))
    df_list = [df_dict[key] for key in sorted_keys]


    # first column should be the ID
    first_col = 'subject_id'
    # last column should be the target

    # merge the dataframes on the first column and the target
    df_merged: pandas.DataFrame = df_list[0]
    for i in range(len(df_list) - 1):
        df_merged = df_merged.merge(df_list[i + 1], on=[first_col, target], how='outer')

    # drop all columns not containing tags from tags list
    cols_2_keep = [first_col, target]
    for col in df_merged.columns:
        if col in cols_2_keep:
            continue
        col_name = col.split('_|_')[1]
        if col_name in vars_list:
            cols_2_keep.append(col)
    df_merged = df_merged[cols_2_keep]


    return df_merged

def allowed_pickle_object(filepath):
    # TODO : Plus de paramètres que l'extension doivent être vérifiés pour le pickle object
    return filepath.endswith('.npy')


# TODO : Pour remplacer la fonction formatFeatures de app_extraction_blueprint.py
def format_features(features_dict):
    return {k: (np.float64(v) if not isinstance(v, list) else v) for (k, v) in features_dict.items()}


# Utils for nodes
def get_node_content(node_id: str, json_scene):
    """Retrieve the content of a node by ID from a JSON scene."""
    for module in json_scene['drawflow']:
        if node_id in json_scene['drawflow'][module]['data']:
            return json_scene['drawflow'][module]['data'][node_id]
    
    print("No node with this ID")
    return None

# Find all instances of key value in dictionnary : 
# https://stackoverflow.com/questions/9807634/find-all-occurrences-of-a-key-in-nested-dictionaries-and-lists
def gen_dict_extract(key, var):
    if hasattr(var, 'items'):
        for k, v in var.items():
            if k == key:
                yield v
            if isinstance(v, dict):
                for result in gen_dict_extract(key, v):
                    yield result
            elif isinstance(v, list):
                for d in v:
                    for result in gen_dict_extract(key, d):
                        yield result

# Instantiates image figure when calling view on node from app_extraction_blueprint.py
def image_viewer(medimage_list, data, runs):
    # Check if the node to view is input
    if data["name"] == "input":
        fig_title = "3D Volume of \"" + data["file_loaded"] + "\""

        vol = medimage_list[data["file_loaded"]].data.volume.array

        fig = Figure(vol, fig_title)
        fig.add_data()
        fig.create_figure_sliders()
        fig.update_figure_layout()
        fig.show_figure()

    # If node is not input, need to retrace pipeline
    else:
        mask = None
        last_run = list(runs)[-1]
        # 3D view created for each pip related to the view button clicked
        for pip_idx, pip in enumerate(runs[last_run]):
            for id in runs[last_run][pip]:

                if (str(id) == str(data["id"])):
                    if (data["name"] == "segmentationNode" or data["name"] == "re_segmentation"):
                        # Code cleaning for ROI contour tracing
                        mask = runs[last_run][pip][id]['output']['roi']
                        if type(mask) != np.ndarray:
                            mask = mask.data
                        
                        if data["name"] == "re_segmentation":
                            id_before_reseg = pip[-82:-41]
                            vol = runs[last_run][pip][id_before_reseg]['output']['vol']
                        else:
                            vol = runs[last_run][pip][id]['output']['vol']
                        
                        if type(vol) != np.ndarray:
                            vol = vol.data
                    else:
                        vol = runs[last_run][pip][id]['output']['vol']  # display VOL for others nodes

                    if type(vol) != np.ndarray:
                        vol = vol.data

                    # Figure title
                    fig_title = ""
                    if (runs[last_run][pip][id]["type"] == "filter"):
                        fig_title = '3D Volume - Pipeline ' + str(pip_idx + 1) + " - " + runs[last_run][pip][id]["settings"][
                            "filter_type"] + \
                                    " " + runs[last_run][pip][id]["type"] + " output."
                    else:
                        fig_title = '3D Volume - Pipeline ' + str(pip_idx + 1) + " - " + runs[last_run][pip][id]["type"] + " output."

                    fig = Figure(vol, fig_title, mask)
                    fig.add_data()
                    fig.create_figure_sliders()
                    fig.update_figure_layout()
                    fig.show_figure()
