from learning.MEDml.MEDexperiment_learning import MEDexperimentLearning
from flask import request, Blueprint
import json
from utils.server_utils import get_json_from_request, get_response_from_error
import os
from pathlib import Path
import pickle
import psutil
from memory_profiler import profile
import gc

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
current_experiments = {}
exp_progress = {}


@app_learning.route("/run_experiment/<id_>", methods=["POST"])
def run_experiment(id_):
    """
    triggered by the button play in the dashboard, it starts the execution of the pipeline

    Returns: the results of the pipeline execution
    """
    json_config = get_json_from_request(request)
    return handle_run_experiment(id_, json_config)


@profile
def handle_run_experiment(id_, json_config):
    print("received data from topic: /run_experiment:")
    print(json.dumps(json_config, indent=4, sort_keys=True))
    scene_id = id_
    global current_experiments
    global exp_progress
    try:
        if not is_experiment_exist(scene_id):
            current_experiments[scene_id] = MEDexperimentLearning(json_config)
        else:
            exp_progress[scene_id] = {'now': 0, 'currentLabel': 'Loading the experiment'}
            current_experiments[scene_id] = load_experiment(scene_id)
            current_experiments[scene_id].update(json_config)
        current_experiments[scene_id].start()
        results_pipeline = current_experiments[scene_id].get_results()
        current_experiments[scene_id].set_progress(label='Saving the experiment')
        save_experiment(current_experiments[scene_id])
        del current_experiments[scene_id]
        gc.collect()
        exp_progress[scene_id] = {'now': 100, 'currentLabel': 'Done!'}
        print("experiment saved and deleted from memory")
    except BaseException as e:
        del exp_progress[scene_id]
        if scene_id in current_experiments:
            del current_experiments[scene_id]
        return get_response_from_error(e)

    return results_pipeline


@app_learning.route('/progress/<id_>', methods=['POST'])
def progress(id_):
    """
    triggered each x millisecond by the dashboard, it returns the progress of the pipeline execution

    Returns: the progress of the pipeline execution

    """
    global exp_progress
    global current_experiments
    if id_ in current_experiments:
        return current_experiments[id_].get_progress()
    else:
        if id_ in exp_progress:
            return exp_progress[id_]
        else:
            return {'now': 0, 'currentLabel': 'Error occured, preparing details'}


def save_experiment(experiment: MEDexperimentLearning):
    """
    triggered by the button save in the dashboard, it saves the pipeline execution

    Returns: the results of the pipeline execution
    """
    print("saving experiment")
    experiment.make_save_ready()
    with open('local_dir/MEDexperiment_' + experiment.id + '.medexp', 'wb') as f:
        pickle.dump(experiment, f)
        del experiment


def load_experiment(id_):
    """
    triggered by the button load in the dashboard, it loads the pipeline execution

    Returns: the previously saved MEDexperiment
    """
    print("loading experiment")
    with open('local_dir/MEDexperiment_' + id_ + '.medexp', 'rb') as f:
        experiment = pickle.load(f)
        experiment.init_obj()
        return experiment


def is_experiment_exist(id_):
    """
    triggered by the button load in the dashboard, it loads the pipeline execution

    Returns: the results of the pipeline execution
    """
    return os.path.exists('local_dir/MEDexperiment_' + id_ + '.medexp')
