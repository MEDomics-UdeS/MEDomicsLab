import Button from "react-bootstrap/Button"
import { DataContext } from "../workspace/dataContext"
import { Dropdown } from "primereact/dropdown"
import MedDataObject from "../workspace/medDataObject"
import ProgressBarRequests from "../generalPurpose/progressBarRequests"
import React, {useContext, useEffect, useState} from "react"
import { requestJson } from "../../utilities/requests"
import { ScrollPanel } from 'primereact/scrollpanel';
import { toast } from "react-toastify"
import { WorkspaceContext } from "../workspace/workspaceContext"

const MEDprofilesPrepareData = () => {

  const [datasetList, setDatasetList] = useState([]) // list of available datasets in DATA folder
  const [extractionProgress, setExtractionProgress] = useState(0) // advancement state in the MEDprofiles' functions
  const [extractionStep, setExtractionStep] = useState("") // current step in the MEDprofiles' functions
  const [folderList, setFolderList] = useState([]) // list of available folders in DATA folder
  const [generatedClassesFolder, setGeneratedClassesFolder] = useState(null) // folder containin the generated MEDclasses
  const [mayCreateClasses, setMayCreateClasses] = useState(false) // boolean updating the "Create MEDclasses" button state
  const [progress, setProgress] = useState({ now: 0, currentLabel: "" }) // progress bar state [now, currentLabel]
  const [selectedFolder, setSelectedFolder] = useState(null) // folder selected where to put the MEDclasses
  const [selectedMasterTable, setSelectedMasterTable] = useState(null) // dataset of data to extract used to be display
  const [showProgressBar, setShowProgressBar] = useState(false) // wether to show or not the extraction progressbar

  const { globalData } = useContext(DataContext) // we get the global data from the context to retrieve the directory tree of the workspace, thus retrieving the data files
  const { port } = useContext(WorkspaceContext) // we get the port for server connexion

  /**
   *
   * @param {DataContext} dataContext
   *
   * @description
   * This functions get all files from the DataContext DATA folder and update datasetList.
   *
   */
   function getDatasetListFromDataContext(dataContext) {
    let keys = Object.keys(dataContext)
    let datasetListToShow = []
    keys.forEach((key) => {
      if (dataContext[key].type !== "folder" && dataContext[key].path.includes("DATA")) {
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
   * This functions get all folders from the DataContext DATA folder and update folderList.
   *
   */
   function getFolderListFromDataContext(dataContext) {
    let keys = Object.keys(dataContext)
    let folderListToShow = []
    keys.forEach((key) => {
      if (dataContext[key].type == "folder" && dataContext[key].path.includes("DATA")) {
        folderListToShow.push(dataContext[key])
      }
    })
    setFolderList(folderListToShow)
  }

  /**
   *
   * @param {DataContext} dataContext
   *
   * @description
   * This functions is called when the MEDclasses have been generated.
   *
   */
     function getGeneratedClassesFolder(dataContext, path) {
      let keys = Object.keys(dataContext)
      keys.forEach((key) => {
        if (dataContext[key].path == path) {
          setGeneratedClassesFolder(dataContext[key])
        }
      })
    }

  /**
   * @description
   * This function calls the create_MEclasses method in the MEDprofiles server
   */
  const createMEDclasses = () => {
    setMayCreateClasses(false)
    // Run extraction process
    requestJson(
      port,
      "/MEDprofiles/create_MEDclasses",
      {
        masterTablePath: selectedMasterTable.path,
        selectedFolderPath: selectedFolder.path + "/MEDclasses"
      },
      (jsonResponse) => {
        console.log("received results:", jsonResponse)
        if (!jsonResponse.error) {
          MedDataObject.updateWorkspaceDataObject()
          getGeneratedClassesFolder(globalData, selectedFolder.path + "/MEDclasses")
        } else {
          toast.error(`Extraction failed: ${jsonResponse.error.message}`)
        }
        setMayCreateClasses(true)
      },
      function (err) {
        console.error(err)
        toast.error(`Extraction failed: ${err}`)
        setMayCreateClasses(true)
      }
    )
  }

  // Called when data in DataContext is updated, in order to updated datasetList and folderList
  useEffect(() => {
    if (globalData !== undefined) {
      getDatasetListFromDataContext(globalData)
      getFolderListFromDataContext(globalData)
    }
  }, [globalData])

  // Called while progress is updated
  useEffect(() => {
    setProgress({
      now: extractionProgress,
      currentLabel: extractionStep
    })
  }, [extractionStep, extractionProgress])

  useEffect(() => {
    if (selectedMasterTable && selectedFolder) {
      setMayCreateClasses(true)
    } else {
      setMayCreateClasses(false)
    }
  }, [selectedMasterTable, selectedFolder])

  useEffect(() => {
    console.log("GEN", generatedClassesFolder.childrenIDs?.map((child) => {return globalData[child].nameWithoutExtension}))
  }, [generatedClassesFolder])

  // Called once at initialization in order to set default selected folder to "DATA"
  useEffect(() => {
    if (globalData !== undefined) {
    let keys = Object.keys(globalData)
    keys.forEach((key) => {
      if (globalData[key].type == "folder" && globalData[key].name == "DATA" && globalData[key].parentID == "UUID_ROOT") {
        setSelectedFolder(globalData[key])
      }
    })
    }
  }, [])  
  
    return (
      <>
      <div>
        <b>Select your master table : &nbsp;</b>
        {datasetList.length > 0 ? <Dropdown value={selectedMasterTable} options={datasetList.filter((value) => value.extension == "csv")} optionLabel="name" onChange={(event) => setSelectedMasterTable(event.value)} placeholder="Select a master table" /> : <Dropdown placeholder="No dataset to show" disabled />}
      </div>
      <hr></hr>
      <div className="flex-container">
        <div>
          <b>Select the location of your MEDclasses folder : &nbsp;</b>
          {folderList.length > 0 ? <Dropdown value={selectedFolder} options={folderList} optionLabel="name" onChange={(event) => setSelectedFolder(event.value)} placeholder="Select a folder" /> : <Dropdown placeholder="No folder to show" disabled />}
        </div>
        <div>
          <Button disabled={!mayCreateClasses} onClick={createMEDclasses}>Create MEDclasses</Button>
        </div>
      </div>
      {generatedClassesFolder && (<div>
        <b>Generated MEDclasses :</b>
        {generatedClassesFolder.childrenIDs?.map((child) => {return <div key={child}>{globalData[child].nameWithoutExtension}</div>})}
      </div>)}
      </>
    )
  }
  
  export default MEDprofilesPrepareData