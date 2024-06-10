import React, { useState, useContext, useEffect } from "react"
import Node from "../../flow/node"

import { Button } from "react-bootstrap"
import * as Icon from "react-bootstrap-icons"
import { FlowFunctionsContext } from "../../flow/context/flowFunctionsContext"
import { Stack } from "react-bootstrap"
import { DataContext } from "../../workspace/dataContext"
import MedDataObject from "../../workspace/medDataObject"
import { LoaderContext } from "../../generalPurpose/loaderContext"
import ModalSettingsChooser from "../../learning/modalSettingsChooser"
import FlInput from "../paInput"
import { OverlayTrigger, Tooltip } from "react-bootstrap"

export default function DatasetLoaderNode({ id, data }) {
  const [modalShow, setModalShow] = useState(false)
  const [hovered, setHovered] = useState(false)
  const { updateNode } = useContext(FlowFunctionsContext)
  const { globalData, setGlobalData } = useContext(DataContext)
  const { setLoader } = useContext(LoaderContext)
  const [showDetails, setShowDetails] = useState(false)
  const [settings, setSettings] = useState(data.internal.settings)

  useEffect(() => {
    if (Object.keys(settings).length < Object.keys(data.setupParam.possibleSettings.datasets[data.internal.contentType].files).length * 3) {
      data.internal.hasWarning = { state: true, tooltip: <p>Select all dataset types</p> }
    } else {
      data.internal.hasWarning = { state: false }
    }

    // Filter out keys that don't start with "file" or "target"
    const filteredSettings = Object.keys(settings).reduce((acc, key) => {
      if (key.startsWith("file_") || key.startsWith("target_")) {
        acc[key] = settings[key]
      }
      return acc
    }, {})

    // Update data.internal.settings with the new filtered settings
    updateNode({
      id: id,
      updatedData: {
        ...data.internal,
        settings: {
          ...filteredSettings
        }
      }
    })
  }, [settings]) // eslint-disable-line react-hooks/exhaustive-deps

  const onInputChange = (inputUpdate) => {
    const newSettings = { ...settings, [inputUpdate.name]: inputUpdate.value }
    if (["files", "target"].includes(inputUpdate.name)) {
      setGlobalData({ ...globalData })
    }

    setSettings(newSettings)
  }

  const handleWarning = (hasWarning) => {
    updateNode({
      id: id,
      updatedData: {
        ...data.internal,
        hasWarning: hasWarning
      }
    })
  }

  const onFilesChange = async (inputUpdate) => {
    const newSettings = { ...settings, [inputUpdate.name]: inputUpdate.value }
    const fileIndex = parseInt(inputUpdate.name.split("_")[2])
    if (inputUpdate.value.path !== "") {
      setLoader(true)
      const { columnsArray, columnsObject } = await MedDataObject.getColumnsFromPath(inputUpdate.value.path, globalData, setGlobalData)
      const steps = await MedDataObject.getStepsFromPath(inputUpdate.value.path, globalData, setGlobalData)
      setLoader(false)
      if (steps) newSettings.steps = steps

      // Update the columns property for the specific file index
      newSettings[`columns_${data.internal.contentType}_${fileIndex}`] = columnsObject

      // Update target variable for the corresponding file
      newSettings[`target_${data.internal.contentType}_${fileIndex}`] = columnsArray[columnsArray.length - 1]
    }
    if (newSettings[`target_${data.internal.contentType}_${fileIndex}`] === "") {
      delete newSettings[`target_${data.internal.contentType}_${fileIndex}`].target
      delete newSettings[`columns_${data.internal.contentType}_${fileIndex}`]
    }
    setSettings(newSettings)
  }

  const getDatasetFields = (datasets, contentType) => {
    if (!datasets[contentType]) return null
    return datasets[contentType].files.map((file, index) => (
      <React.Fragment key={`${contentType}_${index}`}>
        <p className="text-muted">Please Select {file.name}</p>
        <FlInput
          name={`file_${contentType}_${index}`}
          settingInfos={{
            type: "data-input",
            tooltip: datasets[contentType].tooltip
          }}
          currentValue={settings[`file_${contentType}_${index}`] || ""}
          onInputChange={onFilesChange}
          setHasWarning={handleWarning}
        />
        <FlInput
          name={`target_${contentType}_${index}`}
          settingInfos={{
            type: "list",
            tooltip: "<p>Specify the column name of the target variable</p>",
            choices: settings[`columns_${contentType}_${index}`]
              ? Object.entries(settings[`columns_${contentType}_${index}`]).map(([option]) => {
                  return {
                    name: option
                  }
                })
              : []
          }}
          currentValue={data.internal.settings[`target_${contentType}_${index}`] || ""}
          onInputChange={onInputChange}
          setHasWarning={handleWarning}
        />
      </React.Fragment>
    ))
  }

  const toggleShowDetails = () => {
    console.log(data.internal.settings)
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
                {settings.target ? `Change Selected ${data.internal.contentType} Datasets` : `Select ${data.internal.contentType} Datasets`}
              </Button>
              <p style={{ textAlign: "center", marginTop: "10px", fontSize: "12px" }}>
                This node simplifies the process by
                <br />
                automatically detecting if an Evaluation Set
                <br />
                required for each ML model when connected.
              </p>
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
                  {data.internal.contentType === "default"
                    ? // Show details only for the default content type
                      data.setupParam.possibleSettings.datasets[data.internal.contentType].files.map((file, index) => (
                        <div className="row mb-2" key={`${data.internal.contentType}_${index}`}>
                          <div className="col-sm-6">
                            <p className="fw-bold mb-2">{file.name}</p>
                          </div>
                          <div className="col-sm-6 text-end">
                            <OverlayTrigger placement="top" overlay={<Tooltip id="tooltip">{settings[`file_${data.internal.contentType}_${index}`]?.name}</Tooltip>}>
                              <p className="fw-bold mb-0" style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                {settings[`file_${data.internal.contentType}_${index}`]?.name}
                              </p>
                            </OverlayTrigger>
                          </div>
                        </div>
                      ))
                    : // Show details for all content types
                      Object.keys(data.setupParam.possibleSettings.datasets).map((contentType) => (
                        <React.Fragment key={contentType}>
                          {data.setupParam.possibleSettings.datasets[contentType].files.map((file, index) => (
                            <div className="row mb-2" key={`${contentType}_${index}`}>
                              <div className="col-sm-6">
                                <p className="fw-bold mb-2">{file.name}</p>
                              </div>
                              <div className="col-sm-6 text-end">
                                <OverlayTrigger placement="top" overlay={<Tooltip id="tooltip">{settings[`file_${contentType}_${index}`]?.name}</Tooltip>}>
                                  <p className="fw-bold mb-0" style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                    {settings[`file_${contentType}_${index}`]?.name}
                                  </p>
                                </OverlayTrigger>
                              </div>
                            </div>
                          ))}
                        </React.Fragment>
                      ))}
                </div>
              </div>
            )}
          </>
        }
        defaultSettings={
          <Stack id="default" direction="vertical" gap={1}>
            {getDatasetFields(data.setupParam.possibleSettings.datasets, data.internal.contentType)}
          </Stack>
        }
        nodeSpecific={
          <>
            <Button variant="light" className="width-100 btn-contour" onClick={() => setModalShow(true)}>
              <Icon.Plus width="30px" height="30px" className="img-fluid" />
            </Button>
            <ModalSettingsChooser show={modalShow} onHide={() => setModalShow(false)} options={data.setupParam.possibleSettings.options} data={data} id={id} />
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
    </>
  )
}
