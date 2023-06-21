var classificationSettings = {
	"split": {
		"options": {
			"train_size": {
				"type": "float",
				"tooltip": "Proportion of the dataset to be used for training and validation. Should be between 0.0 and 1.0.",
				"default_val": "0.7"
			},
			"data_split_stratify": {
				"type": "bool",
				"tooltip": "Controls stratification during \u2018train_test_split\u2019. When set to True, will stratify by target column. To stratify on any other columns, pass a list of column names. Ignored when data_split_shuffle is False.",
				"default_val": "False"
			},
			"data_split_shuffle": {
				"type": "bool",
				"tooltip": "When set to False, prevents shuffling of rows during \u2018train_test_split\u2019.",
				"default_val": "True"
			}
		}
	},
	"clean": {
		"options": {
			"imputation_type": {
				"type": "string",
				"tooltip": "The type of imputation to use. Can be either \u2018simple\u2019 or \u2018iterative\u2019.",
				"default_val": "simple"
			},
			"normalize": {
				"type": "bool",
				"tooltip": "When set to True, it transforms the numeric features by scaling them to a given range. Type of scaling is defined by the normalize_method parameter.",
				"default_val": "False"
			},
			"normalize_method": {
				"type": "string",
				"tooltip": "Defines the method for scaling. By default, normalize method is set to \u2018zscore\u2019 The standard zscore is calculated as z = (x - u) / s. Ignored when normalize is not True. The other options are:\nminmax: scales and translates each feature individually such that it is in the range of 0 - 1.\nmaxabs: scales and translates each feature individually such that the maximal absolute value of each feature will be 1.0. It does not shift/center the data, and thus does not destroy any sparsity.\nrobust: scales and translates each feature according to the Interquartile range. When the dataset contains outliers, robust scaler often gives better results.",
				"default_val": "zscore"
			},
			"iterative_imputation_iters": {
				"type": "int",
				"tooltip": "Number of iterations. Ignored when imputation_type is not \u2018iterative\u2019.",
				"default_val": "5"
			},
			"categorical_imputation": {
				"type": "string",
				"tooltip": "Missing values in categorical features are imputed with a constant \u2018not_available\u2019 value. The other available option is \u2018mode\u2019.",
				"default_val": "constant"
			},
			"categorical_iterative_imputer": {
				"type": "string",
				"tooltip": "Estimator for iterative imputation of missing values in categorical features. Ignored when imputation_type is not \u2018iterative\u2019.",
				"default_val": "lightgbm"
			},
			"numeric_imputation": {
				"type": "string",
				"tooltip": "Missing values in numeric features are imputed with \u2018mean\u2019 value of the feature in the training dataset. The other available option is \u2018median\u2019 or \u2018zero\u2019.",
				"default_val": "mean"
			},
			"numeric_iterative_imputer": {
				"type": "string",
				"tooltip": "Estimator for iterative imputation of missing values in numeric features. Ignored when imputation_type is set to \u2018simple\u2019.",
				"default_val": "lightgbm"
			},
			"transformation": {
				"type": "bool",
				"tooltip": "When set to True, it applies the power transform to make data more Gaussian-like. Type of transformation is defined by the transformation_method parameter.",
				"default_val": "False"
			},
			"transformation_method": {
				"type": "string",
				"tooltip": "Defines the method for transformation. By default, the transformation method is set to \u2018yeo-johnson\u2019. The other available option for transformation is \u2018quantile\u2019. Ignored when transformation is not True.",
				"default_val": "yeo-johnson"
			},
			"handle_unknown_categorical": {
				"type": "bool",
				"tooltip": "When set to True, unknown categorical levels in unseen data are replaced by the most or least frequent level as learned in the training dataset.",
				"default_val": "True"
			},
			"unknown_categorical_method": {
				"type": "string",
				"tooltip": "Method used to replace unknown categorical levels in unseen data. Method can be set to \u2018least_frequent\u2019 or \u2018most_frequent\u2019.",
				"default_val": "least_frequent"
			},
			"pca": {
				"type": "bool",
				"tooltip": "When set to True, dimensionality reduction is applied to project the data into a lower dimensional space using the method defined in pca_method parameter.",
				"default_val": "False"
			},
			"pca_method": {
				"type": "string",
				"tooltip": "The \u2018linear\u2019 method performs uses Singular Value Decomposition. Other options are:\nkernel: dimensionality reduction through the use of RVF kernel.\nincremental: replacement for \u2018linear\u2019 pca when the dataset is too large.",
				"default_val": "linear"
			},
			"pca_components": {
				"type": "float",
				"tooltip": "Number of components to keep. if pca_components is a float, it is treated as a target percentage for information retention. When pca_components is an integer it is treated as the number of features to be kept. pca_components must be less than the original number of features. Ignored when pca is not True.",
				"default_val": "None"
			},
			"ignore_low_variance": {
				"type": "bool",
				"tooltip": "When set to True, all categorical features with insignificant variances are removed from the data. The variance is calculated using the ratio of unique values to the number of samples, and the ratio of the most common value to the frequency of the second most common value.",
				"default_val": "False"
			},
			"combine_rare_levels": {
				"type": "bool",
				"tooltip": "When set to True, frequency percentile for levels in categorical features below a certain threshold is combined into a single level.",
				"default_val": "False"
			},
			"rare_level_threshold": {
				"type": "float",
				"tooltip": "Percentile distribution below which rare categories are combined. Ignored when combine_rare_levels is not True.",
				"default_val": "0.1"
			},
			"remove_outliers": {
				"type": "bool",
				"tooltip": "When set to True, outliers from the training data are removed using the Singular Value Decomposition.",
				"default_val": "False"
			},
			"outliers_threshold": {
				"type": "float",
				"tooltip": "The percentage outliers to be removed from the training dataset. Ignored when remove_outliers is not True.",
				"default_val": "0.05"
			},
			"remove_multicollinearity": {
				"type": "bool",
				"tooltip": "When set to True, features with the inter-correlations higher than the defined threshold are removed. When two features are highly correlated with each other, the feature that is less correlated with the target variable is removed. Only considers numeric features.",
				"default_val": "False"
			},
			"multicollinearity_threshold": {
				"type": "float",
				"tooltip": "Threshold for correlated features. Ignored when remove_multicollinearity is not True.",
				"default_val": "0.9"
			},
			"remove_perfect_collinearity": {
				"type": "bool",
				"tooltip": "When set to True, perfect collinearity (features with correlation = 1) is removed from the dataset, when two features are 100% correlated, one of it is randomly removed from the dataset.",
				"default_val": "True"
			},
			"create_clusters": {
				"type": "bool",
				"tooltip": "When set to True, an additional feature is created in training dataset where each instance is assigned to a cluster. The number of clusters is determined by optimizing Calinski-Harabasz and Silhouette criterion.",
				"default_val": "False"
			},
			"cluster_iter": {
				"type": "int",
				"tooltip": "Number of iterations for creating cluster. Each iteration represents cluster size. Ignored when create_clusters is not True.",
				"default_val": "20"
			},
			"polynomial_features": {
				"type": "bool",
				"tooltip": "When set to True, new features are derived using existing numeric features.",
				"default_val": "False"
			},
			"polynomial_degree": {
				"type": "int",
				"tooltip": "Degree of polynomial features. For example, if an input sample is two dimensional and of the form [a, b], the polynomial features with degree = 2 are: [1, a, b, a^2, ab, b^2]. Ignored when polynomial_features is not True.",
				"default_val": "2"
			},
			"trigonometry_features": {
				"type": "bool",
				"tooltip": "When set to True, new features are derived using existing numeric features.",
				"default_val": "False"
			},
			"polynomial_threshold": {
				"type": "float",
				"tooltip": "When polynomial_features or trigonometry_features is True, new features are derived from the existing numeric features. This may sometimes result in too large feature space. polynomial_threshold parameter can be used to deal with this problem. It does so by using combination of Random Forest, AdaBoost and Linear correlation. All derived features that falls within the percentile distribution are kept and rest of the features are removed.",
				"default_val": "0.1"
			},
			"feature_selection": {
				"type": "bool",
				"tooltip": "When set to True, a subset of features are selected using a combination of various permutation importance techniques including Random Forest, Adaboost and Linear correlation with target variable. The size of the subset is dependent on the feature_selection_threshold parameter.",
				"default_val": "False"
			},
			"feature_selection_threshold": {
				"type": "float",
				"tooltip": "Threshold value used for feature selection. When polynomial_features or feature_interaction is True, it is recommended to keep the threshold low to avoid large feature spaces. Setting a very low value may be efficient but could result in under-fitting.",
				"default_val": "0.8"
			},
			"feature_selection_method": {
				"type": "string",
				"tooltip": "Algorithm for feature selection. \u2018classic\u2019 method uses permutation feature importance techniques. Other possible value is \u2018boruta\u2019 which uses boruta algorithm for feature selection.",
				"default_val": "classic"
			},
			"feature_interaction": {
				"type": "bool",
				"tooltip": "When set to True, new features are created by interacting (a * b) all the numeric variables in the dataset. This feature is not scalable and may not work as expected on datasets with large feature space.",
				"default_val": "False"
			},
			"feature_ratio": {
				"type": "bool",
				"tooltip": "When set to True, new features are created by calculating the ratios (a / b) between all numeric variables in the dataset. This feature is not scalable and may not work as expected on datasets with large feature space.",
				"default_val": "False"
			},
			"interaction_threshold": {
				"type": "bool",
				"tooltip": "Similar to polynomial_threshold, It is used to compress a sparse matrix of newly created features through interaction. Features whose importance based on the combination of Random Forest, AdaBoost and Linear correlation falls within the percentile of the defined threshold are kept in the dataset. Remaining features are dropped before further processing.",
				"default_val": "0.01"
			},
			"fix_imbalance": {
				"type": "bool",
				"tooltip": "When training dataset has unequal distribution of target class it can be balanced using this parameter. When set to True, SMOTE (Synthetic Minority Over-sampling Technique) is applied by default to create synthetic datapoints for minority class.",
				"default_val": "False"
			},
			"fix_imbalance_method": {
				"type": "obj",
				"tooltip": "When fix_imbalance is True, \u2018imblearn\u2019 compatible object with \u2018fit_resample\u2019 method can be passed. When set to None, \u2018imblearn.over_sampling.SMOTE\u2019 is used.",
				"default_val": "None"
			}
		}
	},
	"dataset": {
		"options": {
			"target": {
				"type": "string",
				"tooltip": "Name of the target column to be passed in as a string. The target variable can be either binary or multiclass."
			},
			"test_data": {
				"type": "pandas.DataFrame",
				"tooltip": "If not None, test_data is used as a hold-out set and train_size parameter is ignored. test_data must be labelled and the shape of data and test_data must match.",
				"default_val": "None"
			},
			"preprocess": {
				"type": "bool",
				"tooltip": "When set to False, no transformations are applied except for train_test_split and custom transformations passed in custom_pipeline param. Data must be ready for modeling (no missing values, no dates, categorical data encoding), when preprocess is set to False.",
				"default_val": "True"
			},
			"categorical_features": {
				"type": "custom_list",
				"tooltip": "If the inferred data types are not correct or the silent param is set to True, categorical_features param can be used to overwrite or define the data types. It takes a list of strings with column names that are categorical.",
				"default_val": "None"
			},
			"ordinal_features": {
				"type": "dict",
				"tooltip": "Encode categorical features as ordinal. For example, a categorical feature with \u2018low\u2019, \u2018medium\u2019, \u2018high\u2019 values where low < medium < high can be passed as ordinal_features = { \u2018column_name\u2019 : [\u2018low\u2019, \u2018medium\u2019, \u2018high\u2019] }.",
				"default_val": "None"
			},
			"high_cardinality_features": {
				"type": "custom_list",
				"tooltip": "When categorical features contains many levels, it can be compressed into fewer levels using this parameter. It takes a list of strings with column names that are categorical.",
				"default_val": "None"
			},
			"high_cardinality_method": {
				"type": "string",
				"tooltip": "Categorical features with high cardinality are replaced with the frequency of values in each level occurring in the training dataset. Other available method is \u2018clustering\u2019 which trains the K-Means clustering algorithm on the statistical attribute of the training data and replaces the original value of feature with the cluster label. The number of clusters is determined by optimizing Calinski-Harabasz and Silhouette criterion.",
				"default_val": "frequency"
			},
			"numeric_features": {
				"type": "custom_list",
				"tooltip": "If the inferred data types are not correct or the silent param is set to True, numeric_features param can be used to overwrite or define the data types. It takes a list of strings with column names that are numeric.",
				"default_val": "None"
			},
			"date_features": {
				"type": "custom_list",
				"tooltip": "If the inferred data types are not correct or the silent param is set to True, date_features param can be used to overwrite or define the data types. It takes a list of strings with column names that are DateTime.",
				"default_val": "None"
			},
			"ignore_features": {
				"type": "custom_list",
				"tooltip": "ignore_features param can be used to ignore features during model training. It takes a list of strings with column names that are to be ignored.",
				"default_val": "None"
			},
			"bin_numeric_features": {
				"type": "custom_list",
				"tooltip": "To convert numeric features into categorical, bin_numeric_features parameter can be used. It takes a list of strings with column names to be discretized. It does so by using \u2018sturges\u2019 rule to determine the number of clusters and then apply KMeans algorithm. Original values of the feature are then replaced by the cluster label.",
				"default_val": "None"
			},
			"group_features": {
				"type": "custom_list",
				"tooltip": "When the dataset contains features with related characteristics, group_features parameter can be used for feature extraction. It takes a list of strings with column names that are related.",
				"default_val": "None"
			},
			"group_names": {
				"type": "custom_list",
				"tooltip": "Group names to be used in naming new features. When the length of group_names does not match with the length of group_features, new features are named sequentially group_1, group_2, etc. It is ignored when group_features is None.",
				"default_val": "None"
			},
			"fold_strategy": {
				"type": "string",
				"tooltip": "Choice of cross validation strategy. Possible values are:\n\u2018kfold\u2019\n\u2018stratifiedkfold\u2019\n\u2018groupkfold\u2019\n\u2018timeseries\u2019\na custom CV generator object compatible with scikit-learn.",
				"default_val": "stratifiedkfold"
			},
			"fold": {
				"type": "int",
				"tooltip": "Number of folds to be used in cross validation. Must be at least 2. This is a global setting that can be over-written at function level by using fold parameter. Ignored when fold_strategy is a custom object.",
				"default_val": "10"
			},
			"fold_shuffle": {
				"type": "bool",
				"tooltip": "Controls the shuffle parameter of CV. Only applicable when fold_strategy is \u2018kfold\u2019 or \u2018stratifiedkfold\u2019. Ignored when fold_strategy is a custom object.",
				"default_val": "False"
			},
			"fold_groups": {
				"type": "str or array-like",
				"tooltip": "Optional group labels when \u2018GroupKFold\u2019 is used for the cross validation. It takes an array with shape (n_samples, ) where n_samples is the number of rows in the training dataset. When string is passed, it is interpreted as the column name in the dataset containing group labels.",
				"default_val": "None"
			},
			"n_jobs": {
				"type": "int",
				"tooltip": "The number of jobs to run in parallel (for functions that supports parallel processing) -1 means using all processors. To run all functions on single processor set n_jobs to None.",
				"default_val": "-1"
			},
			"use_gpu": {
				"type": "list",
				"tooltip": "When set to True, it will use GPU for training with algorithms that support it, and fall back to CPU if they are unavailable. When set to \u2018force\u2019, it will only use GPU-enabled algorithms and raise exceptions when they are unavailable. When False, all algorithms are trained using CPU only.\nGPU enabled algorithms:\nExtreme Gradient Boosting, requires no further installation\nCatBoost Classifier, requires no further installation (GPU is only enabled when data > 50,000 rows)\nLight Gradient Boosting Machine, requires GPU installation https://lightgbm.readthedocs.io/en/latest/GPU-Tutorial.html\nLogistic Regression, Ridge Classifier, Random Forest, K Neighbors Classifier, Support Vector Machine, requires cuML >= 0.15 https://github.com/rapidsai/cuml",
				"default_val": "False",
				"choices": {
					"False": "tooltip False",
					"True": "tooltip True",
					"force": "tooltip force"
				}
			},
			"custom_pipeline": {
				"type": "(str",
				"tooltip": "When passed, will append the custom transformers in the preprocessing pipeline and are applied on each CV fold separately and on the final fit. All the custom transformations are applied after \u2018train_test_split\u2019 and before pycaret\u2019s internal transformations.",
				"default_val": "None"
			},
			"html": {
				"type": "bool",
				"tooltip": "When set to False, prevents runtime display of monitor. This must be set to False when the environment does not support IPython. For example, command line terminal, Databricks Notebook, Spyder and other similar IDEs.",
				"default_val": "True"
			},
			"session_id": {
				"type": "int",
				"tooltip": "Controls the randomness of experiment. It is equivalent to \u2018random_state\u2019 in scikit-learn. When None, a pseudo random number is generated. This can be used for later reproducibility of the entire experiment.",
				"default_val": "None"
			},
			"log_experiment": {
				"type": "bool or str or BaseLogger or list of str or BaseLogger",
				"tooltip": "A (list of) PyCaret BaseLogger or str (one of \u2018mlflow\u2019, \u2018wandb\u2019) corresponding to a logger to determine which experiment loggers to use. Setting to True will use just MLFlow.",
				"default_val": "False"
			},
			"experiment_name": {
				"type": "string",
				"tooltip": "Name of the experiment for logging. Ignored when log_experiment is False.",
				"default_val": "None"
			},
			"experiment_custom_tags": {
				"type": "dict",
				"tooltip": "Dictionary of tag_name: String -> value: (String, but will be string-ified if not) passed to the mlflow.set_tags to add new custom tags for the experiment.",
				"default_val": "None"
			},
			"log_plots": {
				"type": "bool",
				"tooltip": "When set to True, certain plots are logged automatically in the MLFlow server. To change the type of plots to be logged, pass a list containing plot IDs. Refer to documentation of plot_model. Ignored when log_experiment is False.",
				"default_val": "False"
			},
			"log_profile": {
				"type": "bool",
				"tooltip": "When set to True, data profile is logged on the MLflow server as a html file. Ignored when log_experiment is False.",
				"default_val": "False"
			},
			"log_data": {
				"type": "bool",
				"tooltip": "When set to True, dataset is logged on the MLflow server as a csv file. Ignored when log_experiment is False.",
				"default_val": "False"
			},
			"silent": {
				"type": "bool",
				"tooltip": "Controls the confirmation input of data types when setup is executed. When executing in completely automated mode or on a remote kernel, this must be True.",
				"default_val": "False"
			},
			"verbose": {
				"type": "bool",
				"tooltip": "When set to False, Information grid is not printed.",
				"default_val": "True"
			},
			"profile": {
				"type": "bool",
				"tooltip": "When set to True, an interactive EDA report is displayed.",
				"default_val": "False"
			},
			"profile_kwargs": {
				"type": "dict",
				"tooltip": "Dictionary of arguments passed to the ProfileReport method used to create the EDA report. Ignored if profile is False.",
				"default_val": "{} (empty dict)"
			},
			"time-point": {
				"type": "string",
				"default_val": "",
				"tooltip": "<p>Time point relative to where analysis is performed</p>"
			},
			"split_experiment_by_institutions": {
				"type": "bool",
				"default_val": "False",
				"tooltip": "<p>Set this to true for analysis by institutions</p>"
			},
			"files": {
				"type": "string",
				"tooltip": "<p>Specify path to csv file or to medomics folder.</p>"
			}
		}
	},
	"optimize": {
		"subNodes": [
			"tune_model",
			"ensemble_model",
			"blend_models",
			"stack_models",
			"optimize_threshold",
			"calibrate_model"
		],
		"options": {}
	},
	"compare_models": {
		"options": {
			"include": {
				"type": "list-multiple",
				"tooltip": "To train and evaluate select models, list containing model ID or scikit-learn compatible object can be passed in include param. To see a list of all models available in the model library use the models function.",
				"default_val": "None",
				"choices": {
					"lr": "Logistic Regression",
					"knn": "K Neighbors Classifier",
					"nb": "Naive Bayes",
					"dt": "Decision Tree Classifier",
					"svm": "SVM - Linear Kernel",
					"rbfsvm": "SVM - Radial Kernel",
					"gpc": "Gaussian Process Classifier",
					"mlp": "MLP Classifier",
					"ridge": "Ridge Classifier",
					"rf": "Random Forest Classifier",
					"qda": "Quadratic Discriminant Analysis",
					"ada": "Ada Boost Classifier",
					"gbc": "Gradient Boosting Classifier",
					"lda": "Linear Discriminant Analysis",
					"et": "Extra Trees Classifier",
					"xgboost": "Extreme Gradient Boosting",
					"lightgbm": "Light Gradient Boosting Machine",
					"catboost": "CatBoost Classifier"
				}
			},
			"exclude": {
				"type": "custom_list",
				"tooltip": "To omit certain models from training and evaluation, pass a list containing model id in the exclude parameter. To see a list of all models available in the model library use the models function.",
				"default_val": "None"
			},
			"fold": {
				"type": "int",
				"tooltip": "Controls cross-validation. If None, the CV generator in the fold_strategy parameter of the setup function is used. When an integer is passed, it is interpreted as the \u2018n_splits\u2019 parameter of the CV generator in the setup function.",
				"default_val": "None"
			},
			"round": {
				"type": "int",
				"tooltip": "Number of decimal places the metrics in the score grid will be rounded to.",
				"default_val": "4"
			},
			"cross_validation": {
				"type": "bool",
				"tooltip": "When set to False, metrics are evaluated on holdout set. fold param is ignored when cross_validation is set to False.",
				"default_val": "True"
			},
			"sort": {
				"type": "string",
				"tooltip": "The sort order of the score grid. It also accepts custom metrics that are added through the add_metric function.",
				"default_val": "Accuracy"
			},
			"n_select": {
				"type": "int",
				"tooltip": "Number of top_n models to return. For example, to select top 3 models use n_select = 3.",
				"default_val": "1"
			},
			"budget_time": {
				"type": "float",
				"tooltip": "If not None, will terminate execution of the function after budget_time minutes have passed and return results up to that point.",
				"default_val": "None"
			},
			"turbo": {
				"type": "bool",
				"tooltip": "When set to True, it excludes estimators with longer training times. To see which algorithms are excluded use the models function.",
				"default_val": "True"
			},
			"errors": {
				"type": "string",
				"tooltip": "When set to \u2018ignore\u2019, will skip the model with exceptions and continue. If \u2018raise\u2019, will break the function when exceptions are raised.",
				"default_val": "ignore"
			},
			"fit_kwargs": {
				"type": "dict",
				"tooltip": "Dictionary of arguments passed to the fit method of the model.",
				"default_val": "{} (empty dict)"
			},
			"groups": {
				"type": "str or array-like",
				"tooltip": "Optional group labels when \u2018GroupKFold\u2019 is used for the cross validation. It takes an array with shape (n_samples, ) where n_samples is the number of rows in the training dataset. When string is passed, it is interpreted as the column name in the dataset containing group labels.",
				"default_val": "None"
			},
			"experiment_custom_tags": {
				"type": "dict",
				"tooltip": "Dictionary of tag_name: String -> value: (String, but will be string-ified if not) passed to the mlflow.set_tags to add new custom tags for the experiment.",
				"default_val": "None"
			},
			"probability_threshold": {
				"type": "float",
				"tooltip": "Threshold for converting predicted probability to class label. It defaults to 0.5 for all classifiers unless explicitly defined in this parameter. Only applicable for binary classification.",
				"default_val": "None"
			},
			"verbose": {
				"type": "bool",
				"tooltip": "Score grid is not printed when verbose is set to False.",
				"default_val": "True"
			},
			"display": {
				"type": "pycaret.internal.Display.Display",
				"tooltip": "Custom display object",
				"default_val": "None"
			},
			"parallel": {
				"type": "pycaret.parallel.parallel_backend.ParallelBackend",
				"tooltip": "A ParallelBackend instance. For example if you have a SparkSession session, you can use FugueBackend(session) to make this function running using Spark. For more details, see FugueBackend",
				"default_val": "None"
			}
		}
	},
	"create_model": {
		"options": {
			"estimator": {
				"type": "list",
				"tooltip": "ID of an estimator available in model library or pass an untrained model object consistent with scikit-learn API. Estimators available in the model library (ID - Name):\n\u2018lr\u2019 - Logistic Regression\n\u2018knn\u2019 - K Neighbors Classifier\n\u2018nb\u2019 - Naive Bayes\n\u2018dt\u2019 - Decision Tree Classifier\n\u2018svm\u2019 - SVM - Linear Kernel\n\u2018rbfsvm\u2019 - SVM - Radial Kernel\n\u2018gpc\u2019 - Gaussian Process Classifier\n\u2018mlp\u2019 - MLP Classifier\n\u2018ridge\u2019 - Ridge Classifier\n\u2018rf\u2019 - Random Forest Classifier\n\u2018qda\u2019 - Quadratic Discriminant Analysis\n\u2018ada\u2019 - Ada Boost Classifier\n\u2018gbc\u2019 - Gradient Boosting Classifier\n\u2018lda\u2019 - Linear Discriminant Analysis\n\u2018et\u2019 - Extra Trees Classifier\n\u2018xgboost\u2019 - Extreme Gradient Boosting\n\u2018lightgbm\u2019 - Light Gradient Boosting Machine\n\u2018catboost\u2019 - CatBoost Classifier",
				"choices": {
					"lr": "Logistic Regression",
					"knn": "K Neighbors Classifier",
					"nb": "Naive Bayes",
					"dt": "Decision Tree Classifier",
					"svm": "SVM - Linear Kernel",
					"rbfsvm": "SVM - Radial Kernel",
					"gpc": "Gaussian Process Classifier",
					"mlp": "MLP Classifier",
					"ridge": "Ridge Classifier",
					"rf": "Random Forest Classifier",
					"qda": "Quadratic Discriminant Analysis",
					"ada": "Ada Boost Classifier",
					"gbc": "Gradient Boosting Classifier",
					"lda": "Linear Discriminant Analysis",
					"et": "Extra Trees Classifier",
					"xgboost": "Extreme Gradient Boosting",
					"lightgbm": "Light Gradient Boosting Machine",
					"catboost": "CatBoost Classifier"
				}
			},
			"fold": {
				"type": "int",
				"tooltip": "Controls cross-validation. If None, the CV generator in the fold_strategy parameter of the setup function is used. When an integer is passed, it is interpreted as the \u2018n_splits\u2019 parameter of the CV generator in the setup function.",
				"default_val": "None"
			},
			"round": {
				"type": "int",
				"tooltip": "Number of decimal places the metrics in the score grid will be rounded to.",
				"default_val": "4"
			},
			"cross_validation": {
				"type": "bool",
				"tooltip": "When set to False, metrics are evaluated on holdout set. fold param is ignored when cross_validation is set to False.",
				"default_val": "True"
			},
			"fit_kwargs": {
				"type": "dict",
				"tooltip": "Dictionary of arguments passed to the fit method of the model.",
				"default_val": "{} (empty dict)"
			},
			"groups": {
				"type": "str or array-like",
				"tooltip": "Optional group labels when GroupKFold is used for the cross validation. It takes an array with shape (n_samples, ) where n_samples is the number of rows in training dataset. When string is passed, it is interpreted as the column name in the dataset containing group labels.",
				"default_val": "None"
			},
			"probability_threshold": {
				"type": "float",
				"tooltip": "Threshold for converting predicted probability to class label. It defaults to 0.5 for all classifiers unless explicitly defined in this parameter. Only applicable for binary classification.",
				"default_val": "None"
			},
			"verbose": {
				"type": "bool",
				"tooltip": "Score grid is not printed when verbose is set to False.",
				"default_val": "True"
			},
			"return_train_score": {
				"type": "bool",
				"tooltip": "If False, returns the CV Validation scores only. If True, returns the CV training scores along with the CV validation scores. This is useful when the user wants to do bias-variance tradeoff. A high CV training score with a low corresponding CV validation score indicates overfitting.",
				"default_val": "False"
			}
		}
	},
	"model": {
		"lr": {
			"options": {}
		},
		"knn": {
			"options": {}
		},
		"nb": {
			"options": {}
		},
		"dt": {
			"options": {}
		},
		"svm": {
			"options": {}
		},
		"rbfsvm": {
			"options": {}
		},
		"gpc": {
			"options": {}
		},
		"mlp": {
			"options": {}
		},
		"ridge": {
			"options": {}
		},
		"rf": {
			"options": {}
		},
		"qda": {
			"options": {}
		},
		"ada": {
			"options": {}
		},
		"gbc": {
			"options": {}
		},
		"lda": {
			"options": {}
		},
		"et": {
			"options": {}
		},
		"xgboost": {
			"options": {}
		},
		"lightgbm": {
			"options": {}
		},
		"catboost": {
			"options": {}
		}
	},
	"analyse": {
		"plot_model": {
			"options": {
				"estimator": {
					"type": "list",
					"tooltip": "Trained model object",
					"choices": {
						"lr": "Logistic Regression",
						"knn": "K Neighbors Classifier",
						"nb": "Naive Bayes",
						"dt": "Decision Tree Classifier",
						"svm": "SVM - Linear Kernel",
						"rbfsvm": "SVM - Radial Kernel",
						"gpc": "Gaussian Process Classifier",
						"mlp": "MLP Classifier",
						"ridge": "Ridge Classifier",
						"rf": "Random Forest Classifier",
						"qda": "Quadratic Discriminant Analysis",
						"ada": "Ada Boost Classifier",
						"gbc": "Gradient Boosting Classifier",
						"lda": "Linear Discriminant Analysis",
						"et": "Extra Trees Classifier",
						"xgboost": "Extreme Gradient Boosting",
						"lightgbm": "Light Gradient Boosting Machine",
						"catboost": "CatBoost Classifier"
					}
				},
				"plot": {
					"type": "string",
					"tooltip": "List of available plots (ID - Name):\n\u2018auc\u2019 - Area Under the Curve\n\u2018threshold\u2019 - Discrimination Threshold\n\u2018pr\u2019 - Precision Recall Curve\n\u2018confusion_matrix\u2019 - Confusion Matrix\n\u2018error\u2019 - Class Prediction Error\n\u2018class_report\u2019 - Classification Report\n\u2018boundary\u2019 - Decision Boundary\n\u2018rfe\u2019 - Recursive Feature Selection\n\u2018learning\u2019 - Learning Curve\n\u2018manifold\u2019 - Manifold Learning\n\u2018calibration\u2019 - Calibration Curve\n\u2018vc\u2019 - Validation Curve\n\u2018dimension\u2019 - Dimension Learning\n\u2018feature\u2019 - Feature Importance\n\u2018feature_all\u2019 - Feature Importance (All)\n\u2018parameter\u2019 - Model Hyperparameter\n\u2018lift\u2019 - Lift Curve\n\u2018gain\u2019 - Gain Chart\n\u2018tree\u2019 - Decision Tree\n\u2018ks\u2019 - KS Statistic Plot",
					"default_val": "auc"
				},
				"scale": {
					"type": "float",
					"tooltip": "The resolution scale of the figure.",
					"default_val": "1"
				},
				"save": {
					"type": "bool",
					"tooltip": "When set to True, plot is saved in the current working directory.",
					"default_val": "False"
				},
				"fold": {
					"type": "int",
					"tooltip": "Controls cross-validation. If None, the CV generator in the fold_strategy parameter of the setup function is used. When an integer is passed, it is interpreted as the \u2018n_splits\u2019 parameter of the CV generator in the setup function.",
					"default_val": "None"
				},
				"fit_kwargs": {
					"type": "dict",
					"tooltip": "Dictionary of arguments passed to the fit method of the model.",
					"default_val": "{} (empty dict)"
				},
				"plot_kwargs": {
					"type": "dict",
					"tooltip": "Dictionary of arguments passed to the visualizer class.",
					"default_val": "{} (empty dict)"
				},
				"groups": {
					"type": "str or array-like",
					"tooltip": "Optional group labels when GroupKFold is used for the cross validation. It takes an array with shape (n_samples, ) where n_samples is the number of rows in training dataset. When string is passed, it is interpreted as the column name in the dataset containing group labels.",
					"default_val": "None"
				},
				"use_train_data": {
					"type": "bool",
					"tooltip": "When set to true, train data will be used for plots, instead of test data.",
					"default_val": "False"
				},
				"verbose": {
					"type": "bool",
					"tooltip": "When set to False, progress bar is not displayed.",
					"default_val": "True"
				},
				"display_format": {
					"type": "string",
					"tooltip": "To display plots in Streamlit (https://www.streamlit.io/), set this to \u2018streamlit\u2019. Currently, not all plots are supported.",
					"default_val": "None"
				}
			}
		},
		"evaluate_model": {
			"options": {
				"estimator": {
					"type": "list",
					"tooltip": "Trained model object",
					"choices": {
						"lr": "Logistic Regression",
						"knn": "K Neighbors Classifier",
						"nb": "Naive Bayes",
						"dt": "Decision Tree Classifier",
						"svm": "SVM - Linear Kernel",
						"rbfsvm": "SVM - Radial Kernel",
						"gpc": "Gaussian Process Classifier",
						"mlp": "MLP Classifier",
						"ridge": "Ridge Classifier",
						"rf": "Random Forest Classifier",
						"qda": "Quadratic Discriminant Analysis",
						"ada": "Ada Boost Classifier",
						"gbc": "Gradient Boosting Classifier",
						"lda": "Linear Discriminant Analysis",
						"et": "Extra Trees Classifier",
						"xgboost": "Extreme Gradient Boosting",
						"lightgbm": "Light Gradient Boosting Machine",
						"catboost": "CatBoost Classifier"
					}
				},
				"fold": {
					"type": "int",
					"tooltip": "Controls cross-validation. If None, the CV generator in the fold_strategy parameter of the setup function is used. When an integer is passed, it is interpreted as the \u2018n_splits\u2019 parameter of the CV generator in the setup function.",
					"default_val": "None"
				},
				"fit_kwargs": {
					"type": "dict",
					"tooltip": "Dictionary of arguments passed to the fit method of the model.",
					"default_val": "{} (empty dict)"
				},
				"plot_kwargs": {
					"type": "dict",
					"tooltip": "Dictionary of arguments passed to the visualizer class.",
					"default_val": "{} (empty dict)"
				},
				"groups": {
					"type": "str or array-like",
					"tooltip": "Optional group labels when GroupKFold is used for the cross validation. It takes an array with shape (n_samples, ) where n_samples is the number of rows in training dataset. When string is passed, it is interpreted as the column name in the dataset containing group labels.",
					"default_val": "None"
				},
				"use_train_data": {
					"type": "bool",
					"tooltip": "When set to true, train data will be used for plots, instead of test data.",
					"default_val": "False"
				}
			}
		},
		"interpret_model": {
			"options": {
				"estimator": {
					"type": "list",
					"tooltip": "Trained model object",
					"choices": {
						"lr": "Logistic Regression",
						"knn": "K Neighbors Classifier",
						"nb": "Naive Bayes",
						"dt": "Decision Tree Classifier",
						"svm": "SVM - Linear Kernel",
						"rbfsvm": "SVM - Radial Kernel",
						"gpc": "Gaussian Process Classifier",
						"mlp": "MLP Classifier",
						"ridge": "Ridge Classifier",
						"rf": "Random Forest Classifier",
						"qda": "Quadratic Discriminant Analysis",
						"ada": "Ada Boost Classifier",
						"gbc": "Gradient Boosting Classifier",
						"lda": "Linear Discriminant Analysis",
						"et": "Extra Trees Classifier",
						"xgboost": "Extreme Gradient Boosting",
						"lightgbm": "Light Gradient Boosting Machine",
						"catboost": "CatBoost Classifier"
					}
				},
				"feature": {
					"type": "string",
					"tooltip": "This parameter is only needed when plot = \u2018correlation\u2019 or \u2018pdp\u2019. By default feature is set to None which means the first column of the dataset will be used as a variable. A feature parameter must be passed to change this.",
					"default_val": "None"
				},
				"observation": {
					"type": "int",
					"tooltip": "This parameter only comes into effect when plot is set to \u2018reason\u2019. If no observation number is provided, it will return an analysis of all observations with the option to select the feature on x and y axes through drop down interactivity. For analysis at the sample level, an observation parameter must be passed with the index value of the observation in test / hold-out set.",
					"default_val": "None"
				},
				"use_train_data": {
					"type": "bool",
					"tooltip": "When set to true, train data will be used for plots, instead of test data.",
					"default_val": "False"
				},
				"X_new_sample": {
					"type": "pd.DataFrame",
					"tooltip": "Row from an out-of-sample dataframe (neither train nor test data) to be plotted. The sample must have the same columns as the raw input data, and it is transformed by the preprocessing pipeline automatically before plotting.",
					"default_val": "None"
				},
				"y_new_sample": {
					"type": "pd.DataFrame",
					"tooltip": "Row from an out-of-sample dataframe (neither train nor test data) to be plotted. The sample must have the same columns as the raw input label data, and it is transformed by the preprocessing pipeline automatically before plotting.",
					"default_val": "None"
				},
				"save": {
					"type": "bool",
					"tooltip": "When set to True, Plot is saved as a \u2018png\u2019 file in current working directory.",
					"default_val": "False"
				}
			}
		},
		"dashboard": {
			"options": {
				"estimator": {
					"type": "list",
					"tooltip": "Trained model object",
					"choices": {
						"lr": "Logistic Regression",
						"knn": "K Neighbors Classifier",
						"nb": "Naive Bayes",
						"dt": "Decision Tree Classifier",
						"svm": "SVM - Linear Kernel",
						"rbfsvm": "SVM - Radial Kernel",
						"gpc": "Gaussian Process Classifier",
						"mlp": "MLP Classifier",
						"ridge": "Ridge Classifier",
						"rf": "Random Forest Classifier",
						"qda": "Quadratic Discriminant Analysis",
						"ada": "Ada Boost Classifier",
						"gbc": "Gradient Boosting Classifier",
						"lda": "Linear Discriminant Analysis",
						"et": "Extra Trees Classifier",
						"xgboost": "Extreme Gradient Boosting",
						"lightgbm": "Light Gradient Boosting Machine",
						"catboost": "CatBoost Classifier"
					}
				},
				"display_format": {
					"type": "string",
					"tooltip": "Render mode for the dashboard. The default is set to dash which will render a dashboard in browser. There are four possible options:\n\u2018dash\u2019 - displays the dashboard in browser\n\u2018inline\u2019 - displays the dashboard in the jupyter notebook cell.\n\u2018jupyterlab\u2019 - displays the dashboard in jupyterlab pane.\n\u2018external\u2019 - displays the dashboard in a separate tab. (use in Colab)",
					"default_val": "dash"
				},
				"dashboard_kwargs": {
					"type": "dict",
					"tooltip": "Dictionary of arguments passed to the ExplainerDashboard class.",
					"default_val": "{} (empty dict)"
				},
				"run_kwargs": {
					"type": "dict",
					"tooltip": "Dictionary of arguments passed to the run method of ExplainerDashboard.",
					"default_val": "{} (empty dict)"
				}
			}
		},
		"eda": {
			"options": {
				"data": {
					"type": "pandas.DataFrame",
					"tooltip": "DataFrame with (n_samples, n_features)."
				},
				"target": {
					"type": "string",
					"tooltip": "Name of the target column to be passed in as a string."
				},
				"display_format": {
					"type": "string",
					"tooltip": "When set to \u2018bokeh\u2019 the plots are interactive. Other option is svg for static plots that are generated using matplotlib and seaborn.",
					"default_val": "bokeh"
				}
			}
		},
		"check_fairness": {
			"options": {
				"estimator": {
					"type": "list",
					"tooltip": "Trained model object",
					"choices": {
						"lr": "Logistic Regression",
						"knn": "K Neighbors Classifier",
						"nb": "Naive Bayes",
						"dt": "Decision Tree Classifier",
						"svm": "SVM - Linear Kernel",
						"rbfsvm": "SVM - Radial Kernel",
						"gpc": "Gaussian Process Classifier",
						"mlp": "MLP Classifier",
						"ridge": "Ridge Classifier",
						"rf": "Random Forest Classifier",
						"qda": "Quadratic Discriminant Analysis",
						"ada": "Ada Boost Classifier",
						"gbc": "Gradient Boosting Classifier",
						"lda": "Linear Discriminant Analysis",
						"et": "Extra Trees Classifier",
						"xgboost": "Extreme Gradient Boosting",
						"lightgbm": "Light Gradient Boosting Machine",
						"catboost": "CatBoost Classifier"
					}
				},
				"sensitive_features": {
					"type": "custom_list",
					"tooltip": "List of column names as present in the original dataset before any transformations."
				},
				"plot_kwargs": {
					"type": "dict",
					"tooltip": "Dictionary of arguments passed to the matplotlib plot.",
					"default_val": "{} (empty dict)"
				}
			}
		},
		"get_leaderboard": {
			"options": {
				"finalize_models": {
					"type": "bool",
					"tooltip": "If True, will finalize all models in the \u2018Model\u2019 column.",
					"default_val": "False"
				},
				"model_only": {
					"type": "bool",
					"tooltip": "When set to False, only model object is returned, instead of the entire pipeline.",
					"default_val": "False"
				},
				"fit_kwargs": {
					"type": "dict",
					"tooltip": "Dictionary of arguments passed to the fit method of the model. Ignored if finalize_models is False.",
					"default_val": "{} (empty dict)"
				},
				"groups": {
					"type": "str or array-like",
					"tooltip": "Optional group labels when GroupKFold is used for the cross validation. It takes an array with shape (n_samples, ) where n_samples is the number of rows in training dataset. When string is passed, it is interpreted as the column name in the dataset containing group labels. Ignored if finalize_models is False.",
					"default_val": "None"
				},
				"verbose": {
					"type": "bool",
					"tooltip": "Progress bar is not printed when verbose is set to False.",
					"default_val": "True"
				}
			}
		}
	},
	"deploy": {
		"predict_model": {
			"options": {
				"estimator": {
					"type": "list",
					"tooltip": "Trained model object",
					"choices": {
						"lr": "Logistic Regression",
						"knn": "K Neighbors Classifier",
						"nb": "Naive Bayes",
						"dt": "Decision Tree Classifier",
						"svm": "SVM - Linear Kernel",
						"rbfsvm": "SVM - Radial Kernel",
						"gpc": "Gaussian Process Classifier",
						"mlp": "MLP Classifier",
						"ridge": "Ridge Classifier",
						"rf": "Random Forest Classifier",
						"qda": "Quadratic Discriminant Analysis",
						"ada": "Ada Boost Classifier",
						"gbc": "Gradient Boosting Classifier",
						"lda": "Linear Discriminant Analysis",
						"et": "Extra Trees Classifier",
						"xgboost": "Extreme Gradient Boosting",
						"lightgbm": "Light Gradient Boosting Machine",
						"catboost": "CatBoost Classifier"
					}
				},
				"data": {
					"type": "pandas.DataFrame",
					"tooltip": "Shape (n_samples, n_features). All features used during training must be available in the unseen dataset."
				},
				"probability_threshold": {
					"type": "float",
					"tooltip": "Threshold for converting predicted probability to class label. Unless this parameter is set, it will default to the value set during model creation. If that wasn\u2019t set, the default will be 0.5 for all classifiers. Only applicable for binary classification.",
					"default_val": "None"
				},
				"encoded_labels": {
					"type": "bool",
					"tooltip": "When set to True, will return labels encoded as an integer.",
					"default_val": "False"
				},
				"raw_score": {
					"type": "bool",
					"tooltip": "When set to True, scores for all labels will be returned.",
					"default_val": "False"
				},
				"drift_report": {
					"type": "bool",
					"tooltip": "When set to True, interactive drift report is generated on test set with the evidently library.",
					"default_val": "False"
				},
				"round": {
					"type": "int",
					"tooltip": "Number of decimal places the metrics in the score grid will be rounded to.",
					"default_val": "4"
				},
				"verbose": {
					"type": "bool",
					"tooltip": "When set to False, holdout score grid is not printed.",
					"default_val": "True"
				}
			}
		},
		"finalize_model": {
			"options": {
				"estimator": {
					"type": "list",
					"tooltip": "Trained model object",
					"choices": {
						"lr": "Logistic Regression",
						"knn": "K Neighbors Classifier",
						"nb": "Naive Bayes",
						"dt": "Decision Tree Classifier",
						"svm": "SVM - Linear Kernel",
						"rbfsvm": "SVM - Radial Kernel",
						"gpc": "Gaussian Process Classifier",
						"mlp": "MLP Classifier",
						"ridge": "Ridge Classifier",
						"rf": "Random Forest Classifier",
						"qda": "Quadratic Discriminant Analysis",
						"ada": "Ada Boost Classifier",
						"gbc": "Gradient Boosting Classifier",
						"lda": "Linear Discriminant Analysis",
						"et": "Extra Trees Classifier",
						"xgboost": "Extreme Gradient Boosting",
						"lightgbm": "Light Gradient Boosting Machine",
						"catboost": "CatBoost Classifier"
					}
				},
				"fit_kwargs": {
					"type": "dict",
					"tooltip": "Dictionary of arguments passed to the fit method of the model.",
					"default_val": "{} (empty dict)"
				},
				"groups": {
					"type": "str or array-like",
					"tooltip": "Optional group labels when GroupKFold is used for the cross validation. It takes an array with shape (n_samples, ) where n_samples is the number of rows in training dataset. When string is passed, it is interpreted as the column name in the dataset containing group labels.",
					"default_val": "None"
				},
				"model_only": {
					"type": "bool",
					"tooltip": "When set to False, only model object is re-trained and all the transformations in Pipeline are ignored.",
					"default_val": "True"
				},
				"experiment_custom_tags": {
					"type": "dict",
					"tooltip": "Dictionary of tag_name: String -> value: (String, but will be string-ified if not) passed to the mlflow.set_tags to add new custom tags for the experiment.",
					"default_val": "None"
				},
				"return_train_score": {
					"type": "bool",
					"tooltip": "If False, returns the CV Validation scores only. If True, returns the CV training scores along with the CV validation scores. This is useful when the user wants to do bias-variance tradeoff. A high CV training score with a low corresponding CV validation score indicates overfitting.",
					"default_val": "False"
				}
			}
		},
		"save_model": {
			"options": {
				"model": {
					"type": "list",
					"tooltip": "Trained model object",
					"choices": {
						"lr": "Logistic Regression",
						"knn": "K Neighbors Classifier",
						"nb": "Naive Bayes",
						"dt": "Decision Tree Classifier",
						"svm": "SVM - Linear Kernel",
						"rbfsvm": "SVM - Radial Kernel",
						"gpc": "Gaussian Process Classifier",
						"mlp": "MLP Classifier",
						"ridge": "Ridge Classifier",
						"rf": "Random Forest Classifier",
						"qda": "Quadratic Discriminant Analysis",
						"ada": "Ada Boost Classifier",
						"gbc": "Gradient Boosting Classifier",
						"lda": "Linear Discriminant Analysis",
						"et": "Extra Trees Classifier",
						"xgboost": "Extreme Gradient Boosting",
						"lightgbm": "Light Gradient Boosting Machine",
						"catboost": "CatBoost Classifier"
					}
				},
				"model_name": {
					"type": "string",
					"tooltip": "Name of the model."
				},
				"model_only": {
					"type": "bool",
					"tooltip": "When set to True, only trained model object is saved instead of the entire pipeline.",
					"default_val": "False"
				},
				"verbose": {
					"type": "bool",
					"tooltip": "Success message is not printed when verbose is set to False.",
					"default_val": "True"
				}
			}
		},
		"save_config": {
			"options": {}
		},
		"deploy_model": {
			"options": {
				"Amazon Web Service (AWS) users": {
					"type": "",
					"tooltip": "To deploy a model on AWS S3 (\u2018aws\u2019), the credentials have to be passed. The easiest way is to use environment variables in your local environment. Following information from the IAM portal of amazon console account are required:\nAWS Access Key ID\nAWS Secret Key Access\nMore info: https://boto3.amazonaws.com/v1/documentation/api/latest/guide/credentials.html#environment-variables"
				},
				"Google Cloud Platform (GCP) users": {
					"type": "",
					"tooltip": "To deploy a model on Google Cloud Platform (\u2018gcp\u2019), project must be created using command line or GCP console. Once project is created, you must create a service account and download the service account key as a JSON file to set environment variables in your local environment.\nMore info: https://cloud.google.com/docs/authentication/production"
				},
				"Microsoft Azure (Azure) users": {
					"type": "",
					"tooltip": "To deploy a model on Microsoft Azure (\u2018azure\u2019), environment variables for connection string must be set in your local environment. Go to settings of storage account on Azure portal to access the connection string required.\nAZURE_STORAGE_CONNECTION_STRING (required as environment variable)\nMore info: https://docs.microsoft.com/en-us/azure/storage/blobs/storage-quickstart-blobs-python?toc=%2Fpython%2Fazure%2FTOC.json"
				},
				"model": {
					"type": "list",
					"tooltip": "Trained model object",
					"choices": {
						"lr": "Logistic Regression",
						"knn": "K Neighbors Classifier",
						"nb": "Naive Bayes",
						"dt": "Decision Tree Classifier",
						"svm": "SVM - Linear Kernel",
						"rbfsvm": "SVM - Radial Kernel",
						"gpc": "Gaussian Process Classifier",
						"mlp": "MLP Classifier",
						"ridge": "Ridge Classifier",
						"rf": "Random Forest Classifier",
						"qda": "Quadratic Discriminant Analysis",
						"ada": "Ada Boost Classifier",
						"gbc": "Gradient Boosting Classifier",
						"lda": "Linear Discriminant Analysis",
						"et": "Extra Trees Classifier",
						"xgboost": "Extreme Gradient Boosting",
						"lightgbm": "Light Gradient Boosting Machine",
						"catboost": "CatBoost Classifier"
					}
				},
				"model_name": {
					"type": "string",
					"tooltip": "Name of model."
				},
				"authentication": {
					"type": "dict",
					"tooltip": "Dictionary of applicable authentication tokens.\nWhen platform = \u2018aws\u2019: {\u2018bucket\u2019 : \u2018S3-bucket-name\u2019, \u2018path\u2019: (optional) folder name under the bucket}\nWhen platform = \u2018gcp\u2019: {\u2018project\u2019: \u2018gcp-project-name\u2019, \u2018bucket\u2019 : \u2018gcp-bucket-name\u2019}\nWhen platform = \u2018azure\u2019: {\u2018container\u2019: \u2018azure-container-name\u2019}"
				},
				"platform": {
					"type": "string",
					"tooltip": "Name of the platform. Currently supported platforms: \u2018aws\u2019, \u2018gcp\u2019 and \u2018azure\u2019.",
					"default_val": "aws"
				}
			}
		},
		"convert_model": {
			"options": {
				"estimator": {
					"type": "list",
					"tooltip": "Trained model object",
					"choices": {
						"lr": "Logistic Regression",
						"knn": "K Neighbors Classifier",
						"nb": "Naive Bayes",
						"dt": "Decision Tree Classifier",
						"svm": "SVM - Linear Kernel",
						"rbfsvm": "SVM - Radial Kernel",
						"gpc": "Gaussian Process Classifier",
						"mlp": "MLP Classifier",
						"ridge": "Ridge Classifier",
						"rf": "Random Forest Classifier",
						"qda": "Quadratic Discriminant Analysis",
						"ada": "Ada Boost Classifier",
						"gbc": "Gradient Boosting Classifier",
						"lda": "Linear Discriminant Analysis",
						"et": "Extra Trees Classifier",
						"xgboost": "Extreme Gradient Boosting",
						"lightgbm": "Light Gradient Boosting Machine",
						"catboost": "CatBoost Classifier"
					}
				},
				"language": {
					"type": "string",
					"tooltip": "Language in which inference script to be generated. Following options are available:\n\u2018python\u2019\n\u2018java\u2019\n\u2018javascript\u2019\n\u2018c\u2019\n\u2018c#\u2019\n\u2018f#\u2019\n\u2018go\u2019\n\u2018haskell\u2019\n\u2018php\u2019\n\u2018powershell\u2019\n\u2018r\u2019\n\u2018ruby\u2019\n\u2018vb\u2019\n\u2018dart\u2019",
					"default_val": "python"
				}
			}
		},
		"create_api": {
			"options": {
				"estimator": {
					"type": "list",
					"tooltip": "Trained model object",
					"choices": {
						"lr": "Logistic Regression",
						"knn": "K Neighbors Classifier",
						"nb": "Naive Bayes",
						"dt": "Decision Tree Classifier",
						"svm": "SVM - Linear Kernel",
						"rbfsvm": "SVM - Radial Kernel",
						"gpc": "Gaussian Process Classifier",
						"mlp": "MLP Classifier",
						"ridge": "Ridge Classifier",
						"rf": "Random Forest Classifier",
						"qda": "Quadratic Discriminant Analysis",
						"ada": "Ada Boost Classifier",
						"gbc": "Gradient Boosting Classifier",
						"lda": "Linear Discriminant Analysis",
						"et": "Extra Trees Classifier",
						"xgboost": "Extreme Gradient Boosting",
						"lightgbm": "Light Gradient Boosting Machine",
						"catboost": "CatBoost Classifier"
					}
				},
				"api_name": {
					"type": "list",
					"tooltip": "Trained model object",
					"choices": {
						"lr": "Logistic Regression",
						"knn": "K Neighbors Classifier",
						"nb": "Naive Bayes",
						"dt": "Decision Tree Classifier",
						"svm": "SVM - Linear Kernel",
						"rbfsvm": "SVM - Radial Kernel",
						"gpc": "Gaussian Process Classifier",
						"mlp": "MLP Classifier",
						"ridge": "Ridge Classifier",
						"rf": "Random Forest Classifier",
						"qda": "Quadratic Discriminant Analysis",
						"ada": "Ada Boost Classifier",
						"gbc": "Gradient Boosting Classifier",
						"lda": "Linear Discriminant Analysis",
						"et": "Extra Trees Classifier",
						"xgboost": "Extreme Gradient Boosting",
						"lightgbm": "Light Gradient Boosting Machine",
						"catboost": "CatBoost Classifier"
					}
				},
				"host": {
					"type": "string",
					"tooltip": "API host address.",
					"default_val": "127.0.0.1"
				},
				"port": {
					"type": "int",
					"tooltip": "port for API.",
					"default_val": "8000"
				}
			}
		},
		"create_docker": {
			"options": {
				"api_name": {
					"type": "string",
					"tooltip": "Name of API. Must be saved as a .py file in the same folder."
				},
				"base_image": {
					"type": "string",
					"tooltip": "Name of the base image for Dockerfile.",
					"default_val": "\u201cpython:3.8-slim\u201d"
				},
				"expose_port": {
					"type": "int",
					"tooltip": "port for expose for API in the Dockerfile.",
					"default_val": "8000"
				}
			}
		},
		"create_app": {
			"options": {
				"estimator": {
					"type": "list",
					"tooltip": "Trained model object",
					"choices": {
						"lr": "Logistic Regression",
						"knn": "K Neighbors Classifier",
						"nb": "Naive Bayes",
						"dt": "Decision Tree Classifier",
						"svm": "SVM - Linear Kernel",
						"rbfsvm": "SVM - Radial Kernel",
						"gpc": "Gaussian Process Classifier",
						"mlp": "MLP Classifier",
						"ridge": "Ridge Classifier",
						"rf": "Random Forest Classifier",
						"qda": "Quadratic Discriminant Analysis",
						"ada": "Ada Boost Classifier",
						"gbc": "Gradient Boosting Classifier",
						"lda": "Linear Discriminant Analysis",
						"et": "Extra Trees Classifier",
						"xgboost": "Extreme Gradient Boosting",
						"lightgbm": "Light Gradient Boosting Machine",
						"catboost": "CatBoost Classifier"
					}
				},
				"app_kwargs": {
					"type": "dict",
					"tooltip": "arguments to be passed to app class.",
					"default_val": "{}"
				}
			}
		}
	},
	"tune_model": {
		"options": {
			"estimator": {
				"type": "list",
				"tooltip": "Trained model object",
				"choices": {
					"lr": "Logistic Regression",
					"knn": "K Neighbors Classifier",
					"nb": "Naive Bayes",
					"dt": "Decision Tree Classifier",
					"svm": "SVM - Linear Kernel",
					"rbfsvm": "SVM - Radial Kernel",
					"gpc": "Gaussian Process Classifier",
					"mlp": "MLP Classifier",
					"ridge": "Ridge Classifier",
					"rf": "Random Forest Classifier",
					"qda": "Quadratic Discriminant Analysis",
					"ada": "Ada Boost Classifier",
					"gbc": "Gradient Boosting Classifier",
					"lda": "Linear Discriminant Analysis",
					"et": "Extra Trees Classifier",
					"xgboost": "Extreme Gradient Boosting",
					"lightgbm": "Light Gradient Boosting Machine",
					"catboost": "CatBoost Classifier"
				}
			},
			"fold": {
				"type": "int",
				"tooltip": "Controls cross-validation. If None, the CV generator in the fold_strategy parameter of the setup function is used. When an integer is passed, it is interpreted as the \u2018n_splits\u2019 parameter of the CV generator in the setup function.",
				"default_val": "None"
			},
			"round": {
				"type": "int",
				"tooltip": "Number of decimal places the metrics in the score grid will be rounded to.",
				"default_val": "4"
			},
			"n_iter": {
				"type": "int",
				"tooltip": "Number of iterations in the grid search. Increasing \u2018n_iter\u2019 may improve model performance but also increases the training time.",
				"default_val": "10"
			},
			"custom_grid": {
				"type": "dict",
				"tooltip": "To define custom search space for hyperparameters, pass a dictionary with parameter name and values to be iterated. Custom grids must be in a format supported by the defined search_library.",
				"default_val": "None"
			},
			"optimize": {
				"type": "string",
				"tooltip": "Metric name to be evaluated for hyperparameter tuning. It also accepts custom metrics that are added through the add_metric function.",
				"default_val": "Accuracy"
			},
			"custom_scorer": {
				"type": "object",
				"tooltip": "custom scoring strategy can be passed to tune hyperparameters of the model. It must be created using sklearn.make_scorer. It is equivalent of adding custom metric using the add_metric function and passing the name of the custom metric in the optimize parameter. Will be deprecated in future.",
				"default_val": "None"
			},
			"search_library": {
				"type": "string",
				"tooltip": "The search library used for tuning hyperparameters. Possible values:\n\u2018scikit-learn\u2019 - default, requires no further installation\nhttps://github.com/scikit-learn/scikit-learn\n\u2018scikit-optimize\u2019 - pip install scikit-optimize\nhttps://scikit-optimize.github.io/stable/\n\u2018tune-sklearn\u2019 - pip install tune-sklearn ray[tune]\nhttps://github.com/ray-project/tune-sklearn\n\u2018optuna\u2019 - pip install optuna\nhttps://optuna.org/",
				"default_val": "scikit-learn"
			},
			"search_algorithm": {
				"type": "string",
				"tooltip": "The search algorithm depends on the search_library parameter. Some search algorithms require additional libraries to be installed. If None, will use search library-specific default algorithm.\n\u2018scikit-learn\u2019 possible values:\n\u2018random\u2019 : random grid search (default)\n\u2018grid\u2019 : grid search\n\u2018scikit-optimize\u2019 possible values:\n\u2018bayesian\u2019 : Bayesian search (default)\n\u2018tune-sklearn\u2019 possible values:\n\u2018random\u2019 : random grid search (default)\n\u2018grid\u2019 : grid search\n\u2018bayesian\u2019 : pip install scikit-optimize\n\u2018hyperopt\u2019 : pip install hyperopt\n\u2018optuna\u2019 : pip install optuna\n\u2018bohb\u2019 : pip install hpbandster ConfigSpace\n\u2018optuna\u2019 possible values:\n\u2018random\u2019 : randomized search\n\u2018tpe\u2019 : Tree-structured Parzen Estimator search (default)",
				"default_val": "None"
			},
			"early_stopping": {
				"type": "bool or str or object",
				"tooltip": "Use early stopping to stop fitting to a hyperparameter configuration if it performs poorly. Ignored when search_library is scikit-learn, or if the estimator does not have \u2018partial_fit\u2019 attribute. If False or None, early stopping will not be used. Can be either an object accepted by the search library or one of the following:\n\u2018asha\u2019 for Asynchronous Successive Halving Algorithm\n\u2018hyperband\u2019 for Hyperband\n\u2018median\u2019 for Median Stopping Rule\nIf False or None, early stopping will not be used.",
				"default_val": "False"
			},
			"early_stopping_max_iters": {
				"type": "int",
				"tooltip": "Maximum number of epochs to run for each sampled configuration. Ignored if early_stopping is False or None.",
				"default_val": "10"
			},
			"choose_better": {
				"type": "bool",
				"tooltip": "When set to True, the returned object is always better performing. The metric used for comparison is defined by the optimize parameter.",
				"default_val": "False"
			},
			"fit_kwargs": {
				"type": "dict",
				"tooltip": "Dictionary of arguments passed to the fit method of the tuner.",
				"default_val": "{} (empty dict)"
			},
			"groups": {
				"type": "str or array-like",
				"tooltip": "Optional group labels when GroupKFold is used for the cross validation. It takes an array with shape (n_samples, ) where n_samples is the number of rows in training dataset. When string is passed, it is interpreted as the column name in the dataset containing group labels.",
				"default_val": "None"
			},
			"return_tuner": {
				"type": "bool",
				"tooltip": "When set to True, will return a tuple of (model, tuner_object).",
				"default_val": "False"
			},
			"verbose": {
				"type": "bool",
				"tooltip": "Score grid is not printed when verbose is set to False.",
				"default_val": "True"
			},
			"tuner_verbose": {
				"type": "bool or in",
				"tooltip": "If True or above 0, will print messages from the tuner. Higher values print more messages. Ignored when verbose param is False.",
				"default_val": "True"
			},
			"return_train_score": {
				"type": "bool",
				"tooltip": "If False, returns the CV Validation scores only. If True, returns the CV training scores along with the CV validation scores. This is useful when the user wants to do bias-variance tradeoff. A high CV training score with a low corresponding CV validation score indicates overfitting.",
				"default_val": "False"
			}
		},
		"ml_types": "classification regression survival_analysis"
	},
	"ensemble_model": {
		"options": {
			"estimator": {
				"type": "list",
				"tooltip": "Trained model object",
				"choices": {
					"lr": "Logistic Regression",
					"knn": "K Neighbors Classifier",
					"nb": "Naive Bayes",
					"dt": "Decision Tree Classifier",
					"svm": "SVM - Linear Kernel",
					"rbfsvm": "SVM - Radial Kernel",
					"gpc": "Gaussian Process Classifier",
					"mlp": "MLP Classifier",
					"ridge": "Ridge Classifier",
					"rf": "Random Forest Classifier",
					"qda": "Quadratic Discriminant Analysis",
					"ada": "Ada Boost Classifier",
					"gbc": "Gradient Boosting Classifier",
					"lda": "Linear Discriminant Analysis",
					"et": "Extra Trees Classifier",
					"xgboost": "Extreme Gradient Boosting",
					"lightgbm": "Light Gradient Boosting Machine",
					"catboost": "CatBoost Classifier"
				}
			},
			"method": {
				"type": "string",
				"tooltip": "Method for ensembling base estimator. It can be \u2018Bagging\u2019 or \u2018Boosting\u2019.",
				"default_val": "Bagging"
			},
			"fold": {
				"type": "int",
				"tooltip": "Controls cross-validation. If None, the CV generator in the fold_strategy parameter of the setup function is used. When an integer is passed, it is interpreted as the \u2018n_splits\u2019 parameter of the CV generator in the setup function.",
				"default_val": "None"
			},
			"n_estimators": {
				"type": "int",
				"tooltip": "The number of base estimators in the ensemble. In case of perfect fit, the learning procedure is stopped early.",
				"default_val": "10"
			},
			"round": {
				"type": "int",
				"tooltip": "Number of decimal places the metrics in the score grid will be rounded to.",
				"default_val": "4"
			},
			"choose_better": {
				"type": "bool",
				"tooltip": "When set to True, the returned object is always better performing. The metric used for comparison is defined by the optimize parameter.",
				"default_val": "False"
			},
			"optimize": {
				"type": "string",
				"tooltip": "Metric to compare for model selection when choose_better is True.",
				"default_val": "Accuracy"
			},
			"fit_kwargs": {
				"type": "dict",
				"tooltip": "Dictionary of arguments passed to the fit method of the model.",
				"default_val": "{} (empty dict)"
			},
			"groups": {
				"type": "str or array-like",
				"tooltip": "Optional group labels when GroupKFold is used for the cross validation. It takes an array with shape (n_samples, ) where n_samples is the number of rows in training dataset. When string is passed, it is interpreted as the column name in the dataset containing group labels.",
				"default_val": "None"
			},
			"probability_threshold": {
				"type": "float",
				"tooltip": "Threshold for converting predicted probability to class label. It defaults to 0.5 for all classifiers unless explicitly defined in this parameter. Only applicable for binary classification.",
				"default_val": "None"
			},
			"verbose": {
				"type": "bool",
				"tooltip": "Score grid is not printed when verbose is set to False.",
				"default_val": "True"
			},
			"return_train_score": {
				"type": "bool",
				"tooltip": "If False, returns the CV Validation scores only. If True, returns the CV training scores along with the CV validation scores. This is useful when the user wants to do bias-variance tradeoff. A high CV training score with a low corresponding CV validation score indicates overfitting.",
				"default_val": "False"
			}
		},
		"ml_types": "classification regression"
	},
	"blend_models": {
		"options": {
			"estimator_list": {
				"type": "list of scikit-learn compatible objects",
				"tooltip": "List of trained model objects"
			},
			"fold": {
				"type": "int",
				"tooltip": "Controls cross-validation. If None, the CV generator in the fold_strategy parameter of the setup function is used. When an integer is passed, it is interpreted as the \u2018n_splits\u2019 parameter of the CV generator in the setup function.",
				"default_val": "None"
			},
			"round": {
				"type": "int",
				"tooltip": "Number of decimal places the metrics in the score grid will be rounded to.",
				"default_val": "4"
			},
			"choose_better": {
				"type": "bool",
				"tooltip": "When set to True, the returned object is always better performing. The metric used for comparison is defined by the optimize parameter.",
				"default_val": "False"
			},
			"optimize": {
				"type": "string",
				"tooltip": "Metric to compare for model selection when choose_better is True.",
				"default_val": "Accuracy"
			},
			"method": {
				"type": "string",
				"tooltip": "\u2018hard\u2019 uses predicted class labels for majority rule voting. \u2018soft\u2019, predicts the class label based on the argmax of the sums of the predicted probabilities, which is recommended for an ensemble of well-calibrated classifiers. Default value, \u2018auto\u2019, will try to use \u2018soft\u2019 and fall back to \u2018hard\u2019 if the former is not supported.",
				"default_val": "auto"
			},
			"weights": {
				"type": "custom_list",
				"tooltip": "Sequence of weights (float or int) to weight the occurrences of predicted class labels (hard voting) or class probabilities before averaging (soft voting). Uses uniform weights when None.",
				"default_val": "None"
			},
			"fit_kwargs": {
				"type": "dict",
				"tooltip": "Dictionary of arguments passed to the fit method of the model.",
				"default_val": "{} (empty dict)"
			},
			"groups": {
				"type": "str or array-like",
				"tooltip": "Optional group labels when GroupKFold is used for the cross validation. It takes an array with shape (n_samples, ) where n_samples is the number of rows in training dataset. When string is passed, it is interpreted as the column name in the dataset containing group labels.",
				"default_val": "None"
			},
			"probability_threshold": {
				"type": "float",
				"tooltip": "Threshold for converting predicted probability to class label. It defaults to 0.5 for all classifiers unless explicitly defined in this parameter. Only applicable for binary classification.",
				"default_val": "None"
			},
			"verbose": {
				"type": "bool",
				"tooltip": "Score grid is not printed when verbose is set to False.",
				"default_val": "True"
			},
			"return_train_score": {
				"type": "bool",
				"tooltip": "If False, returns the CV Validation scores only. If True, returns the CV training scores along with the CV validation scores. This is useful when the user wants to do bias-variance tradeoff. A high CV training score with a low corresponding CV validation score indicates overfitting.",
				"default_val": "False"
			}
		},
		"ml_types": "classification regression"
	},
	"stack_models": {
		"options": {
			"estimator_list": {
				"type": "list of scikit-learn compatible objects",
				"tooltip": "List of trained model objects"
			},
			"meta_model": {
				"type": "list",
				"tooltip": "When None, Logistic Regression is trained as a meta model.",
				"default_val": "None",
				"choices": {
					"lr": "Logistic Regression",
					"knn": "K Neighbors Classifier",
					"nb": "Naive Bayes",
					"dt": "Decision Tree Classifier",
					"svm": "SVM - Linear Kernel",
					"rbfsvm": "SVM - Radial Kernel",
					"gpc": "Gaussian Process Classifier",
					"mlp": "MLP Classifier",
					"ridge": "Ridge Classifier",
					"rf": "Random Forest Classifier",
					"qda": "Quadratic Discriminant Analysis",
					"ada": "Ada Boost Classifier",
					"gbc": "Gradient Boosting Classifier",
					"lda": "Linear Discriminant Analysis",
					"et": "Extra Trees Classifier",
					"xgboost": "Extreme Gradient Boosting",
					"lightgbm": "Light Gradient Boosting Machine",
					"catboost": "CatBoost Classifier"
				}
			},
			"meta_model_fold": {
				"type": "integer or scikit-learn compatible CV generator",
				"tooltip": "Controls internal cross-validation. Can be an integer or a scikit-learn CV generator. If set to an integer, will use (Stratifed)KFold CV with that many folds. See scikit-learn documentation on Stacking for more details.",
				"default_val": "5"
			},
			"fold": {
				"type": "int",
				"tooltip": "Controls cross-validation. If None, the CV generator in the fold_strategy parameter of the setup function is used. When an integer is passed, it is interpreted as the \u2018n_splits\u2019 parameter of the CV generator in the setup function.",
				"default_val": "None"
			},
			"round": {
				"type": "int",
				"tooltip": "Number of decimal places the metrics in the score grid will be rounded to.",
				"default_val": "4"
			},
			"method": {
				"type": "string",
				"tooltip": "When set to \u2018auto\u2019, it will invoke, for each estimator, \u2018predict_proba\u2019, \u2018decision_function\u2019 or \u2018predict\u2019 in that order. Other, manually pass one of the value from \u2018predict_proba\u2019, \u2018decision_function\u2019 or \u2018predict\u2019.",
				"default_val": "auto"
			},
			"restack": {
				"type": "bool",
				"tooltip": "When set to False, only the predictions of estimators will be used as training data for the meta_model.",
				"default_val": "True"
			},
			"choose_better": {
				"type": "bool",
				"tooltip": "When set to True, the returned object is always better performing. The metric used for comparison is defined by the optimize parameter.",
				"default_val": "False"
			},
			"optimize": {
				"type": "string",
				"tooltip": "Metric to compare for model selection when choose_better is True.",
				"default_val": "Accuracy"
			},
			"fit_kwargs": {
				"type": "dict",
				"tooltip": "Dictionary of arguments passed to the fit method of the model.",
				"default_val": "{} (empty dict)"
			},
			"groups": {
				"type": "str or array-like",
				"tooltip": "Optional group labels when GroupKFold is used for the cross validation. It takes an array with shape (n_samples, ) where n_samples is the number of rows in training dataset. When string is passed, it is interpreted as the column name in the dataset containing group labels.",
				"default_val": "None"
			},
			"probability_threshold": {
				"type": "float",
				"tooltip": "Threshold for converting predicted probability to class label. It defaults to 0.5 for all classifiers unless explicitly defined in this parameter. Only applicable for binary classification.",
				"default_val": "None"
			},
			"verbose": {
				"type": "bool",
				"tooltip": "Score grid is not printed when verbose is set to False.",
				"default_val": "True"
			},
			"return_train_score": {
				"type": "bool",
				"tooltip": "If False, returns the CV Validation scores only. If True, returns the CV training scores along with the CV validation scores. This is useful when the user wants to do bias-variance tradeoff. A high CV training score with a low corresponding CV validation score indicates overfitting.",
				"default_val": "False"
			}
		},
		"ml_types": "classification regression"
	},
	"optimize_threshold": {
		"options": {},
		"ml_types": "classification"
	},
	"calibrate_model": {
		"options": {
			"estimator": {
				"type": "list",
				"tooltip": "Trained model object",
				"choices": {
					"lr": "Logistic Regression",
					"knn": "K Neighbors Classifier",
					"nb": "Naive Bayes",
					"dt": "Decision Tree Classifier",
					"svm": "SVM - Linear Kernel",
					"rbfsvm": "SVM - Radial Kernel",
					"gpc": "Gaussian Process Classifier",
					"mlp": "MLP Classifier",
					"ridge": "Ridge Classifier",
					"rf": "Random Forest Classifier",
					"qda": "Quadratic Discriminant Analysis",
					"ada": "Ada Boost Classifier",
					"gbc": "Gradient Boosting Classifier",
					"lda": "Linear Discriminant Analysis",
					"et": "Extra Trees Classifier",
					"xgboost": "Extreme Gradient Boosting",
					"lightgbm": "Light Gradient Boosting Machine",
					"catboost": "CatBoost Classifier"
				}
			},
			"method": {
				"type": "string",
				"tooltip": "The method to use for calibration. Can be \u2018sigmoid\u2019 which corresponds to Platt\u2019s method or \u2018isotonic\u2019 which is a non-parametric approach.",
				"default_val": "sigmoid"
			},
			"calibrate_fold": {
				"type": "integer or scikit-learn compatible CV generator",
				"tooltip": "Controls internal cross-validation. Can be an integer or a scikit-learn CV generator. If set to an integer, will use (Stratifed)KFold CV with that many folds. See scikit-learn documentation on Stacking for more details.",
				"default_val": "5"
			},
			"fold": {
				"type": "int",
				"tooltip": "Controls cross-validation. If None, the CV generator in the fold_strategy parameter of the setup function is used. When an integer is passed, it is interpreted as the \u2018n_splits\u2019 parameter of the CV generator in the setup function.",
				"default_val": "None"
			},
			"round": {
				"type": "int",
				"tooltip": "Number of decimal places the metrics in the score grid will be rounded to.",
				"default_val": "4"
			},
			"fit_kwargs": {
				"type": "dict",
				"tooltip": "Dictionary of arguments passed to the fit method of the model.",
				"default_val": "{} (empty dict)"
			},
			"groups": {
				"type": "str or array-like",
				"tooltip": "Optional group labels when GroupKFold is used for the cross validation. It takes an array with shape (n_samples, ) where n_samples is the number of rows in training dataset. When string is passed, it is interpreted as the column name in the dataset containing group labels.",
				"default_val": "None"
			},
			"verbose": {
				"type": "bool",
				"tooltip": "Score grid is not printed when verbose is set to False.",
				"default_val": "True"
			},
			"return_train_score": {
				"type": "bool",
				"tooltip": "If False, returns the CV Validation scores only. If True, returns the CV training scores along with the CV validation scores. This is useful when the user wants to do bias-variance tradeoff. A high CV training score with a low corresponding CV validation score indicates overfitting.",
				"default_val": "False"
			}
		},
		"ml_types": "classification"
	}
};