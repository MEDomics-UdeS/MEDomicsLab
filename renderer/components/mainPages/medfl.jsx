import React, { useState } from "react"
import ModulePage from "./moduleBasics/modulePage"
import MEDflHelloWorldPanel from "../medfl/medflHelloWorldPanel"
import FlowPageBase from "../flow/flowPageBase"
import Workflow from "../learning/workflow"
import MedflWorkflow from "../medfl/medflWorkflow"

const MEDflPage = ({ pageId, configPath = "" }) => {
  const [flFlowType, setFlFlowType] = useState("fl") // this state has been implemented because of subflows implementation

  return (
    <>
      <ModulePage pageId={pageId} configPath={configPath} >
      <FlowPageBase workflowType={flFlowType} id={pageId}>
        <MedflWorkflow id={pageId} workflowType={flFlowType} setWorkflowType={setFlFlowType} />
      </FlowPageBase>
      </ModulePage>
    </>
  )
}

export default MEDflPage
