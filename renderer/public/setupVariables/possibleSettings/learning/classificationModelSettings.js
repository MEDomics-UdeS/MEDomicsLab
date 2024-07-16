/* eslint-disable */
const classificationModelSettings = {
  lr: {
    options: {
      penalty: {
        type: "string",
        default_val: "l2",
        tooltip: "Specifies the norm used in the penalization ('l1' or 'l2')."
      },
      dual: {
        type: "bool",
        default_val: "False",
        tooltip: "Whether to use a dual formulation."
      },
      tol: {
        type: "float",
        default_val: "0.0001",
        tooltip: "Tolerance for stopping criteria."
      },
      C: {
        type: "float",
        default_val: "1.0",
        tooltip: "Inverse of regularization strength."
      },
      fit_intercept: {
        type: "bool",
        default_val: "True",
        tooltip: "Specifies if a constant (a.k.a. bias or intercept) should be added to the decision function."
      },
      intercept_scaling: {
        type: "int",
        default_val: "1",
        tooltip: "Scaling of the intercept."
      },
      class_weight: {
        type: "NoneType",
        default_val: "None",
        tooltip: "Weights associated with classes."
      },
      random_state: {
        type: "int",
        default_val: "1334",
        tooltip: "Seed used by the random number generator."
      },
      solver: {
        type: "string",
        default_val: "lbfgs",
        tooltip: "Algorithm to use in the optimization problem."
      },
      max_iter: {
        type: "int",
        default_val: "1000",
        tooltip: "Maximum number of iterations taken for the solvers to converge."
      },
      multi_class: {
        type: "string",
        default_val: "auto",
        tooltip: "Approach to handle multiple classes."
      },
      verbose: {
        type: "int",
        default_val: "0",
        tooltip: "Controls the verbosity."
      },
      warm_start: {
        type: "bool",
        default_val: "False",
        tooltip: "Whether to reuse the solution of the previous call to fit as initialization."
      },
      n_jobs: {
        type: "NoneType",
        default_val: "None",
        tooltip: "Number of CPU cores used when parallelizing over classes."
      },
      l1_ratio: {
        type: "NoneType",
        default_val: "None",
        tooltip: "The mixing parameter, with 0 <= l1_ratio <= 1, for elastic net regularization."
      }
    },
    code: "lr"
  },
  knn: {
    options: {
      n_neighbors: {
        type: "int",
        default_val: "5",
        tooltip: "Number of neighbors to use for querying."
      },
      radius: {
        type: "NoneType",
        default_val: "None",
        tooltip: "Radius of neighborhoods for radius-based queries."
      },
      algorithm: {
        type: "string",
        default_val: "auto",
        tooltip: "Algorithm used to compute the nearest neighbors."
      },
      leaf_size: {
        type: "int",
        default_val: "30",
        tooltip: "Leaf size passed to BallTree or KDTree."
      },
      metric: {
        type: "string",
        default_val: "minkowski",
        tooltip: "Distance metric used for the tree."
      },
      metric_params: {
        type: "NoneType",
        default_val: "None",
        tooltip: "Additional keyword arguments for the metric function."
      },
      p: {
        type: "int",
        default_val: "2",
        tooltip: "Parameter for the Minkowski metric."
      },
      n_jobs: {
        type: "int",
        default_val: "-1",
        tooltip: "Number of parallel jobs to run for neighbors search."
      },
      weights: {
        type: "string",
        default_val: "uniform",
        tooltip: "Weight function used in prediction."
      }
    },
    code: "knn"
  },
  nb: {
    options: {
      priors: {
        type: "NoneType",
        default_val: "None",
        tooltip: "Prior probabilities of the classes."
      },
      var_smoothing: {
        type: "float",
        default_val: "1e-09",
        tooltip: "Portion of the largest variance of all features added to variances for calculation stability."
      }
    },
    code: "nb"
  },
  dt: {
    options: {
      criterion: {
        type: "string",
        default_val: "gini",
        tooltip: "The function to measure the quality of a split."
      },
      splitter: {
        type: "string",
        default_val: "best",
        tooltip: "The strategy used to choose the split at each node."
      },
      max_depth: {
        type: "NoneType",
        default_val: "None",
        tooltip: "The maximum depth of the tree. If None, nodes are expanded until all leaves are pure or until all leaves contain less than min_samples_split samples."
      },
      min_samples_split: {
        type: "int",
        default_val: "2",
        tooltip: "The minimum number of samples required to split an internal node."
      },
      min_samples_leaf: {
        type: "int",
        default_val: "1",
        tooltip: "The minimum number of samples required to be at a leaf node."
      },
      min_weight_fraction_leaf: {
        type: "float",
        default_val: "0.0",
        tooltip: "The minimum weighted fraction of the sum total of weights (of all input samples) required to be at a leaf node."
      },
      max_features: {
        type: "NoneType",
        default_val: "None",
        tooltip: "The number of features to consider when looking for the best split."
      },
      max_leaf_nodes: {
        type: "NoneType",
        default_val: "None",
        tooltip: "Grow a tree with max_leaf_nodes in best-first fashion. Best nodes are defined as relative reduction in impurity."
      },
      random_state: {
        type: "int",
        default_val: "1334",
        tooltip: "The seed used by the random number generator."
      },
      min_impurity_decrease: {
        type: "float",
        default_val: "0.0",
        tooltip: "A node will be split if this split induces a decrease of the impurity greater than or equal to this value."
      },
      class_weight: {
        type: "NoneType",
        default_val: "None",
        tooltip: "Weights associated with classes in the form {class_label: weight}. If None, all classes are supposed to have weight one."
      },
      ccp_alpha: {
        type: "float",
        default_val: "0.0",
        tooltip: "Complexity parameter used for Minimal Cost-Complexity Pruning. The subtree with the largest cost complexity that is smaller than ccp_alpha will be chosen."
      }
    },
    code: "dt"
  },
  svm: {
    options: {
      loss: {
        type: "string",
        default_val: "hinge",
        tooltip: "The loss function to be used. 'hinge' is the standard SVM loss."
      },
      penalty: {
        type: "string",
        default_val: "l2",
        tooltip: "The penalty term ('l2' or 'l1') of the error term."
      },
      learning_rate: {
        type: "string",
        default_val: "optimal",
        tooltip: "The learning rate schedule. 'optimal' uses an heuristic proposed by Leon Bottou."
      },
      epsilon: {
        type: "float",
        default_val: "0.1",
        tooltip: "Epsilon in the epsilon-insensitive loss function."
      },
      alpha: {
        type: "float",
        default_val: "0.0001",
        tooltip: "Constant that multiplies the regularization term."
      },
      C: {
        type: "float",
        default_val: "1.0",
        tooltip: "Regularization parameter."
      },
      l1_ratio: {
        type: "float",
        default_val: "0.15",
        tooltip: "The ratio of l1 penalty in the 'elasticnet' regularization."
      },
      fit_intercept: {
        type: "bool",
        default_val: "True",
        tooltip: "Whether to calculate the intercept for this model."
      },
      shuffle: {
        type: "bool",
        default_val: "True",
        tooltip: "Whether or not the training data should be shuffled after each epoch."
      },
      random_state: {
        type: "int",
        default_val: "1334",
        tooltip: "The seed used by the random number generator."
      },
      verbose: {
        type: "int",
        default_val: "0",
        tooltip: "Enable verbose output when fitting the model."
      },
      eta0: {
        type: "float",
        default_val: "0.001",
        tooltip: "The initial learning rate for the 'constant', 'invscaling', or 'adaptive' schedules."
      },
      power_t: {
        type: "float",
        default_val: "0.5",
        tooltip: "The exponent for inverse scaling learning rate."
      },
      early_stopping: {
        type: "bool",
        default_val: "False",
        tooltip: "Whether to use early stopping to terminate training when validation score is not improving."
      },
      validation_fraction: {
        type: "float",
        default_val: "0.1",
        tooltip: "The proportion of training data to set aside as validation set for early stopping."
      },
      n_iter_no_change: {
        type: "int",
        default_val: "5",
        tooltip: "Number of iterations with no improvement to wait before stopping training."
      },
      warm_start: {
        type: "bool",
        default_val: "False",
        tooltip: "Whether to reuse the solution of the previous call to fit as initialization."
      },
      average: {
        type: "bool",
        default_val: "False",
        tooltip: "Whether to average the coefficients of the SVM over all the folds."
      },
      max_iter: {
        type: "int",
        default_val: "1000",
        tooltip: "The maximum number of iterations to be run."
      },
      tol: {
        type: "float",
        default_val: "0.001",
        tooltip: "Tolerance for stopping criteria."
      },
      class_weight: {
        type: "NoneType",
        default_val: "None",
        tooltip: "Weights associated with classes in the form {class_label: weight}."
      },
      n_jobs: {
        type: "int",
        default_val: "-1",
        tooltip: "The number of jobs to run in parallel."
      }
    },
    code: "svm"
  },
  rbfsvm: {
    options: {
      decision_function_shape: {
        type: "string",
        default_val: "ovr",
        tooltip: "Specifies the shape of the decision function. 'ovr' stands for one-vs-rest, while 'ovo' stands for one-vs-one."
      },
      break_ties: {
        type: "bool",
        default_val: "False",
        tooltip: "If true, decision_function_shape='ovr', and number of classes > 2, predict will break ties according to the confidence values."
      },
      kernel: {
        type: "string",
        default_val: "rbf",
        tooltip: "Specifies the kernel type to be used in the algorithm. The default is 'rbf' (Radial Basis Function)."
      },
      degree: {
        type: "int",
        default_val: "3",
        tooltip: "Degree of the polynomial kernel function ('poly'). Ignored by all other kernels."
      },
      gamma: {
        type: "string",
        default_val: "auto",
        tooltip: "Kernel coefficient for 'rbf', 'poly', and 'sigmoid'. If 'auto', it uses 1 / n_features."
      },
      coef0: {
        type: "float",
        default_val: "0.0",
        tooltip: "Independent term in kernel function. It is only significant in 'poly' and 'sigmoid'."
      },
      tol: {
        type: "float",
        default_val: "0.001",
        tooltip: "Tolerance for stopping criterion."
      },
      C: {
        type: "float",
        default_val: "1.0",
        tooltip: "Regularization parameter. The strength of the regularization is inversely proportional to C."
      },
      nu: {
        type: "float",
        default_val: "0.0",
        tooltip: "An upper bound on the fraction of margin errors and a lower bound of the fraction of support vectors."
      },
      epsilon: {
        type: "float",
        default_val: "0.0",
        tooltip: "Epsilon in the epsilon-SVR model. It specifies the epsilon-tube within which no penalty is associated in the training loss function."
      },
      shrinking: {
        type: "bool",
        default_val: "True",
        tooltip: "Whether to use the shrinking heuristic."
      },
      probability: {
        type: "bool",
        default_val: "True",
        tooltip: "Whether to enable probability estimates."
      },
      cache_size: {
        type: "int",
        default_val: "200",
        tooltip: "Specify the size of the kernel cache (in MB)."
      },
      class_weight: {
        type: "NoneType",
        default_val: "None",
        tooltip: "Set the parameter C of class i to class_weight[i]*C for SVC. If not given, all classes are supposed to have weight one."
      },
      verbose: {
        type: "bool",
        default_val: "False",
        tooltip: "Enable verbose output."
      },
      max_iter: {
        type: "int",
        default_val: "-1",
        tooltip: "Hard limit on iterations within solver, or -1 for no limit."
      },
      random_state: {
        type: "int",
        default_val: "1334",
        tooltip: "The seed of the pseudo random number generator used when shuffling the data."
      }
    },
    code: "rbfsvm"
  },
  gpc: {
    options: {
      kernel: {
        type: "NoneType",
        default_val: "None",
        tooltip: "The kernel specifying the covariance function of the GP. If None is passed, the RBF kernel is used as default."
      },
      optimizer: {
        type: "string",
        default_val: "fmin_l_bfgs_b",
        tooltip: "A string or callable that specifies the optimizer to use for optimizing the kernel's parameters. The default is 'fmin_l_bfgs_b'."
      },
      n_restarts_optimizer: {
        type: "int",
        default_val: "0",
        tooltip: "The number of restarts of the optimizer for finding the kernel’s parameters which maximize the log-marginal likelihood. The default is 0."
      },
      max_iter_predict: {
        type: "int",
        default_val: "100",
        tooltip: "The maximum number of iterations in Newton’s method for approximating the posterior during prediction."
      },
      warm_start: {
        type: "bool",
        default_val: "False",
        tooltip: "If True, reuse the solution of the last call to fit as initialization for the next call to fit."
      },
      copy_X_train: {
        type: "bool",
        default_val: "False",
        tooltip: "If True, a persistent copy of the training data is stored in the object. Otherwise, just a reference to the training data is stored."
      },
      random_state: {
        type: "int",
        default_val: "1334",
        tooltip: "The seed of the pseudo-random number generator used when shuffling the data. This affects the optimizer if applicable."
      },
      multi_class: {
        type: "string",
        default_val: "one_vs_rest",
        tooltip: "Specifies the strategy to use for multi-class classification. The default is 'one_vs_rest'."
      },
      n_jobs: {
        type: "int",
        default_val: "-1",
        tooltip: "The number of jobs to run in parallel. If -1, then the number of jobs is set to the number of cores."
      }
    },
    code: "gpc"
  },
  mlp: {
    options: {
      activation: {
        type: "string",
        default_val: "relu",
        tooltip: "Activation function for the hidden layer. Supported values are 'identity', 'logistic', 'tanh', and 'relu'."
      },
      solver: {
        type: "string",
        default_val: "adam",
        tooltip: "The solver for weight optimization. Supported values are 'lbfgs', 'sgd', and 'adam'."
      },
      alpha: {
        type: "float",
        default_val: "0.0001",
        tooltip: "L2 penalty (regularization term) parameter."
      },
      batch_size: {
        type: "string",
        default_val: "auto",
        tooltip: "Size of minibatches for stochastic optimizers. If 'auto', batch_size=min(200, n_samples)."
      },
      learning_rate: {
        type: "string",
        default_val: "constant",
        tooltip: "Learning rate schedule for weight updates. Supported values are 'constant', 'invscaling', and 'adaptive'."
      },
      learning_rate_init: {
        type: "float",
        default_val: "0.001",
        tooltip: "The initial learning rate used. It controls the step-size in updating the weights."
      },
      power_t: {
        type: "float",
        default_val: "0.5",
        tooltip: "The exponent for inverse scaling learning rate."
      },
      max_iter: {
        type: "int",
        default_val: "500",
        tooltip: "Maximum number of iterations. The solver iterates until convergence or this number of iterations is reached."
      },
      loss: {
        type: "string",
        default_val: "log_loss",
        tooltip: "The loss function to be optimized. Supported values are 'log_loss' and 'squared_loss'."
      },
      hidden_layer_sizes: {
        type: "tuple",
        default_val: "(100,)",
        tooltip: "The ith element represents the number of neurons in the ith hidden layer."
      },
      shuffle: {
        type: "bool",
        default_val: "True",
        tooltip: "Whether to shuffle samples in each iteration."
      },
      random_state: {
        type: "int",
        default_val: "1334",
        tooltip: "The seed of the pseudo-random number generator used for shuffling the data. It controls the reproducibility."
      },
      tol: {
        type: "float",
        default_val: "0.0001",
        tooltip:
          "Tolerance for the optimization. When the loss does not improve by at least tol for n_iter_no_change consecutive iterations, convergence is considered to be reached and training stops."
      },
      verbose: {
        type: "bool",
        default_val: "False",
        tooltip: "Whether to print progress messages to stdout."
      },
      warm_start: {
        type: "bool",
        default_val: "False",
        tooltip: "When set to True, reuse the solution of the previous call to fit as initialization for the next call, otherwise, just erase the previous solution."
      },
      momentum: {
        type: "float",
        default_val: "0.9",
        tooltip: "Momentum for gradient descent update. Should be between 0 and 1."
      },
      nesterovs_momentum: {
        type: "bool",
        default_val: "True",
        tooltip: "Whether to use Nesterov’s momentum."
      },
      early_stopping: {
        type: "bool",
        default_val: "False",
        tooltip: "Whether to use early stopping to terminate training when validation score is not improving."
      },
      validation_fraction: {
        type: "float",
        default_val: "0.1",
        tooltip: "The proportion of training data to set aside as validation set for early stopping."
      },
      beta_1: {
        type: "float",
        default_val: "0.9",
        tooltip: "Exponential decay rate for estimates of first moment vector in adam."
      },
      beta_2: {
        type: "float",
        default_val: "0.999",
        tooltip: "Exponential decay rate for estimates of second moment vector in adam."
      },
      epsilon: {
        type: "float",
        default_val: "1e-08",
        tooltip: "Value for numerical stability in adam."
      },
      n_iter_no_change: {
        type: "int",
        default_val: "10",
        tooltip: "Maximum number of epochs to not meet tol improvement."
      },
      max_fun: {
        type: "int",
        default_val: "15000",
        tooltip: "Maximum number of loss function calls. The solver iterates until convergence (determined by tol) or this number of loss function calls. This only impacts 'lbfgs' solver."
      }
    },
    code: "mlp"
  },
  ridge: {
    options: {
      alpha: {
        type: "float",
        default_val: "1.0",
        tooltip: "Regularization strength; must be a positive float. Larger values specify stronger regularization."
      },
      fit_intercept: {
        type: "bool",
        default_val: "True",
        tooltip: "Whether to calculate the intercept for this model. If set to False, no intercept will be used in calculations."
      },
      copy_X: {
        type: "bool",
        default_val: "True",
        tooltip: "If True, X will be copied; else, it may be overwritten."
      },
      max_iter: {
        type: "NoneType",
        default_val: "None",
        tooltip: "Maximum number of iterations for conjugate gradient solver. For 'sag' and 'lsqr' solvers, the default is 1000."
      },
      tol: {
        type: "float",
        default_val: "0.0001",
        tooltip: "Precision of the solution."
      },
      solver: {
        type: "string",
        default_val: "auto",
        tooltip: "Solver to use in the computational routines. Options are 'auto', 'svd', 'cholesky', 'lsqr', 'sparse_cg', 'sag', and 'saga'."
      },
      positive: {
        type: "bool",
        default_val: "False",
        tooltip: "When set to True, forces the coefficients to be positive."
      },
      random_state: {
        type: "int",
        default_val: "1334",
        tooltip: "The seed of the pseudo-random number generator to use when shuffling the data."
      },
      class_weight: {
        type: "NoneType",
        default_val: "None",
        tooltip: "Weights associated with classes. If not given, all classes are supposed to have weight one."
      }
    },
    code: "ridge"
  },
  rf: {
    options: {
      estimator: {
        type: "DecisionTreeClassifier",
        default_val:
          "DecisionTreeClassifier(ccp_alpha=0.0, class_weight=None, criterion='gini',\n                       max_depth=None, max_features=None, max_leaf_nodes=None,\n                       min_impurity_decrease=0.0, min_samples_leaf=1,\n                       min_samples_split=2, min_weight_fraction_leaf=0.0,\n                       random_state=None, splitter='best')",
        tooltip: "The base estimator from which the boosted ensemble is built."
      },
      n_estimators: {
        type: "int",
        default_val: "100",
        tooltip: "The number of trees in the forest."
      },
      estimator_params: {
        type: "tuple",
        default_val:
          "('criterion', 'max_depth', 'min_samples_split', 'min_samples_leaf', 'min_weight_fraction_leaf', 'max_features', 'max_leaf_nodes', 'min_impurity_decrease', 'random_state', 'ccp_alpha')",
        tooltip: "The parameters of the base estimator."
      },
      base_estimator: {
        type: "string",
        default_val: "deprecated",
        tooltip: "This parameter is deprecated and will be removed in future versions."
      },
      bootstrap: {
        type: "bool",
        default_val: "True",
        tooltip: "Whether bootstrap samples are used when building trees. If False, the whole dataset is used to build each tree."
      },
      oob_score: {
        type: "bool",
        default_val: "False",
        tooltip: "Whether to use out-of-bag samples to estimate the generalization accuracy."
      },
      n_jobs: {
        type: "int",
        default_val: "-1",
        tooltip: "The number of jobs to run in parallel. -1 means using all processors."
      },
      random_state: {
        type: "int",
        default_val: "1334",
        tooltip: "The seed used by the random number generator."
      },
      verbose: {
        type: "int",
        default_val: "0",
        tooltip: "Controls the verbosity of the tree building process."
      },
      warm_start: {
        type: "bool",
        default_val: "False",
        tooltip: "When set to True, reuse the solution of the previous call to fit and add more estimators to the ensemble, otherwise, just fit a whole new forest."
      },
      class_weight: {
        type: "NoneType",
        default_val: "None",
        tooltip: "Weights associated with classes in the form {class_label: weight}. If not given, all classes are supposed to have weight one."
      },
      max_samples: {
        type: "NoneType",
        default_val: "None",
        tooltip: "If bootstrap is True, the number of samples to draw from X to train each base estimator."
      },
      criterion: {
        type: "string",
        default_val: "gini",
        tooltip: "The function to measure the quality of a split. Supported criteria are 'gini' for the Gini impurity and 'entropy' for the information gain."
      },
      max_depth: {
        type: "NoneType",
        default_val: "None",
        tooltip: "The maximum depth of the tree. If None, then nodes are expanded until all leaves are pure or until all leaves contain less than min_samples_split samples."
      },
      min_samples_split: {
        type: "int",
        default_val: "2",
        tooltip: "The minimum number of samples required to split an internal node."
      },
      min_samples_leaf: {
        type: "int",
        default_val: "1",
        tooltip: "The minimum number of samples required to be at a leaf node."
      },
      min_weight_fraction_leaf: {
        type: "float",
        default_val: "0.0",
        tooltip: "The minimum weighted fraction of the sum total of weights (of all the input samples) required to be at a leaf node."
      },
      max_features: {
        type: "string",
        default_val: "sqrt",
        tooltip: "The number of features to consider when looking for the best split."
      },
      max_leaf_nodes: {
        type: "NoneType",
        default_val: "None",
        tooltip: "Grow a tree with max_leaf_nodes in best-first fashion. Best nodes are defined as relative reduction in impurity."
      },
      min_impurity_decrease: {
        type: "float",
        default_val: "0.0",
        tooltip: "A node will be split if this split induces a decrease of the impurity greater than or equal to this value."
      },
      ccp_alpha: {
        type: "float",
        default_val: "0.0",
        tooltip: "Complexity parameter used for Minimal Cost-Complexity Pruning. The subtree with the largest cost complexity that is smaller than ccp_alpha will be chosen."
      }
    },
    code: "rf"
  },
  qda: {
    options: {
      priors: {
        type: "NoneType",
        default_val: "None",
        tooltip: "Priors on the classes. If specified, the priors are not adjusted according to the data."
      },
      reg_param: {
        type: "float",
        default_val: "0.0",
        tooltip: "Regularizes the per-class covariance estimates by transforming S2 as (1-reg_param)*S2 + reg_param*np.eye(n_features)."
      },
      store_covariance: {
        type: "bool",
        default_val: "False",
        tooltip: "If True, explicitly store the covariance matrix of each class."
      },
      tol: {
        type: "float",
        default_val: "0.0001",
        tooltip: "Tolerance used for deciding whether the system is singular. It is used in solving the linear system."
      }
    },
    code: "qda"
  },
  ada: {
    options: {
      estimator: {
        type: "NoneType",
        default_val: "None",
        tooltip: "The base estimator from which the boosted ensemble is built."
      },
      n_estimators: {
        type: "int",
        default_val: "50",
        tooltip: "The maximum number of estimators at which boosting is terminated. In case of perfect fit, the learning procedure is stopped early."
      },
      estimator_params: {
        type: "tuple",
        default_val: "()",
        tooltip: "The parameters of the base estimator."
      },
      base_estimator: {
        type: "string",
        default_val: "deprecated",
        tooltip: "This parameter is deprecated and will be removed in future versions."
      },
      learning_rate: {
        type: "float",
        default_val: "1.0",
        tooltip: "Weight applied to each classifier at each boosting iteration. A higher learning rate increases the contribution of each classifier."
      },
      random_state: {
        type: "int",
        default_val: "1334",
        tooltip: "The seed used by the random number generator."
      },
      algorithm: {
        type: "string",
        default_val: "SAMME.R",
        tooltip: "If ‘SAMME.R’ then the underlying estimator must support calculation of class probabilities. If ‘SAMME’ then use the SAMME discrete boosting algorithm."
      }
    },
    code: "ada"
  },
  gbc: {
    options: {
      n_estimators: {
        type: "int",
        default_val: "100",
        tooltip: "The number of boosting stages to be run."
      },
      learning_rate: {
        type: "float",
        default_val: "0.1",
        tooltip: "Learning rate shrinks the contribution of each tree by learning_rate."
      },
      loss: {
        type: "string",
        default_val: "log_loss",
        tooltip: "The loss function to be optimized."
      },
      criterion: {
        type: "string",
        default_val: "friedman_mse",
        tooltip: "The function to measure the quality of a split."
      },
      min_samples_split: {
        type: "int",
        default_val: "2",
        tooltip: "The minimum number of samples required to split an internal node."
      },
      min_samples_leaf: {
        type: "int",
        default_val: "1",
        tooltip: "The minimum number of samples required to be at a leaf node."
      },
      min_weight_fraction_leaf: {
        type: "float",
        default_val: "0.0",
        tooltip: "The minimum weighted fraction of the sum total of weights required to be at a leaf node."
      },
      subsample: {
        type: "float",
        default_val: "1.0",
        tooltip: "The fraction of samples to be used for fitting the individual base learners."
      },
      max_features: {
        type: "NoneType",
        default_val: "None",
        tooltip: "The number of features to consider when looking for the best split."
      },
      max_depth: {
        type: "int",
        default_val: "3",
        tooltip: "The maximum depth of the individual regression estimators."
      },
      min_impurity_decrease: {
        type: "float",
        default_val: "0.0",
        tooltip: "A node will be split if this split induces a decrease of the impurity greater than or equal to this value."
      },
      ccp_alpha: {
        type: "float",
        default_val: "0.0",
        tooltip: "Complexity parameter used for Minimal Cost-Complexity Pruning."
      },
      init: {
        type: "NoneType",
        default_val: "None",
        tooltip: "An estimator object that is used to compute the initial predictions."
      },
      random_state: {
        type: "int",
        default_val: "1334",
        tooltip: "The seed used by the random number generator."
      },
      alpha: {
        type: "float",
        default_val: "0.9",
        tooltip: "The alpha-quantile of the huber loss function and the quantile loss function."
      },
      verbose: {
        type: "int",
        default_val: "0",
        tooltip: "Controls the verbosity when fitting and predicting."
      },
      max_leaf_nodes: {
        type: "NoneType",
        default_val: "None",
        tooltip: "Grow trees with max_leaf_nodes in best-first fashion."
      },
      warm_start: {
        type: "bool",
        default_val: "False",
        tooltip: "When set to True, reuse the solution of the previous call to fit and add more estimators to the ensemble."
      },
      validation_fraction: {
        type: "float",
        default_val: "0.1",
        tooltip: "The proportion of training data to set aside as validation set for early stopping."
      },
      n_iter_no_change: {
        type: "NoneType",
        default_val: "None",
        tooltip: "‘n_iter_no_change’ is used to decide if early stopping will be used to terminate training."
      },
      tol: {
        type: "float",
        default_val: "0.0001",
        tooltip: "The tolerance for the optimization."
      }
    },
    code: "gbc"
  },
  lda: {
    options: {
      solver: {
        type: "string",
        default_val: "svd",
        tooltip: "Solver to use for LDA. ‘svd’ is the default, ‘lsqr’ and ‘eigen’ can be used for shrinkage."
      },
      shrinkage: {
        type: "NoneType",
        default_val: "None",
        tooltip: "Shrinkage parameter for ‘lsqr’ and ‘eigen’ solvers."
      },
      priors: {
        type: "NoneType",
        default_val: "None",
        tooltip: "Priors on classes. If specified the priors are not adjusted according to the data."
      },
      n_components: {
        type: "NoneType",
        default_val: "None",
        tooltip: "Number of components (< n_classes - 1) for dimensionality reduction."
      },
      store_covariance: {
        type: "bool",
        default_val: "False",
        tooltip: "If True, explicitly store the covariance matrix of each class."
      },
      tol: {
        type: "float",
        default_val: "0.0001",
        tooltip: "Tolerance for rank estimation."
      },
      covariance_estimator: {
        type: "NoneType",
        default_val: "None",
        tooltip: "Estimator for covariance matrix."
      }
    },
    code: "lda"
  },
  et: {
    options: {
      estimator: {
        type: "ExtraTreeClassifier",
        default_val:
          "ExtraTreeClassifier(ccp_alpha=0.0, class_weight=None, criterion='gini',\n                    max_depth=None, max_features='sqrt', max_leaf_nodes=None,\n                    min_impurity_decrease=0.0, min_samples_leaf=1,\n                    min_samples_split=2, min_weight_fraction_leaf=0.0,\n                    random_state=None, splitter='random')",
        tooltip: "The base estimator from which the extra-trees are built."
      },
      n_estimators: {
        type: "int",
        default_val: "100",
        tooltip: "The number of trees in the forest."
      },
      estimator_params: {
        type: "tuple",
        default_val:
          "('criterion', 'max_depth', 'min_samples_split', 'min_samples_leaf', 'min_weight_fraction_leaf', 'max_features', 'max_leaf_nodes', 'min_impurity_decrease', 'random_state', 'ccp_alpha')",
        tooltip: "The parameters of the base estimator."
      },
      base_estimator: {
        type: "string",
        default_val: "deprecated",
        tooltip: "This parameter is deprecated and will be removed in future versions."
      },
      bootstrap: {
        type: "bool",
        default_val: "False",
        tooltip: "Whether bootstrap samples are used when building trees."
      },
      oob_score: {
        type: "bool",
        default_val: "False",
        tooltip: "Whether to use out-of-bag samples to estimate the generalization accuracy."
      },
      n_jobs: {
        type: "int",
        default_val: "-1",
        tooltip: "The number of jobs to run in parallel."
      },
      random_state: {
        type: "int",
        default_val: "1334",
        tooltip: "The seed used by the random number generator."
      },
      verbose: {
        type: "int",
        default_val: "0",
        tooltip: "Controls the verbosity when fitting and predicting."
      },
      warm_start: {
        type: "bool",
        default_val: "False",
        tooltip: "When set to True, reuse the solution of the previous call to fit and add more estimators to the ensemble."
      },
      class_weight: {
        type: "NoneType",
        default_val: "None",
        tooltip: "Weights associated with classes."
      },
      max_samples: {
        type: "NoneType",
        default_val: "None",
        tooltip: "If bootstrap is True, the number of samples to draw from X to train each base estimator."
      },
      criterion: {
        type: "string",
        default_val: "gini",
        tooltip: "The function to measure the quality of a split."
      },
      max_depth: {
        type: "NoneType",
        default_val: "None",
        tooltip: "The maximum depth of the tree."
      },
      min_samples_split: {
        type: "int",
        default_val: "2",
        tooltip: "The minimum number of samples required to split an internal node."
      },
      min_samples_leaf: {
        type: "int",
        default_val: "1",
        tooltip: "The minimum number of samples required to be at a leaf node."
      },
      min_weight_fraction_leaf: {
        type: "float",
        default_val: "0.0",
        tooltip: "The minimum weighted fraction of the sum total of weights required to be at a leaf node."
      },
      max_features: {
        type: "string",
        default_val: "sqrt",
        tooltip: "The number of features to consider when looking for the best split."
      },
      max_leaf_nodes: {
        type: "NoneType",
        default_val: "None",
        tooltip: "Grow trees with max_leaf_nodes in best-first fashion."
      },
      min_impurity_decrease: {
        type: "float",
        default_val: "0.0",
        tooltip: "A node will be split if this split induces a decrease of the impurity greater than or equal to this value."
      },
      ccp_alpha: {
        type: "float",
        default_val: "0.0",
        tooltip: "Complexity parameter used for Minimal Cost-Complexity Pruning."
      }
    },
    code: "et"
  },
  lightgbm: {
    options: {
      boosting_type: {
        type: "string",
        default_val: "gbdt",
        tooltip: "The type of boosting to be used. Options include 'gbdt', 'dart', 'goss', 'rf'."
      },
      objective: {
        type: "NoneType",
        default_val: "None",
        tooltip: "The objective function to be optimized."
      },
      num_leaves: {
        type: "int",
        default_val: "31",
        tooltip: "The maximum number of leaves in one tree."
      },
      max_depth: {
        type: "int",
        default_val: "-1",
        tooltip: "The maximum depth of the tree. -1 means no limit."
      },
      learning_rate: {
        type: "float",
        default_val: "0.1",
        tooltip: "The learning rate shrinks the contribution of each tree by this value."
      },
      n_estimators: {
        type: "int",
        default_val: "100",
        tooltip: "The number of boosting iterations."
      },
      subsample_for_bin: {
        type: "int",
        default_val: "200000",
        tooltip: "Number of samples for constructing bins."
      },
      min_split_gain: {
        type: "float",
        default_val: "0.0",
        tooltip: "The minimum gain to perform a split."
      },
      min_child_weight: {
        type: "float",
        default_val: "0.001",
        tooltip: "Minimal sum hessian in one leaf."
      },
      min_child_samples: {
        type: "int",
        default_val: "20",
        tooltip: "The minimum number of data needed in a child (leaf)."
      },
      subsample: {
        type: "float",
        default_val: "1.0",
        tooltip: "Subsample ratio of the training instance."
      },
      subsample_freq: {
        type: "int",
        default_val: "0",
        tooltip: "Frequency of subsample, <=0 means no subsample."
      },
      colsample_bytree: {
        type: "float",
        default_val: "1.0",
        tooltip: "Subsample ratio of columns when constructing each tree."
      },
      reg_alpha: {
        type: "float",
        default_val: "0.0",
        tooltip: "L1 regularization term on weights."
      },
      reg_lambda: {
        type: "float",
        default_val: "0.0",
        tooltip: "L2 regularization term on weights."
      },
      random_state: {
        type: "int",
        default_val: "1334",
        tooltip: "The seed used by the random number generator."
      },
      n_jobs: {
        type: "int",
        default_val: "-1",
        tooltip: "Number of parallel threads."
      },
      importance_type: {
        type: "string",
        default_val: "split",
        tooltip: "The type of feature importance to be used. 'split' or 'gain'."
      },
      class_weight: {
        type: "NoneType",
        default_val: "None",
        tooltip: "Weights associated with classes."
      }
    },
    code: "lightgbm"
  },
  dummy: {
    options: {
      strategy: {
        type: "string",
        default_val: "prior",
        tooltip: "The strategy to use for predicting. Options are 'stratified', 'most_frequent', 'prior', 'uniform', 'constant'."
      },
      random_state: {
        type: "int",
        default_val: "1334",
        tooltip: "The seed used by the random number generator."
      },
      constant: {
        type: "NoneType",
        default_val: "None",
        tooltip: "The constant to predict if the strategy is 'constant'."
      }
    },
    code: "dummy"
  }
}
export default classificationModelSettings
