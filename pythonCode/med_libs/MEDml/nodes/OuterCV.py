import copy
import json
import os
import pandas as pd
import numpy as np
from sklearn.model_selection import StratifiedKFold, KFold
from pycaret.classification import ClassificationExperiment
from pycaret.regression import RegressionExperiment
from .NodeObj import Node
from typing import Union
from colorama import Fore

DATAFRAME_LIKE = Union[dict, list, tuple, np.ndarray, pd.DataFrame]
TARGET_LIKE = Union[int, str, list, tuple, np.ndarray, pd.Series]


class OuterCV(Node):
    """
    This class represents the OuterCV node for external cross-validation.
    """

    def __init__(self, id_: int, global_config_json: json) -> None:
        """
        Args:
            id_ (int): The id of the node.
            global_config_json (json): The global config json.
        """
        super().__init__(id_, global_config_json)
        #self.df = None

    def _execute(self, experiment: dict = None, **kwargs) -> json:
        """
        This function is used to execute the node.
        """
        print()
        print(Fore.BLUE + "=== Executing OuterCV === " + 
              Fore.YELLOW + f"({self.username})" + Fore.RESET)
        
        settings = copy.deepcopy(self.settings)
        print(kwargs)
        print("************* DEBUG settings", settings)
        
        dataset = kwargs['dataset']
        print(dataset)
        target = kwargs['target']

        # Check if dataset and target are provided
        if dataset is None or target is None:
            raise ValueError("Dataset or target is missing from the kwargs.")
        if not isinstance(dataset, pd.DataFrame):
            raise ValueError("The dataset must be a pandas DataFrame.")
        
        # Fetch fold strategy (KFold, StratifiedKFold)
        fold_strategy = settings.get('fold_strategy', 'kfold')
        n_splits = settings.get('n_splits', 5)  # Default to 5 folds
        shuffle = bool(settings.get('shuffle', True))
        random_state = settings.get('random_state', 42)
        model_name = settings.get('model', 'svm')  # Default model is XGBoost

        # Choose the correct fold strategy
        if fold_strategy == 'kfold':
            cv = KFold(n_splits=n_splits, shuffle=shuffle, random_state=random_state)
        elif fold_strategy == 'stratifiedkfold':
            cv = StratifiedKFold(n_splits=n_splits, shuffle=shuffle, random_state=random_state)
        else:
            raise ValueError("Invalid fold strategy selected.")

        print(Fore.CYAN + f"Using {fold_strategy} with {n_splits} splits" + Fore.RESET)

        # Initialize list to store data for the next node
        data_for_next_node = []

        # Loop over each fold in the cross-validation
        for fold, (train_index, test_index) in enumerate(cv.split(dataset, dataset[target])):
            train_data = dataset.iloc[train_index]
            test_data = dataset.iloc[test_index]
            
            print(Fore.GREEN + f"Running fold {fold+1}/{n_splits}" + Fore.RESET)

            # Collect train/test data and pass it to the next node
            data_for_next_node.append({
                'train_data': train_data,
                'test_data': test_data,
                'fold': fold
                
            })

        # Pass the splits to the next node
        self._info_for_next_node = {
            'cv_splits': data_for_next_node,
            'fold_strategy': kwargs.get("fold_strategy"),
            'random_state': kwargs.get("random_state"),
            'target': kwargs['target'],
            'model': model_name
            
            
        }

        return self._info_for_next_node