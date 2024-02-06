/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
import React, { useContext, useState, useEffect } from "react"
import { Row, Col } from "react-bootstrap"
import { DataContext } from "../workspace/dataContext"
import { Button } from "primereact/button"
import { Dropdown } from "primereact/dropdown"
import MedDataObject from "../workspace/medDataObject"
import { InputText } from "primereact/inputtext"
import { InputNumber } from "primereact/inputnumber"
import ProgressBarRequests from "../generalPurpose/progressBarRequests"
import { DataTable } from "primereact/datatable"
import { Column } from "@blueprintjs/table"
import { OverlayPanel } from "primereact/overlaypanel"
import { toast } from "react-toastify"
import { FilterMatchMode, FilterOperator } from "primereact/api"
import { MultiSelect } from "primereact/multiselect"
import { Utils as danfoUtils } from "danfojs-node"
import { Checkbox } from 'primereact/checkbox';

const dfd = require("danfojs-node")
const dfdUtils = new danfoUtils()

/**
 * Component that renders the holdout set creation tool
 * @param {Object} props
 * @param {String} props.pageId - The id of the page
 * @param {String} props.configPath - The path of the config file
 */
// eslint-disable-next-line no-unused-vars
const AddDeleteColumnsTool = ({ pageId = "inputModule", configPath = "" }) => {
  const { globalData } = useContext(DataContext) // The global data object
  const [listOfDatasets, setListOfDatasets] = useState([]) // The list of datasets
  const [selectedDataset, setSelectedDataset] = useState(null) // The selected dataset
  const [newDatasetName, setNewDatasetName] = useState("") // The name of the new dataset
  const [newDatasetExtension, setNewDatasetExtension] = useState(".csv") // The extension of the new dataset
  const [progress, setProgress] = useState({ now: 0, currentLabel: "" }) // The progress of the holdout set creation
  const [isProgressUpdating, setIsProgressUpdating] = useState(false) // To check if the progress is updating
  const [selectedDatasetColumns, setSelectedDatasetColumns] = useState([]) // The columns infos of the selected dataset
  const [columnsToDrop, setColumnsToDrop] = useState([]) // The columns to drop
  const [rowsToDrop, setRowsToDrop] = useState([]) // The rows to drop
  const [newLocalDatasetName, setNewLocalDatasetName] = useState("") // The name of the new dataset
  const [newLocalDatasetExtension, setNewLocalDatasetExtension] = useState(".csv") // The extension of the new dataset
  const opTab = React.useRef(null)
  const [dataset, setDataset] = useState(null) // The dataset to drop
  const [globalFilterValue, setGlobalFilterValue] = useState("") // The global filter value
  const [filters, setFilters] = useState({}) // The filters
  const [filteredData, setFilteredData] = useState([]) // The filtered data
  const [df, setDf] = useState(null) // The dataframe
  const [columnTypes, setColumnTypes] = useState({}) // The column types
  const [columnsCheckedDict, setColumnsCheckedDict] = useState({}) // The columns dict
  const [selectedColumns, setSelectedColumns] = useState([]) // The selected columns
  const [selectedColumnsOptions, setSelectedColumnsOptions] = useState([]) // The selected columns options
  const filterDisplay = "menu"

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
   * To drop the rows
   * @param {Boolean} overwrite - True if the dataset should be overwritten, false otherwise
   * @returns {Void}
   */
  const dropRows = (overwrite) => {
    getData().then((data) => {
      let newData = data.drop({ index: rowsToDrop })
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
   * This function initializes the filters
   * @returns {Void}
   */
  const initFilters = () => {
    let newFilters = {}
    newFilters["global"] = { value: "", matchMode: "contains" }

    Object.keys(columnTypes).forEach((column) => {
      if (columnTypes[column] === "category") {
        newFilters[column] = { value: "", matchMode: FilterMatchMode.IN }
      } else if (columnTypes[column] === "int32" || columnTypes[column] === "float32") {
        newFilters[column] = { operator: FilterOperator.AND, constraints: [{ value: "", matchMode: FilterMatchMode.EQUALS }] }
      } else if (columnTypes[column] === "string") {
        newFilters[column] = { operator: FilterOperator.AND, constraints: [{ value: "", matchMode: FilterMatchMode.STARTS_WITH }] }
      }
    })

    setFilters(newFilters)
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
          setSelectedColumnsOptions(columns)
          let newColumns = {}
          let newSelectedColumns = []
          columns.forEach((column) => {
            newColumns[column] = true
            newSelectedColumns.push({ name: column, value: column })
          })
          setSelectedColumns(newSelectedColumns)
          setColumnsCheckedDict(newColumns)
          
        })
      }
      setNewDatasetExtension(selectedDataset.extension)
      setNewDatasetName(selectedDataset.nameWithoutExtension + "_filtered")
      setNewLocalDatasetExtension(selectedDataset.extension)
      setNewLocalDatasetName(selectedDataset.nameWithoutExtension + "_filtered")
    }
  }, [selectedDataset])

  /**
   * To save the filtered dataset
   * @param {Object} newData - The new data
   * @param {Boolean} overwrite - True if the dataset should be overwritten, false otherwise
   * @param {Boolean} local - True if the dataset is called from the overlaypanel (will use newLocalDatasetName and newLocalDatasetExtension instead of newDatasetName and newDatasetExtension), false otherwise
   */
  const saveFilteredDataset = (newData) => {
    if (newData.length !== dataset.length && newData !== null && newData !== undefined && newData.length !== 0) {
      MedDataObject.saveDatasetToDisk({ data: newData, filePath: getParentIDfolderPath(selectedDataset) + newDatasetName + "." + newDatasetExtension, extension: newDatasetExtension })
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

  const clearFilter = () => {
    setGlobalFilterValue("")
    initFilters()
    setFilteredData(dataset)
  }



  useEffect(() => {
    let newFilters = { ...filters }
    if (globalFilterValue.length !== 0) {
      newFilters["global"].value = globalFilterValue
    }
    setFilters(newFilters)
  }, [globalFilterValue])

  const renderHeader = () => {
    return (
      <div className="table-header" style={{display:"flex", justifyContent:"space-between"}}>
          <MultiSelect
            value={selectedColumnsOptions}
            options={selectedColumns}
            onChange={(e) => {
              opTab.current.filter(e.value, "field", "in")
              console.log(e.value)
              setSelectedColumnsOptions(e.value)
            }}
            optionLabel="name"
            placeholder="Select columns to display"
            display="chip"
            style={{ maxWidth:"50%"}}
          />
        <Button icon="pi pi-filter-slash" className="p-mr-2" outlined label="Clear" onClick={clearFilter} />
        <span className="p-input-icon-left">
          <i className="pi pi-search" />
          <InputText
            type="search"
            onChange={(e) => {
              setGlobalFilterValue(e.target.value)
            }}
            placeholder="Global Search"
          />
        </span>
      </div>
    )
  }

  const header = renderHeader()

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
   * The filters are initialized when the column types are updated
   */
  useEffect(() => {
    initFilters()
  }, [columnTypes])

  /**
   * This function is used to render the category filter template
   * @param {Object} options - The options
   * @returns {Object} - The filter template
   */
  const categoryFilterTemplate = (options) => {
    let onChangeFunc = (e) => {
      options.filterCallback(e.value)
    }
    if (filterDisplay === "row") {
      onChangeFunc = (e) => {
        options.filterApplyCallback(e.value)
      }
    }

    let colData = df.$getColumnData(options.field).$data
    let uniqueValues = dfdUtils.unique(colData)
    let newOptions = []
    uniqueValues.forEach((value) => {
      newOptions.push({ name: value, value: value })
    })
    return <MultiSelect value={options.value} options={newOptions} onChange={onChangeFunc} optionLabel="name" placeholder={`Search by ${options.field}`} className="p-column-filter" maxSelectedLabels={1} />
  }

  /**
   * This function is used to render the number filter template
   * @param {Object} options - The options
   * @returns {Object} - The filter template
   */
  const numberFilterTemplate = (options) => {
    let onChangeFunc = (e) => {
      options.filterCallback(e.value, options.index)
    }
    if (filterDisplay === "row") {
      onChangeFunc = (e) => {
        options.filterApplyCallback(e.value, options.index)
      }
    }
    return <InputNumber value={options.value} onChange={onChangeFunc} placeholder={`Search by ${options.field}`} locale="en-US" />
  }

  /**
   * This function is used to render the string filter template
   * @param {Object} options - The options
   * @returns {Object} - The filter template
   */
  const stringFilterTemplate = (options) => {
    let onChangeFunc = (e) => {
      options.filterCallback(e.target.value, options.index)
    }
    if (filterDisplay === "row") {
      onChangeFunc = (e) => {
        options.filterApplyCallback(e.target.value, options.field)
      }
    }
    return <InputText type="search" value={options.value} placeholder={`Search by ${options.field}`} onChange={onChangeFunc} />
  }

  /**
   * This function is used to render the filter template
   * @param {number} index - The index of the column
   * @returns {Object} - The filter template
   */
  const filterTemplateRenderer = (index) => {
    let columnType = columnTypes[selectedDatasetColumns[index]]
    if (columnType === "category") {
      return categoryFilterTemplate
    } else if (columnType === "int32" || columnType === "float32") {
      return numberFilterTemplate
    } else if (columnType === "string") {
      return stringFilterTemplate
    }
  }

  /**
   * This function is used to capitalize the first letter of a string
   * @param {string} string - The string to capitalize
   * @returns {string} - The capitalized string
   */
  function generateHeader(string) {
    let header = 
    <div className="flex align-items-center" style={{display:"flex"}}>
      {/* <Checkbox
        inputId={string}
        checked={columnsCheckedDict[string] === true}
        onChange={(e) => {
          console.log(e)
          let newColumnsCheckedDict = { ...columnsCheckedDict }
          newColumnsCheckedDict[string] = !newColumnsCheckedDict[string]
          setColumnsCheckedDict(newColumnsCheckedDict)

        }}
      /> */}
      <label htmlFor={string} className="p-checkbox-label" style={{marginLeft:"0.5rem"}}>{string[0].toUpperCase() + string.slice(1)}</label>
    </div>
      
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
          <h6>Select the dataset you want to clean</h6>
          {/* Dropdown to select the first dataset */}
          <Dropdown options={listOfDatasets} optionLabel="name" optionValue="key" className="w-100" value={selectedDataset ? selectedDataset.getUUID() : null} onChange={handleSelectedDatasetChange}></Dropdown>

          <Row style={{ display: "flex", justifyContent: "space-evenly", flexDirection: "row", marginTop: "0.5rem" }}>
            <DataTable
              ref={opTab}
              onValueChange={(e) => {
                setFilteredData(e)
              }}
              filterDisplay={filterDisplay}
              size={"small"}
              header={header}
              paginator={true}
              filters={filters}
              value={dataset ? dataset : null}
              // globalFilterFields={selectedDatasetColumns}
              rows={5}
              rowsPerPageOptions={[5, 10, 25, 50]}
              className="p-datatable-striped p-datatable-gridlines"
              removableSort={true}
            >
              {selectedDatasetColumns.length > 0 && 
              // Filter the columns to display only the selected ones
              // selectedDatasetColumns.map((column, index) => <Column key={column} {...getColumnOptions(column)} dataType={getColumnDataType(column)} field={String(column)} sortable filterPlaceholder={`Search by ${column}`} filterElement={filterTemplateRenderer(index)} filter header={generateHeader(column)} style={{ minWidth: "5rem" }}></Column>)}
              selectedColumnsOptions.map((column, index) => <Column key={column} {...getColumnOptions(column)} dataType={getColumnDataType(column)} field={String(column)} sortable filterPlaceholder={`Search by ${column}`} filterElement={filterTemplateRenderer(index)} filter header={generateHeader(column)} style={{ minWidth: "5rem" }}></Column>)}
              {/* selectedColumns.map((column, index) => <Column key={column.name} {...getColumnOptions(column.name)} dataType={getColumnDataType(column.name)} field={String(column.name)} sortable filterPlaceholder={`Search by ${column.name}`} filterElement={filterTemplateRenderer(index)} filter header={generateHeader(column.name)} style={{ minWidth: "5rem" }}></Column>)}  */}
              </DataTable>
          </Row>
          <Row className={"card"} style={{ display: "flex", justifyContent: "space-evenly", flexDirection: "row", marginTop: "0.5rem", backgroundColor: "transparent", padding: "0.5rem" }}>
            <h6>
              Rows selected : <b>{filteredData.length}</b>&nbsp; of &nbsp;
              <b>{dataset ? dataset.length : 0}</b>
            </h6>
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
                label="Create subset from filtered rows"
                disabled={checkIfNameAlreadyUsed(newDatasetName + "." + newDatasetExtension) || selectedDataset === null || selectedDataset === undefined || newDatasetName.length === 0}
                onClick={() => {
                  // dropAll(false)
                  saveFilteredDataset(filteredData)
                }}
              />
            </Col>
          </Row>
        </Col>
        <div className="progressBar-merge">{<ProgressBarRequests isUpdating={isProgressUpdating} setIsUpdating={setIsProgressUpdating} progress={progress} setProgress={setProgress} requestTopic={"input/progress/" + pageId} delayMS={50} />}</div>
      </Row>
      <OverlayPanel showCloseIcon={true} dismissable={true} style={{ width: "auto" }}>
        Do you want to <b>overwrite</b> the dataset or <b>create a new one</b> ?
        <div className="" style={{ display: "flex", flexDirection: "row", marginTop: "0.5rem" }}>
          <Button size="small" severity={"danger"} label="Overwrite" onClick={() => dropRowsOrColumns(true)} style={{ alignContent: "center", alignSelf: "center", display: "flex", justifyContent: "center" }}></Button>

          <div className="p-inputgroup flex-1" style={{ marginLeft: "1rem", alignContent: "center", alignItems: "center", display: "flex" }}>
            <InputText
              size={"small"}
              className={`${checkIfNameAlreadyUsed(newLocalDatasetName + "." + newLocalDatasetExtension) ? "p-invalid" : ""}`}
              placeholder="Subset name"
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

export default AddDeleteColumnsTool