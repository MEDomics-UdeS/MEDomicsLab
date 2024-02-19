import { Carousel } from "primereact/carousel"
import { Dropdown } from "primereact/dropdown"
import { InputNumber } from "primereact/inputnumber"
import { InputSwitch } from "primereact/inputswitch"
import { InputText } from "primereact/inputtext"
import { RadioButton } from "primereact/radiobutton"
import React, { useEffect, useState } from "react"
import { Series } from "danfojs"

/**
 *
 * @param {Danfojs Dataframe} dataframe data to extract
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
  const [columnPrefix, setColumnPrefix] = useState("ts") // column prefix to set in the generated dataframe from extracted features
  const [typesNotNa, setTypesNotNa] = useState([]) // dataframes dtypes if we remove NaN values
  const [isDate, setIsDate] = useState([]) // true if first not na value of a column is date
  const [featuresOption, setFeaturesOption] = useState("Minimal") // features generation option
  const [frequency, setFrequency] = useState("Admission") // frequency choosen for the features generation
  const [hourRange, setHourRange] = useState(24) // hour range in which to generated the features if the frequency is "Hour"
  const [masterTableCompatible, setMasterTableCompatible] = useState(true) // boolean set to true if the extracted features dataset must respect the submaster table format
  const [selectedColumns, setSelectedColumns] = useState({
    // columns names for feature extraction matching a required type
    patientIdentifier: "",
    admissionIdentifier: "",
    admissionTime: "",
    time: "",
    measuredItemIdentifier: "",
    measurementWeight: "",
    measurementValue: ""
  })

  // display options for the carousel
  const responsiveOptions = [
    {
      breakpoint: "1024px",
      numVisible: 1,
      numScroll: 1
    },
    {
      breakpoint: "768px",
      numVisible: 1,
      numScroll: 1
    },
    {
      breakpoint: "560px",
      numVisible: 1,
      numScroll: 1
    }
  ]

  /**
   *
   * @param {Carousel Item} item
   * @returns html content
   *
   * @description
   * Function used to format the carousel data
   */
  const carouselTemplate = (item) => {
    return <div className="centered-carousel-item">{item.content}</div>
  }

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
   * Used to get types from the dataframe without NaN values
   */
  useEffect(() => {
    console.log("dataframe:", dataframe)
    if (dataframe && dataframe.$columns) {
      let types = []
      let dates = []
      Object.keys(dataframe.$columns).forEach((column) => {
        let series = new Series(dataframe.$dataIncolumnFormat[column])
        let notNaSeries = series.dropNa()
        types.push(notNaSeries.$dtypes[0])
        if (notNaSeries.$dtypes[0] == "string" && notNaSeries.dt.$dateObjectArray[0] != "Invalid Date") {
          dates.push(true)
        } else {
          dates.push(false)
        }
      })
      setTypesNotNa(types)
      setIsDate(dates)
    }
  }, [dataframe])

  /**
   *
   * @description
   * This function checks if all the necessary attributes from
   * selected columns have a value and update allColumnsSelected.
   *
   */
  useEffect(() => {
    if (frequency == "Patient" && masterTableCompatible) {
      setMayProceed(selectedColumns.patientIdentifier !== "" && selectedColumns.time !== "" && selectedColumns.measuredItemIdentifier !== "" && selectedColumns.measurementWeight !== "" && selectedColumns.measurementValue !== "")
      setExtractionJsonData({ columnPrefix: columnPrefix, selectedColumns: selectedColumns, featuresOption: featuresOption, frequency: frequency, masterTableCompatible: masterTableCompatible })
    } else if (frequency == "Patient") {
      setMayProceed(selectedColumns.patientIdentifier !== "" && selectedColumns.measuredItemIdentifier !== "" && selectedColumns.measurementWeight !== "" && selectedColumns.measurementValue !== "")
      setExtractionJsonData({ columnPrefix: columnPrefix, selectedColumns: selectedColumns, featuresOption: featuresOption, frequency: frequency, masterTableCompatible: masterTableCompatible })
    } else if (frequency == "Admission") {
      setMayProceed(selectedColumns.patientIdentifier !== "" && selectedColumns.admissionIdentifier !== "" && selectedColumns.admissionTime !== "" && selectedColumns.measuredItemIdentifier !== "" && selectedColumns.measurementWeight !== "" && selectedColumns.measurementValue !== "")
      setExtractionJsonData({ columnPrefix: columnPrefix, selectedColumns: selectedColumns, featuresOption: featuresOption, frequency: frequency, masterTableCompatible: masterTableCompatible })
    } else if (frequency == "HourRange") {
      setMayProceed(selectedColumns.patientIdentifier !== "" && selectedColumns.time !== "" && selectedColumns.measuredItemIdentifier !== "" && selectedColumns.measurementWeight !== "" && selectedColumns.measurementValue !== "")
      setExtractionJsonData({ columnPrefix: columnPrefix, selectedColumns: selectedColumns, featuresOption: featuresOption, frequency: frequency, hourRange: hourRange, masterTableCompatible: masterTableCompatible })
    }
  }, [selectedColumns, featuresOption, frequency, hourRange, masterTableCompatible, columnPrefix])

  // The options for extraction are displayed in a Carousel component
  const carouselItems = [
    {
      key: "1",
      content: (
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
              <RadioButton
                inputId="patient"
                name="frequency"
                value="Patient"
                onChange={(e) => {
                  setFrequency(e.value)
                  setMasterTableCompatible(true)
                }}
                checked={frequency === "Patient"}
              />
              <label htmlFor="patient">&nbsp; Patient</label>
            </div>
            <div className="margin-top-15">
              <RadioButton inputId="hourRange" name="frequency" value="HourRange" onChange={(e) => setFrequency(e.value)} checked={frequency === "HourRange"} />
              <label htmlFor="hourRange">&nbsp; Hour Range &nbsp;</label>
              {frequency == "HourRange" && <InputNumber value={hourRange} onValueChange={(e) => setHourRange(e.value)} size={1} showButtons min={1} />}
            </div>
            <div className="margin-top-30">
              <InputSwitch inputId="masterTableCompatible" checked={masterTableCompatible} onChange={(e) => setMasterTableCompatible(e.value)} tooltip="The master table format may contain less columns in order to enter the MEDprofiles' process." />
              <label htmlFor="masterTableCompatible">&nbsp; Master Table Compatible &nbsp;</label>
            </div>
          </div>
        </div>
      )
    },
    {
      key: "2",
      content: (
        <div>
          {/* Dropdowns for column selection */}
          <b>Select columns corresponding to :</b>
          <hr></hr>
          <div className="margin-top-15">
            Patient Identifier : &nbsp;
            {dataframe && dataframe.$data && typesNotNa.length > 0 ? <Dropdown value={selectedColumns.patientIdentifier} onChange={(event) => handleColumnSelect("patientIdentifier", event)} options={dataframe.$columns.filter((column, index) => typesNotNa[index] == "int32" || (typesNotNa[index] == "string" && isDate[index] == false))} placeholder="Patient Identifier" /> : <Dropdown placeholder="Patient Identifier" disabled />}
          </div>
          {frequency == "Admission" && (
            <div>
              <div className="margin-top-15">
                Admission Identifier : &nbsp;
                {dataframe && dataframe.$data && typesNotNa.length > 0 ? <Dropdown value={selectedColumns.admissionIdentifier} onChange={(event) => handleColumnSelect("admissionIdentifier", event)} options={dataframe.$columns.filter((column, index) => typesNotNa[index] == "int32" || (typesNotNa[index] == "string" && isDate[index] == false))} placeholder="Admission Identifier" /> : <Dropdown placeholder="Admission Identifier" disabled />}
              </div>
              <div className="margin-top-15">
                Admission Time : &nbsp;
                {dataframe && dataframe.$data && typesNotNa.length > 0 ? <Dropdown value={selectedColumns.admissionTime} onChange={(event) => handleColumnSelect("admissionTime", event)} options={dataframe.$columns.filter((column, index) => typesNotNa[index] == "string" && isDate[index] == true)} placeholder="Admission Time" /> : <Dropdown placeholder="Admission Time" disabled />}
              </div>
            </div>
          )}
          {((frequency == "Patient" && masterTableCompatible) || frequency == "HourRange") && (
            <div className="margin-top-15">
              Time : &nbsp;
              {dataframe && dataframe.$data && typesNotNa.length > 0 ? <Dropdown value={selectedColumns.time} onChange={(event) => handleColumnSelect("time", event)} options={dataframe.$columns.filter((column, index) => typesNotNa[index] == "string" && isDate[index] == true)} placeholder="Time" /> : <Dropdown placeholder="Time" disabled />}
            </div>
          )}
          <div className="margin-top-15">
            Measured Item Identifier : &nbsp;
            {dataframe && dataframe.$data && typesNotNa.length > 0 ? <Dropdown value={selectedColumns.measuredItemIdentifier} onChange={(event) => handleColumnSelect("measuredItemIdentifier", event)} options={dataframe.$columns.filter((column, index) => typesNotNa[index] == "int32" || (typesNotNa[index] == "string" && isDate[index] == false))} placeholder="Measured Item Identifier" /> : <Dropdown placeholder="Measured Item Identifier" disabled />}
          </div>
          <div className="margin-top-15">
            Measurement Datetime or Weight : &nbsp;
            {dataframe && dataframe.$data && typesNotNa.length > 0 ? <Dropdown value={selectedColumns.measurementWeight} onChange={(event) => handleColumnSelect("measurementWeight", event)} options={dataframe.$columns.filter((column, index) => typesNotNa[index] == "int32" || typesNotNa[index] == "float32" || (typesNotNa[index] == "string" && isDate[index] == true))} placeholder="Measurement Datetime or Weight" /> : <Dropdown placeholder="Measurement Datetime or Weight" disabled />}
          </div>
          <div className="margin-top-15">
            Measurement value : &nbsp;
            {dataframe && dataframe.$data && typesNotNa.length > 0 ? <Dropdown value={selectedColumns.measurementValue} onChange={(event) => handleColumnSelect("measurementValue", event)} options={dataframe.$columns.filter((column, index) => typesNotNa[index] == "int32" || typesNotNa[index] == "float32")} placeholder="Measurement Value" /> : <Dropdown placeholder="Measurement Value" disabled />}
          </div>
        </div>
      )
    },
    {
      key: "3",
      content: (
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
      )
    },
    {
      key: "4",
      content: (
        <div>
          {/* Text input for column names */}
          <b>Column name prefix : &nbsp;</b>
          <InputText value={columnPrefix} onChange={(e) => handleColumnPrefixChange(e.target.value)} />
        </div>
      )
    }
  ]

  return (
    <>
      <Carousel value={carouselItems} numVisible={1} numScroll={1} responsiveOptions={responsiveOptions} itemTemplate={carouselTemplate} />
    </>
  )
}

export default ExtractionTSfresh
