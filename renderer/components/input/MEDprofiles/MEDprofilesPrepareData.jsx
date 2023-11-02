import Button from "react-bootstrap/Button"
import { DataContext } from "../../workspace/dataContext";
import { DataView } from 'primereact/dataview';
import { Dropdown } from "primereact/dropdown"
import { LayoutModelContext } from "../../layout/layoutContext";
import MedDataObject from "../../workspace/medDataObject"
import ProgressBarRequests from "../../generalPurpose/progressBarRequests"
import React, {useContext, useEffect, useState} from "react"
import { requestJson } from "../../../utilities/requests"
import { toast } from "react-toastify"
import { WorkspaceContext } from "../../workspace/workspaceContext"

/**
 * 
 * @returns {JSX.Element} a page
 * 
 * @description 
 * Component of the input module as an Accordion, MEDprofilesPrepareDara allows the user to 
 * create MEDclasses from a master table, instantiate his master table data as MEDprofiles, 
 * and finally open the generated data in MEDprofilesViewer.
 * 
 */
const MEDprofilesPrepareData = () => {
  const [classesGenerated, setClassesGenerated] = useState(false) // boolean telling if the MEDclasses have been generated
  const [datasetList, setDatasetList] = useState([]) // list of available datasets in DATA folder
  const [folderList, setFolderList] = useState([]) // list of available folders in DATA folder
  const [generatedClassesFolder, setGeneratedClassesFolder] = useState(null) // folder containing the generated MEDclasses
  const [generatedMEDprofilesFile, setGeneratedMEDprofilesFile] = useState(null) // file containing the generated MEDprofiles binary file
  const [mayCreateClasses, setMayCreateClasses] = useState(false) // boolean updating the "Create MEDclasses" button state
  const [mayInstantiateMEDprofiles, setMayInstantiateMEDprofiles] = useState(false) // boolean updating the "Instantiate MEDprofiles" button state
  const [progress, setProgress] = useState({ now: 0, currentLabel: "" }) // progress bar state [now, currentLabel]
  const [selectedMEDclassesFolder, setSelectedMEDclassesFolder] = useState(null) // folder selected where to put the MEDclasses
  const [selectedMEDprofilesFolder, setSelectedMEDprofilesFolder] = useState(null) // folder selected where to put the MEDprofiles binary file
  const [selectedMasterTable, setSelectedMasterTable] = useState(null) // dataset of data to extract used to be display
  const [showProgressBar, setShowProgressBar] = useState(false) // wether to show or not the extraction progressbar

  const { dispatchLayout } = useContext(LayoutModelContext)
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
   * This functions is called when the MEDclasses or the MEDprofiles' 
   * binary file have been generated.
   *
   */
     function getGeneratedElement(dataContext, path, setter) {
      let keys = Object.keys(dataContext)
      keys.forEach((key) => {
        if (dataContext[key].path == path) {
          setter(dataContext[key])
        }
      })
    }

  function openMEDprofilesViewer() {
    dispatchLayout({ type: `openMEDprofilesViewerModule`, payload: { pageId: "MEDprofilesViewer", MEDclassesFolder: generatedClassesFolder, MEDprofilesBinaryFile: generatedMEDprofilesFile } })
  }

  /**
   * @description
   * This function calls the create_MEclasses method in the MEDprofiles server
   */
  const createMEDclasses = () => {
    setMayCreateClasses(false)
    setClassesGenerated(false)
    // Run extraction process
    requestJson(
      port,
      "/MEDprofiles/create_MEDclasses",
      {
        masterTablePath: selectedMasterTable.path,
        selectedFolderPath: selectedMEDclassesFolder.path + "/MEDclasses"
      },
      (jsonResponse) => {
        console.log("received results:", jsonResponse)
        if (!jsonResponse.error) {
          MedDataObject.updateWorkspaceDataObject()
          setClassesGenerated(true)
        } else {
          toast.error(`Creation failed: ${jsonResponse.error.message}`)
        }
        setMayCreateClasses(true)
      },
      function (err) {
        console.error(err)
        toast.error(`Creation failed: ${err}`)
        setMayCreateClasses(true)
      }
    )
  }

  /**
   * @description
   * This function calls the instantiate_MEDprofiles method in the MEDprofiles server
   */
   const instantiateMEDprofiles = () => {
    setMayInstantiateMEDprofiles(false)
    setMayCreateClasses(false)
    setShowProgressBar(true)
    // Run extraction process
    requestJson(
      port,
      "/MEDprofiles/instantiate_MEDprofiles",
      {
        masterTablePath: selectedMasterTable.path,
        destinationFile: selectedMEDprofilesFolder.path + "/MEDprofiles_bin", 
      },
      (jsonResponse) => {
        console.log("received results:", jsonResponse)
        if (!jsonResponse.error) {
          MedDataObject.updateWorkspaceDataObject()
        } else {
          toast.error(`Instantiation failed: ${jsonResponse.error.message}`)
        }
        setMayInstantiateMEDprofiles(true)
        setMayCreateClasses(true)
        setShowProgressBar(false)
      },
      function (err) {
        console.error(err)
        toast.error(`Instantiation failed: ${err}`)
        setMayInstantiateMEDprofiles(true)
        setMayCreateClasses(true)
        setShowProgressBar(false)
      }
    )
  }

  // Look of items in the MEDclasses DataView
  const MEDclassesDisplay = (element) => {
    return(<div>{globalData[element]?.nameWithoutExtension}</div>)
  }

  // Called when data in DataContext is updated, in order to updated datasetList and folderList
  useEffect(() => {
    if (globalData !== undefined) {
      getDatasetListFromDataContext(globalData)
      getFolderListFromDataContext(globalData)
      if (selectedMEDclassesFolder?.path) {
        getGeneratedElement(globalData, selectedMEDclassesFolder.path + "/MEDclasses/MEDclasses", setGeneratedClassesFolder)
      }
      if (selectedMEDprofilesFolder?.path) {
        getGeneratedElement(globalData, selectedMEDprofilesFolder.path + "/MEDprofiles_bin", setGeneratedMEDprofilesFile)
      }
    }
  }, [globalData])

  // Called while the MEDclasses folder is updated in order to tell if we may instantiate the MEDprofiles' data
  useEffect(() => {
    if (classesGenerated && generatedClassesFolder && selectedMasterTable?.path && selectedMEDprofilesFolder?.path) {
      setMayInstantiateMEDprofiles(true)
    } else {
      setMayInstantiateMEDprofiles(false)
    }
  }, [generatedClassesFolder, selectedMasterTable, selectedMEDprofilesFolder, classesGenerated])

  // Called when options are modified in order to tell if the process may be run
  useEffect(() => {
    if (selectedMasterTable && selectedMEDclassesFolder) {
      setMayCreateClasses(true)
    } else {
      setMayCreateClasses(false)
    }
  }, [selectedMasterTable, selectedMEDclassesFolder])

  // Called once at initialization in order to set default selected folder to "DATA"
  useEffect(() => {
    if (globalData !== undefined) {
    let keys = Object.keys(globalData)
    keys.forEach((key) => {
      if (globalData[key].type == "folder" && globalData[key].name == "DATA" && globalData[key].parentID == "UUID_ROOT") {
        setSelectedMEDclassesFolder(globalData[key])
        setSelectedMEDprofilesFolder(globalData[key])
      }
    })
    }
  }, [])  
  
    return (
      <>
      <div className="align-center"> 
        <b>Select your master table : &nbsp;</b>
        {datasetList.length > 0 ? <Dropdown value={selectedMasterTable} options={datasetList.filter((value) => value.extension == "csv")} optionLabel="name" onChange={(event) => setSelectedMasterTable(event.value)} placeholder="Select a master table" /> : <Dropdown placeholder="No dataset to show" disabled />}
      </div>
      <hr></hr>
      <div className="flex-container">
        <div>
          <b>Select the location of your MEDclasses folder : &nbsp;</b>
          {folderList.length > 0 ? <Dropdown value={selectedMEDclassesFolder} options={folderList} optionLabel="name" onChange={(event) => setSelectedMEDclassesFolder(event.value)} placeholder="Select a folder" /> : <Dropdown placeholder="No folder to show" disabled />}
        </div>
        <div>
          <Button disabled={!mayCreateClasses} onClick={createMEDclasses}>Create MEDclasses</Button>
        </div>
      </div>
      {generatedClassesFolder?.childrenIDs && classesGenerated && (<div className="card data-view">
        <DataView value={generatedClassesFolder.childrenIDs} itemTemplate={MEDclassesDisplay} paginator rows={5} header="Generated MEDclasses" style={{"textAlign":"center"}}/>
      </div>)}
      <hr></hr>
      <div className="flex-container">
        <div>
          <b>Select the location of your MEDprofiles binary file : &nbsp;</b>
          {folderList.length > 0 ? <Dropdown value={selectedMEDprofilesFolder} options={folderList} optionLabel="name" onChange={(event) => setSelectedMEDprofilesFolder(event.value)} placeholder="Select a folder" /> : <Dropdown placeholder="No folder to show" disabled />}
        </div>
        <div>
          <Button disabled={!mayInstantiateMEDprofiles} onClick={instantiateMEDprofiles}>Instantiate MEDprofiles</Button>
        </div>
      </div>
      <div className="margin-top-30 extraction-progress">{showProgressBar && <ProgressBarRequests progressBarProps={{}} isUpdating={showProgressBar} setIsUpdating={setShowProgressBar} progress={progress} setProgress={setProgress} requestTopic={"/MEDprofiles/progress"} />}</div>
      <hr></hr>
      <div className="align-center">
        <Button disabled={!generatedClassesFolder && !generatedMEDprofilesFile} onClick={openMEDprofilesViewer}>Open MEDprofiles Viewer</Button>
      </div>
      </>
    )
  }
  
  export default MEDprofilesPrepareData