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


@app_input.route("/TSfresh_extraction", methods=["GET", "POST"])
def merge():
    """
    Run time series extraction using TSfresh library.

    Returns: json_config : dict containing data relative to extraction.

    """
    # global variables
    global progress
    global step
    progress = 0
    step = "initialization"

    # Set local variables
    json_config = get_json_from_request(request)
    selected_columns = json_config["relativeToExtractionType"]["selectedColumns"]
    columnKeys = [key for key in selected_columns]
    columnValues = [selected_columns[key] for key in columnKeys]

    # Read extraction data
    progress = 10
    step = "Read Data"

    # Pre-processing on data
    progress = 20
    step = "Pre-processing data"

    json_config["csv_result_path"] = csv_result_path
    return json_config


@app_input.route("/progress", methods=["POST"])
def input_progress():
    """
    Triggered each x millisecond by the dashboard, it returns the progress of the extraction execution.

    Returns: the progress of the extraction execution

    """
    global progress
    global step
    return {"progress": progress, "step": step}
