import React, { useState, useRef, useCallback } from "react";
import "reactflow/dist/style.css";
import { Row, Col } from "react-bootstrap";
import ReactFlow, { ReactFlowProvider } from "reactflow";
import SideBar from "../extraction/sideBar";
import FlowCanvas from "../extraction/flowCanvas";

// Extraction tab referred to in pages/_app.js.
// Shows sideBar nodes in a div on the left of the page,
// then react flow canvas where the nodes can be dropped.
const ExtractionPage = ({ pageId }) => {
  // Hook for current module
  const [flowType, setFlowType] = useState("extraction");
  return (
    <>
      <div className="extraction-div height-100 width-100 padding-10">
        <Row className="width-100 height-100 " style={{ overflow: "hidden" }}>
          <SideBar name="Workflow items" module={flowType} />
          <Col lg>
            <div className="height-100">
              <ReactFlowProvider>
                <FlowCanvas
                  id={pageId}
                  workflowType={flowType}
                  setWorkflowType={setFlowType}
                />
              </ReactFlowProvider>
            </div>
          </Col>
          <div id={pageId} className="workflow-settings" />
        </Row>
      </div>
    </>
  );
};

export default ExtractionPage;

