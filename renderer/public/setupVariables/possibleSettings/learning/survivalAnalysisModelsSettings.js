var survivalAnalysisModelsSettings = {
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
                "tooltip": "int, default=-1. Number of CPU cores used when parallelizing over classes if multi_class=’ovr’”. This parameter is ignored when the solver is set to ‘liblinear’ regardless of whether ‘multi_class’ is specified or not."
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
                "tooltip": "float, default=1.0. Constant that multiplies the penalty terms."
			},
			"l1_ratio": {
				"type": "float",
				"default_val": "1.0",
                "tooltip": "float, default=1,0. The ElasticNet mixing parameter, with 0 <= l1_ratio <= 1. For l1_ratio = 0 the penalty is an L2 penalty. For l1_ratio = 1 it is an L1 penalty. For 0 < l1_ratio < 1, the penalty is a combination of L1 and L2."
			},
			"fit_intercept": {
				"type": "bool",
				"default_val": "True",
                "tooltip": "Bool. default=True. Whether to calculate the intercept for this model. If set to False, no intercept will be used in calculations (i.e. data is expected to be centered)."
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
                "tooltip": "int, default=1000. The maximum number of iterations to be run."
			},
			"copy_X": {
				"type": "bool",
				"default_val": "True",
				"tooltip": "tooltip not implemented"
			},
			"tol": {
				"type": "float",
				"default_val": "0.0001",
				"tooltip": "float, default=0.0001. Tolerance for stopping criteria."
			},
			"warm_start": {
				"type": "bool",
				"default_val": "False",
                "tooltip": "bool, default=False. When set to True, reuse the solution of the previous call to fit as initialization, otherwise, just erase the previous solution."
			},
			"positive": {
				"type": "bool",
				"default_val": "False",
				"tooltip": "tooltip not implemented"
			},
			"random_state": {
				"type": "int",
				"default_val": "4573",
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
                "tooltip": "float, default=1.0. Constant that multiplies the penalty terms."
			},
			"fit_intercept": {
				"type": "bool",
				"default_val": "True",
                "tooltip": "Bool. default=True. Whether to calculate the intercept for this model. If set to False, no intercept will be used in calculations (i.e. data is expected to be centered)."
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
                "tooltip": "NoneType, default=None. The maximum number of iterations to be run."
			},
			"tol": {
				"type": "float",
				"default_val": "0.001",
				"tooltip": "float, default=0.001. Tolerance for stopping criteria."
			},
			"solver": {
				"type": "string",
				"default_val": "auto",
                "tooltip": "string, default=’auto’. Algorithm to use in the optimization problem."
			},
			"positive": {
				"type": "bool",
				"default_val": "False",
				"tooltip": "tooltip not implemented"
			},
			"random_state": {
				"type": "int",
				"default_val": "4573",
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
                "tooltip": "float, default=1.0. Constant that multiplies the penalty terms."
			},
			"l1_ratio": {
				"type": "float",
				"default_val": "0.5",
                "tooltip": "float, default=0.5. The ElasticNet mixing parameter, with 0 <= l1_ratio <= 1. For l1_ratio = 0 the penalty is an L2 penalty. For l1_ratio = 1 it is an L1 penalty. For 0 < l1_ratio < 1, the penalty is a combination of L1 and L2."
			},
			"fit_intercept": {
				"type": "bool",
				"default_val": "True",
                "tooltip": "Bool. default=True. Whether to calculate the intercept for this model. If set to False, no intercept will be used in calculations (i.e. data is expected to be centered)."
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
                "tooltip": "int, default=1000. The maximum number of iterations to be run."
			},
			"copy_X": {
				"type": "bool",
				"default_val": "True",
				"tooltip": "tooltip not implemented"
			},
			"tol": {
				"type": "float",
				"default_val": "0.0001",
				"tooltip": "float, default=0.0001. Tolerance for stopping criteria."
			},
			"warm_start": {
				"type": "bool",
				"default_val": "False",
                "tooltip": "bool, default=False. When set to True, reuse the solution of the previous call to fit as initialization, otherwise, just erase the previous solution."
			},
			"positive": {
				"type": "bool",
				"default_val": "False",
				"tooltip": "tooltip not implemented"
			},
			"random_state": {
				"type": "int",
				"default_val": "4573",
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
                "tooltip": "Bool. default=True. Whether to calculate the intercept for this model. If set to False, no intercept will be used in calculations (i.e. data is expected to be centered)."
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
				"default_val": "4573",
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
                "tooltip": "float, default=1.0. Constant that multiplies the penalty terms."
			},
			"fit_intercept": {
				"type": "bool",
				"default_val": "True",
                "tooltip": "Bool. default=True. Whether to calculate the intercept for this model. If set to False, no intercept will be used in calculations (i.e. data is expected to be centered)."
			},
			"max_iter": {
				"type": "int",
				"default_val": "500",
                "tooltip": "int, default=500. The maximum number of iterations to be run."
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
				"default_val": "4573",
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
				"tooltip": "NoneType, default=None. Tolerance for stopping criteria."
			},
			"fit_intercept": {
				"type": "bool",
				"default_val": "True",
                "tooltip": "Bool. default=True. Whether to calculate the intercept for this model. If set to False, no intercept will be used in calculations (i.e. data is expected to be centered)."
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
				"tooltip": "float, default=0.001. Tolerance for stopping criteria."
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
                "tooltip": "Bool. default=True. Whether to calculate the intercept for this model. If set to False, no intercept will be used in calculations (i.e. data is expected to be centered)."
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
				"tooltip": "float, default=0.001. Tolerance for stopping criteria."
			},
			"fit_intercept": {
				"type": "bool",
				"default_val": "True",
                "tooltip": "Bool. default=True. Whether to calculate the intercept for this model. If set to False, no intercept will be used in calculations (i.e. data is expected to be centered)."
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
                "tooltip": "String, default=’epsilon_insensitive’. The loss function to be used. ‘Hinge’ gives a linear SVM. ‘Log_loss’ gives logistic regression, a probabilistic classifier. ‘Modified_huber’ is another smooth loss that brings tolerance to outliers as well as probability estimates. ‘Squared_hinge’ is like hinge but is quadratically penalized. ‘Perceptron’ is the linear loss used by the perceptron algorithm. The other losses, ‘Squared_error’, ‘Huber’, ‘Epsilon_insensitive’ and ‘Squared_epsilon_insensitive’ are designed for regression but can be useful in classification as well"
			},
			"penalty": {
				"type": "NoneType",
				"default_val": "None",
                "tooltip": "NoneType, default=’None’ Specifies the norm used in the penalization. The ‘l2’ penalty is the standard used in SVC. The ‘l1’ leads to coef_ vectors that are sparse."
			},
			"learning_rate": {
				"type": "string",
				"default_val": "invscaling",
                "tooltip": "String, default=’invscaling’. The learning rate schedule:‘constant’: eta = eta0‘ Pptimal’: eta = 1.0 / (alpha * (t + t0)) where t0 is chosen by a heuristic proposed by Leon Bottou. ‘Invscaling’: eta = eta0 / pow(t, power_t) ‘Adaptive’: eta = eta0, as long as the training keeps decreasing. Each time n_iter_no_change consecutive epochs fail to decrease the training loss by tol or fail to increase validation score by tol if early_stopping is True, the current learning rate is divided by 5."
			},
			"epsilon": {
				"type": "float",
				"default_val": "0.1",
				"tooltip": "tooltip not implemented"
			},
			"alpha": {
				"type": "float",
				"default_val": "0.0001",
                "tooltip": "float, default=0.0001. Constant that multiplies the penalty terms."
			},
			"C": {
				"type": "float",
				"default_val": "1.0",
                "tooltip": "float, default=1.0. Regularization parameter. The strength of the regularization is inversely proportional to C. Must be strictly positive."
			},
			"l1_ratio": {
				"type": "int",
				"default_val": "0",
				"tooltip": "tooltip not implemented"
			},
			"fit_intercept": {
				"type": "bool",
				"default_val": "True",
                "tooltip": "Bool. default=True. Whether to calculate the intercept for this model. If set to False, no intercept will be used in calculations (i.e. data is expected to be centered)."
			},
			"shuffle": {
				"type": "bool",
				"default_val": "True",
				"tooltip": "tooltip not implemented"
			},
			"random_state": {
				"type": "int",
				"default_val": "4573",
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
                "tooltip": "bool, default='False'. Use early stopping to stop fitting to a hyperparameter configuration if it performs poorly. Ignored when search_library is scikit-learn, or if the estimator does not have ‘partial_fit’ attribute. If False or None, early stopping will not be used. "
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
                "tooltip": "bool, default=False. When set to True, reuse the solution of the previous call to fit as initialization, otherwise, just erase the previous solution."
			},
			"average": {
				"type": "bool",
				"default_val": "False",
				"tooltip": "tooltip not implemented"
			},
			"max_iter": {
				"type": "int",
				"default_val": "1000",
                "tooltip": "int, default=1000. The maximum number of iterations to be run."
			},
			"tol": {
				"type": "float",
				"default_val": "0.001",
				"tooltip": "float, default=0.001. Tolerance for stopping criteria."
			}
		},
		"code": "par"
	},
	"ransac": {
		"options": {
			"estimator": {
				"type": "NoneType",
				"default_val": "None",
                "tooltip": "NoneType, default='None'. The base estimator from which the boosted ensemble is built. Support for sample weighting is required, as well as proper classes_ and n_classes_ attributes. If None, then the base estimator is DecisionTreeClassifier initialized with max_depth=1."
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
				"default_val": "4573",
				"tooltip": "tooltip not implemented"
			},
			"loss": {
				"type": "string",
				"default_val": "absolute_error",
                "tooltip": "String, default=’absolute_error’. The loss function to be used. ‘Hinge’ gives a linear SVM. ‘Log_loss’ gives logistic regression, a probabilistic classifier. ‘Modified_huber’ is another smooth loss that brings tolerance to outliers as well as probability estimates. ‘Squared_hinge’ is like hinge but is quadratically penalized. ‘Perceptron’ is the linear loss used by the perceptron algorithm. The other losses, ‘Squared_error’, ‘Huber’, ‘Epsilon_insensitive’ and ‘Squared_epsilon_insensitive’ are designed for regression but can be useful in classification as well"
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
                "tooltip": "Bool. default=True. Whether to calculate the intercept for this model. If set to False, no intercept will be used in calculations (i.e. data is expected to be centered)."
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
                "tooltip": "int, default=1000. The maximum number of iterations to be run."
			},
			"tol": {
				"type": "float",
				"default_val": "0.001",
				"tooltip": "float, default=0.001. Tolerance for stopping criteria."
			},
			"random_state": {
				"type": "int",
				"default_val": "4573",
				"tooltip": "tooltip not implemented"
			},
			"n_jobs": {
				"type": "int",
				"default_val": "-1",
                "tooltip": "int, default=-1. Number of CPU cores used when parallelizing over classes if multi_class=’ovr’”. This parameter is ignored when the solver is set to ‘liblinear’ regardless of whether ‘multi_class’ is specified or not."
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
                "tooltip": "int, default=100. The maximum number of iterations to be run."
			},
			"alpha": {
				"type": "float",
				"default_val": "0.0001",
                "tooltip": "float, default=0.0001. Constant that multiplies the penalty terms."
			},
			"warm_start": {
				"type": "bool",
				"default_val": "False",
                "tooltip": "bool, default=False. When set to True, reuse the solution of the previous call to fit as initialization, otherwise, just erase the previous solution."
			},
			"fit_intercept": {
				"type": "bool",
				"default_val": "True",
                "tooltip": "Bool. default=True. Whether to calculate the intercept for this model. If set to False, no intercept will be used in calculations (i.e. data is expected to be centered)."
			},
			"tol": {
				"type": "float",
				"default_val": "1e-05",
				"tooltip": "float, default=1e-05. Tolerance for stopping criteria."
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
				"tooltip": "float, default=0.001. Tolerance for stopping criteria."
			},
			"C": {
				"type": "float",
				"default_val": "1.0",
                "tooltip": "float, default=1.0. Regularization parameter. The strength of the regularization is inversely proportional to C. Must be strictly positive."
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
                "tooltip": "NoneType, default=None. Set the parameter C of class i to class_weight[i]*C for SVC. If not given, all classes are supposed to have weight one. The “balanced” mode uses the values of y to automatically adjust weights inversely proportional to class frequencies in the input data as n_samples / (n_classes * np.bincount(y))."
			},
			"verbose": {
				"type": "bool",
				"default_val": "False",
				"tooltip": "tooltip not implemented"
			},
			"max_iter": {
				"type": "int",
				"default_val": "-1",
                "tooltip": "int, default=-1. The maximum number of iterations to be run."
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
				"tooltip": "int, default=5. Number of neighboring samples to use for imputation."			},
			"radius": {
				"type": "NoneType",
				"default_val": "None",
                "tooltip": "NoneType, default=None. Limiting distance of neighbors to return. If radius is a float, then n_neighbors must be set to None."
			},
			"algorithm": {
				"type": "string",
				"default_val": "auto",
                "tooltip": "String, default=’auto’. Algorithm used to compute the nearest neighbors:‘ball_tree’ will use BallTree.‘kd_tree’ will use KDTree.‘brute’ will use a brute-force search.‘auto’ will attempt to decide the most appropriate algorithm based on the values passed to fit method. (default)"
			},
			"leaf_size": {
				"type": "int",
				"default_val": "30",
                "tooltip": "int, default=30. Leaf size passed to BallTree or KDTree. This can affect the speed of the construction and query, as well as the memory required to store the tree. The optimal value depends on the nature of the problem."
			},
			"metric": {
				"type": "string",
				"default_val": "minkowski",
                "tooltip": "String, default=’minkowski’. Distance metric for searching neighbors."
			},
			"metric_params": {
				"type": "NoneType",
				"default_val": "None",
                "tooltip": "NoneType, default=None. Additional keyword arguments for the metric function."
			},
			"p": {
				"type": "int",
				"default_val": "2",
                "tooltip": "float, default=2. Parameter for the Minkowski metric from pairwise_distances. When p = 1, this is equivalent to using manhattan_distance (l1), and euclidean_distance (l2) for p = 2. For arbitrary p, minkowski_distance (l_p) is used."
			},
			"n_jobs": {
				"type": "int",
				"default_val": "-1",
                "tooltip": "int, default=-1. Number of CPU cores used when parallelizing over classes if multi_class=’ovr’”. This parameter is ignored when the solver is set to ‘liblinear’ regardless of whether ‘multi_class’ is specified or not."
			},
			"weights": {
				"type": "string",
				"default_val": "uniform",
                "tooltip": "String, default=’uniform’. Weight function used in prediction. Possible values: ‘uniform’ : Uniform weights. All points in each neighborhood are weighted equally. ‘Distance’ : weight points by the inverse of their distance. in this case, closer neighbors of a query point will have a greater influence than neighbors which are further away. Callable : a user-defined function which accepts an array of distances, and returns an array of the same shape containing the weights."
			}
		},
		"code": "knn"
	},
	"dt": {
		"options": {
			"criterion": {
				"type": "string",
				"default_val": "squared_error",
                "tooltip": "String, default=”squared_error”. The function to measure the quality of a split. Supported criteria are “gini” for the Gini impurity and “log_loss” and “entropy” both for the Shannon information gain"
			},
			"splitter": {
				"type": "string",
				"default_val": "best",
                "tooltip": "String, default=”best”. The strategy used to choose the split at each node. Supported strategies are “best” to choose the best split and “random” to choose the best random split."
			},
			"max_depth": {
				"type": "NoneType",
				"default_val": "None",
                "tooltip": "NoneType, default=None. The maximum depth of the tree. If None, then nodes are expanded until all leaves are pure or until all leaves contain less than min_samples_split samples."
			},
			"min_samples_split": {
				"type": "int",
				"default_val": "2",
				"tooltip": "int, default=2. The minimum number of samples required to split an internal node:"
			},
			"min_samples_leaf": {
				"type": "int",
				"default_val": "1",
                "tooltip": "int, default=1. The minimum number of samples required to be at a leaf node. A split point at any depth will only be considered if it leaves at least min_samples_leaf training samples in each of the left and right branches. This may have the effect of smoothing the model, especially in regression."
			},
			"min_weight_fraction_leaf": {
				"type": "float",
				"default_val": "0.0",
                "tooltip": "float, default=0.0. The minimum weighted fraction of the sum total of weights (of all the input samples) required to be at a leaf node. Samples have equal weight when sample_weight is not provided."
			},
			"max_features": {
				"type": "NoneType",
				"default_val": "None",
                "tooltip": "NoneType, default=”None”. The number of features to consider when looking for the best split: If int, then consider max_features features at each split. If float, then max_features is a fraction and max(1, int(max_features * n_features_in_)) features are considered at each split. If “sqrt”, then max_features=sqrt(n_features).If “log2”, then max_features=log2(n_features) If None, then max_features=n_features."
			},
			"max_leaf_nodes": {
				"type": "NoneType",
				"default_val": "None",
                "tooltip": "NoneType, default=None. Grow a tree with max_leaf_nodes in best-first fashion. Best nodes are defined as relative reduction in impurity. If None then unlimited number of leaf nodes."
			},
			"random_state": {
				"type": "int",
				"default_val": "4573",
				"tooltip": "tooltip not implemented"
			},
			"min_impurity_decrease": {
				"type": "float",
				"default_val": "0.0",
                "tooltip": "float, default=0.0. A node will be split if this split induces a decrease of the impurity greater than or equal to this value."
			},
			"class_weight": {
				"type": "NoneType",
				"default_val": "None",
                "tooltip": "NoneType, default=None. Set the parameter C of class i to class_weight[i]*C for SVC. If not given, all classes are supposed to have weight one. The “balanced” mode uses the values of y to automatically adjust weights inversely proportional to class frequencies in the input data as n_samples / (n_classes * np.bincount(y))."
			},
			"ccp_alpha": {
				"type": "float",
				"default_val": "0.0",
                "tooltip": "float, default=0.0. Complexity parameter used for Minimal Cost-Complexity Pruning. The subtree with the largest cost complexity that is smaller than ccp_alpha will be chosen. By default, no pruning is performed."
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
                "tooltip": "int, default=-1. Number of CPU cores used when parallelizing over classes if multi_class=’ovr’”. This parameter is ignored when the solver is set to ‘liblinear’ regardless of whether ‘multi_class’ is specified or not."
			},
			"random_state": {
				"type": "int",
				"default_val": "4573",
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
                "tooltip": "bool, default=False. When set to True, reuse the solution of the previous call to fit as initialization, otherwise, just erase the previous solution."
			},
			"class_weight": {
				"type": "NoneType",
				"default_val": "None",
                "tooltip": "NoneType, default=None. Set the parameter C of class i to class_weight[i]*C for SVC. If not given, all classes are supposed to have weight one. The “balanced” mode uses the values of y to automatically adjust weights inversely proportional to class frequencies in the input data as n_samples / (n_classes * np.bincount(y))."
			},
			"max_samples": {
				"type": "NoneType",
				"default_val": "None",
				"tooltip": "tooltip not implemented"
			},
			"criterion": {
				"type": "string",
				"default_val": "squared_error",
                "tooltip": "String, default=”squared_error”. The function to measure the quality of a split. Supported criteria are “gini” for the Gini impurity and “log_loss” and “entropy” both for the Shannon information gain"
			},
			"max_depth": {
				"type": "NoneType",
				"default_val": "None",
                "tooltip": "NoneType, default=None. The maximum depth of the tree. If None, then nodes are expanded until all leaves are pure or until all leaves contain less than min_samples_split samples."
			},
			"min_samples_split": {
				"type": "int",
				"default_val": "2",
				"tooltip": "int, default=2. The minimum number of samples required to split an internal node:"
			},
			"min_samples_leaf": {
				"type": "int",
				"default_val": "1",
                "tooltip": "int, default=1. The minimum number of samples required to be at a leaf node. A split point at any depth will only be considered if it leaves at least min_samples_leaf training samples in each of the left and right branches. This may have the effect of smoothing the model, especially in regression."
			},
			"min_weight_fraction_leaf": {
				"type": "float",
				"default_val": "0.0",
                "tooltip": "float, default=0.0. The minimum weighted fraction of the sum total of weights (of all the input samples) required to be at a leaf node. Samples have equal weight when sample_weight is not provided."
			},
			"max_features": {
				"type": "float",
				"default_val": "1.0",
                "tooltip": "float, default=1,0. The number of features to consider when looking for the best split: If int, then consider max_features features at each split. If float, then max_features is a fraction and max(1, int(max_features * n_features_in_)) features are considered at each split. If “sqrt”, then max_features=sqrt(n_features).If “log2”, then max_features=log2(n_features) If None, then max_features=n_features."
			},
			"max_leaf_nodes": {
				"type": "NoneType",
				"default_val": "None",
                "tooltip": "NoneType, default=None. Grow a tree with max_leaf_nodes in best-first fashion. Best nodes are defined as relative reduction in impurity. If None then unlimited number of leaf nodes."
			},
			"min_impurity_decrease": {
				"type": "float",
				"default_val": "0.0",
                "tooltip": "float, default=0.0. A node will be split if this split induces a decrease of the impurity greater than or equal to this value."
			},
			"ccp_alpha": {
				"type": "float",
				"default_val": "0.0",
                "tooltip": "float, default=0.0. Complexity parameter used for Minimal Cost-Complexity Pruning. The subtree with the largest cost complexity that is smaller than ccp_alpha will be chosen. By default, no pruning is performed."
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
                "tooltip": "int, default=-1. Number of CPU cores used when parallelizing over classes if multi_class=’ovr’”. This parameter is ignored when the solver is set to ‘liblinear’ regardless of whether ‘multi_class’ is specified or not."
			},
			"random_state": {
				"type": "int",
				"default_val": "4573",
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
                "tooltip": "bool, default=False. When set to True, reuse the solution of the previous call to fit as initialization, otherwise, just erase the previous solution."
			},
			"class_weight": {
				"type": "NoneType",
				"default_val": "None",
                "tooltip": "NoneType, default=None. Set the parameter C of class i to class_weight[i]*C for SVC. If not given, all classes are supposed to have weight one. The “balanced” mode uses the values of y to automatically adjust weights inversely proportional to class frequencies in the input data as n_samples / (n_classes * np.bincount(y))."
			},
			"max_samples": {
				"type": "NoneType",
				"default_val": "None",
				"tooltip": "tooltip not implemented"
			},
			"criterion": {
				"type": "string",
				"default_val": "squared_error",
                "tooltip": "String, default=”squared_error”. The function to measure the quality of a split. Supported criteria are “gini” for the Gini impurity and “log_loss” and “entropy” both for the Shannon information gain"
			},
			"max_depth": {
				"type": "NoneType",
				"default_val": "None",
                "tooltip": "NoneType, default=None. The maximum depth of the tree. If None, then nodes are expanded until all leaves are pure or until all leaves contain less than min_samples_split samples."
			},
			"min_samples_split": {
				"type": "int",
				"default_val": "2",
				"tooltip": "int, default=2. The minimum number of samples required to split an internal node:"
			},
			"min_samples_leaf": {
				"type": "int",
				"default_val": "1",
                "tooltip": "int, default=1. The minimum number of samples required to be at a leaf node. A split point at any depth will only be considered if it leaves at least min_samples_leaf training samples in each of the left and right branches. This may have the effect of smoothing the model, especially in regression."
			},
			"min_weight_fraction_leaf": {
				"type": "float",
				"default_val": "0.0",
                "tooltip": "float, default=0.0. The minimum weighted fraction of the sum total of weights (of all the input samples) required to be at a leaf node. Samples have equal weight when sample_weight is not provided."
			},
			"max_features": {
				"type": "float",
				"default_val": "1.0",
                "tooltip": "float, default=1,0. The number of features to consider when looking for the best split: If int, then consider max_features features at each split. If float, then max_features is a fraction and max(1, int(max_features * n_features_in_)) features are considered at each split. If “sqrt”, then max_features=sqrt(n_features).If “log2”, then max_features=log2(n_features) If None, then max_features=n_features."
			},
			"max_leaf_nodes": {
				"type": "NoneType",
				"default_val": "None",
                "tooltip": "NoneType, default=None. Grow a tree with max_leaf_nodes in best-first fashion. Best nodes are defined as relative reduction in impurity. If None then unlimited number of leaf nodes."
			},
			"min_impurity_decrease": {
				"type": "float",
				"default_val": "0.0",
                "tooltip": "float, default=0.0. A node will be split if this split induces a decrease of the impurity greater than or equal to this value."
			},
			"ccp_alpha": {
				"type": "float",
				"default_val": "0.0",
                "tooltip": "float, default=0.0. Complexity parameter used for Minimal Cost-Complexity Pruning. The subtree with the largest cost complexity that is smaller than ccp_alpha will be chosen. By default, no pruning is performed."
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
                "tooltip": "float, default=1.0. Weight applied to each classifier at each boosting iteration. A higher learning rate increases the contribution of each classifier. There is a trade-off between the learning_rate and n_estimators parameters. Values must be in the range (0.0, inf)."
			},
			"random_state": {
				"type": "int",
				"default_val": "4573",
				"tooltip": "tooltip not implemented"
			},
			"loss": {
				"type": "string",
				"default_val": "linear",
                "tooltip": "String, default=’linear’. The loss function to be used. ‘Hinge’ gives a linear SVM. ‘Log_loss’ gives logistic regression, a probabilistic classifier. ‘Modified_huber’ is another smooth loss that brings tolerance to outliers as well as probability estimates. ‘Squared_hinge’ is like hinge but is quadratically penalized. ‘Perceptron’ is the linear loss used by the perceptron algorithm. The other losses, ‘Squared_error’, ‘Huber’, ‘Epsilon_insensitive’ and ‘Squared_epsilon_insensitive’ are designed for regression but can be useful in classification as well"
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
                "tooltip": "float, default=0.1. Weight applied to each classifier at each boosting iteration. A higher learning rate increases the contribution of each classifier. There is a trade-off between the learning_rate and n_estimators parameters. Values must be in the range (0.0, inf)."
			},
			"loss": {
				"type": "string",
				"default_val": "squared_error",
                "tooltip": "String, default=’squared_error’. The loss function to be used. ‘Hinge’ gives a linear SVM. ‘Log_loss’ gives logistic regression, a probabilistic classifier. ‘Modified_huber’ is another smooth loss that brings tolerance to outliers as well as probability estimates. ‘Squared_hinge’ is like hinge but is quadratically penalized. ‘Perceptron’ is the linear loss used by the perceptron algorithm. The other losses, ‘Squared_error’, ‘Huber’, ‘Epsilon_insensitive’ and ‘Squared_epsilon_insensitive’ are designed for regression but can be useful in classification as well"
			},
			"criterion": {
				"type": "string",
				"default_val": "friedman_mse",
                "tooltip": "String, default=”friedman_mse”. The function to measure the quality of a split. Supported criteria are “gini” for the Gini impurity and “log_loss” and “entropy” both for the Shannon information gain"
			},
			"min_samples_split": {
				"type": "int",
				"default_val": "2",
				"tooltip": "int, default=2. The minimum number of samples required to split an internal node:"
			},
			"min_samples_leaf": {
				"type": "int",
				"default_val": "1",
                "tooltip": "int, default=1. The minimum number of samples required to be at a leaf node. A split point at any depth will only be considered if it leaves at least min_samples_leaf training samples in each of the left and right branches. This may have the effect of smoothing the model, especially in regression."
			},
			"min_weight_fraction_leaf": {
				"type": "float",
				"default_val": "0.0",
                "tooltip": "float, default=0.0. The minimum weighted fraction of the sum total of weights (of all the input samples) required to be at a leaf node. Samples have equal weight when sample_weight is not provided."
			},
			"subsample": {
				"type": "float",
				"default_val": "1.0",
				"tooltip": "tooltip not implemented"
			},
			"max_features": {
				"type": "NoneType",
				"default_val": "None",
                "tooltip": "NoneType, default=”None”. The number of features to consider when looking for the best split: If int, then consider max_features features at each split. If float, then max_features is a fraction and max(1, int(max_features * n_features_in_)) features are considered at each split. If “sqrt”, then max_features=sqrt(n_features).If “log2”, then max_features=log2(n_features) If None, then max_features=n_features."
			},
			"max_depth": {
				"type": "int",
				"default_val": "3",
                "tooltip": "int, default=3. The maximum depth of the tree. If None, then nodes are expanded until all leaves are pure or until all leaves contain less than min_samples_split samples."
			},
			"min_impurity_decrease": {
				"type": "float",
				"default_val": "0.0",
                "tooltip": "float, default=0.0. A node will be split if this split induces a decrease of the impurity greater than or equal to this value."
			},
			"ccp_alpha": {
				"type": "float",
				"default_val": "0.0",
                "tooltip": "float, default=0.0. Complexity parameter used for Minimal Cost-Complexity Pruning. The subtree with the largest cost complexity that is smaller than ccp_alpha will be chosen. By default, no pruning is performed."
			},
			"init": {
				"type": "NoneType",
				"default_val": "None",
				"tooltip": "tooltip not implemented"
			},
			"random_state": {
				"type": "int",
				"default_val": "4573",
				"tooltip": "tooltip not implemented"
			},
			"alpha": {
				"type": "float",
				"default_val": "0.9",
                "tooltip": "float, default=0.9. Constant that multiplies the penalty terms."
			},
			"verbose": {
				"type": "int",
				"default_val": "0",
				"tooltip": "tooltip not implemented"
			},
			"max_leaf_nodes": {
				"type": "NoneType",
				"default_val": "None",
                "tooltip": "NoneType, default=None. Grow a tree with max_leaf_nodes in best-first fashion. Best nodes are defined as relative reduction in impurity. If None then unlimited number of leaf nodes."
			},
			"warm_start": {
				"type": "bool",
				"default_val": "False",
                "tooltip": "bool, default=False. When set to True, reuse the solution of the previous call to fit as initialization, otherwise, just erase the previous solution."
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
				"tooltip": "float, default=0.0001. Tolerance for stopping criteria."
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
                "tooltip": "string, default=’adam’. Algorithm to use in the optimization problem."
			},
			"alpha": {
				"type": "float",
				"default_val": "0.0001",
                "tooltip": "float, default=0.0001. Constant that multiplies the penalty terms."
			},
			"batch_size": {
				"type": "string",
				"default_val": "auto",
				"tooltip": "tooltip not implemented"
			},
			"learning_rate": {
				"type": "string",
				"default_val": "constant",
                "tooltip": "String, default=’constant’. The learning rate schedule:‘constant’: eta = eta0‘ Pptimal’: eta = 1.0 / (alpha * (t + t0)) where t0 is chosen by a heuristic proposed by Leon Bottou. ‘Invscaling’: eta = eta0 / pow(t, power_t) ‘Adaptive’: eta = eta0, as long as the training keeps decreasing. Each time n_iter_no_change consecutive epochs fail to decrease the training loss by tol or fail to increase validation score by tol if early_stopping is True, the current learning rate is divided by 5."
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
                "tooltip": "int, default=500. The maximum number of iterations to be run."
			},
			"loss": {
				"type": "string",
				"default_val": "squared_error",
                "tooltip": "String, default=’squared_error’. The loss function to be used. ‘Hinge’ gives a linear SVM. ‘Log_loss’ gives logistic regression, a probabilistic classifier. ‘Modified_huber’ is another smooth loss that brings tolerance to outliers as well as probability estimates. ‘Squared_hinge’ is like hinge but is quadratically penalized. ‘Perceptron’ is the linear loss used by the perceptron algorithm. The other losses, ‘Squared_error’, ‘Huber’, ‘Epsilon_insensitive’ and ‘Squared_epsilon_insensitive’ are designed for regression but can be useful in classification as well"
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
				"default_val": "4573",
				"tooltip": "tooltip not implemented"
			},
			"tol": {
				"type": "float",
				"default_val": "0.0001",
				"tooltip": "float, default=0.0001. Tolerance for stopping criteria."
			},
			"verbose": {
				"type": "bool",
				"default_val": "False",
				"tooltip": "tooltip not implemented"
			},
			"warm_start": {
				"type": "bool",
				"default_val": "False",
                "tooltip": "bool, default=False. When set to True, reuse the solution of the previous call to fit as initialization, otherwise, just erase the previous solution."
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
                "tooltip": "bool, default='False'. Use early stopping to stop fitting to a hyperparameter configuration if it performs poorly. Ignored when search_library is scikit-learn, or if the estimator does not have ‘partial_fit’ attribute. If False or None, early stopping will not be used. "
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
                "tooltip": "int, default=-1. The maximum depth of the tree. If None, then nodes are expanded until all leaves are pure or until all leaves contain less than min_samples_split samples."
			},
			"learning_rate": {
				"type": "float",
				"default_val": "0.1",
                "tooltip": "float, default=0.1. Weight applied to each classifier at each boosting iteration. A higher learning rate increases the contribution of each classifier. There is a trade-off between the learning_rate and n_estimators parameters. Values must be in the range (0.0, inf)."
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
				"default_val": "4573",
				"tooltip": "tooltip not implemented"
			},
			"n_jobs": {
				"type": "int",
				"default_val": "-1",
                "tooltip": "int, default=-1. Number of CPU cores used when parallelizing over classes if multi_class=’ovr’”. This parameter is ignored when the solver is set to ‘liblinear’ regardless of whether ‘multi_class’ is specified or not."
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
                "tooltip": "NoneType, default=None. Set the parameter C of class i to class_weight[i]*C for SVC. If not given, all classes are supposed to have weight one. The “balanced” mode uses the values of y to automatically adjust weights inversely proportional to class frequencies in the input data as n_samples / (n_classes * np.bincount(y))."
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

export default survivalAnalysisModelsSettings;