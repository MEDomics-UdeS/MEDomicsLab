import Workflow from "../learning/workflow"
import React, { useState } from "react"
import FlowPageBase from "../flow/flowPageBase"
import ModulePage from "./moduleBasics/modulePage"

const LearningPage = ({ pageId, configPath = "./learning-tests-scene/test3.mlflow" }) => {
  const [flowType, setFlowType] = useState("learning") // this state has been implemented because of subflows implementation

  return (
    <>
      <ModulePage pageId={pageId} configPath={configPath}>
        <FlowPageBase workflowType={flowType} id={pageId}>
          <Workflow id={pageId} workflowType={flowType} setWorkflowType={setFlowType} />
        </FlowPageBase>
      </ModulePage>
    </>
  )
}

export default LearningPage
