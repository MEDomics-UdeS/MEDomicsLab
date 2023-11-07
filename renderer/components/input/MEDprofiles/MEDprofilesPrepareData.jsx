import Button from "react-bootstrap/Button"
import { DataContext } from "../../workspace/dataContext"
import { DataFrame } from "danfojs"
import { DataView } from "primereact/dataview"
import { Dropdown } from "primereact/dropdown"
import { LayoutModelContext } from "../../layout/layoutContext"
import { loadCSVPath } from "../../../utilities/fileManagementUtils"
import MedDataObject from "../../workspace/medDataObject"
import { Message } from "primereact/message"
import { MultiSelect } from "primereact/multiselect"
import ProgressBarRequests from "../../generalPurpose/progressBarRequests"
import { ProgressSpinner } from "primereact/progressspinner"
import React, { useContext, useEffect, useState } from "react"
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
  const [loadingSubMasterTables, setLoadingSubMasterTables] = useState(true) // boolean telling if the csv analyse for submaster is processing
  const [mayCreateClasses, setMayCreateClasses] = useState(false) // boolean updating the "Create MEDclasses" button state
  const [mayInstantiateMEDprofiles, setMayInstantiateMEDprofiles] = useState(false) // boolean updating the "Instantiate MEDprofiles" button state
  const [progress, setProgress] = useState({ now: 0, currentLabel: "" }) // progress bar state [now, currentLabel]
  const [selectedMEDclassesFolder, setSelectedMEDclassesFolder] = useState(null) // folder selected where to put the MEDclasses
  const [selectedMEDprofilesFolder, setSelectedMEDprofilesFolder] = useState(null) // folder selected where to put the MEDprofiles binary file
  const [selectedMasterTable, setSelectedMasterTable] = useState(null) // dataset of data to extract used to be display
  const [selectedSubMasterTableFiles, setSelectedSubMasterTableFiles] = useState(null) // selected csv for master table creation
  const [subMasterTableFileList, setSubMasterTableFileList] = useState([]) // list of csv data matching the "Sub-MasterTable" format
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
        console.log("setter", key)
        setter(dataContext[key])
      }
    })
  }

  /**
   *
   * @param {DataContext} dataContext
   *
   * @description
   * This function is called when the data context is updated in order
   * to obtain the csv files matching the subMasterTableFormt.
   *
   */
  function getSubMasterTableFileList(dataContext) {
    const keys = Object.keys(dataContext)
    const matchingDatasetList = []

    // Load the CSV file in order to check if the data is matching the required format
    const loadCSVFile = (MEDdata) => {
      // The first column must be identifiers
      const firstColumnMatchingFormat = (dataframe) => {
        return dataframe.$dtypes[0] === "int32" || dataframe.$dtypes[0] === "int64" || (dataframe.$dtypes[0] === "string" && dataframe[dataframe.$columns[0]].dt.$dateObjectArray[0] === "Invalid Date")
      }

      // The second column must be date
      const secondColumnMatchingFormat = (dataframe) => {
        return dataframe.$dtypes[1] === "string" && dataframe[dataframe.$columns[1]].dt.$dateObjectArray[0] !== "Invalid Date"
      }

      // All the others columns must be numerical features and their columns names must respect the format className_attributeName
      const allOtherColumnsAreNumerical = (dataframe) => {
        for (let i = 2; i < dataframe.$columns.length; i++) {
          const columnType = dataframe.$dtypes[i]
          if (columnType !== "int32" && columnType !== "int64" && columnType !== "float32" && columnType !== "float64") {
            return false
          }
        }
        return true
      }

      // Create a promise for each CSV file
      return new Promise((resolve) => {
        loadCSVPath(MEDdata.path, (data) => {
          const dataframe = new DataFrame(data)
          // The dataframe must contain at least 3 columns and respect the format for each column as specified in the checking functions
          if (dataframe.$columns.length > 2 && firstColumnMatchingFormat(dataframe) && secondColumnMatchingFormat(dataframe) && allOtherColumnsAreNumerical(dataframe)) {
            matchingDatasetList.push(MEDdata)
          }
          resolve()
        })
      })
    }

    // Create a promises array for all the csv files
    const promises = keys
      .filter((key) => {
        const item = dataContext[key]
        return item.type !== "folder" && item.path.includes("DATA") && item.extension === "csv"
      })
      .map((key) => loadCSVFile(dataContext[key]))

    // Wait for all the csv files to have been examinated
    Promise.all(promises)
      .then(() => {
        setSubMasterTableFileList(matchingDatasetList)
        setLoadingSubMasterTables(false)
      })
      .catch((error) => {
        toast.error("Error while loading MEDdata :", error)
      })
  }

  /**
   * @description
   * Open the MEDprofilesViewerPage, depending on generatedClassesFolder and generatedMEDprofilesFile
   */
  function openMEDprofilesViewer() {
    dispatchLayout({ type: `openMEDprofilesViewerModule`, payload: { pageId: "MEDprofilesViewer", MEDclassesFolder: generatedClassesFolder, MEDprofilesBinaryFile: generatedMEDprofilesFile } })
  }

  /**
   * @description
   * Calls the create_master_table method in the MEDprofiles server
   */
  const createMasterTable = () => {
    console.log("ok")
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
        destinationFile: selectedMEDprofilesFolder.path + MedDataObject.getPathSeparator() + "MEDprofiles_bin"
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
    return <div>{globalData[element]?.nameWithoutExtension}</div>
  }

  // Called when data in DataContext is updated, in order to updated datasetList, folderList and subMasterTableFileList
  useEffect(() => {
    if (globalData !== undefined) {
      setLoadingSubMasterTables(true)
      setSubMasterTableFileList([])
      getDatasetListFromDataContext(globalData)
      getFolderListFromDataContext(globalData)
      getSubMasterTableFileList(globalData)
      if (selectedMEDclassesFolder?.path) {
        getGeneratedElement(globalData, selectedMEDclassesFolder.path + MedDataObject.getPathSeparator() + "MEDclasses" + MedDataObject.getPathSeparator() + "MEDclasses", setGeneratedClassesFolder)
      }
      if (selectedMEDprofilesFolder?.path) {
        getGeneratedElement(globalData, selectedMEDprofilesFolder.path + MedDataObject.getPathSeparator() + "MEDprofiles_bin", setGeneratedMEDprofilesFile)
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
      <div>
        <div>
          <h5 className="align-center">Create or Select your master table</h5>
          <div className="align-center">
            <Message severity="info" text="Only the files matching the required format will be shown" />
          </div>
        </div>
        <div className="margin-top-15 flex-container">
          <div className="mergeToolMultiSelect flex-container">
            <div>{loadingSubMasterTables == true && <ProgressSpinner style={{ width: "40px", height: "40px" }} />}</div>
            <div>{subMasterTableFileList?.length > 0 ? <MultiSelect style={{ width: "100%" }} value={selectedSubMasterTableFiles} onChange={(e) => setSelectedSubMasterTableFiles(e.value)} options={subMasterTableFileList} optionLabel="name" className="w-full md:w-14rem margintop8px" display="chip" placeholder="Select CSV files" /> : loadingSubMasterTables == true ? <MultiSelect placeholder="Loading..." /> : <MultiSelect placeholder="No CSV files to show" />}</div>
            <div>
              <Button disabled={selectedSubMasterTableFiles?.length < 1} onClick={createMasterTable}>
                Create Master Table
              </Button>
            </div>
          </div>
          <div className="vertical-divider"></div>
          <div>{datasetList.length > 0 ? <Dropdown value={selectedMasterTable} options={datasetList.filter((value) => value.extension == "csv")} optionLabel="name" onChange={(event) => setSelectedMasterTable(event.value)} placeholder="Select a master table" /> : <Dropdown placeholder="No dataset to show" disabled />}</div>
        </div>
      </div>
      <hr></hr>
      <div className="centered-container">
        <h5>Select the location of your MEDclasses folder &nbsp;</h5>
        <div className="margin-top-15">{folderList.length > 0 ? <Dropdown value={selectedMEDclassesFolder} options={folderList} optionLabel="name" onChange={(event) => setSelectedMEDclassesFolder(event.value)} placeholder="Select a folder" /> : <Dropdown placeholder="No folder to show" disabled />}</div>
        <div className="margin-top-15">
          <Button disabled={!mayCreateClasses} onClick={createMEDclasses}>
            Create MEDclasses
          </Button>
        </div>
      </div>
      {generatedClassesFolder?.childrenIDs && classesGenerated && (
        <div className="card data-view">
          <DataView value={generatedClassesFolder.childrenIDs} itemTemplate={MEDclassesDisplay} paginator rows={5} header="Generated MEDclasses" style={{ textAlign: "center" }} />
        </div>
      )}
      <hr></hr>
      <div className="centered-container">
        <h5>Select the location of your MEDprofiles binary file &nbsp;</h5>
        <div className="margin-top-15">{folderList.length > 0 ? <Dropdown value={selectedMEDprofilesFolder} options={folderList} optionLabel="name" onChange={(event) => setSelectedMEDprofilesFolder(event.value)} placeholder="Select a folder" /> : <Dropdown placeholder="No folder to show" disabled />}</div>
        <div className="margin-top-15">
          <Button disabled={!mayInstantiateMEDprofiles} onClick={instantiateMEDprofiles}>
            Instantiate MEDprofiles
          </Button>
        </div>
      </div>
      <div className="margin-top-30 extraction-progress">{showProgressBar && <ProgressBarRequests progressBarProps={{}} isUpdating={showProgressBar} setIsUpdating={setShowProgressBar} progress={progress} setProgress={setProgress} requestTopic={"/MEDprofiles/progress"} />}</div>
      <hr></hr>
      <div className="align-center">
        <Button disabled={!generatedClassesFolder && !generatedMEDprofilesFile} onClick={openMEDprofilesViewer}>
          Open MEDprofiles Viewer
        </Button>
      </div>
    </>
  )
}

export default MEDprofilesPrepareData
