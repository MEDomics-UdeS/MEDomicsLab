import { Dropdown } from "primereact/dropdown"
import { RadioButton } from 'primereact/radiobutton';
import React,  { useEffect, useState } from "react"

/**
 * 
 * @param {Djanfojs Dataframe} dataframe data to extract
 * @param {Function} setExtractionJsonData function setting data to send to the extraction_ts server
 * @param {Function} setMayProceed function setting the boolean variable mayProceed, telling if the process can be executed
 * @returns {JSX.Element} sub-component of the ExtractionTabularData component
 * 
 * @description 
 * This component is displayed in the ExtractionTabularData component when the user choose "TSfresh"
 * extraction type. It is used to prepare time series extraction using TSfresh library.
 * 
 */
const ExtractionTSfresh = ({dataframe, setExtractionJsonData, setMayProceed}) => {

  const [featuresOption, setFeaturesOption] = useState("Comprehensive")
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
   * 
   */
  const handleColumnSelect = (column, event) => {
    const { value } = event.target
    setSelectedColumns({
      ...selectedColumns,
      [column]: value
    })
  }

  /**
   * 
   * @description
   * This function checks if all the necessary attributes from
   * selected columns have a value and update allColumnsSelected.
   * 
   */
   useEffect(() => {
    const isAllSelected = Object.values(selectedColumns).every(
      (value) => value !== ""
    )
    setMayProceed(isAllSelected)
    setExtractionJsonData({selectedColumns: selectedColumns, featuresOption: featuresOption})
  }, [selectedColumns, featuresOption])


  return (
    <>
      <div className="text-left">
        <div className="flex-container">
          <div>
            {/* Dropdowns for column selection */}
            <b>Select columns corresponding to :</b>
            <hr></hr>
            <div className="margin-top-15">
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
          </div>
          <div className="vertical-divider"></div>
          <div>
            {/* Features to compute */}
            <b>Features to compute :</b> 
            <hr></hr>
            <div className="margin-top-15">
              <RadioButton inputId="comprehensive" name="featuresOption" value="Comprehensive" onChange={(e) => setFeaturesOption(e.value)} checked={featuresOption === "Comprehensive"} />
              <label htmlFor="comprehensive">Comprehensive</label>
            </div>   
            <div>
              <RadioButton inputId="efficient" name="featuresOption" value="Efficient" onChange={(e) => setFeaturesOption(e.value)} checked={featuresOption === "Efficient"} />
              <label htmlFor="efficient">Efficient</label>
            </div> 
            <div>
              <RadioButton inputId="minimal" name="featuresOption" value="Minimal" onChange={(e) => setFeaturesOption(e.value)} checked={featuresOption === "Minimal"} />
              <label htmlFor="minimal">Minimal</label>
            </div>  
          </div> 
        </div>
      </div>
    </>
  )
}

export default ExtractionTSfresh