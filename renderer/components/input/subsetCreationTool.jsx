import React, { useContext, useState, useEffect, use } from "react"
import { Row, Col } from "react-bootstrap"
import { DataContext } from "../workspace/dataContext"
import { Button } from "primereact/button"
import { Dropdown } from "primereact/dropdown"
import MedDataObject from "../workspace/medDataObject"
import { InputText } from "primereact/inputtext"
import { Slider } from "primereact/slider"
import { InputNumber } from "primereact/inputnumber"
import ProgressBarRequests from "../generalPurpose/progressBarRequests"
import { DataTable } from "primereact/datatable"
import { Column } from "@blueprintjs/table"
import { Tag } from "primereact/tag"
import { OverlayPanel } from "primereact/overlaypanel"
const dfd = require("danfojs-node")

/**
 * Component that renders the holdout set creation tool
 * @param {Object} props
 * @param {String} props.pageId - The id of the page
 * @param {String} props.configPath - The path of the config file
 */
// eslint-disable-next-line no-unused-vars
const SubsetCreationTool = ({ pageId = "inputModule", configPath = "" }) => {
  const { globalData } = useContext(DataContext) // The global data object
  const [listOfDatasets, setListOfDatasets] = useState([]) // The list of datasets
  const [selectedDataset, setSelectedDataset] = useState(null) // The selected dataset
  const [newDatasetName, setNewDatasetName] = useState("") // The name of the new dataset
  const [newDatasetExtension, setNewDatasetExtension] = useState(".csv") // The extension of the new dataset
  const [progress, setProgress] = useState({ now: 0, currentLabel: "" }) // The progress of the holdout set creation
  const [isProgressUpdating, setIsProgressUpdating] = useState(false) // To check if the progress is updating
  const [columnThreshold, setColumnThreshold] = useState(0) // The column threshold
  const [rowThreshold, setRowThreshold] = useState(0) // The row threshold
  const [selectedDatasetColumns, setSelectedDatasetColumns] = useState([]) // The columns infos of the selected dataset
  const [rowsInfos, setRowsInfos] = useState([]) // The rows infos of the selected dataset
  const [columnsToDrop, setColumnsToDrop] = useState([]) // The columns to drop
  const [rowsToDrop, setRowsToDrop] = useState([]) // The rows to drop
  const [newLocalDatasetName, setNewLocalDatasetName] = useState("") // The name of the new dataset
  const [newLocalDatasetExtension, setNewLocalDatasetExtension] = useState(".csv") // The extension of the new dataset
  const [dropType, setDropType] = useState("columns") // The drop type [columns, rows
  const opCol = React.useRef(null)
  const [dataset, setDataset] = useState(null) // The dataset to drop

  /**
   * To handle the change in the selected dataset, and update the columns options
   * @param {Object} e - The event object
   * @returns {Void}
   */
  const handleSelectedDatasetChange = async (e) => {
    setSelectedDataset(globalData[e.target.value])
  }

  /**
   * To update the list of datasets
   * @returns {Void}
   */
  const updateListOfDatasets = () => {
    let newDatasetList = []
    Object.keys(globalData).forEach((key) => {
      if (globalData[key].extension === "csv") {
        newDatasetList.push({ name: globalData[key].name, object: globalData[key], key: key })
      }
    })
    setListOfDatasets(newDatasetList)
  }

  /**
   * To check if the name is already used
   * @param {String} name - The name to check
   * @returns {Boolean} - True if the name is already used, false otherwise
   */
  const checkIfNameAlreadyUsed = (name) => {
    let alreadyUsed = false
    if (name.length > 0 && selectedDataset !== null && selectedDataset !== undefined) {
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

  /**
   * Hook that is called when the global data object is updated to update the list of datasets
   */
  useEffect(() => {
    updateListOfDatasets()
  }, [globalData])

  /**
   * To get the infos of the data
   * @param {Object} data - The data
   * @returns {Object} - The infos
   * @returns {Number} - The infos.columnsLength - The number of columns
   * @returns {Number} - The infos.rowsLength - The number of rows
   * @returns {Array} - The infos.rowsCount - The number of non-NaN values per row
   */
  const getInfos = (data) => {
    let infos = { columnsLength: data.shape[1], rowsLength: data.shape[0] }
    infos.rowsCount = data.count().$data
    infos.columnsCount = data.count({ axis: 0 }).$data
    return infos
  }

  /**
   * To get the data
   * @returns {Promise} - The promise of the data
   */
  const getData = () => {
    return new Promise((resolve) => {
      let data = selectedDataset.loadDataFromDisk()
      resolve(data)
    })
  }

  /**
   * To drop the rows
   * @param {Boolean} overwrite - True if the dataset should be overwritten, false otherwise
   * @returns {Void}
   */
  const dropRows = (overwrite) => {
    console.log("dropRows")
    getData().then((data) => {
      let newData = data.drop({ index: rowsToDrop })
      console.log("newData", newData, selectedDataset)
      saveCleanDataset(newData, overwrite, true)
    })
  }

  /**
   * To drop the rows or the columns
   * @param {Boolean} overwrite - True if the dataset should be overwritten, false otherwise
   * @returns {Void}
   */
  const dropRowsOrColumns = (overwrite) => {
    if (dropType === "columns") {
      dropColumns(overwrite)
    } else {
      dropRows(overwrite)
    }
  }

  /**
   * To drop all - the rows and the columns
   * @param {Boolean} overwrite - True if the dataset should be overwritten, false otherwise
   * @returns {Void}
   */
  const dropAll = (overwrite) => {
    console.log("dropAll")
    getData().then((data) => {
      let newData = data.drop({ columns: columnsToDrop })
      newData = newData.drop({ index: rowsToDrop })
      console.log("newData", newData, selectedDataset)
      saveCleanDataset(newData, overwrite, false)
    })
  }

  /**
   * Clean the dataset
   * @param {DanfoJS.DataFrame} data - The data
   * @returns {DanfoJS.DataFrame} - The cleaned dataset
   */
  const cleanDataset = (data) => {
    if (data === null || data === undefined) {
      return null
    }

    let newData = {}
    let cleanedColumnNames = []
    data.columns.forEach((column) => {
      cleanedColumnNames.push(cleanString(column))
    })

    data.getColumnData.forEach((column, index) => {
      let newColumn = []
      column.forEach((value) => {
        if (typeof value === "string") {
          value = value.replace(/\s+/g, " ")
          value = value.replace(/^[ '"]+|[ '"]+$|( ){2,}/g, "$1")
        }
        newColumn.push(value)
      })
      newData[cleanedColumnNames[index]] = newColumn
    })
    console.log("newData", newData, data.$columns)
    let df = new dfd.DataFrame(newData)
    console.log("df", df)
    return df
  }

  /**
   * Hook that is called when the selected dataset is updated to update the columns infos
   */
  useEffect(() => {
    if (selectedDataset !== null && selectedDataset !== undefined) {
      console.log("selectedDataset", selectedDataset.data)
      if (selectedDataset !== null || selectedDataset !== undefined) {
        getData().then((data) => {
          console.log("data", data, dfd)
          data = cleanDataset(data)
          console.log("data cleaned", data, dfd)

          let columns = data.columns
          data = dfd.toJSON(data)
          setDataset(data)
          setSelectedDatasetColumns(columns)
          console.log("data cleaned", data, dfd)
        })
      }
      setNewDatasetExtension(selectedDataset.extension)
      setNewDatasetName(selectedDataset.nameWithoutExtension + "_clean")
      setNewLocalDatasetExtension(selectedDataset.extension)
      setNewLocalDatasetName(selectedDataset.nameWithoutExtension + "_clean")
    }
  }, [selectedDataset])

  /**
   * Template for the rows in the columns datatable
   * @param {Object} data - The row data
   * @returns {Object} - The row template
   */
  const columnClass = (data) => {
    return { "bg-invalid": data.percentage < columnThreshold }
  }

  /**
   * Template for the rows in the rows datatable
   * @param {Object} data - The row data
   * @returns {Object} - The row template
   */
  const rowClass = (data) => {
    return { "bg-invalid": data.percentage < rowThreshold }
  }

  /**
   * Template for the percentage cells
   * @param {Object} rowData - The row data
   * @returns {Object} - The percentage template
   */
  const percentageTemplate = (rowData) => {
    return <span>{rowData.percentage.toFixed(2)} %</span>
  }

  /**
   * To drop the columns
   * @param {Boolean} overwrite - True if the dataset should be overwritten, false otherwise
   */
  const dropColumns = (overwrite) => {
    console.log("dropColumns")
    getData().then((data) => {
      let newData = data.drop({ columns: columnsToDrop })
      console.log("newData", newData, selectedDataset)
      saveCleanDataset(newData, overwrite, true)
    })
  }

  /**
   * To save the clean dataset
   * @param {Object} newData - The new data
   * @param {Boolean} overwrite - True if the dataset should be overwritten, false otherwise
   * @param {Boolean} local - True if the dataset is called from the overlaypanel (will use newLocalDatasetName and newLocalDatasetExtension instead of newDatasetName and newDatasetExtension), false otherwise
   */
  const saveCleanDataset = (newData, overwrite = undefined, local = undefined) => {
    if (overwrite === true) {
      console.log("overwrite")
      selectedDataset.saveData(newData)
      setSelectedDataset(null)
    } else {
      if (local === true) {
        console.log("local", getParentIDfolderPath(selectedDataset) + newLocalDatasetName, newLocalDatasetExtension)
        MedDataObject.saveDatasetToDisk({ df: newData, filePath: getParentIDfolderPath(selectedDataset) + newLocalDatasetName + "." + newLocalDatasetExtension, extension: newLocalDatasetExtension })
      } else {
        MedDataObject.saveDatasetToDisk({ df: newData, filePath: getParentIDfolderPath(selectedDataset) + newDatasetName + "." + newDatasetExtension, extension: newDatasetExtension })
      }
    }
    MedDataObject.updateWorkspaceDataObject()
  }

  /**
   * This function is used to clean a string
   * @param {string} string - The string to clean
   * @returns the cleaned string
   * @summary This function is used to clean a string from spaces and quotes
   */
  const cleanString = (string) => {
    if (string.includes(" ") || string.includes('"')) {
      string = string.replaceAll(" ", "")
      string = string.replaceAll('"', "")
    }
    return string
  }

  /**
   * To get the parent ID folder path
   * @param {Object} dataset - The dataset
   * @returns {String} - The parent ID folder path with a trailing separator
   */
  const getParentIDfolderPath = (dataset) => {
    let parentID = dataset.parentID
    let parentPath = globalData[parentID].path
    let separator = MedDataObject.getPathSeparator()
    return parentPath + separator
  }

  /**
   * Hook that is called when the columns infos are updated to update the columns to drop
   */
  useEffect(() => {
    let newColumnsToDrop = []
    selectedDatasetColumns.forEach((column) => {
      if (column.percentage < columnThreshold) {
        newColumnsToDrop.push(column.label)
      }
    })
    setColumnsToDrop(newColumnsToDrop)
  }, [selectedDatasetColumns, columnThreshold])

  /**
   * Hook that is called when the rows infos are updated to update the rows to drop
   */
  useEffect(() => {
    let newRowsToDrop = []
    rowsInfos.forEach((row) => {
      if (row.percentage < rowThreshold) {
        newRowsToDrop.push(row.label)
      }
    })
    setRowsToDrop(newRowsToDrop)
  }, [rowsInfos, rowThreshold])

  useEffect(() => {
    console.log("dataset", dataset)
  }, [dataset])

  return (
    <>
      <Row className="simple-cleaning-set">
        <Col>
          <h6>Select the dataset you want to clean</h6>
          {/* Dropdown to select the first dataset */}
          <Dropdown options={listOfDatasets} optionLabel="name" optionValue="key" className="w-100" value={selectedDataset ? selectedDataset.getUUID() : null} onChange={handleSelectedDatasetChange}></Dropdown>

          <Row style={{ display: "flex", justifyContent: "space-evenly", flexDirection: "row", marginTop: "0.5rem" }}>
            <DataTable size={"small"} paginator={true} value={dataset ? dataset : null} rowClassName={columnClass} rows={5} rowsPerPageOptions={[5, 10, 25, 50]} className="p-datatable-striped p-datatable-gridlines">
              {selectedDatasetColumns.length > 0 && selectedDatasetColumns.map((column, index) => <Column key={column} field={String(column)} header={String(column).toLocaleUpperCase()}></Column>)}
            </DataTable>
          </Row>

          <Row className={"card"} style={{ display: "flex", justifyContent: "space-evenly", flexDirection: "row", marginTop: "0.5rem", backgroundColor: "transparent", padding: "0.5rem" }}>
            <Col style={{ display: "flex", flexDirection: "row", justifyContent: "center", flexGrow: 0, alignItems: "center" }} xs>
              <div className="p-input-group flex-1 dataset-name " style={{ display: "flex", flexDirection: "row" }}>
                <InputText
                  className={`${checkIfNameAlreadyUsed(newDatasetName + "." + newDatasetExtension) || newDatasetName.length === 0 ? "p-invalid" : ""}`}
                  placeholder="Clean dataset name"
                  keyfilter={"alphanum"}
                  onChange={(e) => {
                    setNewDatasetName(e.target.value)
                  }}
                  value={newDatasetName}
                />
                <span className="p-inputgroup-addon">
                  <Dropdown
                    className={`${checkIfNameAlreadyUsed(newDatasetName + "." + newDatasetExtension) ? "p-invalid" : ""}`}
                    panelClassName="dataset-name"
                    value={newDatasetExtension}
                    options={[
                      { label: ".csv", value: "csv" },
                      { label: ".json", value: "json" },
                      { label: ".xlsx", value: "xlsx" }
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
                label="Create a clean copy"
                disabled={checkIfNameAlreadyUsed(newDatasetName + "." + newDatasetExtension) || selectedDataset === null || selectedDataset === undefined || newDatasetName.length === 0}
                onClick={() => {
                  dropAll(false)
                  console.log("CREATE A CLEAN DATASET")
                }}
              />
            </Col>
          </Row>
        </Col>
        <div className="progressBar-merge">{<ProgressBarRequests isUpdating={isProgressUpdating} setIsUpdating={setIsProgressUpdating} progress={progress} setProgress={setProgress} requestTopic={"input/progress/" + pageId} delayMS={50} />}</div>
      </Row>
      <OverlayPanel ref={opCol} showCloseIcon={true} dismissable={true} style={{ width: "auto" }}>
        Do you want to <b>overwrite</b> the dataset or <b>create a new one</b> ?
        <div className="" style={{ display: "flex", flexDirection: "row", marginTop: "0.5rem" }}>
          <Button size="small" severity={"danger"} label="Overwrite" onClick={() => dropRowsOrColumns(true)} style={{ alignContent: "center", alignSelf: "center", display: "flex", justifyContent: "center" }}></Button>

          <div className="p-inputgroup flex-1" style={{ marginLeft: "1rem", alignContent: "center", alignItems: "center", display: "flex" }}>
            <InputText
              size={"small"}
              className={`${checkIfNameAlreadyUsed(newLocalDatasetName + "." + newLocalDatasetExtension) ? "p-invalid" : ""}`}
              placeholder="Clean dataset name"
              keyfilter={"alphanum"}
              value={newLocalDatasetName}
              onChange={(e) => {
                setNewLocalDatasetName(e.target.value)
              }}
              style={{ padding: "0.5rem", height: "2.5rem" }}
            />
            <Dropdown
              className={`overlay-dropdown ${checkIfNameAlreadyUsed(newLocalDatasetName + "." + newLocalDatasetExtension) ? "p-invalid" : ""}`}
              panelClassName="dataset-name"
              value={newLocalDatasetExtension}
              options={[
                { label: ".csv", value: "csv" },
                { label: ".json", value: "json" },
                { label: ".xlsx", value: "xlsx" }
              ]}
              onChange={(e) => {
                setNewLocalDatasetExtension(e.target.value)
              }}
              size={"small"}
              style={{ padding: "0rem", height: "2.5rem", width: "0rem" }}
            />
            <Button size={"small"} label="New dataset" className="p-button-info" style={{ alignContent: "center", alignSelf: "center" }} onClick={() => dropRowsOrColumns(false)} />
          </div>
        </div>
      </OverlayPanel>
    </>
  )
}

export default SubsetCreationTool
