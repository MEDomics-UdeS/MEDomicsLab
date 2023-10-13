import Button from "react-bootstrap/Button"
import { DataContext } from "../workspace/dataContext"
import { DataFrame } from "danfojs"
import DataTableFromContext from "../mainPages/dataComponents/dataTableFromContext"
import { Dropdown } from "primereact/dropdown"
import ExtractionBioBERT from "./extractionTypes/extractionBioBERT"
import ExtractionTSfresh from "./extractionTypes/extractionTSfresh"
import { InputText } from "primereact/inputtext"
import MedDataObject from "../workspace/medDataObject"
import { ProgressBar } from "primereact/progressbar"
import React, { useState, useEffect, useContext } from "react"
import { requestJson } from "../../utilities/requests"
import { toast } from "react-toastify"
import { WorkspaceContext } from "../workspace/workspaceContext"

/**
 *
 * @param {List} extractionTypeList list containing possible types of extraction
 * @returns {JSX.Element} a page
 *
 * @description
 * This component is a general page used for tabular data extraction (time series and text notes).
 * Its composition depend on the type of extraction choosen.
 *
 */
const ExtractionTabularData = ({ extractionTypeList, serverUrl }) => {
  const [csvPath, setCsvPath] = useState("") // csv path of data to extract
  const [csvResultPath, setCsvResultPath] = useState("") // csv path of extracted data
  const [dataframe, setDataframe] = useState([]) // djanfo dataframe of data to extract
  const [datasetList, setDatasetList] = useState([]) // list of available datasets in DATA folder
  const [extractionFunction, setExtractionFunction] = useState(extractionTypeList[0] + "_extraction") // name of the function to use for extraction
  const [extractionProgress, setExtractionProgress] = useState(0) // advancement state in the extraction function
  const [extractionStep, setExtractionStep] = useState("") // current step in the extraction function
  const [extractionJsonData, setExtractionJsonData] = useState({}) // json data depending on extractionType
  const [extractionType, setExtractionType] = useState(extractionTypeList[0]) // extraction type
  const [filename, setFilename] = useState("tmp_extracted_features.csv") // name of the csv file containing extracted data
  const [isDatasetLoaded, setIsDatasetLoaded] = useState(false) // boolean set to false every time we reload a dataset for data to extract
  const [isResultDatasetLoaded, setIsResultDatasetLoaded] = useState(false) // boolean set to false every time we reload an extracted data dataset
  const [mayProceed, setMayProceed] = useState(false) // boolean set to true if all informations about the extraction (depending on extractionType) have been completed
  const [resultDataset, setResultDataset] = useState(null) // dataset of extracted data used to be display
  const [selectedDataset, setSelectedDataset] = useState(null) // dataset of data to extract used to be display
  const [showProgressBar, setShowProgressBar] = useState(false) // wether to show or not the extraction progressbar

  const { globalData } = useContext(DataContext) // we get the global data from the context to retrieve the directory tree of the workspace, thus retrieving the data files
  const { port } = useContext(WorkspaceContext) // we get the port for server connexion

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
   * @param {CSV File} dataset
   *
   * @description
   * Called when the user select a dataset.
   *
   */
  const datasetSelected = (dataset) => {
    setSelectedDataset(dataset)
    setIsDatasetLoaded(false)
  }

  /**
   *
   * @param {String} name
   *
   * @description
   * Called when the user change the name under which the extracted data
   * file will be saved.
   *
   */
  const handleFilenameChange = (name) => {
    if (name.match("^[a-zA-Z0-9_]+.csv$") != null) {
      setFilename(name)
    }
  }

  /**
   *
   * @param {String} value
   *
   * @description
   * Called when the user select an extraction type.
   *
   */
  const onChangeExtractionType = (value) => {
    setExtractionType(value)
    setExtractionFunction(value + "_extraction")
  }

  /**
   *
   * @description
   * Run extraction depending on the choosen extraction type, on the extraction_ts server.
   * Update the progress bar depending on the extraction execution.
   *
   */
  const runExtraction = () => {
    setMayProceed(false)
    setShowProgressBar(true)
    // Progress bar update
    let progressInterval = setInterval(() => {
      requestJson(
        port,
        serverUrl + "progress",
        {},
        (jsonResponse) => {
          if (jsonResponse["progress"] >= 100) {
            clearInterval(progressInterval)
          } else {
            setExtractionProgress(jsonResponse["progress"])
            setExtractionStep(jsonResponse["step"])
          }
        },
        function (err) {
          console.error(err)
          clearInterval(progressInterval)
        }
      )
    }, 1000)
    // Run extraction process
    requestJson(
      port,
      serverUrl + extractionFunction,
      {
        relativeToExtractionType: extractionJsonData,
        csvPath: csvPath,
        filename: filename
      },
      (jsonResponse) => {
        console.log("received results:", jsonResponse)
        if (!jsonResponse.error) {
          setCsvResultPath(jsonResponse["csv_result_path"])
          setExtractionStep("Extracted Features Saved")
          MedDataObject.updateWorkspaceDataObject()
          setExtractionProgress(100)
          setIsResultDatasetLoaded(false)
        } else {
          toast.error(`Extraction failed: ${jsonResponse.error.message}`)
          setExtractionStep("")
          setShowProgressBar(false)
        }
        clearInterval(progressInterval)
        setMayProceed(true)
      },
      function (err) {
        console.error(err)
        toast.error(`Extraction failed: ${err}`)
        clearInterval(progressInterval)
        setExtractionStep("")
        setMayProceed(true)
        setShowProgressBar(false)
      }
    )
  }

  // Called when the datasetList is updated, in order to get the extracted data
  useEffect(() => {
    if (datasetList.length > 0) {
      datasetList.forEach((dataset) => {
        if (dataset.path == csvResultPath) {
          setResultDataset(dataset)
        }
      })
    }
  }, [datasetList])

  // Called when data in DataContext is updated, in order to updated datasetList
  useEffect(() => {
    if (globalData !== undefined) {
      getDatasetListFromDataContext(globalData)
    }
  }, [globalData])

  // Called when isDatasetLoaded change, in order to update csvPath and dataframe.
  useEffect(() => {
    if (selectedDataset && selectedDataset.data && selectedDataset.path) {
      setCsvPath(selectedDataset.path)
      setDataframe(new DataFrame(selectedDataset.data))
    }
  }, [isDatasetLoaded])

  // Called when isDatasetLoaded change, in order to update csvPath and dataframe.
  useEffect(() => {
    if (isResultDatasetLoaded == true) {
      setShowProgressBar(false)
      setExtractionProgress(0)
      setExtractionStep("")
    }
  }, [isResultDatasetLoaded])

  return (
    <div className="overflow-y-auto width-100">
      <hr></hr>
      <div className="margin-top-bottom-15">
        <div className="center">
          {/* Select CSV data */}
          <h2>Select CSV data</h2>
          {datasetList.length > 0 ? <Dropdown value={selectedDataset} options={datasetList.filter((value) => value.extension == "csv")} optionLabel="name" onChange={(event) => datasetSelected(event.value)} placeholder="Select a dataset" /> : <Dropdown placeholder="No dataset to show" disabled />}
        </div>
      </div>

      <hr></hr>
      <div className="margin-top-bottom-15">
        {/* Display selected data */}
        <div className="center">
          <h2>Selected data</h2>
          {!selectedDataset && <p>Nothing to show, select a CSV file first.</p>}
        </div>
        {selectedDataset && (
          <div>
            <DataTableFromContext
              MedDataObject={selectedDataset}
              tablePropsData={{ size: "small", paginator: true, rows: 5 }}
              tablePropsColumn={{
                sortable: true
              }}
              setIsDatasetLoaded={setIsDatasetLoaded}
            />
          </div>
        )}
      </div>

      <hr></hr>
      <div className="margin-top-bottom-15">
        <div className="center">
          {/* Extraction Type Selection */}
          <h2>Select an extraction type</h2>
          <div className="margin-top-15">
            <Dropdown value={extractionType} options={extractionTypeList} onChange={(event) => onChangeExtractionType(event.value)} />
          </div>
          <div className="margin-top-15">
            {extractionType == "BioBERT" && <ExtractionBioBERT dataframe={dataframe} setExtractionJsonData={setExtractionJsonData} setMayProceed={setMayProceed} />}
            {extractionType == "TSfresh" && <ExtractionTSfresh dataframe={dataframe} setExtractionJsonData={setExtractionJsonData} setMayProceed={setMayProceed} />}
          </div>
        </div>
      </div>

      <hr></hr>
      <div className="margin-top-bottom-15">
        <div className="center">
          {/* Time Series Extraction */}
          <h2>Extract time series</h2>
          <div className="margin-top-30">
            <div className="flex-container">
              <div>
                Save extracted features as : &nbsp;
                <InputText value={filename} onChange={(e) => handleFilenameChange(e.target.value)} />
              </div>
              <div>
                {/* Button activated only if all necessary columns have been selected */}
                <Button disabled={!mayProceed} onClick={runExtraction}>
                  Extract Data
                </Button>
              </div>
            </div>
          </div>
          <div className="margin-top-30">
            {extractionStep}
            {showProgressBar && <ProgressBar value={extractionProgress} />}
          </div>
        </div>
      </div>

      <hr></hr>
      <div className="margin-top-bottom-15">
        {/* Display extracted data */}
        <div className="center">
          <h2>Extracted data</h2>
          {!resultDataset && <p>Nothing to show, proceed to extraction first.</p>}
        </div>
        {resultDataset && (
          <div>
            <DataTableFromContext MedDataObject={resultDataset} tablePropsData={{ size: "small", paginator: true, rows: 5 }} isDatasetLoaded={isResultDatasetLoaded} setIsDatasetLoaded={setIsResultDatasetLoaded} />
          </div>
        )}
      </div>
    </div>
  )
}

export default ExtractionTabularData
