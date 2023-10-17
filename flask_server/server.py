from learning.app_learning_blueprint import app_learning
from extraction_text.app_extraction_text_blueprint import app_extraction_text
from extraction_ts.app_extraction_ts_blueprint import app_extraction_ts
from extraction.app_extraction_blueprint import app_extraction
from input.app_input_blueprint import app_input
import json
import argparse
from flask import Flask, request, jsonify
from utils.server_utils import get_json_from_request
import argparse
parser = argparse.ArgumentParser(description='Script so useful.')
parser.add_argument("--port", type=int, default=5000,
                    help="port to run the server on")
args = parser.parse_args()

# Import blueprints

# Creating main instance of Flask app
app = Flask(__name__)

# Register blueprints
app.register_blueprint(app_extraction, url_prefix='/extraction')
app.register_blueprint(app_learning, url_prefix='/learning')
app.register_blueprint(app_extraction_text, url_prefix='/extraction_text')
app.register_blueprint(app_extraction_ts, url_prefix='/extraction_ts')
app.register_blueprint(app_input, url_prefix='/input')


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
    app.run(debug=True, port=args.port, use_reloader=False, threaded=True)
