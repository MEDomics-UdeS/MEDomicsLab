import classificationSettings from "./possibleSettings/learning/classificationSettings"
import regressionSettings from "./possibleSettings/learning/regressionSettings"
import classificationModelsSettings from "./possibleSettings/learning/classificationModelSettings"
import regressionModelsSettings from "./possibleSettings/learning/regressionModelSettings"
/* eslint-disable */

const nodesParams = {
  dataset: {
    type: "standardNode",
    classes: "object dataset run startNode",
    nbInput: 0,
    nbOutput: 1,
    input: [],
    output: ["dataset"],
    img: "dataset.png",
    title: "Dataset",
    possibleSettings: {
      classification: classificationSettings["dataset"],
      regression: regressionSettings["dataset"]
    }
  },
  clean: {
    type: "standardNode",
    classes: "action clean run",
    nbInput: 1,
    nbOutput: 1,
    input: ["dataset"],
    output: ["dataset"],
    img: "clean.png",
    title: "Clean",
    possibleSettings: { classification: classificationSettings["clean"], regression: regressionSettings["clean"] }
  },
  model: {
    type: "selectionNode",
    classes: "object model",
    nbInput: 0,
    nbOutput: 1,
    input: [],
    output: ["model_config"],
    img: "model.png",
    title: "Model",
    possibleSettings: { classification: classificationModelsSettings, regression: regressionModelsSettings }
  },
  train_model: {
    type: "standardNode",
    classes: "action create_model run",
    nbInput: 2,
    nbOutput: 1,
    input: ["dataset", "model_config"],
    output: ["model"],
    img: "create_model.png",
    title: "Train model",
    possibleSettings: { classification: classificationSettings["create_model"], regression: regressionSettings["create_model"] }
  },
  compare_models: {
    type: "standardNode",
    classes: "action compare_models run",
    nbInput: 1,
    nbOutput: 1,
    input: ["dataset"],
    output: ["model"],
    img: "compare_models.png",
    title: "Compare models",
    possibleSettings: { classification: classificationSettings["compare_models"], regression: regressionSettings["compare_models"] }
  },
  load_model: {
    type: "standardNode",
    classes: "action load_model run",
    nbInput: 1,
    nbOutput: 1,
    input: ["dataset"],
    output: ["model"],
    img: "load_model.png",
    title: "Load model",
    possibleSettings: { classification: classificationSettings["load_model"], regression: regressionSettings["load_model"] }
  },
  optimize: {
    type: "groupNode",
    classes: "action optimize run",
    nbInput: 1,
    nbOutput: 1,
    input: ["model"],
    output: ["model"],
    img: "optimize.png",
    title: "Optimize",
    possibleSettings: { classification: classificationSettings["optimize"], regression: regressionSettings["optimize"] }
  },
  analyze: {
    type: "selectionNode",
    classes: "action analyze run endNode",
    nbInput: 1,
    nbOutput: 0,
    input: ["model"],
    output: [],
    img: "analyze.png",
    title: "Analyze",
    possibleSettings: { classification: classificationSettings["analyze"], regression: regressionSettings["analyze"] }
  },
  finalize: {
    type: "standardNode",
    classes: "action finalize run",
    nbInput: 1,
    nbOutput: 1,
    input: ["model"],
    output: ["model"],
    img: "finalize.png",
    title: "Finalize",
    possibleSettings: { classification: classificationSettings["finalize"], regression: regressionSettings["finalize"] }
  },
  save_model: {
    type: "standardNode",
    classes: "action save_model run endNode",
    nbInput: 1,
    nbOutput: 0,
    input: ["model"],
    output: [],
    img: "save_model.png",
    title: "Save model",
    possibleSettings: { classification: classificationSettings["save_model"], regression: regressionSettings["save_model"] }
  }
}

export default nodesParams
