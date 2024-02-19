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
  const { sceneName } = useContext(FlowInfosContext)
  const { getBasePath, workspace } = useContext(WorkspaceContext)

  // This function is used to update the flowResults
  const updateFlowResults = (newResults) => {
    if (!newResults) return
    const isValidFormat = (results) => {
      let firstKey = Object.keys(results)[0]
      return results[firstKey].results ? true : false
    }
    if (isValidFormat(newResults)) {
      setFlowResults({ ...newResults })
      setIsResults(true)
      if (workspace.hasBeenSet && sceneName) {
        MedDataObject.writeFileSync(newResults, [getBasePath(EXPERIMENTS), sceneName], sceneName, "medmlres").then((res) => {
          console.log("res", res)
          toast.success("Results generated and saved !")
          MedDataObject.updateWorkspaceDataObject()
        })
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
