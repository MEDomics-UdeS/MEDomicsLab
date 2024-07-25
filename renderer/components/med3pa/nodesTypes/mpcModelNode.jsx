import Node from "../../flow/node"
/**
 *
 * @param {string} id id of the node
 * @param {Object} data data of the node
 * @returns {JSX.Element} An MPCModel node
 *
 *
 * @description
 * This component is used to display an MPCModel node within the MED3pa subworkflow.
 * It manages the visual representation of the node. The MPCModel node is a representative
 * element showing what the MPC Model does in the backend. It does not have any parameters to be set.
 */
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
        nodeSpecific={
          <>
            {/* Display the description of the Node component */}
            <div>This node MPC Model represents the minimum between the APC and IPC model.</div>
          </>
        }
      ></Node>
    </>
  )
}
