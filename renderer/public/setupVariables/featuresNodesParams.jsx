// Node parameters for Extraction module of extraction tab
const nodesParams = {
  morphological: {
    type: "featuresNode",
    classes: "object ntf morphological",
    img: "features.svg",
    title: "MORPH",
    possibleSettings: {},
  },
  local_intensity: {
    type: "featuresNode",
    classes: "object ntf local_intensity",
    img: "features.svg",
    title: "LI",
    possibleSettings: {},
  },
  statistical: {
    type: "featuresNode",
    classes: "object ntf statistical",
    img: "features.svg",
    title: "IS, STAT",
    possibleSettings: {},
  },
  intensity_histogram: {
    type: "featuresNode",
    classes: "object ntf intensity_histogram",
    img: "features.svg",
    title: "IH",
    possibleSettings: {},
  },
  ivh: {
    type: "featuresNode",
    classes: "object ntf ivh",
    img: "features.svg",
    title: "IVH",
    possibleSettings: {},
  },
  glcm: {
    type: "featuresNode",
    classes: "object tf glcm",
    img: "features.svg",
    title: "GLCM",
    possibleSettings: {},
  },
  gldzm: {
    type: "featuresNode",
    classes: "object tf gldzm",
    img: "features.svg",
    title: "GLDZM",
    possibleSettings: {},
  },
  glcm: {
    type: "featuresNode",
    classes: "object tf glrlm",
    img: "features.svg",
    title: "GLRLM",
    possibleSettings: {},
  },
  glszm: {
    type: "featuresNode",
    classes: "object tf glszm",
    img: "features.svg",
    title: "GLSZM",
    possibleSettings: {},
  },
  ngldm: {
    type: "featuresNode",
    classes: "object tf ngldm",
    img: "features.svg",
    title: "NGLDM",
    possibleSettings: {},
  },
  ngtdm: {
    type: "featuresNode",
    classes: "object tf ngtdm",
    img: "features.svg",
    title: "NGTDM",
    possibleSettings: {},
  },
};

export default nodesParams;
