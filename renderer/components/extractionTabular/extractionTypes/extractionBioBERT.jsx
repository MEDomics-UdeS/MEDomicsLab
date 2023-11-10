import { Card } from "primereact/card"
import { DataContext } from "../../workspace/dataContext"
import { Dropdown } from "primereact/dropdown"
import { InputNumber } from "primereact/inputnumber"
import { InputSwitch } from "primereact/inputswitch"
import { InputText } from "primereact/inputtext"
import MedDataObject from "../../workspace/medDataObject"
import { Message } from "primereact/message"
import { RadioButton } from "primereact/radiobutton"
import React, { useContext, useEffect, useState } from "react"

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
  const [columnPrefix, setColumnPrefix] = useState("notes")
  const [frequency, setFrequency] = useState("Note")
  const [hourRange, setHourRange] = useState(24)
  const [isModelAvailable, setIsModelAvailable] = useState(false)
  const [masterTableCompatible, setMasterTableCompatible] = useState(true)
  const [selectedColumns, setSelectedColumns] = useState({
    patientIdentifier: "",
    admissionIdentifier: "",
    admissionTime: "",
    notesWeight: "",
    notes: "",
    time: ""
  })

  const { globalData } = useContext(DataContext)

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
   * @param {DataContext} dataContext
   *
   * @description
   * This functions is used to check if the model is contained in the DATA folder
   *
   */
  function isBioBERTAvailable(dataContext) {
    let keys = Object.keys(dataContext)
    keys.forEach((key) => {
      if (dataContext[key].name !== "config.json" && dataContext[key].path.includes("DATA") && dataContext[key].path.includes("pretrained_bert_tf") && dataContext[key].path.includes("biobert_pretrain_output_all_notes_150000")) {
        setIsModelAvailable(true)
      }
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
    if (frequency == "Patient") {
      setMayProceed(isModelAvailable == true && selectedColumns.patientIdentifier !== "" && selectedColumns.notesWeight !== "" && selectedColumns.notes !== "")
      setExtractionJsonData({ selectedColumns: selectedColumns, columnPrefix: columnPrefix, frequency: frequency, masterTableCompatible: masterTableCompatible })
    } else if (frequency == "Admission") {
      setMayProceed(isModelAvailable == true && selectedColumns.patientIdentifier !== "" && selectedColumns.notesWeight !== "" && selectedColumns.notes !== "" && selectedColumns.admissionIdentifier !== "" && selectedColumns.admissionTime !== "")
      setExtractionJsonData({ selectedColumns: selectedColumns, columnPrefix: columnPrefix, frequency: frequency, masterTableCompatible: masterTableCompatible })
    } else if (frequency == "HourRange") {
      setMayProceed(isModelAvailable == true && selectedColumns.patientIdentifier !== "" && selectedColumns.notesWeight !== "" && selectedColumns.notes !== "" && selectedColumns.time !== "")
      setExtractionJsonData({ selectedColumns: selectedColumns, columnPrefix: columnPrefix, frequency: frequency, hourRange: hourRange, masterTableCompatible: masterTableCompatible })
    } else if (frequency == "Note") {
      setMayProceed(isModelAvailable == true && selectedColumns.patientIdentifier !== "" && selectedColumns.notes !== "" && selectedColumns.time !== "")
      setExtractionJsonData({ selectedColumns: selectedColumns, columnPrefix: columnPrefix, frequency: frequency, masterTableCompatible: masterTableCompatible })
    }
  }, [selectedColumns, frequency, hourRange, masterTableCompatible])

  // Called when data in DataContext is updated, in order to updated datasetList
  useEffect(() => {
    if (globalData !== undefined) {
      isBioBERTAvailable(globalData)
    }
  }, [globalData])

  /**
   *
   * @description
   * This function update the workspace data object while we load
   * the extractionBioBERT page.
   *
   */
  useEffect(() => {
    MedDataObject.updateWorkspaceDataObject()
  }, [])

  return (
    <>
      <div>
        <div>{isModelAvailable == false && <Message severity="warn" text="You must have download the pretrained_bert_tf folder in workspace DATA to proceed" />}</div>
        <div className="text-left margin-top-15">
          <div className="flex-container">
            <div>
              {/* Time interval for generation of extracted features */}
              <b>Compute Features by : &nbsp;</b>
              <hr></hr>
              <div className="margin-top-15">
                <RadioButton
                  inputId="note"
                  name="frequency"
                  value="Note"
                  onChange={(e) => {
                    setFrequency(e.value)
                    setMasterTableCompatible(true)
                  }}
                  checked={frequency === "Note"}
                />
                <label htmlFor="note">&nbsp; Notes</label>
              </div>
              <div className="margin-top-15">
                <Card subTitle="MIMIC-HAIM specific">
                  <div>
                    <RadioButton inputId="patient" name="frequency" value="Patient" onChange={(e) => setFrequency(e.value)} checked={frequency === "Patient"} />
                    <label htmlFor="patient">&nbsp; Patient</label>
                  </div>
                  <div className="margin-top-15">
                    <RadioButton inputId="admission" name="frequency" value="Admission" onChange={(e) => setFrequency(e.value)} checked={frequency === "Admission"} />
                    <label htmlFor="admission">&nbsp; Admission</label>
                  </div>
                  <div className="margin-top-15">
                    <RadioButton inputId="hourRange" name="frequency" value="HourRange" onChange={(e) => setFrequency(e.value)} checked={frequency === "HourRange"} />
                    <label htmlFor="hourRange">&nbsp; Hour Range &nbsp;</label>
                    {frequency == "HourRange" && <InputNumber value={hourRange} onValueChange={(e) => setHourRange(e.value)} size={1} showButtons min={1} />}
                  </div>
                </Card>
              </div>
              <div className="margin-top-30">
                <InputSwitch inputId="masterTableCompatible" disabled={frequency === "Note"} checked={masterTableCompatible} onChange={(e) => setMasterTableCompatible(e.value)} tooltip="The master table format may contain less columns in order to enter the MEDprofiles' process." />
                <label htmlFor="masterTableCompatible">&nbsp; Master Table Compatible &nbsp;</label>
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
              {(frequency == "HourRange" || frequency == "Note" || (frequency == "Patient" && masterTableCompatible)) && (
                <div className="margin-top-15">
                  Time : &nbsp;
                  {dataframe.$data ? <Dropdown value={selectedColumns.time} onChange={(event) => handleColumnSelect("time", event)} options={dataframe.$columns.filter((column, index) => dataframe.$dtypes[index] == "string" && dataframe[column].dt.$dateObjectArray[0] != "Invalid Date")} placeholder="Time" /> : <Dropdown placeholder="Time" disabled />}
                </div>
              )}
              {frequency != "Note" && (
                <div className="margin-top-15">
                  Notes Weight : &nbsp;
                  {dataframe.$data ? <Dropdown value={selectedColumns.notesWeight} onChange={(event) => handleColumnSelect("notesWeight", event)} options={dataframe.$columns.filter((column, index) => dataframe.$dtypes[index] == "int32" || dataframe.$dtypes[index] == "float32" || (dataframe.$dtypes[index] == "string" && dataframe[column].dt.$dateObjectArray[0] != "Invalid Date"))} placeholder="Notes Weight" /> : <Dropdown placeholder="Notes Weight" disabled />}
                </div>
              )}
              <div className="margin-top-15">
                Notes : &nbsp;
                {dataframe.$data ? <Dropdown value={selectedColumns.notes} onChange={(event) => handleColumnSelect("notes", event)} options={dataframe.$columns.filter((column, index) => dataframe.$dtypes[index] == "string" && dataframe[column].dt.$dateObjectArray[0] == "Invalid Date")} placeholder="Notes" /> : <Dropdown placeholder="Notes" disabled />}
              </div>
            </div>
          </div>
        </div>
        <div className="margin-top-15">
          {/* Text input for column names */}
          <b>Column name prefix : &nbsp;</b>
          <InputText value={columnPrefix} onChange={(e) => handleColumnPrefixChange(e.target.value)} />
        </div>
      </div>
    </>
  )
}

export default ExtractionBioBERT
