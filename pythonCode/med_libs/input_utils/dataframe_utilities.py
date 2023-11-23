
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



def save_dataframe(path, extension, df):
    """
    Save a dataframe to a file
    Args:
        path (basestring): path to the file
        extension (basestring): extension of the file
        df (pandas.DataFrame): dataframe to save
    """
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
