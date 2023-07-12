import traceback
from learning.MEDml.MEDexperiment import MEDexperiment
from flask import Flask, flash, jsonify, redirect, render_template, request, Blueprint
import sys
import json
from utils.server_utils import get_json_from_request


# blueprint definition
app_learning = Blueprint('app_learning', __name__, template_folder='templates', static_folder='static')

# global variables
experiment = None
cur_dashboard = None
files_uploaded = []
df = []


@app_learning.route("/run_experiment", methods=["POST"]) 
def run_experiment():
    json_config = get_json_from_request(request)
    print("received data from topic: /run_experiment:")
    print(json.dumps(json_config, indent=4, sort_keys=True))

    global experiment
    global df
    try:
        json_config = json_config['json2send']
        if experiment is None:
            experiment = MEDexperiment(json_config)
        else:
            experiment.update(json_config)
        experiment.start()
        results_pipeline = experiment.get_results()

    except BaseException as e:
        print(e)
        ex_type, ex_value, ex_traceback = sys.exc_info()
        trace_back = traceback.extract_tb(ex_traceback)
        stack_trace = ''
        for trace in trace_back:
            stack_trace += \
                "\nFile -> %s \nLine -> %d\nFunc.Name -> %s\nMessage -> %s\n" % (trace[0], trace[1], trace[2], trace[3])

        print("Exception type : %s " % ex_type.__name__)
        print("Exception message : %s" % ex_value)
        print("Stack trace : %s" % stack_trace)
        experiment = None
        return jsonify({"error": {"message": str(e), "stack_trace": str(stack_trace), "value": str(ex_value)}})

    return results_pipeline


@app_learning.route('/progress', methods=['POST'])
def progress():
    json_config = get_json_from_request(request)
    global experiment
    if experiment is not None:
        return experiment.get_progress()
    else:
        return {'cur_node': '', 'progress': 0}


if __name__ == '__main__':
    app_learning.run(debug=True, port=5000)
