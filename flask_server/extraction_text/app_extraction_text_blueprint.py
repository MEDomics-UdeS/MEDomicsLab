import dask.dataframe as dd
import os

from flask import request, Blueprint
from pathlib import Path
from utils.server_utils import get_json_from_request

# blueprint definition
app_extraction_text = Blueprint('app_extraction_text', __name__, template_folder='templates', static_folder='static')

# global variable
progress = 0
step = "initialization"


@app_extraction_text.route("/BioBERT_extraction", methods=["GET", "POST"]) 
def BioBERT_extraction():
    """
    Run text notes extraction using BioBERT pre-trained model.

    Returns: json_config : dict containing data relative to extraction.

    """
    json_config = get_json_from_request(request)
    print("JSON CONFIG IN BIOBERT : ", json_config)
    return json_config 
    

@app_extraction_text.route("/progress", methods=["POST"])
def extraction_progress():
    """
    Triggered each x millisecond by the dashboard, it returns the progress of the extraction execution.

    Returns: the progress of the extraction execution

    """
    global progress
    global step
    return {"progress": progress, "step": step}
