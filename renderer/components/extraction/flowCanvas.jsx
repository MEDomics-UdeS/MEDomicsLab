import React, { useState, useCallback, useMemo, useEffect } from "react";
import { toast } from "react-toastify";
import EditableLabel from "react-simple-editlabel";
import TreeMenu from "react-simple-tree-menu";

// Import utilities
import {
  loadJsonSync,
  downloadJson,
} from "../../utilities/fileManagementUtils";
import { axiosPostJson } from "../../utilities/requests";

// Workflow imports
import { useNodesState, useEdgesState, useReactFlow, addEdge } from "reactflow";
import WorkflowBase from "../flow/workflowBase";

// Import node types
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

// Static nodes parameters
const staticNodesParams = nodesParams;

/**
 *
 * @param {String} id id of the workflow for multiple workflows management
 * @param {function} changeSidebarType function to change the sidebar type
 * @param {String} workflowType type of the workflow (extraction or features)
 * @returns {JSX.Element} A workflow component as defined in /flow
 *
 * @description
 * Component used to display the workflow of the extraction tab of MEDomicsLab.
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
      segmentationNode: SegmentationNode,
      standardNode: StandardNode,
      extractionNode: ExtractionNode,
      filterNode: FilterNode,
      featuresNode: FeaturesNode,
    }),
    []
  );

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

      if (sourceNode.type === "inputNode") {
        treeMenuData[sourceNode.id] = {
          label: sourceNode.data.internal.name,
          nodes: createTreeFromNodesRec(sourceNode),
        };
      }
    });

    return treeMenuData;
  }, [nodes, edges]);

  /**
   * @param {Object} newNode base node object
   *
   * Function passed to workflowBase to add the specific properties of a
   * node in the workflow for extraction or features
   */
  const addSpecificToNode = (newNode) => {
    // Add defaut parameters of node to possibleSettings
    let type = newNode.data.internal.type
      .replaceAll(/ |-/g, "_")
      .replace(/[^a-z_]/g, "");

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
   * it deletes the node and its edges. If the node is a group node, it deletes
   * all the nodes inside the group node
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
   * Runs all the pipelines in the workflow
   */
  const onRun = useCallback(() => {
    console.log("run workflow");
    const data = { message: "Hello from the frontend!" };
    axiosPostJson(data, "message")
      .then((response) => {
        console.log("Response:", response);
        // Handle the response here
      })
      .catch((error) => {
        console.error("Error:", error);
        // Handle the error here
      });
    // TEST DE COMMUNICATION BACKEND-FRONTEND
  }, []);

  /**
   * Clear the canvas if the user confirms
   */
  const onClear = useCallback(() => {
    if (reactFlowInstance & (nodes.length > 0)) {
      let confirmation = confirm(
        "Are you sure you want to clear the canvas?\nEvery data will be lost."
      );
      if (confirmation) {
        setNodes([]);
        setEdges([]);
      }
    } else {
      toast.warn("No workflow to clear");
    }
  }, [reactFlowInstance, nodes]);

  /**
   * Save the workflow as a json file
   */
  const onSave = useCallback(() => {
    if (reactFlowInstance && nodes.length > 0) {
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
    } else {
      toast.warn("No workflow to save");
    }
  }, [reactFlowInstance, nodes]);

  /**
   * Load a workflow from a json file
   */
  const onLoad = useCallback(() => {
    // Ask confirmation from the user if the canvas is not empty,
    // since the workflow will be replaced
    let confirmation = true;
    if (nodes.length > 0) {
      confirmation = confirm(
        "Are you sure you want to import a new experiment?\nEvery data will be lost."
      );
    }
    if (confirmation) {
      // If the user confirms, load the json file
      const restoreFlow = async () => {
        try {
          // Ask user for the json file to open
          const flow = await loadJsonSync(); // wait for the json file to be loaded (see /utilities/fileManagementUtils.js)
          console.log("loaded flow", flow);

          // TODO : should have conditions regarding json file used for import!
          // For each nodes in the json file, add the specific parameters
          Object.values(flow.nodes).forEach((node) => {
            // the line below is important because functions are not serializable
            // reset functions associated with nodes
            node.data.parentFct = {
              deleteNode: onDeleteNode,
              updateNode: setNodeUpdate,
              runNode: runNode,
              changeSubFlow: setGroupNodeId,
            };
            // set workflow type
            let subworkflowType = node.data.internal.subflowId
              ? "extraction"
              : "features";
            // set node type
            let setupParams = deepCopy(
              staticNodesParams[subworkflowType][
                node.name.toLowerCase().replaceAll(" ", "_")
              ]
            );
            setupParams.possibleSettings = setupParams["possibleSettings"];
            node.data.setupParam = setupParams;
          });

          if (flow) {
            const { x = 0, y = 0, zoom = 1 } = flow.viewport;
            setNodes(flow.nodes || []);
            setEdges(flow.edges || []);
            setViewport({ x, y, zoom });
          }
        } catch (error) {
          toast.warn("Error loading file : ", error);
        }
      };

      // Call the async function
      restoreFlow();
    }
  }, [setNodes, setViewport, nodes]);

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

  // TODO : take out of mandatory in flow/workflowBase.js
  const onNodeDrag = useCallback(
    (event, node) => {
      console.log("dragged node", node);
      // TODO
    },
    [nodes]
  );

  return (
    <>
      <WorkflowBase
        // mandatory props
        mandatoryProps={{
          reactFlowInstance: reactFlowInstance,
          setReactFlowInstance: setReactFlowInstance,
          addSpecificToNode: addSpecificToNode,
          nodeTypes: nodeTypes,
          nodes: nodes,
          setNodes: setNodes,
          onNodesChange: onNodesChange,
          edges: edges,
          setEdges: setEdges,
          onEdgesChange: onEdgesChange,
          onNodeDrag: onNodeDrag,
          runNode: runNode,
          nodeUpdate: nodeUpdate,
          setNodeUpdate: setNodeUpdate,
        }}
        // optional props
        onDeleteNode={deleteNode}
        groupNodeHandlingDefault={groupNodeHandlingDefault}
        // represents the visual over the workflow
        ui={
          <>
            <div className="btn-panel-top-corner-left">
              {workflowType == "extraction" && (
                <>
                  {" "}
                  <ResultsButton results={results} />
                  <TreeMenu
                    data={treeData}
                    onClickItem={onTreeItemClick}
                    debounceTime={125}
                    hasSearch={false}
                  />
                </>
              )}
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
