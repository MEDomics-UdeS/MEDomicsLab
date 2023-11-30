import os
import sys
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
go_print("running script.py:" + id_)


class GoExecCreateMEDclasses(GoExecutionScript):
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
        Create MEDclasses given a master table specified by a json request in a specified folder.
        Use the create_classes_from_master_table.main function from the MEDprofiles submodule. 

        Returns: self.results : dict containing the json request and the generated MEDclasses folder path.
        """
        go_print(json.dumps(json_config, indent=4))

        # Set local variables
        master_table_path = json_config["masterTablePath"]
        MEDprofiles_folder = json_config["MEDprofilesFolderPath"]
    
        # MEDclasses creation
        MEDclasses_folder_path = os.path.join(MEDprofiles_folder, "MEDclasses")
        if not os.path.exists(MEDclasses_folder_path):
            os.mkdir(MEDclasses_folder_path)
        MEDprofiles.src.back.create_classes_from_master_table.main(master_table_path, MEDclasses_folder_path)
        if MEDclasses_folder_path not in sys.path:
            sys.path.append(MEDclasses_folder_path)
        MEDclasses_pkg = os.path.join(MEDclasses_folder_path, "MEDclasses")
        json_config["generated_MEDclasses_folder"] = MEDclasses_pkg
        self.results = json_config

        return self.results


script = GoExecCreateMEDclasses(json_params_dict, id_)
script.start()
