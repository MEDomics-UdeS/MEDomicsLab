import copy
import pandas as pd
import numpy as np
import json
import os
from .NodeObj import Node
from typing import Union
from colorama import Fore
from sklearn.metrics import accuracy_score, f1_score, precision_score, recall_score, roc_auc_score

DATAFRAME_LIKE = Union[dict, list, tuple, np.ndarray, pd.DataFrame]
TARGET_LIKE = Union[int, str, list, tuple, np.ndarray, pd.Series]

class ModelHandler(Node):
    """
    This class represents the ModelHandler node.
    It handles both training and comparing models.
    """

    def __init__(self, id_: int, global_config_json: json) -> None:
        """
        Args:
            id_ (int): The id of the node.
            global_config_json (json): The global config json.
        """
        super().__init__(id_, global_config_json)
        if self.type == 'train_model':
            self.model_id = self.config_json['associated_id']
            model_obj = self.global_config_json['nodes'][self.model_id]
            self.config_json['data']['estimator'] = {
                "type": model_obj['data']['internal']['selection'],
                "settings": model_obj['data']['internal']['settings']
            }

    def _execute(self, experiment: dict = None, **kwargs) -> json:
        """
        This function is used to execute the node, handling both OuterCV and regular cases.
        """
        print()
        print(Fore.BLUE + "=== Executing ModelHandler ===" + Fore.RESET)
        print(Fore.CYAN + f"Using {self.type}" + Fore.RESET)

        trained_models_outer = []  # To store models when using OuterCV
        trained_model_non_outer = None  # To store a model for the non-OuterCV case
        settings = copy.deepcopy(self.settings)
        os.chdir(self.global_config_json['paths']['ws'])

        print(kwargs, "********************")

        # Initialize lists to store metrics for each fold in OuterCV
        auc_results = []
        accuracy_results = []
        f1_results = []
        precision_results = []
        recall_results = []

        # Case 1: OuterCV is used
        if 'cv_splits' in kwargs:
            print(Fore.GREEN + "OuterCV data is being used." + Fore.RESET)

            # Iterate through each fold's train/test data
            for fold_data in kwargs['cv_splits']:
                train_data = fold_data['train_data']
                test_data = fold_data['test_data']
                fold_number = fold_data['fold']

                print(f"Processing Fold {fold_number + 1}")
                print(f"Train data shape: {train_data.shape}, Test data shape: {test_data.shape}")

                # Ensure the target column exists
                if kwargs['target'] not in train_data.columns or kwargs['target'] not in test_data.columns:
                    raise ValueError(f"Target column {kwargs['target']} not found in train or test data.")

                # Setup PyCaret for training
                experiment['pycaret_exp'].setup(data=train_data, target=kwargs['target'], session_id=42)

                # Handle comparison or training based on the type of node
                if self.type == 'compare_models':
                    # Compare models for this fold
                    models = experiment['pycaret_exp'].compare_models(**settings)
                    print(Fore.LIGHTBLUE_EX + f"Trained models in fold {fold_number + 1}: {models}" + Fore.RESET)
                    trained_model = models if isinstance(models, list) else [models]

                elif self.type == 'train_model':
                    # Train a model for this fold
                    print('DEBUG config json', self.config_json)
                    print('DEBUG kwargs', kwargs)
                    print('DEBUG settings', self.settings, settings)
                    settings.update(self.config_json['data']['estimator']['settings'])
                    settings.update({'estimator': self.config_json['data']['estimator']['type']})

                    trained_model = [experiment['pycaret_exp'].create_model(**settings)]
                    print(Fore.LIGHTBLUE_EX + f"Model {self.model_id} trained in fold {fold_number + 1}" + Fore.RESET)
                
                # Store the trained model for OuterCV
                trained_models_outer.append(trained_model[0])

                # Evaluate the model on the test data
                predictions_df = experiment['pycaret_exp'].predict_model(trained_model[0], data=test_data)

                # Debug: Show available columns in predictions_df
                print(f"Columns in predictions_df: {predictions_df.columns}")

                # Ensure we capture the correct prediction column
                if 'Label' in predictions_df.columns:
                    predicted_labels = predictions_df['Label']
                elif 'prediction_label' in predictions_df.columns:
                    predicted_labels = predictions_df['prediction_label']
                else:
                    raise KeyError("Neither 'Label' nor 'prediction_label' found in predictions_df.")

                # Calculate metrics manually using sklearn
                true_labels = test_data[kwargs['target']]  # The true labels

                accuracy = accuracy_score(true_labels, predicted_labels)
                f1 = f1_score(true_labels, predicted_labels)
                precision = precision_score(true_labels, predicted_labels)
                recall = recall_score(true_labels, predicted_labels)


                # Calculate AUC if the model supports predict_proba
                if hasattr(trained_model[0], 'predict_proba'):
                    # Aligner les colonnes de test_data sur celles de train_data (prb pycaret)
                    print("Aligning test_data with train_data columns...")
                    test_data_aligned = test_data[train_data.columns]

                    # verify that the target column is not in the other 
                    if kwargs['target'] in test_data_aligned.columns:
                        test_data_features = test_data_aligned.drop(columns=[kwargs['target']])
                    else:
                        test_data_features = test_data_aligned

                    # Debugging
                    print(f"Test data columns (after alignment): {list(test_data_features.columns)}")

                    try:
                        # probabilities for the positive class
                        predicted_probs = trained_model[0].predict_proba(test_data_features)[:, 1]
                        auc = roc_auc_score(true_labels, predicted_probs)
                        print(f"AUC calculated successfully: {auc}")
                    except ValueError as e:
                        print(f"Error during AUC calculation: {str(e)}")
                        auc = None
                else:
                    auc = None
                    print(f"AUC not calculable for model {trained_model[0]} (no predict_proba).")


                # Append metrics to corresponding lists
                if auc is not None:
                    auc_results.append(auc)
                if accuracy is not None:
                    accuracy_results.append(accuracy)
                if f1 is not None:
                    f1_results.append(f1)
                if precision is not None:
                    precision_results.append(precision)
                if recall is not None:
                    recall_results.append(recall)

            # After all folds are processed, calculate mean and std for each metric
            final_metrics = {
                "mean_auc": round(np.mean(auc_results), 3) if auc_results else None,
                "std_auc": round(np.std(auc_results), 3) if auc_results else None,
                "min_auc": round(np.min(auc_results), 3) if auc_results else None,
                "max_auc": round(np.max(auc_results), 3) if auc_results else None,


                "mean_accuracy": round(np.mean(accuracy_results),3) if accuracy_results else None,
                "std_accuracy": round(np.std(accuracy_results),3) if accuracy_results else None,
                "min_accuracy": round(np.min(accuracy_results),3) if accuracy_results else None,
                "max_accuracy": round(np.max(accuracy_results),3) if accuracy_results else None,

                "mean_f1": round(np.mean(f1_results), 3) if f1_results else None,
                "std_f1": round(np.std(f1_results), 3) if f1_results else None,
                "min_f1": round(np.min(f1_results), 3) if f1_results else None,
                "max_f1": round(np.max(f1_results), 3) if f1_results else None,

                "mean_precision": round(np.mean(precision_results), 3) if precision_results else None,
                "std_precision": round(np.std(precision_results), 3) if precision_results else None,
                "min_precision": round(np.min(precision_results), 3) if precision_results else None,
                "max_precision": round(np.max(precision_results), 3) if precision_results else None,

                "mean_recall": round(np.mean(recall_results), 3) if recall_results else None,
                "std_recall": round(np.std(recall_results), 3) if recall_results else None,
                "min_recall": round(np.min(recall_results), 3) if recall_results else None,
                "max_recall": round(np.max(recall_results), 3) if recall_results else None

            }


            print(Fore.MAGENTA + f"Final results after {len(kwargs['cv_splits'])} folds:" + Fore.RESET)
            print(Fore.MAGENTA + f"Mean AUC: {final_metrics['mean_auc']}, Std AUC: {final_metrics['std_auc']}" + Fore.RESET)
            print(Fore.MAGENTA + f"Mean Accuracy: {final_metrics['mean_accuracy']}, Std Accuracy: {final_metrics['std_accuracy']}" + Fore.RESET)
            print(Fore.MAGENTA + f"Mean F1: {final_metrics['mean_f1']}, Std F1: {final_metrics['std_f1']}" + Fore.RESET)
            print(Fore.MAGENTA + f"Mean Precision: {final_metrics['mean_precision']}, Std Precision: {final_metrics['std_precision']}" + Fore.RESET)
            print(Fore.MAGENTA + f"Mean Recall: {final_metrics['mean_recall']}, Std Recall: {final_metrics['std_recall']}" + Fore.RESET)

            # Prepare the model information for the next node    
            self._info_for_next_node = {'models': trained_models_outer, 'id': self.id, 'settings': settings, 'final_metrics': final_metrics}
            return final_metrics
        
        # Case 2: OuterCV is NOT used
        else:
            print(Fore.RED + "OuterCV is NOT being used. Proceeding with normal training." + Fore.RESET)

            # Debugging: Ensure 'data' exists in global_config_json
            # Check if 'data' is in kwargs from the previous node
            if 'data' not in kwargs:
                    raise KeyError("Data is missing in kwargs passed to ModelHandler from previous nodes.")

            # Set up the model directly using pipeline parameters
            data = self.global_config_json['data']
            target = self.config_json['data']['target']
            experiment['pycaret_exp'].setup(data=data, target=target, session_id=42)

            # Handle comparison or training based on the type of node
            if self.type == 'compare_models':
                models = experiment['pycaret_exp'].compare_models(**settings)
                print(models)
                trained_model_non_outer = models if isinstance(models, list) else [models]
            elif self.type == 'train_model':
                trained_model_non_outer = [experiment['pycaret_exp'].create_model(self.model_id)]

            # Prepare the model information for the next node    
            self._info_for_next_node = {'models': trained_model_non_outer, 'id': self.id, 'settings': settings}
            return trained_model_non_outer

    def set_model(self, model_id: str) -> None:
        """
        Sets the model based on the model_id provided.
        """
        model_obj = self.global_config_json['nodes'][model_id]
        self.config_json['data']['estimator'] = {
            "type": model_obj['data']['selection'],
            "settings": model_obj['data']['settings']
        }
