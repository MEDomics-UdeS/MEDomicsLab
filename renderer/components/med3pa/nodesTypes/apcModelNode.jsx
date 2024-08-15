/* eslint-disable camelcase */
import React, { useState, useContext, useEffect } from "react"
import Node from "../../flow/node"
import FlInput from "../paInput"
import { Button, Modal } from "react-bootstrap"
import * as Icon from "react-bootstrap-icons"
import { FlowFunctionsContext } from "../../flow/context/flowFunctionsContext"
import { CiEdit } from "react-icons/ci"
import { LoaderContext } from "../../generalPurpose/loaderContext"

/**
 *
 * @param {string} id id of the node
 * @param {Object} data data of the node
 * @returns {JSX.Element} An APCModel node
 *
 *
 * @description
 * This component is used to display an APCModel node within the MED3pa subworkflow.
 * It manages the display of the node and the associated modal.
 * The APC Model can accept either a .pkl file as input
 *  OR general hyperparameters along with grid parameters.
 */
export default function APCModelNode({ id, data }) {
  const [showDetails, setShowDetails] = useState(false) // Show and hide settings details of the node
  // Show and Hide Modal and its Parameters
  const [showModal, setShowModal] = useState(false)
  const [showGridParams, setShowGridParams] = useState(false)
  const [showHyperParams, setShowHyperParams] = useState(false)

  const { setLoader } = useContext(LoaderContext)
  const { updateNode } = useContext(FlowFunctionsContext)
  const [hovered, setHovered] = useState(false)
  const [savePickled, setSavePickled] = useState(true) // Save the APC Model
  const [loading, setLoading] = useState(true)
  const [gridParams, setGridParams] = useState({}) // State to hold grid_params
  const [usePklInput, setUsePklInput] = useState() // Load an Existing Fixed
  const [showGridParamsSection, setShowGridParamsSection] = useState() // Activate/Desactivate Optimize Option

  // Initial set up of GridParams state and Loading State
  useEffect(() => {
    if (data.setupParam.possibleSettings && data.internal.settings) {
      setLoading(false)
    }
    const hasHyperparameters = data?.internal?.settings?.hyperparameters
    if (hasHyperparameters) {
      setUsePklInput(false)
    } else {
      setUsePklInput(true)
    }
  }, [])

  // Update Internal Node Data when the data.internal.settings change and "save_pickled" is not initialized
  useEffect(() => {
    if (!("save_pickled" in data.internal.settings) && !data.internal.settings.file) {
      updateNode({
        id: id,
        updatedData: {
          ...data.internal,
          settings: {
            ...data.internal.settings,
            save_pickled: true
          }
        }
      })
    }
  }, [data.internal.settings])

  /**
   *
   * @param {Object} hasWarning The warning object
   *
   *
   * @description
   * This function is used to update the node internal data when a warning is triggered from the Input component.
   */
  const handleWarning = (hasWarning) => {
    data.internal.hasWarning = hasWarning

    updateNode({
      id: id,
      updatedData: data.internal
    })
  }

  /**
   *
   * @param {Object} inputUpdate The input update
   *
   *
   * @description
   * This function is used to update the node internal data when the files input changes.
   */
  const onFilesChange = async (inputUpdate) => {
    // eslint-disable-next-line no-unused-vars
    const { metadata, ...rest } = inputUpdate.value

    // Now rest contains everything except metadata
    data.internal.settings.file = rest

    if (inputUpdate.value.path !== "") {
      setLoader(false)

      if (data.internal.settings.file) {
        data.internal.hasWarning = { state: false }
      } else {
        data.internal.hasWarning = { state: true, tooltip: <p>No Fixed Tree Structure selected</p> }
      }
    } else {
      setLoader(true)
      setTimeout(() => {
        setLoader(false)
      }, 1000) // Reset loader to true after 1 second
    }
    updateNode({
      id: id,
      updatedData: {
        ...data.internal,
        settings: {
          file: rest
        }
      }
    })
  }

  /**
   *
   * @param {string} key The unique key of the chosen hyperparameter
   * @param {Object} value The Updated Value (Input)
   *
   *
   * @description
   * This function is used to update the node internal data settings when the hyperparameters change
   */
  const handleHyperParamChange = (key, value) => {
    const selectedValues = Array.isArray(value.value) ? value.value.map((option) => option.name) : value.value

    // Update data.internal.settings.hyperparameters with the new value
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

  /**
   *
   * @param {string} key The unique key of the parameter to optimize (Grid Search).
   * @param {int} index The index of the value within the parameter's array of possible values to update.
   * @param {Object} value The Updated Value (Input)
   *
   *
   * @description
   * This function is used to update the node internal data settings When
   *  The grid search parameters array values change
   */
  const handleGridParamChange = (key, index, value) => {
    let selectedValues = Array.isArray(value.value) ? value.value.map((option) => option.name) : value.value
    if (index !== -1 && data.internal.settings.grid_params[key]) {
      selectedValues = [...data.internal.settings.grid_params[key]]
      // Update the specific index with the new value
      selectedValues[index] = value.value
    }

    // Update data.internal.settings.grid_params with the new value
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
    // Set state of GridParams with the new value
    setGridParams(data.internal.settings.grid_params)
  }

  /**
   *
   * @param {string} value The updated value
   *
   *
   * @description
   * This function sets activates and desactivates the Grid Search Optimization.
   */
  const handleShowGridParamsSectionChange = (value) => {
    const { value: optimize } = value

    setShowGridParamsSection(optimize)

    let updatedSettings = {
      ...data.internal.settings,
      optimize
    }

    // Update the node with the optimize setting first
    updateNode({
      id,
      updatedData: {
        ...data.internal,
        settings: updatedSettings
      }
    })

    // If optimize is true, add grid_params to settings
    if (optimize) {
      let gridParams = {}

      if (data.setupParam.possibleSettings?.grid_params) {
        data.setupParam.possibleSettings.grid_params.forEach((param) => {
          gridParams[param.name] = param.default_val
        })
      }

      updatedSettings = {
        ...updatedSettings,
        grid_params: gridParams
      }

      updateNode({
        id,
        updatedData: {
          ...data.internal,
          settings: updatedSettings
        }
      })

      setGridParams(gridParams)
    } else {
      // If optimize is false, remove grid_params from settings
      // eslint-disable-next-line no-unused-vars
      const { grid_params, ...rest } = updatedSettings

      updatedSettings = {
        ...rest
      }

      updateNode({
        id,
        updatedData: {
          ...data.internal,
          settings: updatedSettings
        }
      })

      setGridParams({})
    }
  }

  /**
   *
   * @param {string} paramName The name of the Grid Search parameter from which to remove the last element.
   *
   *
   * @description
   * This function updates the node's internal data settings when
   *  The length of a grid search parameter's array changes.
   * It checks if the specified parameter exists in the gridParams.
   *  If it does, it removes the last element from the
   * parameter's array and updates the node settings and gridParams state accordingly.
   */
  const handleRemoveGridParam = (paramName) => {
    if (!gridParams[paramName]) {
      return // Return early if paramName does not exist in grid_params
    }

    // Create a copy of the current grid_params array
    const updatedGridParams = [...gridParams[paramName]]

    // Ensure index is valid
    if (updatedGridParams.length > 0) {
      // Remove the item at the end
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

  /**
   *
   * @param {string} paramName The name of the Grid Search parameter to which to add an element
   *
   *
   * @description
   * This function updates the node's internal data settings when
   *  The length of a grid search parameter's array changes.
   * It checks if the specified parameter exists in the gridParams.
   *  If it does, it adds an element to the end of the
   * parameter's array and updates the node settings and gridParams state accordingly.
   */
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

  /**
   *
   * @param {Object} settings Object containing hyperparameters and grid search parameters.
   * @returns {JSX.Element} A JSX element representing the formatted display of settings.
   *
   *
   * @description
   * This function generates the JSX structure to display hyperparameters and grid search parameters.
   */
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
          {data.internal.settings.optimize ? (
            <>
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
            </>
          ) : (
            <p className="fw-bold">No optimization set</p>
          )}
        </div>
      </div>
    )
  }

  /**
   *
   * @param {Object} value The updated value (Input)
   *
   *
   * @description
   * This function updates the 'save_pickled' setting both in the local state and the node's internal data.
   */
  const handlesavePickledChange = (value) => {
    setSavePickled(value.value)
    if (value) {
      // Update the node with the updated state value
      updateNode({
        id: id,
        updatedData: {
          ...data.internal,
          settings: {
            ...data.internal.settings,
            save_pickled: value.value
          }
        }
      })
    }
  }

  /**
   *
   * @param {Object} value The updated value (Input)
   *
   *
   * @description
   * This function updates the node's data internal settings of the node based on 'use_pkl_input' value.
   *  If PKL input is enabled,
   * it checks if a file is selected.
   *  If not, it sets a warning to indicate that no fixed tree structure is selected.
   * If PKL input is disabled, it removes the 'file' property from the settings and clears any warnings.
   */
  const handleUsePKLChange = (value) => {
    setUsePklInput(value.value)
    if (value.value) {
      if (!data.internal.settings.file) {
        data.internal.hasWarning = { state: true, tooltip: <p>No Fixed Tree Structure selected</p> }
      } else {
        data.internal.hasWarning = { state: false }
      }
    } else {
      setLoading(true)
      data.internal.hasWarning = { state: false }
      if (data.setupParam.possibleSettings) {
        const defaultSettings = {
          optimize: data.setupParam.possibleSettings.optimize.default_val,
          maximum_min_samples_ratio: data.setupParam.possibleSettings.maximum_min_samples_ratio.default_val,
          hyperparameters: {},

          save_pickled: true
        }

        // Populate hyperparameters and grid_params with default values
        if (data.setupParam.possibleSettings) {
          data.setupParam.possibleSettings.hyperparameters.forEach((param) => {
            defaultSettings.hyperparameters[param.name] = param.default_val
          })
        }

        // Update the node with default settings
        data.internal.settings = defaultSettings

        // Set initial state

        setGridParams(defaultSettings.grid_params)

        setShowGridParamsSection(defaultSettings.optimize)
      }
    }
    setLoading(false)
  }

  /**
   *
   * @param {Object} value The updated value (Input)
   *
   *
   * @description
   * This function updates the node's data internal settings of the node based on the inputed value.
   *  maximum_min_samples_ratio: used to define the maximum range value of the min samples ratio
   */
  const handleMaxMinSRChange = (value) => {
    if (value) {
      // Update the node with the updated state value
      updateNode({
        id: id,
        updatedData: {
          ...data.internal,
          settings: {
            ...data.internal.settings,
            maximum_min_samples_ratio: value.value
          }
        }
      })
    }
  }

  /**
   *
   *
   * @description
   * This function switches the state of `showDetails` between `true` and `false`
   */
  const toggleShowDetails = () => {
    setShowDetails(!showDetails)
  }

  /**
   *
   *
   * @description
   * This function switches the state of `showGridParams` between `true` and `false`
   */
  const toggleShowGridParams = () => {
    setShowGridParams(!showGridParams)
  }

  /**
   *
   *
   * @description
   * This function switches the state of `showHyperParams` between `true` and `false`
   */
  const toggleShowHyperParams = () => {
    setShowHyperParams(!showHyperParams)
  }

  /**
   *
   *
   * @description
   * This function updates the state to display the modal. It sets the `showModal` state
   * to `true`, making the modal visible.
   */
  const handleModalShow = () => setShowModal(true)

  /**
   *
   *
   * @description
   * This function updates the state to hide the modal. It sets the `showModal` state
   * to `false`, making the modal invisible.
   */
  const handleModalClose = () => setShowModal(false)

  if (loading) {
    return <div>Loading...</div> // If the Settings are not loaded yet
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
              <FlInput
                key={"FixedTree"}
                name={"Load a Pickled Model"}
                settingInfos={{
                  type: "bool",
                  tooltip: "<p>Check if you have a ready apc model that you want to load</p>"
                }}
                currentValue={usePklInput}
                onInputChange={(value) => handleUsePKLChange(value)}
              />
            </div>

            {usePklInput ? (
              <div className="center mt-3">
                <FlInput
                  key={"FixedTree"}
                  name={"Load a Fixed tree structure"}
                  settingInfos={{
                    type: "med3pamodels-input",
                    tooltip: "<p>Load Tree Structure here</p>"
                  }}
                  currentValue={data.internal.settings.file || {}}
                  setHasWarning={handleWarning}
                  onInputChange={onFilesChange}
                />
              </div>
            ) : (
              <>
                <div className="center mt-3">
                  <FlInput
                    key={"maxMinSRatio"}
                    name={"Min Samples Ratio Range"}
                    settingInfos={{
                      ...data.setupParam.possibleSettings?.maximum_min_samples_ratio
                    }}
                    currentValue={data.internal.settings.maximum_min_samples_ratio || {}}
                    setHasWarning={handleWarning}
                    onInputChange={(value) => handleMaxMinSRChange(value)}
                  />
                </div>
                <div className="center mt-3">
                  <Button variant="light" className="width-100 btn-contour" onClick={handleModalShow}>
                    {data.internal.settings.target ? "Change Selected Parameters" : "Select APC Model Parameters"}
                  </Button>
                </div>
                <div className="center mt-3">
                  <FlInput
                    key={"SavePkl"}
                    name={"Store model in pickle format"}
                    settingInfos={{
                      type: "bool",
                      tooltip: "<p>Check if you want to save the model</p>"
                    }}
                    currentValue={savePickled}
                    onInputChange={handlesavePickledChange}
                  />
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
                      alignItems: "center",
                      marginTop: "10px" // Added marginTop for spacing
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
                  <div className="border border-light p-3 mt-3">
                    {" "}
                    {/* Added mt-3 for margin top */}
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
            )}
          </>
        }
        defaultSettings={<div>APC Model is responsible for extracting individual problematic patients</div>}
        nodeSpecific={<></>}
      />
      <Modal show={showModal} onHide={handleModalClose} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Select APC Model Parameters</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <>
            <h4 className="mt-1">Hyperparameters Section</h4>
            {data.setupParam.possibleSettings?.hyperparameters && (
              <>
                <div className="d-flex align-items-center mt-3 mb-2" style={{ cursor: "pointer" }} onClick={toggleShowHyperParams}>
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
                  <Icon.ChevronDown style={{ marginLeft: "auto" }} onClick={toggleShowHyperParams} />
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
            <h4 className="mt-4">Optimization Section</h4>

            <FlInput
              key="grid_section"
              name="Optimize"
              settingInfos={{
                ...data.setupParam.possibleSettings.optimize
              }}
              currentValue={data.internal.settings.optimize || showGridParamsSection}
              onInputChange={(value) => handleShowGridParamsSectionChange(value)}
            />
            {(showGridParamsSection || data.internal.settings.optimize) && data.setupParam.possibleSettings?.grid_params && (
              <>
                <div className="d-flex align-items-center mt-3 mb-2" style={{ cursor: "pointer" }} onClick={toggleShowGridParams}>
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
                  <Icon.ChevronDown style={{ marginLeft: "auto" }} />
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
