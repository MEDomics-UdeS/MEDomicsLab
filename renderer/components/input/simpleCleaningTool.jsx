import React, { useContext, useState, useEffect } from "react"
import { Row, Col } from "react-bootstrap"
import { DataContext } from "../workspace/dataContext"
import { Button } from "primereact/button"
import { Dropdown } from "primereact/dropdown"
import MedDataObject from "../workspace/medDataObject"
import { Slider } from "primereact/slider"
import { InputNumber } from "primereact/inputnumber"
import { DataTable } from "primereact/datatable"
import { Column } from "@blueprintjs/table"
import { Tag } from "primereact/tag"
import { OverlayPanel } from "primereact/overlaypanel"
import SaveDataset from "../generalPurpose/saveDataset"
import { requestBackend } from "../../utilities/requests"
import { WorkspaceContext } from "../workspace/workspaceContext"
import { ErrorRequestContext } from "../generalPurpose/errorRequestContext"
import { updateListOfDatasets } from "./simpleToolsUtils"
import { SelectButton } from "primereact/selectbutton"
import { Message } from "primereact/message"
import { toast } from "react-toastify"

/**
 * Component that renders the simple cleaning tool
 */
const SimpleCleaningTool = ({ pageId = "inputModule" }) => {
  const { globalData } = useContext(DataContext) // The global data object
  const { port } = useContext(WorkspaceContext) // we get the port for server connexion
  const { setError } = useContext(ErrorRequestContext) // We get the setError function from the context
  const [listOfDatasets, setListOfDatasets] = useState([]) // The list of datasets
  const [selectedDataset, setSelectedDataset] = useState(null) // The selected dataset
  const [newDatasetName, setNewDatasetName] = useState("") // The name of the new dataset
  const [newDatasetExtension, setNewDatasetExtension] = useState("csv") // The extension of the new dataset
  const [columnThreshold, setColumnThreshold] = useState(100) // The column threshold
  const [rowThreshold, setRowThreshold] = useState(100) // The row threshold
  const [columnsInfos, setColumnsInfos] = useState([]) // The columns infos of the selected dataset
  const [rowsInfos, setRowsInfos] = useState([]) // The rows infos of the selected dataset
  const [columnsToClean, setColumnsToClean] = useState([]) // The columns to clean
  const [rowsToClean, setRowsToClean] = useState([]) // The rows to clean
  const [newLocalDatasetName, setNewLocalDatasetName] = useState("") // The name of the new dataset
  const [newLocalDatasetExtension, setNewLocalDatasetExtension] = useState("csv") // The extension of the new dataset
  const [cleanType, setCleanType] = useState("columns") // The clean type [columns, rows]
  const [cleanMethod, setCleanMethod] = useState("drop") // The selected clean method
  const [startWith, setStartWith] = useState("Columns") // Columns or rows
  const [cleanConsidering, setCleanConsidering] = useState("Highlighted elements") // While proceeding in sequence, choose to clean using the highlighted elements or the thresholds
  const cleanMethods = ["drop", "random fill", "mean fill", "median fill", "mode fill", "bfill", "ffill"] // The cleaning methods
  const opCol = React.useRef(null)

  /**
   * To handle the change in the selected dataset, and update the columns options
   * @param {Object} e - The event object
   * @returns {Void}
   */
  const handleSelectedDatasetChange = async (e) => {
    setSelectedDataset(globalData[e.target.value])
    if (globalData[e.target.value].extension === "csv") {
      globalData[e.target.value].getColumnsOfTheDataObjectIfItIsATable().then((columns) => {
        console.log("columnsOptions", columns)
      })
    }
  }

  /**
   * Hook that is called when the global data object is updated to update the list of datasets
   */
  useEffect(() => {
    updateListOfDatasets(globalData, selectedDataset, setListOfDatasets, setSelectedDataset)
  }, [globalData])

  /**
   * To get the infos of the data
   * @param {Object} data - The data
   * @returns {Object} - The infos
   * @returns {Number} - The infos.columnsLength - The number of columns
   * @returns {Number} - The infos.rowsLength - The number of rows
   * @returns {Array} - The infos.rowsCount - The number of non-empty values per row
   */
  const getInfos = (data) => {
    let infos = { columnsLength: data.shape[1], rowsLength: data.shape[0] }
    infos.rowsCount = data.count().$data

    infos.columnsCount = data.count({ axis: 0 }).$data
    infos.columnNames = data.$columns
    return infos
  }

  /**
   * To get the data
   * @returns {Promise} - The promise of the data
   */
  const getData = () => {
    function formatNaN(x) {
      if (x == "NaN") {
        return NaN
      }
      return x
    }
    const loadData = new Promise((resolve) => {
      let data = selectedDataset.loadDataFromDisk()
      resolve(data)
    })
    const formatData = loadData.then((data) => {
      data.applyMap(formatNaN, { inplace: true })
      return data
    })
    return formatData
  }

  /**
   * Hook that is called when the selected dataset is updated to update the columns infos
   */
  useEffect(() => {
    if (selectedDataset !== null && selectedDataset !== undefined) {
      getData().then((data) => {
        let infos = getInfos(data)
        let newColumnsInfos = []
        infos.columnsCount.forEach((column, index) => {
          newColumnsInfos.push({ label: infos.columnNames[index], value: infos.rowsLength - column, percentage: ((infos.rowsLength - column) / infos.rowsLength) * 100 })
        })
        setColumnsInfos(newColumnsInfos)
        let newRowsInfos = []
        infos.rowsCount.forEach((row, index) => {
          newRowsInfos.push({ label: index, value: infos.columnsLength - row, percentage: ((infos.columnsLength - row) / infos.columnsLength) * 100 })
        })
        setRowsInfos(newRowsInfos)
      })
      setNewDatasetExtension(selectedDataset.extension)
      setNewDatasetName(selectedDataset.nameWithoutExtension + "_clean")
      setNewLocalDatasetExtension(selectedDataset.extension)
      setNewLocalDatasetName(selectedDataset.nameWithoutExtension + "_clean")
    } else {
      setColumnsInfos([])
      setRowsInfos([])
      setNewDatasetExtension("csv")
      setNewDatasetName("")
      setNewLocalDatasetExtension("csv")
      setNewLocalDatasetName("")
    }
  }, [selectedDataset])

  /**
   * Template for the rows in the columns datatable
   * @param {Object} data - The row data
   * @returns {Object} - The row template
   */
  const columnClass = (data) => {
    return { "bg-invalid": data.percentage > columnThreshold }
  }

  /**
   * Template for the rows in the rows datatable
   * @param {Object} data - The row data
   * @returns {Object} - The row template
   */
  const rowClass = (data) => {
    return { "bg-invalid": data.percentage > rowThreshold }
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
   * Call the clean method in backend
   * @param {string} type type of cleaning (columns, rows or all)
   * @param {boolean} overwrite wether to overwrite or not the csv file
   */
  const clean = (type, overwrite) => {
    let jsonToSend = {}
    if (type == "all") {
      jsonToSend = {
        type: type,
        cleanMethod: cleanMethod,
        overwrite: overwrite,
        path: selectedDataset.path,
        startWith: startWith,
        cleanConsidering: cleanConsidering,
        rowThreshold: rowThreshold,
        columnThreshold: columnThreshold,
        rowsToClean: rowsToClean,
        columnsToClean: columnsToClean,
        newDatasetName: newDatasetName,
        newDatasetExtension: newDatasetExtension
      }
    } else {
      jsonToSend = {
        type: type,
        cleanMethod: cleanMethod,
        overwrite: overwrite,
        path: selectedDataset.path,
        rowThreshold: rowThreshold,
        columnThreshold: columnThreshold,
        rowsToClean: rowsToClean,
        columnsToClean: columnsToClean,
        newDatasetName: newLocalDatasetName,
        newDatasetExtension: newLocalDatasetExtension
      }
    }
    requestBackend(port, "/input/clean/" + pageId, jsonToSend, (jsonResponse) => {
      if (jsonResponse.error) {
        if (typeof jsonResponse.error == "string") {
          jsonResponse.error = JSON.parse(jsonResponse.error)
        }
        setError(jsonResponse.error)
      } else {
        console.log("jsonResponse", jsonResponse)
        MedDataObject.updateWorkspaceDataObject()
        toast.success("DATA saved successfully under " + jsonResponse["result_path"])
      }
    })
  }

  /**
   * Called when the user press the "Create button"
   * @param {boolean} overwrite wether to overwrite or not the csv file
   */
  const cleanAll = (overwrite = false) => {
    clean("all", overwrite)
  }

  /**
   * Called when the user press the clean rows or clean columns button
   * @param {boolean} overwrite
   */
  const cleanRowsOrColumns = (overwrite = false) => {
    clean(cleanType, overwrite)
  }

  /**
   * Hook that is called when the columns infos are updated to update the columns to drop
   */
  useEffect(() => {
    let newColumnsToClean = []
    columnsInfos.forEach((column) => {
      if (column.percentage > columnThreshold) {
        newColumnsToClean.push(column.label)
      }
    })
    setColumnsToClean(newColumnsToClean)
  }, [columnsInfos, columnThreshold])

  /**
   * Hook that is called when the rows infos are updated to update the rows to drop
   */
  useEffect(() => {
    let newRowsToClean = []
    rowsInfos.forEach((row) => {
      if (row.percentage > rowThreshold) {
        newRowsToClean.push(row.label)
      }
    })
    setRowsToClean(newRowsToClean)
  }, [rowsInfos, rowThreshold])

  return (
    <>
      <div className="margin-top-15 center">
        <Message text="The Simple Cleaning tool assists in handling missing values within your datasets, whether by rows, columns, or both. It provides various methods such as dropping missing values or filling them in." />
      </div>
      <hr></hr>
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
          <hr></hr>
          <Row style={{ display: "flex", justifyContent: "space-evenly", flexDirection: "row", marginTop: "0.5rem" }}>
            <DataTable
              size={"small"}
              paginator={true}
              value={columnsInfos}
              rowClassName={columnClass}
              rows={5}
              rowsPerPageOptions={[5, 10, 25, 50]}
              className="p-datatable-striped p-datatable-gridlines"
            >
              <Column field="label" header={`Column (${columnsInfos.length})`} sortable></Column>
              <Column field="value" header="Number of empty" sortable></Column>
              <Column
                field="percentage"
                header={
                  <>
                    % of empty <b style={{ color: "var(--red-300)" }}>({columnsToClean.length})</b>
                  </>
                }
                body={percentageTemplate}
                sortable
              ></Column>
            </DataTable>

            <DataTable
              size={"small"}
              paginator={true}
              value={rowsInfos}
              rowClassName={rowClass}
              rows={5}
              rowsPerPageOptions={[5, 10, 25, 50]}
              className="p-datatable-striped p-datatable-gridlines"
              style={{ marginTop: "0.5rem" }}
            >
              <Column field="label" header={`Row index (${rowsInfos.length})`} sortable></Column>
              <Column field="value" header="Number of empty" sortable></Column>
              <Column
                field="percentage"
                header={
                  <>
                    % of empty <b style={{ color: "var(--red-300)" }}>({rowsToClean.length})</b>
                  </>
                }
                body={percentageTemplate}
                sortable
              ></Column>
            </DataTable>
          </Row>
          <hr></hr>
          <div style={{ display: "flex", marginTop: "0.5rem", alignContent: "center", alignItems: "center", justifyContent: "center" }}>
            <h6>Clean Method &nbsp;</h6>
            <Dropdown value={cleanMethod} onChange={(e) => setCleanMethod(e.value)} options={cleanMethods} />
          </div>
          <hr></hr>
          <Row className={"card"} style={{ display: "flex", justifyContent: "space-evenly", flexDirection: "row", marginTop: "0.5rem", backgroundColor: "transparent", padding: "0.5rem" }}>
            <Col className="align-items-center " style={{ display: "flex" }}>
              <label htmlFor="minmax-buttons" className="font-bold block mb-2">
                <h6>
                  Column threshold of empty values (%) <b style={{ color: "var(--red-300)" }}>({columnsToClean.length})</b>
                </h6>
              </label>
            </Col>
            <Col className="align-items-center " style={{ display: "flex" }}>
              <Col className="align-items-center " style={{ display: "flex", flexDirection: "column" }}>
                <b>Columns that will be cleaned</b>
                <div className="card" style={{ maxHeight: "3rem", overflow: "auto", width: "100%", background: "transparent", minHeight: "3rem" }}>
                  <div style={{ margin: "0.5rem" }}>
                    <>
                      {columnsToClean.map((column) => {
                        return <Tag key={column} value={column} className="p-tag p-tag-rounded p-tag-danger p-mr-2" style={{ margin: ".15rem", marginInline: "0.05rem" }}></Tag>
                      })}
                    </>
                  </div>
                </div>
              </Col>
            </Col>

            <Row style={{ display: "flex", justifyContent: "space-evenly", flexDirection: "row", marginTop: "0.5rem", alignContent: "center" }}>
              <Col style={{ display: "flex", flexDirection: "row", alignContent: "center", alignItems: "center" }}>
                <Slider
                  className="custom-slider holdout-slider"
                  value={columnThreshold}
                  style={{ flexGrow: "2" }}
                  onChange={(e) => {
                    setColumnThreshold(e.value)
                  }}
                ></Slider>
                <InputNumber
                  prefix="% "
                  inputId="minmax-buttons"
                  value={columnThreshold}
                  onValueChange={(e) => {
                    setColumnThreshold(e.value)
                  }}
                  mode="decimal"
                  showButtons
                  min={0}
                  max={100}
                  size={2}
                  style={{ marginLeft: "1rem", marginRight: "1rem" }}
                />
                <Button
                  disabled={selectedDataset ? false : true}
                  id="InputPage-Button"
                  label="Clean columns"
                  onClick={(e) => {
                    setCleanType("columns")
                    opCol.current.toggle(e)
                  }}
                ></Button>
              </Col>
            </Row>
          </Row>

          <Row className={"card"} style={{ display: "flex", justifyContent: "space-evenly", flexDirection: "row", marginTop: "0.5rem", backgroundColor: "transparent", padding: "0.5rem" }}>
            <Col className="align-items-center " style={{ display: "flex" }}>
              <label htmlFor="minmax-buttons" className="font-bold block mb-2">
                <h6>
                  Row threshold of empty values (%) <b style={{ color: "var(--red-300)" }}>({rowsToClean.length})</b>
                </h6>
              </label>
            </Col>
            <Col className="align-items-center " style={{ display: "flex" }}>
              <Col className="align-items-center " style={{ display: "flex", flexDirection: "column" }}>
                <b>Rows that will be cleaned</b>
                <div className="card" style={{ maxHeight: "3rem", overflow: "auto", width: "100%", background: "transparent", minHeight: "3rem" }}>
                  <div style={{ margin: "0.5rem" }}>
                    <>
                      {rowsToClean.map((column) => {
                        return <Tag key={column} value={column} className="p-tag p-tag-rounded p-tag-danger p-mr-2" style={{ margin: ".15rem", marginInline: "0.05rem" }}></Tag>
                      })}
                    </>
                  </div>
                </div>
              </Col>
            </Col>
            <Row style={{ display: "flex", justifyContent: "space-evenly", flexDirection: "row", marginTop: "0.5rem", alignContent: "center" }}>
              <Col style={{ display: "flex", flexDirection: "row", alignContent: "center", alignItems: "center" }}>
                <Slider
                  className="custom-slider holdout-slider"
                  value={rowThreshold}
                  style={{ flexGrow: "2" }}
                  onChange={(e) => {
                    setRowThreshold(e.value)
                  }}
                ></Slider>
                <InputNumber
                  prefix="% "
                  inputId="minmax-buttons"
                  value={rowThreshold}
                  onValueChange={(e) => {
                    setRowThreshold(e.value)
                  }}
                  mode="decimal"
                  showButtons
                  min={0}
                  max={100}
                  size={2}
                  style={{ marginLeft: "1rem", marginRight: "1rem" }}
                />
                <Button
                  disabled={selectedDataset ? false : true}
                  id="InputPage-Button"
                  label="Clean rows"
                  onClick={(e) => {
                    setCleanType("rows")
                    opCol.current.toggle(e)
                  }}
                ></Button>{" "}
              </Col>
            </Row>
          </Row>
          <hr></hr>
          <Message text="The following options are considered if you press the Create button while selecting both rows and columns to clean." style={{ display: "flex", alignItems: "center" }} />
          <div style={{ display: "flex", marginTop: "0.5rem", alignContent: "center", alignItems: "center", justifyContent: "space-evenly" }}>
            <div>
              <h6>Begin cleaning with &nbsp;</h6>
              <SelectButton
                value={startWith}
                onChange={(e) => setStartWith(e.value)}
                options={["Columns", "Rows"]}
                tooltip="The process will be executed sequently beginning by the selected option."
              />
            </div>
            <div>
              <h6>Clean considering &nbsp;</h6>
              <SelectButton
                value={cleanConsidering}
                onChange={(e) => setCleanConsidering(e.value)}
                options={["Highlighted elements", "Threshold"]}
                tooltip={`Highlighted elements option will apply cleaning to all the highlighted elements, while the threshold will recalculate the elements to clean after processing ${startWith}.`}
              />
            </div>
          </div>
          <hr></hr>
          <SaveDataset
            newDatasetName={newDatasetName}
            newDatasetExtension={newDatasetExtension}
            selectedDataset={selectedDataset}
            setNewDatasetName={setNewDatasetName}
            setNewDatasetExtension={setNewDatasetExtension}
            functionToExecute={cleanAll}
          />
        </Col>
      </Row>
      <OverlayPanel ref={opCol} showCloseIcon={true} dismissable={true} style={{ width: "auto" }}>
        Do you want to <b>overwrite</b> the dataset or <b>create a new one</b> ?
        <SaveDataset
          newDatasetName={newLocalDatasetName}
          newDatasetExtension={newLocalDatasetExtension}
          selectedDataset={selectedDataset}
          setNewDatasetName={setNewLocalDatasetName}
          setNewDatasetExtension={setNewLocalDatasetExtension}
          functionToExecute={cleanRowsOrColumns}
        />
      </OverlayPanel>
    </>
  )
}

export default SimpleCleaningTool
