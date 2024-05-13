import React, { useContext, useEffect, useState } from "react"
import Node from "../../flow/node"
import FlInput from "../flInput"
import { Button, Form } from "react-bootstrap"
import CodeEditor from "../../flow/codeEditor"
import { FlowFunctionsContext } from "../../flow/context/flowFunctionsContext"

const FlModelNode = ({ id, data }) => {
  // context
  const { updateNode } = useContext(FlowFunctionsContext)

  // states
  const [tlActivated, setTLActivation] = useState(data.internal.settings.activateTl || "true")
  const [noTlModel, setNoTLmodel] = useState(data.internal.settings.noTlModelType || "custom")

  // Handle the Transfer Learning Activation change
  const onSelectionChange = (e) => {
    setTLActivation(e.target.value)

    data.internal.settings.activateTl = e.target.value

    // Update the node
    updateNode({
      id: id,
      updatedData: data.internal
    })
  }

  //Handle the model creation method change
  const onSelectMethodChange = (e) => {
    setNoTLmodel(e.target.value)

    data.internal.settings.noTlModelType = e.target.value

    // Update the node
    updateNode({
      id: id,
      updatedData: data.internal
    })
  }

  const onFilesChange = async (inputUpdate) => {
    data.internal.settings[inputUpdate.name] = inputUpdate.value

    updateNode({
      id: id,
      updatedData: data.internal
    })
  }

  const onModelInputChange = (inputUpdate) => {
    data.internal.settings[inputUpdate.name] = inputUpdate.value

    updateNode({
      id: id,
      updatedData: data.internal
    })
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
                        name="file"
                        settingInfos={{
                          type: "data-input",
                          tooltip: "<p>Specify a data file (xlsx, csv, json)</p>"
                        }}
                        currentValue={data.internal.settings.file || {}}
                        onInputChange={onFilesChange}
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
                            onInputChange={onModelInputChange}
                            setHasWarning={() => {}}
                          />
                          <FlInput
                            name="Input size"
                            settingInfos={{
                              type: "int",
                              tooltip: "<p>Specify the model type</p>"
                            }}
                            currentValue={{}}
                            onInputChange={onModelInputChange}
                            setHasWarning={() => {}}
                          />
                          <FlInput
                            name="Number of layers"
                            settingInfos={{
                              type: "int",
                              tooltip: "<p>Specify the model type</p>"
                            }}
                            currentValue={{}}
                            onInputChange={onModelInputChange}
                            setHasWarning={() => {}}
                          />
                          <FlInput
                            name="Hidden size"
                            settingInfos={{
                              type: "int",
                              tooltip: "<p>Specify the model type</p>"
                            }}
                            currentValue={{}}
                            onInputChange={onModelInputChange}
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
                            onInputChange={onModelInputChange}
                            setHasWarning={() => {}}
                          />
                          <FlInput
                            name="Threshold"
                            settingInfos={{
                              type: "float",
                              tooltip: "<p>Specify the model type</p>"
                            }}
                            currentValue={data.internal.settings.files || {}}
                            onInputChange={onModelInputChange}
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
