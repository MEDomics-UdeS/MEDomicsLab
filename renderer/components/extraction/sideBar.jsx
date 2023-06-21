// Basic sidebar for nodes in reactflow
import { Col } from "react-bootstrap";
import "reactflow/dist/style.css";
import Card from "react-bootstrap/Card";
import React from "react";
import SidebarAvailableNodes from "../flow/sidebarAvailableNodes";

const SideBar = ({ name, module }) => {
  return (
    <>
      <Col className=" padding-0 available-nodes-panel" sm={2}>
        <Card className="text-center height-100">
          <Card.Header>
            <h4>{name}</h4>
          </Card.Header>
          <Card.Body>
            {/* Available nodes depend on current selected module */}
            <SidebarAvailableNodes sidebarType={module} />
          </Card.Body>
        </Card>
      </Col>
    </>
  );
};

export default SideBar;
