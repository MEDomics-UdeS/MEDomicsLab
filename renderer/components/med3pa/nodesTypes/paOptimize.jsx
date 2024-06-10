import React from "react"
import Node from "../../flow/node"

export default function PaOptimize({ id, data }) {
  // context

  return (
    <>
      {/* build on top of the Node component */}
      <Node
        key={id}
        id={id}
        data={data}
        setupParam={data.setupParam}
        // the body of the node is a form select (particular to this node)
        nodeBody={<></>}
        // default settings are the default settings of the node, so mandatory settings
        defaultSettings={<></>}
        // node specific is the body of the node, so optional settings
        description="This node optimizes the HyperParameters of the MED3pa models with Grid Search"
        nodeSpecific={
          <>
            <div>{data.description}</div>
          </>
        }
        // Adding a description for the node
      >
        {/* Display the description inside the Node component */}
      </Node>
    </>
  )
}
