/* eslint-disable camelcase */
import React, { useState, useContext, useEffect } from "react"
import Node from "../../flow/node"
import FlInput from "../paInput"
import { Button, Modal } from "react-bootstrap"
import * as Icon from "react-bootstrap-icons"
import { FlowFunctionsContext } from "../../flow/context/flowFunctionsContext"
import { CiEdit } from "react-icons/ci"

export default function APCModelNode({ id, data }) {
  const [showDetails, setShowDetails] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [showGridParams, setShowGridParams] = useState(false)
  const [showHyperParams, setShowHyperParams] = useState(false)

  const { updateNode } = useContext(FlowFunctionsContext)
  const [hovered, setHovered] = useState(false)

  const [loading, setLoading] = useState(true)
  const [gridParams, setGridParams] = useState({}) // State to hold grid_params

  useEffect(() => {
    if (data.setupParam.possibleSettings && data.internal.settings) {
      setGridParams(data.internal.settings.grid_params)
      setLoading(false)
    }
  }, [])
  useEffect(() => {
    console.log("GRID PARAMS :", data.internal.settings.grid_params)
  }, [data.internal.settings.grid_params])

  useEffect(() => {
    console.log("HYPERPARAMS:", data.internal.settings.hyperparameters)
  }, [data.internal.settings.hyperparameters])

  const handleHyperParamChange = (key, value) => {
    const selectedValues = Array.isArray(value.value) ? value.value.map((option) => option.name) : value.value

    updateNode({
      id: id,
      updatedData: {
        ...data.internal,
        settings: {
          ...data.internal.settings,
          hyperparameters: {
            ...data.internal.settings.hyperparameters,
            [key]: selectedValues
          }
        }
      }
    })
  }

  const handleGridParamChange = (key, index, value) => {
    let selectedValues = Array.isArray(value.value) ? value.value.map((option) => option.name) : value.value
    if (index !== -1 && data.internal.settings.grid_params[key]) {
      selectedValues = [...data.internal.settings.grid_params[key]]
      // Update the specific index with the new value
      selectedValues[index] = value.value
    }

    updateNode({
      id: id,
      updatedData: {
        ...data.internal,
        settings: {
          ...data.internal.settings,
          grid_params: {
            ...data.internal.settings.grid_params,
            [key]: selectedValues
          }
        }
      }
    })
    setGridParams(data.internal.settings.grid_params)
  }

  const handleRemoveGridParam = (paramName) => {
    if (!gridParams[paramName]) {
      return // Return early if paramName does not exist in grid_params
    }

    // Create a copy of the current grid_params array
    const updatedGridParams = [...gridParams[paramName]]

    // Ensure index is valid
    if (updatedGridParams.length > 0) {
      // Remove the item at the specified index
      updatedGridParams.splice(updatedGridParams.length - 1, 1)

      // Update the settings with the modified grid_params
      updateNode({
        id: id,
        updatedData: {
          ...data.internal,
          settings: {
            ...data.internal.settings,
            grid_params: {
              ...data.internal.settings.grid_params,
              [paramName]: updatedGridParams
            }
          }
        }
      })

      // Update gridParams state after updating node data
      setGridParams((prevState) => ({
        ...prevState,
        [paramName]: updatedGridParams
      }))
    }
  }
  const renderSettings = (settings) => {
    return (
      <div>
        <div className="mb-3">
          <p className="fw-bold">Hyperparameters:</p>
          {Object.keys(settings.hyperparameters).map((key, index) => (
            <div key={`hyperparam-${index}`} className="row mb-2">
              <div className="col-sm-6">
                <p className="fw-bold mb-0">{key}</p>
              </div>
              <div className="col-sm-6 text-end">
                <p className="fw-bold mb-0">{settings.hyperparameters[key]}</p>
              </div>
            </div>
          ))}
        </div>
        <hr></hr>
        <div className="mb-3">
          <p className="fw-bold">Grid Search Parameters:</p>
          {Object.keys(settings.grid_params).map((key, index) => (
            <div key={`gridparam-${index}`} className="row mb-2">
              <div className="col-sm-6">
                <p className="fw-bold mb-0">{key}</p>
              </div>
              <div className="col-sm-6 text-end">
                <p className="fw-bold mb-0">[{settings.grid_params[key].map((item) => (item === null ? "N/A" : item)).join(", ")}]</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const handleAddGridParam = (paramName) => {
    if (!gridParams[paramName]) {
      return // Return early if paramName does not exist in grid_params
    }

    // Create a copy of the current grid_params array
    const updatedGridParams = [...gridParams[paramName]]

    // Append a new item (here, adding 0 as an example)
    updatedGridParams.push(null)

    // Update the settings with the modified grid_params
    updateNode({
      id: id,
      updatedData: {
        ...data.internal,
        settings: {
          ...data.internal.settings,
          grid_params: {
            ...data.internal.settings.grid_params,
            [paramName]: updatedGridParams
          }
        }
      }
    })

    // Update gridParams state after updating node data
    setGridParams((prevState) => ({
      ...prevState,
      [paramName]: updatedGridParams
    }))
  }

  const toggleShowDetails = () => {
    setShowDetails(!showDetails)
  }

  const toggleShowGridParams = () => {
    setShowGridParams(!showGridParams)
  }

  const toggleShowHyperParams = () => {
    setShowHyperParams(!showHyperParams)
  }

  const handleModalShow = () => setShowModal(true)
  const handleModalClose = () => setShowModal(false)

  if (loading) {
    return <div>Loading...</div>
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
              <Button variant="light" className="width-100 btn-contour" onClick={handleModalShow}>
                {data.internal.settings.target ? "Change Selected Parameters" : "Select APC Model Parameters"}
              </Button>
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
                      color: hovered ? "black" : "#999"
                    }}
                  >
                    {showDetails ? "Hide Details" : "Show Details"}
                  </span>
                  {showDetails ? (
                    <Icon.Dash
                      style={{
                        color: hovered ? "black" : "#999",
                        marginRight: "5px"
                      }}
                    />
                  ) : (
                    <Icon.Plus
                      style={{
                        color: hovered ? "black" : "#999",
                        marginRight: "5px"
                      }}
                    />
                  )}
                </div>
              </Button>
            </div>
            {showDetails && data.internal.settings && (
              <div className="border border-light p-3 mb-3">
                <hr className="my-2" />
                <br />
                <div className="mb-3">
                  <p className="fw-bold mb-0">Default Settings</p>
                  <br />
                  {renderSettings(data.internal.settings)}
                </div>
              </div>
            )}
          </>
        }
        defaultSettings={<div>IPC Model is responsible for extracting individual problematic patients</div>}
        nodeSpecific={<></>}
      />
      <Modal show={showModal} onHide={handleModalClose} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Select IPC Model Parameters</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <>
            {data.setupParam.possibleSettings?.hyperparameters && (
              <>
                <div className="d-flex align-items-center mt-3 mb-2">
                  <div className="fw-bold" style={{ color: "#555" }}>
                    <CiEdit
                      style={{
                        fontSize: "1.2rem",
                        marginRight: "5px",
                        color: "#555"
                      }}
                    />
                    Edit Hyperparameters
                  </div>
                  <Icon.ChevronDown style={{ cursor: "pointer", marginLeft: "auto" }} onClick={toggleShowHyperParams} />
                </div>
                {showHyperParams &&
                  data.setupParam.possibleSettings?.hyperparameters.map((param) => {
                    // Transform choices to objects with a name property if choices exist
                    const transformedChoices = param.choices ? param.choices.map((choice) => ({ name: choice })) : []
                    const paramValue = param.type === "string" && transformedChoices.length > 0 ? [param.default_val] : param.default_val

                    // If param type is string and transformed choices exist, convert to list
                    return (
                      <div key={`hyperparam.${param.name}`} style={{ marginBottom: "20px" }}>
                        <FlInput
                          key={param.name}
                          name={param.name}
                          settingInfos={{
                            type: transformedChoices.length > 0 ? "list" : param.type,
                            choices: transformedChoices,
                            default_val: param.default_val,
                            tooltip: param.tooltip
                          }}
                          currentValue={data.internal.settings?.hyperparameters?.[param.name] || paramValue}
                          onInputChange={(value) => handleHyperParamChange(param.name, value)}
                        />
                      </div>
                    )
                  })}
              </>
            )}

            {data.setupParam.possibleSettings?.grid_params && (
              <>
                <div className="d-flex align-items-center mt-3 mb-2">
                  <div className="fw-bold" style={{ color: "#555" }}>
                    <CiEdit
                      style={{
                        fontSize: "1.2rem",
                        marginRight: "5px",
                        color: "#555"
                      }}
                    />
                    Edit GridSearch Optimization Parameters
                  </div>
                  <Icon.ChevronDown style={{ cursor: "pointer", marginLeft: "auto" }} onClick={toggleShowGridParams} />
                </div>
                {showGridParams &&
                  data.setupParam.possibleSettings.grid_params.map((param, gridIndex) => {
                    // Transform choices to objects with a name property if choices exist
                    const transformedChoices = param.choices
                      ? param.choices.map((choice) => ({
                          name: choice
                        }))
                      : []

                    // If param type is string and transformed choices exist, convert to list
                    const paramValue = param.type === "string" && transformedChoices.length > 0 ? [param.default_val] : param.default_val

                    // If param type is int and default value is an array, display as FlInputs inline
                    if (param.type === "int" && Array.isArray(param.default_val)) {
                      return (
                        <div key={`gridparam.${param.name}`} style={{ marginBottom: "20px", display: "flex", alignItems: "center" }}>
                          {gridParams && Object.keys(gridParams).length > 0 && (
                            <div style={{ flex: 1 }}>
                              {param.name}
                              {gridParams[param.name].map((value, index) => (
                                <div
                                  key={`${param.name}.${index}`}
                                  style={{
                                    display: "inline-block",
                                    marginLeft: "10px",
                                    width: "10%"
                                  }}
                                >
                                  <FlInput
                                    key={`${param.name}.${index}`}
                                    name={""}
                                    settingInfos={{
                                      type: param.type,
                                      choices: transformedChoices,
                                      default_val: value,
                                      tooltip: param.tooltip
                                    }}
                                    currentValue={value}
                                    onInputChange={(newValue) => handleGridParamChange(param.name, index, newValue)} // Ensure to pass newValue correctly
                                  />
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Plus Icon */}
                          {gridParams && Object.keys(gridParams).length > 0 && (
                            <>
                              <Button variant="light" size="sm" style={{ marginRight: "5px" }} onClick={() => handleAddGridParam(param.name)}>
                                <Icon.Plus />
                              </Button>
                              <Button variant="danger" size="sm" onClick={() => handleRemoveGridParam(param.name, gridIndex)}>
                                <Icon.Trash />
                              </Button>
                            </>
                          )}
                        </div>
                      )
                    } else {
                      // Default rendering for non-array types
                      return (
                        <div key={`gridparam.${param.name}`} style={{ marginBottom: "20px" }}>
                          <FlInput
                            key={param.name}
                            name={param.name}
                            settingInfos={{
                              type: param.type,
                              choices: transformedChoices,
                              default_val: paramValue,
                              tooltip: param.tooltip
                            }}
                            currentValue={data.internal.settings?.grid_params?.[param.name] || paramValue}
                            onInputChange={(newValue) => handleGridParamChange(param.name, -1, newValue)}
                          />
                        </div>
                      )
                    }
                  })}
              </>
            )}
          </>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleModalClose}>
            Close
          </Button>
          <Button variant="primary" onClick={handleModalClose}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  )
}
