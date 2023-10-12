import dask.dataframe as dd
import os

from flask import request, Blueprint
from pathlib import Path
from tsfresh import extract_features
from tsfresh.feature_extraction import ComprehensiveFCParameters, EfficientFCParameters, MinimalFCParameters
from tsfresh.utilities.dataframe_functions import impute
from utils.server_utils import get_json_from_request

# blueprint definition
app_extraction_ts = Blueprint('app_extraction_ts', __name__, template_folder='templates', static_folder='static')

# global variable
progress = 0
step = "initialization"


@app_extraction_ts.route("/TSfresh_extraction", methods=["GET", "POST"]) 
def TSFresh_extraction():
    """
    Run time series extraction using TSfresh library.

    Returns: json_config : dict containing data relative to extraction.

    """
    # global variables
    global progress
    global step
    progress = 0
    step = "initialization"

    # Set local variables
    json_config = get_json_from_request(request)
    selected_columns = json_config["relativeToExtractionType"]["selectedColumns"]
    columnKeys = [key for key in selected_columns]
    columnValues = [selected_columns[key] for key in columnKeys]

    # Read extraction data
    progress = 10
    step = "Read Data"  
    df_ts = dd.read_csv(json_config["csvPath"])
    df_ts = df_ts[columnValues]

    # Pre-processing on data
    progress = 20
    step = "Pre-processing data"
    df_ts = df_ts.dropna(subset=columnValues)

    # Feature extraction
    progress = 30
    step = "Feature Extraction"
    if json_config["relativeToExtractionType"]["featuresOption"] == "Efficient":
        settings = EfficientFCParameters()
    elif json_config["relativeToExtractionType"]["featuresOption"] == "Minimal":
        settings = MinimalFCParameters()
    else:
        settings = ComprehensiveFCParameters()
    df_extracted_features = extract_features(df_ts, column_id=selected_columns["patientIdentifier"], 
                                                    column_sort=selected_columns["measurementWeight"], 
                                                    column_kind=selected_columns["measuredItemIdentifier"], 
                                                    column_value=selected_columns["measurementValue"],
                                                    default_fc_parameters=settings).compute()

    # Imute Nan values
    progress = 80
    step = "Impute extracted features"
    impute(df_extracted_features)

    # Save extracted features
    progress = 90
    step = "Save extracted features"
    csv_result_path = os.path.join(str(Path(json_config["csvPath"]).parent.absolute()), json_config['filename'])
    df_extracted_features.to_csv(csv_result_path)
    json_config["csv_result_path"] = csv_result_path
    return json_config 
    

@app_extraction_ts.route("/progress", methods=["POST"])
def extraction_progress():
    """
    Triggered each x millisecond by the dashboard, it returns the progress of the extraction execution.

    Returns: the progress of the extraction execution

    """
    global progress
    global step
    return {"progress": progress, "step": step}
