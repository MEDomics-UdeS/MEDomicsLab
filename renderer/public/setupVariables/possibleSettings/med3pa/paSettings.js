/* eslint-disable */
const paSettings = {
  dataset_loader: {
    options: {
      ignore_features: {
        type: "custom-list",
        tooltip: "<p>ignore_features param can be used to ignore features during preprocessing\nand model training. It takes a list of strings with column names that are\nto be ignored.</p>\n",
        default_val: "None"
      }
    },
    datasets: {
      files: [
        { name: "Training Set", target: "", path: "" },
        { name: "Validation Set", target: "", path: "" },
        { name: "Test Set", target: "", path: "" },
        { name: "Evaluation Set", target: "", path: "" }
      ],
      tooltip: "<p>Select your main Datasets</p>"
    }
  },
  base_model: {
    file: {
      name: "Training Set",
      path: ""
    }
  },
  ipcModel: {
    model_type: {
      type: "list",
      tooltip: "Model Types for IPC Model",
      options: [{ name: "Random Forest Regressor" }, { name: "XGBoost" }, { name: "Extra Trees Regressor" }],
      default_val: "Random Forest Regressor" // Default Model
    }
  },

  apcModel: {
    tree_depth: {
      type: "range",
      tooltip: "Depth of the decision tree for med3pa",
      min: 0,
      max: 10,
      step: 1,
      default_val: 4 // Default value for tree depth
    },
    min_leaves_ratio: {
      type: "range",
      tooltip: "Minimum ratio of leaves for med3pa",
      min: 0,
      max: 1,
      step: 0.1,
      default_val: 0.5 // Default value for minimum leaves ratio
    }
  },
  uncertaintyMetrics: {
    uncertainty_metric: {
      type: "list",
      tooltip: "Uncertainty Metric to use for Base Model Error quantification",
      options: [{ name: "Mean Square Error (MSE)" }, { name: "Mean Absolute Error (MAE)" }],
      default_val: "Mean Absolute Error (MAE)"
    }
  },

  detectron: {
    sample_size: {
      type: "int",
      tooltip: "The size of the Testing Set N",
      default_val: 20 // Default value sample size
    },
    ensemble_size: {
      type: "int",
      tooltip: "Number of CDCs to train",
      default_val: 5 // Default value for minimum leaves ratio
    },
    num_rounds: {
      type: "int",
      tooltip: "Number of rounds to train the ensemble",
      default_val: 100 // Default value for minimum leaves ratio
    },
    patience: {
      type: "int",
      tooltip: "Patience of the Early Stopping",
      default_val: 3 // Default value for minimum leaves ratio
    },
    detectron_test: {
      type: "list-multiple",
      tooltip: "The types of Detectron test to run",
      options: [{ name: "Detectron Disagreement" }, { name: "Detecton with Mann-Whitney" }, { name: "Detectron Entropy" }, { name: "Detectron with KS-test" }],
      default_val: [{ name: "Detectron Disagreement" }, { name: "Detecton with Mann-Whitney" }] // Default value for metrics
    }
  }
}

export default paSettings
