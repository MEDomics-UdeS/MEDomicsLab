from flask import Flask, request, jsonify
from learning.app_learning_blueprint import app_learning
from utils.server_utils import get_json_from_request
import json
import argparse
parser = argparse.ArgumentParser(description='Script so useful.')
parser.add_argument("--port", type=int, default=5000, help="port to run the server on")
args = parser.parse_args()

# app definition and blueprint registration
app = Flask(__name__)
app.register_blueprint(app_learning, url_prefix='/learning')


@app.route('/test', methods=['GET', 'POST'])
def test():
    """
    Test function to check if the server is running

    Returns: a json object with the message "test": "réussi" if the server is running
    """
    data = get_json_from_request(request)
    print("received data from topic: /test:")
    print(json.dumps(data, indent=4, sort_keys=True))
    return jsonify({"test": "réussi"})


if __name__ == '__main__':
    app.run(debug=True, port=args.port, use_reloader=False)
