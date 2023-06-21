import { Row, Col } from "react-bootstrap"
import Workflow from "../learning/workflow";
import "reactflow/dist/style.css";
import Card from "react-bootstrap/Card";
import React, { useState, useContext} from "react";
import SidebarAvailableNodes from "../flow/sidebarAvailableNodes";
import {
	ReactFlowProvider,
} from "reactflow"
import {OffCanvasBackdropStyleProvider} from "../flow/OffCanvasBackdropStyleContext"
import Backdrop from "../flow/backdrop";

export default function LearningPage({ pageId }) {
	const [flowType, setFlowType] = useState("learning") // this state has been implemented because of subflows implementation
	return (
		<>
			<OffCanvasBackdropStyleProvider>
				<div className='learning-div height-100 width-100 padding-10'>
					<Row className="width-100 height-100 " style={{ overflow: "hidden" }} >
						<Col className=" padding-0 available-nodes-panel" sm={2}>
							<Card className="text-center height-100" >
								<Card.Header><h4>Nodes</h4></Card.Header>
								<Card.Body>
									<SidebarAvailableNodes sidebarType={flowType} />
								</Card.Body>
							</Card>
						</Col>
						<Col md >
							<div className="height-100" >
								<ReactFlowProvider>
									<Workflow id={pageId} workflowType={flowType} setWorkflowType={setFlowType} />
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