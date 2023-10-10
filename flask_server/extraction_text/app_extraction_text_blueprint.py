import dask.dataframe as dd
import numpy as np
import os
import pandas as pd

from flask import request, Blueprint
from pathlib import Path
from utils.server_utils import get_json_from_request
from transformers import AutoTokenizer, AutoModel

# blueprint definition
app_extraction_text = Blueprint('app_extraction_text', __name__, template_folder='templates', static_folder='static')

# global variables
progress = 0
step = "initialization"
BIOBERT_PATH =  ""
BIOBERT_TOKENIZER = None
BIOBERT_MODEL = None


def split_note_document(text, min_length=15):
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
    tokens_list_0 = BIOBERT_TOKENIZER.tokenize(text)

    if len(tokens_list_0) <= 510:
        return [text], [1]

    chunk_parse = []
    chunk_length = []
    chunk = text

    # Go through text and aggregate in groups up to 510 tokens (+ padding)
    tokens_list = BIOBERT_TOKENIZER.tokenize(chunk)
    if len(tokens_list) >= 510:
        temp = chunk.split('\n')
        ind_start = 0
        len_sub = 0
        for i in range(len(temp)):
            temp_tk = BIOBERT_TOKENIZER.tokenize(temp[i])
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


def get_biobert_embeddings(text):
    """
    Function taken from the GitHub repository of the HAIM study. Obtain BioBERT embeddings of text string.

    :param text: Input text (str).

    :return: embeddings: Final Biobert embeddings with vector dimensionality = (1,768).
             hidden_embeddings: Last hidden layer in Biobert model with vector dimensionality = (token_size,768).

    """
    tokens_pt = BIOBERT_TOKENIZER(text, return_tensors="pt")
    outputs = BIOBERT_MODEL(**tokens_pt)
    last_hidden_state = outputs.last_hidden_state
    pooler_output = outputs.pooler_output
    hidden_embeddings = last_hidden_state.detach().numpy()
    embeddings = pooler_output.detach().numpy()

    return embeddings, hidden_embeddings


def get_biobert_embeddings_from_event_list(event_list, event_weights):
    """
    Function taken from the GitHub repository of the HAIM study. For notes obtain fixed-size BioBERT embeddings.

    :param event_list: Timebound ICU patient stay structure filtered by max_time_stamp or min_time_stamp if any.
    :param event_weights: Weights for aggregation of features in final embeddings.

    :return: aggregated_embeddings: BioBERT event features for all events.

    """
    event_weights_exp = []
    for idx, event_string in enumerate(event_list):
        weight = event_weights.values[idx]
        string_list, lengths = split_note_document(event_string)
        for idx_sub, event_string_sub in enumerate(string_list):
            # Extract biobert embedding
            embedding, hidden_embedding = get_biobert_embeddings(event_string_sub)
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


def generate_biobert_notes_embeddings(dataframe, column_id, column_weight, column_text):
    """
    Function generated notes embeddings from BioBERT pre-trained model.

    :param dataframe: Pandas dataframe containing necessary data to proceed.
    :param column_id: Column name in the dataframe containing patient identifiers.
    :param column_weight: Column name in the dataframe containing weights of the text notes.
    :param column_text: Column name in the dataframe containing the text notes.

    :return: df_notes_embeddings: Generated notes embeddings from BioBERT.

    """
    # Create dataframe
    df_notes_embeddings = pd.DataFrame()

    # Iterate over patients
    for patient_id in set(dataframe[column_id]):
        df_patient = dataframe.loc[dataframe[column_id] == patient_id]
        df_patient_embeddings = pd.DataFrame(
            [get_biobert_embeddings_from_event_list(df_patient[column_text], df_patient[column_weight])])
        # Insert patient_id in the dataframe
        df_patient_embeddings.insert(0, column_id, patient_id)
        df_notes_embeddings = pd.concat([df_notes_embeddings, df_patient_embeddings], ignore_index=True)

    return df_notes_embeddings



@app_extraction_text.route("/BioBERT_extraction", methods=["GET", "POST"]) 
def BioBERT_extraction():
    """
    Run text notes extraction using BioBERT pre-trained model.

    Returns: json_config : dict containing data relative to extraction.

    """
    # global variables
    global progress
    global step
    global BIOBERT_PATH
    global BIOBERT_TOKENIZER
    global BIOBERT_MODEL
    progress = 0
    step = "initialization"

    # Set local variables
    json_config = get_json_from_request(request)
    selected_columns = json_config["relativeToExtractionType"]["selectedColumns"]
    columnKeys = [key for key in selected_columns]
    columnValues = [selected_columns[key] for key in columnKeys]

    # Set biobert parameters
    BIOBERT_PATH =  os.path.join(str(Path(json_config["csvPath"]).parent.absolute()), 'pretrained_bert_tf/biobert_pretrain_output_all_notes_150000/')
    BIOBERT_TOKENIZER = AutoTokenizer.from_pretrained(BIOBERT_PATH)
    BIOBERT_MODEL = AutoModel.from_pretrained(BIOBERT_PATH)

    # Read extraction data
    progress = 10
    step = "Read Data"  
    df_notes = dd.read_csv(json_config["csvPath"])
    df_notes = df_notes[columnValues]

    # Pre-processing on data
    progress = 20
    step = "Pre-processing data"
    df_notes = df_notes.dropna(subset=columnValues).compute()

    # Feature extraction
    progress = 30
    step = "Feature Extraction"
    df_extracted_features = generate_biobert_notes_embeddings(df_notes, selected_columns["patientIdentifier"], 
                                                              selected_columns["notesWeight"], selected_columns["notes"])

     # Save extracted features
    progress = 90
    step = "Save extracted features"
    csv_result_path = os.path.join(str(Path(json_config["csvPath"]).parent.absolute()), json_config['filename'])
    df_extracted_features.to_csv(csv_result_path)
    json_config["csv_result_path"] = csv_result_path

    return json_config 
    

@app_extraction_text.route("/progress", methods=["POST"])
def extraction_progress():
    """
    Triggered each x millisecond by the dashboard, it returns the progress of the extraction execution.

    Returns: the progress of the extraction execution

    """
    global progress
    global step
    return {"progress": progress, "step": step}
