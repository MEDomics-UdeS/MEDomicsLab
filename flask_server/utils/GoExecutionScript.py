import json
import os
import sys
import threading
import time
import traceback
from abc import ABC, abstractmethod
import asyncio
from typing import Tuple, Any

import argparse
from utils.server_utils import go_print


def parse_arguments() -> tuple[dict, str]:
    """
    Parses the arguments of the script

    Returns:
        A tuple of the json params and the id
    """
    parser = argparse.ArgumentParser()
    parser.add_argument('--json-param', type=str, default='.')
    parser.add_argument('--id', type=str, default='.')
    args = parser.parse_args()
    json_params = json.loads(args.json_param)
    id_ = args.id
    return json_params, id_


def get_response_from_error(e=None, toast=None):
    """
    Gets the response from an error

    Args:
        e: The error
        toast: The toast message to send to the client, ignored if e is not None
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
        return {"error": {"message": str(e), "stack_trace": str(stack_trace), "value": str(ex_value)}}
    elif toast is not None:
        return {"error": {"toast": toast}}


class GoExecutionScript(ABC):
    """
    This class is used to execute a process in Go

    Args:
        json_params: The json params that were sent from the client side
        _id: The id of the process
    """

    def __init__(self, json_params: dict, _id: str = "default_id"):
        self._json_params = json_params
        self._error_handler = None
        self._progress = {"now": 0, "currentLabel": ""}
        self._id = _id

    def start(self):
        """
        Starts the process
        """
        try:
            self.push_progress()
            results = self._custom_process(self._json_params)
            self.send_response(results)
        except BaseException as e:
            if self._error_handler is not None:
                self._error_handler(e)
            self.send_response(get_response_from_error(e))

    def _set_error_handler(self, error_handler: callable):
        """
        Sets the error handler function, so what to do when an error occurs in the process

        Args:
            error_handler: The error handler function

        """
        self._error_handler = error_handler

    def set_progress(self, label: str = None, now: int = None):
        """
        Sets the progress of the process

        Args:
            progress: The progress dictionary
            label: The current label
            now: The current progress

        Description:
            If progress is not None, it will set the progress to the given progress
            If label is not None, it will set the current label to the given label
            If now is not None, it will set the current progress to the given progress
        """
        if label is not None:
            self._progress["currentLabel"] = label
        if now is not None:
            self._progress["now"] = now

        self.push_progress()

    @abstractmethod
    def _custom_process(self, json_params: dict) -> dict:
        """
        Override this method to implement a custom process

        Args:
            json_params: The json params that were sent from the client side
        """
        return get_response_from_error(toast="No process function was provided")

    def push_progress(self):
        """
        handle pushing the progress to the Go server
        """
        print(self._id, json.dumps(self._progress))
        msg = "progress*_*" + self._id + "*_*" + json.dumps(self._progress)
        go_print(msg)

    def send_response(self, response: dict):
        """
        handle sending the response to the Go server

        Args:
            response: The response to send

        """
        to_send = json.dumps(response)
        file_path = os.path.join(os.getcwd(), "temp_requests.txt")
        f = open(file_path, "w")
        f.write(to_send)
        f.close()
        self.set_progress(label="Done", now=100)
        go_print(f"response-ready*_*{file_path}")
