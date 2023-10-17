import { Dropdown } from "primereact/dropdown"
import { InputNumber } from "primereact/inputnumber"
import { RadioButton } from "primereact/radiobutton"
import React, { useEffect, useState } from "react"

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
const ExtractionTSfresh = ({ dataframe, setExtractionJsonData, setMayProceed, setAreResultsLarge }) => {
  const [featuresOption, setFeaturesOption] = useState("Minimal")
  const [frequency, setFrequency] = useState("Admission")
  const [hourRange, setHourRange] = useState(24)
  const [selectedColumns, setSelectedColumns] = useState({
    patientIdentifier: "",
    admissionIdentifier: "",
    admissionTime: "",
    time: "",
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
   * @param {event} event
   * 
   * @descrition 
   * Function used to tell if the results are too large to be
   * displayed, depending on the features options selected.
   * 
   */
  useEffect(() => {
    setAreResultsLarge(featuresOption !== "Minimal")
  }, [featuresOption])

  /**
   *
   * @description
   * This function checks if all the necessary attributes from
   * selected columns have a value and update allColumnsSelected.
   *
   */
  useEffect(() => {
    if (frequency == "Patient") {
      setMayProceed(selectedColumns.patientIdentifier !== "" && selectedColumns.notesWeight !== "" && selectedColumns.notes !== "")
      setExtractionJsonData({ selectedColumns: selectedColumns, featuresOption: featuresOption, frequency: frequency })
    } else if (frequency == "Admission") {
      setMayProceed(selectedColumns.patientIdentifier !== "" && selectedColumns.notesWeight !== "" && selectedColumns.notes !== "" && selectedColumns.admissionIdentifier !== "" && selectedColumns.admissionTime !== "")
      setExtractionJsonData({ selectedColumns: selectedColumns, featuresOption: featuresOption, frequency: frequency })
    } else if (frequency == "HourRange") {
      setMayProceed(selectedColumns.patientIdentifier !== "" && selectedColumns.notesWeight !== "" && selectedColumns.notes !== "" && selectedColumns.time !== "")
      setExtractionJsonData({ selectedColumns: selectedColumns, featuresOption: featuresOption, frequency: frequency, hourRange: hourRange })
    }
  }, [selectedColumns, featuresOption, frequency, hourRange])

  return (
    <>
      <div className="text-left">
        <div className="flex-container">
          <div>
            {/* Time interval for generation of extracted features */}
            <b>Compute Features by : &nbsp;</b>
            <hr></hr>
            <div>
              <div>
                <RadioButton inputId="admission" name="frequency" value="Admission" onChange={(e) => setFrequency(e.value)} checked={frequency === "Admission"} />
                <label htmlFor="admission">&nbsp; Admission</label>
              </div>
              <div className="margin-top-15">
                <RadioButton inputId="patient" name="frequency" value="Patient" onChange={(e) => setFrequency(e.value)} checked={frequency === "Patient"} />
                <label htmlFor="patient">&nbsp; Patient</label>
              </div>
              <div className="margin-top-15">
                <RadioButton inputId="hourRange" name="frequency" value="HourRange" onChange={(e) => setFrequency(e.value)} checked={frequency === "HourRange"} />
                <label htmlFor="hourRange">&nbsp; Hour Range &nbsp;</label>
                {frequency == "HourRange" && <InputNumber value={hourRange} onValueChange={(e) => setHourRange(e.value)} size={1} showButtons min={1} />}
              </div>
            </div>
          </div>
          <div className="vertical-divider"></div>
          <div>
            {/* Dropdowns for column selection */}
            <b>Select columns corresponding to :</b>
            <hr></hr>
            <div className="margin-top-15">
              Patient Identifier : &nbsp;
              {dataframe && dataframe.$data ? <Dropdown value={selectedColumns.patientIdentifier} onChange={(event) => handleColumnSelect("patientIdentifier", event)} options={dataframe.$columns.filter((column, index) => dataframe.$dtypes[index] == "int32" || (dataframe.$dtypes[index] == "string" && dataframe[column].dt.$dateObjectArray[0] == "Invalid Date"))} placeholder="Patient Identifier" /> : <Dropdown placeholder="Patient Identifier" disabled />}
            </div>
            {frequency == "Admission" && (
              <div>
                <div className="margin-top-15">
                  Admission Identifier : &nbsp;
                  {dataframe && dataframe.$data ? <Dropdown value={selectedColumns.admissionIdentifier} onChange={(event) => handleColumnSelect("admissionIdentifier", event)} options={dataframe.$columns.filter((column, index) => dataframe.$dtypes[index] == "int32" || (dataframe.$dtypes[index] == "string" && dataframe[column].dt.$dateObjectArray[0] == "Invalid Date"))} placeholder="Admission Identifier" /> : <Dropdown placeholder="Admission Identifier" disabled />}
                </div>
                <div className="margin-top-15">
                  Admission Time : &nbsp;
                  {dataframe && dataframe.$data ? <Dropdown value={selectedColumns.admissionTime} onChange={(event) => handleColumnSelect("admissionTime", event)} options={dataframe.$columns.filter((column, index) => dataframe.$dtypes[index] == "string" && dataframe[column].dt.$dateObjectArray[0] != "Invalid Date")} placeholder="Admission Time" /> : <Dropdown placeholder="Admission Time" disabled />}
                </div>
              </div>
            )}
            {frequency == "HourRange" && (
              <div className="margin-top-15">
                Time : &nbsp;
                {dataframe.$data ? <Dropdown value={selectedColumns.time} onChange={(event) => handleColumnSelect("time", event)} options={dataframe.$columns.filter((column, index) => dataframe.$dtypes[index] == "string" && dataframe[column].dt.$dateObjectArray[0] != "Invalid Date")} placeholder="Time" /> : <Dropdown placeholder="Time" disabled />}
              </div>
            )}
            <div className="margin-top-15">
              Measured Item Identifier : &nbsp;
              {dataframe.$data ? <Dropdown value={selectedColumns.measuredItemIdentifier} onChange={(event) => handleColumnSelect("measuredItemIdentifier", event)} options={dataframe.$columns.filter((column, index) => dataframe.$dtypes[index] == "int32" || (dataframe.$dtypes[index] == "string" && dataframe[column].dt.$dateObjectArray[0] == "Invalid Date"))} placeholder="Measured Item Identifier" /> : <Dropdown placeholder="Measured Item Identifier" disabled />}
            </div>
            <div className="margin-top-15">
              Measurement Datetime or Weight : &nbsp;
              {dataframe.$data ? <Dropdown value={selectedColumns.measurementWeight} onChange={(event) => handleColumnSelect("measurementWeight", event)} options={dataframe.$columns.filter((column, index) => dataframe.$dtypes[index] == "int32" || dataframe.$dtypes[index] == "float32" || (dataframe.$dtypes[index] == "string" && dataframe[column].dt.$dateObjectArray[0] != "Invalid Date"))} placeholder="Measurement Datetime or Weight" /> : <Dropdown placeholder="Measurement Datetime or Weight" disabled />}
            </div>
            <div className="margin-top-15">
              Measurement value : &nbsp;
              {dataframe.$data ? <Dropdown value={selectedColumns.measurementValue} onChange={(event) => handleColumnSelect("measurementValue", event)} options={dataframe.$columns.filter((column, index) => dataframe.$dtypes[index] == "int32" || dataframe.$dtypes[index] == "float32")} placeholder="Measurement Value" /> : <Dropdown placeholder="Measurement Value" disabled />}
            </div>
          </div>
          <div className="vertical-divider"></div>
          <div>
            {/* Features to compute */}
            <b>Features to compute :</b>
            <hr></hr>
            <div>
              <RadioButton inputId="minimal" name="featuresOption" value="Minimal" onChange={(e) => setFeaturesOption(e.value)} checked={featuresOption === "Minimal"} />
              <label htmlFor="minimal">&nbsp; Minimal</label>
            </div>
            <div className="margin-top-15">
              <RadioButton inputId="efficient" name="featuresOption" value="Efficient" onChange={(e) => setFeaturesOption(e.value)} checked={featuresOption === "Efficient"} />
              <label htmlFor="efficient">&nbsp; Efficient</label>
            </div>
            <div className="margin-top-15">
              <RadioButton inputId="comprehensive" name="featuresOption" value="Comprehensive" onChange={(e) => setFeaturesOption(e.value)} checked={featuresOption === "Comprehensive"} />
              <label htmlFor="comprehensive">&nbsp; Comprehensive</label>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default ExtractionTSfresh
