import React, { useState, useContext, useEffect } from "react"
import Node from "../../flow/node"
import { Button, Stack, OverlayTrigger, Tooltip } from "react-bootstrap"
import * as Icon from "react-bootstrap-icons"
import { FlowFunctionsContext } from "../../flow/context/flowFunctionsContext"
import { DataContext } from "../../workspace/dataContext"
import MedDataObject from "../../workspace/medDataObject"
import { LoaderContext } from "../../generalPurpose/loaderContext"
import FlInput from "../paInput"

export default function DatasetLoaderNode({ id, data }) {
  const [hovered, setHovered] = useState(false)
  const { updateNode } = useContext(FlowFunctionsContext)
  const { globalData, setGlobalData } = useContext(DataContext)
  const { setLoader } = useContext(LoaderContext)
  const [showDetails, setShowDetails] = useState(false)
  const [settings, setSettings] = useState(data.internal.settings)

  useEffect(() => {
    const filterSettings = () => {
      const filteredSettings = Object.keys(settings).reduce((acc, key) => {
        if (key.startsWith("file_") || key.startsWith("target_")) {
          acc[key] = settings[key]
        }
        return acc
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
    updateSettings()
  }, [id, data.internal, updateNode])

  useEffect(() => {
    const hasAllDatasetTypes = Object.keys(data.internal.settings).length < Object.keys(data.setupParam.possibleSettings.datasets.files).length
    data.internal.hasWarning = { state: hasAllDatasetTypes, tooltip: hasAllDatasetTypes && <p>Select all dataset types</p> }
  }, [settings])

  const onInputChange = (inputUpdate) => {
    const newSettings = { ...settings, [inputUpdate.name]: inputUpdate.value }
    if (["files", "target"].includes(inputUpdate.name)) {
      setGlobalData({ ...globalData })
    }
    setSettings(newSettings)
  }

  const handleWarning = (hasWarning) => {
    data.internal.hasWarning = hasWarning
    updateNode({
      id: id,
      updatedData: data.internal
    })
  }

  const onFilesChange = async (inputUpdate) => {
    const newSettings = { ...settings, [inputUpdate.name]: inputUpdate.value }
    const fileIndex = parseInt(inputUpdate.name.split("_")[1])
    if (inputUpdate.value.path !== "") {
      setLoader(true)
      const { columnsArray, columnsObject } = await MedDataObject.getColumnsFromPath(inputUpdate.value.path, globalData, setGlobalData)
      const steps = await MedDataObject.getStepsFromPath(inputUpdate.value.path, globalData, setGlobalData)
      setLoader(false)
      if (steps) newSettings.steps = steps

      newSettings[`columns_${fileIndex}`] = columnsObject

      const targetValue = columnsArray && columnsArray.length > 0 ? columnsArray[columnsArray.length - 1] : ""
      newSettings[`target_${fileIndex}`] = targetValue
    }
    if (newSettings[`target_${fileIndex}`] === "") {
      delete newSettings[`target_${fileIndex}`]
      delete newSettings[`columns_${fileIndex}`]
    }
    setSettings(newSettings)
  }

  const getDatasetFields = (datasets) => {
    return datasets.files.map((file, index) => (
      <React.Fragment key={`${index}`}>
        <p className="text-muted">Please Select {file.name}</p>
        <FlInput
          name={`file_${index}`}
          settingInfos={{ type: "data-input", tooltip: datasets.tooltip }}
          currentValue={settings[`file_${index}`] || ""}
          onInputChange={onFilesChange}
          setHasWarning={handleWarning}
        />
        <FlInput
          name={`target_${index}`}
          settingInfos={{
            type: "list",
            tooltip: "<p>Specify the column name of the target variable</p>",
            choices: settings[`columns_${index}`] ? Object.entries(settings[`columns_${index}`]).map(([option]) => ({ name: option })) : []
          }}
          currentValue={settings[`target_${index}`] || ""}
          onInputChange={onInputChange}
          setHasWarning={handleWarning}
        />
      </React.Fragment>
    ))
  }

  const toggleShowDetails = () => {
    setShowDetails(!showDetails)
  }

  return (
    <Node
      key={id}
      id={id}
      data={data}
      setupParam={data.setupParam}
      nodeBody={
        <>
          <div className="center">
            <Button variant="light" className="width-100 btn-contour">
              {settings.target ? `Change Selected Main Datasets` : `Select Main Datasets`}
            </Button>
            <p style={{ textAlign: "center", marginTop: "10px", fontSize: "12px" }}>This node is responsible for loading the main Datasets required for the experiment.</p>
          </div>
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
          {showDetails && (
            <div className="border border-light p-3 mb-3">
              <hr className="my-2" />
              <br />
              <div className="mb-3">
                <p className="fw-bold mb-0">List Of Datasets</p>
                <br />
                {data.setupParam.possibleSettings.datasets.files.map((file, index) => (
                  <div className="row mb-2" key={`${index}`}>
                    <div className="col-sm-6">
                      <p className="fw-bold mb-2">{file.name}</p>
                    </div>
                    <div className="col-sm-6 text-end">
                      <OverlayTrigger placement="top" overlay={<Tooltip id="tooltip">{settings[`file_${index}`]?.name}</Tooltip>}>
                        <p className="fw-bold mb-0" style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {settings[`file_${index}`]?.name}
                        </p>
                      </OverlayTrigger>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      }
      defaultSettings={
        <Stack id="default" direction="vertical" gap={1}>
          {getDatasetFields(data.setupParam.possibleSettings.datasets)}
        </Stack>
      }
      nodeSpecific={
        <>
          {data.internal.checkedOptions.map((optionName) => (
            <FlInput
              key={optionName}
              name={optionName}
              settingInfos={data.setupParam.possibleSettings.options[optionName]}
              currentValue={settings[optionName]}
              onInputChange={(value) => onInputChange({ name: optionName, value })}
            />
          ))}
        </>
      }
    />
  )
}
