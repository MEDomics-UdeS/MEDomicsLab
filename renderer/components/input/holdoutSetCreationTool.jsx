import { MultiSelect } from "primereact/multiselect"
import React, { useContext, useState, useEffect } from "react"
import { ipcRenderer } from "electron"
import { Row, Col } from "react-bootstrap"
import { Checkbox } from "primereact/checkbox"
import { WorkspaceContext } from "../workspace/workspaceContext"
import { DataContext } from "../workspace/dataContext"
import { Tooltip } from "primereact/tooltip"
import { Dropdown } from "primereact/dropdown"
import MedDataObject from "../workspace/medDataObject"
import { Slider } from "primereact/slider"
import { InputNumber } from "primereact/inputnumber"
import { requestBackend } from "../../utilities/requests"
import ProgressBarRequests from "../generalPurpose/progressBarRequests"
import { toast } from "react-toastify"
import { ErrorRequestContext } from "../generalPurpose/errorRequestContext"
import SaveDataset from "../generalPurpose/saveDataset"
import { Message } from "primereact/message"
import { cleanString, updateListOfDatasets } from "./simpleToolsUtils"
import { bottom } from "@popperjs/core"

/**
 * Component that renders the holdout set creation tool
 * @param {Object} props
 * @param {String} props.pageId - The id of the page
 * @param {String} props.configPath - The path of the config file
 */
const HoldoutSetCreationTool = ({ pageId = "inputModule", configPath = "" }) => {
  const { port } = useContext(WorkspaceContext) // The port
  const { setError } = useContext(ErrorRequestContext) // We get the setError function from the context
  const { globalData } = useContext(DataContext) // The global data object
  const [listOfDatasets, setListOfDatasets] = useState([]) // The list of datasets
  const [selectedDataset, setSelectedDataset] = useState(null) // The selected dataset
  const [options, setOptions] = useState({ shuffle: false, stratify: false }) // The options for the holdout set creation
  const [selectedColumns, setSelectedColumns] = useState([]) // The selected columns
  const [selectedDatasetColumns, setSelectedDatasetColumns] = useState([]) // The columns of the selected dataset
  const [holdoutSetSize, setHoldoutSetSize] = useState(20) // The size of the holdout set
  const [newDatasetName, setNewDatasetName] = useState("") // The name of the new dataset
  const [newDatasetExtension, setNewDatasetExtension] = useState("csv") // The extension of the new dataset
  const [progress, setProgress] = useState({ now: 0, currentLabel: "" }) // The progress of the holdout set creation
  const [isProgressUpdating, setIsProgressUpdating] = useState(false) // To check if the progress is updating
  const [nanMethod, setNaNMethod] = useState("drop") // The NaN method to use
  const [seed, setSeed] = useState(54288) // The seed for the random number generation
  const nanMethods = ["drop", "random fill", "mean fill", "median fill", "mode fill", "bfill", "ffill"] // The NaN methods

  /**
   * To handle the column selection
   * @param {Object} e - The event object
   * @returns {Void}
   */
  const handleColumnSelection = (e) => {
    setSelectedColumns(e.value)
  }

  /**
   * To handle the change in the selected dataset, and update the columns options
   * @param {Object} e - The event object
   * @returns {Void}
   */
  const handleSelectedDatasetChange = async (e) => {
    setSelectedDataset(globalData[e.target.value])
    let columnsOptions = []

    if (globalData[e.target.value].extension === "csv") {
      globalData[e.target.value].getColumnsOfTheDataObjectIfItIsATable().then((columns) => {
        console.log("columnsOptions", columns)
        columnsOptions = generateColumnsOptionsFromColumns(columns)
        setSelectedDatasetColumns(columnsOptions)
      })
      setSelectedColumns([])
    }
    setSelectedDatasetColumns(columnsOptions)
  }

  /**
   * Get the settings from the main process to retrieve the seed number
   * @returns {Void}
   */
  useEffect(() => {
    ipcRenderer.invoke("get-settings").then((receivedSettings) => {
      console.log("received settings", receivedSettings)
      if (receivedSettings?.seed) {
        setSeed(receivedSettings?.seed)
      }
    })
  }, [])

  /**
   * To generate the columns options from the columns
   * @param {Array} columns - The columns
   * @returns {Array} - The columns options
   */
  const generateColumnsOptionsFromColumns = (columns) => {
    let options = []
    if (columns === null || columns === undefined) {
      return options
    } else {
      columns.forEach((column) => {
        column = cleanString(column)
        options.push({ label: column, value: column })
      })

      return options
    }
  }

  /**
   * To handle the change in the options
   * @param {Object} e - The event object
   * @returns {Void}
   */
  const handleOptionsChange = (e) => {
    let newOptions = { ...options }
    newOptions[e.target.name] = e.target.checked
    if (newOptions.shuffle === false) {
      newOptions.stratify = false
    }

    setOptions(newOptions)
  }

  /**
   * Hook that is called when the global data object is updated to update the list of datasets
   */
  useEffect(() => {
    updateListOfDatasets(globalData, selectedDataset, setListOfDatasets, setSelectedDataset)
  }, [globalData])

  /**
   * Function to create the holdout set, send the request to the backend
   * @returns {Void}
   * @async
   */
  const createHoldoutSet = async () => {
    let newDatasetPathParent = globalData[selectedDataset.parentID].path // The path of the parent of the new dataset
    let datasetName = newDatasetName // The name of the new dataset
    let newDatasetObject = new MedDataObject({
      // The new dataset object
      originalName: datasetName,
      name: datasetName,
      type: "folder",
      parentID: selectedDataset.parentID,
      path: newDatasetPathParent + MedDataObject.getPathSeparator() + datasetName
    })
    MedDataObject.createFolderFromPath(newDatasetObject.path)

    let JSONToSend = {
      request: "createHoldoutSet",
      pageId: "inputModule",
      configPath: configPath,
      finalDatasetExtension: newDatasetExtension,
      finalDatasetPath: newDatasetObject.path + MedDataObject.getPathSeparator(),
      payload: {}
    }
    JSONToSend.payload["name"] = selectedDataset.name
    JSONToSend.payload["extension"] = selectedDataset.extension
    JSONToSend.payload["datasetPath"] = selectedDataset.path
    JSONToSend.payload["holdoutSetSize"] = holdoutSetSize
    JSONToSend.payload["shuffle"] = options.shuffle
    JSONToSend.payload["stratify"] = options.stratify
    JSONToSend.payload["columnsToStratifyWith"] = selectedColumns
    JSONToSend.payload["nanMethod"] = nanMethod
    JSONToSend.payload["randomState"] = seed
    newDatasetObject.relatedInformation = JSONToSend
    console.log("JSONToSend", JSONToSend)
    requestBackend(
      // Send the request
      port,
      "/input/create_holdout_set/" + pageId,
      JSONToSend,
      (jsonResponse) => {
        if (jsonResponse.error) {
          if (typeof jsonResponse.error == "string") {
            jsonResponse.error = JSON.parse(jsonResponse.error)
          }
          setError(jsonResponse.error)
        } else {
          setIsProgressUpdating(false)
          console.log("jsonResponse", jsonResponse)
          setProgress({ now: 100, currentLabel: "Holdout set creation complete ✅ : " + jsonResponse["finalDatasetPath"] })
          MedDataObject.updateWorkspaceDataObject()
        }
      },
      function (error) {
        setIsProgressUpdating(false)
        setProgress({ now: 0, currentLabel: "Holdout set creation failed ❌" })
        toast.error("Holdout set creation failed", error)
      }
    )
    setIsProgressUpdating(true)
  }

  return (
    <>
      <div className="flex-container">
        <Message text="This tool will create a folder containing your holdout and learning sets." />
      </div>
      <Row className="holdout-set">
        <Col>
          <h6>Select the dataset you want to create the holdout set from</h6>
          {/* Dropdown to select the first dataset */}
          <Dropdown
            options={listOfDatasets}
            optionLabel="name"
            optionValue="key"
            className="w-100"
            value={selectedDataset ? selectedDataset.getUUID() : null}
            onChange={handleSelectedDatasetChange}
          ></Dropdown>

          <Row style={{ display: "flex", justifyContent: "space-evenly", flexDirection: "row", marginTop: "0.5rem" }}>
            <Col className="align-items-center " style={{ display: "flex" }}>
              <Checkbox inputId="shuffle-check" name="shuffle" value="shuffle" checked={options.shuffle === true} onChange={handleOptionsChange} />
              <label htmlFor="shuffle-check" className="ml-2">
                Shuffle
              </label>
            </Col>
            <Col className="align-items-center " style={{ display: "flex" }}>
              <Checkbox
                className="stratify-check"
                inputId=".stratify-check"
                name="stratify"
                value="stratify"
                checked={options.stratify === true}
                onChange={handleOptionsChange}
                disabled={!options.shuffle}
              />
              <label htmlFor="stratify-check" className="stratify-check" aria-disabled={!options.shuffle}>
                Stratify
              </label>
              {options.shuffle === false && (
                <Tooltip target=".stratify-check " autoHide={false}>
                  <div className="flex align-items-center">
                    <span style={{ minWidth: "5rem" }}>
                      Shuffle must be set to <b>True</b> for Stratify to be <b>True</b>{" "}
                    </span>
                    <a href=""></a>
                  </div>
                </Tooltip>
              )}
            </Col>
          </Row>
          <h6 className="stratify-check" style={{ marginTop: "0.5rem" }} aria-disabled={!options.stratify}>
            Select the column(s) (It should be a categorical variable){" "}
          </h6>
          <MultiSelect
            className="w-100 "
            options={selectedDatasetColumns}
            display="chip"
            optionLabel="label"
            value={selectedColumns}
            onChange={handleColumnSelection}
            disabled={!options.stratify}
          ></MultiSelect>
          <Col style={{ display: "flex", justifyContent: "normal", flexDirection: "row", marginTop: "0.5rem", alignContent: "center", alignItems: "center" }}>
            <label htmlFor="seed" className="font-bold block mb-2">
              Seed for random number generation
            </label>
            <InputNumber
              value={seed}
              inputId="seed"
              onChange={(e) => {
                setSeed(e.value)
              }}
              mode="decimal"
              showButtons
              min={0}
              max={100000}
              size={2}
              style={{ marginLeft: "1rem" }}
            />
          </Col>
        </Col>
        <Col>
          <Row style={{ display: "flex", justifyContent: "space-evenly", flexDirection: "row", marginTop: "0.5rem" }}>
            <label htmlFor="minmax-buttons" className="font-bold block mb-2">
              Holdout set size (%){" "}
            </label>
            <Row style={{ display: "flex", justifyContent: "space-evenly", flexDirection: "row", marginTop: "0.5rem", alignContent: "center" }}>
              <Col style={{ display: "flex", flexDirection: "row", alignContent: "center", alignItems: "center" }}>
                <Slider
                  className="custom-slider holdout-slider"
                  value={holdoutSetSize}
                  style={{ flexGrow: "2" }}
                  onChange={(e) => {
                    setHoldoutSetSize(e.value)
                  }}
                ></Slider>
                <InputNumber
                  prefix="% "
                  inputId="minmax-buttons"
                  value={holdoutSetSize}
                  onValueChange={(e) => {
                    setHoldoutSetSize(e.value)
                  }}
                  mode="decimal"
                  showButtons
                  min={0}
                  max={100}
                  size={2}
                  style={{ marginLeft: "1rem" }}
                />
              </Col>
            </Row>
            <Row style={{ display: "flex", justifyContent: "space-evenly", flexDirection: "row", marginTop: "0.5rem", alignContent: "center" }}>
              <Col style={{ display: "flex", flexDirection: "row", alignContent: "center", alignItems: "center" }}>
                <label htmlFor="nan-method" className="font-bold block mb-2">
                  NaN method &nbsp;
                </label>
                <Dropdown
                  inputId="nan-method"
                  className="w-100"
                  value={nanMethod}
                  options={nanMethods}
                  tooltip="The NaN method only applies to the stratified columns"
                  tooltipOptions={{ position: bottom }}
                  onChange={(e) => {
                    setNaNMethod(e.target.value)
                  }}
                />
              </Col>
            </Row>
            <SaveDataset
              newDatasetName={newDatasetName}
              newDatasetExtension={newDatasetExtension}
              selectedDataset={selectedDataset}
              setNewDatasetName={setNewDatasetName}
              setNewDatasetExtension={setNewDatasetExtension}
              functionToExecute={createHoldoutSet}
              showExtensions={false}
              overwriteOption={false}
            />
          </Row>
        </Col>
        <div className="progressBar-merge">
          {
            <ProgressBarRequests
              isUpdating={isProgressUpdating}
              setIsUpdating={setIsProgressUpdating}
              progress={progress}
              setProgress={setProgress}
              requestTopic={"input/progress/" + pageId}
              delayMS={500}
            />
          }
        </div>
      </Row>
    </>
  )
}

export default HoldoutSetCreationTool
