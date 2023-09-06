


def generate_code(file_name: str, settings: dict) -> None:
    """
    Generate python file from settings workflow.

    Args:
        file_name (str): The file name.
        settings (dict): The settings.
    """
    with open(file_name, 'w') as file:
        file.write("from learning.MEDml.MEDexperiment import MEDexperiment")
        file.write("\n")
        file.write("exp = MEDexperiment()")
        file.write(f"exp.load_csv_in_folder({settings['folder_name']})")




