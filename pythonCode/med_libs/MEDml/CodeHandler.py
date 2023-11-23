
def convert_dict_to_params(dictionary: dict) -> str:
    """
    Converts a dictionary to a string of parameters
    """
    params = ""
    for key, value in dictionary.items():
        if isinstance(value, str):
            params += f"{key}='{value}', "
        else:
            params += f"{key}={value}, "
    return params[:-2]
