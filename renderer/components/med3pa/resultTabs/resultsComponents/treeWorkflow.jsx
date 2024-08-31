/* eslint-disable camelcase */
/* eslint-disable quote-props */
import React, { useState, useMemo, useEffect, useRef, useLayoutEffect } from "react"
import { TbBinaryTree } from "react-icons/tb"
import { BiFilter, BiRefresh } from "react-icons/bi"
import { AiOutlineFullscreen, AiOutlineFullscreenExit } from "react-icons/ai"
import ReactFlow, { useNodesState, useEdgesState, Controls, addEdge, useReactFlow, ReactFlowProvider } from "reactflow"
import TreeNode from "./treeComponents/treeNode.jsx"
import { Typography } from "@mui/material"
import { Button } from "react-bootstrap"
import { deepCopy } from "../../../../utilities/staticFunctions.js"

import DownloadButton from "./treeComponents/download.jsx"

import TreeLegend from "./treeComponents/treeLegend.jsx"
import SelectedNodePath from "./treeComponents/selectedNodePath.jsx"

/**
 *
 * @param {Object} treeData The current data of the profiles tree.
 * @param {number} maxDepth The maximum depth of the profiles tree.
 * @param {number} customThreshold The step size used to calculate the ranges for the tree legend.
 * @param {Function} onButtonClicked Function to handle button clicks and update the profiles tree data.
 * @param {Function} onFullScreenClicked Function to toggle fullscreen mode.
 * @param {boolean} fullscreen Boolean indicating whether the component is in fullscreen mode.
 * @returns {JSX.Element} The rendered component displaying the profiles tree.
 *
 *
 * @description
 * This component displays the profiles tree generated from the APC/MPC model with reactFlow.
 */
const TreeWorkflow = ({ treeData, maxDepth, customThreshold, onButtonClicked, onFullScreenClicked, fullscreen }) => {
  // eslint-disable-next-line no-unused-vars
  const [buttonClicked, setButtonClicked] = useState(false)
  const { setCenter, fitView } = useReactFlow()
  const reactFlow = useReactFlow()

  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
  const [nodes, setNodes, onNodesChange] = useNodesState([]) // nodes array, setNodes is used to update the nodes array, onNodesChange is a callback hook that is executed when the nodes array is changed
  const [edges, setEdges] = useEdgesState([]) // edges array, setEdges is used to update the edges array, onEdgesChange is a callback hook that is executed when the edges array is changed
  const cardRef = useRef(null)
  const reactFlowRef = useRef(null)

  const [selectedNodeInfo, setSelectedNodeInfo] = useState(null) // Information of a clicked node

  const [prevClassName, setPrevClassName] = useState(null) // Variable to the store previous className of a node

  // Set the required Nodes
  const nodeTypes = useMemo(
    () => ({
      treeNode: TreeNode
    }),
    []
  )

  /**
   *
   * @description
   * The function handles the node click event to manage node selection and update nodes' colors.
   *
   * This function updates the state of node selections,
   *  including reverting the color of previously selected nodes
   *  and applying a new color to the currently selected node.
   * It also adjusts the view to center on the selected node.
   */
  const handleNodeClick = () => {
    // Define updatedNodes as a copy of nodes
    const updatedNodes = nodes.map((node) => ({ ...node }))

    let newSelectedNodeInfo = null // Variable to store the new selected node info

    // Find previously selected node and revert its color to original
    if (selectedNodeInfo) {
      const prevSelectedNode = updatedNodes.find((node) => node.data.internal.settings.id === selectedNodeInfo.data.internal.settings.id)

      if (prevSelectedNode) {
        const prevNodeId = prevSelectedNode.data.internal.settings.id
        //const originalClass = getOriginalClassById(prevNodeId)

        updatedNodes.forEach((node) => {
          if (node.data.internal.settings.id === prevNodeId) {
            node.data.internal.settings.className = prevClassName // Revert to original color
          }
        })

        // If clicking on the same node again, do not select it
        if (prevSelectedNode.selected) {
          newSelectedNodeInfo = null
          setSelectedNodeInfo(null)
          fitView({ duration: 800 })
        }
      }
    }

    // Update newly selected node's color to light blue and handle state updates if it's not the same node
    const finalNodes = updatedNodes.map((node) => {
      if (node.selected) {
        setPrevClassName(node.data.internal.settings.className)
        // If it's the same node, do not change its color again
        if (node.data.internal.settings.id === selectedNodeInfo?.data.internal.settings.id) {
          return node
        }

        newSelectedNodeInfo = node
        setCenter(newSelectedNodeInfo.position.x + newSelectedNodeInfo.width / 2, newSelectedNodeInfo.position.y + newSelectedNodeInfo.height / 2, { zoom: 0.3, duration: 800 })

        return {
          ...node,
          data: {
            ...node.data,
            internal: {
              ...node.data.internal,
              settings: {
                ...node.data.internal.settings,
                className: "paselected-node" // Update color for newly selected node
              }
            }
          }
        }
      }
      return node
    })

    setNodes(finalNodes)

    // Update selectedNodeInfo with the new selected node data
    setSelectedNodeInfo(newSelectedNodeInfo)
  }

  // Ensure fitView after the component tree is updated
  useEffect(() => {
    if (!selectedNodeInfo) {
      fitView({ duration: 800 })
    }
  }, [nodes])

  /**
   * @param {string} buttonType The type of the button that was clicked. It can be either:
   *   - "reset": Resets the tree data to its initial default state.
   *   - "filter": Applies a filter to the tree data.
   *
   * @description
   * This function updates the state to reflect which button was clicked and notifies the parent component
   * of the action.
   */
  const handleClick = (buttonType) => {
    setButtonClicked(buttonType)
    onButtonClicked(buttonType) // Notify the parent component that the button was clicked
    if (buttonType === "reset") {
      setSelectedNodeInfo(null)
    }
  }

  /**
   *
   *
   * @description
   * This function switches the state of `fullscreen` between `true` and `false`
   */
  const toggleFullscreen = () => {
    onFullScreenClicked(!fullscreen) // Toggle fullscreen state in the parent component
  }

  /**
   *
   * @param {Array<Object>} data Array of node objects where each object represents a node with an `id` and `path`.
   *   - {string} id - Unique identifier for the node.
   *   - {Array<string>} path - Hierarchical path to the node, where each element represents a step in the path.
   *
   * @returns {Array<Object>} Array of tree nodes with added properties for tree structure and positioning.
   *   Each node object in the returned array will include:
   *   - {string} id - Unique identifier for the node.
   *   - {string|null} idParent - The ID of the parent node, or `null` if it is a root node.
   *   - {string|null} idLeft - The ID of the left child node, or `null` if it does not have a left child.
   *   - {string|null} idRight - The ID of the right child node, or `null` if it does not have a right child.
   *   - {number} depth - Depth of the node in the tree.
   *   - {string} path - The last element of the node's path, representing the node's position in its depth level.
   *   - {Object} position - The x and y coordinates for the node's position in the layout.
   *     - {number} x - The x-coordinate for positioning the node.
   *     - {number} y - The y-coordinate for positioning the node.
   *
   * @description
   * This function processes an array of node objects to create a hierarchical tree structure.
   */

  const constructTreeArray = (data) => {
    const idToObject = {}
    data.forEach((obj) => {
      idToObject[obj.id] = obj
    })

    // Convert data object to array and sort by path length
    const dataArray = Object.values(idToObject).sort((a, b) => a.path.length - b.path.length)

    // Create a mapping from path string to node id
    const pathToIdMap = {}

    // Initialize tree array
    const tree = []

    // Initialize depth count for x positioning
    const depthCount = {}

    // Populate tree array and pathToIdMap
    for (const obj of dataArray) {
      const path = obj.path.join(",")
      pathToIdMap[path] = obj.id
      const depth = obj.path.length

      if (!depthCount[depth]) {
        depthCount[depth] = 0
      }
      const nodePath = obj.path[obj.path.length - 1]

      tree.push({
        id: obj.id,
        idParent: null,
        idRight: null,
        idLeft: null,
        depth: depth,
        path: nodePath,
        position: { x: 0, y: 0 } // Placeholder for position
      })

      depthCount[depth] += 1
    }

    // Assign idParent, idRight, and idLeft
    for (const obj of dataArray) {
      const path = obj.path
      const id = obj.id

      if (path.length > 1) {
        const parentPath = path.slice(0, -1).join(",")
        const isLeft = path[path.length - 1].includes("<=")

        const parentId = pathToIdMap[parentPath]
        const parentNode = tree.find((node) => node.id === parentId)

        if (parentNode) {
          if (isLeft) {
            parentNode.idLeft = id
          } else {
            parentNode.idRight = id
          }

          const currentNode = tree.find((node) => node.id === id)
          currentNode.idParent = parentId
        }
      }
    }

    // Recursive function to position nodes
    // Calculate the maximum depth of the tree
    const calculateMaxDepth = (nodes) => {
      return Math.max(...nodes.map((node) => node.depth))
    }

    // Recursive function to position nodes
    const positionNodes = (nodeId, x, y, spacing) => {
      const node = tree.find((n) => n.id === nodeId)
      if (!node) return

      node.position = { x, y }

      const leftChildId = node.idLeft
      const rightChildId = node.idRight

      if (leftChildId) {
        positionNodes(leftChildId, x - spacing, y + 500, spacing / 2)
      }
      if (rightChildId) {
        positionNodes(rightChildId, x + spacing, y + 500, spacing / 2)
      }
    }

    // Find the root nodes (nodes without parents)
    const rootNodes = tree.filter((node) => node.idParent === null)

    // Calculate the maximum depth of the tree
    const maxDepth = calculateMaxDepth(tree)

    // Dynamically set the initial spacing based on the maximum depth
    const initialX = 0
    const initialY = 0
    const initialSpacing = 800 * maxDepth // Adjust multiplier as needed

    // Position the root nodes and their children
    rootNodes.forEach((rootNode, index) => {
      positionNodes(rootNode.id, initialX + index * initialSpacing, initialY, initialSpacing / 2)
    })

    return tree
  }

  /**
   * Updates the nodes and edges based on changes in `treeData`.
   * - Modifies node appearance and properties based on path length and presence in `treeData`.
   * - Adjusts edge visibility if connected nodes are affected by depth changes.
   * - Fits the view to accommodate updated nodes and edges.
   */
  useEffect(() => {
    // Update nodes and edges state

    let className
    setNodes((prevNodes) => {
      const updatedNodes = prevNodes
        .map((node) => {
          // Check if the node path length exceeds maxDepth, if so, skip updating

          if (node.data.internal.settings.path.length > maxDepth) {
            return {
              ...node,
              data: {
                ...node.data,
                internal: {
                  ...node.data.internal,
                  settings: {
                    ...node.data.internal.settings
                  }
                }
              },
              hidden: true // Mark node as hidden
            }
          }
          // Check if the node exists in treeData
          const isInTreeData = treeData.some((profile) => node.id === `treeNode_${profile.id}`)

          if (!isInTreeData) {
            className = "panode-lost"
            // If not found in treeData, update its className to "panode-lost" and remove unnecessary fields
            // eslint-disable-next-line no-unused-vars
            const { nodeInformation, detectronResults, metrics, ...restSettings } = node.data.internal.settings

            return {
              ...node,
              data: {
                ...node.data,
                internal: {
                  ...node.data.internal,
                  settings: {
                    ...restSettings,
                    className: className
                  }
                }
              }
            }
          }

          // If found in treeData or in both treeData and lostProfiles, return the node as is
          return node
        })
        .filter(Boolean) // Filter out null or undefined nodes (due to conditions above)
      // Collect IDs of nodes to be removed
      const removedNodeIds = prevNodes.filter((node) => node.data.internal.settings.path.length > maxDepth).map((node) => node.id)

      // Update edges state with updated style for removed nodes
      const updatedEdges = edges.map((edge) => {
        // Check if the edge's target node is in removedNodeIds
        const isNotVisible = removedNodeIds.includes(edge.target)

        // Conditionally update style based on visibility

        return {
          ...edge,
          style: isNotVisible ? { ...edge.style, opacity: 0 } : { ...edge.style, opacity: 1 },
          labelStyle: isNotVisible ? { ...edge.labelStyle, opacity: 0 } : { ...edge.labelStyle, opacity: 1 }
        }
      })

      // Update edges state with updatedEdges
      if (updatedEdges && updatedEdges.length > 0) {
        setEdges(updatedEdges)
      }
      // Return updatedNodes to update nodes state
      return updatedNodes
    })
  }, [treeData])

  /**
   *
   * @param {Object} node The source node object containing properties to be used.
   * @param {string} id - The unique identifier for the new node.
   * @returns {Object} - A new node object formatted for use in the visualization.
   *
   *
   * @description
   * The function constructs a node with a specific format and data structure.
   */
  const createBaseNode = (node, id) => {
    const { nodeType, name, image, description, settings, position } = node

    let newNode = {
      id: id,
      type: nodeType,
      name: name,
      position: position,
      data: {
        // here is the data accessible by children components
        internal: {
          name: name,
          img: image,
          description: description,
          type: name.toLowerCase().replaceAll(" ", "_"),
          settings: settings
        }
        // this is a default value that can be changed in addSpecificToNode function see workflow.jsx for example
      }
    }

    return newNode
  }

  /**
   *
   * @param {Object} newNode base node object
   * @returns
   */
  const addSpecificToNode = (newNode) => {
    let setupParams = {
      type: "treeNode",
      classes: "object dataset run startNode",
      nbInput: 1,
      nbOutput: 1,
      input: ["treeNode"],
      output: ["treeNode"],
      title: "Profil"
    }

    newNode.id = `${newNode.id}` // if the node is a sub-group node, it has the id of the parent node seperated by a dot. useful when processing only ids

    newNode.data.tooltipBy = "type"
    newNode.data.setupParam = setupParams

    newNode.data.internal.code = ""
    newNode.className = setupParams.classes

    newNode.data.internal.description = newNode.data.internal.description !== undefined ? newNode.data.internal.description : ""
    newNode.data.internal.checkedOptions = []
    newNode.data.internal.hasWarning = { state: false }

    return newNode
  }

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
        if (node && edge.source == node.id) {
          let targetNode = deepCopy(nodes.find((node) => node.id === edge.target))
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
   *
   * @param {Array<Object>} tree The array of nodes representing the tree structure.
   * @param {string} id The unique identifier of the node to find.
   * @returns {Object|null} The node object with the specified ID, or `null` if not found.
   *
   * @description
   * This function searches through the provided array of tree nodes to find and return the node that matches the given ID.
   */
  const findNodeById = (tree, id) => {
    return tree.find((node) => node.id === id)
  }

  /**
   *
   * @description
   * This `useEffect` hook is triggered whenever `treeData` is updated. It performs the following steps:
   * It uses `constructTreeArray` to generate a tree structure from `treeData`.
   */

  useEffect(() => {
    const addTreeNodesFromProfiles = () => {
      const tree = constructTreeArray(treeData)

      // Step 1: Create nodes
      treeData.forEach((profile) => {
        const position = findNodeById(tree, profile.id)?.position
        const nodeId = `treeNode_${profile.id}`
        const newNodeParams = {
          nodeType: "treeNode",
          name: "Profile",
          description: "Profile Node",
          settings: profile,
          position: position
        }

        let newNode = createBaseNode(newNodeParams, nodeId)
        newNode = addSpecificToNode(newNode)

        setNodes((nds) => nds.concat(newNode))
      })

      // Step 2: Create edges

      tree.forEach((profile) => {
        const sourceId = `treeNode_${profile.id}`

        if (profile.idLeft) {
          const nodePath = findNodeById(tree, profile.idLeft)?.path
          const targetId = `treeNode_${profile.idLeft}`
          const params = {
            type: "smoothstep",
            source: sourceId,
            label: nodePath.split(".")[0] + "." + nodePath.split(".")[1].slice(0, 3),
            sourceHandle: `${sourceId}_top`,
            target: targetId,
            targetHandle: `${targetId}_bottom`,
            labelStyle: {
              fontSize: "1.5rem"
            },
            style: {
              strokeWidth: 1,
              stroke: "#1976d2"
            },
            id: "reactflow__edge-node_" + sourceId + "_" + targetId + "_opt"
          }
          if (!verificationForLoopHoles(params)) {
            setEdges((eds) => addEdge(params, eds))
          }
        }

        if (profile.idRight) {
          const targetId = `treeNode_${profile.idRight}`
          const nodePath = findNodeById(tree, profile.idRight)?.path
          const params = {
            type: "smoothstep",
            source: sourceId,
            sourceHandle: `${sourceId}_top`, // we add 0_ because the sourceHandle always starts with 0_. Handles are created by a for loop so it represents an index
            target: targetId,
            label: nodePath.split(".")[0] + "." + nodePath.split(".")[1].slice(0, 3),
            targetHandle: `${targetId}_bottom`,
            id: sourceId + "_" + targetId + "_opt",
            labelStyle: {
              fontSize: "1.5rem"
            },
            style: {
              strokeWidth: 1,
              stroke: "#4caf50"
            }
          }
          if (!verificationForLoopHoles(params)) {
            setEdges((eds) => addEdge(params, eds))
          }
        }
      })
    }

    addTreeNodesFromProfiles()
  }, [treeData])

  /**
   *
   * @description
   * This function checks if `cardRef.current` is available.
   * If so, it retrieves the element's `clientWidth` and `clientHeight`.
   *
   * This is useful for adjusting the layout or styling of our component based on its actual size.
   */
  const updateDimensions = () => {
    if (cardRef.current) {
      const { clientWidth, clientHeight } = cardRef.current
      setDimensions({ width: clientWidth - 20, height: clientHeight })
    }
  }

  /**
   *
   * @description
   * This setup ensures that the component's dimensions are always up-to-date with its rendered size,
   *  even when resized dynamically.
   */
  useLayoutEffect(() => {
    // Initial dimensions setup

    updateDimensions()

    // ResizeObserver to watch for size changes in cardRef
    const resizeObserver = new ResizeObserver(() => {
      updateDimensions()
    })
    if (cardRef.current) {
      resizeObserver.observe(cardRef.current)
    }

    // Cleanup observer
    return () => {
      if (cardRef.current) {
        resizeObserver.unobserve(cardRef.current)
      }
    }
  }, [])

  return (
    <div className="card-paresults" ref={cardRef} style={{ display: "flex", flexDirection: "column", padding: "15px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Typography variant="h6" style={{ color: "#868686", fontSize: "1.2rem", display: "flex", alignItems: "center" }}>
          <TbBinaryTree style={{ marginRight: "0.5rem", fontSize: "1.4rem" }} />
          Profiles Tree
        </Typography>
        <div style={{ display: "flex", alignItems: "center" }}>
          {fullscreen ? (
            <AiOutlineFullscreenExit onClick={toggleFullscreen} style={{ cursor: "pointer", color: "#868686", fontSize: "1.6rem" }} />
          ) : (
            <AiOutlineFullscreen onClick={toggleFullscreen} style={{ cursor: "pointer", color: "#868686", fontSize: "1.6rem" }} />
          )}
        </div>
      </div>
      <hr style={{ borderColor: "#868686", borderWidth: "0.5px", width: "100%" }} />
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "10px" }}>
        <Button
          onClick={() => handleClick("applyFilters")}
          style={{ background: "#007bff", color: "#fff", border: "none", padding: "8px 16px", borderRadius: "4px", cursor: "pointer", marginRight: "10px" }}
        >
          <BiFilter style={{ marginRight: "5px" }} /> Apply Filters
        </Button>
        <Button onClick={() => handleClick("reset")} style={{ background: "#28a745", color: "#fff", border: "none", padding: "8px 16px", borderRadius: "4px", cursor: "pointer" }}>
          <BiRefresh style={{ marginRight: "5px" }} /> Reset
        </Button>
      </div>

      <div style={{ flex: "1", width: dimensions.width, height: dimensions.height }}>
        <ReactFlow
          ref={reactFlowRef}
          fitView
          minZoom={0}
          maxZoom={1.5}
          zoomOnScroll={true}
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          nodeTypes={nodeTypes}
          onNodeClick={handleNodeClick}
        >
          {selectedNodeInfo && <SelectedNodePath selectedNodeInfo={selectedNodeInfo}></SelectedNodePath>}
          {reactFlow && <DownloadButton reactFlowInstance={reactFlow} reactFlowRef={reactFlowRef.current} />}
          {customThreshold !== 0 && <TreeLegend customThreshold={customThreshold}></TreeLegend>}
          <Controls />
        </ReactFlow>
      </div>
    </div>
  )
}

const FlowWithProvider = ({ treeData, maxDepth, customThreshold, onButtonClicked, onFullScreenClicked, fullscreen }) => {
  return (
    <ReactFlowProvider>
      <TreeWorkflow treeData={treeData} maxDepth={maxDepth} customThreshold={customThreshold} onButtonClicked={onButtonClicked} onFullScreenClicked={onFullScreenClicked} fullscreen={fullscreen} />
    </ReactFlowProvider>
  )
}

export default FlowWithProvider
