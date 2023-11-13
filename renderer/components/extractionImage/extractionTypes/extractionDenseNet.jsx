import { Carousel } from "primereact/carousel"
import { Checkbox } from "primereact/checkbox"
import { DataFrame } from "danfojs"
import { DataContext } from "../../workspace/dataContext"
import { Dropdown } from "primereact/dropdown"
import { InputNumber } from "primereact/inputnumber"
import { InputSwitch } from "primereact/inputswitch"
import { InputText } from "primereact/inputtext"
import { loadCSVPath } from "../../../utilities/fileManagementUtils"
import React, { useContext, useEffect, useState } from "react"

/**
 *
 * @param {Function} setExtractionJsonData function setting data to send to the extraction_image server
 * @param {Function} setOptionsSelected function setting the boolean variable setOptionsSelected, telling if the choosen options are convenient for the extraction
 * @returns {JSX.Element} sub-component of the ExtractionJPG component
 *
 * @description
 * This component is displayed in the ExtractionJPG component when the user choose "DenseNet"
 * extraction type. It is used to select options for the DenseNet extraction.
 *
 */
const ExtractionDenseNet = ({ folderDepth, setExtractionJsonData, setOptionsSelected }) => {
  const [columnPrefix, setColumnPrefix] = useState("img")
  const [dataframe, setDataframe] = useState(null) // danfojs dataframe from the selected csv
  const [datasetList, setDatasetList] = useState([]) // list of available datasets
  const [masterTableCompatible, setMasterTableCompatible] = useState(true)
  const [parsePatientIdAsInt, setParsePatientIdAsInt] = useState(false)
  const [patientIdentifierLevel, setPatientIdentifierLevel] = useState(1)
  const [selectedFeaturesToGenerate, setSelectedFeaturesToGenerate] = useState(["denseFeatures"])
  const [selectedColumns, setSelectedColumns] = useState({
    filename: "",
    date: ""
  })
  const [selectedDataset, setSelectedDataset] = useState(null) // dataset choosen that must associate dates to filenames
  const [selectedWeights, setSelectedWeights] = useState("densenet121-res224-chex")
  const [weightsList] = useState(["densenet121-res224-chex", "densenet121-res224-pc", "densenet121-res224-nih", "densenet121-res224-rsna", "densenet121-res224-all", "densenet121-res224-mimic_nb", "densenet121-res224-mimic_ch"])
  const { globalData } = useContext(DataContext) // we get the global data from the context to retrieve the directory tree of the workspace, thus retrieving the data files

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
   * @param {DataContext} dataContext
   *
   * @description
   * This functions get all files from the DataContext and update datasetList.
   *
   */
  function getDatasetListFromDataContext(dataContext) {
    let keys = Object.keys(dataContext)
    let datasetListToShow = []
    keys.forEach((key) => {
      if (dataContext[key].type !== "folder") {
        datasetListToShow.push(dataContext[key])
      }
    })
    setDatasetList(datasetListToShow)
  }

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
   * @param {event} e
   *
   * @description
   * Called when dataset is selected
   */
  const onDatasetSelected = (e) => {
    let medobject = e.value
    setSelectedDataset(medobject)
    loadCSVPath(medobject.path, (data) => {
      setDataframe(new DataFrame(data))
    })
  }

  /**
   *
   * @param {event} e
   *
   * @description
   * Called when features checkbox are checked / unchecked
   */
  const onFeaturesChange = (e) => {
    let selectedFeatures = [...selectedFeaturesToGenerate]

    if (e.checked) selectedFeatures.push(e.value)
    else selectedFeatures = selectedFeatures.filter((feature) => feature !== e.value)

    setSelectedFeaturesToGenerate(selectedFeatures)
  }

  // Called when options are modified
  useEffect(() => {
    if (selectedWeights != "" && selectedFeaturesToGenerate.length > 0 && (!masterTableCompatible || (masterTableCompatible && selectedColumns.filename !== "" && selectedColumns.date !== ""))) {
      setOptionsSelected(true)
    } else {
      setOptionsSelected(false)
    }
    setExtractionJsonData({ selectedWeights: selectedWeights, selectedFeaturesToGenerate: selectedFeaturesToGenerate, masterTableCompatible: masterTableCompatible, patientIdentifierLevel: patientIdentifierLevel, selectedColumns: selectedColumns, selectedDataset: selectedDataset?.path, parsePatientIdAsInt: parsePatientIdAsInt, columnPrefix: columnPrefix })
  }, [selectedWeights, selectedFeaturesToGenerate, masterTableCompatible, patientIdentifierLevel, selectedColumns, selectedDataset, parsePatientIdAsInt, columnPrefix])

  // Update the patient identifier level to minimum while folder depth is updated
  useEffect(() => {
    setPatientIdentifierLevel(1)
  }, [folderDepth])

  // Called while the datacontext is updated in order to reload csv files
  useEffect(() => {
    getDatasetListFromDataContext(globalData)
  }, [globalData])

  // The options for extraction are displayed in a Carousel component
  const carouselItems = [
    {
      key: "1",
      content: (
        <div>
          {/* DenseNet Weights */}
          <b>Select your model weights &nbsp;</b>
          <hr></hr>
          <div className="margin-top-15">
            <Dropdown value={selectedWeights} options={weightsList} onChange={(event) => setSelectedWeights(event.value)} placeholder="Select your model weights" />
          </div>
        </div>
      )
    },
    {
      key: "2",
      content: (
        <div>
          {/* Features to generate */}
          <b>Select the features you want to generate &nbsp;</b>
          <hr></hr>
          <div className="margin-top-15">
            <Checkbox value={"denseFeatures"} onChange={onFeaturesChange} checked={selectedFeaturesToGenerate.some((item) => item === "denseFeatures")} />
            &nbsp; DenseFeatures
          </div>
          <div className="margin-top-15">
            <Checkbox value={"predictions"} onChange={onFeaturesChange} checked={selectedFeaturesToGenerate.some((item) => item === "predictions")} />
            &nbsp; Predictions
          </div>
        </div>
      )
    },
    {
      key: "3",
      content: (
        <div>
          {/* Master Table compatible */}
          <b>Format the dataset as master table &nbsp;</b>
          <hr></hr>
          <div className="margin-top-15">
            <InputSwitch inputId="masterTableCompatible" checked={masterTableCompatible} onChange={(e) => setMasterTableCompatible(e.value)} tooltip="The master table format may contain less/different columns in order to enter the MEDprofiles' process." />
            <label htmlFor="masterTableCompatible">&nbsp; Master Table Compatible &nbsp;</label>
          </div>
          {masterTableCompatible && (
            <>
              <div className="margin-top-15">
                Patient Identifier folder level : &nbsp;
                <InputNumber value={patientIdentifierLevel} onValueChange={(e) => setPatientIdentifierLevel(e.value)} size={1} showButtons min={1} max={folderDepth} />
              </div>
              <div className="margin-top-15">
                <Checkbox value={"parse"} onChange={(e) => setParsePatientIdAsInt(e.checked)} checked={parsePatientIdAsInt == true} />
                <label htmlFor="parse">&nbsp; Parse patients ID as integers &nbsp;</label>
              </div>
              <div className="margin-top-15">
                Select a CSV file associating image filenames to dates : &nbsp;
                {datasetList.length > 0 ? <Dropdown value={selectedDataset} options={datasetList.filter((value) => value.extension === "csv")} optionLabel="name" onChange={(event) => onDatasetSelected(event)} placeholder="Select a dataset" /> : <Dropdown placeholder="No CSV file to show" disabled />}
              </div>
              <div className="margin-top-15">
                <div className="margin-top-15">
                  Filename column : &nbsp;
                  {dataframe && dataframe.$data ? <Dropdown value={selectedColumns.filename} onChange={(event) => handleColumnSelect("filename", event)} options={dataframe.$columns.filter((column, index) => dataframe.$dtypes[index] == "string" && dataframe[column].dt.$dateObjectArray[0] == "Invalid Date")} placeholder="Filename" /> : <Dropdown placeholder="Filename" disabled />}
                </div>
                <div className="margin-top-15">
                  Date column : &nbsp;
                  {dataframe && dataframe.$data ? <Dropdown value={selectedColumns.date} onChange={(event) => handleColumnSelect("date", event)} options={dataframe.$columns.filter((column, index) => dataframe.$dtypes[index] == "string" && dataframe[column].dt.$dateObjectArray[0] != "Invalid Date")} placeholder="Date" /> : <Dropdown placeholder="Date" disabled />}
                </div>
              </div>
            </>
          )}
        </div>
      )
    },
    {
      key: "4",
      content: (
        <div>
          {/* Text input for column names */}
          <div>
            <b>Column name prefix : &nbsp;</b>
            <InputText value={columnPrefix} onChange={(e) => handleColumnPrefixChange(e.target.value)} />
          </div>
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

export default ExtractionDenseNet
