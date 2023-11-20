import numpy as np
import os
import pandas as pd
import sys
from pathlib import Path
import json

sys.path.append(
    str(Path(os.path.dirname(os.path.abspath(__file__))).parent.parent))

from utils.server_utils import go_print
from utils.GoExecutionScript import GoExecutionScript, parse_arguments

json_params_dict, id_ = parse_arguments()
go_print("running script.py:" + id_)


class GoExecCreateMasterTable(GoExecutionScript):
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
        Create a master table from list of csv files paths given by a json request.
        The master table file is created following the specifications given in the json request.

        Returns: self.results : dict containing the json request and the master table path.

        """
        go_print(json.dumps(json_config, indent=4))

        # Set local variables
        csv_path_list = json_config["csvPaths"]
        master_folder = json_config["masterTableFolder"]
        master_filename = json_config["filename"]

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
        self.results = json_config

        return self.results


script = GoExecCreateMasterTable(json_params_dict, id_)
script.start()
