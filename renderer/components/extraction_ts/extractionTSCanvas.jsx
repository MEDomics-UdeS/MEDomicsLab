import React, { useState, useEffect } from "react"
import DataTableWrapper from "../dataTypeVisualisation/dataTableWrapper"
import { Dropdown } from "primereact/dropdown"
import { readCSV } from "danfojs"
import Button from "react-bootstrap/Button"

const ExtractionTSCanvas = () => {
  const [dataframe, setDataframe] = useState([])
  const [displayData, setDisplayData] = useState([])
  const [selectedColumns, setSelectedColumns] = useState({
    patientIdentifier: "",
    measuredItemIdentifier: "",
    measurementDatetimeStart: "",
    measurementDatetimeEnd: "",
    measurementValue: ""
  })
  const [allColumnsSelected, setAllColumnsSelected] = useState(false)

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
      readCSV(event.target.files[0]).then((data) => {
        setDisplayData(Array(data.$columns).concat(data.$data))
        setDataframe(data)
      })
    }
  }

  useEffect(() => {
    // Check if all the necessary attributes from selected columns have a value
    const isAllSelected = Object.values(selectedColumns).every(
      (value) => value !== ""
    )
    setAllColumnsSelected(isAllSelected)
  }, [selectedColumns])

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

  return (
    <div className="overflow_y_auto">
      <h1 className="center_text">Extraction - Time Series</h1>

      <hr></hr>
      <div className="margin_top_30">
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
      <div className="margin_top_30">
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
                rows: 10,
                scrollable: true,
                scrollHeight: "400px"
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
        <div className="margin_top_30">
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
              Measurement Datetime (End) : &nbsp;
              {displayData.length > 0 ? (
                <Dropdown
                  value={selectedColumns.measurementDatetimeEnd}
                  onChange={(event) =>
                    handleColumnSelect("measurementDatetimeEnd", event)
                  }
                  options={dataframe.$columns.filter(
                    (column, index) =>
                      dataframe.$dtypes[index] == "string" &&
                      dataframe[column].dt.$dateObjectArray[0] != "Invalid Date"
                  )}
                  placeholder="Measurement Datetime (End)"
                />
              ) : (
                <Dropdown placeholder="Measurement Datetime (End)" disabled />
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
        <div className="margin_top_bottom_30">
          <div className="flex_column_start">
            {/* Time Series Extraction */}
            <h2>Extract time series</h2>
            {/* Button activated only if all necessary columns have been selected */}
            <Button disabled={!allColumnsSelected}>Extract Data</Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ExtractionTSCanvas
