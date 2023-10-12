import React, { useState, useEffect } from "react";
import "reactflow/dist/style.css";
import FlowCanvas from "../extraction/flowCanvas";
import FlowPageBase from "../flow/flowPageBase";
import DataManagerButton from "./dmbutton";
import DataManager from "./datamanager";
import BatchExtractorButton from "./bebutton";
import BatchExtractor from "./batchextractor";

// Extraction tab referred to in pages/_app.js.
// Shows sideBar nodes in a div on the left of the page,
// then react flow canvas where the nodes can be dropped.
const ExtractionPage = ({ pageId }) => {
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
			<FlowPageBase
				pageId={pageId}
				workflowType={flowType}
				savingPath={"local_dir/"}
				title={flowType}
				ExtraPages={[DataManagerButton, BatchExtractorButton]}
				reload={[reloaddm, realodbe]} 
				setReload={[setReloadDM, setReloadBE]}
			>
				<FlowCanvas
					id={pageId}
					workflowType={flowType}
					setWorkflowType={setFlowType}
				/>
			</FlowPageBase>
			)}
		</>
	);
};
export default ExtractionPage;
