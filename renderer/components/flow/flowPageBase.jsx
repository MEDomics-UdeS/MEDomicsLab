import { Row, Col } from "react-bootstrap"
import "reactflow/dist/style.css";
import React from "react";
import SidebarAvailableNodes from "../flow/sidebarAvailableNodes";
import {
	ReactFlowProvider,
} from "reactflow"
import {OffCanvasBackdropStyleProvider} from "../flow/OffCanvasBackdropStyleContext"
import Backdrop from "../flow/backdrop";

export default function FlowPageBase({ pageId, workflowType, workflowJSX }) {
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