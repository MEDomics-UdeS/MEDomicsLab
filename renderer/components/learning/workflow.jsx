import React, { useState, useCallback, useMemo, useEffect, useContext } from "react"
import { toast } from "react-toastify"
import Form from "react-bootstrap/Form"
import { useNodesState, useEdgesState, useReactFlow, addEdge } from "reactflow"
import WorkflowBase from "../flow/workflowBase"
import { loadJsonSync } from "../../utilities/fileManagementUtils"
import { requestBackend } from "../../utilities/requests"
import EditableLabel from "react-simple-editlabel"
import BtnDiv from "../flow/btnDiv"
import ProgressBarRequests from "../generalPurpose/progressBarRequests"
import { PageInfosContext } from "../mainPages/moduleBasics/pageInfosContext"
import { FlowFunctionsContext } from "../flow/context/flowFunctionsContext"
import { FlowResultsContext } from "../flow/context/flowResultsContext"
import { WorkspaceContext } from "../workspace/workspaceContext"
import { ErrorRequestContext } from "../generalPurpose/errorRequestContext.jsx"
import MedDataObject from "../workspace/medDataObject"
import { modifyZipFileSync } from "../../utilities/customZipFile.js"
import { sceneDescription } from "../../public/setupVariables/learningNodesParams.jsx"

// here are the different types of nodes implemented in the workflow
import StandardNode from "./nodesTypes/standardNode"
import SelectionNode from "./nodesTypes/selectionNode"
import GroupNode from "../flow/groupNode"
import OptimizeIO from "./nodesTypes/optimizeIO"
import DatasetNode from "./nodesTypes/datasetNode"
import LoadModelNode from "./nodesTypes/loadModelNode"

// here are the parameters of the nodes
import nodesParams from "../../public/setupVariables/allNodesParams"

// here are static functions used in the workflow
import { removeDuplicates, deepCopy } from "../../utilities/staticFunctions"
import { defaultValueFromType } from "../../utilities/learning/inputTypesUtils.js"
import { FlowInfosContext } from "../flow/context/flowInfosContext.jsx"

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
const Workflow = ({ setWorkflowType, workflowType }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]) // nodes array, setNodes is used to update the nodes array, onNodesChange is a callback hook that is executed when the nodes array is changed
  const [edges, setEdges, onEdgesChange] = useEdgesState([]) // edges array, setEdges is used to update the edges array, onEdgesChange is a callback hook that is executed when the edges array is changed
  const [reactFlowInstance, setReactFlowInstance] = useState(null) // reactFlowInstance is used to get the reactFlowInstance object important for the reactFlow library
  const [MLType, setMLType] = useState("classification") // MLType is used to know which machine learning type is selected
  const { setViewport } = useReactFlow() // setViewport is used to update the viewport of the workflow
  const [treeData, setTreeData] = useState({}) // treeData is used to set the data of the tree menu
  const { getIntersectingNodes } = useReactFlow() // getIntersectingNodes is used to get the intersecting nodes of a node
  const [intersections, setIntersections] = useState([]) // intersections is used to store the intersecting nodes related to optimize nodes start and end
  const [isProgressUpdating, setIsProgressUpdating] = useState(false) // progress is used to store the progress of the workflow execution
  const [progress, setProgress] = useState({
    now: 0,
    currentLabel: ""
  })
  const { groupNodeId, changeSubFlow, hasNewConnection } = useContext(FlowFunctionsContext)
  const { config, pageId, configPath } = useContext(PageInfosContext) // used to get the page infos such as id and config path
  const { updateFlowResults, isResults } = useContext(FlowResultsContext)
  const { canRun } = useContext(FlowInfosContext)
  const { port } = useContext(WorkspaceContext)
  const { setError } = useContext(ErrorRequestContext)

  // declare node types using useMemo hook to avoid re-creating component types unnecessarily (it memorizes the output) https://www.w3schools.com/react/react_usememo.asp
  const nodeTypes = useMemo(
    () => ({
      standardNode: StandardNode,
      selectionNode: SelectionNode,
      groupNode: GroupNode,
      optimizeIO: OptimizeIO,
      datasetNode: DatasetNode,
      loadModelNode: LoadModelNode
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

  // when isResults is changed, we set the progressBar to completed state
  useEffect(() => {
    if (isResults) {
      setProgress({
        now: 100,
        currentLabel: "Done!"
      })
    }
  }, [isResults])

  // executed when the machine learning type is changed
  // it updates the possible settings of the nodes
  useEffect(() => {
    setNodes((nds) =>
      nds.map((node) => {
        // it's important that you create a new object here in order to notify react flow about the change
        node.data = {
          ...node.data
        }
        if (!node.id.includes("opt")) {
          let subworkflowType = node.data.internal.subflowId != "MAIN" ? "optimize" : "learning"
          node.data.setupParam.possibleSettings = deepCopy(staticNodesParams[subworkflowType][node.data.internal.type]["possibleSettings"][MLType])
          node.data.internal.settings = {}
          node.data.internal.checkedOptions = []
          if (node.type == "selectionNode") {
            node.data.internal.selection = Object.keys(node.data.setupParam.possibleSettings)[0]
          }
        }
        return node
      })
    )
  }, [MLType])

  // executed when the nodes array and edges array are changed
  useEffect(() => {
    setTreeData(createTreeFromNodes())
  }, [nodes, edges])

  // execute this when groupNodeId change. I put it in useEffect because it assures groupNodeId is updated
  useEffect(() => {
    if (groupNodeId.id == "MAIN") {
      setWorkflowType("learning")
      hideNodesbut(groupNodeId.id)
    } else {
      setWorkflowType("optimize")
      hideNodesbut(groupNodeId.id)
    }
  }, [groupNodeId])

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
        edge.hidden = nodes.find((node) => node.id === edge.source).data.internal.subflowId != activeSubflowId || nodes.find((node) => node.id === edge.target).data.internal.subflowId != activeSubflowId
        return edge
      })
    )
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
          if (targetNode.type != "groupNode") {
            let subIdText = ""
            let subflowId = targetNode.data.internal.subflowId
            if (subflowId != "MAIN") {
              subIdText = deepCopy(nodes.find((node) => node.id == subflowId)).data.internal.name + "."
            }
            children[targetNode.id] = {
              label: subIdText + targetNode.data.internal.name,
              nodes: createTreeFromNodesRec(targetNode)
            }
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
          label: sourceNode.data.internal.name,
          nodes: createTreeFromNodesRec(sourceNode)
        }
      }
    })

    return treeMenuData
  }

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
        Object.values(newScene.nodes).forEach((node) => {
          if (!node.id.includes("opt")) {
            let subworkflowType = node.data.internal.subflowId != "MAIN" ? "optimize" : "learning"
            let setupParams = deepCopy(staticNodesParams[subworkflowType][node.data.internal.type])
            setupParams.possibleSettings = setupParams["possibleSettings"][newScene.MLType]
            node.data.setupParam = setupParams
          }
        })
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
   * @param {String} associatedNode id of the parent node if the node is a sub-group node
   * @returns
   */
  const addSpecificToNode = (newNode, associatedNode) => {
    // if the node is not a static node for a optimize subflow, it needs possible settings
    let setupParams = {}
    if (!newNode.id.includes("opt")) {
      setupParams = deepCopy(staticNodesParams[workflowType][newNode.data.internal.type])
      setupParams.possibleSettings = setupParams["possibleSettings"][MLType]
    }
    newNode.id = `${newNode.id}${associatedNode ? `.${associatedNode}` : ""}` // if the node is a sub-group node, it has the id of the parent node seperated by a dot. useful when processing only ids
    newNode.hidden = newNode.type == "optimizeIO"
    newNode.zIndex = newNode.type == "optimizeIO" ? 1 : 1010
    newNode.data.tooltipBy = "type"
    newNode.data.setupParam = setupParams
    newNode.data.internal.code = ""
    newNode.className = setupParams.classes

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
    newNode.data.internal.subflowId = !associatedNode ? groupNodeId.id : associatedNode
    newNode.data.internal.hasWarning = { state: false }

    return newNode
  }

  /**
   *
   * @param {function} createBaseNode function to create a base node. Useful to create automatically base nodes in the subflow
   * @param {String} newId id of the parent node
   */
  const groupNodeHandlingDefault = (createBaseNode, newId) => {
    let newNodeStart = createBaseNode(
      { x: 0, y: 200 },
      {
        nodeType: "optimizeIO",
        name: "Start",
        image: "/icon/dataset.png"
      },
      "opt-start"
    )
    newNodeStart = addSpecificToNode(newNodeStart, newId)

    let newNodeEnd = createBaseNode(
      { x: 500, y: 200 },
      {
        nodeType: "optimizeIO",
        name: "End",
        image: "/icon/dataset.png"
      },
      "opt-end"
    )
    newNodeEnd = addSpecificToNode(newNodeEnd, newId)
    setNodes((nds) => nds.concat(newNodeStart))
    setNodes((nds) => nds.concat(newNodeEnd))
  }

  /**
   *
   * @param {String} id id of the node to execute
   *
   * This function is called when the user clicks on the run button of a node
   * It executes the pipelines finishing with this node
   */
  const runNode = useCallback(
    (id) => {
      if (id) {
        console.log("run node", id)
        console.log(reactFlowInstance)
        onRun(null, id)
      }
    },
    [reactFlowInstance, MLType, nodes, edges, intersections]
  )

  /**
   * execute the whole workflow
   */
  const onRun = useCallback(
    (e, up2Id = undefined) => {
      if (reactFlowInstance) {
        let flow = deepCopy(reactFlowInstance.toObject())
        flow.MLType = MLType
        flow.nodes.forEach((node) => {
          node.data.setupParam = null
        })

        let { newflow, isValid } = cleanJson2Send(flow, up2Id)
        flow = newflow
        if (isValid) {
          console.log("sended flow", flow)
          console.log("port", port)
          setIsProgressUpdating(true)
          requestBackend(
            port,
            "/learning/run_experiment/" + pageId,
            flow,
            (jsonResponse) => {
              console.log("received results:", jsonResponse)
              if (!jsonResponse.error) {
                updateFlowResults(jsonResponse)
                setProgress({
                  now: 100,
                  currentLabel: "Done!"
                })
                setIsProgressUpdating(false)
              } else {
                setProgress({
                  now: 0,
                  currentLabel: ""
                })
                setIsProgressUpdating(false)
                toast.error("Error detected while running the experiment")
                console.log("error", jsonResponse.error)
                setError(jsonResponse.error)
              }
            },
            (error) => {
              setProgress({
                now: 0,
                currentLabel: ""
              })
              setIsProgressUpdating(false)
              toast.error("Error detected while running the experiment")
              console.log("error", error)
              setError(error)
            }
          )
        } else {
          toast.warn("Workflow is not valid, maybe some default values are not set")
        }
      } else {
        toast.warn("react flow instance not found")
      }
    },
    [reactFlowInstance, MLType, nodes, edges, intersections, configPath]
  )

  /**
   * @param {Object} json json object to clean
   * @param {String} up2Id id of the node to run
   * @returns {Object} cleaned json object
   *
   * This function cleans the json object to send to the server
   * It removes the optimize nodes and the edges linked to them
   * It also checks if the default values are set for each node
   * It returns the cleaned json object and a boolean to know if the default values are set
   */
  const cleanJson2Send = useCallback(
    (json, up2Id) => {
      // function to check if default values are set
      const checkDefaultValues = (node) => {
        let isValid = true
        if ("default" in node.data.setupParam.possibleSettings) {
          Object.entries(node.data.setupParam.possibleSettings.default).map(([settingName, setting]) => {
            console.log("settingName", settingName)
            console.log("settings", node)
            if (settingName in node.data.internal.settings) {
              if (node.data.internal.settings[settingName] == defaultValueFromType[setting.type]) {
                isValid = false
              }
            } else {
              isValid = false
            }
          })
        }
        if (!isValid) {
          toast.warn("Some default values are not set for node: " + node.data.internal.name + ".", {
            position: "bottom-right",
            autoClose: 2000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "light",
            toastId: "customId"
          })
        }
        return isValid
      }

      //clean recursive pipelines from treeData
      let nbNodes2Run = 0
      console.log("up2Id", up2Id)
      let isValidDefault = true
      const cleanTreeDataRec = (node) => {
        let children = {}
        Object.keys(node).forEach((key) => {
          // check if node is a create model node
          // n pipelines should be added according to model node inputs
          let hasModels = false
          let currentNode = nodes.find((node) => node.id === key)
          let nodeType = currentNode.data.internal.type
          let edgesCopy = deepCopy(edges)
          if (nodeType == "train_model") {
            edgesCopy = edgesCopy.filter((edge) => edge.target == currentNode.id)
            edgesCopy = edgesCopy.reduce((acc, edge) => {
              if (edge.target == currentNode.id) {
                let sourceNode = nodes.find((node) => node.id == edge.source)
                if (sourceNode.data.internal.type == "model") {
                  acc.push(edge)
                }
              }
              return acc
            }, [])
            hasModels = true
          }

          // refomat multiple list to backend to understand
          if (nodeType == "compare_models") {
            const reformatMultipleList = (list) => {
              let newList = []
              list.forEach((item) => {
                newList.push(item.value)
              })
              return newList
            }
            let currentNodeCanModify = json.nodes.find((node) => node.id === key)
            console.log(currentNodeCanModify)
            if (currentNode.data.internal.settings.include) {
              let reformattedList = reformatMultipleList(currentNode.data.internal.settings.include)
              currentNodeCanModify.data.internal.settings.include = reformattedList
            }
            if (currentNode.data.internal.settings.exclude) {
              let reformattedList = reformatMultipleList(currentNode.data.internal.settings.exclude)
              currentNodeCanModify.data.internal.settings.exclude = reformattedList
            }
          }

          // check if node has default values
          isValidDefault = isValidDefault && checkDefaultValues(currentNode)

          // if this is not a leaf, we need to go deeper
          if (node[key].nodes != {}) {
            // if this is a create model node, we need to add n pipelines
            if (hasModels) {
              edgesCopy.forEach((edge) => {
                let id = key + "*" + edge.source
                if (key != up2Id) {
                  children[id] = cleanTreeDataRec(node[key].nodes)
                } else {
                  children[id] = {}
                }
              })
              // if this is not a create model node, we continue normally
            } else {
              if (key != up2Id) {
                children[key] = cleanTreeDataRec(node[key].nodes)
              } else {
                children[key] = {}
              }
            }
            nbNodes2Run++
          }
        })
        return children
      }
      console.log("treeData", treeData)
      let recursivePipelines = cleanTreeDataRec(treeData)
      console.log("recursivePipelines", recursivePipelines)

      //clean flow
      let newJson = {}
      newJson.MLType = json.MLType
      newJson.nodes = {}
      let nodesCopy = deepCopy(json.nodes)
      nodesCopy.forEach((node) => {
        !node.id.includes("opt") && (newJson.nodes[node.id] = node)
      })

      newJson.pipelines = recursivePipelines
      newJson.pageId = pageId
      // eslint-disable-next-line camelcase
      newJson.path_seperator = MedDataObject.getPathSeparator()
      let scenePath = configPath.substring(0, configPath.lastIndexOf(newJson.path_seperator))
      newJson.paths = {
        ws: scenePath
      }
      newJson.internalPaths = {}
      sceneDescription.extrenalFolders.forEach((folder) => {
        newJson.paths[folder] = scenePath + newJson.path_seperator + folder
      })
      sceneDescription.internalFolders.forEach((folder) => {
        newJson.internalPaths[folder] = configPath.split(".")[0] + newJson.path_seperator + folder
      })
      newJson.configPath = configPath
      newJson.nbNodes2Run = nbNodes2Run + 1 // +1 because the results generation is a time consuming task

      return { newflow: newJson, isValid: isValidDefault }
    },
    [reactFlowInstance, MLType, nodes, edges, intersections, treeData]
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
   *
   * @param {Event} e event object
   *
   * This function is called when the user changes the machine learning type
   */
  const handleMlTypeChanged = (e) => {
    confirm("This action resets all node's setting.\nBe sure to save if you want to keep your changes") && setMLType(e.target.value)
  }

  /**
   * Set the subflow id to null to go back to the main workflow
   */
  const onBack = useCallback(() => {
    changeSubFlow("MAIN")
  }, [])

  /**
   *
   * @param {String} value new value of the node name
   *
   * This function is called when the user changes the name of the node (focus out of the input).
   * It checks if the name is over 15 characters and if it is, it displays a warning message.
   * It then updates the name of the node by calling the updateNode function
   * this function is specific to groupNodes
   */
  const newNameHasBeenWritten = (value) => {
    let newName = value
    if (value.length > 15) {
      newName = value.substring(0, 15)
      toast.warn("Node name cannot be over 15 characters. Only the first 15 characters will be saved.", {
        position: "bottom-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
        toastId: "customId"
      })
    }
    let groupNode = nodes.find((node) => node.id === groupNodeId.id)
    groupNode.data.internal.name = newName
  }

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
          runNode: runNode
        }}
        // optional props
        onDeleteNode={onDeleteNode}
        groupNodeHandlingDefault={groupNodeHandlingDefault}
        onNodeDrag={onNodeDrag}
        // reprensents the visual over the workflow
        uiTopRight={
          <>
            {workflowType == "learning" && (
              <>
                <Form.Select className="margin-left-10" aria-label="Default select example" value={MLType} onChange={handleMlTypeChanged}>
                  <option value="classification">Classification</option>
                  <option value="regression">Regression</option>
                  {/* <option value="survival-analysis">Survival Analysis</option> */}
                </Form.Select>
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
            {workflowType == "optimize" && (
              <>
                <div>
                  {groupNodeId.id != "MAIN" && (
                    <div className="subFlow-title">
                      <EditableLabel
                        text={nodes.find((node) => node.id === groupNodeId.id).data.internal.name}
                        labelClassName="node-editableLabel"
                        inputClassName="node-editableLabel"
                        inputWidth="20ch"
                        inputHeight="45px"
                        labelFontWeight="bold"
                        inputFontWeight="bold"
                        onFocusOut={(value) => {
                          newNameHasBeenWritten(value)
                        }}
                      />

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
            <div className="panel-bottom-center">{isProgressUpdating && <ProgressBarRequests progressBarProps={{ animated: true, variant: "success" }} isUpdating={isProgressUpdating} setIsUpdating={setIsProgressUpdating} progress={progress} setProgress={setProgress} requestTopic={"learning/progress/" + pageId} />}</div>
          </>
        }
      />
    </>
  )
}

export default Workflow
