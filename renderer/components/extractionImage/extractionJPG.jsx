import Button from "react-bootstrap/Button"
import { DataContext } from "../workspace/dataContext"
import DataTableFromContext from "../mainPages/dataComponents/dataTableFromContext"
import { Dropdown } from "primereact/dropdown"
import ExtractionDenseNet from "./extractionTypes/extractionDenseNet"
import { InputNumber } from "primereact/inputnumber"
import { InputText } from "primereact/inputtext"
import MedDataObject from "../workspace/medDataObject"
import { Message } from "primereact/message"
import React, { useContext, useEffect, useState } from "react"
import { requestJson } from "../../utilities/requests"
import ProgressBarRequests from "../generalPurpose/progressBarRequests"
import { toast } from "react-toastify"
import { WorkspaceContext } from "../workspace/workspaceContext"
import { ErrorRequestContext } from "../generalPurpose/errorRequestContext"

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
  const [dataFolderList, setDataFolderList] = useState([]) // list of the folder containing jpg data at a specified Depth
  const [extractionFunction, setExtractionFunction] = useState(extractionTypeList[0] + "_extraction") // name of the function to use for extraction
  const [extractionJsonData, setExtractionJsonData] = useState({}) // json data depending on extractionType
  const [extractionProgress, setExtractionProgress] = useState(0) // advancement state in the extraction function
  const [extractionStep, setExtractionStep] = useState("") // current step in the extraction function
  const [extractionType, setExtractionType] = useState(extractionTypeList[0]) // extraction type
  const [filename, setFilename] = useState(defaultFilename) // name of the csv file containing extracted data
  const [folderDepth, setFolderDepth] = useState(1) // depth to consider when searching jpg data in folders
  const [isResultDatasetLoaded, setIsResultDatasetLoaded] = useState(false) // boolean set to false every time we reload an extracted data dataset
  const [optionsSelected, setOptionsSelected] = useState(true) // boolean set to true when the options seleted are convenient for extraction
  const [progress, setProgress] = useState({ now: 0, currentLabel: "" }) // progress bar state [now, currentLabel]
  const [resultDataset, setResultDataset] = useState(null) // dataset of extracted data used to be display
  const [running, setRunning] = useState(false) // boolean set to true when extraction is running
  const [selectedFolder, setSelectedFolder] = useState(null) // folder containing the data for extraction
  const [showProgressBar, setShowProgressBar] = useState(false) // wether to show or not the extraction progressbar
  const { setError } = useContext(ErrorRequestContext)

  const { globalData } = useContext(DataContext) // we get the global data from the context to retrieve the directory tree of the workspace, thus retrieving the data files
  const { port } = useContext(WorkspaceContext) // we get the port for server connexion

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
   * Run extraction depending on the choosen extraction type, on the mentionned url server.
   * Update the progress bar depending on the extraction execution.
   *
   */
  const runExtraction = () => {
    setRunning(true)
    setShowProgressBar(true)
    // Run extraction process
    requestJson(
      port,
      serverUrl + extractionFunction,
      {
        relativeToExtractionType: extractionJsonData,
        depth: folderDepth,
        folderPath: selectedFolder?.path,
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
          setError(jsonResponse.error)
          setExtractionStep("")
          setShowProgressBar(false)
        }
        setShowProgressBar(false)
        setRunning(false)
      },
      function (err) {
        console.error(err)
        toast.error(`Extraction failed: ${err}`)
        setExtractionStep("")
        setRunning(false)
        setShowProgressBar(false)
      }
    )
  }

  /**
   *
   * @param {DataContext} dataContext
   * @param {number} depth
   *
   * @description
   * This functions get folder containing JGP files at depth.
   *
   */
  function findFoldersWithJPGFilesAtDepth(dataContext, depth) {
    function findFoldersRecursively(item, currentDepth) {
      const foldersWithMatchingFiles = []

      if (item?.type && item.type === "folder") {
        if (currentDepth === depth) {
          // Look for matching files in this folder
          const containsMatchingFile = item.childrenIDs.some((childId) => dataContext[childId]?.type && dataContext[childId].type === "file" && dataContext[childId].extension === "jpg")
          if (containsMatchingFile) {
            foldersWithMatchingFiles.push(item)
          }
        } else {
          // Look in subfolders
          for (const childId of item.childrenIDs) {
            const childFolder = dataContext[childId]
            const childFolders = findFoldersRecursively(childFolder, currentDepth + 1)
            if (childFolders.length > 0) {
              // The subfolder contains matching files
              foldersWithMatchingFiles.push(item)
              break
            }
          }
        }
      }
      return foldersWithMatchingFiles
    }
    const topLevelFolders = Object.keys(dataContext).map((key) => dataContext[key])
    const foldersWithMatchingFiles = topLevelFolders.flatMap((item) => findFoldersRecursively(item, 0))
    setDataFolderList(foldersWithMatchingFiles)
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

  // Called while progress is updated
  useEffect(() => {
    setProgress({
      now: extractionProgress,
      currentLabel: extractionStep
    })
  }, [extractionStep, extractionProgress])

  // Set selected folder to null when folderDepth is updated
  useEffect(() => {
    setSelectedFolder(null)
  }, [folderDepth])

  // Called when data in DataContext is updated, in order to updated resultDataset
  useEffect(() => {
    if (globalData !== undefined && csvResultPath !== "") {
      findResultDataset(globalData, csvResultPath)
    }
  }, [globalData])

  // Called when data in DataContext is updated, in order to update dataFolderList
  useEffect(() => {
    if (globalData !== undefined) {
      findFoldersWithJPGFilesAtDepth(globalData, folderDepth)
    }
  }, [globalData, folderDepth])

  // Called when isDatasetLoaded change, in order to update the progressbar.
  useEffect(() => {
    if (isResultDatasetLoaded == true) {
      setShowProgressBar(false)
      setExtractionProgress(0)
      setExtractionStep("")
    }
  }, [isResultDatasetLoaded])

  return (
    <>
      <div className="margin-top-bottom-15 center">
        <div>
          {/* Select JPG data */}
          <h2>Select JPG data</h2>
          <Message severity="info" text="Your JPG data must be a folder containing one folder by patient" />
          <div className="flex-container margin-top-15">
            <div>
              Folder Depth : &nbsp;
              <InputNumber value={folderDepth} onValueChange={(e) => setFolderDepth(e.value)} size={1} showButtons min={1} />
            </div>
            <div>
              Folder for extraction : &nbsp;
              {dataFolderList.length > 0 ? <Dropdown value={selectedFolder} options={dataFolderList} optionLabel="name" onChange={(event) => setSelectedFolder(event.value)} placeholder="Select a Folder" /> : <Dropdown placeholder="No folder to show" disabled />}
            </div>
          </div>
        </div>

        <hr></hr>
        <div className="margin-top-bottom-15">
          <div className="center">
            {/* Extraction Type Selection */}
            <h2>Select an extraction type</h2>
            <div className="margin-top-15">
              <Dropdown value={extractionType} options={extractionTypeList} onChange={(event) => onChangeExtractionType(event.value)} />
            </div>
            <div className="margin-top-15">{extractionType == "DenseNet" && <ExtractionDenseNet setExtractionJsonData={setExtractionJsonData} setOptionsSelected={setOptionsSelected} />}</div>
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
                  <Button disabled={running == true || optionsSelected == false || !selectedFolder} onClick={runExtraction}>
                    Extract Data
                  </Button>
                </div>
              </div>
            </div>
            <div className="margin-top-30 extraction-progress">{showProgressBar && <ProgressBarRequests progressBarProps={{}} isUpdating={showProgressBar} setIsUpdating={setShowProgressBar} progress={progress} setProgress={setProgress} requestTopic={serverUrl + "progress"} />}</div>
          </div>
        </div>

        <hr></hr>
        <div className="margin-top-bottom-15">
          {/* Display extracted data */}
          <div className="center">
            <h2>Extracted data</h2>
            {resultDataset ? <DataTableFromContext MedDataObject={resultDataset} tablePropsData={{ size: "small", paginator: true, rows: 5 }} isDatasetLoaded={isResultDatasetLoaded} setIsDatasetLoaded={setIsResultDatasetLoaded} /> : <p>Nothing to show, proceed to extraction first.</p>}
          </div>
        </div>
      </div>
    </>
  )
}

export default ExtractionJPG
