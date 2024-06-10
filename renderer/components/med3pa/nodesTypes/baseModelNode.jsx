/* eslint-disable camelcase */
import React, { useState, useContext, useEffect } from "react"
import Node from "../../flow/node"

import { Button } from "react-bootstrap"
import * as Icon from "react-bootstrap-icons"
import { FlowFunctionsContext } from "../../flow/context/flowFunctionsContext"
import { Stack } from "react-bootstrap"
import { DataContext } from "../../workspace/dataContext"
import MedDataObject from "../../workspace/medDataObject"
import { LoaderContext } from "../../generalPurpose/loaderContext"
import FlInput from "../paInput"

export default function BaseModelNode({ id, data }) {
  const [showDetails, setShowDetails] = useState(false)
  const { updateNode } = useContext(FlowFunctionsContext)
  const [hovered, setHovered] = useState(false)
  const { globalData, setGlobalData } = useContext(DataContext)
  const { setLoader } = useContext(LoaderContext)

  useEffect(() => {
    if (data.internal.settings.files && data.internal.settings.files.path === "") {
      data.internal.hasWarning = { state: true, tooltip: <p>No Base Model selected</p> }
    } else {
      data.internal.hasWarning = { state: false }
    }
    updateNode({
      id: id,
      updatedData: data.internal
    })
  }, [])

  const handleWarning = (hasWarning) => {
    data.internal.hasWarning = hasWarning
    updateNode({
      id: id,
      updatedData: data.internal
    })
  }

  const onFilesChange = async (inputUpdate) => {
    data.internal.settings[inputUpdate.name] = inputUpdate.value
    if (inputUpdate.value.path !== "") {
      setLoader(true)
      let { columnsArray, columnsObject } = await MedDataObject.getColumnsFromPath(inputUpdate.value.path, globalData, setGlobalData)
      let steps = await MedDataObject.getStepsFromPath(inputUpdate.value.path, globalData, setGlobalData)
      setLoader(false)
      steps && (data.internal.settings.steps = steps)
      data.internal.settings.columns = columnsObject
      data.internal.settings.target = columnsArray[columnsArray.length - 1]
    } else {
      delete data.internal.settings.target
      delete data.internal.settings.columns
    }
    updateNode({
      id: id,
      updatedData: data.internal
    })
  }

  const toggleShowDetails = () => {
    setShowDetails(!showDetails)
  }

  const defaultHyperparameters = {
    objective: "binary:logistic",
    eval_metric: "auc",
    eta: 0.1,
    max_depth: 6,
    subsample: 0.8,
    colsample_bytree: 0.8,
    min_child_weight: 1,
    nthread: 4,
    tree_method: "hist",
    device: "cpu"
  }

  // Initialize hyperparameters with default values if not already set
  if (!data.internal.settings.hyperparameters) {
    data.internal.settings.hyperparameters = { ...defaultHyperparameters }
  }

  return (
    <>
      <Node
        key={id}
        id={id}
        data={data}
        setupParam={data.setupParam}
        nodeBody={
          <>
            <div className="center">
              <Button variant="light" className="width-100 btn-contour">
                {data.internal.settings.target ? "Change Base Model" : "Select Base Model"}
              </Button>
            </div>
            {data.internal.settings.target && (
              <div className="center">
                <Button
                  variant="light"
                  className="width-100 btn-contour"
                  onClick={toggleShowDetails}
                  style={{
                    backgroundColor: "transparent",
                    border: "none",
                    padding: 0,
                    textAlign: "left",
                    display: "flex",
                    alignItems: "center"
                  }}
                >
                  <div
                    className="d-flex align-items-center"
                    style={{
                      transition: "color 0.3s",
                      cursor: "pointer",
                      marginLeft: "auto"
                    }}
                    onMouseEnter={() => setHovered(true)}
                    onMouseLeave={() => setHovered(false)}
                  >
                    <span
                      className="ms-2"
                      style={{
                        fontSize: "0.8rem",
                        color: hovered ? "black" : "#999" // Lighter color
                      }}
                    >
                      {showDetails ? "Hide Details" : "Show Details"}
                    </span>
                    {showDetails ? <Icon.Dash style={{ color: hovered ? "black" : "#999", marginRight: "5px" }} /> : <Icon.Plus style={{ color: hovered ? "black" : "#999", marginRight: "5px" }} />}
                  </div>
                </Button>
              </div>
            )}
            {showDetails && (
              <div className="border border-light p-3 mb-3">
                <div className="mb-3">
                  <p className="fw-bold mb-0">Model Type & Class</p>
                  <br></br>
                  <div className="row">
                    <div className="col-sm-6">
                      <p className="fw-bold mb-2">Type</p>
                    </div>
                    <div className="col-sm-6 text-end">
                      <p className="fw-bold mb-0">XGBoost Model</p>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-sm-6">
                      <p className="fw-bold mb-2">Class</p>
                    </div>
                    <div className="col-sm-6 text-end">
                      <p className="fw-bold mb-0">xgb.Booster</p>
                    </div>
                  </div>
                </div>
                <hr className="my-2" />
                <br></br>

                <p className="fw-bold mb-0">Extracted Training Hyperparameters</p>
                <br></br>
                {Object.entries(data.internal.settings.hyperparameters).map(([param, value]) => (
                  <div key={param} className="mb-3">
                    <FlInput
                      name={param}
                      settingInfos={{
                        tooltip: "Extracted Parameter Value"
                      }}
                      currentValue={value}
                      onInputChange={() => {}}
                    />
                  </div>
                ))}
              </div>
            )}
          </>
        }
        defaultSettings={
          <>
            <Stack id="default" direction="vertical" gap={1}>
              <>
                <FlInput
                  name="files"
                  settingInfos={{
                    type: "data-input",
                    tooltip: "<p>Specify a model file (model)</p>"
                  }}
                  currentValue={data.internal.settings.files || {}}
                  onInputChange={onFilesChange}
                  setHasWarning={handleWarning}
                />
              </>
            </Stack>
          </>
        }
      />
    </>
  )
}
