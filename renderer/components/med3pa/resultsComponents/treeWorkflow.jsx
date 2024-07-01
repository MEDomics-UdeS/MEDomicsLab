/* eslint-disable camelcase */
/* eslint-disable quote-props */
import React, { useState, useMemo, useEffect, useRef, useLayoutEffect } from "react"
import { TbBinaryTree } from "react-icons/tb"
import { BiFilter, BiRefresh } from "react-icons/bi"
import { AiOutlineFullscreen, AiOutlineFullscreenExit } from "react-icons/ai"
import ReactFlow, { useNodesState, useEdgesState, Controls, addEdge } from "reactflow"
import TreeNode from "../nodesTypes/treeNode.jsx"
import { Typography } from "@mui/material"
import { Button } from "react-bootstrap"
import { deepCopy } from "../../../utilities/staticFunctions.js"

const TreeWorkflow = ({ treeData, onButtonClicked, onFullScreenClicked, fullscreen }) => {
  // eslint-disable-next-line no-unused-vars
  const [buttonClicked, setButtonClicked] = useState(false)

  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
  const [nodes, setNodes, onNodesChange] = useNodesState([]) // nodes array, setNodes is used to update the nodes array, onNodesChange is a callback hook that is executed when the nodes array is changed
  const [edges, setEdges] = useEdgesState([]) // edges array, setEdges is used to update the edges array, onEdgesChange is a callback hook that is executed when the edges array is changed
  const cardRef = useRef(null)
  const [selectedNodeInfo, setSelectedNodeInfo] = useState(null)

  // eslint-disable-next-line no-unused-vars

  const nodeTypes = useMemo(
    () => ({
      treeNode: TreeNode
    }),
    []
  )
  const handleNodeClick = () => {
    // Update selectedNodeInfo with clicked node data
    setSelectedNodeInfo(nodes.find((node) => node.selected).data)

    console.log("SELECTED NODE:", selectedNodeInfo)
  }

  const handleClick = (buttonType) => {
    setButtonClicked(buttonType)
    onButtonClicked(buttonType) // Notify the parent component that the button was clicked
  }

  const toggleFullscreen = () => {
    onFullScreenClicked(!fullscreen) // Toggle fullscreen state in the parent component
  }
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

    // Position the root nodes and their children
    const initialX = 0
    const initialY = 0
    const initialSpacing = 1900
    rootNodes.forEach((rootNode, index) => {
      positionNodes(rootNode.id, initialX + index * initialSpacing, initialY, initialSpacing / 2)
    })

    return tree
  }

  useEffect(() => {
    setNodes([])
    setEdges([])
  }, [treeData])

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
  }, []) // Add an empty dependency array here

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

  // Helper function to search for a tree node by id
  const findNodeById = (tree, id) => {
    return tree.find((node) => node.id === id)
  }

  // Add a tree node with settings from profiles to the workflow
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
              fontSize: "15px"
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
              fontSize: "15px"
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

  const updateDimensions = () => {
    if (cardRef.current) {
      const { clientWidth, clientHeight } = cardRef.current
      setDimensions({ width: clientWidth - 20, height: clientHeight })
    }
  }

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
    <div className="card-paresults" ref={cardRef} style={{ display: "flex", flexDirection: "column", padding: "15px", height: "100%", width: "100%" }}>
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

      <div style={{ flex: 1, width: dimensions.width, height: dimensions.height }}>
        <ReactFlow fitView minZoom={0} maxZoom={1.5} zoomOnScroll={true} nodes={nodes} edges={edges} onNodesChange={onNodesChange} nodeTypes={nodeTypes} onNodeClick={handleNodeClick}>
          <Controls />
        </ReactFlow>
      </div>
    </div>
  )
}

export default TreeWorkflow
