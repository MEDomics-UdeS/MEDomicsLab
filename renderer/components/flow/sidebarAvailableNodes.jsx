import React from "react"
import Card from "react-bootstrap/Card"
import nodesParams from "../../public/setupVariables/allNodesParams"
import { Col, Row } from "react-bootstrap"
import { Stack } from "react-bootstrap"

/**
 *
 * @param {*} event Represents the drag event that is fired when a node is dragged from the sidebar
 * @param {*} node Information about the node that is being dragged
 *
 * @description
 * This function is called when a node is dragged from the sidebar.
 * It sets the data that is being dragged.
 *
 * @returns {void}
 */
const onDragStart = (event, node) => {
  const stringNode = JSON.stringify(node)
  event.dataTransfer.setData("application/reactflow", stringNode)
  event.dataTransfer.effectAllowed = "move"
}

/**
 * @param {string} title The title of the sidebar
 * @param {string} sidebarType Corresponding to a key in nodesParams
 *
 * @returns {JSX.Element} A Card for each node in nodesParams[sidebarType]
 *
 * @description
 * This component is used to display the nodes available in the sidebar.
 *
 */
const SidebarAvailableNodes = ({ title, sidebarType }) => {
  return (
    <>
      <Col className=" padding-0 available-nodes-panel">
        <Card className="text-center height-100">
          <Card.Header>
            <Row>
              <h5>{title}</h5>
            </Row>
          </Card.Header>
          <Card.Body className="overflow-auto">
            <Stack direction="vertical" gap={2}>
              {Object.keys(nodesParams[sidebarType]).map((nodeName) => {
                // this code is executed for each node in nodesParams[sidebarType] and returns a Card for each node
                // it also attaches the onDragStart function to each Card so that the node can be dragged from the sidebar and dropped in the flow
                // the data that is being dragged is set in the onDragStart function and passed to the onDrop function in the flow
                let node = nodesParams[sidebarType][nodeName]
                return (
                  <div
                    key={nodeName}
                    className="cursor-grab"
                    onDragStart={(event) =>
                      onDragStart(event, {
                        nodeType: `${node.type}`,
                        name: `${node.title}`,
                        image: `${node.img}`
                      })
                    }
                    draggable
                  >
                    <Card key={node.title} className="text-left">
                      <Card.Header className="draggable-side-node">
                        {node.title}
                        <img src={`/icon/${sidebarType}/${node.img}`} alt={node.title} className="icon-nodes" />
                      </Card.Header>
                    </Card>
                  </div>
                )
              })}
            </Stack>
          </Card.Body>
        </Card>
      </Col>
    </>
  )
}

export default SidebarAvailableNodes
