import Node from "../../flow/node"

export default function MPCModelNode({ id, data }) {
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

        nodeSpecific={
          <>
            <div>This node MPC Model represents the minimum between the APC and IPC model.</div>
          </>
        }
        // Adding a description for the node
      >
        {/* Display the description inside the Node component */}
      </Node>
    </>
  )
}
