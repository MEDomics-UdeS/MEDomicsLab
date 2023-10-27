import os
import sys
from flask import request, Blueprint
from pathlib import Path
from utils.server_utils import get_json_from_request

MODULE_DIR = str(Path(os.path.dirname(os.path.abspath(__file__))).parent / 'submodules' / 'MEDprofiles')
sys.path.append(MODULE_DIR)

SUBMODULE_DIR = str(Path(os.path.dirname(os.path.abspath(__file__))).parent.parent)
sys.path.append(SUBMODULE_DIR)

# Importation du submodule MEDprofiles
import submodules.MEDprofiles.MEDprofiles as MEDprofiles

# blueprint definition
app_MEDprofiles = Blueprint('app_MEDprofiles', __name__, template_folder='templates', static_folder='static')

# global variable
progress = 0
step = "Initialization"


@app_MEDprofiles.route("/create_MEDclasses", methods=["GET", "POST"]) 
def create_MEDclasses():
    # Set local variables
    json_config = get_json_from_request(request)

    master_table_path = json_config["masterTablePath"]
    MEDclasses_folder_path = json_config["selectedFolderPath"]
    MEDprofiles.src.back.create_classes_from_master_table.main(master_table_path, MEDclasses_folder_path)

    return json_config


@app_MEDprofiles.route("/progress", methods=["POST"])
def MEDprofiles_progress():
    """
    Triggered each x millisecond by the dashboard, it returns the progress of the MEDprofiles' functions execution.

    Returns: the progress of the MEDprofiles' functions execution

    """
    global progress
    global step
    return {"now": round(progress, 2), "currentLabel": step}