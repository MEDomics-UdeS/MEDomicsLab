/* eslint-disable */
const classificationModelSettings = {
    "lr": {
        "options": {
            "penalty": {
                "type": "string",
                "default_val": "l2",
                "tooltip": "tooltip not implemented"
            },
            "dual": {
                "type": "bool",
                "default_val": "False",
                "tooltip": "tooltip not implemented"
            },
            "tol": {
                "type": "float",
                "default_val": "0.0001",
                "tooltip": "tooltip not implemented"
            },
            "C": {
                "type": "float",
                "default_val": "1.0",
                "tooltip": "tooltip not implemented"
            },
            "fit_intercept": {
                "type": "bool",
                "default_val": "True",
                "tooltip": "tooltip not implemented"
            },
            "intercept_scaling": {
                "type": "int",
                "default_val": "1",
                "tooltip": "tooltip not implemented"
            },
            "class_weight": {
                "type": "NoneType",
                "default_val": "None",
                "tooltip": "tooltip not implemented"
            },
            "random_state": {
                "type": "int",
                "default_val": "1334",
                "tooltip": "tooltip not implemented"
            },
            "solver": {
                "type": "string",
                "default_val": "lbfgs",
                "tooltip": "tooltip not implemented"
            },
            "max_iter": {
                "type": "int",
                "default_val": "1000",
                "tooltip": "tooltip not implemented"
            },
            "multi_class": {
                "type": "string",
                "default_val": "auto",
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
            "n_jobs": {
                "type": "NoneType",
                "default_val": "None",
                "tooltip": "tooltip not implemented"
            },
            "l1_ratio": {
                "type": "NoneType",
                "default_val": "None",
                "tooltip": "tooltip not implemented"
            }
        },
        "code": "lr"
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
    "nb": {
        "options": {
            "priors": {
                "type": "NoneType",
                "default_val": "None",
                "tooltip": "tooltip not implemented"
            },
            "var_smoothing": {
                "type": "float",
                "default_val": "1e-09",
                "tooltip": "tooltip not implemented"
            }
        },
        "code": "nb"
    },
    "dt": {
        "options": {
            "criterion": {
                "type": "string",
                "default_val": "gini",
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
                "default_val": "1334",
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
    "svm": {
        "options": {
            "loss": {
                "type": "string",
                "default_val": "hinge",
                "tooltip": "tooltip not implemented"
            },
            "penalty": {
                "type": "string",
                "default_val": "l2",
                "tooltip": "tooltip not implemented"
            },
            "learning_rate": {
                "type": "string",
                "default_val": "optimal",
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
                "type": "float",
                "default_val": "0.15",
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
                "default_val": "1334",
                "tooltip": "tooltip not implemented"
            },
            "verbose": {
                "type": "int",
                "default_val": "0",
                "tooltip": "tooltip not implemented"
            },
            "eta0": {
                "type": "float",
                "default_val": "0.001",
                "tooltip": "tooltip not implemented"
            },
            "power_t": {
                "type": "float",
                "default_val": "0.5",
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
            },
            "class_weight": {
                "type": "NoneType",
                "default_val": "None",
                "tooltip": "tooltip not implemented"
            },
            "n_jobs": {
                "type": "int",
                "default_val": "-1",
                "tooltip": "tooltip not implemented"
            }
        },
        "code": "svm"
    },
    "rbfsvm": {
        "options": {
            "decision_function_shape": {
                "type": "string",
                "default_val": "ovr",
                "tooltip": "tooltip not implemented"
            },
            "break_ties": {
                "type": "bool",
                "default_val": "False",
                "tooltip": "tooltip not implemented"
            },
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
                "default_val": "auto",
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
                "default_val": "0.0",
                "tooltip": "tooltip not implemented"
            },
            "shrinking": {
                "type": "bool",
                "default_val": "True",
                "tooltip": "tooltip not implemented"
            },
            "probability": {
                "type": "bool",
                "default_val": "True",
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
                "type": "int",
                "default_val": "1334",
                "tooltip": "tooltip not implemented"
            }
        },
        "code": "rbfsvm"
    },
    "gpc": {
        "options": {
            "kernel": {
                "type": "NoneType",
                "default_val": "None",
                "tooltip": "tooltip not implemented"
            },
            "optimizer": {
                "type": "string",
                "default_val": "fmin_l_bfgs_b",
                "tooltip": "tooltip not implemented"
            },
            "n_restarts_optimizer": {
                "type": "int",
                "default_val": "0",
                "tooltip": "tooltip not implemented"
            },
            "max_iter_predict": {
                "type": "int",
                "default_val": "100",
                "tooltip": "tooltip not implemented"
            },
            "warm_start": {
                "type": "bool",
                "default_val": "False",
                "tooltip": "tooltip not implemented"
            },
            "copy_X_train": {
                "type": "bool",
                "default_val": "False",
                "tooltip": "tooltip not implemented"
            },
            "random_state": {
                "type": "int",
                "default_val": "1334",
                "tooltip": "tooltip not implemented"
            },
            "multi_class": {
                "type": "string",
                "default_val": "one_vs_rest",
                "tooltip": "tooltip not implemented"
            },
            "n_jobs": {
                "type": "int",
                "default_val": "-1",
                "tooltip": "tooltip not implemented"
            }
        },
        "code": "gpc"
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
                "default_val": "log_loss",
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
                "default_val": "1334",
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
                "default_val": "0.0001",
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
                "default_val": "1334",
                "tooltip": "tooltip not implemented"
            },
            "class_weight": {
                "type": "NoneType",
                "default_val": "None",
                "tooltip": "tooltip not implemented"
            }
        },
        "code": "ridge"
    },
    "rf": {
        "options": {
            "estimator": {
                "type": "DecisionTreeClassifier",
                "default_val": "DecisionTreeClassifier(ccp_alpha=0.0, class_weight=None, criterion='gini',\n                       max_depth=None, max_features=None, max_leaf_nodes=None,\n                       min_impurity_decrease=0.0, min_samples_leaf=1,\n                       min_samples_split=2, min_weight_fraction_leaf=0.0,\n                       random_state=None, splitter='best')",
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
                "tooltip": "tooltip not implemented"
            },
            "random_state": {
                "type": "int",
                "default_val": "1334",
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
                "default_val": "gini",
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
                "type": "string",
                "default_val": "sqrt",
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
    "qda": {
        "options": {
            "priors": {
                "type": "NoneType",
                "default_val": "None",
                "tooltip": "tooltip not implemented"
            },
            "reg_param": {
                "type": "float",
                "default_val": "0.0",
                "tooltip": "tooltip not implemented"
            },
            "store_covariance": {
                "type": "bool",
                "default_val": "False",
                "tooltip": "tooltip not implemented"
            },
            "tol": {
                "type": "float",
                "default_val": "0.0001",
                "tooltip": "tooltip not implemented"
            }
        },
        "code": "qda"
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
                "default_val": "1334",
                "tooltip": "tooltip not implemented"
            },
            "algorithm": {
                "type": "string",
                "default_val": "SAMME.R",
                "tooltip": "tooltip not implemented"
            }
        },
        "code": "ada"
    },
    "gbc": {
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
                "default_val": "log_loss",
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
                "default_val": "1334",
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
        "code": "gbc"
    },
    "lda": {
        "options": {
            "solver": {
                "type": "string",
                "default_val": "svd",
                "tooltip": "tooltip not implemented"
            },
            "shrinkage": {
                "type": "NoneType",
                "default_val": "None",
                "tooltip": "tooltip not implemented"
            },
            "priors": {
                "type": "NoneType",
                "default_val": "None",
                "tooltip": "tooltip not implemented"
            },
            "n_components": {
                "type": "NoneType",
                "default_val": "None",
                "tooltip": "tooltip not implemented"
            },
            "store_covariance": {
                "type": "bool",
                "default_val": "False",
                "tooltip": "tooltip not implemented"
            },
            "tol": {
                "type": "float",
                "default_val": "0.0001",
                "tooltip": "tooltip not implemented"
            },
            "covariance_estimator": {
                "type": "NoneType",
                "default_val": "None",
                "tooltip": "tooltip not implemented"
            }
        },
        "code": "lda"
    },
    "et": {
        "options": {
            "estimator": {
                "type": "ExtraTreeClassifier",
                "default_val": "ExtraTreeClassifier(ccp_alpha=0.0, class_weight=None, criterion='gini',\n                    max_depth=None, max_features='sqrt', max_leaf_nodes=None,\n                    min_impurity_decrease=0.0, min_samples_leaf=1,\n                    min_samples_split=2, min_weight_fraction_leaf=0.0,\n                    random_state=None, splitter='random')",
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
                "tooltip": "tooltip not implemented"
            },
            "random_state": {
                "type": "int",
                "default_val": "1334",
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
                "default_val": "gini",
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
                "type": "string",
                "default_val": "sqrt",
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
                "default_val": "1334",
                "tooltip": "tooltip not implemented"
            },
            "n_jobs": {
                "type": "int",
                "default_val": "-1",
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
                "default_val": "prior",
                "tooltip": "tooltip not implemented"
            },
            "random_state": {
                "type": "int",
                "default_val": "1334",
                "tooltip": "tooltip not implemented"
            },
            "constant": {
                "type": "NoneType",
                "default_val": "None",
                "tooltip": "tooltip not implemented"
            }
        },
        "code": "dummy"
    }
};
 export default classificationModelSettings;