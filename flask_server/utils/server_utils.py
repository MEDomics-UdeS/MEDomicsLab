import pandas
import sklearn
from flask import jsonify
import sys
import traceback
import os
from pathlib import Path

from pycaret.internal.pipeline import Pipeline


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
    sys.stdout.flush()
    print(msg)
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
    from utils.CustomZipFile import CustomZipFile

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
