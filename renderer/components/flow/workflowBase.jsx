/* eslint-disable react/prop-types */
import React, { useRef, useCallback, useEffect, useContext } from "react"
import { toast } from "react-toastify"
import ReactFlow, {
  Controls,
  Background,
  MiniMap,
  updateEdge,
  addEdge
} from "reactflow"
import { FlowFunctionsContext } from "./context/flowFunctionsContext"
import { PageInfosContext } from "../mainPages/moduleBasics/pageInfosContext"
import { FlowInfosContext } from "./context/flowInfosContext"
import { FlowResultsContext } from "./context/flowResultsContext"
import { getId, deepCopy } from "../../utilities/staticFunctions"
import { Button } from "react-bootstrap"
import * as Icon from "react-bootstrap-icons"
import { ipcRenderer } from "electron"
import { ToggleButton } from "primereact/togglebutton"

/**
 *
 * @param { function } isGoodConnection function to check if a connection is valid
 * @param { function } onDeleteNode function to delete a node
 * @param { function } groupNodeHandlingDefault function to handle a group node default actions such as creation of start and end nodes
 * @param { JSX.Element } ui jsx element to display on the workflow
 *
 * @param { object } 	mandatoryProps.reactFlowInstance instance of the reactFlow
 * @param { function } 	mandatoryProps.setReactFlowInstance function to set the reactFlowInstance
 * @param { object } 	mandatoryProps.nodeTypes object containing the node types
 * @param { object } 	mandatoryProps.nodes array containing the nodes
 * @param { function } 	mandatoryProps.setNodes function to set the nodes
 * @param { function } 	mandatoryProps.onNodesChange function called when the nodes change
 * @param { object } 	mandatoryProps.edges array containing the edges
 * @param { function } 	mandatoryProps.setEdges function to set the edges
 * @param { function } 	mandatoryProps.onEdgesChange function called when the edges change
 * @param { function } 	mandatoryProps.onNodeDrag function called when a node is dragged
 * @param { function } 	mandatoryProps.runNode function called when a node is run
 * @param { function } 	mandatoryProps.addSpecificToNode function called to add specific properties to a node
 * @param { object } 	mandatoryProps.nodeUpdate object containing the id of the node to update and the updated data
 * @param { function } 	mandatoryProps.setNodeUpdate function to set the nodeUpdate
 *
 * @returns {JSX.Element} A workflow
 *
 * @description
 *
 * This component is used to display a workflow.
 * It manages base workflow functions such as node creation, node deletion, node connection, etc.
 */
const WorkflowBase = ({
  isGoodConnection,
  groupNodeHandlingDefault,
  onDeleteNode,
  ui,
  onNodeDrag,
  mandatoryProps
}) => {
  const {
    reactFlowInstance,
    setReactFlowInstance,
    addSpecificToNode,
    nodeTypes,
    nodes,
    setNodes,
    onNodesChange,
    edges,
    setEdges,
    onEdgesChange,
    runNode
  } = mandatoryProps

  const edgeUpdateSuccessful = useRef(true)
  const { pageInfos } = useContext(PageInfosContext) // used to get the flow infos
  const { nodeUpdate, node2Delete, node2Run } = useContext(FlowFunctionsContext) // used to get the function to update the node
  const { setShowAvailableNodes, updateFlowContent } =
    useContext(FlowInfosContext) // used to update the flow infos
  const { showResultsPane, setShowResultsPane, isResults } =
    useContext(FlowResultsContext) // used to update the flow infos
  const handleShow = () => setShowAvailableNodes(true)

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
              ...node.data
            }
            // update the internal data of the node
            node.data.internal = nodeUpdate.updatedData
          }
          return node
        })
      )
    }
    updateFlowContent({
      nodes: nodes,
      edges: edges
    })
  }, [nodeUpdate, setNodes])

  useEffect(() => {
    console.log("update of nodes and edges")
    updateFlowContent({
      nodes: nodes,
      edges: edges
    })
  }, [nodes, edges])

  useEffect(() => {
    console.log("send update flask port")
    ipcRenderer.send("messageFromNext", "getFlaskPort")
  }, [])

  useEffect(() => {
    onDeleteNode ? onDeleteNode(node2Delete) : deleteNode(node2Delete)
  }, [node2Delete])

  useEffect(() => {
    runNode(node2Run)
  }, [node2Run])

  /**
   * @param {object} params
   * @param {string} params.source
   * @param {string} params.target
   * @param {string} params.sourceHandle
   * @param {string} params.targetHandle
   *
   * @returns {void}
   *
   * @description
   * This function is called when a connection is created between two nodes.
   * It checks if the connection is valid and if it is, it adds the connection to the edges array.
   * If the connection is not valid, it displays an error message.
   *
   */
  const onConnect = useCallback(
    (params) => {
      console.log("new connection request", params)

      // check if the connection already exists
      let alreadyExists = false
      edges.forEach((edge) => {
        if (edge.source === params.source && edge.target === params.target) {
          alreadyExists = true
        }
      })

      // get the source and target nodes
      let sourceNode = deepCopy(nodes.find((node) => node.id === params.source))
      let targetNode = deepCopy(nodes.find((node) => node.id === params.target))
      // check if sourceNode's outputs is compatible with targetNode's inputs
      let isValidConnection = false
      sourceNode.data.setupParam.output.map((output) => {
        if (targetNode.data.setupParam.input.includes(output)) {
          isValidConnection = true
        }
      })

      // if isGoodConnection is defined, check if the connection is valid again with the isGoodConnection function
      isGoodConnection &&
        (isValidConnection = isValidConnection && isGoodConnection(params))

      // check if the connection creates an infinite loop
      let isLoop = verificationForLoopHoles(params)

      if (!alreadyExists && isValidConnection && !isLoop) {
        setEdges((eds) => addEdge(params, eds))
      } else {
        let message = "Not a valid connection"
        if (alreadyExists) {
          message = "It already exists"
        } else if (isLoop) {
          message = "It creates a loop"
        }
        toast.error(`Connection refused: ${message}`, {
          position: "bottom-right",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light"
        })
      }
    },
    [nodes, edges]
  )

  /**
   *
   * @param {Object} params current new edge infos
   * @returns true if the connection creates a loop
   */
  const verificationForLoopHoles = (params) => {
    let isLoop = params.source == params.target

    // recursively find if the target node is a child of the source node
    const verificationForLoopHolesRec = (node, isLoop) => {
      edges.forEach((edge) => {
        if (edge.source == node.id) {
          let targetNode = deepCopy(
            nodes.find((node) => node.id === edge.target)
          )
          if (targetNode.id == params.source) {
            isLoop = true
          } else if (targetNode.type != "groupNode") {
            isLoop = verificationForLoopHolesRec(targetNode, isLoop)
          }
        }
      })
      return isLoop
    }

    let targetNode = deepCopy(nodes.find((node) => node.id === params.target))
    isLoop = verificationForLoopHolesRec(targetNode, false)

    return isLoop
  }

  /**
   * @param {object} event
   *
   * @returns {void}
   *
   * @description
   * This function is called when a node is dragged over the workflow.
   * It prevents the default behavior of the event and sets the dropEffect to 'move'.
   *
   */
  const onDragOver = useCallback((event) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = "move"
  }, [])

  /**
   * @param {object} event
   *
   * @returns {void}
   *
   * @description
   * This function is called when a node is dropped on the workflow.
   */
  const onDrop = useCallback(
    (event) => {
      event.preventDefault()
      // get the node type from the dataTransfer set by the onDragStart function at sidebarAvailableNodes.jsx
      const node = JSON.parse(
        event.dataTransfer.getData("application/reactflow")
      )
      const { nodeType } = node

      if (nodeType in nodeTypes) {
        let flowWindow = document
          .getElementById(pageInfos.id)
          .getBoundingClientRect()
        const position = reactFlowInstance.project({
          x: event.clientX - flowWindow.x - 300,
          y: event.clientY - flowWindow.y - 25
        })
        // create a new random id for the node
        let newId = getId()
        // if the node is a group node, call the groupNodeHandlingDefault function if it is defined
        if (nodeType === "groupNode" && groupNodeHandlingDefault) {
          groupNodeHandlingDefault(createBaseNode, newId)
        }
        // create a base node with common properties
        let newNode = createBaseNode(position, node, newId)
        // add specific properties to the node
        newNode = addSpecificToNode(newNode)
        // add the new node to the nodes array
        setNodes((nds) => nds.concat(newNode))
        console.log("new node created: ", node)
      } else {
        console.log("node type not found: ", nodeType)
      }
    },
    [reactFlowInstance, addSpecificToNode]
  )

  /**
   *
   * @param {Object} position the drop position of the node ex. {x: 100, y: 100}
   * @param {Object} node the node object containing the nodeType, name and image path
   * @param {String} id the id of the node
   *
   * @description
   * This function creates a base node with common properties
   * all of these propreties can be overrriden by the addSpecificToNode function but they are the same for all nodes so no need to rewrite them
   * @returns {Object} the node object with the common properties
   */
  const createBaseNode = (position, node, id) => {
    const { nodeType, name, image } = node
    let newNode = {
      id: id,
      type: nodeType,
      name: name,
      position,
      data: {
        // here is the data accessible by children components
        internal: {
          name: name,
          img: image,
          type: name.toLowerCase().replaceAll(" ", "_"),
          results: { checked: false }
        },
        tooltipBy: "node" // this is a default value that can be changed in addSpecificToNode function see workflow.jsx for example
      }
    }
    return newNode
  }

  /**
   *
   * @param {String} nodeId id of the node to delete
   * @description default function to delete a node
   */
  const deleteNode = (nodeId) => {
    setNodes((nds) => nds.filter((node) => node.id !== nodeId))
    setEdges((eds) =>
      eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId)
    )
  }

  /**
   * @description
   * This function is called when an edge is dragged.
   */
  const onEdgeUpdateStart = useCallback(() => {
    edgeUpdateSuccessful.current = false
  }, [])

  /**
   *
   * @param {Object} oldEdge
   * @param {Object} newConnection
   *
   * @returns {void}
   *
   * @description
   * This function is called when an edge is dragged and dropped on another node.
   * It checks if the connection is valid and if it is, it updates the edge.
   * If the connection is not valid, it displays an error message.
   */
  const onEdgeUpdate = (oldEdge, newConnection) => {
    edgeUpdateSuccessful.current = true
    let alreadyExists = false
    edges.forEach((edge) => {
      if (
        edge.source === newConnection.source &&
        edge.target === newConnection.target
      ) {
        alreadyExists = true
      }
    })
    if (!alreadyExists) {
      console.log("connection changed")
      setEdges((els) => updateEdge(oldEdge, newConnection, els))
    } else {
      toast.error("Connection refused: it already exists", {
        position: "bottom-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light"
      })
    }
  }

  /**
   * @param {object} event
   *
   * @returns {void}
   *
   * @description
   * This function is called when an edge is dragged.
   * It checks if the connection is valid and if it is, it updates the edge.
   */
  const onEdgeUpdateEnd = useCallback((_, edge) => {
    if (!edgeUpdateSuccessful.current) {
      setEdges((eds) => eds.filter((e) => e.id !== edge.id))
    }
    edgeUpdateSuccessful.current = true
  }, [])

  return (
    <div className="height-100">
      {/* here is the reactflow component which handles a lot of features listed below */}
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onInit={setReactFlowInstance}
        nodeTypes={nodeTypes}
        onNodeDrag={onNodeDrag}
        onConnect={onConnect}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onEdgeUpdate={onEdgeUpdate}
        onEdgeUpdateStart={onEdgeUpdateStart}
        onEdgeUpdateEnd={onEdgeUpdateEnd}
        fitView
      >
        <Background /> <MiniMap className="minimapStyle" zoomable pannable />{" "}
        <Controls />
        {ui}
        <Button variant="outline btn-top-left-menu" onClick={handleShow}>
          <Icon.List width="30px" height="30px" />
        </Button>
        <ToggleButton
          onLabel="Results mode on"
          offLabel="See results"
          onIcon="pi pi-chart-bar"
          offIcon="pi pi-eye"
          disabled={!isResults}
          checked={showResultsPane}
          onChange={(e) => setShowResultsPane(e.value)}
          className="btn-bottom-show-results"
        />
      </ReactFlow>
    </div>
  )
}

export default WorkflowBase
