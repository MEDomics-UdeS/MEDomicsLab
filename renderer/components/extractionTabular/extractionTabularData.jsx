import { Button } from "primereact/button"
import { DataContext } from "../workspace/dataContext"
import { DataFrame } from "danfojs"
import DataTableFromContext from "../mainPages/dataComponents/dataTableFromContext"
import { Dropdown } from "primereact/dropdown"
import { ErrorRequestContext } from "../generalPurpose/errorRequestContext"
import ExtractionBioBERT from "./extractionTypes/extractionBioBERT"
import ExtractionTSfresh from "./extractionTypes/extractionTSfresh"
import { InputSwitch } from "primereact/inputswitch"
import { InputText } from "primereact/inputtext"
import MedDataObject from "../workspace/medDataObject"
import { Message } from "primereact/message"
import { PageInfosContext } from "../mainPages/moduleBasics/pageInfosContext"
import { ProgressSpinner } from "primereact/progressspinner"
import ProgressBar from "react-bootstrap/ProgressBar"
import React, { useState, useEffect, useContext } from "react"
import { requestBackend } from "../../utilities/requests"
import { toast } from "react-toastify"
import { WorkspaceContext } from "../workspace/workspaceContext"

/**
 *
 * @param {List} extractionTypeList list containing possible types of extraction
 * @param {String} serverUrl path to server
 * @param {String} defaultFilename default name under which the extracted features will be saved
 * @returns {JSX.Element} a page
 *
 * @description
 * This component is a general page used for tabular data extraction (time series and text notes).
 * Its composition depend on the type of extraction choosen.
 *
 */
const ExtractionTabularData = ({ extractionTypeList, serverUrl, defaultFilename }) => {
  const [areResultsLarge, setAreResultsLarge] = useState(false) // if the results are too large we don't display them
  const [csvPath, setCsvPath] = useState("") // csv path of data to extract
  const [csvResultPath, setCsvResultPath] = useState("") // csv path of extracted data
  const [dataFolderPath, setDataFolderPath] = useState("") // DATA folder
  const [dataframe, setDataframe] = useState([]) // djanfo dataframe of data to extract
  const [datasetList, setDatasetList] = useState([]) // list of available datasets in DATA folder
  const [extractionInitializeFunction, setExtractionInitializeFunction] = useState("initialize_" + extractionTypeList[0] + "_extraction") // name of the function to use for extraction initialization
  const [extractionFunction, setExtractionFunction] = useState(extractionTypeList[0] + "_extraction") // name of the function to use for extraction
  const [extractionToMasterFunction, setExtractionToMasterFunction] = useState("to_master_" + extractionTypeList[0] + "_extraction") // name of the function to use to format extraction data to submastertable
  const [extractionProgress, setExtractionProgress] = useState(0) // advancement state in the extraction function
  const [extractionStep, setExtractionStep] = useState("") // current step in the extraction function
  const [extractionJsonData, setExtractionJsonData] = useState({}) // json data depending on extractionType
  const [extractionType, setExtractionType] = useState(extractionTypeList[0]) // extraction type
  const [filename, setFilename] = useState(defaultFilename) // name of the csv file containing extracted data
  const [filenameSavedFeatures, setFilenameSavedFeatures] = useState(null) // name of the csv file containing extracted data
  const [isDatasetLoaded, setIsDatasetLoaded] = useState(false) // boolean set to false every time we reload a dataset for data to extract
  const [isLoadingDataset, setIsLoadingDataset] = useState(false) // boolean telling if the result dataset is loading
  const [isResultDatasetLoaded, setIsResultDatasetLoaded] = useState(false) // boolean set to false every time we reload an extracted data dataset
  const [mayProceed, setMayProceed] = useState(false) // boolean set to true if all informations about the extraction (depending on extractionType) have been completed
  const [resultDataset, setResultDataset] = useState(null) // dataset of extracted data used to be display
  const [selectedDataset, setSelectedDataset] = useState(null) // dataset of data to extract used to be display
  const [showProgressBar, setShowProgressBar] = useState(false) // wether to show or not the extraction progressbar
  const [viewResults, setViewResults] = useState(false) // Display result if true and results can be displayed

  const { globalData } = useContext(DataContext) // we get the global data from the context to retrieve the directory tree of the workspace, thus retrieving the data files
  const { pageId } = useContext(PageInfosContext) // used to get the pageId
  const { port } = useContext(WorkspaceContext) // we get the port for server connexion
  const { setError } = useContext(ErrorRequestContext) // used to diplay the errors

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
   * @param {DataContext} dataContext
   *
   * @description
   * This functions returns the DATA folder path
   *
   */
  function getDataFolderPath(dataContext) {
    let keys = Object.keys(dataContext)
    keys.forEach((key) => {
      if (dataContext[key].type == "folder" && dataContext[key].name == "DATA" && dataContext[key].parentID == "UUID_ROOT") {
        setDataFolderPath(dataContext[key].path)
      }
    })
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
    setExtractionInitializeFunction("initialize_" + value + "_extraction")
    setExtractionFunction(value + "_extraction")
    setExtractionToMasterFunction("to_master_" + value + "_extraction")
  }

  /**
   * @description
   * Run the initialization process for the specified extraction type
   *
   * @returns jsonResponse
   */
  async function initializeExtraction() {
    return new Promise((resolve, reject) => {
      requestBackend(
        port,
        serverUrl + extractionInitializeFunction + "/" + pageId,
        {
          relativeToExtractionType: extractionJsonData,
          dataFolderPath: dataFolderPath,
          csvPath: csvPath,
          filename: filename
        },
        (response) => resolve(response),
        (error) => reject(error)
      )
    })
  }

  /**
   * @description
   * Extract text notes by batch depending on the extraction type specified.
   * Update the progress bar.
   *
   * @returns extractedData
   */
  async function extractDataFromFileList(csvResultsPath, processingList) {
    let progress = 10
    let chunkSize = 25
    let chunks = []
    for (let i = 0; i < processingList.length; i += chunkSize) {
      const chunk = processingList.slice(i, i + chunkSize)
      chunks.push(chunk)
    }
    for (const subList of chunks) {
      try {
        const jsonResponse = await new Promise((resolve, reject) => {
          progress += (1 / chunks.length) * 80
          console.log(subList)
          setExtractionProgress(progress.toFixed(2))
          requestBackend(
            port,
            serverUrl + extractionFunction + "/" + pageId,
            {
              relativeToExtractionType: extractionJsonData,
              identifiersList: subList,
              csvResultsPath: csvResultsPath,
              csvPath: csvPath,
              pageId: pageId
            },
            (response) => resolve(response),
            (error) => reject(error)
          )
        })
        if (jsonResponse.error) {
          toast.error(`Extraction failed: ${jsonResponse.error.message}`)
          setError(jsonResponse.error)
        }
      } catch (err) {
        console.error(err)
        toast.error(`Extraction failed: ${err}`)
        return
      }
    }
  }

  /**
   *
   * @param {*} extractedFeaturesPath
   * @description
   * Format the extracted features as submaster table
   *
   * @returns jsonResponse
   */
  async function formatAsMasterTable(csvResultsPath) {
    return new Promise((resolve, reject) => {
      requestBackend(
        port,
        serverUrl + extractionToMasterFunction + "/" + pageId,
        {
          relativeToExtractionType: extractionJsonData,
          csvResultsPath: csvResultsPath,
          csvPath: csvPath
        },
        (response) => resolve(response),
        (error) => reject(error)
      )
    })
  }

  /**
   *
   * @description
   * Run extraction main function.
   *
   */
  const runExtraction = async () => {
    setMayProceed(false)
    setShowProgressBar(true)
    setExtractionProgress(0)
    setExtractionStep("Initialization")
    // Initialize extraction process
    let jsonInitialization = await initializeExtraction()
    setExtractionProgress(10)
    setExtractionStep("Extracting data")
    if (!jsonInitialization.error) {
      // Extract data
      let processingList = jsonInitialization["processing_list"]
      let csvResultsPath = jsonInitialization["csv_result_path"]
      await extractDataFromFileList(csvResultsPath, processingList)
      if (extractionJsonData["masterTableCompatible"]) {
        setExtractionStep("Format data as master table")
        setExtractionProgress(95)
        let jsonFormat = await formatAsMasterTable(csvResultsPath)
        if (jsonFormat.error) {
          toast.error(`Extraction failed: ${jsonFormat.error.message}`)
          setError(jsonFormat.error)
        }
      }
      setCsvResultPath(csvResultsPath)
      setFilenameSavedFeatures(filename)
      setExtractionStep("Extracted Features Saved")
      MedDataObject.updateWorkspaceDataObject()
      setExtractionProgress(100)
      setResultDataset(null)
      setIsResultDatasetLoaded(false)
      setIsLoadingDataset(true)
    } else {
      toast.error(`Extraction failed: ${jsonInitialization.error.message}`)
      setError(jsonInitialization.error)
    }
    setExtractionProgress(100)
    setExtractionStep("")
    setMayProceed(true)
    setShowProgressBar(false)
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

  // Called when data in DataContext is updated, in order to updated datasetList and DataFolderPath
  useEffect(() => {
    if (globalData !== undefined) {
      getDatasetListFromDataContext(globalData)
      getDataFolderPath(globalData)
    }
  }, [globalData])

  // Called when isDatasetLoaded change, in order to update csvPath and dataframe.
  useEffect(() => {
    console.log("selectedDataset", selectedDataset)
    if (selectedDataset && selectedDataset.data && selectedDataset.path) {
      setCsvPath(selectedDataset.path)
      setDataframe(new DataFrame(selectedDataset.data))
      setIsLoadingDataset(false)
    }
  }, [isDatasetLoaded])

  // Called when isDatasetLoaded change, in order to update the progressbar.
  useEffect(() => {
    if (isResultDatasetLoaded == true) {
      setShowProgressBar(false)
      setExtractionProgress(0)
      setExtractionStep("")
      setIsLoadingDataset(false)
    }
  }, [isResultDatasetLoaded])

  return (
    <div>
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
            {extractionType == "TSfresh" && <ExtractionTSfresh dataframe={dataframe} setExtractionJsonData={setExtractionJsonData} setMayProceed={setMayProceed} setAreResultsLarge={setAreResultsLarge} />}
          </div>
        </div>
      </div>

      <hr></hr>
      <div className="margin-top-bottom-15">
        <div className="center">
          {/* Features Extraction */}
          <h2>Extract features</h2>
          {mayProceed == false && showProgressBar == false && <Message severity="warn" text="You must select convenient options for feature generation" />}
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
          <div className="margin-top-30 extraction-progress">
            {showProgressBar && (
              <div className="progress-bar-requests">
                <label>{extractionStep}</label>
                <ProgressBar now={extractionProgress} label={`${extractionProgress}%`} />
              </div>
            )}
          </div>
        </div>
      </div>

      <hr></hr>
      <div className="margin-top-bottom-15 center">
        {/* Display extracted data */}
        <h2>Extracted data</h2>
        <div>
          <p>Display result dataset &nbsp;</p>
        </div>
        <div className="margin-top-bottom-15 center">
          <InputSwitch id="switch" checked={viewResults} onChange={(e) => setViewResults(e.value)} />
        </div>
        {viewResults == true && areResultsLarge == false && <div>{resultDataset ? <DataTableFromContext MedDataObject={resultDataset} tablePropsData={{ size: "small", paginator: true, rows: 5 }} isDatasetLoaded={isResultDatasetLoaded} setIsDatasetLoaded={setIsResultDatasetLoaded} /> : isLoadingDataset ? <ProgressSpinner /> : <p>Nothing to show, proceed to extraction first.</p>}</div>}
        {viewResults == true && resultDataset && areResultsLarge == true && <p>The result dataset is too large to be display here.</p>}
        {resultDataset && (
          <p>
            Features saved under &quot;extracted_features/
            {filenameSavedFeatures}&quot;.
          </p>
        )}
      </div>
    </div>
  )
}

export default ExtractionTabularData
