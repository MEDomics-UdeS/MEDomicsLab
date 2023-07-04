import React, { useState } from "react";
import Workflow from "../extraction/flowCanvas";
import FlowPageBase from "../flow/flowPageBase";

// Extraction tab referred to in pages/_app.js.
// Shows sideBar nodes in a div on the left of the page,
// then react flow canvas where the nodes can be dropped.
const ExtractionPage = ({ pageId }) => {
  const [flowType, setFlowType] = useState("extraction"); // this state has been implemented because of subflows implementation
  return (
    <>
      <FlowPageBase
        pageId={pageId}
        workflowType={flowType}
        workflowJSX={
          <Workflow
            id={pageId}
            workflowType={flowType}
            setWorkflowType={setFlowType}
          />
        }
      />
    </>
  );
};
export default ExtractionPage;
