/* eslint-disable */
const regressionModelSettings = {
    "lr": {
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
                "tooltip": "Bool. default=True. Whether to calculate the intercept for this model. If set to False, no intercept will be used in calculations (i.e. data is expected to be centered)."
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
                "default_val": "8771",
                "tooltip": "int, default=8771. Controls the pseudo random number generation for shuffling the data for the dual coordinate descent (if dual=True). When dual=False the underlying implementation of LinearSVC is not random and random_state has no effect on the results. Pass an int for reproducible output across multiple function calls."
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
                "tooltip": "Bool. default=True. Whether to calculate the intercept for this model. If set to False, no intercept will be used in calculations (i.e. data is expected to be centered)."
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
                "default_val": "0.0001",
                "tooltip": "float, default=0.0001. Tolerance for stopping criteria."
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
                "default_val": "8771",
                "tooltip": "int, default=8771. Controls the pseudo random number generation for shuffling the data for the dual coordinate descent (if dual=True). When dual=False the underlying implementation of LinearSVC is not random and random_state has no effect on the results. Pass an int for reproducible output across multiple function calls."
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
                "tooltip": "Bool. default=True. Whether to calculate the intercept for this model. If set to False, no intercept will be used in calculations (i.e. data is expected to be centered)."
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
                "default_val": "8771",
                "tooltip": "int, default=8771. Controls the pseudo random number generation for shuffling the data for the dual coordinate descent (if dual=True). When dual=False the underlying implementation of LinearSVC is not random and random_state has no effect on the results. Pass an int for reproducible output across multiple function calls."
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
                "default_val": "8771",
                "tooltip": "int, default=8771. Controls the pseudo random number generation for shuffling the data for the dual coordinate descent (if dual=True). When dual=False the underlying implementation of LinearSVC is not random and random_state has no effect on the results. Pass an int for reproducible output across multiple function calls."
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
                "default_val": "8771",
                "tooltip": "int, default=8771. Controls the pseudo random number generation for shuffling the data for the dual coordinate descent (if dual=True). When dual=False the underlying implementation of LinearSVC is not random and random_state has no effect on the results. Pass an int for reproducible output across multiple function calls."
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
                "tooltip": "float, default=None. Tolerance for stopping criteria."
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
                "tooltip": "{‘l1’, ‘l2’}, default=’None’ Specifies the norm used in the penalization. The ‘l2’ penalty is the standard used in SVC. The ‘l1’ leads to coef_ vectors that are sparse."
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
                "default_val": "8771",
                "tooltip": "int, default=8771. Controls the pseudo random number generation for shuffling the data for the dual coordinate descent (if dual=True). When dual=False the underlying implementation of LinearSVC is not random and random_state has no effect on the results. Pass an int for reproducible output across multiple function calls."
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
                "default_val": "8771",
                "tooltip": "int, default=8771. Controls the pseudo random number generation for shuffling the data for the dual coordinate descent (if dual=True). When dual=False the underlying implementation of LinearSVC is not random and random_state has no effect on the results. Pass an int for reproducible output across multiple function calls."
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
                "default_val": "8771",
                "tooltip": "int, default=8771. Controls the pseudo random number generation for shuffling the data for the dual coordinate descent (if dual=True). When dual=False the underlying implementation of LinearSVC is not random and random_state has no effect on the results. Pass an int for reproducible output across multiple function calls."
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
                "tooltip": "tooltip not implemented"
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
                "tooltip": "NoneType, default=None. Controls the pseudo random number generation for shuffling the data for the dual coordinate descent (if dual=True). When dual=False the underlying implementation of LinearSVC is not random and random_state has no effect on the results. Pass an int for reproducible output across multiple function calls."
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
                "tooltip": "int, default=-1. Number of CPU cores used when parallelizing over classes if multi_class=’ovr’”. This parameter is ignored when the solver is set to ‘liblinear’ regardless of whether ‘multi_class’ is specified or not."
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
                "default_val": "8771",
                "tooltip": "int, default=8771. Controls the pseudo random number generation for shuffling the data for the dual coordinate descent (if dual=True). When dual=False the underlying implementation of LinearSVC is not random and random_state has no effect on the results. Pass an int for reproducible output across multiple function calls."
            },
            "min_impurity_decrease": {
                "type": "float",
                "default_val": "0.0",
                "tooltip": "tooltip not implemented"
            },
            "class_weight": {
                "type": "NoneType",
                "default_val": "None",
                "tooltip": "NoneType, default=None. Set the parameter C of class i to class_weight[i]*C for SVC. If not given, all classes are supposed to have weight one. The “balanced” mode uses the values of y to automatically adjust weights inversely proportional to class frequencies in the input data as n_samples / (n_classes * np.bincount(y))."
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
            "estimator": {
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
            "base_estimator": {
                "type": "string",
                "default_val": "deprecated",
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
                "default_val": "8771",
                "tooltip": "int, default=8771. Controls the pseudo random number generation for shuffling the data for the dual coordinate descent (if dual=True). When dual=False the underlying implementation of LinearSVC is not random and random_state has no effect on the results. Pass an int for reproducible output across multiple function calls."
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
            "estimator": {
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
            "base_estimator": {
                "type": "string",
                "default_val": "deprecated",
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
                "default_val": "8771",
                "tooltip": "int, default=8771. Controls the pseudo random number generation for shuffling the data for the dual coordinate descent (if dual=True). When dual=False the underlying implementation of LinearSVC is not random and random_state has no effect on the results. Pass an int for reproducible output across multiple function calls."
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
            "estimator": {
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
            "base_estimator": {
                "type": "string",
                "default_val": "deprecated",
                "tooltip": "tooltip not implemented"
            },
            "learning_rate": {
                "type": "float",
                "default_val": "1.0",
                "tooltip": "tooltip not implemented"
            },
            "random_state": {
                "type": "int",
                "default_val": "8771",
                "tooltip": "int, default=8771. Controls the pseudo random number generation for shuffling the data for the dual coordinate descent (if dual=True). When dual=False the underlying implementation of LinearSVC is not random and random_state has no effect on the results. Pass an int for reproducible output across multiple function calls."
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
                "default_val": "8771",
                "tooltip": "int, default=8771. Controls the pseudo random number generation for shuffling the data for the dual coordinate descent (if dual=True). When dual=False the underlying implementation of LinearSVC is not random and random_state has no effect on the results. Pass an int for reproducible output across multiple function calls."
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
                "tooltip": "int, default=500. The maximum number of iterations to be run."
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
                "default_val": "8771",
                "tooltip": "int, default=8771. Controls the pseudo random number generation for shuffling the data for the dual coordinate descent (if dual=True). When dual=False the underlying implementation of LinearSVC is not random and random_state has no effect on the results. Pass an int for reproducible output across multiple function calls."
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
                "default_val": "8771",
                "tooltip": "int, default=8771. Controls the pseudo random number generation for shuffling the data for the dual coordinate descent (if dual=True). When dual=False the underlying implementation of LinearSVC is not random and random_state has no effect on the results. Pass an int for reproducible output across multiple function calls."
            },
            "n_jobs": {
                "type": "int",
                "default_val": "-1",
                "tooltip": "int, default=-1. Number of CPU cores used when parallelizing over classes if multi_class=’ovr’”. This parameter is ignored when the solver is set to ‘liblinear’ regardless of whether ‘multi_class’ is specified or not."
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
 export default regressionModelSettings;