const regressionModelSettings = {
	"lr": {
		"options": {
			"fit_intercept": {
				"type": "bool",
				"default_val": "True",
				"tooltip": "tooltip not implemented"
			},
			"normalize": {
				"type": "string",
				"default_val": "deprecated",
				"tooltip": "tooltip not implemented"
			},
			"copy_X": {
				"type": "bool",
				"default_val": "True",
				"tooltip": "tooltip not implemented"
			},
			"n_jobs": {
				"type": "int",
				"default_val": "-1",
				"tooltip": "tooltip not implemented"
			},
			"positive": {
				"type": "bool",
				"default_val": "False",
				"tooltip": "tooltip not implemented"
			}
		},
		"code": "lr"
	},
	"lasso": {
		"options": {
			"alpha": {
				"type": "float",
				"default_val": "1.0",
				"tooltip": "tooltip not implemented"
			},
			"l1_ratio": {
				"type": "float",
				"default_val": "1.0",
				"tooltip": "tooltip not implemented"
			},
			"fit_intercept": {
				"type": "bool",
				"default_val": "True",
				"tooltip": "tooltip not implemented"
			},
			"normalize": {
				"type": "string",
				"default_val": "deprecated",
				"tooltip": "tooltip not implemented"
			},
			"precompute": {
				"type": "bool",
				"default_val": "False",
				"tooltip": "tooltip not implemented"
			},
			"max_iter": {
				"type": "int",
				"default_val": "1000",
				"tooltip": "tooltip not implemented"
			},
			"copy_X": {
				"type": "bool",
				"default_val": "True",
				"tooltip": "tooltip not implemented"
			},
			"tol": {
				"type": "float",
				"default_val": "0.0001",
				"tooltip": "tooltip not implemented"
			},
			"warm_start": {
				"type": "bool",
				"default_val": "False",
				"tooltip": "tooltip not implemented"
			},
			"positive": {
				"type": "bool",
				"default_val": "False",
				"tooltip": "tooltip not implemented"
			},
			"random_state": {
				"type": "int",
				"default_val": "2689",
				"tooltip": "tooltip not implemented"
			},
			"selection": {
				"type": "string",
				"default_val": "cyclic",
				"tooltip": "tooltip not implemented"
			}
		},
		"code": "lasso"
	},
	"ridge": {
		"options": {
			"alpha": {
				"type": "float",
				"default_val": "1.0",
				"tooltip": "tooltip not implemented"
			},
			"fit_intercept": {
				"type": "bool",
				"default_val": "True",
				"tooltip": "tooltip not implemented"
			},
			"normalize": {
				"type": "string",
				"default_val": "deprecated",
				"tooltip": "tooltip not implemented"
			},
			"copy_X": {
				"type": "bool",
				"default_val": "True",
				"tooltip": "tooltip not implemented"
			},
			"max_iter": {
				"type": "NoneType",
				"default_val": "None",
				"tooltip": "tooltip not implemented"
			},
			"tol": {
				"type": "float",
				"default_val": "0.001",
				"tooltip": "tooltip not implemented"
			},
			"solver": {
				"type": "string",
				"default_val": "auto",
				"tooltip": "tooltip not implemented"
			},
			"positive": {
				"type": "bool",
				"default_val": "False",
				"tooltip": "tooltip not implemented"
			},
			"random_state": {
				"type": "int",
				"default_val": "2689",
				"tooltip": "tooltip not implemented"
			}
		},
		"code": "ridge"
	},
	"en": {
		"options": {
			"alpha": {
				"type": "float",
				"default_val": "1.0",
				"tooltip": "tooltip not implemented"
			},
			"l1_ratio": {
				"type": "float",
				"default_val": "0.5",
				"tooltip": "tooltip not implemented"
			},
			"fit_intercept": {
				"type": "bool",
				"default_val": "True",
				"tooltip": "tooltip not implemented"
			},
			"normalize": {
				"type": "string",
				"default_val": "deprecated",
				"tooltip": "tooltip not implemented"
			},
			"precompute": {
				"type": "bool",
				"default_val": "False",
				"tooltip": "tooltip not implemented"
			},
			"max_iter": {
				"type": "int",
				"default_val": "1000",
				"tooltip": "tooltip not implemented"
			},
			"copy_X": {
				"type": "bool",
				"default_val": "True",
				"tooltip": "tooltip not implemented"
			},
			"tol": {
				"type": "float",
				"default_val": "0.0001",
				"tooltip": "tooltip not implemented"
			},
			"warm_start": {
				"type": "bool",
				"default_val": "False",
				"tooltip": "tooltip not implemented"
			},
			"positive": {
				"type": "bool",
				"default_val": "False",
				"tooltip": "tooltip not implemented"
			},
			"random_state": {
				"type": "int",
				"default_val": "2689",
				"tooltip": "tooltip not implemented"
			},
			"selection": {
				"type": "string",
				"default_val": "cyclic",
				"tooltip": "tooltip not implemented"
			}
		},
		"code": "en"
	},
	"lar": {
		"options": {
			"fit_intercept": {
				"type": "bool",
				"default_val": "True",
				"tooltip": "tooltip not implemented"
			},
			"verbose": {
				"type": "bool",
				"default_val": "False",
				"tooltip": "tooltip not implemented"
			},
			"normalize": {
				"type": "string",
				"default_val": "deprecated",
				"tooltip": "tooltip not implemented"
			},
			"precompute": {
				"type": "string",
				"default_val": "auto",
				"tooltip": "tooltip not implemented"
			},
			"n_nonzero_coefs": {
				"type": "int",
				"default_val": "500",
				"tooltip": "tooltip not implemented"
			},
			"eps": {
				"type": "float64",
				"default_val": "2.220446049250313e-16",
				"tooltip": "tooltip not implemented"
			},
			"copy_X": {
				"type": "bool",
				"default_val": "True",
				"tooltip": "tooltip not implemented"
			},
			"fit_path": {
				"type": "bool",
				"default_val": "True",
				"tooltip": "tooltip not implemented"
			},
			"jitter": {
				"type": "NoneType",
				"default_val": "None",
				"tooltip": "tooltip not implemented"
			},
			"random_state": {
				"type": "int",
				"default_val": "2689",
				"tooltip": "tooltip not implemented"
			}
		},
		"code": "lar"
	},
	"llar": {
		"options": {
			"alpha": {
				"type": "float",
				"default_val": "1.0",
				"tooltip": "tooltip not implemented"
			},
			"fit_intercept": {
				"type": "bool",
				"default_val": "True",
				"tooltip": "tooltip not implemented"
			},
			"max_iter": {
				"type": "int",
				"default_val": "500",
				"tooltip": "tooltip not implemented"
			},
			"verbose": {
				"type": "bool",
				"default_val": "False",
				"tooltip": "tooltip not implemented"
			},
			"normalize": {
				"type": "string",
				"default_val": "deprecated",
				"tooltip": "tooltip not implemented"
			},
			"positive": {
				"type": "bool",
				"default_val": "False",
				"tooltip": "tooltip not implemented"
			},
			"precompute": {
				"type": "string",
				"default_val": "auto",
				"tooltip": "tooltip not implemented"
			},
			"copy_X": {
				"type": "bool",
				"default_val": "True",
				"tooltip": "tooltip not implemented"
			},
			"eps": {
				"type": "float64",
				"default_val": "2.220446049250313e-16",
				"tooltip": "tooltip not implemented"
			},
			"fit_path": {
				"type": "bool",
				"default_val": "True",
				"tooltip": "tooltip not implemented"
			},
			"jitter": {
				"type": "NoneType",
				"default_val": "None",
				"tooltip": "tooltip not implemented"
			},
			"random_state": {
				"type": "int",
				"default_val": "2689",
				"tooltip": "tooltip not implemented"
			}
		},
		"code": "llar"
	},
	"omp": {
		"options": {
			"n_nonzero_coefs": {
				"type": "NoneType",
				"default_val": "None",
				"tooltip": "tooltip not implemented"
			},
			"tol": {
				"type": "NoneType",
				"default_val": "None",
				"tooltip": "tooltip not implemented"
			},
			"fit_intercept": {
				"type": "bool",
				"default_val": "True",
				"tooltip": "tooltip not implemented"
			},
			"normalize": {
				"type": "string",
				"default_val": "deprecated",
				"tooltip": "tooltip not implemented"
			},
			"precompute": {
				"type": "string",
				"default_val": "auto",
				"tooltip": "tooltip not implemented"
			}
		},
		"code": "omp"
	},
	"br": {
		"options": {
			"n_iter": {
				"type": "int",
				"default_val": "300",
				"tooltip": "tooltip not implemented"
			},
			"tol": {
				"type": "float",
				"default_val": "0.001",
				"tooltip": "tooltip not implemented"
			},
			"alpha_1": {
				"type": "float",
				"default_val": "1e-06",
				"tooltip": "tooltip not implemented"
			},
			"alpha_2": {
				"type": "float",
				"default_val": "1e-06",
				"tooltip": "tooltip not implemented"
			},
			"lambda_1": {
				"type": "float",
				"default_val": "1e-06",
				"tooltip": "tooltip not implemented"
			},
			"lambda_2": {
				"type": "float",
				"default_val": "1e-06",
				"tooltip": "tooltip not implemented"
			},
			"alpha_init": {
				"type": "NoneType",
				"default_val": "None",
				"tooltip": "tooltip not implemented"
			},
			"lambda_init": {
				"type": "NoneType",
				"default_val": "None",
				"tooltip": "tooltip not implemented"
			},
			"compute_score": {
				"type": "bool",
				"default_val": "False",
				"tooltip": "tooltip not implemented"
			},
			"fit_intercept": {
				"type": "bool",
				"default_val": "True",
				"tooltip": "tooltip not implemented"
			},
			"normalize": {
				"type": "string",
				"default_val": "deprecated",
				"tooltip": "tooltip not implemented"
			},
			"copy_X": {
				"type": "bool",
				"default_val": "True",
				"tooltip": "tooltip not implemented"
			},
			"verbose": {
				"type": "bool",
				"default_val": "False",
				"tooltip": "tooltip not implemented"
			}
		},
		"code": "br"
	},
	"ard": {
		"options": {
			"n_iter": {
				"type": "int",
				"default_val": "1000",
				"tooltip": "tooltip not implemented"
			},
			"tol": {
				"type": "float",
				"default_val": "0.001",
				"tooltip": "tooltip not implemented"
			},
			"fit_intercept": {
				"type": "bool",
				"default_val": "True",
				"tooltip": "tooltip not implemented"
			},
			"normalize": {
				"type": "string",
				"default_val": "deprecated",
				"tooltip": "tooltip not implemented"
			},
			"alpha_1": {
				"type": "float",
				"default_val": "1e-06",
				"tooltip": "tooltip not implemented"
			},
			"alpha_2": {
				"type": "float",
				"default_val": "1e-06",
				"tooltip": "tooltip not implemented"
			},
			"lambda_1": {
				"type": "float",
				"default_val": "1e-06",
				"tooltip": "tooltip not implemented"
			},
			"lambda_2": {
				"type": "float",
				"default_val": "1e-06",
				"tooltip": "tooltip not implemented"
			},
			"compute_score": {
				"type": "bool",
				"default_val": "False",
				"tooltip": "tooltip not implemented"
			},
			"threshold_lambda": {
				"type": "float",
				"default_val": "10000.0",
				"tooltip": "tooltip not implemented"
			},
			"copy_X": {
				"type": "bool",
				"default_val": "True",
				"tooltip": "tooltip not implemented"
			},
			"verbose": {
				"type": "bool",
				"default_val": "False",
				"tooltip": "tooltip not implemented"
			}
		},
		"code": "ard"
	},
	"par": {
		"options": {
			"loss": {
				"type": "string",
				"default_val": "epsilon_insensitive",
				"tooltip": "tooltip not implemented"
			},
			"penalty": {
				"type": "NoneType",
				"default_val": "None",
				"tooltip": "tooltip not implemented"
			},
			"learning_rate": {
				"type": "string",
				"default_val": "invscaling",
				"tooltip": "tooltip not implemented"
			},
			"epsilon": {
				"type": "float",
				"default_val": "0.1",
				"tooltip": "tooltip not implemented"
			},
			"alpha": {
				"type": "float",
				"default_val": "0.0001",
				"tooltip": "tooltip not implemented"
			},
			"C": {
				"type": "float",
				"default_val": "1.0",
				"tooltip": "tooltip not implemented"
			},
			"l1_ratio": {
				"type": "int",
				"default_val": "0",
				"tooltip": "tooltip not implemented"
			},
			"fit_intercept": {
				"type": "bool",
				"default_val": "True",
				"tooltip": "tooltip not implemented"
			},
			"shuffle": {
				"type": "bool",
				"default_val": "True",
				"tooltip": "tooltip not implemented"
			},
			"random_state": {
				"type": "int",
				"default_val": "2689",
				"tooltip": "tooltip not implemented"
			},
			"verbose": {
				"type": "int",
				"default_val": "0",
				"tooltip": "tooltip not implemented"
			},
			"eta0": {
				"type": "float",
				"default_val": "1.0",
				"tooltip": "tooltip not implemented"
			},
			"power_t": {
				"type": "float",
				"default_val": "0.25",
				"tooltip": "tooltip not implemented"
			},
			"early_stopping": {
				"type": "bool",
				"default_val": "False",
				"tooltip": "tooltip not implemented"
			},
			"validation_fraction": {
				"type": "float",
				"default_val": "0.1",
				"tooltip": "tooltip not implemented"
			},
			"n_iter_no_change": {
				"type": "int",
				"default_val": "5",
				"tooltip": "tooltip not implemented"
			},
			"warm_start": {
				"type": "bool",
				"default_val": "False",
				"tooltip": "tooltip not implemented"
			},
			"average": {
				"type": "bool",
				"default_val": "False",
				"tooltip": "tooltip not implemented"
			},
			"max_iter": {
				"type": "int",
				"default_val": "1000",
				"tooltip": "tooltip not implemented"
			},
			"tol": {
				"type": "float",
				"default_val": "0.001",
				"tooltip": "tooltip not implemented"
			}
		},
		"code": "par"
	},
	"ransac": {
		"options": {
			"estimator": {
				"type": "NoneType",
				"default_val": "None",
				"tooltip": "tooltip not implemented"
			},
			"min_samples": {
				"type": "NoneType",
				"default_val": "None",
				"tooltip": "tooltip not implemented"
			},
			"residual_threshold": {
				"type": "NoneType",
				"default_val": "None",
				"tooltip": "tooltip not implemented"
			},
			"is_data_valid": {
				"type": "NoneType",
				"default_val": "None",
				"tooltip": "tooltip not implemented"
			},
			"is_model_valid": {
				"type": "NoneType",
				"default_val": "None",
				"tooltip": "tooltip not implemented"
			},
			"max_trials": {
				"type": "int",
				"default_val": "100",
				"tooltip": "tooltip not implemented"
			},
			"max_skips": {
				"type": "float",
				"default_val": "inf",
				"tooltip": "tooltip not implemented"
			},
			"stop_n_inliers": {
				"type": "float",
				"default_val": "inf",
				"tooltip": "tooltip not implemented"
			},
			"stop_score": {
				"type": "float",
				"default_val": "inf",
				"tooltip": "tooltip not implemented"
			},
			"stop_probability": {
				"type": "float",
				"default_val": "0.99",
				"tooltip": "tooltip not implemented"
			},
			"random_state": {
				"type": "int",
				"default_val": "2689",
				"tooltip": "tooltip not implemented"
			},
			"loss": {
				"type": "string",
				"default_val": "absolute_error",
				"tooltip": "tooltip not implemented"
			},
			"base_estimator": {
				"type": "string",
				"default_val": "deprecated",
				"tooltip": "tooltip not implemented"
			}
		},
		"code": "ransac"
	},
	"tr": {
		"options": {
			"fit_intercept": {
				"type": "bool",
				"default_val": "True",
				"tooltip": "tooltip not implemented"
			},
			"copy_X": {
				"type": "bool",
				"default_val": "True",
				"tooltip": "tooltip not implemented"
			},
			"max_subpopulation": {
				"type": "float",
				"default_val": "10000.0",
				"tooltip": "tooltip not implemented"
			},
			"n_subsamples": {
				"type": "NoneType",
				"default_val": "None",
				"tooltip": "tooltip not implemented"
			},
			"max_iter": {
				"type": "int",
				"default_val": "1000",
				"tooltip": "tooltip not implemented"
			},
			"tol": {
				"type": "float",
				"default_val": "0.001",
				"tooltip": "tooltip not implemented"
			},
			"random_state": {
				"type": "int",
				"default_val": "2689",
				"tooltip": "tooltip not implemented"
			},
			"n_jobs": {
				"type": "int",
				"default_val": "-1",
				"tooltip": "tooltip not implemented"
			},
			"verbose": {
				"type": "bool",
				"default_val": "False",
				"tooltip": "tooltip not implemented"
			}
		},
		"code": "tr"
	},
	"huber": {
		"options": {
			"epsilon": {
				"type": "float",
				"default_val": "1.35",
				"tooltip": "tooltip not implemented"
			},
			"max_iter": {
				"type": "int",
				"default_val": "100",
				"tooltip": "tooltip not implemented"
			},
			"alpha": {
				"type": "float",
				"default_val": "0.0001",
				"tooltip": "tooltip not implemented"
			},
			"warm_start": {
				"type": "bool",
				"default_val": "False",
				"tooltip": "tooltip not implemented"
			},
			"fit_intercept": {
				"type": "bool",
				"default_val": "True",
				"tooltip": "tooltip not implemented"
			},
			"tol": {
				"type": "float",
				"default_val": "1e-05",
				"tooltip": "tooltip not implemented"
			}
		},
		"code": "huber"
	},
	"kr": {
		"options": {
			"alpha": {
				"type": "int",
				"default_val": "1",
				"tooltip": "tooltip not implemented"
			},
			"kernel": {
				"type": "string",
				"default_val": "linear",
				"tooltip": "tooltip not implemented"
			},
			"gamma": {
				"type": "NoneType",
				"default_val": "None",
				"tooltip": "tooltip not implemented"
			},
			"degree": {
				"type": "int",
				"default_val": "3",
				"tooltip": "tooltip not implemented"
			},
			"coef0": {
				"type": "int",
				"default_val": "1",
				"tooltip": "tooltip not implemented"
			},
			"kernel_params": {
				"type": "NoneType",
				"default_val": "None",
				"tooltip": "tooltip not implemented"
			}
		},
		"code": "kr"
	},
	"svm": {
		"options": {
			"kernel": {
				"type": "string",
				"default_val": "rbf",
				"tooltip": "tooltip not implemented"
			},
			"degree": {
				"type": "int",
				"default_val": "3",
				"tooltip": "tooltip not implemented"
			},
			"gamma": {
				"type": "string",
				"default_val": "scale",
				"tooltip": "tooltip not implemented"
			},
			"coef0": {
				"type": "float",
				"default_val": "0.0",
				"tooltip": "tooltip not implemented"
			},
			"tol": {
				"type": "float",
				"default_val": "0.001",
				"tooltip": "tooltip not implemented"
			},
			"C": {
				"type": "float",
				"default_val": "1.0",
				"tooltip": "tooltip not implemented"
			},
			"nu": {
				"type": "float",
				"default_val": "0.0",
				"tooltip": "tooltip not implemented"
			},
			"epsilon": {
				"type": "float",
				"default_val": "0.1",
				"tooltip": "tooltip not implemented"
			},
			"shrinking": {
				"type": "bool",
				"default_val": "True",
				"tooltip": "tooltip not implemented"
			},
			"probability": {
				"type": "bool",
				"default_val": "False",
				"tooltip": "tooltip not implemented"
			},
			"cache_size": {
				"type": "int",
				"default_val": "200",
				"tooltip": "tooltip not implemented"
			},
			"class_weight": {
				"type": "NoneType",
				"default_val": "None",
				"tooltip": "tooltip not implemented"
			},
			"verbose": {
				"type": "bool",
				"default_val": "False",
				"tooltip": "tooltip not implemented"
			},
			"max_iter": {
				"type": "int",
				"default_val": "-1",
				"tooltip": "tooltip not implemented"
			},
			"random_state": {
				"type": "NoneType",
				"default_val": "None",
				"tooltip": "tooltip not implemented"
			}
		},
		"code": "svm"
	},
	"knn": {
		"options": {
			"n_neighbors": {
				"type": "int",
				"default_val": "5",
				"tooltip": "tooltip not implemented"
			},
			"radius": {
				"type": "NoneType",
				"default_val": "None",
				"tooltip": "tooltip not implemented"
			},
			"algorithm": {
				"type": "string",
				"default_val": "auto",
				"tooltip": "tooltip not implemented"
			},
			"leaf_size": {
				"type": "int",
				"default_val": "30",
				"tooltip": "tooltip not implemented"
			},
			"metric": {
				"type": "string",
				"default_val": "minkowski",
				"tooltip": "tooltip not implemented"
			},
			"metric_params": {
				"type": "NoneType",
				"default_val": "None",
				"tooltip": "tooltip not implemented"
			},
			"p": {
				"type": "int",
				"default_val": "2",
				"tooltip": "tooltip not implemented"
			},
			"n_jobs": {
				"type": "int",
				"default_val": "-1",
				"tooltip": "tooltip not implemented"
			},
			"weights": {
				"type": "string",
				"default_val": "uniform",
				"tooltip": "tooltip not implemented"
			}
		},
		"code": "knn"
	},
	"dt": {
		"options": {
			"criterion": {
				"type": "string",
				"default_val": "squared_error",
				"tooltip": "tooltip not implemented"
			},
			"splitter": {
				"type": "string",
				"default_val": "best",
				"tooltip": "tooltip not implemented"
			},
			"max_depth": {
				"type": "NoneType",
				"default_val": "None",
				"tooltip": "tooltip not implemented"
			},
			"min_samples_split": {
				"type": "int",
				"default_val": "2",
				"tooltip": "tooltip not implemented"
			},
			"min_samples_leaf": {
				"type": "int",
				"default_val": "1",
				"tooltip": "tooltip not implemented"
			},
			"min_weight_fraction_leaf": {
				"type": "float",
				"default_val": "0.0",
				"tooltip": "tooltip not implemented"
			},
			"max_features": {
				"type": "NoneType",
				"default_val": "None",
				"tooltip": "tooltip not implemented"
			},
			"max_leaf_nodes": {
				"type": "NoneType",
				"default_val": "None",
				"tooltip": "tooltip not implemented"
			},
			"random_state": {
				"type": "int",
				"default_val": "2689",
				"tooltip": "tooltip not implemented"
			},
			"min_impurity_decrease": {
				"type": "float",
				"default_val": "0.0",
				"tooltip": "tooltip not implemented"
			},
			"class_weight": {
				"type": "NoneType",
				"default_val": "None",
				"tooltip": "tooltip not implemented"
			},
			"ccp_alpha": {
				"type": "float",
				"default_val": "0.0",
				"tooltip": "tooltip not implemented"
			}
		},
		"code": "dt"
	},
	"rf": {
		"options": {
			"base_estimator": {
				"type": "DecisionTreeRegressor",
				"default_val": "DecisionTreeRegressor()",
				"tooltip": "tooltip not implemented"
			},
			"n_estimators": {
				"type": "int",
				"default_val": "100",
				"tooltip": "tooltip not implemented"
			},
			"estimator_params": {
				"type": "tuple",
				"default_val": "('criterion', 'max_depth', 'min_samples_split', 'min_samples_leaf', 'min_weight_fraction_leaf', 'max_features', 'max_leaf_nodes', 'min_impurity_decrease', 'random_state', 'ccp_alpha')",
				"tooltip": "tooltip not implemented"
			},
			"bootstrap": {
				"type": "bool",
				"default_val": "True",
				"tooltip": "tooltip not implemented"
			},
			"oob_score": {
				"type": "bool",
				"default_val": "False",
				"tooltip": "tooltip not implemented"
			},
			"n_jobs": {
				"type": "int",
				"default_val": "-1",
				"tooltip": "tooltip not implemented"
			},
			"random_state": {
				"type": "int",
				"default_val": "2689",
				"tooltip": "tooltip not implemented"
			},
			"verbose": {
				"type": "int",
				"default_val": "0",
				"tooltip": "tooltip not implemented"
			},
			"warm_start": {
				"type": "bool",
				"default_val": "False",
				"tooltip": "tooltip not implemented"
			},
			"class_weight": {
				"type": "NoneType",
				"default_val": "None",
				"tooltip": "tooltip not implemented"
			},
			"max_samples": {
				"type": "NoneType",
				"default_val": "None",
				"tooltip": "tooltip not implemented"
			},
			"criterion": {
				"type": "string",
				"default_val": "squared_error",
				"tooltip": "tooltip not implemented"
			},
			"max_depth": {
				"type": "NoneType",
				"default_val": "None",
				"tooltip": "tooltip not implemented"
			},
			"min_samples_split": {
				"type": "int",
				"default_val": "2",
				"tooltip": "tooltip not implemented"
			},
			"min_samples_leaf": {
				"type": "int",
				"default_val": "1",
				"tooltip": "tooltip not implemented"
			},
			"min_weight_fraction_leaf": {
				"type": "float",
				"default_val": "0.0",
				"tooltip": "tooltip not implemented"
			},
			"max_features": {
				"type": "float",
				"default_val": "1.0",
				"tooltip": "tooltip not implemented"
			},
			"max_leaf_nodes": {
				"type": "NoneType",
				"default_val": "None",
				"tooltip": "tooltip not implemented"
			},
			"min_impurity_decrease": {
				"type": "float",
				"default_val": "0.0",
				"tooltip": "tooltip not implemented"
			},
			"ccp_alpha": {
				"type": "float",
				"default_val": "0.0",
				"tooltip": "tooltip not implemented"
			}
		},
		"code": "rf"
	},
	"et": {
		"options": {
			"base_estimator": {
				"type": "ExtraTreeRegressor",
				"default_val": "ExtraTreeRegressor()",
				"tooltip": "tooltip not implemented"
			},
			"n_estimators": {
				"type": "int",
				"default_val": "100",
				"tooltip": "tooltip not implemented"
			},
			"estimator_params": {
				"type": "tuple",
				"default_val": "('criterion', 'max_depth', 'min_samples_split', 'min_samples_leaf', 'min_weight_fraction_leaf', 'max_features', 'max_leaf_nodes', 'min_impurity_decrease', 'random_state', 'ccp_alpha')",
				"tooltip": "tooltip not implemented"
			},
			"bootstrap": {
				"type": "bool",
				"default_val": "False",
				"tooltip": "tooltip not implemented"
			},
			"oob_score": {
				"type": "bool",
				"default_val": "False",
				"tooltip": "tooltip not implemented"
			},
			"n_jobs": {
				"type": "int",
				"default_val": "-1",
				"tooltip": "tooltip not implemented"
			},
			"random_state": {
				"type": "int",
				"default_val": "2689",
				"tooltip": "tooltip not implemented"
			},
			"verbose": {
				"type": "int",
				"default_val": "0",
				"tooltip": "tooltip not implemented"
			},
			"warm_start": {
				"type": "bool",
				"default_val": "False",
				"tooltip": "tooltip not implemented"
			},
			"class_weight": {
				"type": "NoneType",
				"default_val": "None",
				"tooltip": "tooltip not implemented"
			},
			"max_samples": {
				"type": "NoneType",
				"default_val": "None",
				"tooltip": "tooltip not implemented"
			},
			"criterion": {
				"type": "string",
				"default_val": "squared_error",
				"tooltip": "tooltip not implemented"
			},
			"max_depth": {
				"type": "NoneType",
				"default_val": "None",
				"tooltip": "tooltip not implemented"
			},
			"min_samples_split": {
				"type": "int",
				"default_val": "2",
				"tooltip": "tooltip not implemented"
			},
			"min_samples_leaf": {
				"type": "int",
				"default_val": "1",
				"tooltip": "tooltip not implemented"
			},
			"min_weight_fraction_leaf": {
				"type": "float",
				"default_val": "0.0",
				"tooltip": "tooltip not implemented"
			},
			"max_features": {
				"type": "float",
				"default_val": "1.0",
				"tooltip": "tooltip not implemented"
			},
			"max_leaf_nodes": {
				"type": "NoneType",
				"default_val": "None",
				"tooltip": "tooltip not implemented"
			},
			"min_impurity_decrease": {
				"type": "float",
				"default_val": "0.0",
				"tooltip": "tooltip not implemented"
			},
			"ccp_alpha": {
				"type": "float",
				"default_val": "0.0",
				"tooltip": "tooltip not implemented"
			}
		},
		"code": "et"
	},
	"ada": {
		"options": {
			"base_estimator": {
				"type": "NoneType",
				"default_val": "None",
				"tooltip": "tooltip not implemented"
			},
			"n_estimators": {
				"type": "int",
				"default_val": "50",
				"tooltip": "tooltip not implemented"
			},
			"estimator_params": {
				"type": "tuple",
				"default_val": "()",
				"tooltip": "tooltip not implemented"
			},
			"learning_rate": {
				"type": "float",
				"default_val": "1.0",
				"tooltip": "tooltip not implemented"
			},
			"random_state": {
				"type": "int",
				"default_val": "2689",
				"tooltip": "tooltip not implemented"
			},
			"loss": {
				"type": "string",
				"default_val": "linear",
				"tooltip": "tooltip not implemented"
			}
		},
		"code": "ada"
	},
	"gbr": {
		"options": {
			"n_estimators": {
				"type": "int",
				"default_val": "100",
				"tooltip": "tooltip not implemented"
			},
			"learning_rate": {
				"type": "float",
				"default_val": "0.1",
				"tooltip": "tooltip not implemented"
			},
			"loss": {
				"type": "string",
				"default_val": "squared_error",
				"tooltip": "tooltip not implemented"
			},
			"criterion": {
				"type": "string",
				"default_val": "friedman_mse",
				"tooltip": "tooltip not implemented"
			},
			"min_samples_split": {
				"type": "int",
				"default_val": "2",
				"tooltip": "tooltip not implemented"
			},
			"min_samples_leaf": {
				"type": "int",
				"default_val": "1",
				"tooltip": "tooltip not implemented"
			},
			"min_weight_fraction_leaf": {
				"type": "float",
				"default_val": "0.0",
				"tooltip": "tooltip not implemented"
			},
			"subsample": {
				"type": "float",
				"default_val": "1.0",
				"tooltip": "tooltip not implemented"
			},
			"max_features": {
				"type": "NoneType",
				"default_val": "None",
				"tooltip": "tooltip not implemented"
			},
			"max_depth": {
				"type": "int",
				"default_val": "3",
				"tooltip": "tooltip not implemented"
			},
			"min_impurity_decrease": {
				"type": "float",
				"default_val": "0.0",
				"tooltip": "tooltip not implemented"
			},
			"ccp_alpha": {
				"type": "float",
				"default_val": "0.0",
				"tooltip": "tooltip not implemented"
			},
			"init": {
				"type": "NoneType",
				"default_val": "None",
				"tooltip": "tooltip not implemented"
			},
			"random_state": {
				"type": "int",
				"default_val": "2689",
				"tooltip": "tooltip not implemented"
			},
			"alpha": {
				"type": "float",
				"default_val": "0.9",
				"tooltip": "tooltip not implemented"
			},
			"verbose": {
				"type": "int",
				"default_val": "0",
				"tooltip": "tooltip not implemented"
			},
			"max_leaf_nodes": {
				"type": "NoneType",
				"default_val": "None",
				"tooltip": "tooltip not implemented"
			},
			"warm_start": {
				"type": "bool",
				"default_val": "False",
				"tooltip": "tooltip not implemented"
			},
			"validation_fraction": {
				"type": "float",
				"default_val": "0.1",
				"tooltip": "tooltip not implemented"
			},
			"n_iter_no_change": {
				"type": "NoneType",
				"default_val": "None",
				"tooltip": "tooltip not implemented"
			},
			"tol": {
				"type": "float",
				"default_val": "0.0001",
				"tooltip": "tooltip not implemented"
			}
		},
		"code": "gbr"
	},
	"mlp": {
		"options": {
			"activation": {
				"type": "string",
				"default_val": "relu",
				"tooltip": "tooltip not implemented"
			},
			"solver": {
				"type": "string",
				"default_val": "adam",
				"tooltip": "tooltip not implemented"
			},
			"alpha": {
				"type": "float",
				"default_val": "0.0001",
				"tooltip": "tooltip not implemented"
			},
			"batch_size": {
				"type": "string",
				"default_val": "auto",
				"tooltip": "tooltip not implemented"
			},
			"learning_rate": {
				"type": "string",
				"default_val": "constant",
				"tooltip": "tooltip not implemented"
			},
			"learning_rate_init": {
				"type": "float",
				"default_val": "0.001",
				"tooltip": "tooltip not implemented"
			},
			"power_t": {
				"type": "float",
				"default_val": "0.5",
				"tooltip": "tooltip not implemented"
			},
			"max_iter": {
				"type": "int",
				"default_val": "500",
				"tooltip": "tooltip not implemented"
			},
			"loss": {
				"type": "string",
				"default_val": "squared_error",
				"tooltip": "tooltip not implemented"
			},
			"hidden_layer_sizes": {
				"type": "tuple",
				"default_val": "(100,)",
				"tooltip": "tooltip not implemented"
			},
			"shuffle": {
				"type": "bool",
				"default_val": "True",
				"tooltip": "tooltip not implemented"
			},
			"random_state": {
				"type": "int",
				"default_val": "2689",
				"tooltip": "tooltip not implemented"
			},
			"tol": {
				"type": "float",
				"default_val": "0.0001",
				"tooltip": "tooltip not implemented"
			},
			"verbose": {
				"type": "bool",
				"default_val": "False",
				"tooltip": "tooltip not implemented"
			},
			"warm_start": {
				"type": "bool",
				"default_val": "False",
				"tooltip": "tooltip not implemented"
			},
			"momentum": {
				"type": "float",
				"default_val": "0.9",
				"tooltip": "tooltip not implemented"
			},
			"nesterovs_momentum": {
				"type": "bool",
				"default_val": "True",
				"tooltip": "tooltip not implemented"
			},
			"early_stopping": {
				"type": "bool",
				"default_val": "False",
				"tooltip": "tooltip not implemented"
			},
			"validation_fraction": {
				"type": "float",
				"default_val": "0.1",
				"tooltip": "tooltip not implemented"
			},
			"beta_1": {
				"type": "float",
				"default_val": "0.9",
				"tooltip": "tooltip not implemented"
			},
			"beta_2": {
				"type": "float",
				"default_val": "0.999",
				"tooltip": "tooltip not implemented"
			},
			"epsilon": {
				"type": "float",
				"default_val": "1e-08",
				"tooltip": "tooltip not implemented"
			},
			"n_iter_no_change": {
				"type": "int",
				"default_val": "10",
				"tooltip": "tooltip not implemented"
			},
			"max_fun": {
				"type": "int",
				"default_val": "15000",
				"tooltip": "tooltip not implemented"
			}
		},
		"code": "mlp"
	},
	"lightgbm": {
		"options": {
			"boosting_type": {
				"type": "string",
				"default_val": "gbdt",
				"tooltip": "tooltip not implemented"
			},
			"objective": {
				"type": "NoneType",
				"default_val": "None",
				"tooltip": "tooltip not implemented"
			},
			"num_leaves": {
				"type": "int",
				"default_val": "31",
				"tooltip": "tooltip not implemented"
			},
			"max_depth": {
				"type": "int",
				"default_val": "-1",
				"tooltip": "tooltip not implemented"
			},
			"learning_rate": {
				"type": "float",
				"default_val": "0.1",
				"tooltip": "tooltip not implemented"
			},
			"n_estimators": {
				"type": "int",
				"default_val": "100",
				"tooltip": "tooltip not implemented"
			},
			"subsample_for_bin": {
				"type": "int",
				"default_val": "200000",
				"tooltip": "tooltip not implemented"
			},
			"min_split_gain": {
				"type": "float",
				"default_val": "0.0",
				"tooltip": "tooltip not implemented"
			},
			"min_child_weight": {
				"type": "float",
				"default_val": "0.001",
				"tooltip": "tooltip not implemented"
			},
			"min_child_samples": {
				"type": "int",
				"default_val": "20",
				"tooltip": "tooltip not implemented"
			},
			"subsample": {
				"type": "float",
				"default_val": "1.0",
				"tooltip": "tooltip not implemented"
			},
			"subsample_freq": {
				"type": "int",
				"default_val": "0",
				"tooltip": "tooltip not implemented"
			},
			"colsample_bytree": {
				"type": "float",
				"default_val": "1.0",
				"tooltip": "tooltip not implemented"
			},
			"reg_alpha": {
				"type": "float",
				"default_val": "0.0",
				"tooltip": "tooltip not implemented"
			},
			"reg_lambda": {
				"type": "float",
				"default_val": "0.0",
				"tooltip": "tooltip not implemented"
			},
			"random_state": {
				"type": "int",
				"default_val": "2689",
				"tooltip": "tooltip not implemented"
			},
			"n_jobs": {
				"type": "int",
				"default_val": "-1",
				"tooltip": "tooltip not implemented"
			},
			"silent": {
				"type": "string",
				"default_val": "warn",
				"tooltip": "tooltip not implemented"
			},
			"importance_type": {
				"type": "string",
				"default_val": "split",
				"tooltip": "tooltip not implemented"
			},
			"class_weight": {
				"type": "NoneType",
				"default_val": "None",
				"tooltip": "tooltip not implemented"
			}
		},
		"code": "lightgbm"
	},
	"dummy": {
		"options": {
			"strategy": {
				"type": "string",
				"default_val": "mean",
				"tooltip": "tooltip not implemented"
			},
			"constant": {
				"type": "NoneType",
				"default_val": "None",
				"tooltip": "tooltip not implemented"
			},
			"quantile": {
				"type": "NoneType",
				"default_val": "None",
				"tooltip": "tooltip not implemented"
			}
		},
		"code": "dummy"
	}
};

export default regressionModelSettings;