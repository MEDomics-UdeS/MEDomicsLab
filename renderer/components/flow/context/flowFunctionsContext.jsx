import React, { createContext, useState } from "react"

// This context is used to handle the update of the node
const FlowFunctionsContext = createContext()

/**
 *
 * @param {*} children components that will use the context
 * @description This component is used to provide the updateNode context to all the components that need it.
 * nodeUpdate should have this structure:
 * {
 * 	   id: id of the node to update,
 * 	   updatedData: data to update (will replace old data at data.internal)
 * }
 */
function FlowFunctionsProvider({ children }) {
  const [nodeUpdate, setNodeUpdate] = useState({})
  const [groupNodeId, setGroupNodeId] = useState({ id: "MAIN" })
  const [node2Run, setNode2Run] = useState(null)
  const [node2Delete, setNode2Delete] = useState(null)

  const updateNode = (nodeUpdateInfos) => {
    console.log("updateNode - context", nodeUpdateInfos)
    setNodeUpdate({ ...nodeUpdateInfos })
  }

  const changeSubFlow = (newGroupNodeId) => {
    console.log("changeSubFlow - context", newGroupNodeId)
    setGroupNodeId({ id: newGroupNodeId })
  }

  const onDeleteNode = (nodeId) => {
    console.log("onDeleteNode - context", nodeId)
    setNode2Delete(nodeId)
  }

  const runNode = (nodeId) => {
    console.log("runNode - context", nodeId)
    setNode2Run(nodeId)
  }

  return (
    // here we provide the updateNode function and the nodeUpdate state to all the components that need it
    <FlowFunctionsContext.Provider
      value={{
        nodeUpdate,
        updateNode,
        groupNodeId,
        changeSubFlow,
        node2Run,
        runNode,
        node2Delete,
        onDeleteNode
      }}
    >
      {children}
    </FlowFunctionsContext.Provider>
  )
}

export { FlowFunctionsContext, FlowFunctionsProvider }
