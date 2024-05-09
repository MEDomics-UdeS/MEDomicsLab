import React, { useState } from "react"
import Node from "../../flow/node"
import FlInput from "../flInput"
import { Form } from "react-bootstrap"
import flSettings from "../../../public/setupVariables/possibleSettings/MEDfl/flSettings"

const FlOptimizeNode = ({ id, data }) => {
  // states
  const [optimizationType, setOptimizationType] = useState("gridSearch")
  const [selectedOptizers, setOptimizers] = useState([])

  // Handle the Transfer Learning Activation change
  const onSelectionChange = (e) => {
    setOptimizationType(e.target.value)
  }

  // select and unselect optimizers
  const selectOptimizers = (selection) => {
    let optimizer = selection.value.selectedOption
    console.log("this is the optimizer", optimizer)
    let itemExisted = -1
    let currentOptimizers = selectedOptizers

    currentOptimizers.map((v, index) => {
      if (v.name === optimizer.name) {
        itemExisted = index
      }
    })

    if (itemExisted >= 0) {
      currentOptimizers.splice(itemExisted, 1)
    } else {
      currentOptimizers.push(optimizer)
    }

    console.log(currentOptimizers)

    setOptimizers(currentOptimizers)
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
                value={"optuanCentral"}
                // selected={optionName === selection}
              >
                Optuna central Optimization{" "}
              </option>
              <option
                key="optFed"
                value={"optuanFederated"}
                // selected={optionName === selection}
              >
                Optuna federated Optimization
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
              switch (optimizationType) {
                case "optuanCentral":
                  return (
                    <>
                      <div className="row">
                        <div className="col">Number of layers</div>
                        <div className="col">
                          <FlInput
                            name="Min"
                            settingInfos={{
                              type: "int",
                              tooltip: "<p>Specify a data file (xlsx, csv, json)</p>"
                            }}
                            currentValue={data.internal.settings.files || {}}
                            onInputChange={() => {}}
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
                            currentValue={data.internal.settings.files || {}}
                            onInputChange={() => {}}
                            setHasWarning={() => {}}
                          />
                        </div>
                      </div>
                      <div className="row">
                        <div className="col">hidden layers size</div>
                        <div className="col">
                          <FlInput
                            name="Min"
                            settingInfos={{
                              type: "int",
                              tooltip: "<p>Specify a data file (xlsx, csv, json)</p>"
                            }}
                            currentValue={data.internal.settings.files || {}}
                            onInputChange={() => {}}
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
                            currentValue={data.internal.settings.files || {}}
                            onInputChange={() => {}}
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
                            currentValue={data.internal.settings.files || {}}
                            onInputChange={() => {}}
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
                            currentValue={data.internal.settings.files || {}}
                            onInputChange={() => {}}
                            setHasWarning={() => {}}
                          />
                        </div>
                      </div>
                      <div className="row">
                        <div className="col">Leanring rate</div>
                        <div className="col">
                          <FlInput
                            name="Min"
                            settingInfos={{
                              type: "int",
                              tooltip: "<p>Specify a data file (xlsx, csv, json)</p>"
                            }}
                            currentValue={data.internal.settings.files || {}}
                            onInputChange={() => {}}
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
                            currentValue={data.internal.settings.files || {}}
                            onInputChange={() => {}}
                            setHasWarning={() => {}}
                          />
                        </div>
                      </div>
                      <div className="row justify-between">
                        <div className="col-4">Optimizer</div>

                        <div className="col-8 ">
                          <FlInput
                            name="Max"
                            settingInfos={{
                              type: "list-multiple",
                              tooltip: "<p>Specify a data file (xlsx, csv, json)</p>",
                              choices: flSettings.optimize.options.optimizer.values.map((v) => {
                                return {
                                  name: v,
                                  value: v
                                }
                              })
                            }}
                            currentValue={selectedOptizers}
                            onInputChange={selectOptimizers}
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
                        name="Hidden dimentions"
                        settingInfos={{
                          type: "string",
                          tooltip: "<p>Specify the model type</p>"
                        }}
                        currentValue={""}
                        onInputChange={() => {}}
                        setHasWarning={() => {}}
                      />
                      <FlInput
                        name="Learning rate"
                        settingInfos={{
                          type: "string",
                          tooltip: "<p>Specify the model type</p>"
                        }}
                        currentValue={""}
                        onInputChange={() => {}}
                        setHasWarning={() => {}}
                      />
                      <FlInput
                        name="Max epochs"
                        settingInfos={{
                          type: "string",
                          tooltip: "<p>Specify the model type</p>"
                        }}
                        currentValue={""}
                        onInputChange={() => {}}
                        setHasWarning={() => {}}
                      />
                    </>
                  )
                default:
                  return <>{optimizationType} frwqw</>
              }
            })()}
          </>
        }
      />
    </>
  )
}

export default FlOptimizeNode
