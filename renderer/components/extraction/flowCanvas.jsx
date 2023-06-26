import React, {
  useState,
  useCallback,
  useMemo,
  useEffect,
  use,
  MouseEvent,
} from "react";
import { Button } from "react-bootstrap";
import { toast } from "react-toastify";
import Form from "react-bootstrap/Form";
import ReactFlow, {
  useNodesState,
  useEdgesState,
  useReactFlow,
  addEdge,
} from "reactflow";
import WorkflowBase from "../flow/workflowBase";
import TreeMenu from "react-simple-tree-menu"; // TODO: https://www.npmjs.com/package/react-simple-tree-menu change plus sign to chevron
import {
  loadJsonSync,
  downloadJson,
} from "../../utilities/fileManagementUtils";
import { requestJson } from "../../utilities/requests";
import * as Icon from "react-bootstrap-icons";
import EditableLabel from "react-simple-editlabel";
import ProgressBar from "react-bootstrap/ProgressBar";

// Import node types
import InputNode from "./nodesTypes/inputNode";
import StandardNode from "./nodesTypes/standardNode";
import ExtractionNode from "./nodesTypes/extractionNode";
import SegmentationNode from "./nodesTypes/segmentationNode";
import FilterNode from "./nodesTypes/filterNode";

// Import node parameters
import nodesParams from "../../public/setupVariables/allNodesParams";

// Import buttons
import UtilityButtons from "./buttonsTypes/utilityButtons";
import ResultsButton from "./buttonsTypes/resultsButton";

const staticNodesParams = nodesParams; // represents static nodes parameters

/**
 *
 * @param {*} array input array
 * @returns an array without duplicates
 */
function arrayUnique(array) {
  var a = array.concat();
  for (var i = 0; i < a.length; ++i) {
    for (var j = i + 1; j < a.length; ++j) {
      if (a[i].targetId == a[j].targetId && a[i].sourceId == a[j].sourceId)
        a.splice(j--, 1);
    }
  }

  return a;
}

/**
 *
 * @param {String} id id of the workflow for multiple workflows management
 * @param {function} changeSidebarType function to change the sidebar type
 * @param {String} workflowType type of the workflow (learning or optimize)
 * @returns {JSX.Element} A workflow
 *
 * @description
 * This component is used to display a workflow (ui, nodes, edges, etc.).
 *
 */
const Workflow = ({ id, changeSidebarType, workflowType }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]); // nodes array, setNodes is used to update the nodes array, onNodesChange is a callback hook that is executed when the nodes array is changed
  const [edges, setEdges, onEdgesChange] = useEdgesState([]); // edges array, setEdges is used to update the edges array, onEdgesChange is a callback hook that is executed when the edges array is changed
  const [reactFlowInstance, setReactFlowInstance] = useState(null); // reactFlowInstance is used to get the reactFlowInstance object important for the reactFlow library
  const [nodeUpdate, setNodeUpdate] = useState({}); // nodeUpdate is used to update a node internal data
  const { setViewport } = useReactFlow(); // setViewport is used to update the viewport of the workflow
  const [treeData, setTreeData] = useState({}); // treeData is used to set the data of the tree menu
  const [groupNodeId, setGroupNodeId] = useState(null); // groupNodeId is used to know which optimize node has selected ()
  const [progress, setProgress] = useState({}); // progress is used to store the progress of the workflow execution
  const [results, setResults] = useState({}); // results is used to store radiomic features results

  // declare node types using useMemo hook to avoid re-creating component types unnecessarily (it memorizes the output) https://www.w3schools.com/react/react_usememo.asp
  const nodeTypes = useMemo(
    () => ({
      inputNode: InputNode,
      standardNode: StandardNode,
      extractionNode: ExtractionNode,
      segmentationNode: SegmentationNode,
      filterNode: FilterNode,
    }),
    []
  );

  // execute this when a variable change or a function is called related to the callback hook in []
  // setNodeUpdate function is passed to the node component to update the internal data of the node
  useEffect(() => {
    // if the nodeUpdate object is not empty, update the node
    if (nodeUpdate.id) {
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id == nodeUpdate.id) {
            // it's important that you create a new object here in order to notify react flow about the change
            node.data = {
              ...node.data,
            };
            // update the internal data of the node
            node.data.internal = nodeUpdate.updatedData;
          }
          return node;
        })
      );
    }
  }, [nodeUpdate, setNodes]);

  // executed when the nodes array and edges array are changed
  useEffect(() => {
    setTreeData(createTreeFromNodes());
  }, [nodes, edges]);

  /**
   *
   * @param {String} activeNodeId id of the group that is active
   *
   * This function hides the nodes and edges that are not in the active group
   * each node has a subflowId that is the id of the group it belongs to
   * if the subflowId is not equal to the activeNodeId, then the node is hidden
   *
   */
  const hideNodesbut = (activeNodeId) => {
    setNodes((nodes) =>
      nodes.map((node) => {
        node = {
          ...node,
        };
        node.hidden = node.data.internal.subflowId != activeNodeId;
        return node;
      })
    );

    setEdges((edges) =>
      edges.map((edge) => {
        edge = {
          ...edge,
        };
        edge.hidden =
          nodes.find((node) => node.id === edge.source).data.internal
            .subflowId != activeNodeId ||
          nodes.find((node) => node.id === edge.target).data.internal
            .subflowId != activeNodeId;
        return edge;
      })
    );
  };

  /**
   * @returns {Object} updated tree data
   *
   * This function creates the tree data from the nodes array
   * it is used to create the recursive workflow
   */
  const createTreeFromNodes = () => {
    // recursively create tree from nodes
    const createTreeFromNodesRec = (node) => {
      let children = {};
      edges.forEach((edge) => {
        if (edge.source == node.id) {
          let targetNode = JSON.parse(
            JSON.stringify(nodes.find((node) => node.id === edge.target))
          );
          if (targetNode.type != "groupNode") {
            let subIdText = "";
            let subflowId = targetNode.data.internal.subflowId;
            if (subflowId) {
              subIdText =
                JSON.parse(
                  JSON.stringify(nodes.find((node) => node.id == subflowId))
                ).data.internal.name + ".";
            }
            children[targetNode.id] = {
              label: subIdText + targetNode.data.internal.name,
              nodes: createTreeFromNodesRec(targetNode),
            };
          }
        }
      });
      return children;
    };

    let treeMenuData = {};
    edges.forEach((edge) => {
      let sourceNode = JSON.parse(
        JSON.stringify(nodes.find((node) => node.id === edge.source))
      );
      if (sourceNode.name == "Dataset") {
        treeMenuData[sourceNode.id] = {
          label: sourceNode.data.internal.name,
          nodes: createTreeFromNodesRec(sourceNode),
        };
      }
    });

    return treeMenuData;
  };

  /**
   *
   * @param {*} position initial position of the node
   * @param {*} node node information
   * @param {*} newId new created id to be given to the node
   * @param {*} associatedNode useful when creating a sub-group node, it the parent node of the group node
   * @returns a node object
   *
   * This function creates a node object
   * it is called by the onDrop function in workflowBase.jsx
   *
   */
  const createNode = (position, node, newId, associatedNode) => {
    const { nodeType, name, image } = node;
    // get node parameters
    let setupParams = {};
    setupParams = JSON.parse(
      JSON.stringify(
        staticNodesParams[workflowType][
          name.toLowerCase().replaceAll(" ", "_").replaceAll("-", "_")
        ]
      )
    );
    setupParams.possibleSettings = setupParams["possibleSettings"];

    // create new node for react flow
    const newNode = {
      id: `${newId}${associatedNode ? `.${associatedNode}` : ""}`, // if the node is a sub-group node, it has the id of the parent node seperated by a dot. useful when processing only ids
      type: nodeType,
      name: name,
      position,
      hidden: nodeType == "optimizeIO",
      zIndex: nodeType == "optimizeIO" ? 1 : 1010,
      data: {
        // here is the data accessible by children components
        internal: {
          name: `${name}`,
          img: `${image}`,
          type: `${name.toLowerCase()}`,
          workflowInfos: { id: id, type: workflowType },
          settings: (function () {
            return {};
          })(),
          checkedOptions: [],
          subflowId: !associatedNode ? groupNodeId : associatedNode,
          enableView: false, // used to enable the view of the node
        },
        parentFct: {
          deleteNode: deleteNode,
          updateNode: setNodeUpdate,
          runNode: runNode,
          changeSubFlow: setGroupNodeId,
        },
        setupParam: setupParams,
      },
    };
    return newNode;
  };

  /**
   * @param {Object} id id of the node to delete
   *
   * This function is called when the user clicks on the delete button of a node
   * It deletes the node and its edges
   * If the node is a group node, it deletes all the nodes inside the group node
   */
  const deleteNode = useCallback(
    (id) => {
      console.log("delete node", id);
      setNodes((nds) =>
        nds.reduce((filteredNodes, n) => {
          if (n.id !== id) {
            filteredNodes.push(n);
          }
          if (n.type == "groupNode") {
            let childrenNodes = nds.filter(
              (node) => node.data.internal.subflowId == id
            );
            childrenNodes.forEach((node) => {
              deleteNode(node.id);
            });
          }
          return filteredNodes;
        }, [])
      );
      setEdges((eds) => eds.filter((e) => e.source !== id && e.target !== id));
    },
    [nodes]
  );

  /**
   *
   * @param {String} id id of the node to execute
   *
   * This function is called when the user clicks on the run button of a node
   * It executes the pipelines finishing with this node
   */
  const runNode = (id) => {
    console.log("run node", id);
    // TODO
  };

  /**
   *
   * @param {String} value new value of the node name
   *
   * This function is called when the user changes the name of the node (focus out of the input).
   * It checks if the name is over 15 characters and if it is, it displays a warning message.
   * It then updates the name of the node by calling the updateNode function of the parentFct object of the node
   * this function is specific to groupNodes
   */
  const newNameHasBeenWritten = (value) => {
    let newName = value;
    if (value.length > 15) {
      newName = value.substring(0, 15);
      toast.warn(
        "Node name cannot be over 15 characters. Only the first 15 characters will be saved.",
        {
          position: "bottom-right",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
          toastId: "customId",
        }
      );
    }
    let groupNode = nodes.find((node) => node.id === groupNodeId);
    groupNode.data.internal.name = newName;
    groupNode.data.parentFct.updateNode({
      id: groupNodeId,
      updatedData: groupNode.data.internal,
    });
  };

  /**
   * Save the workflow as a json file
   */
  const onSave = useCallback(() => {
    if (reactFlowInstance) {
      const flow = JSON.parse(JSON.stringify(reactFlowInstance.toObject()));
      flow.nodes.forEach((node) => {
        node.data.parentFct = null;
        node.data.setupParam = null;
        // Set enableView to false because only the scene is saved
        // and importing it back would not reload the volumes that
        // were loaded in the viewer
        node.data.enableView = false;
      });
      console.log("flow", flow);
      downloadJson(flow, "experiment");
    }
  }, [reactFlowInstance]);

  return (
    <>
      <WorkflowBase
        reactFlowInstance={reactFlowInstance}
        setReactFlowInstance={setReactFlowInstance}
        createNode={createNode}
        nodeTypes={nodeTypes}
        nodes={nodes}
        setNodes={setNodes}
        onNodesChange={onNodesChange}
        edges={edges}
        setEdges={setEdges}
        onEdgesChange={onEdgesChange}
        ui={
          <>
            <UtilityButtons save={onSave} />
            <ResultsButton results={results} />
          </>
        }
      />
    </>
  );
};

export default Workflow;
