import React, { useState } from "react"
import DataTableWrapper from "../dataTypeVisualisation/dataTableWrapper"
import { Button } from "react-bootstrap"
import { Dropdown } from "primereact/dropdown"
import { readCSV, DataFrame } from "danfojs"

const ExtractionTSCanvas = () => {
  const [dataframe, setDataframe] = useState([])
  const [displayData, setDisplayData] = useState([])
  const [selectedColumns, setSelectedColumns] = useState({
    patientIdentifier: "",
    measuredItemIdentifier: "",
    measurementDatetime: "",
    measurementValue: ""
  })

  const onUpload = (event) => {
    if (event.target.files) {
      readCSV(event.target.files[0]).then((data) => {
        setDisplayData(Array(data.$columns).concat(data.$data))
        setDataframe(data)
        console.log(data)
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
  /* const handleColumnSelect = (column, event) => {
    const { value } = event.target
    setSelectedColumns({
      ...selectedColumns,
      [column]: value
    })
  } */

  return (
    <div>
      <h1>Extraction - Time Series</h1>
      <input type="file" accept=".csv" onChange={onUpload} />

      {/* <div>
        <DropzoneComponent whenUploaded={onUpload}>
          <Button style={{ alignItems: "flex-end", marginInline: "2%" }}>
            Import a CSV file
          </Button>
        </DropzoneComponent>
      </div>
      */}
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
          {/* <h2>Select columns corresponding to :</h2>
          <div>
            <div>
              Patient Identifier : &nbsp;
              <Dropdown
                value={selectedColumns.patientIdentifier}
                onChange={(event) =>
                  handleColumnSelect("patientIdentifier", event)
                }
                options={Object.keys(displayData[0]).map((column) => ({
                  value: displayData[0][column],
                  label: displayData[0][column]
                }))}
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
                options={Object.keys(displayData[0]).map((column) => ({
                  value: displayData[0][column],
                  label: displayData[0][column]
                }))}
                placeholder="Measured Item Identifier"
              />
            </div>
            <div>
              Measurement Datetime : &nbsp;
              <Dropdown
                value={selectedColumns.measurementDatetime}
                onChange={(event) =>
                  handleColumnSelect("measurementDatetime", event)
                }
                options={Object.keys(displayData[0]).map((column) => ({
                  value: displayData[0][column],
                  label: displayData[0][column]
                }))}
                placeholder="Measurement Datetime"
              />
            </div>
            <div>
              Measurement value : &nbsp;
              <Dropdown
                value={selectedColumns.measurementValue}
                onChange={(event) =>
                  handleColumnSelect("measurementValue", event)
                }
                options={Object.keys(displayData[0]).map((column) => ({
                  value: displayData[0][column],
                  label: displayData[0][column]
                }))}
                placeholder="Measurement Value"
              />
            </div>
          </div>*/}
        </div>
      )}
    </div>
  )
}

export default ExtractionTSCanvas
