from flask import Flask, request, jsonify
from learning.learning_processing import run_experiment
from utils.server_utils import get_json_from_request
import json

app = Flask(__name__)

@app.route('/test', methods=['GET', 'POST'])
def test():
    data = get_json_from_request(request)
    print("received data from topic: /test:")
    print(json.dumps(data, indent=4, sort_keys=True))
    return jsonify({"test": "réussi"})

@app.route("/run_experiment", methods=["POST"])
def run_experiment():
    data = get_json_from_request(request)
    print("received data from topic: /run_experiment:")
    print(json.dumps(data, indent=4, sort_keys=True))
    return run_experiment(data)

if __name__ == '__main__':
    app.run(debug=True, port=5000)