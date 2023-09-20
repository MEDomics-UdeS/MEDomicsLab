from flask import jsonify


def get_json_from_request(request):
    data = request.get_json()
    data = jsonify(data)
    json_config = data.json
    return json_config['json2send']