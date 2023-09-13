import React, { useContext, useState } from "react"
import { FlowResultsContext } from "./context/flowResultsContext"
import { FlowInfosContext } from "./context/flowInfosContext"
import { FlowFunctionsContext } from "./context/flowFunctionsContext"
import { Checkbox } from "primereact/checkbox"
import { useEffect } from "react"

const NodeWrapperResults = ({ children, id, data }) => {
  const { showResultsPane } = useContext(FlowResultsContext)
  const { flowContent, updateFlowContent } = useContext(FlowInfosContext)
  const { updateNode } = useContext(FlowFunctionsContext)

  const [checked, setChecked] = useState(null)

  useEffect(() => {
    if (checked !== null) {
      let updatedData = data.internal
      updatedData.results.checked = checked
      updateNode({
        id: id,
        updatedData: updatedData
      })
    }
  }, [checked])

  return (
    <>
      <div
        className="node-wrapper-selector"
        style={{
          top: showResultsPane ? "-2rem" : "0.1rem"
        }}
      >
        <Checkbox
          onChange={(e) => setChecked(e.checked)}
          checked={data.internal.results.checked}
        />
      </div>

      <div className="node-wrapper">{children}</div>
    </>
  )
}

export default NodeWrapperResults
