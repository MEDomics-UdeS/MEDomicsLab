import os
import sys
import threading
import time
from pathlib import Path
import json

sys.path.append(
    str(Path(os.path.dirname(os.path.abspath(__file__))).parent.parent))

from utils.server_utils import go_print
from utils.GoExecutionScript import GoExecutionScript, parse_arguments

MODULE_DIR = str(Path(os.path.dirname(os.path.abspath(__file__))).parent.parent / 'submodules' / 'MEDprofiles')
sys.path.append(MODULE_DIR)

SUBMODULE_DIR = str(Path(os.path.dirname(os.path.abspath(__file__))).parent.parent.parent)
sys.path.append(SUBMODULE_DIR)

# Importation du submodule MEDprofiles
import submodules.MEDprofiles.MEDprofiles as MEDprofiles

json_params_dict, id_ = parse_arguments()
go_print("running script.py:" + id_)


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
        self._progress["type"] = "process"
        self._progress_update_frequency_HZ = 1.0
        if isProgressInThread:
            self.progress_thread = threading.Thread(target=self._update_progress_periodically, args=())
            self.progress_thread.daemon = True
            self.progress_thread.start()

    def _custom_process(self, json_config: dict) -> dict:
        """
        Instantiate MEDprofiles data as binary file given a master table and MEDclasses
        specified by a json request.
        Use the instantiate_data_from_master_table.main function from the MEDprofiles submodule. 

        Returns: self.results : dict containing the json request and the genrated binary file path.
        """
        go_print(json.dumps(json_config, indent=4))
        
        # Set local variables
        self.set_progress(label="Data Instantiation", now=0)
        master_table_path = json_config["masterTablePath"]
        MEDprofiles_folder = json_config["MEDprofilesFolderPath"]
        filename = json_config["filename"]
        destination_file = os.path.join(MEDprofiles_folder, filename)
        MEDclasses_module = os.path.join(MEDprofiles_folder, "MEDclasses")
        if MEDclasses_module not in sys.path:
            sys.path.append(MEDclasses_module)

        MEDprofiles.src.back.instantiate_data_from_master_table.main(master_table_path, destination_file)
        json_config["generated_file_path"] = destination_file
        return self.results
    
    def update_progress(self):
        """
        This function is used to update the progress of the data instantiation.
        It is called periodically by the thread self.progress_thread
        """
        progress = MEDprofiles.src.back.instantiate_data_from_master_table.get_progress()
        self.set_progress(now=round(progress, 2))

    def _update_progress_periodically(self):
        while True:
            self.update_progress()
            self.push_progress()
            time.sleep(1.0 / self._progress_update_frequency_HZ)


script = GoExecInstantiateMEDprofiles(json_params_dict, id_)
script.start()
