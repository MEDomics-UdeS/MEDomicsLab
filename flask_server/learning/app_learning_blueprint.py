from learning.MEDml.MEDexperiment_old import MEDexperiment
from flask import request, Blueprint
import json
from utils.server_utils import get_json_from_request, get_response_from_error
import os
from pathlib import Path

MEDOMICS_WS = str(Path(os.path.dirname(
    os.path.abspath(__file__))).parent.parent)
print(MEDOMICS_WS)
cwd = os.getcwd()
isFrontSlash = cwd.find("/")
if os.getcwd().find("/") == -1:
    MEDOMICS_WS = MEDOMICS_WS.replace("/", "\\")

# blueprint definition
app_learning = Blueprint('app_learning', __name__,
                         template_folder='templates', static_folder='static')

# global variables
experiments = {}
cur_dashboard = None
files_uploaded = []
df = []


@app_learning.route("/run_experiment/<id_>", methods=["POST"])
def run_experiment(id_):
    """
    triggered by the button play in the dashboard, it starts the execution of the pipeline

    Returns: the results of the pipeline execution
    """
    json_config = get_json_from_request(request)
    print("received data from topic: /run_experiment:")
    print(json.dumps(json_config, indent=4, sort_keys=True))
    scene_id = id_
    global experiments
    try:
        if scene_id not in experiments:
            experiments[scene_id] = MEDexperiment(json_config)
        else:
            experiments[scene_id].update(json_config)
        experiments[scene_id].start()
        results_pipeline = experiments[scene_id].get_results()
        experiments[scene_id]._progress['now'] = 100
        json.dumps(results_pipeline)
    except BaseException as e:
        if scene_id in experiments:
            del experiments[scene_id]
        return get_response_from_error(e)

    return results_pipeline


@app_learning.route('/progress/<id_>', methods=['POST'])
def progress(id_):
    """
    triggered each x millisecond by the dashboard, it returns the progress of the pipeline execution

    Returns: the progress of the pipeline execution

    """

    global experiments
    if id_ in experiments:
        return experiments[id_].get_progress()
    else:
        return {'now': 0, 'currentLabel': ''}
