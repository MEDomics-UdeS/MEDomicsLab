import React from "react"
import Card from "react-bootstrap/Card"
import nodesParams from "../../public/setupVariables/allNodesParams"
import { Col } from "react-bootstrap"

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
 *
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
      <Col className=" padding-0 available-nodes-panel" sm={2}>
        <Card className="text-center height-100">
          <Card.Header>
            <h4>{title}</h4>
          </Card.Header>
          <Card.Body>
            {/* Available nodes depend on current selected module */}

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
                  {/* here we create the Card for each node */}
                  <Card
                    key={node.title}
                    className="text-left margin-vertical-10"
                  >
                    <Card.Header className="draggable-side-node">
                      {node.title}
                      <img
                        src={`/icon/${sidebarType}/${node.img}`}
                        alt={node.title}
                        className="icon-nodes"
                      />
                    </Card.Header>
                  </Card>
                </div>
              )
            })}
          </Card.Body>
        </Card>
      </Col>
    </>
  )
}

export default SidebarAvailableNodes
