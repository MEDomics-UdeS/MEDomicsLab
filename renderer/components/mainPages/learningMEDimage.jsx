import React, { useState } from "react"
import FlowPageBase from "../flow/flowPageBase"
import ModulePage from "./moduleBasics/modulePage"
import FlowCanvas from "../learningMEDimage/flowCanvas"

// Extraction tab referred to in pages/_app.js.
// Shows sideBar nodes in a div on the left of the page,
// then react flow canvas where the nodes can be dropped.
const LearningMEDimagePage = ({ pageId, configPath = "" }) => {

  // Hook for current module
  const [flowType, setFlowType] = useState("learningMEDimage") // this state has been implemented because of subflows implementation

  return (
    <>
      {console.log("LearningMEDimagePage flow type: ", flowType)}
      <ModulePage pageId={pageId} configPath={configPath}>
        <FlowPageBase workflowType={flowType} id={pageId} LearningMEDimage={true}>
          <FlowCanvas id={pageId} workflowType={flowType} setWorkflowType={setFlowType} />
        </FlowPageBase>
      </ModulePage>
    </>
  )
}

export default LearningMEDimagePage
