import os
import pickle
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


class GoExecLoadPickleCohort(GoExecutionScript):
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
        Function reading MEDprofiles binary data given a binary file and MEDclasses
        specified by a json request and converting it into json.
        Use the to_json method from MEDcohort in MEDprofiles submodule.

        Returns: json_config : dict containing the json request and the generated json file path.
        """
        go_print(json.dumps(json_config, indent=4))
        
        # Set local variables
        MEDclasses_folder_path = json_config["MEDclassesFolder"]
        MEDprofiles_bin_path = json_config["MEDprofilesBinaryFile"]
        MEDclasses_module_path = os.path.dirname(MEDclasses_folder_path)

        # Add MEDclasses module to sys.path if not present
        if MEDclasses_module_path not in sys.path:
            sys.path.append(MEDclasses_module_path)

        # Import MEDclasses module
        import MEDclasses as medclasses_module

        # Load the pickle file
        MEDprofile_list = []
        data_file = open(MEDprofiles_bin_path, 'rb')
        while True:
            try:
                MEDprofile_list += pickle.load(data_file)
            except EOFError:
                data_file.close()
                break

        # Get the cohort
        cohort = medclasses_module.MEDcohort(list_MEDprofile=MEDprofile_list)

        # Save the json data
        MEDprofiles_json_path = os.path.join(os.path.dirname(MEDprofiles_bin_path), "MEDprofiles.json")
        with open(MEDprofiles_json_path, "w") as json_file:
            json_file.write(cohort.to_json())
        json_file.close()
        json_config["jsonFilePath"] = MEDprofiles_json_path
        self.results = json_config

        return self.results


script = GoExecLoadPickleCohort(json_params_dict, id_)
script.start()
