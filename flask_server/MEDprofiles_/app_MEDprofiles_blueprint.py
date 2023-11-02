import os
import pickle
import sys
from flask import request, Blueprint
from pathlib import Path
from utils.server_utils import get_json_from_request, get_response_from_error

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
step = ""


@app_MEDprofiles.route("/create_MEDclasses", methods=["GET", "POST"]) 
def create_MEDclasses():
    # Set local variables
    json_config = get_json_from_request(request)

    master_table_path = json_config["masterTablePath"]
    MEDclasses_folder_path = json_config["selectedFolderPath"]

    try:
        MEDprofiles.src.back.create_classes_from_master_table.main(master_table_path, MEDclasses_folder_path)

    except BaseException as e:
        return get_response_from_error(e)

    return json_config


@app_MEDprofiles.route("/instantiate_MEDprofiles", methods=["GET", "POST"])
def instantiate_MEDprofiles():
    # Global variables
    global progress
    global step
    step = "Data instantiation"

     # Set local variables
    json_config = get_json_from_request(request)

    master_table_path = json_config["masterTablePath"]
    destination_file = json_config["destinationFile"]

    try:
        MEDprofiles.src.back.instantiate_data_from_master_table.main(master_table_path, destination_file)
    except BaseException as e:
        return get_response_from_error(e)

    return json_config


@app_MEDprofiles.route("/load_pickle_cohort", methods=["GET", "POST"])
def load_pickle_cohort():
    # Set local variables
    json_config = get_json_from_request(request)
    MEDclasses_folder_path = json_config["MEDclassesFolder"]
    MEDprofiles_bin_path = json_config["MEDprofilesBinaryFile"]
    MEDclasses_module_path = os.path.dirname(MEDclasses_folder_path)

    # Add MEDclasses module to sys.path if not present
    if MEDclasses_module_path not in sys.path:
        sys.path.append(MEDclasses_module_path)

    # Import MEDclasses module
    import MEDclasses as medclasses_module

    # Load the pickle file
    data_file = open(MEDprofiles_bin_path, 'rb')
    MEDprofile_list = pickle.load(data_file)
    data_file.close()

    # Get the cohort
    cohort = medclasses_module.MEDcohort(list_MEDprofile=MEDprofile_list[:5])

    # Save the json data
    MEDprofiles_json_path = os.path.join(os.path.dirname(MEDprofiles_bin_path), "MEDprofiles.json")
    with open(MEDprofiles_json_path, "w") as json_file:
        json_file.write(cohort.to_json())
    json_file.close()
    json_config["jsonFilePath"] = MEDprofiles_json_path

    return json_config


@app_MEDprofiles.route("/progress", methods=["POST"])
def MEDprofiles_progress():
    """
    Triggered each x millisecond by the dashboard, it returns the progress of the MEDprofiles' functions execution.

    Returns: the progress of the MEDprofiles' functions execution

    """
    global progress
    progress = MEDprofiles.src.back.instantiate_data_from_master_table.get_progress()
    return {"now": round(progress, 2), "currentLabel": step}