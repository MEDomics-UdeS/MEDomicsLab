import { Button } from "primereact/button"
import { DataContext } from "../workspace/dataContext"
import DataTableFromContext from "../mainPages/dataComponents/dataTableFromContext"
import { Dropdown } from "primereact/dropdown"
import { ErrorRequestContext } from "../generalPurpose/errorRequestContext"
import ExtractionDenseNet from "./extractionTypes/extractionDenseNet"
import { InputSwitch } from "primereact/inputswitch"
import { InputText } from "primereact/inputtext"
import MedDataObject from "../workspace/medDataObject"
import { Message } from "primereact/message"
import { PageInfosContext } from "../mainPages/moduleBasics/pageInfosContext"
import ProgressBar from "react-bootstrap/ProgressBar"
import { ProgressSpinner } from "primereact/progressspinner"
import React, { useContext, useEffect, useRef, useState } from "react"
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
 * This component is a general page used for jpg data extraction.
 * Its composition depend on the type of extraction choosen.
 *
 */
const ExtractionJPG = ({ extractionTypeList, serverUrl, defaultFilename }) => {
  const [csvResultPath, setCsvResultPath] = useState("") // csv path of extracted data
  const [dataFolderPath, setDataFolderPath] = useState("") // DATA folder
  const [extractionInitializeFunction, setExtractionInitializeFunction] = useState("initialize_" + extractionTypeList[0] + "_extraction") // name of the function to use for extraction initialization
  const [extractionFunction, setExtractionFunction] = useState(extractionTypeList[0] + "_extraction") // name of the function to use for extraction
  const [extractionToMasterFunction, setExtractionToMasterFunction] = useState("to_master_" + extractionTypeList[0] + "_extraction") // name of the function to use to format extraction data to submastertable
  const [extractionJsonData, setExtractionJsonData] = useState({}) // json data depending on extractionType
  const [extractionProgress, setExtractionProgress] = useState(0) // advancement state in the extraction function
  const [extractionStep, setExtractionStep] = useState("") // current step in the extraction function
  const [extractionType, setExtractionType] = useState(extractionTypeList[0]) // extraction type
  const [fileList, setFileList] = useState([]) // list of the images files to extract data from
  const [filename, setFilename] = useState(defaultFilename) // name of the csv file containing extracted data
  const [filenameSavedFeatures, setFilenameSavedFeatures] = useState(null) // name of the csv file containing extracted data
  const [folderDepth, setFolderDepth] = useState(1) // depth to consider when searching jpg data in folders
  const inputFolderRef = useRef(null) // used to select images folder
  const [isLoadingDataset, setIsLoadingDataset] = useState(false) // boolean telling if the result dataset is loading
  const [isResultDatasetLoaded, setIsResultDatasetLoaded] = useState(false) // boolean set to false every time we reload an extracted data dataset
  const [optionsSelected, setOptionsSelected] = useState(true) // boolean set to true when the options seleted are convenient for extraction
  const [resultDataset, setResultDataset] = useState(null) // dataset of extracted data used to be display
  const [running, setRunning] = useState(false) // boolean set to true when extraction is running
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
    setExtractionInitializeFunction("initialize_" + value + "_extraction")
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
          filename: filename
        },
        (response) => resolve(response),
        (error) => reject(error)
      )
    })
  }

  /**
   * @description
   * Extract data image by image depending on the extraction type specified.
   * Update the progress bar.
   *
   * @returns extractedData
   */
  async function extractDataFromFileList(csvResultsPath) {
    let progress = 10
    let chunkSize = 100
    let chunks = []
    for (let i = 0; i < fileList.length; i += chunkSize) {
      const chunk = fileList.slice(i, i + chunkSize)
      chunks.push(chunk)
    }
    for (const subList of chunks) {
      try {
        const jsonResponse = await new Promise((resolve, reject) => {
          progress += (1 / chunks.length) * 80
          setExtractionProgress(progress.toFixed(2))
          requestBackend(
            port,
            serverUrl + extractionFunction + "/" + pageId,
            {
              relativeToExtractionType: extractionJsonData,
              depth: folderDepth,
              filePathList: subList,
              csvResultsPath: csvResultsPath,
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
   * @returns
   */
  async function formatAsMasterTable(csvResultsPath) {
    return new Promise((resolve, reject) => {
      requestBackend(
        port,
        serverUrl + extractionToMasterFunction + "/" + pageId,
        {
          depth: folderDepth,
          relativeToExtractionType: extractionJsonData,
          csvResultsPath: csvResultsPath
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
    setRunning(true)
    setShowProgressBar(true)
    setExtractionProgress(0)
    setExtractionStep("Initialization")
    // Initialize extraction process
    let jsonInitialization = await initializeExtraction()
    setExtractionProgress(10)
    setExtractionStep("Extracting data")
    if (!jsonInitialization.error) {
      // Extract data
      //const dfd = require("danfojs-node")
      let csvResultsPath = jsonInitialization["csv_result_path"]
      await extractDataFromFileList(csvResultsPath)
      if (extractionJsonData["masterTableCompatible"]) {
        setExtractionStep("Format data as master table")
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
    setShowProgressBar(false)
    setRunning(false)
  }

  /**
   *
   * @param {DataContext} dataContext
   * @param {String} csvPath
   *
   * @description
   * Get the result dataset from the dataContext.
   * Called when request from runExtraction get response.
   */
  function findResultDataset(dataContext, csvPath) {
    let keys = Object.keys(dataContext)
    keys.forEach((key) => {
      if (dataContext[key].type !== "folder" && dataContext[key].path == csvPath) {
        setResultDataset(dataContext[key])
      }
    })
  }

  /**
   *
   * @param {Event} event
   *
   * @description
   * Called while the user select a folder to import in order to get
   * JPG data and folder depth
   */
  function handleSelectedFolder(event) {
    let error = false
    let depth = null
    let files = event.target.files
    let jpgFiles = []
    let keys = Object.keys(files)
    keys.forEach((key) => {
      if (files[key].type == "image/jpeg") {
        jpgFiles.push(files[key].path)
        // Check if all the images are at the same folder depth
        if (depth != null) {
          if (depth != files[key].webkitRelativePath.match(/\//g).length) {
            error = true
          }
        } else {
          depth = files[key].webkitRelativePath.match(/\//g).length
        }
      }
    })
    if (error == false && depth != null) {
      setFileList(jpgFiles)
      setFolderDepth(depth - 1)
      toast.success("Data successfully imported")
    } else {
      toast.error("All your JPG files must be placed at the same folder level")
    }
  }

  // Called when data in DataContext is updated, in order to updated resultDataset and dataFolderPath
  useEffect(() => {
    if (globalData !== undefined) {
      getDataFolderPath(globalData)
      if (csvResultPath !== "") {
        findResultDataset(globalData, csvResultPath)
      }
    }
  }, [globalData])

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
    <>
      <div className="margin-top-bottom-15 center">
        <div>
          {/* Select JPG data */}
          <h2>Select JPG data</h2>
          <Message severity="info" text="Your JPG data must be a folder containing one folder by patient" />
          <div className="margin-top-15 margin-bottom-15">
            <input ref={inputFolderRef} directory="" webkitdirectory="" type="file" accept="image/jpeg" onChange={handleSelectedFolder} hidden />
            <Button label="Select your data folder" onClick={() => inputFolderRef.current.click()} />
          </div>
          {fileList.length > 0 ? <Message severity="success" text="Data successfully imported" /> : <Message severity="warn" text="No data imported" />}
        </div>

        <hr></hr>
        <div className="margin-top-bottom-15">
          <div className="center">
            {/* Extraction Type Selection */}
            <h2>Select an extraction type</h2>
            <div className="margin-top-15">
              <Dropdown value={extractionType} options={extractionTypeList} onChange={(event) => onChangeExtractionType(event.value)} />
            </div>
            <div className="margin-top-15">{extractionType == "DenseNet" && <ExtractionDenseNet folderDepth={folderDepth} setExtractionJsonData={setExtractionJsonData} setOptionsSelected={setOptionsSelected} />}</div>
          </div>
        </div>

        <hr></hr>
        <div className="margin-top-bottom-15">
          <div className="center">
            {/* Features Extraction */}
            <h2>Extract features</h2>
            {optionsSelected == false && <Message severity="warn" text="You must select convenient options for feature generation" />}
            <div className="margin-top-30">
              <div className="flex-container">
                <div>
                  Save extracted features as : &nbsp;
                  <InputText value={filename} onChange={(e) => handleFilenameChange(e.target.value)} />
                </div>
                <div>
                  {/* Button activated only if all necessary columns have been selected */}
                  <Button disabled={running == true || optionsSelected == false || fileList.length == 0} onClick={runExtraction}>
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
        <div className="margin-top-bottom-15">
          {/* Display extracted data */}
          <div className="center">
            <h2>Extracted data</h2>
            <div>
              <p>Display result dataset &nbsp;</p>
            </div>
            <div className="margin-top-bottom-15 center">
              <InputSwitch id="switch" checked={viewResults} onChange={(e) => setViewResults(e.value)} />
            </div>
            {viewResults == true && <div>{resultDataset ? <DataTableFromContext MedDataObject={resultDataset} tablePropsData={{ size: "small", paginator: true, rows: 5 }} isDatasetLoaded={isResultDatasetLoaded} setIsDatasetLoaded={setIsResultDatasetLoaded} /> : isLoadingDataset ? <ProgressSpinner /> : <p>Nothing to show, proceed to extraction first.</p>}</div>}
            {resultDataset && (
              <p>
                Features saved under &quot;extracted_features/
                {filenameSavedFeatures}&quot;.
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

export default ExtractionJPG
