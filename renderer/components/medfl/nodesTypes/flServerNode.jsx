import React, { useContext, useState } from "react"
import Node from "../../flow/node"
import FlInput from "../flInput"
import { FlowFunctionsContext } from "../../flow/context/flowFunctionsContext"

export default function FlServerNode({ id, data }) {
  // context
  const { updateNode } = useContext(FlowFunctionsContext)

  // state
  const [nRounds, setNrounds] = useState(data.internal.settings.nRounds || null)

  const onChangeRounds = (nodeType) => {
    data.internal.settings.nRounds = nodeType.value
    setNrounds(nodeType.value)

    // Update the node
    updateNode({
      id: id,
      updatedData: data.internal
    })
  }
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
              currentValue={nRounds}
              onInputChange={onChangeRounds}
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
