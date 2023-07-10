import React, { useState } from "react";
import "reactflow/dist/style.css";
import FlowCanvas from "../extraction/flowCanvas";
import FlowPageBase from "../flow/flowPageBase";


// Extraction tab referred to in pages/_app.js.
// Shows sideBar nodes in a div on the left of the page,
// then react flow canvas where the nodes can be dropped.
const ExtractionPage = ({ pageId }) => {
	// Hook for current module
	const [flowType, setFlowType] = useState("extraction");
	return (
		<>
			<FlowPageBase 
				pageId={pageId} 
				workflowType={flowType} 
			>
				<FlowCanvas
					id={pageId}
					workflowType={flowType}
					setWorkflowType={setFlowType}
				/>
			</FlowPageBase>
		</>
	)
};
export default ExtractionPage;
