/* eslint-disable camelcase */

import paSettings from "./possibleSettings/med3pa/paSettings"

const paModelsNodesParams = {
  uncertainty_metric: {
    type: "uncertaintyMetricsNode",
    classes: "object dataset startNode",
    nbInput: 0,
    nbOutput: 1,
    input: [],
    output: ["uncertainty_metric"],
    img: "uncertainty1.png",
    title: "Uncertainty Metric",
    possibleSettings: paSettings["uncertaintyMetrics"]
  },
  ipc_model: {
    type: "ipcModelNode",
    classes: "object model",
    nbInput: 1,
    nbOutput: 1,
    input: ["uncertainty_metric"],
    output: ["ipc_model"],
    img: "ipc.png",
    title: "IPC Model",
    possibleSettings: paSettings["ipcModel"]
  },
  apc_model: {
    type: "apcModelNode",
    classes: "object model",
    nbInput: 1,
    nbOutput: 1,
    input: ["ipc_model"],
    output: ["apc_model"],
    img: "apc.png",
    title: "APC Model",
    possibleSettings: paSettings["apcModel"]
  },
  mpc_model: {
    type: "mpcModelNode",
    classes: "object model",
    nbInput: 2,
    nbOutput: 0,
    input: ["ipc_model", "apc_model"],
    output: [],
    img: "mpc.jpg",
    title: "MPC Model",
    possibleSettings: {}
  },
  detectron_profiles: {
    type: "detectronNode",
    classes: "object model",
    nbInput: 1,
    nbOutput: 0,
    input: ["apc_model"],
    output: [],
    img: "detectron.png",
    title: "Detectron Profiles",
    possibleSettings: paSettings["detectron"]
  }
}

export default paModelsNodesParams
