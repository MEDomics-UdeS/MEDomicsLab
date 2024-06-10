import paSettings from "./possibleSettings/med3pa/paSettings"

/* eslint-disable */
const nodesParams = {
  dataset_loader: {
    type: "datasetLoaderNode",
    classes: "object dataset run startNode",
    nbInput: 0,
    nbOutput: 1,
    input: [],
    output: ["dataset_loader"],
    img: "dataset.png",
    title: "Dataset Loader",
    possibleSettings: paSettings["dataset_loader"]
  },
  base_model: {
    type: "baseModelNode",
    classes: "object model",
    nbInput: 1,
    nbOutput: 1,
    input: ["dataset_loader"],
    output: ["base_model"],
    img: "create_model.png",
    title: "Base Model",
    possibleSettings: paSettings["dataset_loader"]
  },

  detectron: {
    type: "detectronNode",
    classes: "object model",
    nbInput: 2,
    nbOutput: 1,
    input: ["dataset_loader", "base_model"],
    output: ["detectron"],
    img: "detectron.png",
    title: "Detectron",
    possibleSettings: paSettings["detectron"]
  },
  med3pa: {
    type: "groupNode",
    classes: "object model run",
    nbInput: 2,
    nbOutput: 1,
    input: ["dataset_loader", "base_model"],
    output: ["med3pa"],
    img: "med3pa2.png",
    title: "MED3pa",
    possibleSettings: {}
  },
  evaluation: {
    type: "evaluationNode",
    classes: "object dataset run startNode",
    nbInput: 4,
    nbOutput: 1,
    input: ["detectron", "base_model", "med3pa", "det3pa"],
    output: ["evaluation"],
    img: "evaluation.png",
    title: "Evaluation",
    possibleSettings: paSettings["evaluation"]
  }
}

export default nodesParams
