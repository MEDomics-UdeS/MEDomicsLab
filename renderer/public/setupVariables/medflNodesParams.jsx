import flSettings from "./possibleSettings/MEDfl/flSettings"

/* eslint-disable */
const nodesParams = {
  dataset: {
    type: "masterDatasetNode",
    classes: "object dataset startNode",
    nbInput: 0,
    nbOutput: 1,
    input: [],
    output: ["dataset"],
    img: "dataset.png",
    title: "Dataset",
    possibleSettings: flSettings["dataset"]
  },

  network: {
    type: "groupNode",
    classes: "object",
    nbInput: 1,
    nbOutput: 1,
    input: ["dataset"],
    output: ["network"],
    img: "network.png",
    title: "Network",
    possibleSettings: {}
  },
  fl_setup: {
    type: "flSetupNode",
    classes: "object ",
    nbInput: 1,
    nbOutput: 3,
    input: ["network"],
    output: ["fl_setup"],
    img: "flsetup.png",
    title: "FL Setup",
    possibleSettings: {}
  },
  fl_dataset: {
    type: "flDatasetNode",
    classes: "object dataset",
    nbInput: 1,
    nbOutput: 1,
    input: ["fl_setup"],
    output: ["fl_dataset"],
    img: "fldatabase.png",
    title: "FL Dataset",
    possibleSettings: {}
  },
  model: {
    type: "flModelNode",
    classes: "object model",
    nbInput: 1,
    nbOutput: 1,
    input: ["fl_setup"],
    output: ["model"],
    img: "create_model.png",
    title: "Model",
    possibleSettings: {}
  },

  optimize: {
    type: "flOptimizeNode",
    classes: "action optimize run",
    nbInput: 1,
    nbOutput: 1,
    input: ["model"],
    output: ["model"],
    img: "optimize.png",
    title: "Optimize",
    possibleSettings: {}
  },

  fl_strategy: {
    type: "flStrategyNode",
    classes: "object",
    nbInput: 1,
    nbOutput: 1,
    input: ["fl_setup"],
    output: ["fl_strategy"],
    img: "strategy.png",
    title: "FL Strategy",
    possibleSettings: {}
  },
  fl_pipeline: {
    type: "flPipelineNode",
    classes: "object ",
    nbInput: 3,
    nbOutput: 1,
    input: ["fl_strategy", "model", "fl_dataset"],
    output: ["fl_pipeline"],
    img: "pipeline.png",
    title: "FL Pipeline",
    possibleSettings: {}
  },
  results: {
    type: "flResultsNode",
    classes: "object dataset ",
    nbInput: 1,
    nbOutput: 0,
    input: ["fl_pipeline"],
    output: [""],
    img: "results.png",
    title: "Results",
    possibleSettings: {}
  }
}

export default nodesParams
