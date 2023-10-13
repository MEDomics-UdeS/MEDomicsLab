import FlowCanvas from "../extraction_img/flowCanvas"
import React, { useState } from "react"
import FlowPageBase from "../flow/flowPageBase"
import ModulePage from "./moduleBasics/modulePage"
import BatchExtractor from "./batchextractor"
import DataManager from "./datamanager"
import DataManagerButton from "./dmbutton";
import BatchExtractorButton from "./bebutton";


// Extraction tab referred to in pages/_app.js.
// Shows sideBar nodes in a div on the left of the page,
// then react flow canvas where the nodes can be dropped.
const ExtractionImagePage = ({ pageId, configPath = "" }) => {
  // Hook for current module
	const [flowType, setFlowType] = useState("extraction");
	const [reloaddm, setReloadDM] = useState(false);
	const [realodbe, setReloadBE] = useState(false);
  return (
    <>
    {(!reloaddm) && (realodbe) && (
			<BatchExtractor reload={realodbe} setReload={setReloadBE}/>
		)}
		{(reloaddm) && (!realodbe) && (
			<DataManager reload={reloaddm} setReload={setReloadDM}/>
		)}
		{(!reloaddm) && (!realodbe) && (
      <ModulePage pageId={pageId} configPath={configPath}>
        <FlowPageBase 
        workflowType={flowType}
         id={pageId}
         ExtraPages={[DataManagerButton, BatchExtractorButton]}
				reload={[reloaddm, realodbe]} 
				setReload={[setReloadDM, setReloadBE]}
         >
          <FlowCanvas id={pageId} workflowType={flowType} setWorkflowType={setFlowType} />
        </FlowPageBase>
      </ModulePage>
    )}
    </>
  )
}

export default ExtractionImagePage
