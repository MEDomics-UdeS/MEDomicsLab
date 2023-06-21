import traceback
from MEDml.WorkflowHandler import WorkflowHandler
from MEDml.MEDexperiment import MEDexperiment
from flask import jsonify
import sys


def run_experiment(json_config):
    if 'up_to_id' in json_config:
        up_to_id = json_config['up_to_id']
    else:
        up_to_id = ""
    json_config = json_config['drawflow']
    print(up_to_id)
    json_config_cleaned = clean_json(json_config)
    workflow_handler = WorkflowHandler(json_config_cleaned, up_to_id)
    global experiment
    global df
    try:
        json_config_cleaned['dfs_from_input'] = df.copy()
        pipelines, nb_nodes = workflow_handler.get_pipelines()
        if experiment is None:
            experiment = MEDexperiment(pipelines, json_config_cleaned, nb_nodes)
        else:
            experiment.update(pipelines, json_config_cleaned, nb_nodes)
        experiment.start()
        results_pipeline = {'pipelines_list': workflow_handler.get_pipelines_results_list(experiment.get_results())}

    except BaseException as e:
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

    return results_pipeline

def clean_json(json_config):
    json_config_cleaned = {}
    to_remove = ['html', 'pos_x', 'pos_y', 'typenode']

    json_config_cleaned['ml_type'] = json_config['Home']['ml_type']
    json_config_cleaned['nodes'] = {}
    for module_id, module in json_config.items():
        for id, value in module['data'].items():
            json_config_cleaned['nodes'][id] = {}
            for key, elem in value.items():
                if key not in to_remove:
                    json_config_cleaned['nodes'][id][key] = elem
    for module_id, module in json_config.items():
        if module_id != 'Home':
            # get output of first inside block
            opt_in_start_out = \
                module['data'][[key for key, value in module['data'].items() if value['name'] == 'optimize_start'][0]][
                    'outputs']['output_1']['connections']

            # assign prev connections outputs to output of first inside block
            prev_conn = json_config_cleaned['nodes'][module_id]['inputs']['input_1']['connections']
            for connection in prev_conn:
                opt_prev_id = connection['node']
                json_config_cleaned['nodes'][opt_prev_id]['outputs']['output_1']['connections'] += opt_in_start_out
                # json_config_cleaned['nodes'][opt_prev_id]['outputs']['output_1']['connections']
            for conn in json_config_cleaned['nodes'][opt_prev_id]['outputs']['output_1']['connections']:
                print(conn)
                if json_config_cleaned['nodes'][conn['node']]['name'] == 'optimize':
                    json_config_cleaned['nodes'][opt_prev_id]['outputs']['output_1']['connections'].remove(conn)
            # get output of optimize block
            next_conn = json_config_cleaned['nodes'][module_id]['outputs']['output_1']['connections']

            # assign output of last insdide block to output of optimize block
            opt_in_end_out = \
                module['data'][[key for key, value in module['data'].items() if value['name'] == 'optimize_end'][0]][
                    'inputs']['input_1']['connections']
            for connection in opt_in_end_out:
                opt_in_prev_id = connection['node']
                json_config_cleaned['nodes'][opt_in_prev_id]['outputs']['output_1']['connections'] = next_conn

    # print(json.dumps(json_config_cleaned, indent=4, sort_keys=True))
    return json_config_cleaned