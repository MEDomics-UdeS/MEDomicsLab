import React, { useState, useEffect, useContext } from "react"
import { Row, Col } from "react-bootstrap"
import { Dropdown } from "primereact/dropdown"
import { DataTable } from "primereact/datatable"
import { Column } from "@blueprintjs/table"
import { MultiSelect } from "primereact/multiselect"
import { DataContext } from "../workspace/dataContext"
import {
  cleanDataset,
  generateHeader,
  getColumnDataType,
  getData,
  getColumnOptions,
  getParentIDfolderPath,
  handleSelectedDatasetChange,
  updateListOfDatasets,
  updateTheColumnsTypes
} from "./simpleToolsUtils"
import MedDataObject from "../workspace/medDataObject"
import { toast } from "react-toastify"
import SaveDataset from "../generalPurpose/saveDataset"

const dfd = require("danfojs-node")

/**
 * Component that renders the delete columns tool
 */
const OperationOnColumnTool = ({ operationType }) => {
  const { globalData } = useContext(DataContext) // The global data object
  const [listOfDatasets, setListOfDatasets] = useState([]) // The list of datasets
  const [selectedDataset, setSelectedDataset] = useState(null) // The selected dataset
  const [newDatasetName, setNewDatasetName] = useState("") // The name of the new dataset
  const [newDatasetExtension, setNewDatasetExtension] = useState("csv") // The extension of the new dataset
  const [selectedDatasetColumns, setSelectedDatasetColumns] = useState([]) // The columns infos of the selected dataset
  const opTab = React.useRef(null)
  const [dataset, setDataset] = useState(null) // The dataset to drop
  const [df, setDf] = useState(null) // The dataframe
  const [columnTypes, setColumnTypes] = useState({}) // The column types
  const [selectedColumns, setSelectedColumns] = useState([]) // The selected columns
  const [selectedColumnsOptions, setSelectedColumnsOptions] = useState([]) // The selected columns options
  const [transformType, setTransformType] = useState("binary_0_1") // The type of transformation
  const [visibleColumns, setVisibleColumns] = useState([])

  const transformOptions = [
    { label: "Binary : NaN values become 0, non-NaN values become 1", value: "binary_0_1" },
    { label: "NaN to 0 : NaN values become 0, non-NaN values stay the same", value: "nan_to_zero" }
  ]

  /**
   * Hook that is called when the global data object is updated to update the list of datasets
   */
  useEffect(() => {
    updateListOfDatasets(globalData, selectedDataset, setListOfDatasets, setSelectedDataset)
  }, [globalData])

  /**
   * Hook that is called when the selected dataset is updated to update the columns infos
   */
  useEffect(() => {
    if (selectedDataset) {
      getData(selectedDataset).then((data) => {
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
      setNewDatasetExtension(selectedDataset.extension)
      setNewDatasetName(selectedDataset.nameWithoutExtension + "_" + operationType + "_cols")
    } else {
      setDf(null)
      setDataset(null)
      setSelectedDatasetColumns([])
      setSelectedColumnsOptions([])
      setSelectedColumns([])
      setVisibleColumns([])
      setNewDatasetExtension("csv")
      setNewDatasetName("")
    }
  }, [selectedDataset])

  const renderHeader = () => {
    return (
      <div className="table-header" style={{ display: "flex", justifyContent: "flex-start", alignItems: "center" }}>
        {/* Add a label for the multiselect : Toggle columns */}
        <label htmlFor="toggleColumns" className="p-checkbox-label" style={{ marginLeft: "0.5rem" }}>
          {operationType == "delete" && <>Select the columns to keep: &nbsp;</>}
          {operationType == "transform" && <>Select the columns to transform: &nbsp;</>}
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
   * To apply the selected filter and save the filtered dataset
   * @param {Boolean} overwrite - True if the dataset should be overwritten, false otherwise
   */
  const saveFilteredDataset = (overwrite = false) => {
    // Call the function depending on the operation type choosen
    let newData = null
    let columnsToOperate = []
    if (operationType == "delete") {
      columnsToOperate = selectedColumns.filter((col) => !visibleColumns.some((vCol) => vCol.name === col.name)).map((col) => col.name)
      newData = df.drop({ columns: columnsToOperate })
    } else if (operationType == "transform") {
      newData = df.copy()
      columnsToOperate = selectedColumns.filter((col) => visibleColumns.some((vCol) => vCol.name === col.name)).map((col) => col.name)
      columnsToOperate.forEach((column) => {
        if (transformType === "binary_0_1") {
          newData[column] = newData[column].apply((x) => (x === null || x === undefined || x === "NaN" ? 0 : 1))
        } else if (transformType === "nan_to_zero") {
          newData[column] = newData[column].apply((x) => (x === null || x === undefined || x === "NaN" ? 0 : x))
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
      }

      MedDataObject.updateWorkspaceDataObject()
    } else {
      toast.error("Operation on column(s) failed")
    }
  }

  /**
   * This hook is used to update the column types
   */
  useEffect(() => {
    updateTheColumnsTypes(df, setColumnTypes)
  }, [df])

  return (
    <>
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

export default OperationOnColumnTool
