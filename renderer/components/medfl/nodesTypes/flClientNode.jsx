import React from "react"
import Node from "../../flow/node"
import { Button } from "react-bootstrap"
import FlInput from "../flInput"

export default function FlClientNode({ id, data }) {
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
              name="Node's type"
              settingInfos={{
                type: "list",
                tooltip: "Specify the number of federated rounds",
                choices: [{ name: "Train node" }, { name: "Test Node" }, { name: "Hybrid (Train + Test)" }]
              }}
              currentValue={10}
              onInputChange={() => {}}
              setHasWarning={() => {}}
            />
            <FlInput
              name="Node Dataset"
              settingInfos={{
                type: "data-input",
                tooltip: "<p>Specify a data file (xlsx, csv, json)</p>"
              }}
              currentValue={data.internal.settings.files || {}}
              onInputChange={() => {}}
              setHasWarning={() => {}}
            />
          </>
        }
        // node specific is the body of the node, so optional settings
        nodeSpecific={
          <>
            <div className="center">
              <Button variant="light" className="width-100 btn-contour">
                View Dataset
              </Button>
            </div>
          </>
        }
      />
    </>
  )
}
