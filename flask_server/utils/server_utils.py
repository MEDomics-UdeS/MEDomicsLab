from flask import jsonify
import sys
import traceback
import os
from pathlib import Path


def get_json_from_request(request):
    """
    Gets the json from the request
    """
    data = request.get_json()
    data = jsonify(data)
    json_config = data.json
    return json_config['json2send']


def get_response_from_error(e=None, toast=None):
    """
    Gets the response from an error
    """
    if e is not None:
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
        return jsonify({"error": {"message": str(e), "stack_trace": str(stack_trace), "value": str(ex_value)}})
    elif toast is not None:
        return jsonify({"toast": toast})


def get_repo_path():
    """
    Gets the path of the repository
    """
    return str(Path(os.path.dirname(os.path.abspath(__file__))).parent.parent)


def go_print(msg):
    sys.stdout.flush()
    print(msg)
    sys.stdout.flush()
