import dask.dataframe as dd
import datetime
import json
import os
import pandas as pd
import sys

from pathlib import Path
from tsfresh import extract_features
from tsfresh.feature_extraction import ComprehensiveFCParameters, EfficientFCParameters, MinimalFCParameters

sys.path.append(
    str(Path(os.path.dirname(os.path.abspath(__file__))).parent.parent))

from utils.server_utils import go_print
from utils.GoExecutionScript import GoExecutionScript, parse_arguments

json_params_dict, id_ = parse_arguments()
go_print("running script.py:" + id_)


class GoExecScriptTSfreshExtraction(GoExecutionScript):
    """
        This class is used to execute a process from Go

        Args:
            json_params: The input json params
            _id: The id of the page that made the request if any
    """

    def __init__(self, json_params: dict, _id: str = None):
        super().__init__(json_params, _id)
        self.results = {"data": "nothing to return"}
        self._progress["type"] = "process"

    def generate_TSfresh_embeddings(self, dataframe, frequency, column_id, column_weight, column_kind, column_value, default_fc_parameters, master_table_compatible, column_prefix, column_admission="", column_admission_time="", column_time=""):
        """
        Function generating TSfresh embeddings for time series.

        :param dataframe: Pandas dataframe containing necessary data to proceed.
        :param frequency: May be "Patient" "Admission" or a timedelta range, depending on the desired type of extraction.
        :param column_id: Column name in the dataframe containing patient identifiers.
        :param column_weight: Column name in the dataframe containing weights of the time series.
        :param column_kind: Column name in the dataframe identifying kind of time series.
        :param column_value: Column name in the dataframe containing the time series values.
        :param default_fc_parameters: TSfresh feature generation option.
        :param master_table_compatible: Boolean true if the returned dataframe must matching the sub-master table format.
        :param column_prefix: Prefix to set to extracted columns.
        :param column_admission: Column name in the dataframe containing admission identifiers, may be null if frequency is not "Admission".
        :param column_admission_time: Column name in the dataframe containing admission time, may be null if frequency is not "Admission".
        :param column_time: Time column in the dataframe, may be null if frequency is not a hour range.

        :return: df_notes_embeddings: Pandas Dataframe of generated notes embeddings from BioBERT.

        """

        # Create dataframe
        df_ts_embeddings = pd.DataFrame()

        if frequency == "Patient":
            # Iterate over patients
            for patient_id in set(dataframe[column_id]):
                df_patient = dataframe.loc[dataframe[column_id] == patient_id]
                df_patient_embeddings = extract_features(df_patient, column_id=column_id, 
                                                        column_sort=column_weight, 
                                                        column_kind=column_kind, 
                                                        column_value=column_value,
                                                        default_fc_parameters=default_fc_parameters, n_jobs=0)
                # Add prefix to extracted columns
                columns = list(df_patient_embeddings.columns)
                new_columns = [column_prefix + col for col in columns]
                df_patient_embeddings.columns = new_columns
                # Insert time in the dataframe
                df_patient_embeddings.insert(0, column_time, df_patient[column_time].iloc[0])
                # Insert patient_id in the dataframe
                df_patient_embeddings.insert(0, column_id, patient_id)
                df_ts_embeddings = pd.concat([df_ts_embeddings, df_patient_embeddings], ignore_index=True)
                self.set_progress(now = round(self._progress["now"] + 1/len(set(dataframe[column_id]))*60, 2))

        elif frequency == "Admission":
            # Iterate over patients
            for patient_id in set(dataframe[column_id]):
                df_patient = dataframe.loc[dataframe[column_id] == patient_id]
                # Iterate over admissions
                for admission_id in set(df_patient[column_admission]):
                    df_admission = df_patient.loc[df_patient[column_admission] == admission_id]
                    df_admission_embeddings = extract_features(df_admission, column_id=column_id, 
                                                            column_sort=column_weight, 
                                                            column_kind=column_kind, 
                                                            column_value=column_value,
                                                            default_fc_parameters=default_fc_parameters, n_jobs=0)
                    # Add prefix to extracted columns
                    columns = list(df_admission_embeddings.columns)
                    new_columns = [column_prefix + col for col in columns]
                    df_admission_embeddings.columns = new_columns
                    # Insert admission_time in the dataframe
                    df_admission_embeddings.insert(0, column_admission_time, df_admission[column_admission_time].iloc[0])
                    # Insert admission_id in the dataframe (except if the dataframe must respect submaster table format)
                    if not master_table_compatible:
                        df_admission_embeddings.insert(0, column_admission, admission_id)
                    # Insert patient_id in the dataframe
                    df_admission_embeddings.insert(0, column_id, patient_id)
                    df_ts_embeddings = pd.concat([df_ts_embeddings, df_admission_embeddings], ignore_index=True)
                self.set_progress(now = round(self._progress["now"] + 1/len(set(dataframe[column_id]))*60, 2)) 
        
        elif column_time != "":
            # Iterate over patients
            for patient_id in set(dataframe[column_id]):
                df_patient = dataframe.loc[dataframe[column_id] == patient_id].sort_values(by=[column_time])
                # Iterate over time
                start_date = df_patient[column_time].iloc[0]
                end_date = start_date + frequency
                last_date = df_patient[column_time].iloc[-1]
                while start_date <= last_date:
                    df_time = df_patient[(df_patient[column_time] >= start_date) & (df_patient[column_time] < end_date)]
                    if len(df_time) > 0:
                        df_time_embeddings = extract_features(df_time, column_id=column_id, 
                                                            column_sort=column_weight, 
                                                            column_kind=column_kind, 
                                                            column_value=column_value,
                                                            default_fc_parameters=default_fc_parameters,n_jobs=0)
                        # Add prefix to extracted columns
                        columns = list(df_time_embeddings.columns)
                        new_columns = [column_prefix + col for col in columns]
                        df_time_embeddings.columns = new_columns
                        # Insert time in the dataframe (only start_date if the dataframe must respect submaster table format)
                        if not master_table_compatible:
                            df_time_embeddings.insert(0, "end_date", end_date)
                        df_time_embeddings.insert(0, "start_date", start_date)
                        # Insert patient_id in the dataframe
                        df_time_embeddings.insert(0, column_id, patient_id)
                        df_ts_embeddings = pd.concat([df_ts_embeddings, df_time_embeddings], ignore_index=True)
                    start_date += frequency
                    end_date += frequency
                self.set_progress(now = round(self._progress["now"] + 1/len(set(dataframe[column_id]))*60, 2))

        return df_ts_embeddings

    def _custom_process(self, json_config: dict) -> dict:
        """
        Run time series extraction using TSfresh library.

        Returns: self.results : dict containing data relative to extraction.

        """
        go_print(json.dumps(json_config, indent=4))
        # Set local variables
        selected_columns = json_config["relativeToExtractionType"]["selectedColumns"]
        column_prefix = json_config["relativeToExtractionType"]["columnPrefix"] + '_attr_'
        columnKeys = [key for key in selected_columns]
        columnValues = []
        for key in columnKeys:
            if selected_columns[key] != "":
                columnValues.append(selected_columns[key])
        frequency = json_config["relativeToExtractionType"]["frequency"]
        if frequency == "HourRange":
            frequency = datetime.timedelta(hours=json_config["relativeToExtractionType"]["hourRange"])

        # Read extraction data
        self.set_progress(label="Read Data", now=10)
        df_ts = dd.read_csv(json_config["csvPath"], dtype={selected_columns["measurementValue"]: 'float64'})
        df_ts = df_ts[columnValues]

        # Pre-processing on data
        self.set_progress(label="Pre-processing data", now=20)
        if selected_columns["time"] != "":
                df_ts = df_ts.astype({selected_columns["time"] : "datetime64[ns]"})
        df_ts = df_ts.dropna(subset=columnValues).compute()

        # Feature extraction
        self.set_progress(label="Feature Extraction", now=30)
        if json_config["relativeToExtractionType"]["featuresOption"] == "Efficient":
            settings = EfficientFCParameters()
        elif json_config["relativeToExtractionType"]["featuresOption"] == "Minimal":
            settings = MinimalFCParameters()
        else:
            settings = ComprehensiveFCParameters()

        df_extracted_features = self.generate_TSfresh_embeddings(df_ts, frequency, selected_columns["patientIdentifier"], 
                                                            selected_columns["measurementWeight"], 
                                                            selected_columns["measuredItemIdentifier"], 
                                                            selected_columns["measurementValue"], settings,
                                                            json_config["relativeToExtractionType"]["masterTableCompatible"], 
                                                            column_prefix,
                                                            selected_columns["admissionIdentifier"],
                                                            selected_columns["admissionTime"],
                                                            selected_columns["time"])
        # Save extracted features
        self.set_progress(label="Save extracted features", now=90)
        extracted_folder_path = os.path.join(str(Path(json_config["dataFolderPath"])), "extracted_features")
        if not os.path.exists(extracted_folder_path):
            os.makedirs(extracted_folder_path)
        csv_result_path = os.path.join(extracted_folder_path, json_config['filename'])
        df_extracted_features.to_csv(csv_result_path, index=False)
        json_config["csv_result_path"] = csv_result_path
        self.results = json_config
        return self.results


script = GoExecScriptTSfreshExtraction(json_params_dict, id_)
script.start()
