import { Dropdown } from "primereact/dropdown"
import React,  { useEffect, useState } from "react"


const ExtractionTSfresh = ({dataframe, setExtractionJsonData, setMayProceed}) => {

  const [selectedColumns, setSelectedColumns] = useState({
    patientIdentifier: "",
    measuredItemIdentifier: "",
    measurementWeight: "",
    measurementValue: ""
  })  

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
    setExtractionJsonData({selectedColumns: selectedColumns})
  }, [selectedColumns])

  return (
    <>
      {/* Add dropdowns for column selection */}
      <h3>Select columns corresponding to :</h3>
      <div>
        Patient Identifier : &nbsp;
        { dataframe && dataframe.$data ? (
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
            value={selectedColumns.measurementWeight}
            onChange={(event) =>
              handleColumnSelect("measurementWeight", event)
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
    </>
  )
}

export default ExtractionTSfresh