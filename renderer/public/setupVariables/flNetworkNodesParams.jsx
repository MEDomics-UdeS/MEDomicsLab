import flSettings from "./possibleSettings/MEDfl/flSettings";

/* eslint-disable */
const nodesParams ={
    node: {
        type: "flClientNode",
        classes: "object",
        nbInput: 0,
        nbOutput: 1,
        input: [],
        output: ["node"],
        img: "node.png",
        title: "Node",
        possibleSettings: flSettings["dataset"]
      },

      fl_server: {
        type: "flServerNode",
        classes: "object dataset run startNode",
        nbInput: 1,
        nbOutput: 0,
        input: ["node"],
        output: ["flsetup"],
        img: "server.png",
        title: "FL Server",
        possibleSettings: flSettings["dataset"]
      }
    
}

export default nodesParams; 