import React, { createContext, useState, useContext } from "react"
import { FlowInfosContext } from "./flowInfosContext"
import { MEDDataObject } from "../../workspace/NewMedDataObject"
import { WorkspaceContext } from "../../workspace/workspaceContext"
import { toast } from "react-toastify"
import { randomUUID } from "crypto"
import { insertMEDDataObjectIfNotExists } from "../../mongoDB/mongoDBUtils"

// This context is used to store the flowResults (id and type of the workflow)
const FlowResultsContext = createContext()

/**
 *
 * @param {*} children components that will use the context
 * @description This component is used to provide the flowResults context to all the components that need it.
 */
function FlowResultsProvider({ children }) {
  const [flowResults, setFlowResults] = useState({}) // Initial style
  const [showResultsPane, setShowResultsPane] = useState(false) // Initial state
  const [isResults, setIsResults] = useState(false) // Initial state
  const [selectedResultsId, setSelectedResultsId] = useState(null) // Initial state
  const { sceneName } = useContext(FlowInfosContext)
  const { workspace } = useContext(WorkspaceContext)

  // This function is used to update the flowResults
  const updateFlowResults = async (newResults, sceneFolderId) => {
    if (!newResults) return
    const isValidFormat = (results) => {
      let firstKey = Object.keys(results)[0]
      return results[firstKey].results ? true : false
    }
    if (isValidFormat(newResults)) {
      setFlowResults({ ...newResults })
      setIsResults(true)
      if (workspace.hasBeenSet && sceneName) {
        let sceneObject = new MEDDataObject({
          id: randomUUID(),
          name: sceneName + ".medmlres",
          type: "medmlres",
          parentID: sceneFolderId,
          childrenIDs: [],
          inWorkspace: false
        })
        await insertMEDDataObjectIfNotExists(sceneObject, null, [newResults])
        toast.success("Results generated and saved !")
        MEDDataObject.updateWorkspaceDataObject()
      }
    } else {
      toast.error("The results are not in the correct format")
    }
  }

  return (
    // in the value attribute we pass the flowResults and the function to update it.
    // These will be available to all the components that use this context
    <FlowResultsContext.Provider
      value={{
        flowResults,
        updateFlowResults,
        showResultsPane,
        setShowResultsPane,
        isResults,
        setIsResults,
        selectedResultsId,
        setSelectedResultsId
      }}
    >
      {children}
    </FlowResultsContext.Provider>
  )
}

export { FlowResultsContext, FlowResultsProvider }
