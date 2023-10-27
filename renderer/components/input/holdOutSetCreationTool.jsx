import { MultiSelect } from "primereact/multiselect"
import React, { useContext, useState, useEffect } from "react"
import { Row, Col } from "react-bootstrap"
import { Checkbox } from "primereact/checkbox"
import { WorkspaceContext } from "../workspace/workspaceContext"
import { DataContext } from "../workspace/dataContext"
import { Button } from "primereact/button"
import { Tooltip } from "primereact/tooltip"
import { Dropdown } from "primereact/dropdown"
import MedDataObject from "../workspace/medDataObject"
import { InputText } from "primereact/inputtext"
import { Slider } from "primereact/slider"
import { InputNumber } from "primereact/inputnumber"
import { requestJson } from "../../utilities/requests"
import ProgressBarRequests from "../generalPurpose/progressBarRequests"

const HoldOutSetCreationTool = ({ pageId = "inputModule", configPath = "" }) => {
  const { port } = useContext(WorkspaceContext)
  const { globalData } = useContext(DataContext)
  const [listOfDatasets, setListOfDatasets] = useState([])
  const [selectedDataset, setSelectedDataset] = useState(null)
  const [options, setOptions] = useState({ shuffle: false, stratify: false })
  const [selectedColumns, setSelectedColumns] = useState([])
  const [selectedDatasetColumns, setSelectedDatasetColumns] = useState([])
  const [holdoutSetSize, setHoldoutSetSize] = useState(20)
  const [newDatasetName, setNewDatasetName] = useState("")
  const [newDatasetExtension, setNewDatasetExtension] = useState(".csv")
  const [progress, setProgress] = useState({ now: 0, currentLabel: "" })
  const [isProgressUpdating, setIsProgressUpdating] = useState(false)
  const [nanMethod, setNaNMethod] = useState("drop")

  const nanMethods = ["drop", "bfill", "ffill"]

  const handleColumnSelection = (e) => {
    setSelectedColumns(e.value)
  }

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

  const cleanString = (string) => {
    if (string.includes(" ") || string.includes('"')) {
      string = string.replaceAll(" ", "")
      string = string.replaceAll('"', "")
    }
    return string
  }

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

  const updateListOfDatasets = () => {
    let newDatasetList = []
    Object.keys(globalData).forEach((key) => {
      if (globalData[key].extension === "csv") {
        newDatasetList.push({ name: globalData[key].name, object: globalData[key], key: key })
      }
    })
    setListOfDatasets(newDatasetList)
  }

  const handleOptionsChange = (e) => {
    let newOptions = { ...options }
    newOptions[e.target.name] = e.target.checked
    if (newOptions.shuffle === false) {
      newOptions.stratify = false
    }

    setOptions(newOptions)
  }

  const checkIfNameAlreadyUsed = (name) => {
    let alreadyUsed = false
    if (newDatasetName.length > 0 && selectedDataset !== null && selectedDataset !== undefined) {
      let newDatasetPathParent = globalData[selectedDataset.parentID].path
      let pathToCheck = newDatasetPathParent + MedDataObject.getPathSeparator() + name
      Object.entries(globalData).map((arr) => {
        if (arr[1].path === pathToCheck) {
          alreadyUsed = true
        }
      })
    }
    return alreadyUsed
  }

  useEffect(() => {
    console.log("OPTIONS", options)
  }, [options])

  useEffect(() => {
    updateListOfDatasets()
  }, [globalData])

  useEffect(() => {
    console.log("selectedDataset", selectedDataset)
  }, [selectedDataset])

  useEffect(() => {
    console.log("selectedColumns", selectedColumns)
  }, [selectedColumns])

  useEffect(() => {
    console.log("selectedDatasetColumns", selectedDatasetColumns)
  }, [selectedDatasetColumns])

  const createHoldoutSet = async () => {
    let newDatasetPathParent = globalData[selectedDataset.parentID].path
    let datasetName = newDatasetName.length > 0 ? newDatasetName : "HoldoutDataset"
    // datasetName = datasetName
    let newDatasetObject = new MedDataObject({
      originalName: datasetName,
      name: datasetName,
      type: "folder",
      parentID: selectedDataset.parentID,
      path: newDatasetPathParent + MedDataObject.getPathSeparator() + datasetName
    })
    MedDataObject.createFolderFromPath(newDatasetObject.path)

    let JSONToSend = { request: "createHoldoutSet", pageId: "inputModule", configPath: configPath, finalDatasetExtension: newDatasetExtension, finalDatasetPath: newDatasetObject.path + MedDataObject.getPathSeparator(), payload: {} }
    JSONToSend.payload["name"] = selectedDataset.name
    JSONToSend.payload["extension"] = selectedDataset.extension
    JSONToSend.payload["datasetPath"] = selectedDataset.path
    JSONToSend.payload["holdoutSetSize"] = holdoutSetSize
    JSONToSend.payload["shuffle"] = options.shuffle
    JSONToSend.payload["stratify"] = options.stratify
    JSONToSend.payload["columnsToStratifyWith"] = selectedColumns
    JSONToSend.payload["nanMethod"] = "drop"
    JSONToSend.payload["randomState"] = 54288
    newDatasetObject.relatedInformation = JSONToSend
    console.log("JSONToSend", JSONToSend)
    requestJson(
      port,
      "/input/create_holdout_set",
      JSONToSend,
      (jsonResponse) => {
        setIsProgressUpdating(false)
        console.log("jsonResponse", jsonResponse)
        setProgress({ now: 100, currentLabel: "Holdout set creation complete ✅ : " + jsonResponse["finalDatasetPath"] })
        MedDataObject.updateWorkspaceDataObject()
      },
      function (error) {
        setIsProgressUpdating(false)
        console.log("error", error)
      }
    )
    setIsProgressUpdating(true)
  }

  return (
    <>
      {/* <Tooltip target=".stratify-check" autoHide={false}>
        <div className="flex align-items-center">
          <span style={{ minWidth: "5rem" }}>See </span>
          <a href=""></a>
        </div>
      </Tooltip> */}
      <Row className="holdout-set">
        <Col>
          <h6>Select the dataset you want to create the holdout set from</h6>
          <Dropdown options={listOfDatasets} optionLabel="name" optionValue="key" className="w-100" value={selectedDataset ? selectedDataset.getUUID() : null} onChange={handleSelectedDatasetChange}></Dropdown>

          <Row style={{ display: "flex", justifyContent: "space-evenly", flexDirection: "row", marginTop: "0.5rem" }}>
            <Col className="align-items-center " style={{ display: "flex" }}>
              <Checkbox inputId="shuffle-check" name="shuffle" value="shuffle" checked={options.shuffle === true} onChange={handleOptionsChange} />
              <label htmlFor="shuffle-check" className="ml-2">
                Shuffle
              </label>
            </Col>
            <Col className="align-items-center " style={{ display: "flex" }}>
              <Checkbox className="stratify-check" inputId=".stratify-check" name="stratify" value="stratify" checked={options.stratify === true} onChange={handleOptionsChange} disabled={!options.shuffle} />
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
            Select the column(s){" "}
          </h6>
          <MultiSelect className="w-100 " options={selectedDatasetColumns} display="chip" optionLabel="label" value={selectedColumns} onChange={handleColumnSelection} disabled={!options.stratify}></MultiSelect>
        </Col>
        <Col>
          <p>Holdout set creation tool</p>
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
                <label htmlFor="minmax-buttons" className="font-bold block mb-2">
                  NaN method{" "}
                </label>

                <Dropdown
                  className="w-100"
                  value={nanMethod}
                  options={nanMethods}
                  onChange={(e) => {
                    setNaNMethod(e.target.value)
                  }}
                />
              </Col>
            </Row>
            <Row style={{ display: "flex", justifyContent: "space-evenly", flexDirection: "row", marginTop: "1rem", alignItems: "center" }}>
              <Col style={{ display: "flex", flexDirection: "row", justifyContent: "center", flexGrow: 0, alignItems: "center" }} xs>
                <div className="p-input-group flex-1 dataset-name " style={{ display: "flex", flexDirection: "row" }}>
                  <InputText
                    className={`${checkIfNameAlreadyUsed(newDatasetName + newDatasetExtension) ? "p-invalid" : ""}`}
                    placeholder="Holdout set name"
                    keyfilter={"alphanum"}
                    onChange={(e) => {
                      setNewDatasetName(e.target.value)
                    }}
                  />
                  <span className="p-inputgroup-addon">
                    <Dropdown
                      className={`${checkIfNameAlreadyUsed(newDatasetName + newDatasetExtension) ? "p-invalid" : ""}`}
                      panelClassName="dataset-name"
                      value={newDatasetExtension}
                      options={[
                        { label: ".csv", value: ".csv" },
                        { label: ".json", value: ".json" },
                        { label: ".xlsx", value: ".xlsx" }
                      ]}
                      onChange={(e) => {
                        setNewDatasetExtension(e.target.value)
                      }}
                    />
                  </span>
                </div>
              </Col>
              <Col>
                <Button
                  label="Create holdout set"
                  disabled={checkIfNameAlreadyUsed(newDatasetName) || selectedDataset === null || selectedDataset === undefined}
                  onClick={() => {
                    console.log("CREATE HOLDOUT SET")

                    createHoldoutSet()
                  }}
                />
              </Col>
            </Row>
          </Row>
        </Col>
        <div className="progressBar-merge">{<ProgressBarRequests isUpdating={isProgressUpdating} setIsUpdating={setIsProgressUpdating} progress={progress} setProgress={setProgress} requestTopic={"input/progress/" + pageId} delayMS={50} />}</div>
      </Row>
    </>
  )
}

export default HoldOutSetCreationTool
