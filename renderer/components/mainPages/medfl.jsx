import React, { useState } from "react"
import ModulePage from "./moduleBasics/modulePage"
import FlowPageBase from "../flow/flowPageBase"
import MedflWorkflow from "../medfl/medflWorkflow"
import { Button } from "react-bootstrap"
import MedflWelcomePage from "../medfl/medflWelcomePage"

const MEDflPage = ({ pageId, configPath = "" }) => {
  const [displayWelcomeMessage, setWelcomeMessage] = useState(true)

  const [flFlowType, setFlFlowType] = useState("fl") // this state has been implemented because of subflows implementation

  return (
    <>
      <ModulePage pageId={pageId} configPath={configPath}>
        {displayWelcomeMessage ? (
          <>
            <MedflWelcomePage changePage={setWelcomeMessage} />
          </>
        ) : (
          <FlowPageBase workflowType={flFlowType} id={pageId}>
            <MedflWorkflow id={pageId} workflowType={flFlowType} setWorkflowType={setFlFlowType} />
          </FlowPageBase>
        )}
      </ModulePage>
    </>
  )
}

export default MEDflPage
