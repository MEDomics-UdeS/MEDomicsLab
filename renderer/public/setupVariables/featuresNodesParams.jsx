import extractionFeatures from "./possibleSettings/extraction/extractionFeatures.js"

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
    possibleSettings: { defaultSettings: extractionFeatures.morph }
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
    possibleSettings: { defaultSettings: extractionFeatures.li }
  },
  is_stat: {
    type: "featuresNode",
    classes: "object ntf statistical",
    nbInput: 0,
    nbOutput: 0,
    input: [],
    output: [],
    img: "features.svg",
    title: "IS, STAT",
    possibleSettings: { defaultSettings: extractionFeatures.is_stat }
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
    possibleSettings: { defaultSettings: extractionFeatures.ih }
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
    possibleSettings: { defaultSettings: extractionFeatures.ivh }
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
    possibleSettings: { defaultSettings: extractionFeatures.glcm }
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
    possibleSettings: { defaultSettings: extractionFeatures.gldzm }
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
    possibleSettings: { defaultSettings: extractionFeatures.glrlm }
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
    possibleSettings: { defaultSettings: extractionFeatures.glszm }
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
    possibleSettings: { defaultSettings: extractionFeatures.ngldm }
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
    possibleSettings: { defaultSettings: extractionFeatures.ngtdm }
  }
}

export default nodesParams
