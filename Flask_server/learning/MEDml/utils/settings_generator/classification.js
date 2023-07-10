var classification = {
	"split": {
		"options": {
			"train_size": {
				"type": "float",
				"tooltip": "<p>Proportion of the dataset to be used for training and validation. Should be\nbetween 0.0 and 1.0.</p>\n",
				"default_val": "0.7"
			},
			"data_split_stratify": {
				"type": "bool",
				"tooltip": "<p>Controls stratification during \u2018train_test_split\u2019. When set to True, will\nstratify by target column. To stratify on any other columns, pass a list of\ncolumn names. Ignored when <code class=\"docutils literal notranslate\"><span class=\"pre\">data_split_shuffle</span></code> is False.</p>\n",
				"default_val": "False"
			},
			"data_split_shuffle": {
				"type": "bool",
				"tooltip": "<p>When set to False, prevents shuffling of rows during \u2018train_test_split\u2019.</p>\n",
				"default_val": "True"
			}
		}
	},
	"clean": {
		"options": {
			"imputation_type": {
				"type": "string",
				"tooltip": "<p>The type of imputation to use. Can be either \u2018simple\u2019 or \u2018iterative\u2019.</p>\n",
				"default_val": "simple"
			},
			"normalize": {
				"type": "bool",
				"tooltip": "<p>When set to True, it transforms the numeric features by scaling them to a given\nrange. Type of scaling is defined by the <code class=\"docutils literal notranslate\"><span class=\"pre\">normalize_method</span></code> parameter.</p>\n",
				"default_val": "False"
			},
			"normalize_method": {
				"type": "string",
				"tooltip": "<p>Defines the method for scaling. By default, normalize method is set to \u2018zscore\u2019\nThe standard zscore is calculated as z = (x - u) / s. Ignored when <code class=\"docutils literal notranslate\"><span class=\"pre\">normalize</span></code>\nis not True. The other options are:</p>\n<ul class=\"simple\">\n<li><p>minmax: scales and translates each feature individually such that it is in\nthe range of 0 - 1.</p></li>\n<li><p>maxabs: scales and translates each feature individually such that the\nmaximal absolute value of each feature will be 1.0. It does not\nshift/center the data, and thus does not destroy any sparsity.</p></li>\n<li><p>robust: scales and translates each feature according to the Interquartile\nrange. When the dataset contains outliers, robust scaler often gives\nbetter results.</p></li>\n</ul>\n",
				"default_val": "zscore"
			},
			"iterative_imputation_iters": {
				"type": "int",
				"tooltip": "<p>Number of iterations. Ignored when <code class=\"docutils literal notranslate\"><span class=\"pre\">imputation_type</span></code> is not \u2018iterative\u2019.</p>\n",
				"default_val": "5"
			},
			"categorical_imputation": {
				"type": "string",
				"tooltip": "<p>Missing values in categorical features are imputed with a constant \u2018not_available\u2019\nvalue. The other available option is \u2018mode\u2019.</p>\n",
				"default_val": "constant"
			},
			"categorical_iterative_imputer": {
				"type": "string",
				"tooltip": "<p>Estimator for iterative imputation of missing values in categorical features.\nIgnored when <code class=\"docutils literal notranslate\"><span class=\"pre\">imputation_type</span></code> is not \u2018iterative\u2019.</p>\n",
				"default_val": "lightgbm"
			},
			"numeric_imputation": {
				"type": "string",
				"tooltip": "<p>Missing values in numeric features are imputed with \u2018mean\u2019 value of the feature\nin the training dataset. The other available option is \u2018median\u2019 or \u2018zero\u2019.</p>\n",
				"default_val": "mean"
			},
			"numeric_iterative_imputer": {
				"type": "string",
				"tooltip": "<p>Estimator for iterative imputation of missing values in numeric features.\nIgnored when <code class=\"docutils literal notranslate\"><span class=\"pre\">imputation_type</span></code> is set to \u2018simple\u2019.</p>\n",
				"default_val": "lightgbm"
			},
			"transformation": {
				"type": "bool",
				"tooltip": "<p>When set to True, it applies the power transform to make data more Gaussian-like.\nType of transformation is defined by the <code class=\"docutils literal notranslate\"><span class=\"pre\">transformation_method</span></code> parameter.</p>\n",
				"default_val": "False"
			},
			"transformation_method": {
				"type": "string",
				"tooltip": "<p>Defines the method for transformation. By default, the transformation method is\nset to \u2018yeo-johnson\u2019. The other available option for transformation is \u2018quantile\u2019.\nIgnored when <code class=\"docutils literal notranslate\"><span class=\"pre\">transformation</span></code> is not True.</p>\n",
				"default_val": "yeo-johnson"
			},
			"handle_unknown_categorical": {
				"type": "bool",
				"tooltip": "<p>When set to True, unknown categorical levels in unseen data are replaced by the\nmost or least frequent level as learned in the training dataset.</p>\n",
				"default_val": "True"
			},
			"unknown_categorical_method": {
				"type": "string",
				"tooltip": "<p>Method used to replace unknown categorical levels in unseen data. Method can be\nset to \u2018least_frequent\u2019 or \u2018most_frequent\u2019.</p>\n",
				"default_val": "least_frequent"
			},
			"pca": {
				"type": "bool",
				"tooltip": "<p>When set to True, dimensionality reduction is applied to project the data into\na lower dimensional space using the method defined in <code class=\"docutils literal notranslate\"><span class=\"pre\">pca_method</span></code> parameter.</p>\n",
				"default_val": "False"
			},
			"pca_method": {
				"type": "string",
				"tooltip": "<p>The \u2018linear\u2019 method performs uses Singular Value  Decomposition. Other options are:</p>\n<ul class=\"simple\">\n<li><p>kernel: dimensionality reduction through the use of RVF kernel.</p></li>\n<li><p>incremental: replacement for \u2018linear\u2019 pca when the dataset is too large.</p></li>\n</ul>\n",
				"default_val": "linear"
			},
			"pca_components": {
				"type": "float",
				"tooltip": "<p>Number of components to keep. if pca_components is a float, it is treated as a\ntarget percentage for information retention. When pca_components is an integer\nit is treated as the number of features to be kept. pca_components must be less\nthan the original number of features. Ignored when <code class=\"docutils literal notranslate\"><span class=\"pre\">pca</span></code> is not True.</p>\n",
				"default_val": "None"
			},
			"ignore_low_variance": {
				"type": "bool",
				"tooltip": "<p>When set to True, all categorical features with insignificant variances are\nremoved from the data. The variance is calculated using the ratio of unique\nvalues to the number of samples, and the ratio of the most common value to the\nfrequency of the second most common value.</p>\n",
				"default_val": "False"
			},
			"combine_rare_levels": {
				"type": "bool",
				"tooltip": "<p>When set to True, frequency percentile for levels in categorical features below\na certain threshold is combined into a single level.</p>\n",
				"default_val": "False"
			},
			"rare_level_threshold": {
				"type": "float",
				"tooltip": "<p>Percentile distribution below which rare categories are combined. Ignored when\n<code class=\"docutils literal notranslate\"><span class=\"pre\">combine_rare_levels</span></code> is not True.</p>\n",
				"default_val": "0.1"
			},
			"remove_outliers": {
				"type": "bool",
				"tooltip": "<p>When set to True, outliers from the training data are removed using the Singular\nValue Decomposition.</p>\n",
				"default_val": "False"
			},
			"outliers_threshold": {
				"type": "float",
				"tooltip": "<p>The percentage outliers to be removed from the training dataset. Ignored when\n<code class=\"docutils literal notranslate\"><span class=\"pre\">remove_outliers</span></code> is not True.</p>\n",
				"default_val": "0.05"
			},
			"remove_multicollinearity": {
				"type": "bool",
				"tooltip": "<p>When set to True, features with the inter-correlations higher than the defined\nthreshold are removed. When two features are highly correlated with each other,\nthe feature that is less correlated with the target variable is removed. Only\nconsiders numeric features.</p>\n",
				"default_val": "False"
			},
			"multicollinearity_threshold": {
				"type": "float",
				"tooltip": "<p>Threshold for correlated features. Ignored when <code class=\"docutils literal notranslate\"><span class=\"pre\">remove_multicollinearity</span></code>\nis not True.</p>\n",
				"default_val": "0.9"
			},
			"remove_perfect_collinearity": {
				"type": "bool",
				"tooltip": "<p>When set to True, perfect collinearity (features with correlation = 1) is removed\nfrom the dataset, when two features are 100% correlated, one of it is randomly\nremoved from the dataset.</p>\n",
				"default_val": "True"
			},
			"create_clusters": {
				"type": "bool",
				"tooltip": "<p>When set to True, an additional feature is created in training dataset where each\ninstance is assigned to a cluster. The number of clusters is determined by\noptimizing Calinski-Harabasz and Silhouette criterion.</p>\n",
				"default_val": "False"
			},
			"cluster_iter": {
				"type": "int",
				"tooltip": "<p>Number of iterations for creating cluster. Each iteration represents cluster\nsize. Ignored when <code class=\"docutils literal notranslate\"><span class=\"pre\">create_clusters</span></code> is not True.</p>\n",
				"default_val": "20"
			},
			"polynomial_features": {
				"type": "bool",
				"tooltip": "<p>When set to True, new features are derived using existing numeric features.</p>\n",
				"default_val": "False"
			},
			"polynomial_degree": {
				"type": "int",
				"tooltip": "<p>Degree of polynomial features. For example, if an input sample is two dimensional\nand of the form [a, b], the polynomial features with degree = 2 are:\n[1, a, b, a^2, ab, b^2]. Ignored when <code class=\"docutils literal notranslate\"><span class=\"pre\">polynomial_features</span></code> is not True.</p>\n",
				"default_val": "2"
			},
			"trigonometry_features": {
				"type": "bool",
				"tooltip": "<p>When set to True, new features are derived using existing numeric features.</p>\n",
				"default_val": "False"
			},
			"polynomial_threshold": {
				"type": "float",
				"tooltip": "<p>When <code class=\"docutils literal notranslate\"><span class=\"pre\">polynomial_features</span></code> or <code class=\"docutils literal notranslate\"><span class=\"pre\">trigonometry_features</span></code> is True, new features\nare derived from the existing numeric features. This may sometimes result in too\nlarge feature space. polynomial_threshold parameter can be used to deal with this\nproblem. It does so by using combination of Random Forest, AdaBoost and Linear\ncorrelation. All derived features that falls within the percentile distribution\nare kept and rest of the features are removed.</p>\n",
				"default_val": "0.1"
			},
			"feature_selection": {
				"type": "bool",
				"tooltip": "<p>When set to True, a subset of features are selected using a combination of\nvarious permutation importance techniques including Random Forest, Adaboost\nand Linear correlation with target variable. The size of the subset is\ndependent on the <code class=\"docutils literal notranslate\"><span class=\"pre\">feature_selection_threshold</span></code> parameter.</p>\n",
				"default_val": "False"
			},
			"feature_selection_threshold": {
				"type": "float",
				"tooltip": "<p>Threshold value used for feature selection. When <code class=\"docutils literal notranslate\"><span class=\"pre\">polynomial_features</span></code> or\n<code class=\"docutils literal notranslate\"><span class=\"pre\">feature_interaction</span></code> is True, it is recommended to keep the threshold low\nto avoid large feature spaces. Setting a very low value may be efficient but\ncould result in under-fitting.</p>\n",
				"default_val": "0.8"
			},
			"feature_selection_method": {
				"type": "string",
				"tooltip": "<p>Algorithm for feature selection. \u2018classic\u2019 method uses permutation feature\nimportance techniques. Other possible value is \u2018boruta\u2019 which uses boruta\nalgorithm for feature selection.</p>\n",
				"default_val": "classic"
			},
			"feature_interaction": {
				"type": "bool",
				"tooltip": "<p>When set to True, new features are created by interacting (a * b) all the\nnumeric variables in the dataset. This feature is not scalable and may not\nwork as expected on datasets with large feature space.</p>\n",
				"default_val": "False"
			},
			"feature_ratio": {
				"type": "bool",
				"tooltip": "<p>When set to True, new features are created by calculating the ratios (a / b)\nbetween all numeric variables in the dataset. This feature is not scalable and\nmay not work as expected on datasets with large feature space.</p>\n",
				"default_val": "False"
			},
			"interaction_threshold": {
				"type": "bool",
				"tooltip": "<p>Similar to polynomial_threshold, It is used to compress a sparse matrix of newly\ncreated features through interaction. Features whose importance based on the\ncombination  of  Random Forest, AdaBoost and Linear correlation falls within the\npercentile of the  defined threshold are kept in the dataset. Remaining features\nare dropped before further processing.</p>\n",
				"default_val": "0.01"
			},
			"fix_imbalance": {
				"type": "bool",
				"tooltip": "<p>When training dataset has unequal distribution of target class it can be balanced\nusing this parameter. When set to True, SMOTE (Synthetic Minority Over-sampling\nTechnique) is applied by default to create synthetic datapoints for minority class.</p>\n",
				"default_val": "False"
			},
			"fix_imbalance_method": {
				"type": "obj",
				"tooltip": "<p>When <code class=\"docutils literal notranslate\"><span class=\"pre\">fix_imbalance</span></code> is True, \u2018imblearn\u2019 compatible object with \u2018fit_resample\u2019\nmethod can be passed. When set to None, \u2018imblearn.over_sampling.SMOTE\u2019 is used.</p>\n",
				"default_val": "None"
			}
		}
	},
	"dataset": {
		"options": {
			"target": {
				"type": "string",
				"tooltip": "<p>Name of the target column to be passed in as a string. The target variable can\nbe either binary or multiclass.</p>\n"
			},
			"test_data": {
				"type": "pandas.DataFrame",
				"tooltip": "<p>If not None, test_data is used as a hold-out set and <code class=\"docutils literal notranslate\"><span class=\"pre\">train_size</span></code> parameter is\nignored. test_data must be labelled and the shape of data and test_data must\nmatch.</p>\n",
				"default_val": "None"
			},
			"preprocess": {
				"type": "bool",
				"tooltip": "<p>When set to False, no transformations are applied except for train_test_split\nand custom transformations passed in <code class=\"docutils literal notranslate\"><span class=\"pre\">custom_pipeline</span></code> param. Data must be\nready for modeling (no missing values, no dates, categorical data encoding),\nwhen preprocess is set to False.</p>\n",
				"default_val": "True"
			},
			"categorical_features": {
				"type": "custom_list",
				"tooltip": "<p>If the inferred data types are not correct or the silent param is set to True,\ncategorical_features param can be used to overwrite or define the data types.\nIt takes a list of strings with column names that are categorical.</p>\n",
				"default_val": "None"
			},
			"ordinal_features": {
				"type": "dict",
				"tooltip": "<p>Encode categorical features as ordinal. For example, a categorical feature with\n\u2018low\u2019, \u2018medium\u2019, \u2018high\u2019 values where low &lt; medium &lt; high can be passed as\nordinal_features = { \u2018column_name\u2019 : [\u2018low\u2019, \u2018medium\u2019, \u2018high\u2019] }.</p>\n",
				"default_val": "None"
			},
			"high_cardinality_features": {
				"type": "custom_list",
				"tooltip": "<p>When categorical features contains many levels, it can be compressed into fewer\nlevels using this parameter. It takes a list of strings with column names that\nare categorical.</p>\n",
				"default_val": "None"
			},
			"high_cardinality_method": {
				"type": "string",
				"tooltip": "<p>Categorical features with high cardinality are replaced with the frequency of\nvalues in each level occurring in the training dataset. Other available method\nis \u2018clustering\u2019 which trains the K-Means clustering algorithm on the statistical\nattribute of the training data and replaces the original value of feature with the\ncluster label. The number of clusters is determined by optimizing Calinski-Harabasz\nand Silhouette criterion.</p>\n",
				"default_val": "frequency"
			},
			"numeric_features": {
				"type": "custom_list",
				"tooltip": "<p>If the inferred data types are not correct or the silent param is set to True,\nnumeric_features param can be used to overwrite or define the data types.\nIt takes a list of strings with column names that are numeric.</p>\n",
				"default_val": "None"
			},
			"date_features": {
				"type": "custom_list",
				"tooltip": "<p>If the inferred data types are not correct or the silent param is set to True,\ndate_features param can be used to overwrite or define the data types. It takes\na list of strings with column names that are DateTime.</p>\n",
				"default_val": "None"
			},
			"ignore_features": {
				"type": "custom_list",
				"tooltip": "<p>ignore_features param can be used to ignore features during model training.\nIt takes a list of strings with column names that are to be ignored.</p>\n",
				"default_val": "None"
			},
			"bin_numeric_features": {
				"type": "custom_list",
				"tooltip": "<p>To convert numeric features into categorical, bin_numeric_features parameter can\nbe used. It takes a list of strings with column names to be discretized. It does\nso by using \u2018sturges\u2019 rule to determine the number of clusters and then apply\nKMeans algorithm. Original values of the feature are then replaced by the\ncluster label.</p>\n",
				"default_val": "None"
			},
			"group_features": {
				"type": "custom_list",
				"tooltip": "<p>When the dataset contains features with related characteristics, group_features\nparameter can be used for feature extraction. It takes a list of strings with\ncolumn names that are related.</p>\n",
				"default_val": "None"
			},
			"group_names": {
				"type": "custom_list",
				"tooltip": "<p>Group names to be used in naming new features. When the length of group_names\ndoes not match with the length of <code class=\"docutils literal notranslate\"><span class=\"pre\">group_features</span></code>, new features are named\nsequentially group_1, group_2, etc. It is ignored when <code class=\"docutils literal notranslate\"><span class=\"pre\">group_features</span></code> is\nNone.</p>\n",
				"default_val": "None"
			},
			"fold_strategy": {
				"type": "string",
				"tooltip": "<p>Choice of cross validation strategy. Possible values are:</p>\n<ul class=\"simple\">\n<li><p>\u2018kfold\u2019</p></li>\n<li><p>\u2018stratifiedkfold\u2019</p></li>\n<li><p>\u2018groupkfold\u2019</p></li>\n<li><p>\u2018timeseries\u2019</p></li>\n<li><p>a custom CV generator object compatible with scikit-learn.</p></li>\n</ul>\n",
				"default_val": "stratifiedkfold"
			},
			"fold": {
				"type": "int",
				"tooltip": "<p>Number of folds to be used in cross validation. Must be at least 2. This is\na global setting that can be over-written at function level by using <code class=\"docutils literal notranslate\"><span class=\"pre\">fold</span></code>\nparameter. Ignored when <code class=\"docutils literal notranslate\"><span class=\"pre\">fold_strategy</span></code> is a custom object.</p>\n",
				"default_val": "10"
			},
			"fold_shuffle": {
				"type": "bool",
				"tooltip": "<p>Controls the shuffle parameter of CV. Only applicable when <code class=\"docutils literal notranslate\"><span class=\"pre\">fold_strategy</span></code>\nis \u2018kfold\u2019 or \u2018stratifiedkfold\u2019. Ignored when <code class=\"docutils literal notranslate\"><span class=\"pre\">fold_strategy</span></code> is a custom\nobject.</p>\n",
				"default_val": "False"
			},
			"fold_groups": {
				"type": "str or array-like",
				"tooltip": "<p>Optional group labels when \u2018GroupKFold\u2019 is used for the cross validation.\nIt takes an array with shape (n_samples, ) where n_samples is the number\nof rows in the training dataset. When string is passed, it is interpreted\nas the column name in the dataset containing group labels.</p>\n",
				"default_val": "None"
			},
			"n_jobs": {
				"type": "int",
				"tooltip": "<p>The number of jobs to run in parallel (for functions that supports parallel\nprocessing) -1 means using all processors. To run all functions on single\nprocessor set n_jobs to None.</p>\n",
				"default_val": "-1"
			},
			"use_gpu": {
				"type": "list",
				"tooltip": "<p>When set to True, it will use GPU for training with algorithms that support it,\nand fall back to CPU if they are unavailable. When set to \u2018force\u2019, it will only\nuse GPU-enabled algorithms and raise exceptions when they are unavailable. When\nFalse, all algorithms are trained using CPU only.</p>\n<p>GPU enabled algorithms:</p>\n<ul class=\"simple\">\n<li><p>Extreme Gradient Boosting, requires no further installation</p></li>\n<li><p>CatBoost Classifier, requires no further installation\n(GPU is only enabled when data &gt; 50,000 rows)</p></li>\n<li><p>Light Gradient Boosting Machine, requires GPU installation\n<a class=\"reference external\" href=\"https://lightgbm.readthedocs.io/en/latest/GPU-Tutorial.html\">https://lightgbm.readthedocs.io/en/latest/GPU-Tutorial.html</a></p></li>\n<li><p>Logistic Regression, Ridge Classifier, Random Forest, K Neighbors Classifier,\nSupport Vector Machine, requires cuML &gt;= 0.15\n<a class=\"reference external\" href=\"https://github.com/rapidsai/cuml\">https://github.com/rapidsai/cuml</a></p></li>\n</ul>\n",
				"default_val": "False",
				"choices": {
					"False": "tooltip False",
					"True": "tooltip True",
					"force": "tooltip force"
				}
			},
			"custom_pipeline": {
				"type": "(str",
				"tooltip": "<p>When passed, will append the custom transformers in the preprocessing pipeline\nand are applied on each CV fold separately and on the final fit. All the custom\ntransformations are applied after \u2018train_test_split\u2019 and before pycaret\u2019s internal\ntransformations.</p>\n",
				"default_val": "None"
			},
			"html": {
				"type": "bool",
				"tooltip": "<p>When set to False, prevents runtime display of monitor. This must be set to False\nwhen the environment does not support IPython. For example, command line terminal,\nDatabricks Notebook, Spyder and other similar IDEs.</p>\n",
				"default_val": "True"
			},
			"session_id": {
				"type": "int",
				"tooltip": "<p>Controls the randomness of experiment. It is equivalent to \u2018random_state\u2019 in\nscikit-learn. When None, a pseudo random number is generated. This can be used\nfor later reproducibility of the entire experiment.</p>\n",
				"default_val": "None"
			},
			"log_experiment": {
				"type": "bool or str or BaseLogger or list of str or BaseLogger",
				"tooltip": "<p>A (list of) PyCaret <code class=\"docutils literal notranslate\"><span class=\"pre\">BaseLogger</span></code> or str (one of \u2018mlflow\u2019, \u2018wandb\u2019)\ncorresponding to a logger to determine which experiment loggers to use.\nSetting to True will use just MLFlow.</p>\n",
				"default_val": "False"
			},
			"experiment_name": {
				"type": "string",
				"tooltip": "<p>Name of the experiment for logging. Ignored when <code class=\"docutils literal notranslate\"><span class=\"pre\">log_experiment</span></code> is False.</p>\n",
				"default_val": "None"
			},
			"experiment_custom_tags": {
				"type": "dict",
				"tooltip": "<p>Dictionary of tag_name: String -&gt; value: (String, but will be string-ified\nif not) passed to the mlflow.set_tags to add new custom tags for the experiment.</p>\n",
				"default_val": "None"
			},
			"log_plots": {
				"type": "bool",
				"tooltip": "<p>When set to True, certain plots are logged automatically in the <code class=\"docutils literal notranslate\"><span class=\"pre\">MLFlow</span></code> server.\nTo change the type of plots to be logged, pass a list containing plot IDs. Refer\nto documentation of <code class=\"docutils literal notranslate\"><span class=\"pre\">plot_model</span></code>. Ignored when <code class=\"docutils literal notranslate\"><span class=\"pre\">log_experiment</span></code> is False.</p>\n",
				"default_val": "False"
			},
			"log_profile": {
				"type": "bool",
				"tooltip": "<p>When set to True, data profile is logged on the <code class=\"docutils literal notranslate\"><span class=\"pre\">MLflow</span></code> server as a html file.\nIgnored when <code class=\"docutils literal notranslate\"><span class=\"pre\">log_experiment</span></code> is False.</p>\n",
				"default_val": "False"
			},
			"log_data": {
				"type": "bool",
				"tooltip": "<p>When set to True, dataset is logged on the <code class=\"docutils literal notranslate\"><span class=\"pre\">MLflow</span></code> server as a csv file.\nIgnored when <code class=\"docutils literal notranslate\"><span class=\"pre\">log_experiment</span></code> is False.</p>\n",
				"default_val": "False"
			},
			"silent": {
				"type": "bool",
				"tooltip": "<p>Controls the confirmation input of data types when <code class=\"docutils literal notranslate\"><span class=\"pre\">setup</span></code> is executed. When\nexecuting in completely automated mode or on a remote kernel, this must be True.</p>\n",
				"default_val": "False"
			},
			"verbose": {
				"type": "bool",
				"tooltip": "<p>When set to False, Information grid is not printed.</p>\n",
				"default_val": "True"
			},
			"profile": {
				"type": "bool",
				"tooltip": "<p>When set to True, an interactive EDA report is displayed.</p>\n",
				"default_val": "False"
			},
			"profile_kwargs": {
				"type": "dict",
				"tooltip": "<p>Dictionary of arguments passed to the ProfileReport method used\nto create the EDA report. Ignored if <code class=\"docutils literal notranslate\"><span class=\"pre\">profile</span></code> is False.</p>\n",
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
				"tooltip": "<p>To train and evaluate select models, list containing model ID or scikit-learn\ncompatible object can be passed in include param. To see a list of all models\navailable in the model library use the <code class=\"docutils literal notranslate\"><span class=\"pre\">models</span></code> function.</p>\n",
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
				"tooltip": "<p>To omit certain models from training and evaluation, pass a list containing\nmodel id in the exclude parameter. To see a list of all models available\nin the model library use the <code class=\"docutils literal notranslate\"><span class=\"pre\">models</span></code> function.</p>\n",
				"default_val": "None"
			},
			"fold": {
				"type": "int",
				"tooltip": "<p>Controls cross-validation. If None, the CV generator in the <code class=\"docutils literal notranslate\"><span class=\"pre\">fold_strategy</span></code>\nparameter of the <code class=\"docutils literal notranslate\"><span class=\"pre\">setup</span></code> function is used. When an integer is passed,\nit is interpreted as the \u2018n_splits\u2019 parameter of the CV generator in the\n<code class=\"docutils literal notranslate\"><span class=\"pre\">setup</span></code> function.</p>\n",
				"default_val": "None"
			},
			"round": {
				"type": "int",
				"tooltip": "<p>Number of decimal places the metrics in the score grid will be rounded to.</p>\n",
				"default_val": "4"
			},
			"cross_validation": {
				"type": "bool",
				"tooltip": "<p>When set to False, metrics are evaluated on holdout set. <code class=\"docutils literal notranslate\"><span class=\"pre\">fold</span></code> param\nis ignored when cross_validation is set to False.</p>\n",
				"default_val": "True"
			},
			"sort": {
				"type": "string",
				"tooltip": "<p>The sort order of the score grid. It also accepts custom metrics that are\nadded through the <code class=\"docutils literal notranslate\"><span class=\"pre\">add_metric</span></code> function.</p>\n",
				"default_val": "Accuracy"
			},
			"n_select": {
				"type": "int",
				"tooltip": "<p>Number of top_n models to return. For example, to select top 3 models use\nn_select = 3.</p>\n",
				"default_val": "1"
			},
			"budget_time": {
				"type": "float",
				"tooltip": "<p>If not None, will terminate execution of the function after budget_time\nminutes have passed and return results up to that point.</p>\n",
				"default_val": "None"
			},
			"turbo": {
				"type": "bool",
				"tooltip": "<p>When set to True, it excludes estimators with longer training times. To\nsee which algorithms are excluded use the <code class=\"docutils literal notranslate\"><span class=\"pre\">models</span></code> function.</p>\n",
				"default_val": "True"
			},
			"errors": {
				"type": "string",
				"tooltip": "<p>When set to \u2018ignore\u2019, will skip the model with exceptions and continue.\nIf \u2018raise\u2019, will break the function when exceptions are raised.</p>\n",
				"default_val": "ignore"
			},
			"fit_kwargs": {
				"type": "dict",
				"tooltip": "<p>Dictionary of arguments passed to the fit method of the model.</p>\n",
				"default_val": "{} (empty dict)"
			},
			"groups": {
				"type": "str or array-like",
				"tooltip": "<p>Optional group labels when \u2018GroupKFold\u2019 is used for the cross validation.\nIt takes an array with shape (n_samples, ) where n_samples is the number\nof rows in the training dataset. When string is passed, it is interpreted\nas the column name in the dataset containing group labels.</p>\n",
				"default_val": "None"
			},
			"experiment_custom_tags": {
				"type": "dict",
				"tooltip": "<p>Dictionary of tag_name: String -&gt; value: (String, but will be string-ified\nif not) passed to the mlflow.set_tags to add new custom tags for the experiment.</p>\n",
				"default_val": "None"
			},
			"probability_threshold": {
				"type": "float",
				"tooltip": "<p>Threshold for converting predicted probability to class label.\nIt defaults to 0.5 for all classifiers unless explicitly defined\nin this parameter. Only applicable for binary classification.</p>\n",
				"default_val": "None"
			},
			"verbose": {
				"type": "bool",
				"tooltip": "<p>Score grid is not printed when verbose is set to False.</p>\n",
				"default_val": "True"
			},
			"display": {
				"type": "pycaret.internal.Display.Display",
				"tooltip": "<p>Custom display object</p>\n",
				"default_val": "None"
			},
			"parallel": {
				"type": "pycaret.parallel.parallel_backend.ParallelBackend",
				"tooltip": "<p>A ParallelBackend instance. For example if you have a SparkSession <code class=\"docutils literal notranslate\"><span class=\"pre\">session</span></code>,\nyou can use <code class=\"docutils literal notranslate\"><span class=\"pre\">FugueBackend(session)</span></code> to make this function running using\nSpark. For more details, see\n<code class=\"xref py py-class docutils literal notranslate\"><span class=\"pre\">FugueBackend</span></code></p>\n",
				"default_val": "None"
			}
		}
	},
	"create_model": {
		"options": {
			"estimator": {
				"type": "list",
				"tooltip": "<p>ID of an estimator available in model library or pass an untrained\nmodel object consistent with scikit-learn API. Estimators available\nin the model library (ID - Name):</p>\n<ul class=\"simple\">\n<li><p>\u2018lr\u2019 - Logistic Regression</p></li>\n<li><p>\u2018knn\u2019 - K Neighbors Classifier</p></li>\n<li><p>\u2018nb\u2019 - Naive Bayes</p></li>\n<li><p>\u2018dt\u2019 - Decision Tree Classifier</p></li>\n<li><p>\u2018svm\u2019 - SVM - Linear Kernel</p></li>\n<li><p>\u2018rbfsvm\u2019 - SVM - Radial Kernel</p></li>\n<li><p>\u2018gpc\u2019 - Gaussian Process Classifier</p></li>\n<li><p>\u2018mlp\u2019 - MLP Classifier</p></li>\n<li><p>\u2018ridge\u2019 - Ridge Classifier</p></li>\n<li><p>\u2018rf\u2019 - Random Forest Classifier</p></li>\n<li><p>\u2018qda\u2019 - Quadratic Discriminant Analysis</p></li>\n<li><p>\u2018ada\u2019 - Ada Boost Classifier</p></li>\n<li><p>\u2018gbc\u2019 - Gradient Boosting Classifier</p></li>\n<li><p>\u2018lda\u2019 - Linear Discriminant Analysis</p></li>\n<li><p>\u2018et\u2019 - Extra Trees Classifier</p></li>\n<li><p>\u2018xgboost\u2019 - Extreme Gradient Boosting</p></li>\n<li><p>\u2018lightgbm\u2019 - Light Gradient Boosting Machine</p></li>\n<li><p>\u2018catboost\u2019 - CatBoost Classifier</p></li>\n</ul>\n",
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
				"tooltip": "<p>Controls cross-validation. If None, the CV generator in the <code class=\"docutils literal notranslate\"><span class=\"pre\">fold_strategy</span></code>\nparameter of the <code class=\"docutils literal notranslate\"><span class=\"pre\">setup</span></code> function is used. When an integer is passed,\nit is interpreted as the \u2018n_splits\u2019 parameter of the CV generator in the\n<code class=\"docutils literal notranslate\"><span class=\"pre\">setup</span></code> function.</p>\n",
				"default_val": "None"
			},
			"round": {
				"type": "int",
				"tooltip": "<p>Number of decimal places the metrics in the score grid will be rounded to.</p>\n",
				"default_val": "4"
			},
			"cross_validation": {
				"type": "bool",
				"tooltip": "<p>When set to False, metrics are evaluated on holdout set. <code class=\"docutils literal notranslate\"><span class=\"pre\">fold</span></code> param\nis ignored when cross_validation is set to False.</p>\n",
				"default_val": "True"
			},
			"fit_kwargs": {
				"type": "dict",
				"tooltip": "<p>Dictionary of arguments passed to the fit method of the model.</p>\n",
				"default_val": "{} (empty dict)"
			},
			"groups": {
				"type": "str or array-like",
				"tooltip": "<p>Optional group labels when GroupKFold is used for the cross validation.\nIt takes an array with shape (n_samples, ) where n_samples is the number\nof rows in training dataset. When string is passed, it is interpreted as\nthe column name in the dataset containing group labels.</p>\n",
				"default_val": "None"
			},
			"probability_threshold": {
				"type": "float",
				"tooltip": "<p>Threshold for converting predicted probability to class label.\nIt defaults to 0.5 for all classifiers unless explicitly defined\nin this parameter. Only applicable for binary classification.</p>\n",
				"default_val": "None"
			},
			"verbose": {
				"type": "bool",
				"tooltip": "<p>Score grid is not printed when verbose is set to False.</p>\n",
				"default_val": "True"
			},
			"return_train_score": {
				"type": "bool",
				"tooltip": "<p>If False, returns the CV Validation scores only.\nIf True, returns the CV training scores along with the CV validation scores.\nThis is useful when the user wants to do bias-variance tradeoff. A high CV\ntraining score with a low corresponding CV validation score indicates overfitting.</p>\n",
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
					"tooltip": "<p>Trained model object</p>\n",
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
					"tooltip": "<p>List of available plots (ID - Name):</p>\n<ul class=\"simple\">\n<li><p>\u2018auc\u2019 - Area Under the Curve</p></li>\n<li><p>\u2018threshold\u2019 - Discrimination Threshold</p></li>\n<li><p>\u2018pr\u2019 - Precision Recall Curve</p></li>\n<li><p>\u2018confusion_matrix\u2019 - Confusion Matrix</p></li>\n<li><p>\u2018error\u2019 - Class Prediction Error</p></li>\n<li><p>\u2018class_report\u2019 - Classification Report</p></li>\n<li><p>\u2018boundary\u2019 - Decision Boundary</p></li>\n<li><p>\u2018rfe\u2019 - Recursive Feature Selection</p></li>\n<li><p>\u2018learning\u2019 - Learning Curve</p></li>\n<li><p>\u2018manifold\u2019 - Manifold Learning</p></li>\n<li><p>\u2018calibration\u2019 - Calibration Curve</p></li>\n<li><p>\u2018vc\u2019 - Validation Curve</p></li>\n<li><p>\u2018dimension\u2019 - Dimension Learning</p></li>\n<li><p>\u2018feature\u2019 - Feature Importance</p></li>\n<li><p>\u2018feature_all\u2019 - Feature Importance (All)</p></li>\n<li><p>\u2018parameter\u2019 - Model Hyperparameter</p></li>\n<li><p>\u2018lift\u2019 - Lift Curve</p></li>\n<li><p>\u2018gain\u2019 - Gain Chart</p></li>\n<li><p>\u2018tree\u2019 - Decision Tree</p></li>\n<li><p>\u2018ks\u2019 - KS Statistic Plot</p></li>\n</ul>\n",
					"default_val": "auc"
				},
				"scale": {
					"type": "float",
					"tooltip": "<p>The resolution scale of the figure.</p>\n",
					"default_val": "1"
				},
				"save": {
					"type": "bool",
					"tooltip": "<p>When set to True, plot is saved in the current working directory.</p>\n",
					"default_val": "False"
				},
				"fold": {
					"type": "int",
					"tooltip": "<p>Controls cross-validation. If None, the CV generator in the <code class=\"docutils literal notranslate\"><span class=\"pre\">fold_strategy</span></code>\nparameter of the <code class=\"docutils literal notranslate\"><span class=\"pre\">setup</span></code> function is used. When an integer is passed,\nit is interpreted as the \u2018n_splits\u2019 parameter of the CV generator in the\n<code class=\"docutils literal notranslate\"><span class=\"pre\">setup</span></code> function.</p>\n",
					"default_val": "None"
				},
				"fit_kwargs": {
					"type": "dict",
					"tooltip": "<p>Dictionary of arguments passed to the fit method of the model.</p>\n",
					"default_val": "{} (empty dict)"
				},
				"plot_kwargs": {
					"type": "dict",
					"tooltip": "<p>Dictionary of arguments passed to the visualizer class.</p>\n",
					"default_val": "{} (empty dict)"
				},
				"groups": {
					"type": "str or array-like",
					"tooltip": "<p>Optional group labels when GroupKFold is used for the cross validation.\nIt takes an array with shape (n_samples, ) where n_samples is the number\nof rows in training dataset. When string is passed, it is interpreted as\nthe column name in the dataset containing group labels.</p>\n",
					"default_val": "None"
				},
				"use_train_data": {
					"type": "bool",
					"tooltip": "<p>When set to true, train data will be used for plots, instead\nof test data.</p>\n",
					"default_val": "False"
				},
				"verbose": {
					"type": "bool",
					"tooltip": "<p>When set to False, progress bar is not displayed.</p>\n",
					"default_val": "True"
				},
				"display_format": {
					"type": "string",
					"tooltip": "<p>To display plots in Streamlit (<a class=\"reference external\" href=\"https://www.streamlit.io/\">https://www.streamlit.io/</a>), set this to \u2018streamlit\u2019.\nCurrently, not all plots are supported.</p>\n",
					"default_val": "None"
				}
			}
		},
		"evaluate_model": {
			"options": {
				"estimator": {
					"type": "list",
					"tooltip": "<p>Trained model object</p>\n",
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
					"tooltip": "<p>Controls cross-validation. If None, the CV generator in the <code class=\"docutils literal notranslate\"><span class=\"pre\">fold_strategy</span></code>\nparameter of the <code class=\"docutils literal notranslate\"><span class=\"pre\">setup</span></code> function is used. When an integer is passed,\nit is interpreted as the \u2018n_splits\u2019 parameter of the CV generator in the\n<code class=\"docutils literal notranslate\"><span class=\"pre\">setup</span></code> function.</p>\n",
					"default_val": "None"
				},
				"fit_kwargs": {
					"type": "dict",
					"tooltip": "<p>Dictionary of arguments passed to the fit method of the model.</p>\n",
					"default_val": "{} (empty dict)"
				},
				"plot_kwargs": {
					"type": "dict",
					"tooltip": "<p>Dictionary of arguments passed to the visualizer class.</p>\n",
					"default_val": "{} (empty dict)"
				},
				"groups": {
					"type": "str or array-like",
					"tooltip": "<p>Optional group labels when GroupKFold is used for the cross validation.\nIt takes an array with shape (n_samples, ) where n_samples is the number\nof rows in training dataset. When string is passed, it is interpreted as\nthe column name in the dataset containing group labels.</p>\n",
					"default_val": "None"
				},
				"use_train_data": {
					"type": "bool",
					"tooltip": "<p>When set to true, train data will be used for plots, instead\nof test data.</p>\n",
					"default_val": "False"
				}
			}
		},
		"interpret_model": {
			"options": {
				"estimator": {
					"type": "list",
					"tooltip": "<p>Trained model object</p>\n",
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
					"tooltip": "<p>This parameter is only needed when plot = \u2018correlation\u2019 or \u2018pdp\u2019.\nBy default feature is set to None which means the first column of the\ndataset will be used as a variable. A feature parameter must be passed\nto change this.</p>\n",
					"default_val": "None"
				},
				"observation": {
					"type": "int",
					"tooltip": "<p>This parameter only comes into effect when plot is set to \u2018reason\u2019. If no\nobservation number is provided, it will return an analysis of all observations\nwith the option to select the feature on x and y axes through drop down\ninteractivity. For analysis at the sample level, an observation parameter must\nbe passed with the index value of the observation in test / hold-out set.</p>\n",
					"default_val": "None"
				},
				"use_train_data": {
					"type": "bool",
					"tooltip": "<p>When set to true, train data will be used for plots, instead\nof test data.</p>\n",
					"default_val": "False"
				},
				"X_new_sample": {
					"type": "pd.DataFrame",
					"tooltip": "<p>Row from an out-of-sample dataframe (neither train nor test data) to be plotted.\nThe sample must have the same columns as the raw input data, and it is transformed\nby the preprocessing pipeline automatically before plotting.</p>\n",
					"default_val": "None"
				},
				"y_new_sample": {
					"type": "pd.DataFrame",
					"tooltip": "<p>Row from an out-of-sample dataframe (neither train nor test data) to be plotted.\nThe sample must have the same columns as the raw input label data, and it is transformed\nby the preprocessing pipeline automatically before plotting.</p>\n",
					"default_val": "None"
				},
				"save": {
					"type": "bool",
					"tooltip": "<p>When set to True, Plot is saved as a \u2018png\u2019 file in current working directory.</p>\n",
					"default_val": "False"
				}
			}
		},
		"dashboard": {
			"options": {
				"estimator": {
					"type": "list",
					"tooltip": "<p>Trained model object</p>\n",
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
					"tooltip": "<p>Render mode for the dashboard. The default is set to <code class=\"docutils literal notranslate\"><span class=\"pre\">dash</span></code> which will\nrender a dashboard in browser. There are four possible options:</p>\n<ul class=\"simple\">\n<li><p>\u2018dash\u2019 - displays the dashboard in browser</p></li>\n<li><p>\u2018inline\u2019 - displays the dashboard in the jupyter notebook cell.</p></li>\n<li><p>\u2018jupyterlab\u2019 - displays the dashboard in jupyterlab pane.</p></li>\n<li><p>\u2018external\u2019 - displays the dashboard in a separate tab. (use in Colab)</p></li>\n</ul>\n",
					"default_val": "dash"
				},
				"dashboard_kwargs": {
					"type": "dict",
					"tooltip": "<p>Dictionary of arguments passed to the <code class=\"docutils literal notranslate\"><span class=\"pre\">ExplainerDashboard</span></code> class.</p>\n",
					"default_val": "{} (empty dict)"
				},
				"run_kwargs": {
					"type": "dict",
					"tooltip": "<p>Dictionary of arguments passed to the <code class=\"docutils literal notranslate\"><span class=\"pre\">run</span></code> method of <code class=\"docutils literal notranslate\"><span class=\"pre\">ExplainerDashboard</span></code>.</p>\n",
					"default_val": "{} (empty dict)"
				}
			}
		},
		"eda": {
			"options": {
				"data": {
					"type": "pandas.DataFrame",
					"tooltip": "<p>DataFrame with (n_samples, n_features).</p>\n"
				},
				"target": {
					"type": "string",
					"tooltip": "<p>Name of the target column to be passed in as a string.</p>\n"
				},
				"display_format": {
					"type": "string",
					"tooltip": "<p>When set to \u2018bokeh\u2019 the plots are interactive. Other option is <code class=\"docutils literal notranslate\"><span class=\"pre\">svg</span></code> for static\nplots that are generated using matplotlib and seaborn.</p>\n",
					"default_val": "bokeh"
				}
			}
		},
		"check_fairness": {
			"options": {
				"estimator": {
					"type": "list",
					"tooltip": "<p>Trained model object</p>\n",
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
					"tooltip": "<p>List of column names as present in the original dataset before any\ntransformations.</p>\n"
				},
				"plot_kwargs": {
					"type": "dict",
					"tooltip": "<p>Dictionary of arguments passed to the matplotlib plot.</p>\n",
					"default_val": "{} (empty dict)"
				}
			}
		},
		"get_leaderboard": {
			"options": {
				"finalize_models": {
					"type": "bool",
					"tooltip": "<p>If True, will finalize all models in the \u2018Model\u2019 column.</p>\n",
					"default_val": "False"
				},
				"model_only": {
					"type": "bool",
					"tooltip": "<p>When set to False, only model object is returned, instead\nof the entire pipeline.</p>\n",
					"default_val": "False"
				},
				"fit_kwargs": {
					"type": "dict",
					"tooltip": "<p>Dictionary of arguments passed to the fit method of the model.\nIgnored if finalize_models is False.</p>\n",
					"default_val": "{} (empty dict)"
				},
				"groups": {
					"type": "str or array-like",
					"tooltip": "<p>Optional group labels when GroupKFold is used for the cross validation.\nIt takes an array with shape (n_samples, ) where n_samples is the number\nof rows in training dataset. When string is passed, it is interpreted as\nthe column name in the dataset containing group labels.\nIgnored if finalize_models is False.</p>\n",
					"default_val": "None"
				},
				"verbose": {
					"type": "bool",
					"tooltip": "<p>Progress bar is not printed when verbose is set to False.</p>\n",
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
					"tooltip": "<p>Trained model object</p>\n",
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
					"tooltip": "<p>Shape (n_samples, n_features). All features used during training\nmust be available in the unseen dataset.</p>\n"
				},
				"probability_threshold": {
					"type": "float",
					"tooltip": "<p>Threshold for converting predicted probability to class label.\nUnless this parameter is set, it will default to the value set\nduring model creation. If that wasn\u2019t set, the default will be 0.5\nfor all classifiers. Only applicable for binary classification.</p>\n",
					"default_val": "None"
				},
				"encoded_labels": {
					"type": "bool",
					"tooltip": "<p>When set to True, will return labels encoded as an integer.</p>\n",
					"default_val": "False"
				},
				"raw_score": {
					"type": "bool",
					"tooltip": "<p>When set to True, scores for all labels will be returned.</p>\n",
					"default_val": "False"
				},
				"drift_report": {
					"type": "bool",
					"tooltip": "<p>When set to True, interactive drift report is generated on test set\nwith the evidently library.</p>\n",
					"default_val": "False"
				},
				"round": {
					"type": "int",
					"tooltip": "<p>Number of decimal places the metrics in the score grid will be rounded to.</p>\n",
					"default_val": "4"
				},
				"verbose": {
					"type": "bool",
					"tooltip": "<p>When set to False, holdout score grid is not printed.</p>\n",
					"default_val": "True"
				}
			}
		},
		"finalize_model": {
			"options": {
				"estimator": {
					"type": "list",
					"tooltip": "<p>Trained model object</p>\n",
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
					"tooltip": "<p>Dictionary of arguments passed to the fit method of the model.</p>\n",
					"default_val": "{} (empty dict)"
				},
				"groups": {
					"type": "str or array-like",
					"tooltip": "<p>Optional group labels when GroupKFold is used for the cross validation.\nIt takes an array with shape (n_samples, ) where n_samples is the number\nof rows in training dataset. When string is passed, it is interpreted as\nthe column name in the dataset containing group labels.</p>\n",
					"default_val": "None"
				},
				"model_only": {
					"type": "bool",
					"tooltip": "<p>When set to False, only model object is re-trained and all the\ntransformations in Pipeline are ignored.</p>\n",
					"default_val": "True"
				},
				"experiment_custom_tags": {
					"type": "dict",
					"tooltip": "<p>Dictionary of tag_name: String -&gt; value: (String, but will be string-ified if\nnot) passed to the mlflow.set_tags to add new custom tags for the experiment.</p>\n",
					"default_val": "None"
				},
				"return_train_score": {
					"type": "bool",
					"tooltip": "<p>If False, returns the CV Validation scores only.\nIf True, returns the CV training scores along with the CV validation scores.\nThis is useful when the user wants to do bias-variance tradeoff. A high CV\ntraining score with a low corresponding CV validation score indicates overfitting.</p>\n",
					"default_val": "False"
				}
			}
		},
		"save_model": {
			"options": {
				"model": {
					"type": "list",
					"tooltip": "<p>Trained model object</p>\n",
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
					"tooltip": "<p>Name of the model.</p>\n"
				},
				"model_only": {
					"type": "bool",
					"tooltip": "<p>When set to True, only trained model object is saved instead of the\nentire pipeline.</p>\n",
					"default_val": "False"
				},
				"verbose": {
					"type": "bool",
					"tooltip": "<p>Success message is not printed when verbose is set to False.</p>\n",
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
					"tooltip": "<p>To deploy a model on AWS S3 (\u2018aws\u2019), the credentials have to be passed. The easiest way is to use environment\nvariables in your local environment. Following information from the IAM portal of amazon console account\nare required:</p>\n<ul class=\"simple\">\n<li><p>AWS Access Key ID</p></li>\n<li><p>AWS Secret Key Access</p></li>\n</ul>\n<p>More info: <a class=\"reference external\" href=\"https://boto3.amazonaws.com/v1/documentation/api/latest/guide/credentials.html#environment-variables\">https://boto3.amazonaws.com/v1/documentation/api/latest/guide/credentials.html#environment-variables</a></p>\n"
				},
				"Google Cloud Platform (GCP) users": {
					"type": "",
					"tooltip": "<p>To deploy a model on Google Cloud Platform (\u2018gcp\u2019), project must be created\nusing command line or GCP console. Once project is created, you must create\na service account and download the service account key as a JSON file to set\nenvironment variables in your local environment.</p>\n<p>More info: <a class=\"reference external\" href=\"https://cloud.google.com/docs/authentication/production\">https://cloud.google.com/docs/authentication/production</a></p>\n"
				},
				"Microsoft Azure (Azure) users": {
					"type": "",
					"tooltip": "<p>To deploy a model on Microsoft Azure (\u2018azure\u2019), environment variables for connection\nstring must be set in your local environment. Go to settings of storage account on\nAzure portal to access the connection string required.</p>\n<ul class=\"simple\">\n<li><p>AZURE_STORAGE_CONNECTION_STRING (required as environment variable)</p></li>\n</ul>\n<p>More info: <a class=\"reference external\" href=\"https://docs.microsoft.com/en-us/azure/storage/blobs/storage-quickstart-blobs-python?toc=%2Fpython%2Fazure%2FTOC.json\">https://docs.microsoft.com/en-us/azure/storage/blobs/storage-quickstart-blobs-python?toc=%2Fpython%2Fazure%2FTOC.json</a></p>\n"
				},
				"model": {
					"type": "list",
					"tooltip": "<p>Trained model object</p>\n",
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
					"tooltip": "<p>Name of model.</p>\n"
				},
				"authentication": {
					"type": "dict",
					"tooltip": "<p>Dictionary of applicable authentication tokens.</p>\n<p>When platform = \u2018aws\u2019:\n{\u2018bucket\u2019 : \u2018S3-bucket-name\u2019, \u2018path\u2019: (optional) folder name under the bucket}</p>\n<p>When platform = \u2018gcp\u2019:\n{\u2018project\u2019: \u2018gcp-project-name\u2019, \u2018bucket\u2019 : \u2018gcp-bucket-name\u2019}</p>\n<p>When platform = \u2018azure\u2019:\n{\u2018container\u2019: \u2018azure-container-name\u2019}</p>\n"
				},
				"platform": {
					"type": "string",
					"tooltip": "<p>Name of the platform. Currently supported platforms: \u2018aws\u2019, \u2018gcp\u2019 and \u2018azure\u2019.</p>\n",
					"default_val": "aws"
				}
			}
		},
		"convert_model": {
			"options": {
				"estimator": {
					"type": "list",
					"tooltip": "<p>Trained model object</p>\n",
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
					"tooltip": "<p>Language in which inference script to be generated. Following\noptions are available:</p>\n<ul class=\"simple\">\n<li><p>\u2018python\u2019</p></li>\n<li><p>\u2018java\u2019</p></li>\n<li><p>\u2018javascript\u2019</p></li>\n<li><p>\u2018c\u2019</p></li>\n<li><p>\u2018c#\u2019</p></li>\n<li><p>\u2018f#\u2019</p></li>\n<li><p>\u2018go\u2019</p></li>\n<li><p>\u2018haskell\u2019</p></li>\n<li><p>\u2018php\u2019</p></li>\n<li><p>\u2018powershell\u2019</p></li>\n<li><p>\u2018r\u2019</p></li>\n<li><p>\u2018ruby\u2019</p></li>\n<li><p>\u2018vb\u2019</p></li>\n<li><p>\u2018dart\u2019</p></li>\n</ul>\n",
					"default_val": "python"
				}
			}
		},
		"create_api": {
			"options": {
				"estimator": {
					"type": "list",
					"tooltip": "<p>Trained model object</p>\n",
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
					"tooltip": "<p>Trained model object</p>\n",
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
					"tooltip": "<p>API host address.</p>\n",
					"default_val": "127.0.0.1"
				},
				"port": {
					"type": "int",
					"tooltip": "<p>port for API.</p>\n",
					"default_val": "8000"
				}
			}
		},
		"create_docker": {
			"options": {
				"api_name": {
					"type": "string",
					"tooltip": "<p>Name of API. Must be saved as a .py file in the same folder.</p>\n"
				},
				"base_image": {
					"type": "string",
					"tooltip": "<p>Name of the base image for Dockerfile.</p>\n",
					"default_val": "\u201cpython:3.8-slim\u201d"
				},
				"expose_port": {
					"type": "int",
					"tooltip": "<p>port for expose for API in the Dockerfile.</p>\n",
					"default_val": "8000"
				}
			}
		},
		"create_app": {
			"options": {
				"estimator": {
					"type": "list",
					"tooltip": "<p>Trained model object</p>\n",
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
					"tooltip": "<p>arguments to be passed to app class.</p>\n",
					"default_val": "{}"
				}
			}
		}
	},
	"tune_model": {
		"options": {
			"estimator": {
				"type": "list",
				"tooltip": "<p>Trained model object</p>\n",
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
				"tooltip": "<p>Controls cross-validation. If None, the CV generator in the <code class=\"docutils literal notranslate\"><span class=\"pre\">fold_strategy</span></code>\nparameter of the <code class=\"docutils literal notranslate\"><span class=\"pre\">setup</span></code> function is used. When an integer is passed,\nit is interpreted as the \u2018n_splits\u2019 parameter of the CV generator in the\n<code class=\"docutils literal notranslate\"><span class=\"pre\">setup</span></code> function.</p>\n",
				"default_val": "None"
			},
			"round": {
				"type": "int",
				"tooltip": "<p>Number of decimal places the metrics in the score grid will be rounded to.</p>\n",
				"default_val": "4"
			},
			"n_iter": {
				"type": "int",
				"tooltip": "<p>Number of iterations in the grid search. Increasing \u2018n_iter\u2019 may improve\nmodel performance but also increases the training time.</p>\n",
				"default_val": "10"
			},
			"custom_grid": {
				"type": "dict",
				"tooltip": "<p>To define custom search space for hyperparameters, pass a dictionary with\nparameter name and values to be iterated. Custom grids must be in a format\nsupported by the defined <code class=\"docutils literal notranslate\"><span class=\"pre\">search_library</span></code>.</p>\n",
				"default_val": "None"
			},
			"optimize": {
				"type": "string",
				"tooltip": "<p>Metric name to be evaluated for hyperparameter tuning. It also accepts custom\nmetrics that are added through the <code class=\"docutils literal notranslate\"><span class=\"pre\">add_metric</span></code> function.</p>\n",
				"default_val": "Accuracy"
			},
			"custom_scorer": {
				"type": "object",
				"tooltip": "<p>custom scoring strategy can be passed to tune hyperparameters of the model.\nIt must be created using <code class=\"docutils literal notranslate\"><span class=\"pre\">sklearn.make_scorer</span></code>. It is equivalent of adding\ncustom metric using the <code class=\"docutils literal notranslate\"><span class=\"pre\">add_metric</span></code> function and passing the name of the\ncustom metric in the <code class=\"docutils literal notranslate\"><span class=\"pre\">optimize</span></code> parameter.\nWill be deprecated in future.</p>\n",
				"default_val": "None"
			},
			"search_library": {
				"type": "string",
				"tooltip": "<p>The search library used for tuning hyperparameters. Possible values:</p>\n<ul class=\"simple\">\n<li><dl class=\"simple\">\n<dt>\u2018scikit-learn\u2019 - default, requires no further installation</dt><dd><p><a class=\"reference external\" href=\"https://github.com/scikit-learn/scikit-learn\">https://github.com/scikit-learn/scikit-learn</a></p>\n</dd>\n</dl>\n</li>\n<li><dl class=\"simple\">\n<dt>\u2018scikit-optimize\u2019 - <code class=\"docutils literal notranslate\"><span class=\"pre\">pip</span> <span class=\"pre\">install</span> <span class=\"pre\">scikit-optimize</span></code></dt><dd><p><a class=\"reference external\" href=\"https://scikit-optimize.github.io/stable/\">https://scikit-optimize.github.io/stable/</a></p>\n</dd>\n</dl>\n</li>\n<li><dl class=\"simple\">\n<dt>\u2018tune-sklearn\u2019 - <code class=\"docutils literal notranslate\"><span class=\"pre\">pip</span> <span class=\"pre\">install</span> <span class=\"pre\">tune-sklearn</span> <span class=\"pre\">ray[tune]</span></code></dt><dd><p><a class=\"reference external\" href=\"https://github.com/ray-project/tune-sklearn\">https://github.com/ray-project/tune-sklearn</a></p>\n</dd>\n</dl>\n</li>\n<li><dl class=\"simple\">\n<dt>\u2018optuna\u2019 - <code class=\"docutils literal notranslate\"><span class=\"pre\">pip</span> <span class=\"pre\">install</span> <span class=\"pre\">optuna</span></code></dt><dd><p><a class=\"reference external\" href=\"https://optuna.org/\">https://optuna.org/</a></p>\n</dd>\n</dl>\n</li>\n</ul>\n",
				"default_val": "scikit-learn"
			},
			"search_algorithm": {
				"type": "string",
				"tooltip": "<p>The search algorithm depends on the <code class=\"docutils literal notranslate\"><span class=\"pre\">search_library</span></code> parameter.\nSome search algorithms require additional libraries to be installed.\nIf None, will use search library-specific default algorithm.</p>\n<ul class=\"simple\">\n<li><dl class=\"simple\">\n<dt>\u2018scikit-learn\u2019 possible values:</dt><dd><ul>\n<li><p>\u2018random\u2019 : random grid search (default)</p></li>\n<li><p>\u2018grid\u2019 : grid search</p></li>\n</ul>\n</dd>\n</dl>\n</li>\n<li><dl class=\"simple\">\n<dt>\u2018scikit-optimize\u2019 possible values:</dt><dd><ul>\n<li><p>\u2018bayesian\u2019 : Bayesian search (default)</p></li>\n</ul>\n</dd>\n</dl>\n</li>\n<li><dl class=\"simple\">\n<dt>\u2018tune-sklearn\u2019 possible values:</dt><dd><ul>\n<li><p>\u2018random\u2019 : random grid search (default)</p></li>\n<li><p>\u2018grid\u2019 : grid search</p></li>\n<li><p>\u2018bayesian\u2019 : <code class=\"docutils literal notranslate\"><span class=\"pre\">pip</span> <span class=\"pre\">install</span> <span class=\"pre\">scikit-optimize</span></code></p></li>\n<li><p>\u2018hyperopt\u2019 : <code class=\"docutils literal notranslate\"><span class=\"pre\">pip</span> <span class=\"pre\">install</span> <span class=\"pre\">hyperopt</span></code></p></li>\n<li><p>\u2018optuna\u2019 : <code class=\"docutils literal notranslate\"><span class=\"pre\">pip</span> <span class=\"pre\">install</span> <span class=\"pre\">optuna</span></code></p></li>\n<li><p>\u2018bohb\u2019 : <code class=\"docutils literal notranslate\"><span class=\"pre\">pip</span> <span class=\"pre\">install</span> <span class=\"pre\">hpbandster</span> <span class=\"pre\">ConfigSpace</span></code></p></li>\n</ul>\n</dd>\n</dl>\n</li>\n<li><dl class=\"simple\">\n<dt>\u2018optuna\u2019 possible values:</dt><dd><ul>\n<li><p>\u2018random\u2019 : randomized search</p></li>\n<li><p>\u2018tpe\u2019 : Tree-structured Parzen Estimator search (default)</p></li>\n</ul>\n</dd>\n</dl>\n</li>\n</ul>\n",
				"default_val": "None"
			},
			"early_stopping": {
				"type": "bool or str or object",
				"tooltip": "<p>Use early stopping to stop fitting to a hyperparameter configuration\nif it performs poorly. Ignored when <code class=\"docutils literal notranslate\"><span class=\"pre\">search_library</span></code> is scikit-learn,\nor if the estimator does not have \u2018partial_fit\u2019 attribute. If False or\nNone, early stopping will not be used. Can be either an object accepted\nby the search library or one of the following:</p>\n<ul class=\"simple\">\n<li><p>\u2018asha\u2019 for Asynchronous Successive Halving Algorithm</p></li>\n<li><p>\u2018hyperband\u2019 for Hyperband</p></li>\n<li><p>\u2018median\u2019 for Median Stopping Rule</p></li>\n<li><p>If False or None, early stopping will not be used.</p></li>\n</ul>\n",
				"default_val": "False"
			},
			"early_stopping_max_iters": {
				"type": "int",
				"tooltip": "<p>Maximum number of epochs to run for each sampled configuration.\nIgnored if <code class=\"docutils literal notranslate\"><span class=\"pre\">early_stopping</span></code> is False or None.</p>\n",
				"default_val": "10"
			},
			"choose_better": {
				"type": "bool",
				"tooltip": "<p>When set to True, the returned object is always better performing. The\nmetric used for comparison is defined by the <code class=\"docutils literal notranslate\"><span class=\"pre\">optimize</span></code> parameter.</p>\n",
				"default_val": "False"
			},
			"fit_kwargs": {
				"type": "dict",
				"tooltip": "<p>Dictionary of arguments passed to the fit method of the tuner.</p>\n",
				"default_val": "{} (empty dict)"
			},
			"groups": {
				"type": "str or array-like",
				"tooltip": "<p>Optional group labels when GroupKFold is used for the cross validation.\nIt takes an array with shape (n_samples, ) where n_samples is the number\nof rows in training dataset. When string is passed, it is interpreted as\nthe column name in the dataset containing group labels.</p>\n",
				"default_val": "None"
			},
			"return_tuner": {
				"type": "bool",
				"tooltip": "<p>When set to True, will return a tuple of (model, tuner_object).</p>\n",
				"default_val": "False"
			},
			"verbose": {
				"type": "bool",
				"tooltip": "<p>Score grid is not printed when verbose is set to False.</p>\n",
				"default_val": "True"
			},
			"tuner_verbose": {
				"type": "bool or in",
				"tooltip": "<p>If True or above 0, will print messages from the tuner. Higher values\nprint more messages. Ignored when <code class=\"docutils literal notranslate\"><span class=\"pre\">verbose</span></code> param is False.</p>\n",
				"default_val": "True"
			},
			"return_train_score": {
				"type": "bool",
				"tooltip": "<p>If False, returns the CV Validation scores only.\nIf True, returns the CV training scores along with the CV validation scores.\nThis is useful when the user wants to do bias-variance tradeoff. A high CV\ntraining score with a low corresponding CV validation score indicates overfitting.</p>\n",
				"default_val": "False"
			}
		},
		"ml_types": "classification regression survival_analysis"
	},
	"ensemble_model": {
		"options": {
			"estimator": {
				"type": "list",
				"tooltip": "<p>Trained model object</p>\n",
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
				"tooltip": "<p>Method for ensembling base estimator. It can be \u2018Bagging\u2019 or \u2018Boosting\u2019.</p>\n",
				"default_val": "Bagging"
			},
			"fold": {
				"type": "int",
				"tooltip": "<p>Controls cross-validation. If None, the CV generator in the <code class=\"docutils literal notranslate\"><span class=\"pre\">fold_strategy</span></code>\nparameter of the <code class=\"docutils literal notranslate\"><span class=\"pre\">setup</span></code> function is used. When an integer is passed,\nit is interpreted as the \u2018n_splits\u2019 parameter of the CV generator in the\n<code class=\"docutils literal notranslate\"><span class=\"pre\">setup</span></code> function.</p>\n",
				"default_val": "None"
			},
			"n_estimators": {
				"type": "int",
				"tooltip": "<p>The number of base estimators in the ensemble. In case of perfect fit, the\nlearning procedure is stopped early.</p>\n",
				"default_val": "10"
			},
			"round": {
				"type": "int",
				"tooltip": "<p>Number of decimal places the metrics in the score grid will be rounded to.</p>\n",
				"default_val": "4"
			},
			"choose_better": {
				"type": "bool",
				"tooltip": "<p>When set to True, the returned object is always better performing. The\nmetric used for comparison is defined by the <code class=\"docutils literal notranslate\"><span class=\"pre\">optimize</span></code> parameter.</p>\n",
				"default_val": "False"
			},
			"optimize": {
				"type": "string",
				"tooltip": "<p>Metric to compare for model selection when <code class=\"docutils literal notranslate\"><span class=\"pre\">choose_better</span></code> is True.</p>\n",
				"default_val": "Accuracy"
			},
			"fit_kwargs": {
				"type": "dict",
				"tooltip": "<p>Dictionary of arguments passed to the fit method of the model.</p>\n",
				"default_val": "{} (empty dict)"
			},
			"groups": {
				"type": "str or array-like",
				"tooltip": "<p>Optional group labels when GroupKFold is used for the cross validation.\nIt takes an array with shape (n_samples, ) where n_samples is the number\nof rows in training dataset. When string is passed, it is interpreted as\nthe column name in the dataset containing group labels.</p>\n",
				"default_val": "None"
			},
			"probability_threshold": {
				"type": "float",
				"tooltip": "<p>Threshold for converting predicted probability to class label.\nIt defaults to 0.5 for all classifiers unless explicitly defined\nin this parameter. Only applicable for binary classification.</p>\n",
				"default_val": "None"
			},
			"verbose": {
				"type": "bool",
				"tooltip": "<p>Score grid is not printed when verbose is set to False.</p>\n",
				"default_val": "True"
			},
			"return_train_score": {
				"type": "bool",
				"tooltip": "<p>If False, returns the CV Validation scores only.\nIf True, returns the CV training scores along with the CV validation scores.\nThis is useful when the user wants to do bias-variance tradeoff. A high CV\ntraining score with a low corresponding CV validation score indicates overfitting.</p>\n",
				"default_val": "False"
			}
		},
		"ml_types": "classification regression"
	},
	"blend_models": {
		"options": {
			"estimator_list": {
				"type": "list of scikit-learn compatible objects",
				"tooltip": "<p>List of trained model objects</p>\n"
			},
			"fold": {
				"type": "int",
				"tooltip": "<p>Controls cross-validation. If None, the CV generator in the <code class=\"docutils literal notranslate\"><span class=\"pre\">fold_strategy</span></code>\nparameter of the <code class=\"docutils literal notranslate\"><span class=\"pre\">setup</span></code> function is used. When an integer is passed,\nit is interpreted as the \u2018n_splits\u2019 parameter of the CV generator in the\n<code class=\"docutils literal notranslate\"><span class=\"pre\">setup</span></code> function.</p>\n",
				"default_val": "None"
			},
			"round": {
				"type": "int",
				"tooltip": "<p>Number of decimal places the metrics in the score grid will be rounded to.</p>\n",
				"default_val": "4"
			},
			"choose_better": {
				"type": "bool",
				"tooltip": "<p>When set to True, the returned object is always better performing. The\nmetric used for comparison is defined by the <code class=\"docutils literal notranslate\"><span class=\"pre\">optimize</span></code> parameter.</p>\n",
				"default_val": "False"
			},
			"optimize": {
				"type": "string",
				"tooltip": "<p>Metric to compare for model selection when <code class=\"docutils literal notranslate\"><span class=\"pre\">choose_better</span></code> is True.</p>\n",
				"default_val": "Accuracy"
			},
			"method": {
				"type": "string",
				"tooltip": "<p>\u2018hard\u2019 uses predicted class labels for majority rule voting. \u2018soft\u2019, predicts\nthe class label based on the argmax of the sums of the predicted probabilities,\nwhich is recommended for an ensemble of well-calibrated classifiers. Default\nvalue, \u2018auto\u2019, will try to use \u2018soft\u2019 and fall back to \u2018hard\u2019 if the former is\nnot supported.</p>\n",
				"default_val": "auto"
			},
			"weights": {
				"type": "custom_list",
				"tooltip": "<p>Sequence of weights (float or int) to weight the occurrences of predicted class\nlabels (hard voting) or class probabilities before averaging (soft voting). Uses\nuniform weights when None.</p>\n",
				"default_val": "None"
			},
			"fit_kwargs": {
				"type": "dict",
				"tooltip": "<p>Dictionary of arguments passed to the fit method of the model.</p>\n",
				"default_val": "{} (empty dict)"
			},
			"groups": {
				"type": "str or array-like",
				"tooltip": "<p>Optional group labels when GroupKFold is used for the cross validation.\nIt takes an array with shape (n_samples, ) where n_samples is the number\nof rows in training dataset. When string is passed, it is interpreted as\nthe column name in the dataset containing group labels.</p>\n",
				"default_val": "None"
			},
			"probability_threshold": {
				"type": "float",
				"tooltip": "<p>Threshold for converting predicted probability to class label.\nIt defaults to 0.5 for all classifiers unless explicitly defined\nin this parameter. Only applicable for binary classification.</p>\n",
				"default_val": "None"
			},
			"verbose": {
				"type": "bool",
				"tooltip": "<p>Score grid is not printed when verbose is set to False.</p>\n",
				"default_val": "True"
			},
			"return_train_score": {
				"type": "bool",
				"tooltip": "<p>If False, returns the CV Validation scores only.\nIf True, returns the CV training scores along with the CV validation scores.\nThis is useful when the user wants to do bias-variance tradeoff. A high CV\ntraining score with a low corresponding CV validation score indicates overfitting.</p>\n",
				"default_val": "False"
			}
		},
		"ml_types": "classification regression"
	},
	"stack_models": {
		"options": {
			"estimator_list": {
				"type": "list of scikit-learn compatible objects",
				"tooltip": "<p>List of trained model objects</p>\n"
			},
			"meta_model": {
				"type": "list",
				"tooltip": "<p>When None, Logistic Regression is trained as a meta model.</p>\n",
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
				"tooltip": "<p>Controls internal cross-validation. Can be an integer or a scikit-learn\nCV generator. If set to an integer, will use (Stratifed)KFold CV with\nthat many folds. See scikit-learn documentation on Stacking for\nmore details.</p>\n",
				"default_val": "5"
			},
			"fold": {
				"type": "int",
				"tooltip": "<p>Controls cross-validation. If None, the CV generator in the <code class=\"docutils literal notranslate\"><span class=\"pre\">fold_strategy</span></code>\nparameter of the <code class=\"docutils literal notranslate\"><span class=\"pre\">setup</span></code> function is used. When an integer is passed,\nit is interpreted as the \u2018n_splits\u2019 parameter of the CV generator in the\n<code class=\"docutils literal notranslate\"><span class=\"pre\">setup</span></code> function.</p>\n",
				"default_val": "None"
			},
			"round": {
				"type": "int",
				"tooltip": "<p>Number of decimal places the metrics in the score grid will be rounded to.</p>\n",
				"default_val": "4"
			},
			"method": {
				"type": "string",
				"tooltip": "<p>When set to \u2018auto\u2019, it will invoke, for each estimator, \u2018predict_proba\u2019,\n\u2018decision_function\u2019 or \u2018predict\u2019 in that order. Other, manually pass one\nof the value from \u2018predict_proba\u2019, \u2018decision_function\u2019 or \u2018predict\u2019.</p>\n",
				"default_val": "auto"
			},
			"restack": {
				"type": "bool",
				"tooltip": "<p>When set to False, only the predictions of estimators will be used as\ntraining data for the <code class=\"docutils literal notranslate\"><span class=\"pre\">meta_model</span></code>.</p>\n",
				"default_val": "True"
			},
			"choose_better": {
				"type": "bool",
				"tooltip": "<p>When set to True, the returned object is always better performing. The\nmetric used for comparison is defined by the <code class=\"docutils literal notranslate\"><span class=\"pre\">optimize</span></code> parameter.</p>\n",
				"default_val": "False"
			},
			"optimize": {
				"type": "string",
				"tooltip": "<p>Metric to compare for model selection when <code class=\"docutils literal notranslate\"><span class=\"pre\">choose_better</span></code> is True.</p>\n",
				"default_val": "Accuracy"
			},
			"fit_kwargs": {
				"type": "dict",
				"tooltip": "<p>Dictionary of arguments passed to the fit method of the model.</p>\n",
				"default_val": "{} (empty dict)"
			},
			"groups": {
				"type": "str or array-like",
				"tooltip": "<p>Optional group labels when GroupKFold is used for the cross validation.\nIt takes an array with shape (n_samples, ) where n_samples is the number\nof rows in training dataset. When string is passed, it is interpreted as\nthe column name in the dataset containing group labels.</p>\n",
				"default_val": "None"
			},
			"probability_threshold": {
				"type": "float",
				"tooltip": "<p>Threshold for converting predicted probability to class label.\nIt defaults to 0.5 for all classifiers unless explicitly defined\nin this parameter. Only applicable for binary classification.</p>\n",
				"default_val": "None"
			},
			"verbose": {
				"type": "bool",
				"tooltip": "<p>Score grid is not printed when verbose is set to False.</p>\n",
				"default_val": "True"
			},
			"return_train_score": {
				"type": "bool",
				"tooltip": "<p>If False, returns the CV Validation scores only.\nIf True, returns the CV training scores along with the CV validation scores.\nThis is useful when the user wants to do bias-variance tradeoff. A high CV\ntraining score with a low corresponding CV validation score indicates overfitting.</p>\n",
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
				"tooltip": "<p>Trained model object</p>\n",
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
				"tooltip": "<p>The method to use for calibration. Can be \u2018sigmoid\u2019 which corresponds to\nPlatt\u2019s method or \u2018isotonic\u2019 which is a non-parametric approach.</p>\n",
				"default_val": "sigmoid"
			},
			"calibrate_fold": {
				"type": "integer or scikit-learn compatible CV generator",
				"tooltip": "<p>Controls internal cross-validation. Can be an integer or a scikit-learn\nCV generator. If set to an integer, will use (Stratifed)KFold CV with\nthat many folds. See scikit-learn documentation on Stacking for\nmore details.</p>\n",
				"default_val": "5"
			},
			"fold": {
				"type": "int",
				"tooltip": "<p>Controls cross-validation. If None, the CV generator in the <code class=\"docutils literal notranslate\"><span class=\"pre\">fold_strategy</span></code>\nparameter of the <code class=\"docutils literal notranslate\"><span class=\"pre\">setup</span></code> function is used. When an integer is passed,\nit is interpreted as the \u2018n_splits\u2019 parameter of the CV generator in the\n<code class=\"docutils literal notranslate\"><span class=\"pre\">setup</span></code> function.</p>\n",
				"default_val": "None"
			},
			"round": {
				"type": "int",
				"tooltip": "<p>Number of decimal places the metrics in the score grid will be rounded to.</p>\n",
				"default_val": "4"
			},
			"fit_kwargs": {
				"type": "dict",
				"tooltip": "<p>Dictionary of arguments passed to the fit method of the model.</p>\n",
				"default_val": "{} (empty dict)"
			},
			"groups": {
				"type": "str or array-like",
				"tooltip": "<p>Optional group labels when GroupKFold is used for the cross validation.\nIt takes an array with shape (n_samples, ) where n_samples is the number\nof rows in training dataset. When string is passed, it is interpreted as\nthe column name in the dataset containing group labels.</p>\n",
				"default_val": "None"
			},
			"verbose": {
				"type": "bool",
				"tooltip": "<p>Score grid is not printed when verbose is set to False.</p>\n",
				"default_val": "True"
			},
			"return_train_score": {
				"type": "bool",
				"tooltip": "<p>If False, returns the CV Validation scores only.\nIf True, returns the CV training scores along with the CV validation scores.\nThis is useful when the user wants to do bias-variance tradeoff. A high CV\ntraining score with a low corresponding CV validation score indicates overfitting.</p>\n",
				"default_val": "False"
			}
		},
		"ml_types": "classification"
	}
};