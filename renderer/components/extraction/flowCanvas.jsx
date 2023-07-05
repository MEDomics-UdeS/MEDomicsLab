import React, { useState, useCallback, useMemo, useEffect } from "react";
import { toast } from "react-toastify";
import { useNodesState, useEdgesState, useReactFlow, addEdge } from "reactflow";
import WorkflowBase from "../flow/workflowBase";
import TreeMenu from "react-simple-tree-menu"; // TODO: https://www.npmjs.com/package/react-simple-tree-menu change plus sign to chevron
import {
  loadJsonSync,
  downloadJson,
} from "../../utilities/fileManagementUtils";
import { requestJson } from "../../utilities/requests";
import EditableLabel from "react-simple-editlabel";

// Import node types
import InputNode from "./nodesTypes/inputNode";
import StandardNode from "./nodesTypes/standardNode";
import ExtractionNode from "./nodesTypes/extractionNode";
import SegmentationNode from "./nodesTypes/segmentationNode";
import FilterNode from "./nodesTypes/filterNode";
import FeaturesNode from "./nodesTypes/featuresNode";

// Import node parameters
import nodesParams from "../../public/setupVariables/allNodesParams";

// Import buttons
import ResultsButton from "./buttonsTypes/resultsButton";
import BtnDiv from "../flow/btnDiv";

// Static functions used in the workflow
import { removeDuplicates, deepCopy } from "../../utilities/staticFunctions";

const staticNodesParams = nodesParams; // represents static nodes parameters

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
const Workflow = ({ id, workflowType, setWorkflowType }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]); // nodes array, setNodes is used to update the nodes array, onNodesChange is a callback hook that is executed when the nodes array is changed
  const [edges, setEdges, onEdgesChange] = useEdgesState([]); // edges array, setEdges is used to update the edges array, onEdgesChange is a callback hook that is executed when the edges array is changed
  const [reactFlowInstance, setReactFlowInstance] = useState(null); // reactFlowInstance is used to get the reactFlowInstance object important for the reactFlow library
  const [nodeUpdate, setNodeUpdate] = useState({}); // nodeUpdate is used to update a node internal data
  const { setViewport } = useReactFlow(); // setViewport is used to update the viewport of the workflow
  const [treeData, setTreeData] = useState({}); // treeData is used to set the data of the tree menu
  const [groupNodeId, setGroupNodeId] = useState(null); // groupNodeId is used to know which groupNode is selected
  const [progress, setProgress] = useState({}); // progress is used to store the progress of the workflow execution
  const [results, setResults] = useState({}); // results is used to store radiomic features results

  // Declare node types using useMemo hook to avoid re-creating component types unnecessarily (it memorizes the output)
  // https://www.w3schools.com/react/react_usememo.asp
  const nodeTypes = useMemo(
    () => ({
      inputNode: InputNode,
      segmentationNode: SegmentationNode,
      standardNode: StandardNode,
      extractionNode: ExtractionNode,
      filterNode: FilterNode,
      featuresNode: FeaturesNode,
    }),
    []
  );

  // Execute this when a variable change or a function is called related to the callback hook in []
  // setNodeUpdate function is passed to the node component to UPDATE THE INTERNAL DATA OF THE NODE
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

  // Execute setTreeData when there is a change in nodes or edges arrays.
  useEffect(() => {
    setTreeData(createTreeFromNodes());
  }, [nodes, edges]);

  // Executed when groupNodeId changes. I put it in useEffect because it assures groupNodeId is updated.
  useEffect(() => {
    // If there is a groupNodeId, the workflow is a features workflow
    if (groupNodeId) {
      // Set the workflow type to features
      setWorkflowType("features");
      // Hide the nodes that are not in the features group
      hideNodesbut(groupNodeId);
    } else {
      // Else the workflow is an extraction workflow
      setWorkflowType("extraction");
      // Hide the nodes that are not in the extraction group
      hideNodesbut(groupNodeId);
    }
  }, [groupNodeId, nodeUpdate]);

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
  const createTreeFromNodes = useCallback(() => {
    // recursively create tree from nodes
    const createTreeFromNodesRec = (node) => {
      let children = {};
      edges.forEach((edge) => {
        if (edge.source == node.id) {
          let targetNode = JSON.parse(
            JSON.stringify(nodes.find((node) => node.id === edge.target))
          );
          if (targetNode.type != "extractionNode") {
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

      treeMenuData[sourceNode.id] = {
        label: sourceNode.data.internal.name,
        nodes: createTreeFromNodesRec(sourceNode),
      };
    });

    return treeMenuData;
  }, [nodes, edges]);

  const addSpecificToNode = (newNode) => {
    // Add defaut parameters of node to possibleSettings
    console.log("NODE_TYPE", newNode.data.internal.type);

    let type = newNode.data.internal.type
      .replaceAll(/ |-/g, "_")
      .replace(/[^a-z_]/g, "");

    console.log("NEW TYPE", type);
    let setupParams = {};
    if (staticNodesParams[workflowType][type]) {
      setupParams = JSON.parse(
        JSON.stringify(staticNodesParams[workflowType][type])
      );
    }
    setupParams.possibleSettings = setupParams["possibleSettings"];

    // Add default parameters to node data
    newNode.data.setupParam = setupParams;

    // Initialize settings in node data to put the parameters selected by the user
    newNode.data.internal.settings = {};

    // TODO : ??
    newNode.data.parentFct.changeSubFlow = setGroupNodeId;

    newNode.data.internal.subflowId = groupNodeId; // TODO : À vérifier!

    // Used to enable the view button of a node (if it exists)
    newNode.data.internal.enableView = false;

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
          if (n.type == "extractionNode") {
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
    const flow = JSON.parse(JSON.stringify(reactFlowInstance.toObject()));
    // TODO
  };

  /**
   * Clear all the pipelines in the workflow
   */
  const onRun = useCallback(() => {
    console.log("run workflow");
    // TODO
  }, []);

  /**
   * Clear the canvas if the user confirms
   */
  const onClear = useCallback(() => {
    let confirmation = confirm(
      "Are you sure you want to clear the canvas?\nEvery data will be lost."
    );
    if (confirmation) {
      setNodes([]);
      setEdges([]);
      setIntersections([]);
    }
  }, []);

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

  /**
   * Clear the canvas if the user confirms
   */
  const onLoad = useCallback(() => {
    console.log("load workflow");
    // TODO
  }, []);

  /**
   * Set the subflow id to null to go back to the main workflow
   */
  const onBack = useCallback(() => {
    setGroupNodeId(null);
  }, []);

  const onResults = useCallback(() => {
    setGroupNodeId(null);
  }, []);

  /**
   * @param {Object} info info about the node clicked
   *
   * This function is called when the user clicks on a tree item
   *
   */
  const onTreeItemClick = (info) => {
    console.log("tree item clicked: ", info);
  };

  const groupNodeHandlingDefault = (createBaseNode, newId) => {
    console.log("Group node handling default.");
  };

  return (
    <>
      <WorkflowBase
        reactFlowInstance={reactFlowInstance}
        setReactFlowInstance={setReactFlowInstance}
        addSpecificToNode={addSpecificToNode}
        nodeTypes={nodeTypes}
        nodes={nodes}
        setNodes={setNodes}
        onNodesChange={onNodesChange}
        edges={edges}
        setEdges={setEdges}
        onEdgesChange={onEdgesChange}
        onDeleteNode={deleteNode}
        setNodeUpdate={setNodeUpdate}
        runNode={runNode}
        groupNodeHandlingDefault={groupNodeHandlingDefault}
        ui={
          <>
            <div className="btn-panel-top-corner-left">
              <ResultsButton results={results} />
              <TreeMenu
                data={treeData}
                onClickItem={onTreeItemClick}
                debounceTime={125}
                hasSearch={false}
              />
            </div>
            <div className="btn-panel-top-corner-right">
              {workflowType == "extraction" ? (
                <BtnDiv
                  buttonsList={[
                    { type: "run", onClick: onRun },
                    { type: "clear", onClick: onClear },
                    { type: "save", onClick: onSave },
                    { type: "load", onClick: onLoad },
                  ]}
                />
              ) : (
                <BtnDiv buttonsList={[{ type: "back", onClick: onBack }]} />
              )}
            </div>
          </>
        }
      />
    </>
  );
};

export default Workflow;
