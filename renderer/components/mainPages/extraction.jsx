import FlowCanvas from "../extraction/flowCanvas"
import React, { useState } from "react"
import FlowPageBase from "../flow/flowPageBase"
import ModulePage from "./moduleBasics/modulePage"

// Extraction tab referred to in pages/_app.js.
// Shows sideBar nodes in a div on the left of the page,
// then react flow canvas where the nodes can be dropped.
const ExtractionPage = ({ pageId, configPath = "" }) => {
  // Hook for current module
  const [flowType, setFlowType] = useState("extraction")
  return (
    <>
      <ModulePage pageId={pageId} configPath={configPath}>
        <FlowPageBase workflowType={flowType}>
          <FlowCanvas
            id={pageId}
            workflowType={flowType}
            setWorkflowType={setFlowType}
          />
        </FlowPageBase>
      </ModulePage>
    </>
  )
}

export default ExtractionPage
