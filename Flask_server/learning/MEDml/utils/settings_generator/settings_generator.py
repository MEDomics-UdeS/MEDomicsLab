from selenium import webdriver
from selenium.webdriver.common.by import By
from webdriver_manager.chrome import ChromeDriverManager
import json
import dpath.util as dp
from collections import MutableMapping

# options = Options()
# options.headless = True
ml_type = "regression"
# ml_type = "classification"
# ml_type = "survival_analysis"
browser = webdriver.Chrome(ChromeDriverManager().install())
browser.get(f"https://pycaret.readthedocs.io/en/latest/api/{ml_type}.html")
classification = {}
ml_type_container = browser.find_elements(By.XPATH, value=f"//section[@id='{ml_type}']")
py_functions = ml_type_container[0].find_elements(By.XPATH, value="./dl[@class='py class']")[0].find_elements(By.XPATH, value="./dd")[0].find_elements(By.XPATH, value="./dl[@class='py method']")

estimators_names = ['estimator', 'meta_model', 'model', 'api_name', 'include']

types_conversion = {
    'str': 'string',
    'list of str': 'custom-list',
    'int or float': 'float',
    'list or list of list': 'custom-list',
    'list': 'custom-list',
    'bool or list': 'bool',
    'str or sklearn CV generator object': 'string',
    'bool or str': 'list',
    'list of str or scikit-learn compatible object': 'list-multiple',
    'int or scikit-learn compatible CV generator': 'int',
    'str or scikit-learn compatible object': 'list',
    'scikit-learn compatible object': 'list',
    'dictionary': 'dict',
    'integer': 'int',
}

nodes_options = {
    'split': {
        "info": ["train_size", "data_split_stratify", "data_split_shuffle"],
        "code": """
def split_data(Dataset, node_settings):
    # do yo things here
    return Dataset1, Dataset2
"""
    },
    'clean': {
        "info": ["imputation_type",
              "normalize",
              "normalize_method",
              "iterative_imputation_iters",
              "categorical_imputation",
              "categorical_iterative_imputer",
              "numeric_imputation",
              "numeric_iterative_imputer",
              "transformation",
              "transformation_method",
              "pca",
              "pca_method",
              "pca_components",
              "remove_outliers",
              "outliers_threshold",
              "remove_multicollinearity",
              "multicollinearity_threshold",
              "polynomial_features",
              "polynomial_degree",
              "feature_selection",
              "feature_selection_estimator",
              "feature_selection_method",
              # "fix_imbalance",
              # "fix_imbalance_method",
                 ],
        "code": """
def clean_data(Dataset, node_settings):
    # do yo things here
    return Dataset_cleaned
        """
    },
    'dataset': {
        "info": [],
        "code": """
        
        """
    },
    'optimize': {
        "info": [
            ('tune_model', 'classification regression survival_analysis'),
            ('ensemble_model', 'classification regression'),
            ('blend_models', 'classification regression'),
            ('stack_models', 'classification regression'),
            ('calibrate_model', 'classification')
        ],
        "code": """
def optimise_model(model, node_settings):
    # do yo things here
    return model_optimised
        """
    },
    'compare_models': {
        "info": ['compare_models'],
        "code": """
compare_models(node_settings)
        """
    },
    'create_model': {
        "info": ['create_model'],
        "code": """
create_model(node_settings)
        """
    },
    'model': {
        "info": [],
        "code": """
        
        """
    },
    'analyse': {
        "info": ['plot_model', 'interpret_model', 'dashboard'],
        "code": """
        
        """
    },
    'deploy': {
        "info": ['predict_model', 'finalize_model', 'save_model', 'deploy_model'],
        "code": """
        
        """
    },

}

options_choices = {
    'use_gpu': {
        "False": "tooltip False",
        "True": "tooltip True",
        "force": "tooltip force",
    },
    'estimators': {},
}


def get_type_list(dict: dict) -> list:
    type_list = []
    for value in dict.values():
        if value != {}:
            for opt_name, option_value in value['options'].items():
                if option_value['type'] not in [a_tuple[0] for a_tuple in type_list]:
                    type_list.append((option_value['type'], opt_name))
    return type_list


def convert_to_medomics_standards(settings: dict, types_conv: dict, nodes_include: dict) -> dict:
    standard_settings = {}
    # init standard_settings
    for node in nodes_include.keys():
        standard_settings[node] = {}
    # SPLIT SETTINGS
    split_options = nodes_include['split']['info']
    standard_settings['split']['options'] = {}
    standard_settings['split']['code'] = nodes_include['split']['code']
    for split_option in split_options:
        standard_settings['split']['options'][split_option] = settings['setup']['options'][split_option]

    # CLEAN SETTINGS
    clean_options = nodes_include['clean']['info']
    standard_settings['clean']['options'] = {}
    standard_settings['clean']['code'] = nodes_include['clean']['code']
    for clean_option in clean_options:
        standard_settings['clean']['options'][clean_option] = settings['setup']['options'][clean_option]

    # DATASET SETTINGS
    not_these_keys = list(standard_settings['split']['options'].keys()) + list(standard_settings['clean']['options'].keys())
    standard_settings['dataset']['options'] = {}
    standard_settings['dataset']['code'] = nodes_include['dataset']['code']
    for node in settings['setup']['options'].keys():
        if node not in not_these_keys:
            standard_settings['dataset']['options'][node] = settings['setup']['options'][node]

    # OPTIMIZE SETTINGS
    optimize_options = nodes_include['optimize']['info']
    optimize_option_names = [opt_option[0] for opt_option in optimize_options if ml_type in opt_option[1].split(' ')]
    optimize_option_ml_types = [opt_option[1] for opt_option in optimize_options if ml_type in opt_option[1].split(' ')]
    standard_settings['optimize']['subNodes'] = optimize_option_names
    standard_settings['optimize']['options'] = {}
    standard_settings['optimize']['code'] = nodes_include['optimize']['code']
    for optimize_option, ml_types in zip(optimize_option_names, optimize_option_ml_types):
        standard_settings[optimize_option] = settings[optimize_option]
        standard_settings[optimize_option]['ml_types'] = ml_types
        standard_settings[optimize_option]['code'] = f"{optimize_option}()"

    # COMPARE_MODELS SETTINGS
    standard_settings['compare_models']['options'] = settings['compare_models']['options']
    standard_settings['compare_models']['code'] = nodes_include['compare_models']['code']

    # CREATE_MODELS SETTINGS
    standard_settings['create_model']['options'] = settings['create_model']['options']
    standard_settings['create_model']['code'] = nodes_include['create_model']['code']

    # MODELS SETTINGS
    for model_option in options_choices['estimators'].keys():
        standard_settings['model'][model_option] = {"options": {}, "code": f"{model_option}"}

    # ANALYSE SETTINGS
    analyse_options = nodes_include['analyse']['info']
    for analyse_option in analyse_options:
        standard_settings['analyse'][analyse_option] = settings[analyse_option]
        standard_settings['analyse'][analyse_option]["code"] = f"{analyse_option}()"

    # DEPLOY SETTINGS
    deploy_options = nodes_include['deploy']['info']
    for deploy_option in deploy_options:
        standard_settings['deploy'][deploy_option] = settings[deploy_option]
        standard_settings['deploy'][deploy_option]["code"] = f"{deploy_option}()"

    # SETTINGS types CONVERSION
    for node, node_info in standard_settings.items():
        if 'options' in node_info.keys():
            for option, option_info in node_info['options'].items():
                if option_info['type'] in types_conv.keys():
                    standard_settings[node]['options'][option]['type'] = types_conv[option_info['type']]
                    if standard_settings[node]['options'][option]['type'] == "list" or standard_settings[node]['options'][option]['type'] == "list-multiple":
                        if option in estimators_names:
                            standard_settings[node]['options'][option]['choices'] = options_choices['estimators']
                        else:
                            standard_settings[node]['options'][option]['choices'] = options_choices[option]
                        print(option)
        else:
            for subnode, subnode_info in node_info.items():
                for option, option_info in subnode_info['options'].items():
                    if option_info['type'] in types_conv.keys():
                        standard_settings[node][subnode]['options'][option]['type'] = types_conv[option_info['type']]
                        if standard_settings[node][subnode]['options'][option]['type'] == "list" or standard_settings[node][subnode]['options'][option]['type'] == "list-multiple":
                            if option in estimators_names:
                                standard_settings[node][subnode]['options'][option]['choices'] = options_choices['estimators']
                            else:
                                standard_settings[node][subnode]['options'][option]['choices'] = options_choices[option]
                            print(option)

    return standard_settings


def specific_case(dict_settings: dict) -> dict:
    dict_settings['dataset']['options']['time-point'] = {
        "type": "string",
        "default_val": "",
        "tooltip": "<p>Time point relative to where analysis is performed</p>"
    }
    dict_settings['dataset']['options']['split_experiment_by_institutions'] = {
        "type": "bool",
        "default_val": "False",
        "tooltip": "<p>Set this to true for analysis by institutions</p>"
    }
    dict_settings['dataset']['options']['files'] = {
        "type": "string",
        "tooltip": "<p>Specify path to csv file or to medomics folder.</p>"
    }
    dict_settings['deploy']['save_model']['options']['folder_path'] = {
        "type": "string",
        "tooltip": "<p>Specify path to folder where to save the pickle object.</p>"
    }
    if ml_type == "classification":
        del dict_settings['dataset']['options']['data']

    dict_settings['dataset']['options']['engines']['default_val'] = ""
    dict_settings['compare_models']['options']['engines']['default_val'] = ""
    dict_settings['create_model']['options']['engine']['default_val'] = ""
    dict_settings['dataset']['options']['data_func']['default_val'] = ""
    dict_settings['dataset']['options']['target']['type'] = "string"
    del dict_settings['dataset']['options']['target']['default_val']
    print("pause")
    return dict_settings


def delete_keys_from_dict(dictionary, keys):
    keys_set = set(keys)  # Just an optimization for the "if key in keys" lookup.

    modified_dict = {}
    for key, value in dictionary.items():
        if key not in keys_set:
            if isinstance(value, MutableMapping):
                modified_dict[key] = delete_keys_from_dict(value, keys_set)
            else:
                modified_dict[key] = value  # or copy.deepcopy(value) if a copy is desired for non-dicts.

    return modified_dict


def get_child_text(new_text, child) -> str:
    children = child.find_elements(By.XPATH, value="./*")
    for child in children:
        if child.tag_name == "code" or child.tag_name == "a":
            new_text = new_text.replace(child.get_attribute('outerHTML'), child.text)
        else:
            new_text = get_child_text(new_text, child)
    return new_text.replace('class="simple"', '')


def clean_tooltip(raw_tooltip):
    new_text = raw_tooltip.get_attribute('innerHTML')
    new_text = get_child_text(new_text, raw_tooltip)
    return "<p>"+new_text+"</p>"


def add_default(dict_settings: dict) -> dict:
    new_dict_settings = dict_settings.copy()
    to_delete = []
    for node, node_info in dict_settings.items():
        if node != 'optimize':
            if 'options' in node_info.keys() and node_info['options'] != {}:
                for option, option_info in node_info['options'].items():
                    if 'default_val' not in option_info.keys():
                        if 'default' not in new_dict_settings[node].keys():
                            new_dict_settings[node]['default'] = {}
                        new_dict_settings[node]['default'][option] = option_info
                        to_delete.append((option, f'{node}/options/{option}'))
                        # del new_dict_settings[node]['options'][option]
            else:
                for subnode, subnode_info in node_info.items():
                    print(node, subnode)
                    for option, option_info in subnode_info['options'].items():
                        if 'default_val' not in option_info.keys():
                            if 'default' not in new_dict_settings[node][subnode].keys():
                                new_dict_settings[node][subnode]['default'] = {}
                            new_dict_settings[node][subnode]['default'][option] = option_info
                            to_delete.append((option, f'{node}/{subnode}/options/{option}'))
                            # del new_dict_settings[node][subnode]['options'][option]
    for elem in to_delete:
        dp.delete(new_dict_settings, elem[1])
    return new_dict_settings


def get_models_params():
    # if ml_type == "classification":
    #     exp = ClassificationExperiment()
    #     df = pd.read_csv(self.settings['files'], sep=',', encoding='utf-8')
    #     exp = exp.setup(data=)
    pass


for func in py_functions:
    func_name = func.find_elements(By.XPATH, value="./dt")[0].find_elements(By.XPATH, value="./span[@class='sig-name descname']/span")[0].text
    print(func_name)
    classification[func_name] = {}
    classification[func_name]['options'] = {}
    func_methods = func.find_elements(By.XPATH, value="./dd/dl[@class='simple']")
    if len(func_methods) == 0:
        func_methods = func.find_elements(By.XPATH, value="./dd/dl")[0]
    else:
        func_methods = func_methods[0]

    func_methods_name = func_methods.find_elements(By.XPATH, value="./dt")
    func_methods_desc = func_methods.find_elements(By.XPATH, value="./dd")
    for declaration, description in zip(func_methods_name, func_methods_desc):
        if declaration.text != '**kwargs:' and declaration.text.__contains__(':'):
            try:
                name_text = declaration.text.split(':')
                name = name_text[0]
                type = name_text[1].split(',')[0][1:]

                classification[func_name]['options'][name] = {}
                classification[func_name]['options'][name]['type'] = type
                classification[func_name]['options'][name]['tooltip'] = clean_tooltip(description)

                default_val_index = declaration.text.find('default')
                if default_val_index != -1:
                    default_val = declaration.text[declaration.text.find('=', default_val_index)+2:]
                    classification[func_name]['options'][name]['default_val'] = default_val.replace('’', '').replace('‘', '')

                if func_name == "create_model" and name == "estimator":
                    estimators_list = description.find_elements(By.XPATH, value="./ul[@class='simple']")[0].find_elements(By.XPATH, value="./li")
                    for model in estimators_list:
                        model = model.find_elements(By.XPATH, value="./p")[0].text
                        options_choices['estimators'][model.split('’ - ')[0][1:]] = model.split('’ - ')[1]
            except Exception as e:
                print(e)
                print(declaration.text, default_val_index, declaration.text.find('=', default_val_index))

print()
type_list = get_type_list(classification)

possible_settings = convert_to_medomics_standards(classification, types_conversion, nodes_options)

possible_settings = specific_case(possible_settings)

possible_settings = add_default(possible_settings)

possible_settings = delete_keys_from_dict(possible_settings, ['estimator', 'model'])

# possible_settings['model'] = {}
# for model_option in options_choices['estimators'].keys():
#     possible_settings['model'][model_option] = {"options": {}, "code": f"{model_option}"}


# print(json.dumps(possible_settings, indent=4))
# ml_type = "survival_analysis"
with open(f"C:\\Users\\gblai\\OneDrive\\Documents\\ECOLE\\Stage\\GRIIS_Medomics\\MEDml\\flaskProject\\static\\possible_settings\\{ml_type}_settings.js", 'w') as f:
    f.write(f"var {ml_type}_settings = {json.dumps(possible_settings, indent=4)};")

print("finished", ml_type)