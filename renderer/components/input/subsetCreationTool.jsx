import React, { useContext, useState, useEffect } from "react"
import { Row, Col } from "react-bootstrap"
import { DataContext } from "../workspace/dataContext"
import { Button } from "primereact/button"
import { Dropdown } from "primereact/dropdown"
import MedDataObject from "../workspace/medDataObject"
import { InputText } from "primereact/inputtext"
import { InputNumber } from "primereact/inputnumber"
import { DataTable } from "primereact/datatable"
import { Column } from "@blueprintjs/table"
import { toast } from "react-toastify"
import { FilterMatchMode, FilterOperator } from "primereact/api"
import { MultiSelect } from "primereact/multiselect"
import { Utils as danfoUtils } from "danfojs-node"
import SaveDataset from "../generalPurpose/saveDataset"

const dfd = require("danfojs-node")
const dfdUtils = new danfoUtils()

/**
 * Component that renders the subset creation tool
 */
const SubsetCreationTool = () => {
  const { globalData } = useContext(DataContext) // The global data object
  const [listOfDatasets, setListOfDatasets] = useState([]) // The list of datasets
  const [selectedDataset, setSelectedDataset] = useState(null) // The selected dataset
  const [newDatasetName, setNewDatasetName] = useState("") // The name of the new dataset
  const [newDatasetExtension, setNewDatasetExtension] = useState("csv") // The extension of the new dataset
  const [selectedDatasetColumns, setSelectedDatasetColumns] = useState([]) // The columns infos of the selected dataset
  const opTab = React.useRef(null)
  const [dataset, setDataset] = useState(null) // The dataset to drop
  const [globalFilterValue, setGlobalFilterValue] = useState("") // The global filter value
  const [filters, setFilters] = useState({}) // The filters
  const [filteredData, setFilteredData] = useState([]) // The filtered data
  const [df, setDf] = useState(null) // The dataframe
  const [columnTypes, setColumnTypes] = useState({}) // The column types

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
        })
      }
      setNewDatasetExtension(selectedDataset.extension)
      setNewDatasetName(selectedDataset.nameWithoutExtension + "_filtered")
    }
  }, [selectedDataset])

  /**
   * To save the filtered dataset
   * @param {Boolean} overwrite - True if the dataset should be overwritten, false otherwise
   */
  const saveFilteredDataset = (overwrite = false) => {
    if (filteredData.length !== dataset.length && filteredData !== null && filteredData !== undefined && filteredData.length !== 0) {
      if (overwrite) {
        MedDataObject.saveDatasetToDisk({ data: filteredData, filePath: selectedDataset.path, extension: selectedDataset.extension })
      } else {
        MedDataObject.saveDatasetToDisk({ data: filteredData, filePath: getParentIDfolderPath(selectedDataset) + newDatasetName + "." + newDatasetExtension, extension: newDatasetExtension })
      }
      MedDataObject.updateWorkspaceDataObject()
    } else {
      // As create/overwrite button are disabled while filtered data is null, the only error to throw here is when filteredData.length == dataset.length
      toast.error("No filter applied")
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
      <div className="table-header" style={{ display: "flex", justifyContent: "space-between" }}>
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
    return (
      <MultiSelect value={options.value} options={newOptions} onChange={onChangeFunc} optionLabel="name" placeholder={`Search by ${options.field}`} className="p-column-filter" maxSelectedLabels={1} />
    )
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
  function capitalizeFirstLetter(string) {
    return string[0].toUpperCase() + string.slice(1)
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
          <Dropdown
            options={listOfDatasets}
            optionLabel="name"
            optionValue="key"
            className="w-100"
            value={selectedDataset ? selectedDataset.getUUID() : null}
            onChange={handleSelectedDatasetChange}
          ></Dropdown>

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
              globalFilterFields={selectedDatasetColumns}
              rows={5}
              rowsPerPageOptions={[5, 10, 25, 50]}
              className="p-datatable-striped p-datatable-gridlines"
              removableSort={true}
            >
              {selectedDatasetColumns.length > 0 &&
                selectedDatasetColumns.map((column, index) => (
                  <Column
                    key={column}
                    {...getColumnOptions(column)}
                    dataType={getColumnDataType(column)}
                    field={String(column)}
                    sortable
                    filterPlaceholder={`Search by ${column}`}
                    filterElement={filterTemplateRenderer(index)}
                    filter
                    header={capitalizeFirstLetter(column)}
                    style={{ minWidth: "5rem" }}
                  ></Column>
                ))}
            </DataTable>
          </Row>
          <Row className={"card"} style={{ display: "flex", justifyContent: "space-evenly", flexDirection: "row", marginTop: "0.5rem", backgroundColor: "transparent", padding: "0.5rem" }}>
            <h6>
              Rows selected : <b>{filteredData.length}</b>&nbsp; of &nbsp;
              <b>{dataset ? dataset.length : 0}</b>
            </h6>
          </Row>
          <SaveDataset
            newDatasetName={newDatasetName}
            newDatasetExtension={newDatasetExtension}
            selectedDataset={selectedDataset}
            setNewDatasetName={setNewDatasetName}
            setNewDatasetExtension={setNewDatasetExtension}
            functionToExecute={saveFilteredDataset}
          />
        </Col>
      </Row>
    </>
  )
}

export default SubsetCreationTool
