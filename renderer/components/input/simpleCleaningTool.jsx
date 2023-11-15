import React, { useContext, useState, useEffect } from "react"
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

/**
 * Component that renders the holdout set creation tool
 * @param {Object} props
 * @param {String} props.pageId - The id of the page
 * @param {String} props.configPath - The path of the config file
 */
// eslint-disable-next-line no-unused-vars
const SimpleCleaningTool = ({ pageId = "inputModule", configPath = "" }) => {
  const { globalData } = useContext(DataContext) // The global data object
  const [listOfDatasets, setListOfDatasets] = useState([]) // The list of datasets
  const [selectedDataset, setSelectedDataset] = useState(null) // The selected dataset
  const [newDatasetName, setNewDatasetName] = useState("") // The name of the new dataset
  const [newDatasetExtension, setNewDatasetExtension] = useState(".csv") // The extension of the new dataset
  const [progress, setProgress] = useState({ now: 0, currentLabel: "" }) // The progress of the holdout set creation
  const [isProgressUpdating, setIsProgressUpdating] = useState(false) // To check if the progress is updating
  const [columnThreshold, setColumnThreshold] = useState(0) // The column threshold
  const [rowThreshold, setRowThreshold] = useState(0) // The row threshold
  const [selectedDatasetColumnsInfos, setSelectedDatasetColumnsInfos] = useState([]) // The columns infos of the selected dataset
  const [rowsInfos, setRowsInfos] = useState([]) // The rows infos of the selected dataset
  const [columnsToDrop, setColumnsToDrop] = useState([]) // The columns to drop
  const [rowsToDrop, setRowsToDrop] = useState([]) // The rows to drop
  const [newLocalDatasetName, setNewLocalDatasetName] = useState("") // The name of the new dataset
  const [newLocalDatasetExtension, setNewLocalDatasetExtension] = useState(".csv") // The extension of the new dataset
  const [dropType, setDropType] = useState("columns") // The drop type [columns, rows
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
   * To drop all - the rows and the columns
   * @param {Boolean} overwrite - True if the dataset should be overwritten, false otherwise
   * @returns {Void}
   */
  const dropAll = (overwrite) => {
    getData().then((data) => {
      let newData = data.drop({ columns: columnsToDrop })
      newData = newData.drop({ index: rowsToDrop })
      saveCleanDataset(newData, overwrite, false)
    })
  }

  /**
   * Hook that is called when the selected dataset is updated to update the columns infos
   */
  useEffect(() => {
    if (selectedDataset !== null && selectedDataset !== undefined) {
      if (selectedDataset !== null || selectedDataset !== undefined) {
        getData().then((data) => {
          let infos = getInfos(data)
          let newColumnsInfos = []
          data.$columns.forEach((column, index) => {
            newColumnsInfos.push({ label: column, value: infos.columnsCount[index], percentage: (infos.columnsCount[index] / infos.rowsLength) * 100 })
          })
          setSelectedDatasetColumnsInfos(newColumnsInfos)
          let newRowsInfos = []
          infos.rowsCount.forEach((row, index) => {
            newRowsInfos.push({ label: index, value: row, percentage: (row / infos.columnsLength) * 100 })
          })
          setRowsInfos(newRowsInfos)
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
    getData().then((data) => {
      let newData = data.drop({ columns: columnsToDrop })
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
      selectedDataset.saveData(newData)
      setSelectedDataset(null)
    } else {
      if (local === true) {
        MedDataObject.saveDatasetToDisk({ df: newData, filePath: getParentIDfolderPath(selectedDataset) + newLocalDatasetName + "." + newLocalDatasetExtension, extension: newLocalDatasetExtension })
      } else {
        MedDataObject.saveDatasetToDisk({ df: newData, filePath: getParentIDfolderPath(selectedDataset) + newDatasetName + "." + newDatasetExtension, extension: newDatasetExtension })
      }
    }
    MedDataObject.updateWorkspaceDataObject()
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
    selectedDatasetColumnsInfos.forEach((column) => {
      if (column.percentage < columnThreshold) {
        newColumnsToDrop.push(column.label)
      }
    })
    setColumnsToDrop(newColumnsToDrop)
  }, [selectedDatasetColumnsInfos, columnThreshold])

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

  return (
    <>
      <Row className="simple-cleaning-set">
        <Col>
          <h6>Select the dataset you want to clean</h6>
          {/* Dropdown to select the first dataset */}
          <Dropdown options={listOfDatasets} optionLabel="name" optionValue="key" className="w-100" value={selectedDataset ? selectedDataset.getUUID() : null} onChange={handleSelectedDatasetChange}></Dropdown>

          <Row style={{ display: "flex", justifyContent: "space-evenly", flexDirection: "row", marginTop: "0.5rem" }}>
            <DataTable size={"small"} paginator={true} value={selectedDatasetColumnsInfos} rowClassName={columnClass} rows={5} rowsPerPageOptions={[5, 10, 25, 50]} className="p-datatable-striped p-datatable-gridlines">
              <Column field="label" header={`Column (${selectedDatasetColumnsInfos.length})`} sortable></Column>
              <Column field="value" header="Number of non-NaN" sortable></Column>
              <Column
                field="percentage"
                header={
                  <>
                    % of non-NaN <b style={{ color: "var(--red-300)" }}>({columnsToDrop.length})</b>
                  </>
                }
                body={percentageTemplate}
                sortable
              ></Column>
            </DataTable>

            <DataTable size={"small"} paginator={true} value={rowsInfos} rowClassName={rowClass} rows={5} rowsPerPageOptions={[5, 10, 25, 50]} className="p-datatable-striped p-datatable-gridlines" style={{ marginTop: "0.5rem" }}>
              <Column field="label" header={`Row index (${rowsInfos.length})`} sortable></Column>
              <Column field="value" header="Number of non-NaN" sortable></Column>
              <Column
                field="percentage"
                header={
                  <>
                    % of non-NaN <b style={{ color: "var(--red-300)" }}>({rowsToDrop.length})</b>
                  </>
                }
                body={percentageTemplate}
                sortable
              ></Column>
            </DataTable>
          </Row>
          <Row className={"card"} style={{ display: "flex", justifyContent: "space-evenly", flexDirection: "row", marginTop: "0.5rem", backgroundColor: "transparent", padding: "0.5rem" }}>
            <Col className="align-items-center " style={{ display: "flex" }}>
              <label htmlFor="minmax-buttons" className="font-bold block mb-2">
                <h6>
                  Column threshold of NaN values (%) <b style={{ color: "var(--red-300)" }}>({columnsToDrop.length})</b>
                </h6>
              </label>
            </Col>
            <Col className="align-items-center " style={{ display: "flex" }}>
              <Col className="align-items-center " style={{ display: "flex", flexDirection: "column" }}>
                <b>Columns that will be dropped</b>
                <div className="card" style={{ maxHeight: "3rem", overflow: "auto", width: "100%", background: "transparent", minHeight: "3rem" }}>
                  <div style={{ margin: "0.5rem" }}>
                    <>
                      {columnsToDrop.map((column) => {
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
                  label="Drop columns"
                  onClick={(e) => {
                    setDropType("columns")
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
                  Row threshold of NaN values (%) <b style={{ color: "var(--red-300)" }}>({rowsToDrop.length})</b>
                </h6>
              </label>
            </Col>
            <Col className="align-items-center " style={{ display: "flex" }}>
              <Col className="align-items-center " style={{ display: "flex", flexDirection: "column" }}>
                <b>Rows that will be dropped</b>
                <div className="card" style={{ maxHeight: "3rem", overflow: "auto", width: "100%", background: "transparent", minHeight: "3rem" }}>
                  <div style={{ margin: "0.5rem" }}>
                    <>
                      {rowsToDrop.map((column) => {
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
                  label="Drop rows"
                  onClick={(e) => {
                    setDropType("rows")
                    opCol.current.toggle(e)
                  }}
                ></Button>{" "}
              </Col>
            </Row>
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

export default SimpleCleaningTool
