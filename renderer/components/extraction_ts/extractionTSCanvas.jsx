import React, { useState, useEffect, useContext } from "react"
import { DataContext } from "../workspace/dataContext"
import DataTableFromContext from "../mainPages/dataComponents/dataTableFromContext"
import { Dropdown } from "primereact/dropdown"
import { DataFrame } from "danfojs"
import Button from "react-bootstrap/Button"
import { requestJson } from "../../utilities/requests"
import { WorkspaceContext } from "../workspace/workspaceContext"
import MedDataObject from "../workspace/medDataObject"
import { InputText } from "primereact/inputtext";

const ExtractionTSCanvas = () => {
  const [isDatasetLoaded, setIsDatasetLoaded] = useState(false)
  const [csvPath, setCsvPath] = useState("")
  const [csvResultPath, setCsvResultPath] = useState("")
  const [dataframe, setDataframe] = useState([])
  const [datasetList, setDatasetList] = useState([])
  const [filename, setFilename] = useState("tmp_extracted_features.csv")
  const [mayProceed, setMayProceed] = useState(false)
  const [resultDataset, setResultDataset] = useState(null)
  const [selectedColumns, setSelectedColumns] = useState({
    patientIdentifier: "",
    measuredItemIdentifier: "",
    measurementDatetimeStart: "",
    measurementValue: ""
  })
  const [selectedDataset, setSelectedDataset] = useState(null)
  const { globalData } = useContext(DataContext) // We get the global data from the context to retrieve the directory tree of the workspace, thus retrieving the data files
  const { port } = useContext(WorkspaceContext)


  function getDatasetListFromDataContext(dataContext) {
    let keys = Object.keys(dataContext)
    let datasetListToShow = []
    keys.forEach((key) => {
      if (dataContext[key].type !== "folder") {
        datasetListToShow.push(dataContext[key])
      }
    })
    setDatasetList(datasetListToShow)
  }

  const datasetSelected = (dataset) => {
    setSelectedDataset(dataset)    
  }

    /**
   *
   * @param {string} column
   * @param {event} event
   *
   * @description
   * Function used to attribute column values from selectors
   */
  const handleColumnSelect = (column, event) => {
    const { value } = event.target
    setSelectedColumns({
      ...selectedColumns,
      [column]: value
    })
  }

  const handleFilenameChange = (name) => {
    if (name.match("\\w+.csv") != null) {
      setFilename(name)
    }     
  }
  
  const runTSFreshExtraction = () => {
    requestJson(
      port,
      "/extraction_ts/TSFresh_extraction",
      {
        selectedColumns: selectedColumns,
        csvPath: csvPath,
        filename: filename
      },
      (jsonResponse) => {
        console.log("received results:", jsonResponse)
        setCsvResultPath(jsonResponse['csv_result_path'])
        MedDataObject.updateWorkspaceDataObject()
      },
      function (err) {
        console.error(err)
      }
    )
  }

  useEffect(() => {
    if (datasetList.length > 0) {
      datasetList.forEach((dataset) => {
        if (dataset.path == csvResultPath) {
          setResultDataset(dataset)
        }
      })
    }
  }, [datasetList])

  useEffect(() => {
    if (globalData !== undefined) {
      getDatasetListFromDataContext(globalData)
    }
  }, [globalData])


  /**
   * @description
   * This function checks if all the necessary attributes from
   * selected columns have a value and update allColumnsSelected.
   */
  useEffect(() => {
    const isAllSelected = Object.values(selectedColumns).every(
      (value) => value !== ""
    )
    setMayProceed(isAllSelected)
  }, [selectedColumns])

  useEffect(() => {
    if (selectedDataset && selectedDataset.data && selectedDataset.path) {
      setCsvPath(selectedDataset.path)
      setDataframe(new DataFrame(selectedDataset.data))
      console.log(dataframe)
    }
  }, [isDatasetLoaded])

  
  return (
    <div className="overflow_y_auto">
      <h1 className="center_text">Extraction - Time Series</h1>

      <hr></hr>
      <div className="margin_top_bottom_15">
        <div className="center_text">
          {/* Select CSV data */}
          <h2>Select CSV data</h2>
          {datasetList.length > 0 ? (
                <Dropdown
                  value={selectedDataset}
                  options={datasetList.filter(
                    (value) =>
                      value.extension == "csv"
                  )}
                  optionLabel="name"
                  onChange={(event) =>
                    datasetSelected(event.value)
                  }
                  placeholder="Select a dataset"
                />
              ) : (
                <Dropdown placeholder="No dataset to show" disabled />
              )}
        </div>
      </div>

      <hr></hr>
      <div className="margin_top_bottom_15">
        {/* Display selected data */}
        <div className="center_text">
          <h2>Selected data</h2>
          {!selectedDataset && (
            <p>Nothing to show, select a CSV file first.</p>
          )}
        </div>
        {selectedDataset && (
          <div>
            <DataTableFromContext
              MedDataObject={selectedDataset}
              tablePropsData={{ size: "small", paginator:true, rows: 5 }}
              tablePropsColumn={{
                sortable: true
              }}
              setIsDatasetLoaded = {setIsDatasetLoaded}
            />
          </div>
        )}
      </div>

      <hr></hr>
      <div className="flex_space_around">
        <div className="margin_top_bottom_15">
          <div className="flex_column_start">
            {/* Add dropdowns for column selection */}
            <h2>Select columns corresponding to :</h2>
            <div>
              Patient Identifier : &nbsp;
              {dataframe.$data ? (
                <Dropdown
                  value={selectedColumns.patientIdentifier}
                  onChange={(event) =>
                    handleColumnSelect("patientIdentifier", event)
                  }
                  options={dataframe.$columns.filter(
                    (column, index) =>
                      dataframe.$dtypes[index] == "int32" ||
                      dataframe.$dtypes[index] == "string"
                  )}
                  placeholder="Patient Identifier"
                />
              ) : (
                <Dropdown placeholder="Patient Identifier" disabled />
              )}
            </div>
            <div>
              Measured Item Identifier : &nbsp;
              {dataframe.$data ? (
                <Dropdown
                  value={selectedColumns.measuredItemIdentifier}
                  onChange={(event) =>
                    handleColumnSelect("measuredItemIdentifier", event)
                  }
                  options={dataframe.$columns.filter(
                    (column, index) =>
                      dataframe.$dtypes[index] == "int32" ||
                      dataframe.$dtypes[index] == "string"
                  )}
                  placeholder="Measured Item Identifier"
                />
              ) : (
                <Dropdown placeholder="Measured Item Identifier" disabled />
              )}
            </div>
            <div>
              Measurement Datetime or Weight : &nbsp;
              {dataframe.$data ? (
                <Dropdown
                  value={selectedColumns.measurementDatetimeStart}
                  onChange={(event) =>
                    handleColumnSelect("measurementDatetimeStart", event)
                  }
                  options={dataframe.$columns.filter(
                    (column, index) =>
                      dataframe.$dtypes[index] == "int32" ||
                      dataframe.$dtypes[index] == "float32" ||
                      (dataframe.$dtypes[index] == "string" &&
                      dataframe[column].dt.$dateObjectArray[0] != "Invalid Date")
                  )}
                  placeholder="Measurement Datetime or Weight"
                />
              ) : (
                <Dropdown placeholder="Measurement Datetime or Weight" disabled />
              )}
            </div>
            <div>
              Measurement value : &nbsp;
              {dataframe.$data ? (
                <Dropdown
                  value={selectedColumns.measurementValue}
                  onChange={(event) =>
                    handleColumnSelect("measurementValue", event)
                  }
                  options={dataframe.$columns.filter(
                    (column, index) =>
                      dataframe.$dtypes[index] == "int32" ||
                      dataframe.$dtypes[index] == "float32" ||
                      dataframe.$dtypes[index] == "float32"
                  )}
                  placeholder="Measurement Value"
                />
              ) : (
                <Dropdown placeholder="Measurement Value" disabled />
              )}
            </div>
          </div>
        </div>

        <div className="vertical_divider"></div>
        <div className="margin_top_bottom_15">
          <div className="flex_column_start">
            {/* Time Series Extraction */}
            <h2>Extract time series</h2>
            <div>
            Save extracted features as : &nbsp;
            <InputText value={filename} onChange={(e) => handleFilenameChange(e.target.value)} />
            </div>
            {/* Button activated only if all necessary columns have been selected */}
            <Button disabled={!mayProceed} onClick={runTSFreshExtraction}>
              Extract Data
            </Button>
          </div>
        </div>
      </div>

      <hr></hr>
      <div className="margin_top_bottom_15">
        {/* Display extracted data */}
        <div className="center_text">
          <h2>Extracted data</h2>
          {!resultDataset && (
            <p>Nothing to show, proceed to extraction first.</p>
          )}
        </div>
        {resultDataset && (
          <div>
            <DataTableFromContext
              MedDataObject={resultDataset}
              tablePropsData={{ size: "small", paginator:true, rows: 5 }}
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default ExtractionTSCanvas
