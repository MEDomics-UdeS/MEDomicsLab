import classificationSettings from "./possibleSettings/learning/classificationSettings";
import regressionSettings from "./possibleSettings/learning/regressionSettings";
import classificationModelsSettings from "./possibleSettings/learning/classificationModelSettings"
import regressionModelsSettings from "./possibleSettings/learning/regressionModelSettings"
import flSettings from "./possibleSettings/MEDfl/flSettings";

/* eslint-disable */
const nodesParams ={
    dataset: {
        type: "datasetNode",
        classes: "object dataset run startNode",
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
        possibleSettings: flSettings["dataset"]
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
        possibleSettings: flSettings["dataset"]
      },
      fl_dataset: {
        type: "datasetNode",
        classes: "object dataset run startNode",
        nbInput: 1,
        nbOutput: 1,
        input: ["fl_setup"],
        output: ["fl_dataset"],
        img: "fldatabase.png",
        title: "FL Dataset",
        possibleSettings: flSettings["dataset"]
      },
      model: {
        type: "selectionNode",
        classes: "object model",
        nbInput: 1,
        nbOutput: 1,
        input: ["fl_setup"],
        output: ["model"],
        img: "create_model.png",
        title: "Model",
        possibleSettings: flSettings["dataset"]
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
        possibleSettings: flSettings["dataset"]
      },

      fl_strategy: {
         type: "datasetNode",
        classes: "object dataset run startNode",
        nbInput: 1,
        nbOutput: 1,
        input: ["fl_setup"],
        output: ["fl_strategy"],
        img: "strategy.png",
        title: "FL Strategy",
        possibleSettings: flSettings["dataset"]
      },
      fl_pipeline: {
       type: "datasetNode",
       classes: "object dataset run startNode",
       nbInput: 3,
       nbOutput: 1,
       input: ["fl_strategy", "model" , "fl_dataset"],
       output: ["fl_pipeline"],
       img: "pipeline.png",
       title: "FL Pipeline",
       possibleSettings: flSettings["dataset"]       
     },
     results: {
      type: "datasetNode",
     classes: "object dataset run startNode",
     nbInput: 1,
     nbOutput: 1,
     input: ["fl_pipeline"],
     output: ["results"],
     img: "results.png",
     title: "Results",
     possibleSettings: flSettings["dataset"]
   },
}

export default nodesParams; 