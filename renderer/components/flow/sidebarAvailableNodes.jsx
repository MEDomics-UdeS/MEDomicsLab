import React, { useState, useEffect } from "react";
import Card from "react-bootstrap/Card";
import nodesParams from "../../public/setupVariables/allNodesParams";

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
  const stringNode = JSON.stringify(node);
  event.dataTransfer.setData("application/reactflow", stringNode);
  event.dataTransfer.effectAllowed = "move";
};

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
const SidebarAvailableNodes = ({ sidebarType }) => {
  return (
    <>
      {Object.keys(nodesParams[sidebarType]).map((nodeName) => {
        // this code is executed for each node in nodesParams[sidebarType] and returns a Card for each node
        let node = nodesParams[sidebarType][nodeName];
        return (
          <div
            key={nodeName}
            className="cursor-grab"
            onDragStart={(event) =>
              onDragStart(event, {
                nodeType: `${node.type}`,
                name: `${node.title}`,
                image: `${node.img}`,
              })
            }
            draggable
          >
            <Card key={node.title} className="text-left margin-vertical-10">
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
        );
      })}
    </>
  );
};

export default SidebarAvailableNodes;
