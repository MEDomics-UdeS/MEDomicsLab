"""
File: models_settings_generator.py
Author: Guillaume Blain
Date: 2023-10-04

Description: This script generate automatically models settings accordingly to the selected machine learning for the MEDml app.
"""

from pycaret.datasets import get_data
import inspect
import json

# python script arguments
import argparse
parser = argparse.ArgumentParser(description='Script so useful.')
parser.add_argument("--mlType", type=str, default="regression", help="machine learning type to generate settings for (classification or regression)")
parser.add_argument("--path", type=str, default=".", help="path to save the settings file to")
args = parser.parse_args()

ml_type = args.mlType
data = None
target = None
if ml_type == "classification":
    data = get_data('juice')
    target = 'Purchase'
    from pycaret.classification import *
elif ml_type == "regression":
    data = get_data('insurance')
    target = 'charges'
    from pycaret.regression import *

exp_name = setup(data=data, target=target)


all_models = models()
model_list = all_models.T.columns.tolist()
model_trained_list = []
for model in model_list:
    model_trained = create_model(model)
    model_trained_list.append((model_trained, model))

# print(all_models)


models_options = {}
for model, id in model_trained_list:
    # print()
    # print(id, model)
    models_options[id] = {}
    models_options[id]['options'] = {}
    models_options[id]['code'] = id
    # print(model.__class__.__name__)
    members_list = inspect.getmembers(model)
    for tuple in members_list:
        if tuple[0] == '__dict__':
            dict = tuple[1]
            for key in dict:
                if key[-1] != '_' and key[0] != '_':
                    models_options[id]['options'][key] = {'type': getattr(model, key).__class__.__name__ if getattr(model, key).__class__.__name__ != 'str' else 'string',
                                                          'default_val': str(dict[key]),
                                                          'tooltip': 'tooltip not implemented'}

with open(f"{args.path}/{ml_type}ModelSettings.js", 'w') as f:
    f.write("/* eslint-disable */\n")
    f.write(f"const {ml_type}ModelSettings = {json.dumps(models_options, indent=4)};\n export default {ml_type}ModelSettings;")

print("finished", ml_type)