/* eslint-disable no-undef */
import React, { useContext, useState, useEffect } from "react"
import { Row, Col } from "react-bootstrap"
import { DataContext } from "../workspace/dataContext"
import { Button } from "primereact/button"
import { Dropdown } from "primereact/dropdown"
import MedDataObject from "../workspace/medDataObject"
import { InputText } from "primereact/inputtext"
import ProgressBarRequests from "../generalPurpose/progressBarRequests"
import { DataTable } from "primereact/datatable"
import { Column } from "@blueprintjs/table"
import { toast } from "react-toastify"
import { MultiSelect } from "primereact/multiselect"

const dfd = require("danfojs-node")

/**
 * Component that renders the holdout set creation tool
 * @param {Object} props
 * @param {String} props.pageId - The id of the page
 * @param {String} props.configPath - The path of the config file
 */
// eslint-disable-next-line no-unused-vars
const DeleteColumnsTool = ({ pageId = "inputModule", configPath = "" }) => {
  const { globalData } = useContext(DataContext) // The global data object
  const [listOfDatasets, setListOfDatasets] = useState([]) // The list of datasets
  const [selectedDataset, setSelectedDataset] = useState(null) // The selected dataset

  const [newDatasetName, setNewDatasetName] = useState("") // The name of the new dataset
  const [newDatasetExtension, setNewDatasetExtension] = useState(".csv") // The extension of the new dataset

  const [progress, setProgress] = useState({ now: 0, currentLabel: "" }) // The progress of the holdout set creation
  const [isProgressUpdating, setIsProgressUpdating] = useState(false) // To check if the progress is updating

  const [selectedDatasetColumns, setSelectedDatasetColumns] = useState([]) // The columns infos of the selected dataset
  const opTab = React.useRef(null)
  const [dataset, setDataset] = useState(null) // The dataset to drop
  const [df, setDf] = useState(null) // The dataframe
  const [columnTypes, setColumnTypes] = useState({}) // The column types
  const [selectedColumns, setSelectedColumns] = useState([]) // The selected columns
  const [selectedColumnsOptions, setSelectedColumnsOptions] = useState([]) // The selected columns options
  const [visibleColumns, setVisibleColumns] = useState([])

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
    let df = new dfd.DataFrame(newData)
    return df
  }

  /**
   * Hook that is called when the selected dataset is updated to update the columns infos
   */
  useEffect(() => {
    if (selectedDataset !== null && selectedDataset !== undefined) {
      if (selectedDataset !== null || selectedDataset !== undefined) {
        getData().then((data) => {
          data = cleanDataset(data)

          let columns = data.columns
          setDf(data)
          let jsonData = dfd.toJSON(data)
          setDataset(jsonData)
          setSelectedDatasetColumns(columns)
          let newSelectedColumns = []
          columns.forEach((column) => {
            newSelectedColumns.push({ name: column, value: column })
          })
          setSelectedColumnsOptions(columns)
          setSelectedColumns(newSelectedColumns)
          setVisibleColumns(newSelectedColumns)
        })
      }
      setNewDatasetExtension(selectedDataset.extension)
      setNewDatasetName(selectedDataset.nameWithoutExtension + "_modified")
    }
  }, [selectedDataset])

  /**
   * To save the filtered dataset
   * @param {Object} newData - The new data
   */
  const saveFilteredDataset = (newData) => {
    if (newData.length !== dataset.length && newData !== null && newData !== undefined && newData.length !== 0) {
      MedDataObject.saveDatasetToDisk({
        df: newData,
        filePath: getParentIDfolderPath(selectedDataset) + newDatasetName + "." + newDatasetExtension,
        extension: newDatasetExtension
      })
      MedDataObject.updateWorkspaceDataObject()
    } else {
      toast.error("Filtered data is not valid")
    }
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

  const renderHeader = () => {
    return (
      <div className="table-header" style={{ display: "flex", justifyContent: "flex-start", alignItems: "center" }}>
        {/* Add a label for the multiselect : Toggle columns */}
        <label htmlFor="toggleColumns" className="p-checkbox-label" style={{ marginLeft: "0.5rem" }}>
          Select the columns to keep: &nbsp;
        </label>
        {/* Add the multiselect to select the columns to display */}
        <MultiSelect
          value={selectedColumnsOptions}
          options={selectedColumns}
          onChange={(e) => {
            let newSelectedColumns = e.value.map((value) => {
              return { name: value, value: value }
            })
            let orderedSelectedColumns = selectedColumns.filter((col) => newSelectedColumns.some((sCol) => sCol.value === col.value))
            setVisibleColumns(orderedSelectedColumns)
            setSelectedColumnsOptions(e.value)
          }}
          optionLabel="name"
          placeholder="Select columns to display"
          display="chip"
          style={{ maxWidth: "50%" }}
        />
      </div>
    )
  }

  /**
   * This hook is used to update the column types
   */
  useEffect(() => {
    if (df !== null && df !== undefined) {
      let newColumnTypes = {}
      df.ctypes.$data.forEach((type, index) => {
        if (df.nUnique(0).$data[index] < 10) {
          // If the number of unique values is less than 10, then it is a category
          type = "category"
        }
        newColumnTypes[df.columns[index]] = type
      })
      setColumnTypes(newColumnTypes)
    }
  }, [df])

  /**
   * This function is used to capitalize the first letter of a string
   * @param {string} string - The string to capitalize
   * @returns {string} - The capitalized string
   */
  function generateHeader(string) {
    let header = (
      <div className="flex align-items-center" style={{ display: "flex", alignSelf: "center", flexGrow: "1" }}>
        {/* <label htmlFor={string} className="p-checkbox-label" style={{ marginLeft: "0.5rem" }}> */}
        {string[0].toUpperCase() + string.slice(1)}
        {/* </label> */}
      </div>
    )

    return header
  }

  /**
   * This function is used to get the column data type
   * @param {string} column - The column
   * @returns {string} - The column data type
   */
  function getColumnDataType(column) {
    if (columnTypes[column] === "int32" || columnTypes[column] === "float32") {
      return "numeric"
    } else if (columnTypes[column] === "string") {
      return "text"
    } else if (columnTypes[column] === "category") {
      return "category"
    } else if (columnTypes[column] === "bool") {
      return "boolean"
    }
  }

  /**
   * This function is used to get the column options according to the column type
   * @param {string} column - The column
   * @returns {Object} - The column options
   */
  const getColumnOptions = (column) => {
    let optionsToReturn = { showFilterMatchModes: true, showFilterMenu: true }
    if (columnTypes[column] === "category") {
      optionsToReturn.showFilterMatchModes = false
      optionsToReturn.showFilterMenu = true
    }
    return optionsToReturn
  }

  return (
    <>
      <Row className="simple-cleaning-set">
        <Col>
          <h6>Select the dataset</h6>
          {/* Dropdown to select the first dataset */}
          <Dropdown options={listOfDatasets} optionLabel="name" optionValue="key" className="w-100" value={selectedDataset ? selectedDataset.getUUID() : null} onChange={handleSelectedDatasetChange}></Dropdown>

          <Row style={{ display: "flex", justifyContent: "space-evenly", flexDirection: "row", marginTop: "0.5rem" }}>
            <DataTable ref={opTab} size={"small"} header={renderHeader()} paginator={true} value={dataset ? dataset : null} globalFilterFields={selectedDatasetColumns} rows={5} rowsPerPageOptions={[5, 10, 25, 50]} className="p-datatable-striped p-datatable-gridlines" removableSort={true}>
              {selectedDatasetColumns.length > 0 && visibleColumns.map((column) => <Column key={column.name + "index"} {...getColumnOptions(column.name)} dataType={getColumnDataType(column.name)} field={String(column.name)} header={generateHeader(column.name)} style={{ minWidth: "5rem" }}></Column>)}
            </DataTable>
          </Row>
          <Row
            className={"card"}
            style={{
              display: "flex",
              justifyContent: "space-evenly",
              flexDirection: "row",
              marginTop: "0.5rem",
              backgroundColor: "transparent",
              padding: "0.5rem"
            }}
          >
            <h6>
              Columns selected : <b>{visibleColumns.length}</b>&nbsp; of &nbsp;
              <b>{selectedColumns ? selectedColumns.length : 0}</b>
            </h6>
          </Row>
          <Row
            className={"card"}
            style={{
              display: "flex",
              justifyContent: "space-evenly",
              flexDirection: "row",
              marginTop: "0.5rem",
              backgroundColor: "transparent",
              padding: "0.5rem"
            }}
          >
            <Col
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "center",
                flexGrow: 0,
                alignItems: "center"
              }}
              xs
            >
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
                label="Create subset from selected columns"
                disabled={checkIfNameAlreadyUsed(newDatasetName + "." + newDatasetExtension) || selectedDataset === null || selectedDataset === undefined || newDatasetName.length === 0}
                onClick={() => {
                  // Get the columns to drop
                  // Compare the selected columns with the visible columns [a, b, c, d] [a, c] => [b, d]
                  let columnsToDrop = selectedColumns.filter((col) => !visibleColumns.some((vCol) => vCol.name === col.name)).map((col) => col.name)
                  let newData = df.drop({ columns: columnsToDrop })
                  saveFilteredDataset(newData)
                }}
              />
            </Col>
          </Row>
        </Col>
        <div className="progressBar-merge">{<ProgressBarRequests isUpdating={isProgressUpdating} setIsUpdating={setIsProgressUpdating} progress={progress} setProgress={setProgress} requestTopic={"input/progress/" + pageId} delayMS={50} />}</div>
      </Row>
    </>
  )
}

export default DeleteColumnsTool
