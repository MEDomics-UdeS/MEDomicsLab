import React, { createContext, useState } from "react"
import { useNodesState, useEdgesState } from "reactflow"
// This context is used to store the flowInfos (id and type of the workflow)
const FlowInfosContext = createContext()

/**
 *
 * @param {*} children components that will use the context
 * @description This component is used to provide the flowInfos context to all the components that need it.
 */
function FlowInfosProvider({ children }) {
  const [flowInfos, setFlowInfos] = useState({}) // Initial style
  const [showAvailableNodes, setShowAvailableNodes] = useState(true) // Initial state
  const [flowContent, setFlowContent] = useState({}) // Initial state
  const [nodes, setNodes, onNodesChange] = useNodesState([]) // nodes array, setNodes is used to update the nodes array, onNodesChange is a callback hook that is executed when the nodes array is changed
  const [edges, setEdges, onEdgesChange] = useEdgesState([]) // edges array, setEdges is used to update the edges array, onEdgesChange is a callback hook that is executed when the edges array is changed
  const [reactFlowInstance, setReactFlowInstance] = useState(null) // reactFlowInstance is used to get the reactFlowInstance object important for the reactFlow library

  // This function is used to update the flowInfos (id and type of the workflow)
  const updateFlowInfos = (newInfo) => {
    setFlowInfos({ ...newInfo })
  }

  // This function is used to update the flowContent (all the pipelines informations )
  const updateFlowContent = (newInfo) => {
    setFlowContent({ ...newInfo })
  }

  return (
    // in the value attribute we pass the flowInfos and the function to update it.
    // These will be available to all the components that use this context
    <FlowInfosContext.Provider
      value={{
        flowInfos,
        updateFlowInfos,
        flowContent,
        updateFlowContent,
        showAvailableNodes,
        setShowAvailableNodes,
        nodes,
        setNodes,
        onNodesChange,
        edges,
        setEdges,
        onEdgesChange,
        reactFlowInstance,
        setReactFlowInstance
      }}
    >
      {children}
    </FlowInfosContext.Provider>
  )
}

export { FlowInfosContext, FlowInfosProvider }
