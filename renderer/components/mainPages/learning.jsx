import Workflow from "../learning/workflow";
import React, { useState} from "react";
import FlowPageBase from "../flow/flowPageBase";

const LearningPage = ({ pageId }) => {
	const [flowType, setFlowType] = useState("learning") // this state has been implemented because of subflows implementation
	return (
		<>
			<FlowPageBase 
				pageId={pageId} 
				workflowType={flowType} 
			>
				<Workflow id={pageId} workflowType={flowType} setWorkflowType={setFlowType} />
			</FlowPageBase>
		</>
	)
}

export default LearningPage