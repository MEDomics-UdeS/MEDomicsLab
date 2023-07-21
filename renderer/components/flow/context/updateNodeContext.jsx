import React, { createContext, useState } from "react"

// This context is used to handle the update of the node
const UpdateNodeContext = createContext()

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
function UpdateNodeProvider({ children }) {
  const [nodeUpdate, setNodeUpdate] = useState({})

  const updateNode = (nodeUpdateInfos) => {
    setNodeUpdate({ ...nodeUpdateInfos })
  }

  return (
    // here we provide the updateNode function and the nodeUpdate state to all the components that need it
    <UpdateNodeContext.Provider value={{ nodeUpdate, updateNode }}>
      {children}
    </UpdateNodeContext.Provider>
  )
}

export { UpdateNodeContext, UpdateNodeProvider }
