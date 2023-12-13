import dask.dataframe as dd
import datetime
import json
import numpy as np
import os
import pandas as pd
import sys
import torch # Necessary to avoid a bug with transformers
from pathlib import Path
from transformers import AutoTokenizer, AutoModel

sys.path.append(
    str(Path(os.path.dirname(os.path.abspath(__file__))).parent.parent))
from med_libs.server_utils import go_print
from med_libs.GoExecutionScript import GoExecutionScript, parse_arguments

json_params_dict, id_ = parse_arguments()
go_print("running script.py:" + id_)


class GoExecScriptBioBERTExtraction(GoExecutionScript):
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
        self.BIOBERT_PATH =  ""
        self.BIOBERT_TOKENIZER = None
        self.BIOBERT_MODEL = None
        print("Here 0 \n")
        print('json_params')


    def split_note_document(self, text, min_length=15):
        """
        Function taken from the GitHub repository of the HAIM study. Split a text if too long for embeddings generation.

        :param text: String of text to be processed into an embedding. BioBERT can only process a string with â‰¤ 512 tokens
            . If the input text exceeds this token count, we split it based on line breaks (driven from the discharge
            summary syntax).
        :param min_length: When parsing the text into its subsections, remove text strings below a minimum length. These are
            generally very short and encode minimal information (e.g. 'Name: ___').

        :return: chunk_parse: A list of "chunks", i.e. text strings, that breaks up the original text into strings with 512
                tokens.
                chunk_length: A list of the token counts for each "chunk".

        """
        tokens_list_0 = self.BIOBERT_TOKENIZER.tokenize(text)

        if len(tokens_list_0) <= 510:
            return [text], [1]

        chunk_parse = []
        chunk_length = []
        chunk = text

        # Go through text and aggregate in groups up to 510 tokens (+ padding)
        tokens_list = self.BIOBERT_TOKENIZER.tokenize(chunk)
        if len(tokens_list) >= 510:
            temp = chunk.split('\n')
            ind_start = 0
            len_sub = 0
            for i in range(len(temp)):
                temp_tk = self.BIOBERT_TOKENIZER.tokenize(temp[i])
                if len_sub + len(temp_tk) > 510:
                    chunk_parse.append(' '.join(temp[ind_start:i]))
                    chunk_length.append(len_sub)
                    # reset for next chunk
                    ind_start = i
                    len_sub = len(temp_tk)
                else:
                    len_sub += len(temp_tk)
        elif len(tokens_list) >= min_length:
            chunk_parse.append(chunk)
            chunk_length.append(len(tokens_list))

        return chunk_parse, chunk_length


    def get_biobert_embeddings(self, text):
        """
        Function taken from the GitHub repository of the HAIM study. Obtain BioBERT embeddings of text string.

        :param text: Input text (str).

        :return: embeddings: Final Biobert embeddings with vector dimensionality = (1,768).
                hidden_embeddings: Last hidden layer in Biobert model with vector dimensionality = (token_size,768).

        """
        tokens_pt = self.BIOBERT_TOKENIZER(text, return_tensors="pt")
        outputs = self.BIOBERT_MODEL(**tokens_pt)
        last_hidden_state = outputs.last_hidden_state
        pooler_output = outputs.pooler_output
        hidden_embeddings = last_hidden_state.detach().numpy()
        embeddings = pooler_output.detach().numpy()

        return embeddings, hidden_embeddings


    def get_biobert_embeddings_from_event_list(self, event_list, event_weights):
        """
        Function taken from the GitHub repository of the HAIM study. For notes obtain fixed-size BioBERT embeddings.

        :param event_list: Timebound ICU patient stay structure filtered by max_time_stamp or min_time_stamp if any.
        :param event_weights: Weights for aggregation of features in final embeddings.

        :return: aggregated_embeddings: BioBERT event features for all events.

        """
        event_weights_exp = []
        for idx, event_string in enumerate(event_list):
            weight = event_weights.values[idx]
            string_list, lengths = self.split_note_document(event_string)
            for idx_sub, event_string_sub in enumerate(string_list):
                # Extract biobert embedding
                embedding, hidden_embedding = self.get_biobert_embeddings(event_string_sub)
                # Concatenate
                if (idx == 0) & (idx_sub == 0):
                    full_embedding = embedding
                else:
                    full_embedding = np.concatenate((full_embedding, embedding), axis=0)
                event_weights_exp.append(weight)

        # Return the weighted average of embedding vector across temporal dimension
        try:
            aggregated_embedding = np.average(full_embedding, axis=0, weights=np.array(event_weights_exp))
        except:
            aggregated_embedding = np.zeros(768)

        return aggregated_embedding


    def generate_biobert_notes_embeddings(self, dataframe, frequency, column_id, column_weight, column_text, column_prefix, master_table_compatible, column_admission="", column_admission_time="", column_time=""):
        """
        Function generating notes embeddings from BioBERT pre-trained model.

        :param dataframe: Pandas dataframe containing necessary data to proceed.
        :param frequency: May be "Patient" "Admission" or a timedelta range, depending on the desired type of extraction.
        :param column_id: Column name in the dataframe containing patient identifiers.
        :param column_weight: Column name in the dataframe containing weights of the text notes.
        :param column_text: Column name in the dataframe containing the text notes.
        :param column_prefix: Prefix to set to column in the returning dataframe.
        :param master_table_compatible: Boolean telling if the returned dataframe format must be submaster table compatible.
        :param column_admission: Column name in the dataframe containing admission identifiers, may be null if frequency is not "Admission".
        :param column_admission_time: Column name in the dataframe containing admission time, may be null if frequency is not "Admission".
        :param column_time: Time column in the dataframe, may be null if frequency is not a hour range.

        :return: df_notes_embeddings: Pandas Dataframe of generated notes embeddings from BioBERT.

        """
        # Create dataframe
        df_notes_embeddings = pd.DataFrame()

        if frequency == "Patient":
            # Iterate over patients
            for patient_id in set(dataframe[column_id]):
                df_patient = dataframe.loc[dataframe[column_id] == patient_id]
                df_patient_embeddings = pd.DataFrame(
                    [self.get_biobert_embeddings_from_event_list(df_patient[column_text], df_patient[column_weight])])
                # Insert Time if the format is submaster table compatible
                if master_table_compatible:
                    df_patient_embeddings.insert(0, column_time, df_patient[column_time].iloc[0])
                # Insert patient_id in the dataframe
                df_patient_embeddings.insert(0, column_id, patient_id)
                df_notes_embeddings = pd.concat([df_notes_embeddings, df_patient_embeddings], ignore_index=True)
                self.set_progress(now = round(self._progress["now"] + 1/len(set(dataframe[column_id]))*60, 2))
            # Rename columns
            if master_table_compatible:
                col_number = len(df_notes_embeddings.columns) - 2
                df_notes_embeddings.columns = [column_id, column_time] + [column_prefix + str(i) for i in range(col_number)]
            else:
                col_number = len(df_notes_embeddings.columns) - 1
                df_notes_embeddings.columns = [column_id] + [column_prefix + str(i) for i in range(col_number)]

        elif frequency == "Admission":
            # Iterate over patients
            for patient_id in set(dataframe[column_id]):
                df_patient = pd.DataFrame(dataframe.loc[dataframe[column_id] == patient_id])
                # Iterate over admissions
                for admission_id in set(df_patient[column_admission]):
                    df_admission = df_patient.loc[df_patient[column_admission] == admission_id]
                    df_admission_embeddings = pd.DataFrame(
                        [self.get_biobert_embeddings_from_event_list(df_admission[column_text], df_admission[column_weight])])
                    # Insert admission_time in the dataframe
                    df_admission_embeddings.insert(0, column_admission_time, df_admission[column_admission_time].iloc[0])
                    # Insert admission_id in the dataframe if master_table_compatible is false
                    if not master_table_compatible:
                        df_admission_embeddings.insert(0, column_admission, admission_id)
                    # Insert patient_id in the dataframe
                    df_admission_embeddings.insert(0, column_id, patient_id)
                    df_notes_embeddings = pd.concat([df_notes_embeddings, df_admission_embeddings], ignore_index=True)
                self.set_progress(now = round(self._progress["now"] + 1/len(set(dataframe[column_id]))*60, 2))
            # Rename columns
            if master_table_compatible:
                col_number = len(df_notes_embeddings.columns) - 2
                df_notes_embeddings.columns = [column_id, column_admission_time] + [column_prefix + str(i) for i in range(col_number)]
            else:
                col_number = len(df_notes_embeddings.columns) - 3
                df_notes_embeddings.columns = [column_id, column_admission, column_admission_time] + [column_prefix + str(i) for i in range(col_number)]

        elif frequency == "Note":
            # Iterate over all the dataframe
            for index, row in dataframe.iterrows():
                df_row = pd.DataFrame(row).transpose()
                df_row_embeddings = pd.DataFrame(
                    [self.get_biobert_embeddings_from_event_list(df_row[column_text], pd.Series([1]))])
                # Insert time in the dataframe
                df_row_embeddings.insert(0, column_time, df_row[column_time].item())
                # Insert patient_id in the dataframe
                df_row_embeddings.insert(0, column_id, df_row[column_id].item())
                df_notes_embeddings = pd.concat([df_notes_embeddings, df_row_embeddings], ignore_index=True)
                self.set_progress(now = round(self._progress["now"] + 1/len(dataframe)*60, 2))
            # Rename columns
            col_number = len(df_notes_embeddings.columns) - 2
            df_notes_embeddings.columns = [column_id, column_time] + [column_prefix + str(i) for i in range(col_number)]

        elif column_time != "":
            # Iterate over patients
            for patient_id in set(dataframe[column_id]):
                df_patient = pd.DataFrame(dataframe.loc[dataframe[column_id] == patient_id]).sort_values(by=[column_time])
                # Iterate over time
                start_date = df_patient[column_time].iloc[0]
                end_date = start_date + frequency
                last_date = df_patient[column_time].iloc[-1]
                while start_date <= last_date:
                    df_time = pd.DataFrame(df_patient[(df_patient[column_time] >= start_date) & (df_patient[column_time] < end_date)])
                    if len(df_time) > 0:
                        df_time_embeddings = pd.DataFrame(
                            [self.get_biobert_embeddings_from_event_list(df_time[column_text], df_time[column_weight])])
                        # Insert time in the dataframe (only start date if master_table_compatible)
                        if not master_table_compatible:
                            df_time_embeddings.insert(0, "end_date", end_date)
                        df_time_embeddings.insert(0, "start_date", start_date)
                        # Insert patient_id in the dataframe
                        df_time_embeddings.insert(0, column_id, patient_id)
                        df_notes_embeddings = pd.concat([df_notes_embeddings, df_time_embeddings], ignore_index=True)
                    start_date += frequency
                    end_date += frequency
                self.set_progress(now = round(self._progress["now"] + 1/len(set(dataframe[column_id]))*60, 2))
            # Rename columns
            if master_table_compatible:
                col_number = len(df_notes_embeddings.columns) - 2
                df_notes_embeddings.columns = [column_id, "start_date"] + [column_prefix + str(i) for i in range(col_number)]
            else:
                col_number = len(df_notes_embeddings.columns) - 3
                df_notes_embeddings.columns = [column_id, "start_date", "end_date"] + [column_prefix + str(i) for i in range(col_number)]

        return df_notes_embeddings

    def _custom_process(self, json_config: dict) -> dict:
        """
        Run text notes extraction using BioBERT pre-trained model.

        Returns: self.results : dict containing data relative to extraction.

        """
        go_print(json.dumps(json_config, indent=4))

        # Set local variables
        selected_columns = json_config["relativeToExtractionType"]["selectedColumns"]
        column_prefix = json_config["relativeToExtractionType"]["columnPrefix"] + '_attr'
        columnKeys = [key for key in selected_columns]
        columnValues = []
        for key in columnKeys:
            if selected_columns[key] != "":
                columnValues.append(selected_columns[key])
        frequency = json_config["relativeToExtractionType"]["frequency"]
        if frequency == "HourRange":
            frequency = datetime.timedelta(hours=json_config["relativeToExtractionType"]["hourRange"])

        # Set biobert parameters
        self.BIOBERT_PATH =  os.path.join(str(Path(json_config["csvPath"]).parent.absolute()), "pretrained_bert_tf", "biobert_pretrain_output_all_notes_150000")
        self.BIOBERT_TOKENIZER = AutoTokenizer.from_pretrained(self.BIOBERT_PATH)
        self.BIOBERT_MODEL = AutoModel.from_pretrained(self.BIOBERT_PATH)

        # Read extraction data
        self.set_progress(label="Read Data", now=10)
        df_notes = dd.read_csv(json_config["csvPath"])
        df_notes = df_notes[columnValues]

        # Pre-processing on data
        self.set_progress(label="Pre-processing data", now=20)
        if selected_columns["time"] != "":
            df_notes = df_notes.astype({selected_columns["time"] : "datetime64[ns]"})
        df_notes = df_notes.dropna(subset=columnValues).compute()

        # Feature extraction
        self.set_progress(label="Feature Extraction", now=30)
        df_extracted_features = self.generate_biobert_notes_embeddings(df_notes, frequency, 
                                                                selected_columns["patientIdentifier"], 
                                                                selected_columns["notesWeight"], 
                                                                selected_columns["notes"],
                                                                column_prefix,
                                                                json_config["relativeToExtractionType"]["masterTableCompatible"],
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


script = GoExecScriptBioBERTExtraction(json_params_dict, id_)
script.start()
