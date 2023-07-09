import sys
from flask import Flask, render_template, request, redirect, url_for, flash, jsonify, Blueprint
from flask_cors import CORS
from learning.learning_processing import run_experiment
from utils.server_utils import get_json_from_request
import json

# Import blueprint for extraction tab
from app_extraction_blueprint import app_extraction

# Creating main instance of Flask app
app = Flask(__name__)

# Configure Flask-CORS to specify that only requests coming from local port 8888 are allowed 
# to access the API route 
CORS(app, resources={r"/*": {"origins": "http://localhost:8888"}})

# Register blueprint for extraction tab
app.register_blueprint(app_extraction, url_prefix='/extraction')

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

# Test server to receive message
@app.route("/message", methods=["POST"])
def receive_message():
    data = request.json
    message = data["message"]
    # Process the message or perform any necessary logic
    response = {"response": f"Received message: {message}"}
    return jsonify(response)



if __name__ == '__main__':
    app.run(debug=True, port=5000)