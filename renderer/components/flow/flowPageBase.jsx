import { Row, Col } from "react-bootstrap"
import "reactflow/dist/style.css";
import React, {useContext, useEffect} from "react";
import SidebarAvailableNodes from "./sidebarAvailableNodes";
import { ReactFlowProvider } from "reactflow"
import {OffCanvasBackdropStyleProvider} from "./context/offCanvasBackdropStyleContext"
import Backdrop from "./backdrop";
import { FlowInfosProvider , FlowInfosContext} from "./context/flowInfosContext";

const FlowPageBaseWithFlowInfos = ({ pageId, workflowType, workflowJSX }) => {
	const { updateFlowInfos } = useContext(FlowInfosContext);

	useEffect(() => {
		updateFlowInfos({
			id: pageId,
			type: workflowType,
		});
	}, [pageId, workflowType]);

	return (
		<>
			<OffCanvasBackdropStyleProvider>
				<div className='learning-div height-100 width-100 padding-10'>
					<Row className="width-100 height-100 " style={{ overflow: "hidden" }} >
						<SidebarAvailableNodes title="Available Nodes" sidebarType={workflowType} />
						<Col md >
							<div className="height-100" >
								<ReactFlowProvider>
									{workflowJSX}
								</ReactFlowProvider>
							</div>
						</Col>
						<Backdrop pageId={pageId}/>
					</Row>
				</div>
			</OffCanvasBackdropStyleProvider>
		</>
	)
}


const FlowPageBase = (props) => {
	return (
		<FlowInfosProvider>
			<FlowPageBaseWithFlowInfos {...props}/>
		</FlowInfosProvider>
	)
}
export default FlowPageBase;

