import os
import sys
import threading
import time
from pathlib import Path
import json

sys.path.append(
    str(Path(os.path.dirname(os.path.abspath(__file__))).parent.parent))
from med_libs.server_utils import go_print
from med_libs.GoExecutionScript import GoExecutionScript, parse_arguments

MODULE_DIR = str(Path(os.path.dirname(os.path.abspath(__file__))).parent.parent / 'submodules' / 'MEDprofiles')
sys.path.append(MODULE_DIR)

SUBMODULE_DIR = str(Path(os.path.dirname(os.path.abspath(__file__))).parent.parent.parent)
sys.path.append(SUBMODULE_DIR)

# Importation du submodule MEDprofiles
import submodules.MEDprofiles.MEDprofiles as MEDprofiles

json_params_dict, id_ = parse_arguments()
#go_print("running script.py:" + id_)


class GoExecInstantiateMEDprofiles(GoExecutionScript):
    """
        This class is used to execute a process from Go

        Args:
            json_params: The input json params
            _id: The id of the page that made the request if any
    """

    def __init__(self, json_params: dict, _id: str = None, isProgressInThread: bool = True):
        super().__init__(json_params, _id)
        self.results = {"data": "nothing to return"}

    def _custom_process(self, json_config: dict) -> dict:
        """
        Instantiate MEDprofiles data as binary file given a master table and MEDclasses
        specified by a json request.
        Use the instantiate_data_from_master_table.main function from the MEDprofiles submodule. 

        Returns: self.results : dict containing the json request and the generated binary file path.
        """
        #go_print(json.dumps(json_config, indent=4))
        
        # Set local variables
        master_table_path = json_config["masterTablePath"]
        MEDprofiles_folder = json_config["MEDprofilesFolderPath"]
        #filename = json_config["filename"]
        #destination_file = os.path.join(MEDprofiles_folder, filename)
        destination_file = json_config["destinationFile"]
        patient_list = json_config["patientList"]
        MEDclasses_module = os.path.join(MEDprofiles_folder, "MEDclasses")
        if MEDclasses_module not in sys.path:
            sys.path.append(MEDclasses_module)

        MEDprofiles.src.back.instantiate_data_from_master_table.main(master_table_path, destination_file, patient_list)
        #json_config["generated_file_path"] = destination_file
        return self.results


script = GoExecInstantiateMEDprofiles(json_params_dict, id_)
script.start()
