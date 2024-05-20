import extractionMEDimageDefaultSettings from "./possibleSettings/extractionMEDimage/extractionMEDimageDefaultSettings"

export const sceneDescription = {
  extension: "medimg",
  extrenalFolders: [],
  internalFolders: ["tmp", "exp"]
}

// Node parameters for Home module of extraction tab
const nodesParams = {
  input: {
    type: "standardNode",
    classes: "object input upload",
    nbInput: 0,
    nbOutput: 1,
    input: [],
    output: ["input_data"],
    img: "input.svg",
    title: "Input",
    possibleSettings: {
      defaultSettings: extractionMEDimageDefaultSettings.input
    }
  },
  segmentation: {
    type: "segmentationNode",
    classes: "object segmentation view run",
    nbInput: 1,
    nbOutput: 1,
    input: ["input_data"],
    output: ["segmentation_data"],
    img: "segmentation.svg",
    title: "Segmentation",
    possibleSettings: {
      defaultSettings: extractionMEDimageDefaultSettings.segmentation
    }
  },
  interpolation: {
    type: "standardNode",
    classes: "object interpolation view run",
    nbInput: 1,
    nbOutput: 1,
    input: ["segmentation_data"],
    output: ["interpolation_data"],
    img: "interpolation.svg",
    title: "Interpolation",
    possibleSettings: {
      defaultSettings: extractionMEDimageDefaultSettings.interpolation
    }
  },
  re_segmentation: {
    type: "standardNode",
    classes: "object re_segmentation view run",
    nbInput: 1,
    nbOutput: 1,
    input: ["segmentation_data", "interpolation_data"],
    output: ["re_segmentation_data"],
    img: "segmentation.svg",
    title: "Re-Segmentation",
    possibleSettings: {
      defaultSettings: extractionMEDimageDefaultSettings.re_segmentation
    }
  },
  filter: {
    type: "filterNode",
    classes: "object filter view run",
    nbInput: 1,
    nbOutput: 1,
    input: ["interpolation_data", "segmentation_data", "re_segmentation_data"],
    output: ["filter_data"],
    img: "filter.svg",
    title: "Filter",
    possibleSettings: {
      defaultSettings: extractionMEDimageDefaultSettings.filter
    }
  },
  roi_extraction: {
    type: "standardNode",
    classes: "object roi_extraction view run",
    nbInput: 1,
    nbOutput: 1,
    input: ["interpolation_data", "re_segmentation_data", "filter_data"],
    output: ["roi_extraction_data"],
    img: "roi_extraction.svg",
    title: "ROI extraction",
    possibleSettings: {}
  },
  discretization: {
    type: "standardNode",
    classes: "object discretization view run",
    nbInput: 1,
    nbOutput: 1,
    input: ["roi_extraction_data"],
    output: ["discretization_data"],
    img: "discretization.svg",
    title: "Discretization",
    possibleSettings: {
      defaultSettings: extractionMEDimageDefaultSettings.discretization
    }
  },
  extraction: {
    type: "extractionNode",
    classes: "object extraction run",
    nbInput: 1,
    nbOutput: 0,
    input: ["re_segmentation_data", "filter_data", "roi_extraction_data", "discretization_data"],
    output: [],
    img: "extraction.svg",
    title: "Extraction",
    possibleSettings: {}
  }
}

export default nodesParams
