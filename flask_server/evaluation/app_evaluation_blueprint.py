from flask import request, Blueprint
import json
from utils.server_utils import get_json_from_request, get_response_from_error
import os
import pickle

# blueprint definition
app_evaluation = Blueprint('app_evaluation', __name__,
                           template_folder='templates', static_folder='static')

# global variables


@app_evaluation.route("/create_dashboard", methods=["POST"])
def create_dashboard(id_):
    json_params = get_json_from_request(request)
    print("received data from topic: /create_dashboard:")
    print(json.dumps(json_params, indent=4, sort_keys=True))

    return json.dumps({'status': 'ok'})
