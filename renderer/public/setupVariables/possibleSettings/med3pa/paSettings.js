/* eslint-disable */

// Static Settings (Unchangeable)
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
        { name: "Reference Set", target: "", path: "" },
        { name: "Test Set", target: "", path: "" }
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
      tooltip: "<p>Model Types for IPC Model</p>",
      options: [],
      default_val: "" // Default Model
    },
    optimize: {
      type: "bool",
      tooltip: "<p>Activate / Deactivate Grid Search Optimization</p>",
      default_val: false
    },
    model_settings: {}
  },

  apcModel: {
    hyperparameters: {},
    grid_params: {},
    maximum_min_samples_ratio: {
      type: "range",
      tooltip: "<p>Maximum ratio of min_samples_ratio</p>",
      default_val: 50,
      min: 0,
      max: 50,
      step: 5
    },
    optimize: {
      type: "bool",
      tooltip: "<p>Activate / Desactivate Grid Search Optimization</p>",
      default_val: false
    }
  },
  uncertaintyMetrics: {
    uncertainty_metric: {
      type: "list",
      tooltip: "<p>Uncertainty Metric to use for Base Model Error quantification</p>",
      options: [],
      default_val: ""
    }
  },

  detectron: {
    sample_size: {
      type: "int",
      tooltip: "<p>The size of the Testing Set N</p>",
      default_val: 20 // Default value sample size
    },
    ensemble_size: {
      type: "int",
      tooltip: "<p>Number of CDCs to train</p>",
      default_val: 5 // Default value for minimum leaves ratio
    },
    num_rounds: {
      type: "int",
      tooltip: "<p>Number of rounds to train the ensemble</p>",
      default_val: 100 // Default value for minimum leaves ratio
    },
    patience: {
      type: "int",
      tooltip: "<p>Patience of the Early Stopping</p>",
      default_val: 3 // Default value for minimum leaves ratio
    },
    detectron_test: {
      type: "list-multiple",
      tooltip: "<p>The types of Detectron test to run</p>",
      options: [],
      default_val: [] // Default value for metrics
    }
  }
}

/**
 *
 * @param {string} str The input string to be formatted.
 * @returns {string} The formatted string.
 *
 *
 * @description
 * Formats a string by converting it to title case and replacing underscores with spaces.
 */
export function formatString(str) {
  return str
    .toLowerCase()
    .replace(/_/g, " ") // Replace underscores with spaces
    .replace(/\b\w/g, (char) => char.toUpperCase()) // Capitalize the first letter of each word
}

/**
 *
 * @param {string} nodeName The type of node ('ipcModelNode', 'apcModelNode', 'uncertaintyMetricsNode', or 'detectronNode').
 * @param {Object} staticSettings The static settings object to be updated.
 * @param {Object} dynamicSettings The dynamic settings object containing model-specific configurations.
 * @returns {Object} The updated static settings object.
 *
 *
 * @description
 * Merges dynamic settings retrieved from Backend into static settings based on the node type.
 */
export const mergeSettings = (nodeName, staticSettings, dynamicSettings) => {
  const mapOptions = (options) => options.map((option) => ({ name: formatString(option) }))
  if (nodeName === "ipcModelNode") {
    if (dynamicSettings.ipc_models) {
      // Iterate through ipc_models keys and add them to model_type options
      Object.keys(dynamicSettings.ipc_models).forEach((model) => {
        staticSettings.model_type.options.push({ name: model })

        // Store model-specific settings inside model_settings
        staticSettings.model_settings[model] = {
          hyperparameters: dynamicSettings.ipc_models[model].params.map((param) => ({
            ...param,
            type: param.type,
            tooltip: `<p>${param.name} for ${model}</p>`,
            default_val: param.default
          })),
          grid_params: dynamicSettings.ipc_models[model].grid_params.map((param) => ({
            ...param,
            type: param.type,
            tooltip: `<p>${param.name} for Grid Search Optimization</p>`,
            default_val: param.default
          }))
        }
      })

      // Set default_val to the first model in options
      staticSettings.model_type.default_val = staticSettings.model_type.options[0]?.name || ""
    }
  }
  if (nodeName === "apcModelNode") {
    if (dynamicSettings.apc_models) {
      Object.keys(dynamicSettings.apc_models).forEach((model) => {
        // Store model-specific settings inside apc_models
        ;(staticSettings.hyperparameters = dynamicSettings.apc_models[model].params.map((param) => ({
          ...param,
          type: param.type,
          tooltip: `<p>Parameter for ${model}</p>`,
          default_val: param.default
        }))),
          (staticSettings.grid_params = dynamicSettings.apc_models[model].grid_params.map((param) => ({
            ...param,
            type: param.type,
            tooltip: `<p>Grid parameter for ${model}</p>`,
            default_val: param.default
          })))
      })
    }
  }
  if (nodeName === "uncertaintyMetricsNode") {
    if (dynamicSettings.uncertainty_metrics) {
      staticSettings.uncertainty_metric.options = mapOptions(dynamicSettings.uncertainty_metrics)
      staticSettings.uncertainty_metric.default_val = formatString(dynamicSettings.uncertainty_metrics[0])
    }
  }
  if (nodeName === "detectronNode") {
    if (dynamicSettings.detetron_strategies) {
      staticSettings.detectron_test.options = mapOptions(dynamicSettings.detetron_strategies)
      staticSettings.detectron_test.default_val = mapOptions(dynamicSettings.detetron_strategies)
    }
  }

  return staticSettings
}

export default paSettings
