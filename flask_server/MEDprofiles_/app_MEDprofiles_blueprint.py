from fileinput import filename
import numpy as np
import os
import pandas as pd
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

@app_MEDprofiles.route("/create_master_table", methods=["GET", "POST"]) 
def create_master_table():
    """
    Create a master table from list of csv files paths given by a json request.
    The master table file is created following the specifications given in the json request.

    Returns: json_config : dict containing the json request and the master table path.

    """
    # Set local variables
    json_config = get_json_from_request(request)

    csv_path_list = json_config["csvPaths"]
    master_folder = json_config["masterTableFolder"]
    master_filename = json_config["filename"]

    try:
        # Initialize df_master from the first csv
        df_master = pd.read_csv(csv_path_list[0])
        columns = ['PatientID', 'Date'] + list(df_master.columns[2:])
        df_master.columns = columns

        # Merge all the dataframes
        for csv_path in csv_path_list[1:]:
            df = pd.read_csv(csv_path)
            columns = ['PatientID', 'Date'] + list(df.columns[2:])
            df.columns = columns
            df_master = df_master.merge(df, on=['PatientID', 'Date'], how='outer')

        # Sort the dataframe and insert a Time_point column
        df_master['Date'] = pd.to_datetime(df_master['Date'])
        df_master.sort_values(by=['PatientID', 'Date'], inplace=True)
        df_master.insert(2, 'Time_point', np.NaN)

        # Create a type list to add in the master table
        # All the attributes are numbers except the date and the patient id
        type_list = ['num' for _ in df_master.columns]
        type_list[1] = 'datetime.date'
        if df_master.dtypes[0] == 'object':
            type_list[0] = 'str'

        # Add types row to the dataframe
        df_types = pd.DataFrame([type_list], columns=df_master.columns)
        df_master = pd.concat([df_types, df_master]).reset_index(drop=True)

        # Save the master table
        path_master_file = os.path.join(master_folder, master_filename)
        df_master.to_csv(path_master_file, index=False)
        json_config["master_table_path"] = path_master_file

    except BaseException as e:
        return get_response_from_error(e)

    return json_config


@app_MEDprofiles.route("/create_MEDclasses", methods=["GET", "POST"]) 
def create_MEDclasses():
    """
    Create MEDclasses given a master table specified by a json request in a specified folder.
    Use the create_classes_from_master_table.main function from the MEDprofiles submodule. 

    Returns: json_config : dict containing the json request and the generated MEDclasses folder path.

    """
    # Set local variables
    json_config = get_json_from_request(request)

    master_table_path = json_config["masterTablePath"]
    MEDprofiles_folder = json_config["MEDprofilesFolderPath"]
    
    try:
        MEDclasses_folder_path = os.path.join(MEDprofiles_folder, "MEDclasses")
        if not os.path.exists(MEDclasses_folder_path):
            os.mkdir(MEDclasses_folder_path)
        MEDprofiles.src.back.create_classes_from_master_table.main(master_table_path, MEDclasses_folder_path)
        MEDclasses_pkg = os.path.join(MEDclasses_folder_path, "MEDclasses")
        json_config["generated_MEDclasses_folder"] = MEDclasses_pkg
    except BaseException as e:
        return get_response_from_error(e)

    return json_config


@app_MEDprofiles.route("/create_MEDprofiles_folder", methods=["GET", "POST"]) 
def create_MEDprofiles_folder():
    """
    Method called at the opening of the MEDprofiles module in order to create a folder
    relative to the MEDprofiles data. 

    Returns: json_config : dict containing the json request and the generated MEDprofiles folder path.

    """
    # Set local variables
    json_config = get_json_from_request(request)

    root_data_folder = json_config["rootDataFolder"]

    try:
        path_MEDprofiles = os.path.join(root_data_folder, "MEDprofiles")
        if not os.path.exists(path_MEDprofiles):
            os.mkdir(path_MEDprofiles)
        path_master_tables = os.path.join(path_MEDprofiles, "master_tables")
        if not os.path.exists(path_master_tables):
            os.mkdir(path_master_tables)
        json_config["MEDprofiles_folder"] = path_MEDprofiles

    except BaseException as e:
        return get_response_from_error(e)

    return json_config


@app_MEDprofiles.route("/instantiate_MEDprofiles", methods=["GET", "POST"])
def instantiate_MEDprofiles():
    """
    Instantiate MEDprofiles data as binary file given a master table and MEDclasses
    specified by a json request.
    Use the instantiate_data_from_master_table.main function from the MEDprofiles submodule. 

    Returns: json_config : dict containing the json request and the genrated binary file path.

    """
    # Global variables
    global progress
    global step
    step = "Data instantiation"

     # Set local variables
    json_config = get_json_from_request(request)

    master_table_path = json_config["masterTablePath"]
    MEDprofiles_folder = json_config["MEDprofilesFolderPath"]
    filename = json_config["filename"]
    destination_file = os.path.join(MEDprofiles_folder, filename)

    try:
        MEDprofiles.src.back.instantiate_data_from_master_table.main(master_table_path, destination_file)
        json_config["generated_file_path"] = destination_file
    except BaseException as e:
        return get_response_from_error(e)

    return json_config


@app_MEDprofiles.route("/load_pickle_cohort", methods=["GET", "POST"])
def load_pickle_cohort():
    """
    Function reading MEDprofiles binary data given a binary file and MEDclasses
    specified by a json request and converting it into json.
    Use the to_json method from MEDcohort in MEDprofiles submodule.

    Returns: json_config : dict containing the json request and the generated json file path.
    """
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
    cohort = medclasses_module.MEDcohort(list_MEDprofile=MEDprofile_list)

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