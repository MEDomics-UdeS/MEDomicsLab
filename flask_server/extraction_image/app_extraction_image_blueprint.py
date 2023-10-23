import os

from flask import request, Blueprint
from pathlib import Path
from utils.server_utils import get_json_from_request, get_response_from_error

# blueprint definition
app_extraction_image = Blueprint('app_extraction_image', __name__, template_folder='templates', static_folder='static')

# global variable
progress = 0
step = "initialization"


@app_extraction_image.route("/DenseNet_extraction", methods=["GET", "POST"]) 
def DenseNet_extraction():
    """
    Run time series extraction using TSfresh library.

    Returns: json_config : dict containing data relative to extraction.

    """
    # global variables
    global progress
    global step
    progress = 0
    step = "initialization"

    try:
        # Set local variables
        json_config = get_json_from_request(request)

        # Save extracted features
        progress = 90
        step = "Save extracted features"
        csv_result_path = os.path.join(str(Path(json_config["csvPath"]).parent.absolute()), json_config['filename'])
        json_config["csv_result_path"] = csv_result_path

    except BaseException as e:
        return get_response_from_error(e) 

    return json_config 
    

@app_extraction_image.route("/progress", methods=["POST"])
def extraction_progress():
    """
    Triggered each x millisecond by the dashboard, it returns the progress of the extraction execution.

    Returns: the progress of the extraction execution

    """
    global progress
    global step
    return {"now": round(progress, 2), "currentLabel": step}
