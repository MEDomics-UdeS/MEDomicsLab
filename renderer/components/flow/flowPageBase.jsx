import { Row, Col } from "react-bootstrap"
import "reactflow/dist/style.css";
import React, {useContext, useEffect} from "react";
import SidebarAvailableNodes from "./sidebarAvailableNodes";
import { ReactFlowProvider } from "reactflow"
import {OffCanvasBackdropStyleProvider} from "./context/offCanvasBackdropStyleContext"
import Backdrop from "./backdrop";
import { FlowInfosProvider , FlowInfosContext} from "./context/flowInfosContext";

/**
 * 
 * @param {String} pageId Id of the page for multi-tabs support
 * @param {String} workflowType type of the workflow (e.g. "learning", "extraction", "optimize") this is used to load the correct sidebar
 * @param {JSX.Element} workflowJSX JSX element of the workflow
 * 
 * @description This component is the base for all the flow pages. It contains the sidebar, the workflow and the backdrop.
 * 
 */
const FlowPageBaseWithFlowInfos = ({ pageId, workflowType, workflowJSX }) => {
	// here is the use of the context to update the flowInfos
	const { updateFlowInfos } = useContext(FlowInfosContext); 

	// this useEffect is used to update the flowInfos when the pageId or the workflowType changes
	useEffect(() => {
		updateFlowInfos({
			id: pageId,
			type: workflowType,
		});
	}, [pageId, workflowType]);

	return (
		<>
			{/* here we use the context to provide the style for the backdrop */}
			<OffCanvasBackdropStyleProvider>
				<div className='learning-div height-100 width-100 padding-10'>
					<Row className="width-100 height-100 " style={{ overflow: "hidden" }} >
						{/* here is the Sidebar on the left with all available nodes */}
						<SidebarAvailableNodes title="Available Nodes" sidebarType={workflowType} />
						<Col md >
							<div className="height-100" >
								<ReactFlowProvider>
									{workflowJSX}
								</ReactFlowProvider>
							</div>
						</Col>
						{/* here is the backdrop (darker screen when a node is clicked) */}
						<Backdrop pageId={pageId}/>
					</Row>
				</div>
			</OffCanvasBackdropStyleProvider>
		</>
	)
}

/**
 * 
 * @param {*} props all the props of the FlowPageBaseWithFlowInfos component
 * @description This component is composed of the FlowPageBaseWithFlowInfos component and the FlowInfosProvider component.
 * It is also the default export of this file. see components/learning/learningPage.jsx for an example of use.
 */
const FlowPageBase = (props) => {
	return (
		<FlowInfosProvider>
			<FlowPageBaseWithFlowInfos {...props}/>
		</FlowInfosProvider>
	)
}
export default FlowPageBase;

