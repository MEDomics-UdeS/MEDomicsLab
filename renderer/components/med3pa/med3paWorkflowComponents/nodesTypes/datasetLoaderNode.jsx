/* 

This File uses MedDataObject to :

 - Handle .csv files change i.e Datasets Loading Operation 
    * Function 'onFilesChange' 

This File uses DataContext to :

 - Set the globalData and Load .csv Datasets and the target variable
    * Function 'onFilesChange'
    * Function 'onInputChange'
    
*/

import React, { useState, useContext, useEffect } from "react"
import Node from "../../../flow/node"
import { Button, Stack, OverlayTrigger, Tooltip } from "react-bootstrap"
import * as Icon from "react-bootstrap-icons"
import { FlowFunctionsContext } from "../../../flow/context/flowFunctionsContext"
import { DataContext } from "../../../workspace/dataContext"
import MedDataObject from "../../../workspace/medDataObject"
import { LoaderContext } from "../../../generalPurpose/loaderContext"

import FlInput from "../../baseComponents/paInput"

/**
 *
 * @param {string} id id of the node
 * @param {Object} data data of the node
 * @returns {JSX.Element} A BaseModel node
 *
 *
 * @description
 * This component is used to display a DatasetLoader node.
 * It manages the display of the node.
 * The node takes 4 .csv files as an input: Training Set, Validation Set, Reference Set
 * and Possible Shifted Set (Test Set)
 */
export default function DatasetLoaderNode({ id, data }) {
  const [hovered, setHovered] = useState(false)
  const { updateNode } = useContext(FlowFunctionsContext)
  const { globalData, setGlobalData } = useContext(DataContext)
  const { setLoader } = useContext(LoaderContext)
  const [showDetails, setShowDetails] = useState(false) // Show and hide settings details of the node
  const [settings, setSettings] = useState(data.internal.settings) // store the data.internal.settings state

  // Set up node's data internal settings when settings variable state changes
  useEffect(() => {
    /**
     *
     * @returns {Object} An object containing only the filtered settings.
     *
     *
     * @description
     * This function filters the `data.internal.settings` object to include only the settings
     * with keys that are specified in the filter array. It creates a new object containing
     * only these filtered settings and returns it.
     */
    const filterSettings = () => {
      const filteredSettings = Object.keys(settings).reduce((acc, key) => {
        if (key.startsWith("file_") || key.startsWith("target_")) {
          acc[key] = settings[key]
        }
        return acc
      }, {})

      return filteredSettings
    }

    /**
     *
     *
     * @description
     * This function updates the `data.internal.settings` with the filtered settings
     */
    const updateSettings = () => {
      const filteredSettings = filterSettings()
      data.internal.settings = filteredSettings

      updateNode({
        id: id,
        updatedData: data.internal
      })
    }
    updateSettings()
  }, [id, settings])

  // Update the internal data warning when the settings variable length changes
  useEffect(() => {
    const hasAllDatasetTypes = Object.keys(data.internal.settings).length < Object.keys(data.setupParam.possibleSettings.datasets.files).length * 2
    data.internal.hasWarning = {
      state: hasAllDatasetTypes,
      tooltip: hasAllDatasetTypes && <p>Select all dataset types</p>
    }
  }, [settings])

  /**
   *
   * @param {Object} inputUpdate The input update
   *
   *
   * @description
   * This function is used to update the node internal data when the target input changes.
   */
  const onInputChange = (inputUpdate) => {
    const newSettings = { ...settings, [inputUpdate.name]: inputUpdate.value }
    if (["file", "target"].includes(inputUpdate.name.split("_")[0])) {
      setGlobalData({ ...globalData })
    }
    setSettings(newSettings)
  }

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
   * This function is used to update the node internal data when the loaded files changes.
   */
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

  /**
   *
   * @param {Object} datasets - An object containing dataset information (files{name,path} and targets).
   * @returns {React.Fragment[]} An array of React fragments, each containing input fields
   * for specifying the dataset file and its target variable.
   *
   *
   * @description
   * This function creates input fields for each dataset file.
   * For each file, it generates:
   * - A `FlInput` component for selecting the file.
   * - A `FlInput` component for specifying the target variable column name.
   */
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

  /**
   *
   *
   * @description
   * This function switches the state of `showDetails` between `true` and `false`
   */
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
            <p style={{ textAlign: "center", marginTop: "10px", fontSize: "12px" }}>
              This node is responsible for <br></br>Loading the main Datasets required for the experiment.
            </p>
          </div>
          {!data.internal.hasWarning.state && (
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
