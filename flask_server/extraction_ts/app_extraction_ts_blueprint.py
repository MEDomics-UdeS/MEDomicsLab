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


@app_extraction_ts.route("/TSFresh_extraction", methods=["GET", "POST"]) 
def TSFresh_extraction():
    global progress
    global step
    json_config = get_json_from_request(request)
    columnKeys = [key for key in json_config["selectedColumns"]]
    columnValues = [json_config["selectedColumns"][key] for key in columnKeys]
    progress = 10
    step = "Read Data"
    df_ts = dd.read_csv(json_config["csvPath"])
    df_ts = df_ts[columnValues]
    progress = 20
    step = "Pre-processing data"
    df_ts = df_ts.dropna(subset=[json_config["selectedColumns"]["patientIdentifier"], 
                                 json_config["selectedColumns"]["measurementDatetimeStart"], 
                                 json_config["selectedColumns"]["measuredItemIdentifier"], 
                                 json_config["selectedColumns"]["measurementValue"]])
    progress = 30
    step = "Feature Extraction"
    df_extracted_features = extract_features(df_ts, column_id=json_config["selectedColumns"]["patientIdentifier"], 
                                                    column_sort=json_config["selectedColumns"]["measurementDatetimeStart"], 
                                                    column_kind=json_config["selectedColumns"]["measuredItemIdentifier"], 
                                                    column_value=json_config["selectedColumns"]["measurementValue"]).compute()
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
