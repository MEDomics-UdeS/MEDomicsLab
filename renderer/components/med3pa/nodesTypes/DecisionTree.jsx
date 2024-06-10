import React from "react"
import { Tree } from "react-d3-tree"

const generateTreeData = (depth, minLeafRatio) => {
  const createNode = (currentDepth) => {
    if (currentDepth > depth) return null
    const isLeaf = Math.random() < minLeafRatio
    if (isLeaf || currentDepth === depth) {
      return { name: `Depth ${currentDepth}` }
    }
    return {
      name: `Depth ${currentDepth}`,
      children: [createNode(currentDepth + 1), createNode(currentDepth + 1)].filter(Boolean)
    }
  }
  return createNode(1)
}

const DecisionTree = ({ depth, minLeafRatio }) => {
  const treeData = generateTreeData(depth, minLeafRatio)

  return (
    <div>
      <div style={{ padding: "10px", background: "#f8f9fa", marginBottom: "20px", color: "#777", marginTop: "20px" }}>
        <p style={{ fontSize: "1.1rem", lineHeight: "1.6", marginBottom: "10px" }}>
          This decision tree represents the regression process of the IPC model. It takes the predictions from the base model and the uncertainty error as inputs to identify the profiles of
          problematic patients.
        </p>
      </div>
      <div style={{ width: "100%", height: "600px", display: "flex", justifyContent: "center", alignItems: "center" }}>
        <Tree data={treeData} orientation="vertical" translate={{ x: 300, y: 300 }} />
      </div>
    </div>
  )
}

export default React.memo(DecisionTree)
