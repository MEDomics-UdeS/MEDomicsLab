import React, { useState } from "react"
import DataTableWrapper from "../dataTypeVisualisation/dataTableWrapper"
import { Dropdown } from "primereact/dropdown"
import { readCSV } from "danfojs"

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

  const onUpload = (event) => {
    if (event.target.files) {
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

  return (
    <div>
      <h1>Extraction - Time Series</h1>

      {/* Import CSV data */}
      <input type="file" accept=".csv" onChange={onUpload} />

      {/* Display imported data */}
      <h2>Imported data</h2>
      {displayData.length < 1 && (
        <p>Nothing to show, import a CSV file first.</p>
      )}
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
          {/* Add dropdowns for column selection */}
          <h2>Select columns corresponding to :</h2>
          <div>
            <div>
              Patient Identifier : &nbsp;
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
            </div>
            <div>
              Measured Item Identifier : &nbsp;
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
            </div>
            <div>
              Measurement Datetime (Start) : &nbsp;
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
            </div>
            <div>
              Measurement Datetime (End) : &nbsp;
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
            </div>
            <div>
              Measurement value : &nbsp;
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
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ExtractionTSCanvas
