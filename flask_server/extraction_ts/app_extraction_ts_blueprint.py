import dask.dataframe as dd
import os

from flask import request, Blueprint
from pathlib import Path
from tsfresh import extract_features
from utils.server_utils import get_json_from_request

# blueprint definition
app_extraction_ts = Blueprint('app_extraction_ts', __name__, template_folder='templates', static_folder='static')


@app_extraction_ts.route("/TSFresh_extraction", methods=["GET", "POST"]) 
def TSFresh_extraction():
    json_config = get_json_from_request(request)
    columnKeys = [key for key in json_config["selectedColumns"]]
    columnValues = [json_config["selectedColumns"][key] for key in columnKeys]
    df_ts = dd.read_csv(json_config["csvPath"])
    df_ts = df_ts[columnValues]
    df_ts = df_ts.dropna(subset=[json_config["selectedColumns"]["measurementValue"]]).sample(frac=0.01)
    df_extracted_features = extract_features(df_ts, column_id=json_config["selectedColumns"]["patientIdentifier"], 
                                                    column_sort=json_config["selectedColumns"]["measurementDatetimeStart"], 
                                                    column_kind=json_config["selectedColumns"]["measuredItemIdentifier"], 
                                                    column_value=json_config["selectedColumns"]["measurementValue"],
                                                    pivot=True) #When pivot is set to True it's consuming a lot of time
    csv_result_path = os.path.join(str(Path(json_config["csvPath"]).parent.absolute()), "tmp_extraction_result_*.csv")
    json_config["csv_result_path"] = df_extracted_features.to_csv(csv_result_path)
    return json_config 