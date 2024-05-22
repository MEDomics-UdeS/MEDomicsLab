/* eslint-disable camelcase */
import React, { useState, useCallback, useMemo, useEffect, useContext } from "react"
import { toast } from "react-toastify"
import { useNodesState, useEdgesState, useReactFlow } from "reactflow"
import WorkflowBase from "../flow/workflowBase.jsx"
import { loadJsonSync } from "../../utilities/fileManagementUtils.js"
import BtnDiv from "../flow/btnDiv.jsx"
import ProgressBarRequests from "../generalPurpose/progressBarRequests.jsx"
import { PageInfosContext } from "../mainPages/moduleBasics/pageInfosContext.jsx"

import MedDataObject from "../workspace/medDataObject.js"
import { modifyZipFileSync } from "../../utilities/customZipFile.js"

import RunPipelineModal from "./runPipelineModal"
// here are the different types of nodes implemented in the workflow

// here are the parameters of the nodes
import nodesParams from "../../public/setupVariables/allNodesParams.jsx"
import evalNodesParams from "../../public/setupVariables/evalNodesParams.jsx"

// here are static functions used in the workflow
import { removeDuplicates, deepCopy } from "../../utilities/staticFunctions.js"
import { defaultValueFromType } from "../../utilities/learning/inputTypesUtils.js"
import { FlowInfosContext } from "../flow/context/flowInfosContext.jsx"
import StandardNode from "../learning/nodesTypes/standardNode.jsx"
import SelectionNode from "../learning/nodesTypes/selectionNode.jsx"
import OptimizeIO from "../learning/nodesTypes/optimizeIO.jsx"
import LoadModelNode from "../learning/nodesTypes/loadModelNode.jsx"
import DatasetLoaderNode from "./nodesTypes/datasetLoaderNode.jsx"
import BaseModelNode from "./nodesTypes/baseModelNode.jsx"
import EvaluationNode from "./nodesTypes/evaluationNode.jsx"
import MED3paNode from "./nodesTypes/med3paNode.jsx"
import DetectronNode from "./nodesTypes/detectronNode.jsx"
import PaPipelineNode from "./nodesTypes/paPipelineNode.jsx"
import PaResultsNode from "./nodesTypes/paResultsNode.jsx"
import Det3paNode from "./nodesTypes/det3paNode.jsx"

const staticNodesParams = nodesParams // represents static nodes parameters
const staticevalNodesParams = evalNodesParams
let globalFiles = null

/**
 *
 * @param {function} setWorkflowType function to change the sidebar type
 * @param {String} workflowType type of the workflow (learning or optimize)
 * @returns {JSX.Element} A workflow
 *
 * @description
 * This component is used to display a workflow (ui, nodes, edges, etc.).
 *
 */
const Med3paWorkflow = ({ workflowType }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]) // nodes array, setNodes is used to update the nodes array, onNodesChange is a callback hook that is executed when the nodes array is changed
  const [edges, setEdges, onEdgesChange] = useEdgesState([]) // edges array, setEdges is used to update the edges array, onEdgesChange is a callback hook that is executed when the edges array is changed
  const [reactFlowInstance, setReactFlowInstance] = useState(null) // reactFlowInstance is used to get the reactFlowInstance object important for the reactFlow library
  const [MLType, setMLType] = useState("classification") // MLType is used to know which machine learning type is selected
  const { setViewport } = useReactFlow() // setViewport is used to update the viewport of the workflow
  const { getIntersectingNodes } = useReactFlow() // getIntersectingNodes is used to get the intersecting nodes of a node
  const [intersections, setIntersections] = useState([]) // intersections is used to store the intersecting nodes related to optimize nodes start and end
  const [isProgressUpdating, setIsProgressUpdating] = useState(false) // progress is used to store the progress of the workflow execution
  const [treeData, setTreeData] = useState({}) // treeData is used to set the data of the tree menu
  const [progress, setProgress] = useState({
    now: 0,
    currentLabel: ""
  })

  const [showRunModal, setRunModal] = useState(false)
  const { config, pageId, configPath } = useContext(PageInfosContext) // used to get the page infos such as id and config path
  const { canRun } = useContext(FlowInfosContext)

  // declare node types using useMemo hook to avoid re-creating component types unnecessarily (it memorizes the output) https://www.w3schools.com/react/react_usememo.asp
  const nodeTypes = useMemo(
    () => ({
      standardNode: StandardNode,
      selectionNode: SelectionNode,

      optimizeIO: OptimizeIO,
      datasetLoaderNode: DatasetLoaderNode,
      loadModelNode: LoadModelNode,
      baseModelNode: BaseModelNode,
      evaluationNode: EvaluationNode,
      med3paNode: MED3paNode,
      detectronNode: DetectronNode,
      paPipelineNode: PaPipelineNode,
      paResultsNode: PaResultsNode,
      det3paNode: Det3paNode
    }),
    []
  )

  // When config is changed, we update the workflow
  useEffect(() => {
    if (config && Object.keys(config).length > 0) {
      updateScene(config)
      toast.success("Config file has been loaded successfully")
    } else {
      console.log("No config file found for this page, base workflow will be used")
    }
  }, [config])

  // executed when the nodes array and edges array are changed
  useEffect(() => {
    setTreeData(createTreeFromNodes())
  }, [nodes, edges])

  // executed when the machine learning type is changed
  // it updates the possible settings of the nodes
  useEffect(() => {
    setNodes((nds) =>
      nds.map((node) => {
        // it's important that you create a new object here in order to notify react flow about the change
        node.data = {
          ...node.data
        }
        return node
      })
    )
  }, [MLType])

  /**
   * @param {Object} event event object
   * @param {Object} node node object
   *
   * This function is called when a node is dragged
   * It checks if the node is intersecting with another node
   * If it is, it adds the intersection to the intersections array
   */
  const onNodeDrag = useCallback(
    (event, node) => {
      let rawIntersects = getIntersectingNodes(node).map((n) => n.id)
      // rawIntersects = rawIntersects.filter((n) => nodes.find((node) => node.id == n).data.internal.subflowId == node.data.internal.subflowId)
      let isNew = false

      // clear all intersections associated with
      let newIntersections = intersections.filter((int) => int.sourceId !== node.id && int.targetId !== node.id)

      // add new intersections
      rawIntersects.forEach((rawIntersect) => {
        // if the node is not a optimize node, it can't intersect with an optimize node
        // this a XOR logic gate so only true when only one of the two is true
        if (node.id.includes("opt") ^ rawIntersect.includes("opt")) {
          if (node.id.includes("opt")) {
            newIntersections = newIntersections.concat({
              sourceId: rawIntersect,
              targetId: node.id
            })
          } else if (rawIntersect.includes("opt")) {
            newIntersections = newIntersections.concat({
              sourceId: node.id,
              targetId: rawIntersect
            })
          }
          newIntersections = removeDuplicates(newIntersections)
          isNew = true
          setIntersections(newIntersections)
        }
      })
      if (!isNew) {
        if (node.id.includes("opt")) {
          setIntersections((intersects) => intersects.filter((int) => int.targetId !== node.id))
        } else {
          setIntersections((intersects) => intersects.filter((int) => int.sourceId !== node.id))
        }
      }
    },
    [nodes, intersections]
  )

  /**
   *
   * this function handles loading a json file to the editor
   * it is called when the user clicks on the load button
   * it checks if the user wants to import a new experiment because it erase the current one
   * it then loads the json file and creates the nodes and edges
   */
  const onLoad = useCallback(() => {
    let confirmation = true
    if (nodes.length > 0) {
      confirmation = confirm("Are you sure you want to import a new experiment?\nEvery data will be lost.")
    }
    if (confirmation) {
      const restoreFlow = async () => {
        const newScene = await loadJsonSync()
        updateScene(newScene)
      }

      restoreFlow()
    }
  }, [setNodes, setViewport, nodes])

  /**
   *
   * @param {Object} newScene new scene to update the workflow
   *
   * This function updates the workflow with the new scene
   */
  const updateScene = (newScene) => {
    console.log("Scene updating", newScene)
    if (newScene) {
      if (Object.keys(newScene).length > 0) {
        Object.values(newScene.nodes).forEach(() => {})
        const { x = 0, y = 0, zoom = 1 } = newScene.viewport
        setMLType(newScene.MLType)
        setNodes(newScene.nodes || [])
        setEdges(newScene.edges || [])
        setViewport({ x, y, zoom })
        setIntersections(newScene.intersections || [])
      }
    }
  }

  /**
   * @param {Object} id id of the node to delete
   *
   * This function is called when the user clicks on the delete button of a node
   * It deletes the node and its edges
   * If the node is a group node, it deletes all the nodes inside the group node
   */
  const onDeleteNode = useCallback((id) => {
    console.log("delete node", id)
    setNodes((nds) =>
      nds.reduce((filteredNodes, n) => {
        if (n.id !== id) {
          filteredNodes.push(n)
        }
        return filteredNodes
      }, [])
    )
    setEdges((eds) => eds.filter((e) => e.source !== id && e.target !== id))
    setIntersections((ints) =>
      ints.reduce((filteredInts, n) => {
        if (n.sourceId !== id && n.targetId !== id) {
          filteredInts.push(n)
        }
        return filteredInts
      }, [])
    )
  }, [])

  /**
   *
   * @param {Object} newNode base node object
   * @returns
   */
  const addSpecificToNode = (newNode) => {
    let setupParams = {}
    setupParams = deepCopy(staticNodesParams[workflowType][newNode.data.internal.type])

    console.log("this is the setup", staticNodesParams[workflowType])

    newNode.id = `${newNode.id}`

    if (newNode.type === "evaluationNode" || newNode.type === "datasetLoaderNode") {
      newNode.data.internal.contentType = "default"
      newNode.data.internal.connected = false
    }

    newNode.data.setupParam = setupParams

    newNode.zIndex = newNode.type == "optimizeIO" ? 1 : 1010
    newNode.data.tooltipBy = "type"

    newNode.data.internal.code = ""
    newNode.className = setupParams.classes
    newNode.data.internal.description = ""

    let tempDefaultSettings = {}
    if (newNode.data.setupParam.possibleSettings) {
      "default" in newNode.data.setupParam.possibleSettings &&
        Object.entries(newNode.data.setupParam.possibleSettings.default).map(([settingName, setting]) => {
          tempDefaultSettings[settingName] = defaultValueFromType[setting.type]
        })
    }
    newNode.data.internal.settings = tempDefaultSettings

    newNode.data.internal.selection = newNode.type == "selectionNode" && Object.keys(setupParams.possibleSettings)[0]
    newNode.data.internal.checkedOptions = []
    newNode.data.internal.hasWarning = { state: false }

    return newNode
  }

  const createTreeFromNodes = () => {
    // recursively create tree from nodes
    const createTreeFromNodesRec = (node) => {
      let children = {}

      edges.forEach((edge) => {
        if (edge.source == node.id) {
          let targetNode = deepCopy(nodes.find((node) => node.id === edge.target))
          children[targetNode.id] = {
            id: targetNode.id,
            label: targetNode.data.internal.name,
            nodes: createTreeFromNodesRec(targetNode)
          }
        }
      })
      return children
    }

    let treeMenuData = {}
    edges.forEach((edge) => {
      let sourceNode = deepCopy(nodes.find((node) => node.id === edge.source))
      if (sourceNode.data.setupParam.classes.split(" ").includes("startNode")) {
        treeMenuData[sourceNode.id] = {
          id: sourceNode.id,
          label: sourceNode.data.internal.name,
          nodes: createTreeFromNodesRec(sourceNode)
        }
      }
    })

    return treeMenuData
  }

  /**
   *
   * @param {String} id id of the node to execute
   *
   * This function is called when the user clicks on the run button of a node
   * It executes the pipelines finishing with this node
   */
  const runNode = useCallback(() => {
    //setRunModal(true)
  }, [reactFlowInstance, MLType, nodes, edges, intersections])

  /**
   * execute the whole workflow
   */
  const onRun = useCallback(
    // eslint-disable-next-line no-unused-vars
    (e, _up2Id = undefined) => {
      setRunModal(true)
      if (reactFlowInstance) {
        let flow = deepCopy(reactFlowInstance.toObject())
        flow.MLType = MLType
        flow.nodes.forEach((node) => {
          node.data.setupParam = null
        })

        // let { newflow, isValid } = cleanJson2Send(flow, up2Id)
        // flow = newflow
        // If the workflow size is too big, we need to put it in a file and send it to the server
        // This is because the server can't handle big json objects
        //   if (getByteSize(flow, "bytes") > 25000) {
        //     console.log("JSON config object is too big to be sent to the server. It will be saved in a file and sent to the server.")
        //     // Get the temporary directory
        //     ipcRenderer.invoke("appGetPath", "temp").then((tmpDirectory) => {
        //       // Save the workflow in a file
        //       MedDataObject.writeFileSync(flow, tmpDirectory, pageId, "json")
        //       // Change the flow to the path of the file
        //       let newPath = Path.join(tmpDirectory, pageId + ".json")
        //       flow = { temp: newPath }
        //       requestBackendRunExperiment(port, flow, isValid)
        //     })
        //   } else {
        //     requestBackendRunExperiment(port, flow, isValid)
        //   }
        // } else {
        //   toast.warn("react flow instance not found")
      }
    },
    [reactFlowInstance, MLType, nodes, edges, intersections, configPath]
  )

  /**
   * save the workflow as a json file
   */
  const onSave = useCallback(() => {
    if (reactFlowInstance) {
      const flow = deepCopy(reactFlowInstance.toObject())
      flow.MLType = MLType
      console.log("flow debug", flow)
      flow.nodes.forEach((node) => {
        node.data.setupParam = null
      })
      flow.intersections = intersections
      modifyZipFileSync(configPath, async (path) => {
        // do custom actions in the folder while it is unzipped
        await MedDataObject.writeFileSync(flow, path, "metadata", "json")
        toast.success("Scene has been saved successfully")
      })
    }
  }, [reactFlowInstance, MLType, intersections])

  const verifyError = (sourceNode, targetNode) => {
    if (!targetNode || !sourceNode) {
      return "Node is not found"
    }

    if (sourceNode.type === "datasetLoaderNode" && targetNode.type !== "baseModelNode") {
      if (sourceNode.data.internal.connected) {
        return "Node is already connected"
      }

      if (globalFiles === null) {
        return "Set up the Base Model before reaching this step"
      }
    }
    if (targetNode.data.internal.hasWarning["state"] || sourceNode.data.internal.hasWarning["state"]) {
      // return "Select necessary files before connecting the nodes"
    }
    return ""
  }

  const isAlreadyConnected = (sourceNodeId) => {
    if (edges.some((edge) => edge.source === sourceNodeId)) {
      return "Node already Connected!"
    }
    return ""
  }

  const onConnect = ({ source, target }) => {
    if (!source || !target) {
      console.error("Invalid source or target:", source, target)
      return
    }

    const targetNode = nodes.find((node) => node.id === target)
    const sourceNode = nodes.find((node) => node.id === source)
    const message = verifyError(sourceNode, targetNode)
    if (message !== "") {
      setEdges((prevEdges) => prevEdges.filter((edge) => !(edge.source === source && edge.target === target)))
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
      return
    }
    if (sourceNode.type === "datasetLoaderNode") {
      const alreadyConnected = isAlreadyConnected(source, target)
      if (alreadyConnected !== "") {
        setEdges((prevEdges) => prevEdges.filter((edge) => !(edge.source === source && edge.target === target)))
        toast.error(`Connection refused: ${alreadyConnected}`, {
          position: "bottom-right",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light"
        })
        return
      }
    }

    if (targetNode.type === "evaluationNode") {
      let newStyle = null

      if (sourceNode.type === "detectronNode") {
        newStyle = "evalDetectron"
      } else if (sourceNode.type === "med3paNode") {
        newStyle = "evalMed3pa"
      }

      if (newStyle) {
        nodes.map((node) => {
          if (node.id === target) {
            targetNode.data.internal.contentType = newStyle
            targetNode.data.setupParam = staticevalNodesParams[newStyle]
          }
        })
      }
    }

    if (sourceNode.type === "datasetLoaderNode") {
      if (targetNode.type !== "baseModelNode") {
        nodes.map((node) => {
          if (node.id === target) {
            sourceNode.data.internal.contentType = targetNode.type
            targetNode.data.internal.files = globalFiles
          }
        })
      } else {
        const { file_0, file_1, file_2, target_0, target_1, target_2 } = sourceNode.data.internal.settings
        globalFiles = [
          { file: file_0, target: target_0 },
          { file: file_1, target: target_1 },
          { file: file_2, target: target_2 }
        ]
        console.log(globalFiles)
      }
    }
  }

  /**
   * Clear the canvas if the user confirms
   */
  const onClear = useCallback(() => {
    let confirmation = confirm("Are you sure you want to clear the canvas?\nEvery data will be lost.")
    if (confirmation) {
      setNodes([])
      setEdges([])
      setIntersections([])
    }
  }, [])

  const removeConfigsWithoutBaseModel = (configs) => {
    return configs.filter((config) => {
      return Object.values(config).some((node) => node.label === "Base Model")
    })
  }

  const getConfigs = (tree) => {
    const result = []
    const stack = [{ nodes: tree, config: {} }]

    while (stack.length > 0) {
      const { nodes, config } = stack.pop()
      const nodesByLabel = {}

      // Group nodes by label
      Object.values(nodes).forEach((node) => {
        if (!nodesByLabel[node.label]) {
          nodesByLabel[node.label] = []
        }
        nodesByLabel[node.label].push(node)
      })

      // Process each label group
      Object.keys(nodesByLabel).forEach((label) => {
        const group = nodesByLabel[label]
        group.forEach((node, index) => {
          let newConfig = { ...config, [label]: node }
          if (index === 0) {
            // Continue with the current path
            stack.push({ nodes: node.nodes, config: newConfig })
          } else {
            // Fork a new configuration
            stack.push({ nodes: node.nodes, config: { ...newConfig } })
          }
        })
      })

      if (Object.keys(nodes).length === 0) {
        result.push(config)
      }
    }

    return removeConfigsWithoutBaseModel(result)
  }

  return (
    <>
      <RunPipelineModal
        show={showRunModal}
        onHide={() => {
          setRunModal(false)
        }}
        configs={getConfigs(treeData, 0)}
        nodes={nodes}
      />

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
          onEdgesChange,
          runNode: runNode
        }}
        // optional props
        customOnConnect={onConnect}
        onDeleteNode={onDeleteNode}
        onNodeDrag={onNodeDrag}
        // reprensents the visual over the workflow
        uiTopRight={
          <>
            {workflowType == "pa" && (
              <>
                <BtnDiv
                  buttonsList={[
                    { type: "run", onClick: onRun, disabled: !canRun },
                    { type: "clear", onClick: onClear },
                    { type: "save", onClick: onSave },
                    { type: "load", onClick: onLoad }
                  ]}
                />
              </>
            )}
          </>
        }
        ui={
          <>
            {/* bottom center - progress bar */}
            <div className="panel-bottom-center">
              {isProgressUpdating && (
                <ProgressBarRequests
                  progressBarProps={{ animated: true, variant: "success" }}
                  isUpdating={isProgressUpdating}
                  setIsUpdating={setIsProgressUpdating}
                  progress={progress}
                  setProgress={setProgress}
                  requestTopic={"learning/progress/" + pageId}
                />
              )}
            </div>
          </>
        }
      />
    </>
  )
}

export default Med3paWorkflow
