import extractionMEDimageFeatures from "./possibleSettings/extractionMEDimage/extractionMEDimageFeatures.js"

// Node parameters for Extraction module of extraction tab
const nodesParams = {
  morph: {
    type: "featuresNode",
    classes: "object ntf morphological",
    nbInput: 0,
    nbOutput: 0,
    input: [],
    output: [],
    img: "features.svg",
    title: "MORPH",
    possibleSettings: { defaultSettings: extractionMEDimageFeatures.morph }
  },
  li: {
    type: "featuresNode",
    classes: "object ntf local_intensity",
    nbInput: 0,
    nbOutput: 0,
    input: [],
    output: [],
    img: "features.svg",
    title: "LI",
    possibleSettings: { defaultSettings: extractionMEDimageFeatures.li }
  },
  stats: {
    type: "featuresNode",
    classes: "object ntf statistical",
    nbInput: 0,
    nbOutput: 0,
    input: [],
    output: [],
    img: "features.svg",
    title: "IS, STAT",
    possibleSettings: { defaultSettings: extractionMEDimageFeatures.stats }
  },
  ih: {
    type: "featuresNode",
    classes: "object ntf intensity_histogram",
    nbInput: 0,
    nbOutput: 0,
    input: [],
    output: [],
    img: "features.svg",
    title: "IH",
    possibleSettings: { defaultSettings: extractionMEDimageFeatures.ih }
  },
  ivh: {
    type: "featuresNode",
    classes: "object ntf ivh",
    nbInput: 0,
    nbOutput: 0,
    input: [],
    output: [],
    img: "features.svg",
    title: "IVH",
    possibleSettings: { defaultSettings: extractionMEDimageFeatures.ivh }
  },
  glcm: {
    type: "featuresNode",
    classes: "object tf glcm",
    nbInput: 0,
    nbOutput: 0,
    input: [],
    output: [],
    img: "features.svg",
    title: "GLCM",
    possibleSettings: { defaultSettings: extractionMEDimageFeatures.glcm }
  },
  gldzm: {
    type: "featuresNode",
    classes: "object tf gldzm",
    nbInput: 0,
    nbOutput: 0,
    input: [],
    output: [],
    img: "features.svg",
    title: "GLDZM",
    possibleSettings: { defaultSettings: extractionMEDimageFeatures.gldzm }
  },
  glrlm: {
    type: "featuresNode",
    classes: "object tf glrlm",
    nbInput: 0,
    nbOutput: 0,
    input: [],
    output: [],
    img: "features.svg",
    title: "GLRLM",
    possibleSettings: { defaultSettings: extractionMEDimageFeatures.glrlm }
  },
  glszm: {
    type: "featuresNode",
    classes: "object tf glszm",
    nbInput: 0,
    nbOutput: 0,
    input: [],
    output: [],
    img: "features.svg",
    title: "GLSZM",
    possibleSettings: { defaultSettings: extractionMEDimageFeatures.glszm }
  },
  ngldm: {
    type: "featuresNode",
    classes: "object tf ngldm",
    nbInput: 0,
    nbOutput: 0,
    input: [],
    output: [],
    img: "features.svg",
    title: "NGLDM",
    possibleSettings: { defaultSettings: extractionMEDimageFeatures.ngldm }
  },
  ngtdm: {
    type: "featuresNode",
    classes: "object tf ngtdm",
    nbInput: 0,
    nbOutput: 0,
    input: [],
    output: [],
    img: "features.svg",
    title: "NGTDM",
    possibleSettings: { defaultSettings: extractionMEDimageFeatures.ngtdm }
  }
}

export default nodesParams
