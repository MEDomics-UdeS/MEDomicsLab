import React, { useState, useEffect, useContext } from "react"
import { Row, Col } from "react-bootstrap"
import { Dropdown } from "primereact/dropdown"
import { DataTable } from "primereact/datatable"
import { Column } from "@blueprintjs/table"
import { MultiSelect } from "primereact/multiselect"
import { DataContext } from "../workspace/dataContext"
import { cleanDataset, cleanString, generateHeader, getColumnDataType, getData, getColumnOptions, getParentIDfolderPath, handleSelectedDatasetChange, updateListOfDatasets } from "./simpleToolsUtils"
import MedDataObject from "../workspace/medDataObject"
import { toast } from "react-toastify"
import SaveDataset from "../generalPurpose/saveDataset"
import { InputSwitch } from "primereact/inputswitch"
import { Message } from "primereact/message"
import { Checkbox } from "primereact/checkbox"

const dfd = require("danfojs-node")

/**
 * Component that renders the delete columns tool
 */
const OperationOnColumnTool = ({ operationType }) => {
  const { globalData } = useContext(DataContext) // The global data object
  const [columnsAsFile, setColumnsAsFile] = useState(false) // True if we enter the columns to operate from a CSV file
  const [exportColumns, setExportColumns] = useState(false) // Wether to export or not the selected columns into a CSV file
  const [listOfDatasets, setListOfDatasets] = useState([]) // The list of datasets
  const [listOfCsvColumns, setListOfCsvColumns] = useState([]) // The list of CSV files containing only columns
  const [matchingColumns, setMatchingColumns] = useState(true) // False if the csv columns file aren't in the selected dataset columns
  const [newDatasetName, setNewDatasetName] = useState("") // The name of the new dataset
  const [newDatasetExtension, setNewDatasetExtension] = useState("csv") // The extension of the new dataset
  const [selectedDatasetColumns, setSelectedDatasetColumns] = useState([]) // The columns infos of the selected dataset
  const opTab = React.useRef(null)
  const [dataset, setDataset] = useState(null) // The dataset to drop
  const [df, setDf] = useState(null) // The dataframe
  const [columnTypes] = useState({}) // The column types
  const [selectedColumns, setSelectedColumns] = useState([]) // The selected columns
  const [selectedColumnsOptions, setSelectedColumnsOptions] = useState([]) // The selected columns options
  const [selectedCsvColumns, setSelectedCsvColumns] = useState(null) // When selected columns to operate is a CSV file
  const [selectedDataset, setSelectedDataset] = useState(null) // The selected dataset
  const [transformType, setTransformType] = useState("binary_0_1") // The type of transformation
  const [visibleColumns, setVisibleColumns] = useState([])

  const transformOptions = [
    { label: "Binary : Empty cells become 0, non-empty cells become 1", value: "binary_0_1" },
    { label: "Empty to 0 : Empty cells become 0, non-empty cells stay the same", value: "nan_to_zero" }
  ]

  /**
   * Hook that is called when the global data object is updated to update the list of datasets
   */
  useEffect(() => {
    updateListOfDatasets(globalData, selectedDataset, setListOfDatasets, setSelectedDataset)
    getListOfCsvColumns()
  }, [globalData])

  /**
   * If selectedCsvColumns and selectedDataset are set this hook check
   * if the 2 files are compatible and set an error message if it's not the case.
   */
  useEffect(() => {
    async function areColumnsMatching() {
      let dataframe = cleanDataset(await dfd.readCSV(selectedDataset.path))
      let columns = await dfd.readCSV(selectedCsvColumns.data.path, { header: selectedCsvColumns.header })
      let cleanedColumnNames = []
      columns.$data[0].forEach((column) => {
        cleanedColumnNames.push(cleanString(column))
      })
      columns = new dfd.DataFrame(cleanedColumnNames)
      // check if columns are contained in dataframe
      let matching = columns.$data.every((column) => dataframe.$columns.includes(column))
      setMatchingColumns(matching)
      let newSelectedColumns = []
      let columnsOptions = []
      if (matching) {
        columns.$data.forEach((column) => {
          newSelectedColumns.push({ name: column, value: column })
          columnsOptions.push(column)
        })
      } else {
        dataframe.$columns.forEach((column) => {
          newSelectedColumns.push({ name: column, value: column })
          columnsOptions.push(column)
        })
      }
      setVisibleColumns(newSelectedColumns)
      setSelectedColumnsOptions(columnsOptions)
    }
    if (selectedCsvColumns && selectedDataset) {
      areColumnsMatching()
    } else {
      setMatchingColumns(true)
    }
  }, [selectedCsvColumns, selectedDataset])

  /**
   * Hook that is called when the selected dataset is updated to update the columns infos
   */
  useEffect(() => {
    if (selectedDataset) {
      getData(selectedDataset).then((data) => {
        if (!data || data.$data.length == 0) {
          toast.error("Invalid data selected")
          reinitializeData()
        } else {
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
        }
      })
      setNewDatasetExtension(selectedDataset.extension)
      setNewDatasetName(selectedDataset.nameWithoutExtension + "_" + operationType + "_cols")
    } else {
      reinitializeData()
    }
  }, [selectedDataset])

  /**
   * Called to reinitialize data while overwriting the selectedDataset file or choosing an incompatible file to display
   */
  const reinitializeData = () => {
    setDf(null)
    setDataset(null)
    setSelectedDataset(null)
    setSelectedDatasetColumns([])
    setSelectedColumnsOptions([])
    setSelectedColumns([])
    setVisibleColumns([])
    setNewDatasetExtension("csv")
    setNewDatasetName("")
  }

  /**
   * Get list of CSV files that contains only columns
   */
  const getListOfCsvColumns = async () => {
    let keys = Object.keys(globalData)
    let tmpList = []
    for (let key of keys) {
      if (globalData[key].type === "file" && globalData[key].extension === "csv") {
        let dataWithoutHeader = await dfd.readCSV(globalData[key].path, { header: false })
        if (dataWithoutHeader.$columns.length > 0 && dataWithoutHeader.$data.length == 1) {
          tmpList.push({ data: globalData[key], header: false })
        }
        let dataWithHeader = await dfd.readCSV(globalData[key].path)
        if (dataWithHeader.$columns.length > 0 && dataWithHeader.$data.length == 1) {
          tmpList.push({ data: globalData[key], header: true })
        }
      }
    }
    setListOfCsvColumns(tmpList)
  }

  /**
   * Header of the displayed dataset, containing the tools for columns selection
   */
  const renderHeader = () => {
    return (
      <Row className="table-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Col>
          {/* Add a label for columns selection */}
          <label htmlFor="toggleColumns" className="p-checkbox-label" style={{ marginLeft: "0.5rem" }}>
            {operationType == "delete" && <>Select the columns to keep: &nbsp;</>}
            {operationType == "transform" && <>Select the columns to transform: &nbsp;</>}
          </label>
          {/* If file we filter list of CSV files containing only columns else we display the dataset columns */}
          {columnsAsFile ? (
            <Dropdown options={listOfCsvColumns} optionLabel="data.name" value={selectedCsvColumns} onChange={(e) => setSelectedCsvColumns(e.value)}></Dropdown>
          ) : (
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
          )}
        </Col>
        <Col>
          <label htmlFor="toggleColumns" className="p-checkbox-label" style={{ marginLeft: "0.5rem" }}>
            Enter columns as CSV file &nbsp;
          </label>
          <InputSwitch
            checked={columnsAsFile}
            tooltip="The CSV file must contain only one row, corresponding to the names of the columns you want to select."
            onChange={(e) => {
              if (df) {
                let columns = df.columns
                let newSelectedColumns = []
                columns.forEach((column) => {
                  newSelectedColumns.push({ name: column, value: column })
                })
                setSelectedColumnsOptions(columns)
                setVisibleColumns(newSelectedColumns)
              }
              setSelectedCsvColumns(null)
              setColumnsAsFile(e.value)
            }}
          />
        </Col>
      </Row>
    )
  }

  /**
   * To apply the selected filter and save the filtered dataset
   * @param {Boolean} overwrite - True if the dataset should be overwritten, false otherwise
   */
  const saveFilteredDataset = (overwrite = false) => {
    // Can't use df or df.copy() with transformed columns because all transformations are saved on the df
    // and if we proceed to multiple calls of transform with the same df, the previous transformations are
    // also present in the new transformations. So the solution for now is to load the data another time.
    getData(selectedDataset).then((data) => {
      let newData = cleanDataset(data)
      let columnsToOperate = []
      console.log("new", newData)
      // Call the function depending on the operation type choosen
      if (operationType == "delete") {
        columnsToOperate = selectedColumns.filter((col) => !visibleColumns.some((vCol) => vCol.name === col.name)).map((col) => col.name)
        newData = df.drop({ columns: columnsToOperate })
      } else if (operationType == "transform") {
        columnsToOperate = selectedColumns.filter((col) => visibleColumns.some((vCol) => vCol.name === col.name)).map((col) => col.name)
        columnsToOperate.forEach((column) => {
          if (transformType === "binary_0_1") {
            newData[column] = newData[column].apply((x) => (x === null || x === undefined || x === "NaN" ? 0 : 1))
          } else if (transformType === "nan_to_zero") {
            newData[column] = newData[column].apply((x) => (x === null || x === undefined || x === "NaN" ? 0 : 1))
          }
        })
      }
      // Save the data
      if (newData?.$data?.length > 0 && newData?.$columns?.length > 0 && columnsToOperate.length > 0) {
        if (overwrite) {
          MedDataObject.saveDatasetToDisk({
            df: newData,
            filePath: selectedDataset.path,
            extension: selectedDataset.extension
          })
          setSelectedDataset(null)
        } else {
          MedDataObject.saveDatasetToDisk({
            df: newData,
            filePath: getParentIDfolderPath(selectedDataset, globalData) + newDatasetName + "." + newDatasetExtension,
            extension: newDatasetExtension
          })
          let dataset = selectedDataset
          setSelectedDataset(null)
          setSelectedDataset(dataset)
        }
        MedDataObject.updateWorkspaceDataObject()
      } else {
        toast.error("Operation on column(s) failed")
      }
      // Export columns if asked
      if (exportColumns && !columnsAsFile) {
        let cols = []
        visibleColumns.forEach((column) => {
          cols.push(column.value)
        })
        MedDataObject.saveDatasetToDisk({
          df: new dfd.DataFrame([cols]),
          filePath: getParentIDfolderPath(selectedDataset, globalData) + selectedDataset.nameWithoutExtension + "_cols_to_operate" + "." + newDatasetExtension,
          extension: newDatasetExtension
        })
        MedDataObject.updateWorkspaceDataObject()
      }
    })
  }

  return (
    <>
      {operationType == "transform" && (
        <div className="margin-top-15 margin-bottom-15 center">
          <Message text="The Transform Columns tool enables you to modify columns in a dataset, either by converting selected columns into binaries or by replacing missing cells with zeros." />
        </div>
      )}
      {operationType == "delete" && (
        <div className="margin-top-15 margin-bottom-15 center">
          <Message text="The Delete Columns tool allows you to create a subset from a dataset by specifying the columns you want to retain." />
        </div>
      )}
      <Row className="simple-cleaning-set">
        <Col>
          <h6>Select the dataset</h6>
          {/* Dropdown to select the first dataset */}
          <Dropdown
            options={listOfDatasets}
            optionLabel="name"
            optionValue="key"
            className="w-100"
            value={selectedDataset ? selectedDataset.getUUID() : null}
            onChange={(e) => handleSelectedDatasetChange(e, setSelectedDataset, globalData)}
          ></Dropdown>
          <Row style={{ display: "flex", justifyContent: "space-evenly", flexDirection: "row", marginTop: "0.5rem" }}>
            <DataTable
              ref={opTab}
              size={"small"}
              header={renderHeader()}
              paginator={true}
              value={dataset ? dataset : null}
              globalFilterFields={selectedDatasetColumns}
              rows={5}
              rowsPerPageOptions={[5, 10, 25, 50]}
              className="p-datatable-striped p-datatable-gridlines"
              removableSort={true}
            >
              {selectedDatasetColumns.length > 0 &&
                selectedColumns.map((column) => (
                  <Column
                    key={column.name + "index"}
                    {...getColumnOptions(column.name, columnTypes)}
                    dataType={getColumnDataType(column.name, columnTypes)}
                    field={String(column.name)}
                    header={generateHeader(column.name, selectedColumnsOptions)}
                    style={{ minWidth: "5rem" }}
                  ></Column>
                ))}
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
          {operationType == "transform" && (
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
              <label>
                <strong>Choose the type of transformation</strong>
              </label>
              <Dropdown value={transformType} options={transformOptions} onChange={(e) => setTransformType(e.target.value)} placeholder="Select the type of transformation" />
            </Row>
          )}
          {!matchingColumns && (
            <div className="flex-container">
              <Message severity="error" text="The selected columns are not all present in the selected dataset." />
            </div>
          )}
          {!columnsAsFile && (
            <div style={{ marginTop: "0.5rem" }}>
              Export selected columns as CSV file &nbsp;
              <Checkbox onChange={(e) => setExportColumns(e.checked)} checked={exportColumns}></Checkbox>
            </div>
          )}
          <SaveDataset
            newDatasetName={newDatasetName}
            newDatasetExtension={newDatasetExtension}
            selectedDataset={selectedDataset}
            setNewDatasetName={setNewDatasetName}
            setNewDatasetExtension={setNewDatasetExtension}
            functionToExecute={saveFilteredDataset}
            enabled={matchingColumns}
          />
        </Col>
      </Row>
    </>
  )
}

export default OperationOnColumnTool
