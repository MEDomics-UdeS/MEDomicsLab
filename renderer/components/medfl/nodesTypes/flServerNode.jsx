import React from "react"
import Node from "../../flow/node"
import FlInput from "../flInput"

export default function FlServerNode({ id, data }) {
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
        defaultSettings={
          <>
            <FlInput
              name="Server rounds"
              settingInfos={{
                type: "int",
                tooltip: "Specify the number of federated rounds"
              }}
              currentValue={10}
              onInputChange={() => {}}
              setHasWarning={() => {}}
            />
          </>
        }
        // node specific is the body of the node, so optional settings
        nodeSpecific={<></>}
      />
    </>
  )
}
