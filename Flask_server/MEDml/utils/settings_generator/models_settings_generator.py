
from pycaret.datasets import get_data
import inspect
import json

# ml_type = "regression"
ml_type = "classification"
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
                    # print('('+getattr(model, key).__class__.__name__+') ' + key + ' = ' + str(dict[key]))
# models_options
# print(json.dumps(models_options, indent=4))

# ml_type = "survival_analysis"
with open(f"C:\\Users\\gblai\\OneDrive\\Documents\\ECOLE\\Stage\\GRIIS_Medomics\\MEDml\\flaskProject\\static\\possible_settings\\{ml_type}_models_settings.js", 'w') as f:
    f.write(f"var {ml_type}_models_settings = {json.dumps(models_options, indent=4)};")

print("finished", ml_type)