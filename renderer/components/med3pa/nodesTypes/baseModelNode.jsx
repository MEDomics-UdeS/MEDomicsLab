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
    const filterSettings = () => {
      const filteredSettings = Object.keys(data.internal.settings)
        .filter((key) => ["file"].includes(key))
        .reduce((obj, key) => {
          obj[key] = data.internal.settings[key]
          return obj
        }, {})

      return filteredSettings
    }

    const updateSettings = () => {
      const filteredSettings = filterSettings()
      data.internal.settings = filteredSettings

      updateNode({
        id: id,
        updatedData: data.internal
      })
    }

    if (data.internal.settings.file) {
      data.internal.hasWarning = { state: false, tooltip: <p>No Base Model selected</p> }
    } else {
      data.internal.hasWarning = { state: true }
    }

    updateSettings()
  }, [id, data.internal, updateNode])

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
          </>
        }
        defaultSettings={
          <>
            <Stack id="default" direction="vertical" gap={1}>
              <>
                <FlInput
                  name="file"
                  settingInfos={{
                    type: "data-input",
                    tooltip: "<p>Specify a model file (model)</p>"
                  }}
                  currentValue={data.internal.settings.file || {}}
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
