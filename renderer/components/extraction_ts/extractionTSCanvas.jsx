import React, { useState, useEffect, useContext } from "react"
import DataTableWrapper from "../dataTypeVisualisation/dataTableWrapper"
import { Dropdown } from "primereact/dropdown"
import { readCSV } from "danfojs"
import Button from "react-bootstrap/Button"
import { requestJson } from "../../utilities/requests"
import { WorkspaceContext } from "../workspace/workspaceContext"
import { require } from "ace-builds"

const ExtractionTSCanvas = () => {
  const [csvPath, setCsvPath] = useState("")
  const [dataframe, setDataframe] = useState([])
  const [extractedFeatures, setExtractedFeatures] = useState([])
  const [extractedFeaturesCsvPath, setExtractedFeaturesCsvPath] = useState("")
  const [displayData, setDisplayData] = useState([])
  const [mayProceed, setMayProceed] = useState(false)
  const [selectedColumns, setSelectedColumns] = useState({
    patientIdentifier: "",
    measuredItemIdentifier: "",
    measurementDatetimeStart: "",
    measurementValue: ""
  })
  const { port } = useContext(WorkspaceContext)
  const fs = require("fs").promises

  /**
   *
   * @param {event} event
   *
   * @description
   * Function called when a csv file is upload.
   * Read CSV with Djanfo.js library and set the Djanfo dataframe
   * in the dataframe variable. Sets the displayData according to
   * DataTableWrapper input.
   */
  const onUpload = (event) => {
    if (event.target.files) {
      setCsvPath(event.target.files[0].path)
      readCSV(event.target.files[0]).then((data) => {
        setDisplayData(Array(data.$columns).concat(data.$data))
        setDataframe(data)
      })
    }
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

  const runTSFreshExtraction = () => {
    console.log(csvPath)
    requestJson(
      port,
      "/extraction_ts/TSFresh_extraction",
      {
        selectedColumns: selectedColumns,
        csvPath: csvPath
      },
      (jsonResponse) => {
        console.log("received results:", jsonResponse)
        setExtractedFeaturesCsvPath(jsonResponse["csv_result_path"])
        fs.readFile(
          jsonResponse["csv_result_path"],
          "utf8",
          function (err, data) {
            // Display the file content
            console.log(data)
            console.log(err)
          }
        )
      },
      function (err) {
        console.error(err)
      }
    )
  }

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

  return (
    <div className="overflow_y_auto">
      <h1 className="center_text">Extraction - Time Series</h1>

      <hr></hr>
      <div className="margin_top_bottom_15">
        <div className="center_text">
          {/* Import CSV data */}
          <h2>Import CSV data</h2>
          <Button as="label" htmlFor="fileInput">
            Import a CSV file
          </Button>
          <input
            type="file"
            id="fileInput"
            style={{ display: "none" }}
            accept=".csv"
            onChange={onUpload}
          />
        </div>
      </div>

      <hr></hr>
      <div className="margin_top_bottom_15">
        {/* Display imported data */}
        <div className="center_text">
          <h2>Imported data</h2>
          {displayData.length < 1 && (
            <p>Nothing to show, import a CSV file first.</p>
          )}
        </div>
        {displayData.length > 0 && (
          <div>
            {/* DataTableWrapper is used to display the data */}
            <DataTableWrapper
              data={displayData}
              tablePropsData={{
                paginator: true,
                rows: 5
              }}
              tablePropsColumn={{
                sortable: true
              }}
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
              {displayData.length > 0 ? (
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
              {displayData.length > 0 ? (
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
              Measurement Datetime (Start) : &nbsp;
              {displayData.length > 0 ? (
                <Dropdown
                  value={selectedColumns.measurementDatetimeStart}
                  onChange={(event) =>
                    handleColumnSelect("measurementDatetimeStart", event)
                  }
                  options={dataframe.$columns.filter(
                    (column, index) =>
                      dataframe.$dtypes[index] == "string" &&
                      dataframe[column].dt.$dateObjectArray[0] != "Invalid Date"
                  )}
                  placeholder="Measurement Datetime (Start)"
                />
              ) : (
                <Dropdown placeholder="Measurement Datetime (Start)" disabled />
              )}
            </div>
            <div>
              Measurement value : &nbsp;
              {displayData.length > 0 ? (
                <Dropdown
                  value={selectedColumns.measurementValue}
                  onChange={(event) =>
                    handleColumnSelect("measurementValue", event)
                  }
                  options={dataframe.$columns.filter(
                    (column, index) =>
                      dataframe.$dtypes[index] == "int32" ||
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
          {extractedFeatures.length < 1 && (
            <p>Nothing to show, proceed to extraction first.</p>
          )}
        </div>
        {extractedFeatures.length > 0 && (
          <div>
            {/* DataTableWrapper is used to display the data */}
            <DataTableWrapper
              data={extractedFeatures}
              tablePropsData={{
                paginator: true,
                rows: 5
              }}
              tablePropsColumn={{
                sortable: true
              }}
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default ExtractionTSCanvas
