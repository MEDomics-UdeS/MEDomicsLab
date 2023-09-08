import React, { createContext, useState } from "react"

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

  // This function is used to update the flowInfos
  const updateFlowInfos = (newInfo) => {
    setFlowInfos(newInfo)
  }

  return (
    // in the value attribute we pass the flowInfos and the function to update it.
    // These will be available to all the components that use this context
    <FlowInfosContext.Provider
      value={{
        flowInfos,
        updateFlowInfos,
        showAvailableNodes,
        setShowAvailableNodes
      }}
    >
      {children}
    </FlowInfosContext.Provider>
  )
}

export { FlowInfosContext, FlowInfosProvider }
