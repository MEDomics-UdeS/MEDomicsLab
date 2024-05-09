import React from "react"
import Node from "../../flow/node"
import FlInput from "../flInput"

export default function FlStrategyNode({ id, data }) {
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
              name="Aggregation algorithm"
              settingInfos={{
                type: "list",
                tooltip: "Specify the desription of the federated setup",
                choices: [{ name: "FedAvg" }]
              }}
              currentValue={""}
              onInputChange={() => {}}
              setHasWarning={() => {}}
            />

            <FlInput
              name="Evaluation fraction"
              settingInfos={{
                type: "float",
                tooltip: "Specify the desription of the federated setup"
              }}
              currentValue={""}
              onInputChange={() => {}}
              setHasWarning={() => {}}
            />

            <FlInput
              name="Training fraction"
              settingInfos={{
                type: "float",
                tooltip: "Specify the desription of the federated setup"
              }}
              currentValue={""}
              onInputChange={() => {}}
              setHasWarning={() => {}}
            />

            <FlInput
              name="Minimal used clients for evaluation"
              settingInfos={{
                type: "int",
                tooltip: "Specify the desription of the federated setup"
              }}
              currentValue={""}
              onInputChange={() => {}}
              setHasWarning={() => {}}
            />

            <FlInput
              name="Minimal used clients for training "
              settingInfos={{
                type: "int",
                tooltip: "Specify the desription of the federated setup"
              }}
              currentValue={""}
              onInputChange={() => {}}
              setHasWarning={() => {}}
            />

            <FlInput
              name="Minimal available clients "
              settingInfos={{
                type: "int",
                tooltip: "Specify the desription of the federated setup"
              }}
              currentValue={""}
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
