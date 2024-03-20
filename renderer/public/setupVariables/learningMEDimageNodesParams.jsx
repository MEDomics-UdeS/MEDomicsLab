import learningMEDimageDefaultSettings from "./possibleSettings/learningMEDimage/learningMEDimageDefaultSettings"
/* eslint-disable */

export const sceneDescription = {
  extension: "medml",
  extrenalFolders: ["models", "notebooks"],
  internalFolders: ["tmp", "exp"]
}

const nodesParams = {
  split : {
    type: "Split",
    classes: "object segmentation view",
    nbInput: 0,
    nbOutput: 1,
    input: [],
    output: ["split_data"],
    img: "split.png",
    title: "Split",
    possibleSettings: {
      defaultSettings: learningMEDimageDefaultSettings.split
    }
  },
  design: {
    type: "Design",
    classes: "object segmentation view",
    nbInput: 1,
    nbOutput: 1,
    input: ["split_data"],
    output: ["design_data"],
    img: "optimize.png",
    title: "Design",
    possibleSettings: {
      defaultSettings: learningMEDimageDefaultSettings.design
    }
  },
  data: {
    type: "Data",
    classes: "object segmentation view",
    nbInput: 1,
    nbOutput: 1,
    input: ["design_data"],
    output: ["data"],
    img: "dataset.png",
    title: "Data",
    possibleSettings: {
      defaultSettings: learningMEDimageDefaultSettings.data
    }
  },
  cleaning: {
    type: "Cleaning",
    classes: "object segmentation view",
    nbInput: 1,
    nbOutput: 1,
    input: ["data"],
    output: ["cleaning_data"],
    img: "clean.png",
    title: "Cleaning",
    possibleSettings: {
      defaultSettings: learningMEDimageDefaultSettings.cleaning
    }
  },
  normalization: {
    type: "Normalization",
    classes: "object segmentation view",
    nbInput: 1,
    nbOutput: 1,
    input: ["data", "data", "cleaning_data"],
    output: ["normalization_data"],
    img: "normalize.png",
    title: "Normalization",
    possibleSettings: {
      defaultSettings: learningMEDimageDefaultSettings.normalization
    }
  },
  feature_reduction: {
    type: "FeatureReduction",
    classes: "object segmentation view",
    nbInput: 1,
    nbOutput: 1,
    input: ["data", "cleaning_data", "normalization_data"],
    output: ["feature_reduction_data"],
    img: "clear.png",
    title: "Feature Reduction",
    possibleSettings: {
      defaultSettings: learningMEDimageDefaultSettings.feature_reduction
    }
  },
  radiomics_learner: {
    type: "RadiomicsLearner",
    classes: "object segmentation view",
    nbInput: 1,
    nbOutput: 1,
    input: ["feature_reduction_data", "cleaning_data", "data", "normalization_data"],
    output: ["radiomics_learner_data"],
    img: "compare_models.png",
    title: "Radiomics learner",
    possibleSettings: {
      defaultSettings: learningMEDimageDefaultSettings.radiomics_learner
    }
  },
  analyze: {
    type: "Analyze",
    classes: "object segmentation view",
    nbInput: 1,
    nbOutput: 0,
    input: ["radiomics_learner_data"],
    output: ["analyze_data"],
    img: "analyze.png",
    title: "Analyze",
    possibleSettings: {
      defaultSettings: learningMEDimageDefaultSettings.analyze
    }
  },
}

export default nodesParams
