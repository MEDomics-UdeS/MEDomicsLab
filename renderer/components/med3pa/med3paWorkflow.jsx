/* eslint-disable camelcase */
import React, { useState, useCallback, useMemo, useEffect, useContext } from "react"
import { toast } from "react-toastify"
//import { ipcRenderer } from "electron"
import { useNodesState, useEdgesState, useReactFlow } from "reactflow"
import { loadJsonSync } from "../../utilities/fileManagementUtils"
import { requestBackend } from "../../utilities/requests"
import PaWorkflowBase from "./paWorkflowBase.jsx"
import BtnDiv from "../flow/btnDiv.jsx"
import ProgressBarRequests from "../generalPurpose/progressBarRequests.jsx"
import { PageInfosContext } from "../mainPages/moduleBasics/pageInfosContext.jsx"
//import { defaultValueFromType } from "../../utilities/learning/inputTypesUtils.js"
import { FlowResultsContext } from "../flow/context/flowResultsContext"

import { WorkspaceContext, EXPERIMENTS } from "../workspace/workspaceContext"

import { ErrorRequestContext } from "../generalPurpose/errorRequestContext.jsx"
import MedDataObject from "../workspace/medDataObject.js"
import { modifyZipFileSync } from "../../utilities/customZipFile.js"
//import { sceneDescription } from "../../public/setupVariables/learningNodesParams.jsx"

import RunPipelineModal from "./runPipelineModal"
// here are the different types of nodes implemented in the workflow

// here are the parameters of the nodes
import nodesParams from "../../public/setupVariables/allNodesParams.jsx"

// here are static functions used in the workflow
//import Path from "path"
import { removeDuplicates, deepCopy } from "../../utilities/staticFunctions.js"
import { FlowInfosContext } from "../flow/context/flowInfosContext.jsx"
import StandardNode from "../learning/nodesTypes/standardNode.jsx"
import SelectionNode from "../learning/nodesTypes/selectionNode.jsx"
import { FlowFunctionsContext } from "../flow/context/flowFunctionsContext"

import PaOptimizeIO from "./nodesTypes/paOptimizeIO.jsx"

import GroupNode from "../flow/groupNode.jsx"
import LoadModelNode from "../learning/nodesTypes/loadModelNode.jsx"
import DatasetLoaderNode from "./nodesTypes/datasetLoaderNode.jsx"
import BaseModelNode from "./nodesTypes/baseModelNode.jsx"

import MED3paNode from "./nodesTypes/med3paNode.jsx"
import IPCModelNode from "./nodesTypes/ipcModelNode.jsx"
import APCModelNode from "./nodesTypes/apcModelNode.jsx"
import MPCModelNode from "./nodesTypes/mpcModelNode.jsx"
import UncertaintyMetricsNode from "./nodesTypes/uncertainyMetricsNode.jsx"

import DetectronNode from "./nodesTypes/detectronNode.jsx"

const staticNodesParams = nodesParams // represents static nodes parameters

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
const Med3paWorkflow = ({ setWorkflowType, workflowType }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]) // nodes array, setNodes is used to update the nodes array, onNodesChange is a callback hook that is executed when the nodes array is changed
  const [edges, setEdges, onEdgesChange] = useEdgesState([]) // edges array, setEdges is used to update the edges array, onEdgesChange is a callback hook that is executed when the edges array is changed
  const [reactFlowInstance, setReactFlowInstance] = useState(null) // reactFlowInstance is used to get the reactFlowInstance object important for the reactFlow library
  const [MLType, setMLType] = useState("classification") // MLType is used to know which machine learning type is selected
  const { setViewport } = useReactFlow() // setViewport is used to update the viewport of the workflow
  const { getIntersectingNodes } = useReactFlow() // getIntersectingNodes is used to get the intersecting nodes of a node
  const { isResults, setIsResults } = useContext(FlowResultsContext)
  const { port, getBasePath } = useContext(WorkspaceContext)

  const { setError } = useContext(ErrorRequestContext)
  const [intersections, setIntersections] = useState([]) // intersections is used to store the intersecting nodes related to optimize nodes start and end
  const [isProgressUpdating, setIsProgressUpdating] = useState(false) // progress is used to store the progress of the workflow execution
  const [treeData, setTreeData] = useState([]) // treeData is used to set the data of the tree menu
  const [progress, setProgress] = useState({
    now: 0,
    currentLabel: ""
  })

  const [paWorkflowSettings, setPaWorkflowSettings] = useState({})
  const { groupNodeId, changeSubFlow, hasNewConnection } = useContext(FlowFunctionsContext)
  const [showRunModal, setRunModal] = useState(false)
  // eslint-disable-next-line no-unused-vars
  const [isUpdating, setIsUpdating] = useState(false) // we use this to store the progress value of the dashboard
  const { config, pageId, configPath } = useContext(PageInfosContext) // used to get the page infos such as id and config path
  const { canRun } = useContext(FlowInfosContext)
  // eslint-disable-next-line no-unused-vars
  const [progressValue, setProgressValue] = useState({ now: 0, currentLabel: "" }) // we use this to store the progress value of the dashboard
  // const { setError } = useContext(ErrorRequestContext)

  // declare node types using useMemo hook to avoid re-creating component types unnecessarily (it memorizes the output) https://www.w3schools.com/react/react_usememo.asp
  const nodeTypes = useMemo(
    () => ({
      standardNode: StandardNode,
      selectionNode: SelectionNode,

      datasetLoaderNode: DatasetLoaderNode,
      loadModelNode: LoadModelNode,
      baseModelNode: BaseModelNode,

      med3paNode: MED3paNode,
      detectronNode: DetectronNode,
      ipcModelNode: IPCModelNode,
      apcModelNode: APCModelNode,
      mpcModelNode: MPCModelNode,
      groupNode: GroupNode,

      paOptimizeIO: PaOptimizeIO,
      uncertaintyMetricsNode: UncertaintyMetricsNode
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
    setTreeData(createPathsToLeafNodes())
  }, [nodes, edges])

  // it updates the possible settings of the nodes
  useEffect(() => {
    setNodes((nds) =>
      nds.map((node) => {
        // it's important that you create a new object here in order to notify react flow about the change
        node.data = {
          ...node.data
        }
        if (!node.id.includes("opt")) {
          let subworkflowType
          if (node.data.internal.subflowId === "MAIN") {
            subworkflowType = "pa"
          } else {
            subworkflowType = "pamodels"
          }
          node.data.setupParam.possibleSettings = deepCopy(staticNodesParams[subworkflowType][node.data.internal.type]["possibleSettings"])
          node.data.internal.settings = {}
          node.data.internal.checkedOptions = []
        }
        return node
      })
    )
  }, [MLType])

  // when isResults is changed, we set the progressBar to completed state
  useEffect(() => {
    if (isResults) {
      setProgress({
        now: 100,
        currentLabel: "Done!"
      })
    }
  }, [isResults])

  // execute this when groupNodeId change. I put it in useEffect because it assures groupNodeId is updated
  useEffect(() => {
    // Find the node with the matching id

    if (groupNodeId.id === "MAIN") {
      setWorkflowType("pa")
      hideNodesbut(groupNodeId.id)
    } else {
      setWorkflowType("pamodels")
      hideNodesbut(groupNodeId.id)
    }
  }, [groupNodeId])
  /**
   *
   * @param {String} activeSubflowId id of the group that is active
   *
   * This function hides the nodes and edges that are not in the active group
   * each node has a subflowId that is the id of the group it belongs to
   * if the subflowId is not equal to the activeNodeId, then the node is hidden
   *
   */
  const hideNodesbut = (activeSubflowId) => {
    setNodes((nodes) =>
      nodes.map((node) => {
        node = {
          ...node
        }
        node.hidden = node.data.internal.subflowId != activeSubflowId
        return node
      })
    )

    setEdges((edges) =>
      edges.map((edge) => {
        edge = {
          ...edge
        }
        edge.hidden =
          nodes.find((node) => node.id === edge.source).data.internal.subflowId != activeSubflowId || nodes.find((node) => node.id === edge.target).data.internal.subflowId != activeSubflowId
        return edge
      })
    )
  }

  // executed when intersections array is changed
  // it updates nodes and eges array
  useEffect(() => {
    setNodes((nds) =>
      nds.map((node) => {
        node.data = {
          ...node.data
        }
        node.className = ""

        intersections.forEach((intersect) => {
          const sourceNode = nds.find((n) => n.id === intersect.sourceId)
          const targetNode = nds.find((n) => n.id === intersect.targetId)

          if (sourceNode && targetNode) {
            if ((sourceNode.data.setupParam.nbInput == 0 && targetNode.name === "Start") || targetNode.name === "End") {
              targetNode.className = "intersect"
              // Store the default description before changing it
              if (!targetNode.defaultDescription) {
                targetNode.defaultDescription = targetNode.data.internal.description
              }
              targetNode.data.internal.description = "This is a valid " + targetNode.name + " Node"
            } else {
              targetNode.className = "intersect2"
              // Check if default description exists, if not use the current description
              targetNode.data.internal.description = "This is a wrong " + targetNode.name + " Node"
            }
          }
        })

        // If no intersections are found, reset description to default
        if (!intersections.some((intersect) => intersect.sourceId === node.id || intersect.targetId === node.id) && node.defaultDescription) {
          node.data.internal.description = node.defaultDescription
        }

        return node
      })
    )

    // then, we add the edges between the intersecting nodes and hide them to simulate the connection between the nodes
    // this is useful to create the recursive workflow automatically
    // it basically bypasses the optimize nodes
    setEdges((eds) => eds.filter((edge) => !edge.id.includes("opt"))) // remove all edges that are linked to optimize nodes
  }, [intersections, hasNewConnection])
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
      rawIntersects = rawIntersects.filter((n) => nodes.find((node) => node.id == n).data.internal.subflowId == node.data.internal.subflowId)
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
        if (n.type == "groupNode") {
          let childrenNodes = nds.filter((node) => node.data.internal.subflowId == id)
          childrenNodes.forEach((node) => {
            onDeleteNode(node.id)
          })
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
  const addSpecificToNode = (newNode, associatedNode) => {
    let setupParams = {}
    setupParams = {}

    if (!newNode.id.includes("opt")) {
      setupParams = deepCopy(staticNodesParams[workflowType][newNode.data.internal.type])
      console.log("this is the setup", staticNodesParams[workflowType])
    }

    newNode.id = `${newNode.id}${associatedNode ? `.${associatedNode}` : ""}` // if the node is a sub-group node, it has the id of the parent node seperated by a dot. useful when processing only ids

    newNode.hidden = newNode.type == "paOptimizeIO"
    newNode.zIndex = newNode.type == "paOptimizeIO" ? 1 : 1010
    newNode.data.tooltipBy = "type"
    newNode.data.setupParam = setupParams

    newNode.data.internal.code = ""
    newNode.className = setupParams.classes

    newNode.data.internal.description = newNode.data.internal.description !== undefined ? newNode.data.internal.description : ""

    let tempDefaultSettings = {}
    if (newNode.data.setupParam.possibleSettings) {
      const possibleSettings = newNode.data.setupParam.possibleSettings
      // Handle nodes with one setting
      Object.entries(possibleSettings).forEach(([settingName, setting]) => {
        tempDefaultSettings[settingName] = setting.default_val
      })
    }

    newNode.data.internal.settings = tempDefaultSettings

    newNode.data.internal.selection = newNode.type == "selectionNode" && Object.keys(setupParams.possibleSettings)[0]
    newNode.data.internal.checkedOptions = []
    newNode.data.internal.subflowId = !associatedNode ? groupNodeId.id : associatedNode
    newNode.data.internal.hasWarning = { state: false }

    return newNode
  }
  /**
   * @returns {Array} updated tree data
   *
   * This function creates the tree path data from the nodes array
   * it is used to create the recursive workflow
   */

  const createPathsToLeafNodes = () => {
    // Recursively create paths from nodes to leaf nodes
    const createPathsRec = (node, currentPath) => {
      currentPath.push({
        id: node.id,
        supIdNode: node.data.internal.subflowId !== "MAIN" ? node.data.internal.subflowId : "",
        label: (node.data.internal.subflowId !== "MAIN" ? nodes.find((n) => n.id === node.data.internal.subflowId).data.internal.name + "." : "") + node.data.internal.name,
        settings: node.data.internal.settings !== undefined ? node.data.internal.settings : {}
      })

      let isLeaf = true
      edges.forEach((edge) => {
        if (edge.source === node.id) {
          isLeaf = false
          let targetNode = deepCopy(nodes.find((node) => node.id === edge.target))
          createPathsRec(targetNode, deepCopy(currentPath))
        }
      })

      if (isLeaf) {
        // Check if the current path already exists in paths
        if (!paths.some((path) => JSON.stringify(path) === JSON.stringify(currentPath))) {
          paths.push(currentPath)
        }
      }
    }

    let paths = []
    edges.forEach((edge) => {
      let sourceNode = deepCopy(nodes.find((node) => node.id === edge.source))
      if (sourceNode.data.setupParam.classes.split(" ").includes("startNode")) {
        createPathsRec(sourceNode, [])
      }
    })

    let configs = separateSubarrays(paths)

    configs = addChildrenToMed3pa(configs.topLevelConfigs, configs.internalConfigsExtracted)

    return configs
  }

  function separateSubarrays(paths) {
    const internalConfigs = paths.filter(
      (subarray) => subarray.some((node) => node.supIdNode !== "") && !(subarray.some((node) => node.label === "MED3pa.MPC Model") && !subarray.some((n) => n.label === "MED3pa.APC Model"))
    )

    const topLevelConfigs = paths.filter(
      (subarray) =>
        subarray.length > 1 && subarray.some((node) => node.supIdNode === "") && subarray.some((node) => node.label === "Base Model") && subarray.some((node) => node.label === "Dataset Loader")
    )

    const internalConfigsExtracted = internalConfigs.map((subarray) => {
      const supIdNode = subarray.find((node) => node.supIdNode !== "").supIdNode
      return {
        [supIdNode]: subarray.map((node) => ({ ...node }))
      }
    })

    return { topLevelConfigs, internalConfigsExtracted }
  }
  function addChildrenToMed3pa(topLevelConfigs, internalConfigsExtracted) {
    topLevelConfigs.forEach((config) => {
      const med3paNodes = config.filter((node) => node.label === "MED3pa")
      med3paNodes.forEach((med3paNode) => {
        const med3paId = med3paNode.id
        const extractedConfigs = internalConfigsExtracted.filter((obj) => obj[med3paId])
        if (extractedConfigs.length > 0) {
          med3paNode.children = extractedConfigs.map((obj) => obj[med3paId])
        }
      })
    })
    return topLevelConfigs
  }

  // const getByteSize = (json, sizeType) => {
  //   if (sizeType == undefined) {
  //     sizeType = "bytes"
  //   }
  //   if (json != null && json != undefined) {
  //     let size = new Blob([JSON.stringify(json)]).size
  //     if (sizeType == "bytes") {
  //       return size
  //     } else if (sizeType == "kb") {
  //       return size / 1024
  //     } else if (sizeType == "mb") {
  //       return size / 1024 / 1024
  //     }
  //   }
  // }

  /**
   * Request the backend to run the experiment
   * @param {Number} port port of the backend
   * @param {Object} flow json object of the workflow
   * @param {Boolean} isValid boolean to know if the workflow is valid
   * @returns {Object} results of the experiment
   */
  // function requestBackendRunExperiment(port, flow, isValid) {
  //   if (isValid) {
  //     console.log("sended flow", flow)
  //     console.log("port", port)
  //     setIsProgressUpdating(true)
  //     requestBackend(
  //       port,
  //       "/med3pa/hello_world_med3pa/" + pageId,
  //       flow,
  //       (jsonResponse) => {
  //         console.log("received results:", jsonResponse)
  //         if (!jsonResponse.error) {
  //           updateFlowResults(jsonResponse)
  //           setProgress({
  //             now: 100,
  //             currentLabel: "Done!"
  //           })
  //           setIsProgressUpdating(false)
  //         } else {
  //           setProgress({
  //             now: 0,
  //             currentLabel: ""
  //           })
  //           setIsProgressUpdating(false)
  //           toast.error("Error detected while running the experiment")
  //           console.log("error", jsonResponse.error)
  //           setError(jsonResponse.error)
  //         }
  //       },
  //       (error) => {
  //         setProgress({
  //           now: 0,
  //           currentLabel: ""
  //         })
  //         setIsProgressUpdating(false)
  //         toast.error("Error detected while running the experiment")
  //         console.log("error", error)
  //         setError(error)
  //       }
  //     )
  //   } else {
  //     toast.warn("Workflow is not valid, maybe some default values are not set")
  //   }
  // }

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

  const getPaSettings = (nodes) => {
    nodes.map((node) => {
      // DatasetNode
      {
        setPaWorkflowSettings({
          ...paWorkflowSettings,
          datasetLoaderNode: node.data.internal.settings
        })
      }
    })
  }
  /**
   * execute the whole workflow
   */
  const onRun = useCallback(
    // eslint-disable-next-line no-unused-vars
    (e, up2Id = undefined) => {
      setRunModal(true)
      if (reactFlowInstance) {
        getPaSettings(nodes)
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
    if (targetNode.type === "baseModelNode" || targetNode.type === "ipcModelNode") {
      let isConnected = edges.some((edge) => edge.target === target && nodes.find((node) => node.id === edge.source)?.type === sourceNode.type && edge.source !== source)
      if (isConnected) {
        setEdges((prevEdges) => prevEdges.filter((edge) => !(edge.source === source && edge.target === target)))
        toast.error(targetNode.name + " Node is already connected to another source node.", {
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

  /**
   * Set the subflow id to null to go back to the main workflow
   */
  const onBack = useCallback(() => {
    changeSubFlow("MAIN")
  }, [])

  const groupNodeHandlingDefault = (createBaseNode, newId) => {
    let newNodeStart = createBaseNode(
      { x: 0, y: 200 },
      {
        nodeType: "paOptimizeIO",
        name: "Start",
        description: "Start with an Uncertainty Metric Node. Drop it here.",
        image: "/icon/dataset.png"
      },
      "opt-start"
    )

    newNodeStart = addSpecificToNode(newNodeStart, newId)
    let newNodeEnd = createBaseNode(
      { x: 500, y: 200 },
      {
        nodeType: "paOptimizeIO",
        name: "End",
        description: "MED3pa Configurations can end Differently",
        image: "/icon/dataset.png"
      },
      "opt-end"
    )
    newNodeEnd = addSpecificToNode(newNodeEnd, newId)
    setNodes((nds) => nds.concat(newNodeStart))
    setNodes((nds) => nds.concat(newNodeEnd))
  }

  const runPaPipeline = (flConfig) => {
    let JSONToSend = flConfig

    setIsProgressUpdating(true)
    setIsUpdating(true)

    requestBackend(
      // Send the request
      port,
      "/med3pa/hello_world/" + pageId,
      JSONToSend,
      (jsonResponse) => {
        if (jsonResponse.error) {
          if (typeof jsonResponse.error === "string") {
            jsonResponse.error = JSON.parse(jsonResponse.error)
          }
          setError(jsonResponse.error)
        } else {
          setIsUpdating(false) // Set the isUpdating to false

          setProgressValue({ now: 100, currentLabel: jsonResponse["data"] }) // Set the progress value to 100 and show the message that the backend received from the frontend
          toast.success("We received the config from the front end")
          setIsResults(true)
          setRunModal(false)
          setTimeout(() => {
            setIsProgressUpdating(false)
          }, 2000)

          if (!isProgressUpdating) {
            const folderPath = [getBasePath(EXPERIMENTS), "MED3paResults"].join(MedDataObject.getPathSeparator())
            MedDataObject.createFolderFromPath(folderPath)

            // Create a copy of the jsonResponse without the path property
            const { path, ...modifiedJsonResponse } = jsonResponse

            // Create a file for each path

            path.forEach((pathElement) => {
              const fileName = `MED3paResults_${pathElement}_${new Date().toISOString()}`.replace(/[^a-zA-Z0-9-_]/g, "")
              const fileContent = {
                ...modifiedJsonResponse,
                file_path: [folderPath, pathElement].join(MedDataObject.getPathSeparator())
              }

              MedDataObject.writeFileSync(fileContent, [getBasePath(EXPERIMENTS), "MED3paResults"], fileName, "MED3paResults")
                .then(() => {
                  toast.success(`Result generated and saved for ${pathElement}!`)
                })
                .catch((error) => {
                  console.error(`Error writing file for ${pathElement}:`, error)
                  toast.error(`Failed to save result for ${pathElement}`, error)
                })
            })

            MedDataObject.updateWorkspaceDataObject()
          }
        }
      },
      (error) => {
        setIsUpdating(false)
        setProgressValue({ now: 0, currentLabel: "Message sending failed ❌" })
        toast.error("Sending failed: No configurations set", error)
        console.log(error)
      }
    )
  }

  return (
    <>
      <RunPipelineModal
        show={showRunModal}
        onHide={() => {
          setRunModal(false)
        }}
        configs={treeData}
        nodes={nodes}
        onRun={runPaPipeline}
      />

      <PaWorkflowBase
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
          runNode: runNode
        }}
        // optional props
        customOnConnect={onConnect}
        onDeleteNode={onDeleteNode}
        onNodeDrag={onNodeDrag}
        // reprensents the visual over the workflow
        groupNodeHandlingDefault={groupNodeHandlingDefault}
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
        uiTopCenter={
          <>
            {workflowType == "pamodels" && (
              <>
                <div>
                  {groupNodeId.id != "pa" && (
                    <div className="subFlow-title" style={{ marginTop: "20px" }}>
                      MED3pa Configuration
                      <BtnDiv
                        buttonsList={[
                          {
                            type: "back",
                            onClick: onBack
                          }
                        ]}
                      />
                    </div>
                  )}
                </div>
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
