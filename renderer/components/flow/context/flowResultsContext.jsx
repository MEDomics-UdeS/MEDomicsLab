import React, { createContext, useState, useContext } from "react"
import { FlowInfosContext } from "./flowInfosContext"
import MedDataObject from "../../workspace/medDataObject"
import { WorkspaceContext, EXPERIMENTS } from "../../workspace/workspaceContext"
import { toast } from "react-toastify"

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
  const { sceneName, experimentName } = useContext(FlowInfosContext)
  const { getBasePath, workspace } = useContext(WorkspaceContext)

  // This function is used to update the flowResults
  const updateFlowResults = (newResults) => {
    if (!newResults) return
    setFlowResults({ ...newResults })
    setIsResults(true)
    console.log("workspace", workspace)
    if (workspace.hasBeenSet && experimentName && sceneName) {
      MedDataObject.writeFileSync(newResults, [getBasePath(EXPERIMENTS), experimentName, sceneName], sceneName, "medmlres").then((res) => {
        console.log("res", res)
        toast.success("Results generated and saved !")
        MedDataObject.updateWorkspaceDataObject()
      })
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
