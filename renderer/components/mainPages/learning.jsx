import Workflow from "../learning/workflow"
import React, { useState } from "react"
import FlowPageBase from "../flow/flowPageBase"
import ModulePage from "./moduleBasics/modulePage"

const LearningPage = ({
  pageId,
  configPath = "C:/Users/gblai/Documents/github/MEDomicsLab/learning-tests-scene/simple_createModel.json"
}) => {
  const [flowType, setFlowType] = useState("learning") // this state has been implemented because of subflows implementation

  return (
    <>
      <ModulePage pageId={pageId} configPath={configPath}>
        <FlowPageBase workflowType={flowType}>
          <Workflow
            id={pageId}
            workflowType={flowType}
            setWorkflowType={setFlowType}
          />
        </FlowPageBase>
      </ModulePage>
    </>
  )
}

export default LearningPage
