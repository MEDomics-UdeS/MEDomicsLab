/* eslint-disable camelcase */
import React, { useState, useCallback, useMemo, useEffect, useContext } from "react"
import { toast } from "react-toastify"
// import { ipcRenderer } from "electron"
import { useNodesState, useEdgesState, useReactFlow, addEdge } from "reactflow"
import WorkflowBase from "../flow/workflowBase.jsx"
import { loadJsonSync } from "../../utilities/fileManagementUtils.js"
import BtnDiv from "../flow/btnDiv.jsx"
import ProgressBarRequests from "../generalPurpose/progressBarRequests.jsx"
import { PageInfosContext } from "../mainPages/moduleBasics/pageInfosContext.jsx"
//import { defaultValueFromType } from "../../utilities/learning/inputTypesUtils.js"
// import { FlowResultsContext } from "../flow/context/flowResultsContext"
// import { WorkspaceContext } from "../workspace/workspaceContext"
// import { ErrorRequestContext } from "../generalPurpose/errorRequestContext.jsx"

// import { requestBackend } from "../../utilities/requests"
import MedDataObject from "../workspace/medDataObject.js"
import { modifyZipFileSync } from "../../utilities/customZipFile.js"
// import { sceneDescription } from "../../public/setupVariables/learningNodesParams.jsx"

import RunPipelineModal from "./runPipelineModal"
// here are the different types of nodes implemented in the workflow

// here are the parameters of the nodes
import nodesParams from "../../public/setupVariables/allNodesParams.jsx"
import evalNodesParams from "../../public/setupVariables/evalNodesParams.jsx"

// here are static functions used in the workflow
// import Path from "path"
import { removeDuplicates, deepCopy } from "../../utilities/staticFunctions.js"
import { FlowInfosContext } from "../flow/context/flowInfosContext.jsx"
import StandardNode from "../learning/nodesTypes/standardNode.jsx"
import SelectionNode from "../learning/nodesTypes/selectionNode.jsx"
import { FlowFunctionsContext } from "../flow/context/flowFunctionsContext"
import OptimizeIO from "../learning/nodesTypes/optimizeIO.jsx"
import GroupNode from "../flow/groupNode.jsx"
import LoadModelNode from "../learning/nodesTypes/loadModelNode.jsx"
import DatasetLoaderNode from "./nodesTypes/datasetLoaderNode.jsx"
import BaseModelNode from "./nodesTypes/baseModelNode.jsx"
import EvaluationNode from "./nodesTypes/evaluationNode.jsx"
import MED3paNode from "./nodesTypes/med3paNode.jsx"
import IPCModelNode from "./nodesTypes/ipcModelNode.jsx"
import APCModelNode from "./nodesTypes/apcModelNode.jsx"
import MPCModelNode from "./nodesTypes/mpcModelNode.jsx"
import UncertaintyMetricsNode from "./nodesTypes/uncertainyMetricsNode.jsx"
import PaOptimizeNode from "./nodesTypes/paOptimize.jsx"

import DetectronNode from "./nodesTypes/detectronNode.jsx"

const staticNodesParams = nodesParams // represents static nodes parameters
const staticevalNodesParams = evalNodesParams

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
  // const { updateFlowResults } = useContext(FlowResultsContext)
  // const { port } = useContext(WorkspaceContext)
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
  const { config, pageId, configPath } = useContext(PageInfosContext) // used to get the page infos such as id and config path
  const { canRun } = useContext(FlowInfosContext)
  // const { setError } = useContext(ErrorRequestContext)

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
      ipcModelNode: IPCModelNode,
      apcModelNode: APCModelNode,
      mpcModelNode: MPCModelNode,
      groupNode: GroupNode,
      paOptimizeNode: PaOptimizeNode,
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
    console.log(treeData)
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
          // if (node.type == "selectionNode") {
          //   node.data.internal.selection = Object.keys(node.data.setupParam.possibleSettings)[0]
          // }
        }
        return node
      })
    )
  }, [MLType])

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
    // first, we add 'intersect' class to the nodes that are intersecting with OptimizeIO nodes
    setNodes((nds) =>
      nds.map((node) => {
        node.data = {
          ...node.data
        }
        node.className = ""
        intersections.forEach((intersect) => {
          if (intersect.targetId == node.id || intersect.sourceId == node.id) {
            node.className = "intersect"
          }
        })
        return node
      })
    )

    // then, we add the edges between the intersecting nodes and hide them to simulate the connection between the nodes
    // this is useful to create the recursive workflow automatically
    // it basically bypasses the optimize nodes
    setEdges((eds) => eds.filter((edge) => !edge.id.includes("opt"))) // remove all edges that are linked to optimize nodes
    intersections.forEach((intersect, index) => {
      if (intersect.targetId.includes("start")) {
        let groupNodeId = intersect.targetId.split(".")[1]
        let groupNodeIdConnections = edges.filter((eds) => eds.target == groupNodeId)
        groupNodeIdConnections.forEach((groupNodeIdConnection, index2) => {
          let edgeSource = groupNodeIdConnection.source
          let edgeTarget = intersect.sourceId
          setEdges((eds) =>
            addEdge(
              {
                source: edgeSource,
                sourceHandle: 0 + "_" + edgeSource, // we add 0_ because the sourceHandle always starts with 0_. Handles are created by a for loop so it represents an index
                target: edgeTarget,
                targetHandle: 0 + "_" + edgeTarget,
                id: index + "_" + index2 + edgeSource + "_" + edgeTarget + "_opt",
                hidden: true
              },
              eds
            )
          )
        })
      } else if (intersect.targetId.includes("end")) {
        let groupNodeId = intersect.targetId.split(".")[1]
        let groupNodeIdConnections = edges.filter((eds) => eds.source == groupNodeId)
        groupNodeIdConnections.forEach((groupNodeIdConnection, index2) => {
          let edgeSource = intersect.sourceId
          let edgeTarget = groupNodeIdConnection.target
          setEdges((eds) =>
            addEdge(
              {
                source: edgeSource,
                sourceHandle: 0 + "_" + edgeSource, // we add 0_ because the sourceHandle always starts with 0_. Handles are created by a for loop so it represents an index
                target: edgeTarget,
                targetHandle: 0 + "_" + edgeTarget,
                id: index + "_" + index2 + edgeSource + "_" + edgeTarget + "_opt",
                hidden: true
              },
              eds
            )
          )
        })
      }
    })
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

    newNode.hidden = newNode.type == "optimizeIO"
    newNode.zIndex = newNode.type == "optimizeIO" ? 1 : 1010
    newNode.data.tooltipBy = "type"
    newNode.data.setupParam = setupParams

    newNode.data.internal.code = ""
    newNode.className = setupParams.classes

    if (newNode.type === "evaluationNode" || newNode.type === "datasetLoaderNode") {
      newNode.data.internal.contentType = "default"
      newNode.data.internal.connected = false
    }

    newNode.data.internal.description = ""

    let tempDefaultSettings = {}
    if (newNode.data.setupParam.possibleSettings) {
      const possibleSettings = newNode.data.setupParam.possibleSettings
      if (possibleSettings.detectron && possibleSettings.med3pa) {
        // Handle the node with two settings
        // "default" in newNode.data.setupParam.possibleSettings &&
        //   Object.entries(newNode.data.setupParam.possibleSettings.default).map(([settingName, setting]) => {
        //     tempDefaultSettings[settingName] = defaultValueFromType[setting.type]
        //   })

        Object.entries(possibleSettings.detectron).forEach(([settingName, setting]) => {
          tempDefaultSettings[`detectron_${settingName}`] = setting.default_val
        })
        Object.entries(possibleSettings.med3pa).forEach(([settingName, setting]) => {
          tempDefaultSettings[`med3pa_${settingName}`] = setting.default_val
        })
      } else {
        // Handle nodes with one setting
        Object.entries(possibleSettings).forEach(([settingName, setting]) => {
          tempDefaultSettings[settingName] = setting.default_val
        })
      }
    }

    newNode.data.internal.settings = tempDefaultSettings

    newNode.data.internal.selection = newNode.type == "selectionNode" && Object.keys(setupParams.possibleSettings)[0]
    newNode.data.internal.checkedOptions = []
    newNode.data.internal.subflowId = !associatedNode ? groupNodeId.id : associatedNode
    newNode.data.internal.hasWarning = { state: false }
    console.log("EDGES:", edges)

    return newNode
  }

  /**
   * @returns {Object} updated tree data
   *
   * This function creates the tree data from the nodes array
   * it is used to create the recursive workflow
   */
  const createTreeFromNodes = () => {
    // recursively create tree from nodes
    const createTreeFromNodesRec = (node) => {
      let children = {}

      edges.forEach((edge) => {
        if (edge.source == node.id) {
          let targetNode = deepCopy(nodes.find((node) => node.id === edge.target))
          let subIdText = ""
          let supIdNode = ""
          let subflowId = targetNode.data.internal.subflowId
          if (subflowId != "MAIN") {
            subIdText = deepCopy(nodes.find((node) => node.id == subflowId)).data.internal.name + "."
            supIdNode = subflowId
          }
          children[targetNode.id] = {
            id: targetNode.id,
            supIdNode: supIdNode,
            label: subIdText + targetNode.data.internal.name,
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
        let subIdText = ""
        let supIdNode = ""
        let subflowId = sourceNode.data.internal.subflowId
        if (subflowId != "MAIN") {
          subIdText = deepCopy(nodes.find((node) => node.id == subflowId)).data.internal.name + "."
          supIdNode = subflowId
        }
        treeMenuData[sourceNode.id] = {
          id: sourceNode.id,
          supIdNode: supIdNode,
          label: subIdText + sourceNode.data.internal.name,
          nodes: createTreeFromNodesRec(sourceNode)
        }
      }
    })

    return treeMenuData
  }

  const createPathsToLeafNodes = () => {
    // Recursively create paths from nodes to leaf nodes
    const createPathsRec = (node, currentPath) => {
      currentPath.push({
        id: node.id,
        supIdNode: node.data.internal.subflowId !== "MAIN" ? node.data.internal.subflowId : "",
        label: (node.data.internal.subflowId !== "MAIN" ? nodes.find((n) => n.id === node.data.internal.subflowId).data.internal.name + "." : "") + node.data.internal.name
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
        paths.push(currentPath)
      }
    }

    let paths = []
    edges.forEach((edge) => {
      let sourceNode = deepCopy(nodes.find((node) => node.id === edge.source))
      if (sourceNode.data.setupParam.classes.split(" ").includes("startNode")) {
        createPathsRec(sourceNode, [])
      }
    })

    return paths
  }

  /**

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
  //       "/learning/run_experiment/" + pageId,
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
      if (node.type === "datasetLoaderNode") {
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

    if (sourceNode.type === "datasetLoaderNode" && targetNode.type !== "baseModelNode") {
      if (!sourceNode.data.internal.connected || sourceNode.data.internal.hasWarning["state"]) {
        return "Please select necessary Base Model Datasets before Evaluating"
      }
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
    sourceNode.data.internal.connected = true
    targetNode.data.internal.connected = true

    if (targetNode.type === "evaluationNode") {
      let newStyle = null

      if (sourceNode.type === "detectronNode") {
        newStyle = "evalDetectron"
      } else {
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
        sourceNode.data.internal.hasWarning.state = true
        nodes.map((node) => {
          if (node.id === target) {
            sourceNode.data.internal.contentType = "evalNode"
          }
        })
      } else {
        sourceNode.data.internal.contentType = "default"
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
  const removeConfigsWithoutBaseModel = (configs) => {
    return configs.filter((config) => Object.values(config).some((node) => node.label === "Base Model"))
  }

  // const getConfigs = (paths, i = 0, result = []) => {
  //   if (!Array.isArray(result)) {
  //     result = []
  //   }

  //   paths.forEach((path) => {
  //     let newConfig = {}
  //     path.forEach((node) => {
  //       newConfig[node.label] = node
  //     })
  //     result.push(newConfig)
  //   })
  //   return result
  // }

  const groupNodeHandlingDefault = (createBaseNode, newId) => {
    // let newNodeStart = createBaseNode(
    //   { x: 0, y: 200 },
    //   {
    //     nodeType: "optimizeIO",
    //     name: "Start",
    //     image: "/icon/dataset.png"
    //   },
    //   "opt-start"
    // )
    // newNodeStart = addSpecificToNode(newNodeStart, newId)
    // let newNodeEnd = createBaseNode(
    //   { x: 500, y: 200 },
    //   {
    //     nodeType: "optimizeIO",
    //     name: "End",
    //     image: "/icon/dataset.png"
    //   },
    //   "opt-end"
    // )
    // newNodeEnd = addSpecificToNode(newNodeEnd, newId)
    // setNodes((nds) => nds.concat(newNodeStart))
    // setNodes((nds) => nds.concat(newNodeEnd))
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
