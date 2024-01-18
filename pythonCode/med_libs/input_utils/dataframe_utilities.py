
import pandas as pd

def assert_no_nan_values_for_each_column(df: pd.DataFrame, cols: list = None):
    """
    Assert that there is no nan values for each column
    Args:
        df: DataFrame to check
        cols: Columns to check

    Returns: None

    """
    if cols is None:
        cols = df.columns
    for col in cols:       
        if df[col].isnull().values.any():
            df[col].fillna(method='ffill', inplace=True)
            if df[col].isnull().values.any():
                df[col].fillna(method='bfill', inplace=True)



def save_dataframe(path, extension, df, tags=None):
    """
    Save a dataframe to a file
    Args:
        path (basestring): path to the file
        extension (basestring): extension of the file
        df (pandas.DataFrame): dataframe to save
    """
    if tags is not None:
        df = add_tags_to_column_names(df, tags)
    if extension == ".csv":
        df.to_csv(path, index=False)
    elif extension == ".xlsx":
        df.to_excel(path, index=False)
    elif extension == ".json":
        df.to_json(path, orient="records")
    else:
        print("Extension not supported, cannot save the file")
        return None


def load_data_file(path, extension):
    """
    Load data from a file
    Args:
        path (basestring): path to the file
        extension (basestring): extension of the file
    Returns:
        df (pandas.DataFrame): dataframe containing the data
    """
    import pandas as pd
    if extension == "csv":
        df = pd.read_csv(path)
    elif extension == "xlsx":
        df = pd.read_excel(path)
    elif extension == "json":
        df = pd.read_json(path)
    else:
        print("Extension not supported, cannot load the file")
        return None
    return df

def handle_tags_in_dataframe(df: pd.DataFrame):
    """
    Handle the tags in a dataframe
    Args:
        df: DataFrame to handle

    Returns: Handled DataFrame and a tags dictionary with the column name as key and the tags as value

    Tags are always separated by "_|_" from the column name
    Examples: tag1_|_tag2_|_tag3_|_column_name
    """

    tags_dict = {}
    for col in df.columns:
        if "_|_" in col:
            tags = col.split("_|_")
            df.rename(columns={col: tags[-1]}, inplace=True)
            tags_dict[tags[-1]] = tags[:-1]

    print("HERE", tags_dict, df.columns)
    return df, tags_dict

def add_tags_to_column_names(df: pd.DataFrame, tags_dict: dict):
    """
    Add tags to column names
    Args:
        df: DataFrame to handle
        tags_dict: Dictionary containing the tags

    Returns: Handled DataFrame

    """
    for col in df.columns:
        if col in tags_dict.keys():
            tags = tags_dict[col]
            for tag in tags:
                df.rename(columns={col: tag + "_|_" + col}, inplace=True)
    return df


