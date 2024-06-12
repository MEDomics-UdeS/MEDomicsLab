import paSettings from "./possibleSettings/med3pa/paSettings"

const evalNodesParams = {
  evalDetectron: {
    type: "evaluationNode",
    classes: "object dataset run startNode",
    nbInput: 1,
    nbOutput: 1,
    input: ["detectron"],
    output: ["evalDetectron"],
    img: "results.png",
    title: "Evaluation Detectron",
    possibleSettings: paSettings["evalDetectron"]
  }
}

export default evalNodesParams
