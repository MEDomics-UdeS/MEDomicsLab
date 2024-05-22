import React, { useState } from "react"
import ModulePage from "./moduleBasics/modulePage"
import FlowPageBase from "../flow/flowPageBase"
import Med3paWorkflow from "../med3pa/med3paWorkflow"
import Med3paWelcomePage from "../med3pa/med3paWelcomePage"

const MED3paPage = ({ pageId, configPath = "" }) => {
  const [displayWelcomeMessage, setWelcomeMessage] = useState(true)

  const [paFlowType, setPaFlowType] = useState("pa") // this state has been implemented because of subflows implementation

  return (
    <>
      <ModulePage pageId={pageId} configPath={configPath}>
        {displayWelcomeMessage ? (
          <>
            <Med3paWelcomePage changePage={setWelcomeMessage} />
          </>
        ) : (
          <FlowPageBase workflowType={paFlowType} id={pageId}>
            <Med3paWorkflow id={pageId} workflowType={paFlowType} setWorkflowType={setPaFlowType} />
          </FlowPageBase>
        )}
      </ModulePage>
    </>
  )
}

export default MED3paPage
