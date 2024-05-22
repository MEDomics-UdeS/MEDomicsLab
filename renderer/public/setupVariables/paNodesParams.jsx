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
    input: ["dataset_loader","base_model"],
    output: ["detectron"],
    img: "detectron.png",
    title: "Detectron",
    possibleSettings: paSettings["detectron"]
  },
  med3pa: {
    type: "med3paNode",
    classes: "object model",
    nbInput: 2,
    nbOutput: 1,
    input: ["dataset_loader","base_model"],
    output: ["med3pa"],
    img: "med3pa2.png",
    title: "MED3pa",
    possibleSettings: paSettings["med3pa"]
  }, 
  det3pa: {
    type: "det3paNode",
    classes: "object model",
    nbInput: 2,
    nbOutput: 1,
    input: ["detectron","med3pa"],
    output: ["det3pa"],
    img: "results2.png",
    title: "Det3pa",
    possibleSettings: {}
  },
  evaluation: {
    type: "evaluationNode",
    classes: "object dataset run startNode",
    nbInput: 3,
    nbOutput: 1,
    input: ["detectron", "base_model","med3pa"],
    output: ["evaluation"],
    img: "evaluation.png",
    title: "Evaluation",
    possibleSettings: paSettings["evaluation"]
  },
  pipeline: {
    type: "paPipelineNode",
    classes: "object",
    nbInput: 4,
    nbOutput: 1,
    input: ["detectron", "base_model", "dataset_loader","med3pa"],
    output: ["pipeline"],
    img: "pipeline.png",
    title: "Pipeline",
    possibleSettings: {}
  },
  results: {
    type: "paResultsNode",
    classes: "object dataset run startNode",
    nbInput: 1,
    nbOutput: 0,
    input: ["pipeline"],
    output: [""],
    img: "results2.png",
    title: "Results",
    possibleSettings: {}
  }
}

export default nodesParams
