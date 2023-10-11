import { Dropdown } from "primereact/dropdown"
import { InputNumber } from "primereact/inputnumber"
import { InputText } from "primereact/inputtext"
import { Message } from "primereact/message"
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
 * This component is displayed in the ExtractionTabularData component when the user choose "BioBERT"
 * extraction type. It is used to prepare text notes extraction using BioBERT pre-trained model.
 *
 */
const ExtractionBioBERT = ({ dataframe, setExtractionJsonData, setMayProceed }) => {
  const [columnPrefix, setColumnPrefix] = useState("notes_")
  const [frequency, setFrequency] = useState("Patient")
  const [hourRange, setHourRange] = useState(24)
  const [selectedColumns, setSelectedColumns] = useState({
    patientIdentifier: "",
    admissionIdentifier: "",
    notesWeight: "",
    notes: ""
  })

  /**
   *
   * @param {String} name
   *
   * @description
   * Called when the user change the column prefix.
   *
   */
  const handleColumnPrefixChange = (name) => {
    if (name.match("^[a-zA-Z0-9_]+$") != null) {
      setColumnPrefix(name)
    }
  }

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
    if (frequency == "Admission") {
      setMayProceed(Object.values(selectedColumns).every((value) => value !== ""))
      setExtractionJsonData({ selectedColumns: selectedColumns, columnPrefix: columnPrefix, frequency: frequency, hourRange: hourRange })
    } else {
      setMayProceed(selectedColumns.patientIdentifier !== "" && selectedColumns.notesWeight !== "" && selectedColumns.notes !== "")
      setExtractionJsonData({ selectedColumns: selectedColumns, columnPrefix: columnPrefix, frequency: frequency })
    }
  }, [selectedColumns, frequency])

  return (
    <>
      <div>
        <div className="text-left">
          <div className="flex-container">
            <div>
              {/* Dropdowns for column selection */}
              <b>Select columns corresponding to :</b>
              <hr></hr>
              <div className="margin-top-15">
                Patient Identifier : &nbsp;
                {dataframe && dataframe.$data ? <Dropdown value={selectedColumns.patientIdentifier} onChange={(event) => handleColumnSelect("patientIdentifier", event)} options={dataframe.$columns.filter((column, index) => dataframe.$dtypes[index] == "int32" || dataframe.$dtypes[index] == "string")} placeholder="Patient Identifier" /> : <Dropdown placeholder="Patient Identifier" disabled />}
              </div>
              <div className="margin-top-15">
                Admission Identifier : &nbsp;
                {dataframe && dataframe.$data ? <Dropdown value={selectedColumns.admissionIdentifier} onChange={(event) => handleColumnSelect("admissionIdentifier", event)} options={dataframe.$columns.filter((column, index) => dataframe.$dtypes[index] == "int32" || dataframe.$dtypes[index] == "string")} placeholder="Admission Identifier" /> : <Dropdown placeholder="Admission Identifier" disabled />}
                {selectedColumns.admissionIdentifier == "" && (
                  <div>
                    <Message severity="info" text="Field necessary if Admission is selected." />
                  </div>
                )}
              </div>
              <div className="margin-top-15">
                Notes Weight : &nbsp;
                {dataframe.$data ? <Dropdown value={selectedColumns.notesWeight} onChange={(event) => handleColumnSelect("notesWeight", event)} options={dataframe.$columns.filter((column, index) => dataframe.$dtypes[index] == "int32" || dataframe.$dtypes[index] == "float32" || (dataframe.$dtypes[index] == "string" && dataframe[column].dt.$dateObjectArray[0] != "Invalid Date"))} placeholder="Notes Weight" /> : <Dropdown placeholder="Notes Weight" disabled />}
              </div>
              <div className="margin-top-15">
                Measurement value : &nbsp;
                {dataframe.$data ? <Dropdown value={selectedColumns.notes} onChange={(event) => handleColumnSelect("notes", event)} options={dataframe.$columns.filter((column, index) => dataframe.$dtypes[index] == "string" && dataframe[column].dt.$dateObjectArray[0] == "Invalid Date")} placeholder="Notes" /> : <Dropdown placeholder="Notes" disabled />}
              </div>
            </div>
            <div className="vertical-divider"></div>
            {/* Text input for column names */}
            <div>
              {/* Time interval for generation of extracted features */}
              <b>Compute Features by : &nbsp;</b>
              <hr></hr>
              <div className="margin-top-15">
                <RadioButton inputId="patient" name="frequency" value="Patient" onChange={(e) => setFrequency(e.value)} checked={frequency === "Patient"} />
                <label htmlFor="patient">Patient</label>
              </div>
              <div className="margin-top-15">
                <RadioButton inputId="admission" name="frequency" value="Admission" onChange={(e) => setFrequency(e.value)} checked={frequency === "Admission"} />
                <label htmlFor="admission">Admission</label>
              </div>
              <div className="margin-top-15">
                <RadioButton inputId="hourRange" name="frequency" value="HourRange" onChange={(e) => setFrequency(e.value)} checked={frequency === "HourRange"} />
                <label htmlFor="hourRange">Hour Range &nbsp;</label>
                {frequency == "HourRange" && <InputNumber value={hourRange} onValueChange={(e) => setHourRange(e.value)} size={1} showButtons min={1} />}
              </div>
            </div>
          </div>
        </div>
        <div className="margin-top-15">
          <b>Column name prefix : &nbsp;</b>
          <InputText value={columnPrefix} onChange={(e) => handleColumnPrefixChange(e.target.value)} />
        </div>
      </div>
    </>
  )
}

export default ExtractionBioBERT
