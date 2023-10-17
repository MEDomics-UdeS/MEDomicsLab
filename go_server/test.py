import json
import time
import sys
import argparse

# handle argument --path
parser = argparse.ArgumentParser()
parser.add_argument('--json-param', type=str, default='.')
args = parser.parse_args()
global_json_params = json.loads(args.json_param)
print(json.dumps(global_json_params, indent=4))
sys.stdout.flush()

test = {
    "test": "test",
    "test2": "test2",
    "test3": "test3"
}


def send_response(response: dict):
    sys.stdout.flush()
    print("response-incoming")
    sys.stdout.flush()
    print(json.dumps(response))
    sys.stdout.flush()


send_response(test)
