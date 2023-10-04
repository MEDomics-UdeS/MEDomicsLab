import dask.dataframe as dd
import os

from flask import request, Blueprint
from pathlib import Path
from tsfresh import extract_features
from tsfresh.utilities.dataframe_functions import impute
from utils.server_utils import get_json_from_request

# blueprint definition
app_extraction_ts = Blueprint('app_extraction_ts', __name__, template_folder='templates', static_folder='static')

# global variable
progress = 0
step = "initialization"


@app_extraction_ts.route("/TSfresh_extraction", methods=["GET", "POST"]) 
def TSFresh_extraction():
    global progress
    global step
    json_config = get_json_from_request(request)
    columnKeys = [key for key in json_config["relativeToExtractionType"]["selectedColumns"]]
    columnValues = [json_config["relativeToExtractionType"]["selectedColumns"][key] for key in columnKeys]
    progress = 10
    step = "Read Data"
    df_ts = dd.read_csv(json_config["csvPath"])
    df_ts = df_ts[columnValues]
    progress = 20
    step = "Pre-processing data"
    df_ts = df_ts.dropna(subset=[json_config["relativeToExtractionType"]["selectedColumns"]["patientIdentifier"], 
                                 json_config["relativeToExtractionType"]["selectedColumns"]["measurementWeight"], 
                                 json_config["relativeToExtractionType"]["selectedColumns"]["measuredItemIdentifier"], 
                                 json_config["relativeToExtractionType"]["selectedColumns"]["measurementValue"]])
    progress = 30
    step = "Feature Extraction"
    df_extracted_features = extract_features(df_ts, column_id=json_config["relativeToExtractionType"]["selectedColumns"]["patientIdentifier"], 
                                                    column_sort=json_config["relativeToExtractionType"]["selectedColumns"]["measurementWeight"], 
                                                    column_kind=json_config["relativeToExtractionType"]["selectedColumns"]["measuredItemIdentifier"], 
                                                    column_value=json_config["relativeToExtractionType"]["selectedColumns"]["measurementValue"]).compute()
    progress = 80
    step = "Impute extracted features"
    impute(df_extracted_features)
    progress = 90
    step = "Save extracted features"
    csv_result_path = os.path.join(str(Path(json_config["csvPath"]).parent.absolute()), json_config['filename'])
    df_extracted_features.to_csv(csv_result_path)
    json_config["csv_result_path"] = csv_result_path
    return json_config 

@app_extraction_ts.route("/progress", methods=["POST"])
def extraction_progress():
    global progress
    global step
    return {"progress": progress, "step": step}
