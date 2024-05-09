import React, { useEffect, useState } from "react"
import Node from "../../flow/node"
import FlInput from "../flInput"
import { Button, Form } from "react-bootstrap"
import CodeEditor from "../../flow/codeEditor"

const FlModelNode = ({ id, data }) => {
  // states
  const [tlActivated, setTLActivation] = useState("true")
  const [noTlModel, setNoTLmodel] = useState("custom")

  // Handle the Transfer Learning Activation change
  const onSelectionChange = (e) => {
    setTLActivation(e.target.value)
  }

  //Handle the model creation method change
  const onSelectMethodChange = (e) => {
    setNoTLmodel(e.target.value)
  }

  useEffect(() => {}, [tlActivated])

  return (
    <>
      {/* build on top of the Node component */}
      <Node
        key={id}
        id={id}
        data={data}
        setupParam={data.setupParam}
        // the body of the node is a form select (particular to this node)
        nodeBody={
          <>
            <Form.Select
              aria-label="machine learning model"
              onChange={onSelectionChange}
              defaultValue={tlActivated}
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
              }}
            >
              <option
                key="TL"
                value={"true"}
                // selected={optionName === selection}
              >
                Activate Transfer Learning
              </option>
              <option
                key="NoTL"
                value={"false"}
                // selected={optionName === selection}
              >
                Deactivate Transfer Learning
              </option>
            </Form.Select>
          </>
        }
        // default settings are the default settings of the node, so mandatory settings
        defaultSettings={<></>}
        // node specific is the body of the node, so optional settings
        nodeSpecific={
          <>
            {(() => {
              switch (tlActivated) {
                case "true":
                  return (
                    <>
                      <FlInput
                        name="Select a model"
                        settingInfos={{
                          type: "data-input",
                          tooltip: "<p>Specify a data file (xlsx, csv, json)</p>"
                        }}
                        currentValue={data.internal.settings.files || {}}
                        onInputChange={() => {}}
                        setHasWarning={() => {}}
                      />
                    </>
                  )
                case "false":
                  return (
                    <>
                      <Form.Select
                        aria-label=""
                        onChange={onSelectMethodChange}
                        defaultValue={noTlModel}
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                        }}
                      >
                        <option
                          key=""
                          value={"custom"}
                          // selected={optionName === selection}
                        >
                          MEDfl custom model
                        </option>
                        <option
                          key=""
                          value={"scratch"}
                          // selected={optionName === selection}
                        >
                          Create a model from scratch
                        </option>
                      </Form.Select>
                      {noTlModel === "custom" ? (
                        <>
                          <FlInput
                            name="Model type"
                            settingInfos={{
                              type: "list",
                              tooltip: "<p>Specify the model type</p>",
                              choices: [{ name: "Binary classifier" }]
                            }}
                            currentValue={data.internal.settings.files || {}}
                            onInputChange={() => {}}
                            setHasWarning={() => {}}
                          />
                          <FlInput
                            name="Input size"
                            settingInfos={{
                              type: "int",
                              tooltip: "<p>Specify the model type</p>"
                            }}
                            currentValue={{}}
                            onInputChange={() => {}}
                            setHasWarning={() => {}}
                          />
                          <FlInput
                            name="Number of layers"
                            settingInfos={{
                              type: "int",
                              tooltip: "<p>Specify the model type</p>"
                            }}
                            currentValue={{}}
                            onInputChange={() => {}}
                            setHasWarning={() => {}}
                          />
                          <FlInput
                            name="Hidden size"
                            settingInfos={{
                              type: "int",
                              tooltip: "<p>Specify the model type</p>"
                            }}
                            currentValue={{}}
                            onInputChange={() => {}}
                            setHasWarning={() => {}}
                          />
                          <FlInput
                            name="Optimizer"
                            settingInfos={{
                              type: "list",
                              tooltip: "<p>Specify the model type</p>",
                              choices: [{ name: "ADAM" }]
                            }}
                            currentValue={data.internal.settings.files || {}}
                            onInputChange={() => {}}
                            setHasWarning={() => {}}
                          />
                          <FlInput
                            name="Threshold"
                            settingInfos={{
                              type: "float",
                              tooltip: "<p>Specify the model type</p>"
                            }}
                            currentValue={data.internal.settings.files || {}}
                            onInputChange={() => {}}
                            setHasWarning={() => {}}
                          />
                          <Button>Create model</Button>
                        </>
                      ) : (
                        <>
                          <CodeEditor></CodeEditor>

                          <Button>Create model</Button>
                        </>
                      )}
                    </>
                  )
                default:
                  return <>{tlActivated} frwqw</>
              }
            })()}
          </>
        }
      />
    </>
  )
}

export default FlModelNode
