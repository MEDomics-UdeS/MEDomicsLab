import json
import os
import pandas as pd
import sys
from pathlib import Path
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
go_print("running script.py:" + id_)


class GoExecInitializeMEDprofilesInstantiation(GoExecutionScript):
    """
        This class is used to execute a process from Go

        Args:
            json_params: The input json params
            _id: The id of the page that made the request if any
    """

    def __init__(self, json_params: dict, _id: str = None):
        super().__init__(json_params, _id)
        self.results = {"data": "nothing to return"}

    def _custom_process(self, json_config: dict) -> dict:
        """
        Prepare binary file and patient list for MEDprofiles instantiation by batch. 

        Returns: self.results : dict containing the json request, the generated binary file path and the list of MEDprofiles.
        """
        go_print(json.dumps(json_config, indent=4))
        
        # Set local variables
        master_table_path = json_config["masterTablePath"]
        MEDprofiles_folder = json_config["MEDprofilesFolderPath"]
        filename = json_config["filename"]
        MEDclasses_module = os.path.join(MEDprofiles_folder, "MEDclasses")
        if MEDclasses_module not in sys.path:
            sys.path.append(MEDclasses_module)

        # Create MEDprofiles binary file
        destination_file = os.path.join(MEDprofiles_folder, filename)
        data_file = open(destination_file, 'ab')
        data_file.close()
        json_config["destination_file"] = destination_file

        # Get patient list
        patient_list = MEDprofiles.src.back.instantiate_data_from_master_table.get_patient_id_list(master_table_path)
        json_config["patient_list"] = patient_list


        self.results = json_config
        return self.results


script = GoExecInitializeMEDprofilesInstantiation(json_params_dict, id_)
script.start()
