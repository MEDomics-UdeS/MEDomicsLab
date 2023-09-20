from flask import jsonify
import sys
import traceback


def get_json_from_request(request):
    data = request.get_json()
    data = jsonify(data)
    json_config = data.json
    return json_config['json2send']

def get_response_from_error(e):
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