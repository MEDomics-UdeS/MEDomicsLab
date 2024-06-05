import React, { useContext, useState } from "react"
import Node from "../../flow/node"
import FlInput from "../flInput"
import { Form } from "react-bootstrap"
import flSettings from "../../../public/setupVariables/possibleSettings/MEDfl/flSettings"
import { FlowFunctionsContext } from "../../flow/context/flowFunctionsContext"

const FlOptimizeNode = ({ id, data }) => {
  // states
  const [optimizationType, setOptimizationType] = useState("gridSearch")
  const [selectedOptizers, setOptimizers] = useState([])
  //context
  const { updateNode } = useContext(FlowFunctionsContext)

  // Handle the Transfer Learning Activation change
  const onSelectionChange = (e) => {
    setOptimizationType(e.target.value)

    data.internal.settings["optimisation Type"] = e.target.value

    updateNode({
      id: id,
      updatedData: data.internal
    })
  }

  // select and unselect optimizers
  const selectOptimizers = (selection) => {
    data.internal.settings["Optimiser"] = selection.value.value.map((opt) => opt.name)

    updateNode({
      id: id,
      updatedData: data.internal
    })

    setOptimizers(selection.value.value)
  }

  const onModelInputChange = (inputUpdate) => {
    data.internal.settings[inputUpdate.name] = inputUpdate.value

    updateNode({
      id: id,
      updatedData: data.internal
    })
  }

  const updateOptimRanges = (metric, inputUpdate) => {
    data.internal.settings[metric] = {
      ...data.internal.settings[metric],
      [inputUpdate.name]: inputUpdate.value
    }

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
        nodeBody={
          <>
            <Form.Select
              aria-label="machine learning model"
              onChange={onSelectionChange}
              defaultValue={optimizationType}
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
              }}
            >
              <option
                key="GS"
                value={"gridSearch"}
                // selected={optionName === selection}
              >
                Grid Search Optimization
              </option>
              <option
                key="optCen"
                value={"optunaCentral"}
                // selected={optionName === selection}
              >
                Optuna central Optimization
              </option>
              {/* <option
                key="optFed"
                value={"optuanFederated"}
                // selected={optionName === selection}
              >
                Optuna federated Optimization
              </option> */}
            </Form.Select>
          </>
        }
        // default settings are the default settings of the node, so mandatory settings
        defaultSettings={<></>}
        // node specific is the body of the node, so optional settings
        nodeSpecific={
          <>
            {(() => {
              switch (optimizationType) {
                case "optunaCentral":
                  return (
                    <>
                      <FlInput
                        name="Metric"
                        settingInfos={{
                          type: "list",
                          tooltip: "<p>Specify the model type</p>",
                          choices: [{ name: "precision" }, { name: "accuracy" }, { name: "recall" }, { name: "f1" }, { name: "AUC" }]
                        }}
                        currentValue={data.internal.settings["Metric"]}
                        onInputChange={onModelInputChange}
                        setHasWarning={() => {}}
                      />
                      <FlInput
                        name="optimisation direction"
                        settingInfos={{
                          type: "list",
                          tooltip: "<p>Specify the model type</p>",
                          choices: [{ name: "maximize" }, { name: "minimize" }]
                        }}
                        currentValue={data.internal.settings["optimisation direction"]}
                        onInputChange={onModelInputChange}
                        setHasWarning={() => {}}
                      />
                      <div className="row">
                        <div className="col">Number of layers</div>
                        <div className="col">
                          <FlInput
                            name="Min"
                            settingInfos={{
                              type: "int",
                              tooltip: "<p>Specify a data file (xlsx, csv, json)</p>"
                            }}
                            currentValue={data.internal.settings["Number of layers"] ? data.internal.settings["Number of layers"]["Min"] : ""}
                            onInputChange={(e) => {
                              updateOptimRanges("Number of layers", e)
                            }}
                            setHasWarning={() => {}}
                          />
                        </div>
                        <div className="col">
                          <FlInput
                            name="Max"
                            settingInfos={{
                              type: "int",
                              tooltip: "<p>Specify a data file (xlsx, csv, json)</p>"
                            }}
                            currentValue={data.internal.settings["Number of layers"] ? data.internal.settings["Number of layers"]["Max"] : ""}
                            onInputChange={(e) => {
                              updateOptimRanges("Number of layers", e)
                            }}
                            setHasWarning={() => {}}
                          />
                        </div>
                      </div>
                      <div className="row">
                        <div className="col">Hidden layers size</div>
                        <div className="col">
                          <FlInput
                            name="Min"
                            settingInfos={{
                              type: "int",
                              tooltip: "<p>Specify a data file (xlsx, csv, json)</p>"
                            }}
                            currentValue={data.internal.settings["Hidden layers size"] ? data.internal.settings["Hidden layers size"]["Min"] : ""}
                            onInputChange={(e) => {
                              updateOptimRanges("Hidden layers size", e)
                            }}
                            setHasWarning={() => {}}
                          />
                        </div>
                        <div className="col">
                          <FlInput
                            name="Max"
                            settingInfos={{
                              type: "int",
                              tooltip: "<p>Specify a data file (xlsx, csv, json)</p>"
                            }}
                            currentValue={data.internal.settings["Hidden layers size"] ? data.internal.settings["Hidden layers size"]["Max"] : ""}
                            onInputChange={(e) => {
                              updateOptimRanges("Hidden layers size", e)
                            }}
                            setHasWarning={() => {}}
                          />
                        </div>
                      </div>
                      <div className="row">
                        <div className="col">Number of epochs</div>
                        <div className="col">
                          <FlInput
                            name="Min"
                            settingInfos={{
                              type: "int",
                              tooltip: "<p>Specify a data file (xlsx, csv, json)</p>"
                            }}
                            currentValue={data.internal.settings["Number of epochs"] ? data.internal.settings["Number of epochs"]["Min"] : ""}
                            onInputChange={(e) => {
                              updateOptimRanges("Number of epochs", e)
                            }}
                            setHasWarning={() => {}}
                          />
                        </div>
                        <div className="col">
                          <FlInput
                            name="Max"
                            settingInfos={{
                              type: "int",
                              tooltip: "<p>Specify a data file (xlsx, csv, json)</p>"
                            }}
                            currentValue={data.internal.settings["Number of epochs"] ? data.internal.settings["Number of epochs"]["Max"] : ""}
                            onInputChange={(e) => {
                              updateOptimRanges("Number of epochs", e)
                            }}
                            setHasWarning={() => {}}
                          />
                        </div>
                      </div>
                      <div className="row">
                        <div className="col">Learning rate</div>
                        <div className="col">
                          <FlInput
                            name="Min"
                            settingInfos={{
                              type: "float",
                              tooltip: "<p>Specify a data file (xlsx, csv, json)</p>"
                            }}
                            currentValue={data.internal.settings["Learning rate"] ? data.internal.settings["Learning rate"]["Min"] : ""}
                            onInputChange={(e) => {
                              updateOptimRanges("Learning rate", e)
                            }}
                            setHasWarning={() => {}}
                          />
                        </div>
                        <div className="col">
                          <FlInput
                            name="Max"
                            settingInfos={{
                              type: "float",
                              tooltip: "<p>Specify a data file (xlsx, csv, json)</p>"
                            }}
                            currentValue={data.internal.settings["Learning rate"] ? data.internal.settings["Learning rate"]["Max"] : ""}
                            onInputChange={(e) => {
                              updateOptimRanges("Learning rate", e)
                            }}
                            setHasWarning={() => {}}
                          />
                        </div>
                      </div>
                      <div className="row justify-between">
                        <div className="col-4">Optimizer</div>

                        <div className="col-8 ">
                          <FlInput
                            name=""
                            settingInfos={{
                              type: "list-multiple",
                              tooltip: "<p>Specify a data file (xlsx, csv, json)</p>",
                              choices: flSettings.optimize.options.optimizer.values.map((v) => {
                                return {
                                  name: v,
                                  label: v
                                }
                              })
                            }}
                            currentValue={selectedOptizers}
                            onInputChange={selectOptimizers}
                            setHasWarning={() => {}}
                          />
                        </div>
                        <div className="my-2">
                        <FlInput
                          name="Number of trials"
                          settingInfos={{
                            type: "int",
                            tooltip: "<p>Specify the model type</p>"
                          }}
                          currentValue={data.internal.settings["Number of trials"]}
                          onInputChange={onModelInputChange}
                          setHasWarning={() => {}}
                        />
                        </div>
                     
                      </div>
                    </>
                  )
                case "gridSearch":
                  return (
                    <>
                      <FlInput
                        name="Metric"
                        settingInfos={{
                          type: "list",
                          tooltip: "<p>Specify the model type</p>",
                          choices: [{ name: "precision" }, { name: "accuracy" }, { name: "recall" }, { name: "f1" }, { name: "AUC" }]
                        }}
                        currentValue={data.internal.settings["Metric"]}
                        onInputChange={onModelInputChange}
                        setHasWarning={() => {}}
                      />
                      <FlInput
                        name="Hidden dimentions"
                        settingInfos={{
                          type: "string",
                          tooltip: "<p>Specify the model type</p>"
                        }}
                        currentValue={data.internal.settings["Hidden dimentions"]}
                        onInputChange={onModelInputChange}
                        setHasWarning={() => {}}
                      />
                      <FlInput
                        name="Learning rate"
                        settingInfos={{
                          type: "string",
                          tooltip: "<p>Specify the model type</p>"
                        }}
                        currentValue={data.internal.settings["Learning rate"]}
                        onInputChange={onModelInputChange}
                        setHasWarning={() => {}}
                      />
                      <FlInput
                        name="Max epochs"
                        settingInfos={{
                          type: "string",
                          tooltip: "<p>Specify the model type</p>"
                        }}
                        currentValue={data.internal.settings["Max epochs"]}
                        onInputChange={onModelInputChange}
                        setHasWarning={() => {}}
                      />
                    </>
                  )
                default:
                  return <>{optimizationType} </>
              }
            })()}
          </>
        }
      />
    </>
  )
}

export default FlOptimizeNode
