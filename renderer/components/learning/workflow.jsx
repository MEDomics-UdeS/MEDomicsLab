import React, {
  useState,
  useCallback,
  useMemo,
  useEffect,
  useContext
} from "react"
import { toast } from "react-toastify"
import Form from "react-bootstrap/Form"
import { useNodesState, useEdgesState, useReactFlow, addEdge } from "reactflow"
import WorkflowBase from "../flow/workflowBase"
import TreeMenu from "react-simple-tree-menu" // TODO: https://www.npmjs.com/package/react-simple-tree-menu change plus sign to chevron
import { loadJsonSync, downloadJson } from "../../utilities/fileManagementUtils"
import { requestJson } from "../../utilities/requests"
import EditableLabel from "react-simple-editlabel"
import BtnDiv from "../flow/btnDiv"
import ProgressBarRequests from "../flow/progressBarRequests"
import { FlowInfosContext } from "../flow/context/flowInfosContext"

// here are the different types of nodes implemented in the workflow
import StandardNode from "./nodesTypes/standardNode"
import SelectionNode from "./nodesTypes/selectionNode"
import GroupNode from "../flow/groupNode"
import OptimizeIO from "./nodesTypes/optimizeIO"

// here are the parameters of the nodes
import nodesParams from "../../public/setupVariables/allNodesParams"

// here are static functions used in the workflow
import { removeDuplicates, deepCopy } from "../../utilities/staticFunctions"

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
  const [groupNodeId, setGroupNodeId] = useState(null) // groupNodeId is used to know which optimize node has selected ()
  const { getIntersectingNodes } = useReactFlow() // getIntersectingNodes is used to get the intersecting nodes of a node
  const [intersections, setIntersections] = useState([]) // intersections is used to store the intersecting nodes related to optimize nodes start and end
  const [isProgressUpdating, setIsProgressUpdating] = useState(false) // progress is used to store the progress of the workflow execution
  const [nodeUpdate, setNodeUpdate] = useState({}) // nodeUpdate is used to update a node internal data
  const { flowInfos } = useContext(FlowInfosContext) // used to get the flow infos

  // declare node types using useMemo hook to avoid re-creating component types unnecessarily (it memorizes the output) https://www.w3schools.com/react/react_usememo.asp
  const nodeTypes = useMemo(
    () => ({
      standardNode: StandardNode,
      selectionNode: SelectionNode,
      groupNode: GroupNode,
      optimizeIO: OptimizeIO
    }),
    []
  )

  // executed when the machine learning type is changed
  // it updates the possible settings of the nodes
  useEffect(() => {
    console.log("mltype changed", MLType)
    setNodes((nds) =>
      nds.map((node) => {
        // it's important that you create a new object here in order to notify react flow about the change
        node.data = {
          ...node.data
        }
        if (!node.id.includes("opt")) {
          let subworkflowType = node.data.internal.subflowId
            ? "optimize"
            : "learning"
          node.data.setupParam.possibleSettings = deepCopy(
            staticNodesParams[subworkflowType][node.data.internal.type][
              "possibleSettings"
            ][MLType]
          )
          node.data.internal.settings = {}
          node.data.internal.checkedOptions = []
          if (node.type == "selectionNode") {
            node.data.internal.selection = Object.keys(
              node.data.setupParam.possibleSettings
            )[0]
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
    if (groupNodeId) {
      setWorkflowType("optimize")
      hideNodesbut(groupNodeId)
    } else {
      setWorkflowType("learning")
      hideNodesbut(groupNodeId)
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
      let edgeSource = null
      let edgeTarget = null
      if (intersect.targetId.includes("start")) {
        edgeSource = intersect.targetId.split(".")[1]
        edgeTarget = intersect.sourceId
        let prevOptEdge = edges.find((edge) => edge.target == edgeSource)
        if (prevOptEdge) {
          edgeSource = prevOptEdge.source
        } else {
          edgeSource = null
        }
      } else if (intersect.targetId.includes("end")) {
        edgeSource = intersect.sourceId
        edgeTarget = intersect.targetId.split(".")[1]
        let nextOptEdge = edges.find((edge) => edge.source == edgeTarget)
        if (nextOptEdge) {
          edgeTarget = nextOptEdge.target
        } else {
          edgeTarget = null
        }
      }

      edgeSource &&
        edgeTarget &&
        setEdges((eds) =>
          addEdge(
            {
              source: edgeSource,
              sourceHandle: "0_" + edgeSource, // we add 0_ because the sourceHandle always starts with 0_. Handles are created by a for loop so it represents an index
              target: edgeTarget,
              targetHandle: "0_" + edgeTarget,
              id: index + intersect.targetId,
              hidden: true
            },
            eds
          )
        )
    })
  }, [intersections])

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
          nodes.find((node) => node.id === edge.source).data.internal
            .subflowId != activeSubflowId ||
          nodes.find((node) => node.id === edge.target).data.internal
            .subflowId != activeSubflowId
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
          let targetNode = deepCopy(
            nodes.find((node) => node.id === edge.target)
          )
          if (targetNode.type != "groupNode") {
            let subIdText = ""
            let subflowId = targetNode.data.internal.subflowId
            if (subflowId) {
              subIdText =
                deepCopy(nodes.find((node) => node.id == subflowId)).data
                  .internal.name + "."
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
      let sourceNode = JSON.parse(
        JSON.stringify(nodes.find((node) => node.id === edge.source))
      )
      if (sourceNode.name == "Dataset") {
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
      rawIntersects = rawIntersects.filter(
        (n) =>
          nodes.find((node) => node.id == n).data.internal.subflowId ==
          node.data.internal.subflowId
      )
      let isNew = false

      // clear all intersections associated with
      let newIntersections = intersections.filter(
        (int) => int.sourceId !== node.id && int.targetId !== node.id
      )

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
          setIntersections((intersects) =>
            intersects.filter((int) => int.targetId !== node.id)
          )
        } else {
          setIntersections((intersects) =>
            intersects.filter((int) => int.sourceId !== node.id)
          )
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
      confirmation = confirm(
        "Are you sure you want to import a new experiment?\nEvery data will be lost."
      )
    }
    if (confirmation) {
      const restoreFlow = async () => {
        const flow = await loadJsonSync() // wait for the json file to be loaded (see /utilities/fileManagementUtils.js)
        console.log("loaded flow", flow)

        Object.values(flow.nodes).forEach((node) => {
          if (!node.id.includes("opt")) {
            // the line below is important because functions are not serializable
            node.data.parentFct = {
              deleteNode: onDeleteNode,
              updateNode: setNodeUpdate,
              runNode: runNode,
              changeSubFlow: setGroupNodeId
            }
            let subworkflowType = node.data.internal.subflowId
              ? "optimize"
              : "learning"
            let setupParams = deepCopy(
              staticNodesParams[subworkflowType][node.data.internal.type]
            )
            setupParams.possibleSettings =
              setupParams["possibleSettings"][flow.MLType]
            node.data.setupParam = setupParams
          }
        })

        if (flow) {
          const { x = 0, y = 0, zoom = 1 } = flow.viewport
          setMLType(flow.MLType)
          setNodes(flow.nodes || [])
          setEdges(flow.edges || [])
          setViewport({ x, y, zoom })
          setIntersections(flow.intersections || [])
        }
      }

      restoreFlow()
    }
  }, [setNodes, setViewport, nodes])

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
          let childrenNodes = nds.filter(
            (node) => node.data.internal.subflowId == id
          )
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
      setupParams = deepCopy(
        staticNodesParams[workflowType][newNode.data.internal.type]
      )
      setupParams.possibleSettings = setupParams["possibleSettings"][MLType]
    }
    newNode.id = `${newNode.id}${associatedNode ? `.${associatedNode}` : ""}` // if the node is a sub-group node, it has the id of the parent node seperated by a dot. useful when processing only ids
    newNode.hidden = newNode.type == "optimizeIO"
    newNode.zIndex = newNode.type == "optimizeIO" ? 1 : 1010
    newNode.data.parentFct.changeSubFlow = setGroupNodeId
    newNode.data.tooltipBy = "type"
    newNode.data.setupParam = setupParams
    newNode.data.internal.code = ""
    newNode.data.internal.settings = {}
    newNode.data.internal.selection =
      newNode.type == "selectionNode" &&
      Object.keys(setupParams.possibleSettings)[0]
    newNode.data.internal.checkedOptions = []
    newNode.data.internal.subflowId = !associatedNode
      ? groupNodeId
      : associatedNode

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
      console.log("run node", id)
      console.log(reactFlowInstance)
      onRun(null, id)
    },
    [reactFlowInstance, MLType, nodes, edges, intersections, treeData]
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
          node.data.parentFct = null
          node.data.setupParam = null
        })
        flow = cleanJson2Send(flow, up2Id)
        console.log("sended flow", flow)
        setIsProgressUpdating(true)
        requestJson(
          5000,
          "/learning/run_experiment",
          flow,
          (jsonResponse) => {
            console.log(jsonResponse)
            if (jsonResponse.error) {
              setIsProgressUpdating(false)
              toast.error("Error detected while running the experiment")
            }
          },
          function (err) {
            console.error(err)
            toast.error("Error while running the experiment")
            setIsProgressUpdating(false)
          }
        )
      }
    },
    [reactFlowInstance, MLType, nodes, edges, intersections, treeData]
  )

  const cleanJson2Send = useCallback(
    (json, up2Id) => {
      //clean recursive pipelines from treeData
      let nbNodes2Run = 0
      console.log("up2Id", up2Id)
      const cleanTreeDataRec = (node) => {
        let children = {}
        Object.keys(node).forEach((key) => {
          // check if node is a create model node
          // n pipelines should be added according to model node inputs
          let hasModels = false
          let currentNode = nodes.find((node) => node.id === key)
          let nodeType = currentNode.data.internal.type
          let edgesCopy = deepCopy(edges)
          if (nodeType == "create_model") {
            edgesCopy = edgesCopy.filter(
              (edge) => edge.target == currentNode.id
            )
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
      newJson.pageId = flowInfos.id
      // eslint-disable-next-line camelcase
      newJson.saving_path = flowInfos.savingPath
      newJson.nbNodes2Run = nbNodes2Run

      return newJson
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
      flow.nodes.forEach((node) => {
        node.data.parentFct = null
        node.data.setupParam = null
      })
      flow.intersections = intersections
      console.log("flow", flow)
      downloadJson(flow, "experiment")
    }
  }, [reactFlowInstance, MLType, intersections])

  /**
   * Clear the canvas if the user confirms
   */
  const onClear = useCallback(() => {
    let confirmation = confirm(
      "Are you sure you want to clear the canvas?\nEvery data will be lost."
    )
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
    setGroupNodeId(null)
  }, [])

  /**
   * @param {Object} info info about the node clicked
   *
   * This function is called when the user clicks on a tree item
   *
   */
  const onTreeItemClick = (info) => {
    console.log("tree item clicked: ", info)
  }

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
    let newName = value
    if (value.length > 15) {
      newName = value.substring(0, 15)
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
          toastId: "customId"
        }
      )
    }
    let groupNode = nodes.find((node) => node.id === groupNodeId)
    groupNode.data.internal.name = newName
    groupNode.data.parentFct.updateNode({
      id: groupNodeId,
      updatedData: groupNode.data.internal
    })
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
          onNodeDrag: onNodeDrag,
          runNode: runNode,
          nodeUpdate: nodeUpdate,
          setNodeUpdate: setNodeUpdate
        }}
        // optional props
        onDeleteNode={onDeleteNode}
        groupNodeHandlingDefault={groupNodeHandlingDefault}
        // reprensents the visual over the workflow
        ui={
          <>
            {/* top left corner - Tree menu*/}
            <div className="btn-panel-top-corner-left">
              <TreeMenu
                data={treeData}
                onClickItem={onTreeItemClick}
                debounceTime={125}
                hasSearch={false}
              />
            </div>
            {/* top right corner - buttons */}
            <div className="btn-panel-top-corner-right">
              {workflowType == "learning" && (
                <>
                  <Form.Select
                    className="margin-left-10"
                    aria-label="Default select example"
                    value={MLType}
                    onChange={(e) => setMLType(e.target.value)}
                  >
                    <option value="classification">Classification</option>
                    <option value="regression">Regression</option>
                    {/* <option value="survival-analysis">Survival Analysis</option> */}
                  </Form.Select>
                  <BtnDiv
                    buttonsList={[
                      { type: "run", onClick: onRun },
                      { type: "clear", onClick: onClear },
                      { type: "save", onClick: onSave },
                      { type: "load", onClick: onLoad }
                    ]}
                  />
                </>
              )}
            </div>
            {/* top center - title when is sub group */}
            <div className="btn-panel-top-center">
              {workflowType == "optimize" && (
                <>
                  <div>
                    {groupNodeId && (
                      <div className="subFlow-title">
                        <EditableLabel
                          text={
                            nodes.find((node) => node.id === groupNodeId).data
                              .internal.name
                          }
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
            </div>
            {/* bottom center - progress bar */}
            <div className="panel-bottom-center">
              <ProgressBarRequests
                isUpdating={isProgressUpdating}
                setIsUpdating={setIsProgressUpdating}
              />
            </div>
          </>
        }
      />
    </>
  )
}

export default Workflow
