import Button from "react-bootstrap/Button"
import { DataContext } from "../../workspace/dataContext"
import { DataFrame } from "danfojs"
import { DataView } from "primereact/dataview"
import { Dropdown } from "primereact/dropdown"
import { ErrorRequestContext } from "../../generalPurpose/errorRequestContext"
import { InputText } from "primereact/inputtext"
import { LayoutModelContext } from "../../layout/layoutContext"
import { loadCSVPath } from "../../../utilities/fileManagementUtils"
import MedDataObject from "../../workspace/medDataObject"
import { Message } from "primereact/message"
import { MultiSelect } from "primereact/multiselect"
import { PageInfosContext } from "../../mainPages/moduleBasics/pageInfosContext"
import ProgressBar from "react-bootstrap/ProgressBar"
import { ProgressSpinner } from "primereact/progressspinner"
import React, { useContext, useEffect, useState } from "react"
import { requestBackend } from "../../../utilities/requests"
import { toast } from "react-toastify"
import { WorkspaceContext } from "../../workspace/workspaceContext"
import { getPathSeparator } from "../../../utilities/fileManagementUtils"

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
  const [binaryFileList, setBinaryFileList] = useState([]) // list of available binary files
  const [binaryFilename, setBinaryFilename] = useState("MEDprofiles_bin.pkl") // name under which the MEDprofiles binary file will be saved
  const [creatingMEDclasses, setCreatingMEDclasses] = useState(false) // boolean telling if the process of MEDclasses creation is running
  const [csvPathsList, setCsvPathsList] = useState([]) // list of csv paths in data folder
  const [dataFolder, setDataFolder] = useState(null) // folder where the csv files will be examinated and where the MEDprofiles data will be saved
  const [folderList, setFolderList] = useState([]) // list of available folders in DATA folder
  const [generatedClassesFolder, setGeneratedClassesFolder] = useState(null) // folder containing the generated MEDclasses
  const [generatedClassesFolderPath, setGeneratedClassesFolderPath] = useState(null) // path of the folder containing the generated MEDclasses
  const [generatedMasterPath, setGeneratedMasterPath] = useState(null) // path of the last generated master table
  const [generatedMEDprofilesFile, setGeneratedMEDprofilesFile] = useState(null) // file containing the generated MEDprofiles binary file
  const [generatedMEDprofilesFilePath, setGeneratedMEDprofilesFilePath] = useState(null) // path of the file containing the generated MEDprofiles binary file
  const [instantiatingMEDprofiles, setInstantiatingMEDprofiles] = useState(false) // boolean telling if the process of instantiating MEDprofiles is running
  const [loadingMasterTables, setLoadingMasterTables] = useState(false) // boolean telling if the csv analyse for mastertable is processing
  const [loadingSubMasterTables, setLoadingSubMasterTables] = useState(false) // boolean telling if the csv analyse for submaster is processing
  const [masterFilename, setMasterFilename] = useState("master_table.csv") // name under which the created master_table will be saved
  const [masterTableFileList, setMasterTableFileList] = useState([]) // list of csv data matching the "MasterTable" format
  const [matchingIdColumns, setMatchingIdColumns] = useState(true) // boolean false if the selected submaster tables doesn't have the same id columns types
  const [MEDclassesFolderList, setMEDclassesFolderList] = useState([]) // list of the folder that may contain MEDclasses
  const [MEDprofilesFolderPath, setMEDprofilesFolderPath] = useState(null) // MEDprofiles folder path
  const [progressNumber, setProgressNumber] = useState(0) // Progress number
  const [progressStep, setProgressStep] = useState("") // Progress step
  const [rootDataFolder, setRootDataFolder] = useState(null) // DATA folder
  const [selectedMasterTable, setSelectedMasterTable] = useState(null) // dataset of data to extract used to be display
  const [selectedSubMasterTableFiles, setSelectedSubMasterTableFiles] = useState(null) // selected csv for master table creation
  const [subMasterTableFileList, setSubMasterTableFileList] = useState([]) // list of csv data matching the "Sub-MasterTable" format
  const [showProgressBar, setShowProgressBar] = useState(false) // wether to show or not the extraction progressbar

  const { dispatchLayout } = useContext(LayoutModelContext) // used to open the MEDprofiles Viewer tab
  const { globalData } = useContext(DataContext) // we get the global data from the context to retrieve the directory tree of the workspace, thus retrieving the data files
  const { pageId } = useContext(PageInfosContext) // used to get the pageId
  const { port } = useContext(WorkspaceContext) // we get the port for server connexion
  const { setError } = useContext(ErrorRequestContext) // used to diplay the errors

  /**
   * @description
   * This functions get all folders from the DataContext DATA folder and update folderList.
   */
  function getFolderListFromDataContext() {
    let keys = Object.keys(globalData)
    let folderListToShow = []
    keys.forEach((key) => {
      if (globalData[key].type == "directory" && globalData[key].path.includes("DATA")) {
        folderListToShow.push(globalData[key])
      }
    })
    setFolderList(folderListToShow)
  }

  /**
   * @description
   * This functions get all binary files from the DataContext DATA folder and update binaryFileList.
   */
  function getBinaryFileList() {
    let keys = Object.keys(globalData)
    let tmpList = []
    keys.forEach((key) => {
      if (globalData[key].type == "pkl" && globalData[key].path.includes("DATA")) {
        tmpList.push(globalData[key])
      }
    })
    setBinaryFileList(tmpList)
  }

  /**
   * @description
   * This functions get all binary files from the DataContext DATA folder and update binaryFileList.
   */
  function getCsvPathList() {
    let keys = Object.keys(globalData)
    let tmpList = []
    keys.forEach((key) => {
      if (globalData[key].path.includes(dataFolder.path) && globalData[key].type == "csv") {
        tmpList.push(globalData[key].path)
      }
    })
    setCsvPathsList(tmpList)
  }

  /**
   * @description
   * This functions get all the MEDclasses folders from the DataContext DATA folder and update MEDclassesFolderList.
   */
  function getMEDclassesFolderList() {
    let keys = Object.keys(globalData)
    let folderListToShow = []
    keys.forEach((key) => {
      if (
        globalData[key].type == "directory" &&
        globalData[key].name == "MEDclasses" &&
        globalData[key].path.includes("DATA") &&
        globalData[key]?.parentID &&
        globalData[globalData[key]?.parentID].name == "MEDclasses"
      ) {
        folderListToShow.push(globalData[key])
      }
    })
    setMEDclassesFolderList(folderListToShow)
  }

  /**
   *
   * @param {String} path
   * @param {Function} setter
   *
   * @description
   * This functions is called when the MEDclasses or the MEDprofiles'
   * binary file have been generated.
   *
   */
  function getGeneratedElement(path, setter) {
    let keys = Object.keys(globalData)
    keys.forEach((key) => {
      if (globalData[key].path == path) {
        setter(globalData[key])
      }
    })
  }

  /**
   *
   * @param {List[String]} pathList
   * @param {Function} setter
   *
   * @description
   * This functions is called when csvFilePaths matching
   * master and submaster format have been returned.
   *
   */
  function getListOfGeneratedElement(pathList, setter) {
    let keys = Object.keys(globalData)
    let tmpList = []
    keys.forEach((key) => {
      if (pathList.includes(globalData[key].path)) {
        tmpList.push(globalData[key])
      }
    })
    setter(tmpList)
  }

  /**
   * @description
   * Open the MEDprofilesViewerPage, depending on generatedClassesFolder and generatedMEDprofilesFile
   */
  function openMEDprofilesViewer() {
    dispatchLayout({ type: `openMEDprofilesViewerModule`, payload: { pageId: "MEDprofilesViewer", MEDclassesFolder: generatedClassesFolder, MEDprofilesBinaryFile: generatedMEDprofilesFile } })
  }

  /**
   *
   * @param {String} name
   *
   * @description
   * Called when the user change the name under which the master table
   * file will be saved.
   *
   */
  const handleMasterFilenameChange = (name) => {
    if (name.match("^[a-zA-Z0-9_]+.csv$") != null) {
      setMasterFilename(name)
    }
  }

  /**
   *
   * @param {String} name
   *
   * @description
   * Called when the user change the name under which the master table
   * file will be saved.
   *
   */
  const handleBinaryFilenameChange = (name) => {
    if (name.match("^[a-zA-Z0-9_]+.pkl$") != null) {
      setBinaryFilename(name)
    }
  }

  /**
   * @description
   * Calls the create_master_table method in the MEDprofiles server
   */
  const createMasterTable = () => {
    // Get paths of the MedDataObjects
    let keys = Object.keys(selectedSubMasterTableFiles)
    let csvPaths = []
    keys.forEach((key) => {
      csvPaths.push(selectedSubMasterTableFiles[key].path)
    })
    // Run extraction process
    requestBackend(
      port,
      "/MEDprofiles/create_master_table/" + pageId,
      {
        csvPaths: csvPaths,
        masterTableFolder: MEDprofilesFolderPath + getPathSeparator() + "master_tables",
        filename: masterFilename,
        pageId: pageId
      },
      (jsonResponse) => {
        console.log("createMasterTable received results:", jsonResponse)
        if (!jsonResponse.error) {
          MedDataObject.updateWorkspaceDataObject()
          setGeneratedMasterPath(jsonResponse["master_table_path"])
        } else {
          toast.error(`Creation failed: ${jsonResponse.error.message}`)
          setError(jsonResponse.error)
        }
      },
      function (err) {
        console.error(err)
        toast.error(`Creation failed: ${err}`)
      }
    )
  }

  /**
   * @description
   * This function calls the create_MEDclasses method in the MEDprofiles server
   */
  const createMEDclasses = () => {
    setCreatingMEDclasses(true)
    // Run extraction process
    requestBackend(
      port,
      "/MEDprofiles/create_MEDclasses/" + pageId,
      {
        masterTablePath: selectedMasterTable.path,
        MEDprofilesFolderPath: MEDprofilesFolderPath,
        pageId: pageId
      },
      (jsonResponse) => {
        console.log("received results:", jsonResponse)
        if (!jsonResponse.error) {
          MedDataObject.updateWorkspaceDataObject()
          setGeneratedClassesFolderPath(jsonResponse["generated_MEDclasses_folder"])
        } else {
          toast.error(`Creation failed: ${jsonResponse.error.message}`)
          setError(jsonResponse.error)
        }
        setCreatingMEDclasses(false)
      },
      function (err) {
        console.error(err)
        toast.error(`Creation failed: ${err}`)
        setCreatingMEDclasses(false)
      }
    )
  }

  /**
   * @description
   * This function checks if the MEDprofiles folder exists and creates it if it doesn't.
   */
  const checkMEDprofilesFolder = () => {
    let keys = Object.keys(globalData)
    let folderExists = false
    keys.forEach((key) => {
      if (globalData[key].path == MEDprofilesFolderPath) {
        folderExists = true
      }
    })
    return folderExists
  }

  /**
   * @description
   * This function calls the create_MEDprofiles_folder method in the MEDprofiles server
   */
  const createMEDprofilesFolder = () => {
    // Run extraction process
    requestBackend(
      port,
      "/MEDprofiles/create_MEDprofiles_folder/" + pageId,
      {
        rootDataFolder: rootDataFolder.path,
        pageId: pageId
      },
      (jsonResponse) => {
        console.log("received results:", jsonResponse)
        if (!jsonResponse.error) {
          MedDataObject.updateWorkspaceDataObject()
          setMEDprofilesFolderPath(jsonResponse["MEDprofiles_folder"])
        } else {
          toast.error(`Creation failed: ${jsonResponse.error.message}`)
          setError(jsonResponse.error)
          setLoadingMasterTables(false)
          setLoadingSubMasterTables(false)
        }
      },
      function (err) {
        console.error(err)
        toast.error(`Creation failed: ${err}`)
      }
    )
  }

  /**
   * @description
   * This function calls the get_master_csv method in the MEDprofiles server
   * It updates list of masterTableFileList and submasterTableFileList
   */
  const getMasterSubMasterCsv = () => {
    // Run extraction process
    requestBackend(
      port,
      "/MEDprofiles/get_master_csv/" + pageId,
      {
        csvPaths: csvPathsList,
        pageId: pageId
      },
      (jsonResponse) => {
        if (!jsonResponse.error) {
          if (jsonResponse["master_csv"].length == 0) {
            console.warn("No csv matching the master table format found in the selected folder")
            toast.warn("No csv matching the master table format found in the selected folder")
          } else {
            getListOfGeneratedElement(jsonResponse["master_csv"], setMasterTableFileList)
          }
          if (jsonResponse["submaster_csv"].length == 0) {
            console.warn("No csv matching the submaster table format found in the selected folder")
            toast.warn("No csv matching the submaster table format found in the selected folder")
          } else {
            getListOfGeneratedElement(jsonResponse["submaster_csv"], setSubMasterTableFileList)
          }
          setLoadingMasterTables(false)
          setLoadingSubMasterTables(false)
        } else {
          toast.error(`Loading csv matching formats failed: ${jsonResponse.error.message}`)
          setLoadingMasterTables(false)
          setLoadingSubMasterTables(false)
          setError(jsonResponse.error)
        }
      },
      function (err) {
        console.error(err)
        toast.error(`Loading csv matching formats failed: ${err}`)
      }
    )
  }

  /**
   * @description
   * Run the initialization process for MEDprofiles instantiation.
   * Allows to create the binary file and to get the patient list.
   * @returns jsonResponse
   */
  async function initializeMEDprofilesInstantiation() {
    return new Promise((resolve, reject) => {
      requestBackend(
        port,
        "/MEDprofiles/initialize_MEDprofiles_instantiation/" + pageId,
        {
          masterTablePath: selectedMasterTable.path,
          MEDprofilesFolderPath: MEDprofilesFolderPath,
          filename: binaryFilename,
          pageId: pageId
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
  async function runMEDprofilesInstantiation(processingList, destinationFile) {
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
          setProgressNumber(progress.toFixed(2))
          requestBackend(
            port,
            "/MEDprofiles/instantiate_MEDprofiles/" + pageId,
            {
              masterTablePath: selectedMasterTable.path,
              MEDprofilesFolderPath: MEDprofilesFolderPath,
              destinationFile: destinationFile,
              patientList: subList,
              pageId: pageId
            },
            (response) => resolve(response),
            (error) => reject(error)
          )
        })
        if (jsonResponse.error) {
          toast.error(`Instantiation failed: ${jsonResponse.error.message}`)
          setError(jsonResponse.error)
        }
      } catch (err) {
        console.error(err)
        toast.error(`Instantiation failed: ${err}`)
        return
      }
    }
  }

  /**
   * @description
   * This function calls the instantiate_MEDprofiles method in the MEDprofiles server
   */
  const instantiateMEDprofiles = async () => {
    setInstantiatingMEDprofiles(true)
    setShowProgressBar(true)
    setProgressNumber(0)
    setProgressStep("Initialization")
    // Initialize instantiation process
    let jsonInitialization = await initializeMEDprofilesInstantiation()
    // Run MEDprofiles instantiation process
    setProgressStep("Instantiating data")
    if (!jsonInitialization.error) {
      let processingList = jsonInitialization["patient_list"]
      let destinationFile = jsonInitialization["destination_file"]
      await runMEDprofilesInstantiation(processingList, destinationFile)
      MedDataObject.updateWorkspaceDataObject()
      setGeneratedMEDprofilesFilePath(destinationFile)
    } else {
      toast.error(`Instantiation failed: ${jsonInitialization.error.message}`)
      setError(jsonInitialization.error)
    }
    setShowProgressBar(false)
    setInstantiatingMEDprofiles(false)
  }

  // Look of items in the MEDclasses DataView
  const MEDclassesDisplay = (element) => {
    let name = globalData[element]?.name
    if (name.includes(".")) {
      return <div>{name.split(".").slice(0, -1).join(".")}</div>
    } else {
      return
    }
  }

  // Called when csvPathsList is updated, in order to load the matching files for submastertable and mastertable
  useEffect(() => {
    if (csvPathsList.length > 0) {
      getMasterSubMasterCsv()
    } else {
      setLoadingMasterTables(false)
      setLoadingSubMasterTables(false)
    }
  }, [csvPathsList])

  // Called when dataFolder is updated, in order to load the matching files for submastertable and mastertable
  useEffect(() => {
    if (dataFolder !== null) {
      setLoadingMasterTables(true)
      setLoadingSubMasterTables(true)
      setSubMasterTableFileList([])
      setMasterTableFileList([])
      setSelectedSubMasterTableFiles(null)
      setSelectedMasterTable(null)
      getCsvPathList()
      //getSubMasterTableFileList(dataFolder)
      //getMasterTableFileList(dataFolder)
    } else {
      setSelectedSubMasterTableFiles(null)
      setSelectedMasterTable(null)
    }
  }, [dataFolder])

  // Called while global data is updated in order to get the DATA folder, to update the available folder list,
  // to set default selected folder to "MEDprofiles/master_tables" or "extracted_features" if one of the folder exists
  // and to get the generated classes folder and the MEDprofiles binary file
  useEffect(() => {
    if (globalData !== undefined) {
      getFolderListFromDataContext()
      getBinaryFileList()
      getMEDclassesFolderList()
      if (generatedClassesFolderPath) {
        getGeneratedElement(generatedClassesFolderPath, setGeneratedClassesFolder)
      }
      if (generatedMEDprofilesFilePath) {
        getGeneratedElement(generatedMEDprofilesFilePath, setGeneratedMEDprofilesFile)
      }
      let keys = Object.keys(globalData)
      keys.forEach((key) => {
        if (
          globalData[key].type == "directory" &&
          globalData[key].name == "master_tables" &&
          globalData[key].path?.includes("DATA") &&
          globalData[key].path?.includes("MEDprofiles") &&
          globalData[key].childrenIDs?.length > 0
        ) {
          setDataFolder(globalData[key])
        } else if (dataFolder == null && globalData[key].type == "directory" && globalData[key].name == "extracted_features" && globalData[key].path?.includes("DATA")) {
          setDataFolder(globalData[key])
        } else if (globalData[key].type == "directory" && globalData[key].name == "DATA" && (globalData[key].parentID == "UUID_ROOT" || globalData[key].parentID == "ROOT")) {
          if (globalData[key] !== rootDataFolder){
            setRootDataFolder(globalData[key])
          }
        }
      })
    }
  }, [globalData])

  // Called while rootDataFolder is updated in order to create the MEDprofiles folder
  useEffect(() => {
    if (rootDataFolder && !checkMEDprofilesFolder()) {
      createMEDprofilesFolder()
    }
  }, [rootDataFolder])

  // Called while selectedSubMasterTableFiles is updated in order to update matchingIdColumns
  useEffect(() => {
    if (selectedSubMasterTableFiles && selectedSubMasterTableFiles.length > 1) {
      let idTypes = []
      let keys = Object.keys(selectedSubMasterTableFiles)

      // Load the CSV file in order to check if the data is matching the required format
      const loadCSVFile = (MEDdata) => {
        // Create a promise for each CSV file
        return new Promise((resolve) => {
          loadCSVPath(MEDdata.path, (data) => {
            let dataframe = new DataFrame(data)
            idTypes.push(dataframe.$dtypes[0])
            resolve()
          })
        })
      }

      // Create a promises array for all the csv files
      const promises = keys.map((key) => loadCSVFile(selectedSubMasterTableFiles[key]))

      // Wait for all the csv files to have been examinated
      Promise.all(promises)
        .then(() => {
          setMatchingIdColumns(idTypes.every((value) => value === idTypes[0]))
          console.log(
            "TYPES",
            idTypes,
            idTypes.every((value) => value === idTypes[0])
          )
        })
        .catch((error) => {
          toast.error("Error while loading MEDdata :", error)
        })
    } else {
      setMatchingIdColumns(true)
    }
  }, [selectedSubMasterTableFiles])

  return (
    <>
      <div className="margin-top-15 margin-bottom-15 center">
        <Message
          content={
            <div>
              <i className="pi pi-info-circle" />
              &nbsp; This tool is an implementation of the
              <i>
                <a href="https://github.com/MEDomics-UdeS/MEDprofiles" target="_blank">
                  {" "}
                  MEDprofiles package
                </a>
              </i>
              .
            </div>
          }
        />
      </div>
      <div>
        <div className="margin-top-15 centered-container">
          <h5>Select the location of your master table data folder &nbsp;</h5>
          <div className="margin-top-15">
            {folderList.length > 0 ? (
              <Dropdown
                value={dataFolder}
                options={folderList}
                filter
                optionLabel="name"
                onChange={(event) => setDataFolder(event.value)}
                placeholder="Select a folder"
                disabled={loadingMasterTables || loadingSubMasterTables}
              />
            ) : (
              <Dropdown placeholder="No folder to show" disabled />
            )}
          </div>
        </div>
        <hr></hr>
        <div className="margin-top-15">
          <h5 className="align-center">Create or Select your master table</h5>
          <div className="align-center">
            <Message severity="info" text="Only the files matching the required format will be shown" />
          </div>
          <div className="align-center">{!matchingIdColumns && <Message severity="warn" text="Your selected csv for master table creation contains different types for identifier columns" />}</div>
        </div>
        <div className="margin-top-15 flex-container">
          <div className="mergeToolMultiSelect">
            {loadingSubMasterTables == true && <ProgressSpinner style={{ width: "40px", height: "40px" }} />}
            {subMasterTableFileList?.length > 0 ? (
              <MultiSelect
                style={{ maxWidth: "200px" }}
                value={selectedSubMasterTableFiles}
                onChange={(e) => setSelectedSubMasterTableFiles(e.value)}
                options={subMasterTableFileList}
                optionLabel="name"
                className="w-full md:w-14rem margintop8px"
                display="chip"
                placeholder="Select CSV files"
              />
            ) : loadingSubMasterTables == true ? (
              <MultiSelect placeholder="Loading..." disabled />
            ) : (
              <MultiSelect placeholder="No CSV files to show" disabled />
            )}
            <div>
              <Button disabled={!selectedSubMasterTableFiles || selectedSubMasterTableFiles?.length < 1 || !matchingIdColumns} onClick={createMasterTable}>
                Create Master Table
              </Button>
            </div>
          </div>
          <div>
            Save master table as : &nbsp;
            <InputText value={masterFilename} onChange={(e) => handleMasterFilenameChange(e.target.value)} />
          </div>
          <div className="vertical-divider"></div>
          <div>{loadingMasterTables == true && <ProgressSpinner style={{ width: "40px", height: "40px" }} />}</div>
          <div>
            {masterTableFileList.length > 0 ? (
              <Dropdown value={selectedMasterTable} options={masterTableFileList} optionLabel="name" onChange={(event) => setSelectedMasterTable(event.value)} placeholder="Select a master table" />
            ) : loadingMasterTables == true ? (
              <Dropdown placeholder="Loading..." disabled />
            ) : (
              <Dropdown placeholder="No CSV files to show" disabled />
            )}
          </div>
        </div>
        <div className="margin-top-15">{generatedMasterPath && <>Master Table generated at : {generatedMasterPath}</>}</div>
      </div>
      <hr></hr>
      <div className="centered-container">
        <Button disabled={!selectedMasterTable || creatingMEDclasses} onClick={createMEDclasses}>
          Create MEDclasses
        </Button>
      </div>
      {generatedClassesFolder?.childrenIDs && (
        <div className="card data-view">
          <DataView value={generatedClassesFolder.childrenIDs} itemTemplate={MEDclassesDisplay} paginator rows={5} header="Generated MEDclasses" style={{ textAlign: "center" }} />
        </div>
      )}
      <hr></hr>
      <div className="margin-top-15 flex-container">
        <div>
          Save MEDprofiles binary file as : &nbsp;
          <InputText value={binaryFilename} onChange={(e) => handleBinaryFilenameChange(e.target.value)} />
        </div>
        <div>
          <Button disabled={!selectedMasterTable || instantiatingMEDprofiles || !generatedClassesFolder?.childrenIDs} onClick={instantiateMEDprofiles}>
            Instantiate MEDprofiles
          </Button>
        </div>
      </div>
      <div className="margin-top-15 extraction-progress">
        {showProgressBar && (
          <div className="progress-bar-requests">
            <label>{progressStep}</label>
            <ProgressBar now={progressNumber} label={`${progressNumber}%`} />
          </div>
        )}
      </div>
      <hr></hr>
      <h5 className="margin-top-15 align-center">Visualize your MEDprofiles data</h5>
      <div className="margin-top-15 flex-container">
        <div>
          MEDclasses folder : &nbsp;
          {MEDclassesFolderList.length > 0 ? (
            <Dropdown
              style={{ width: "250px" }}
              value={generatedClassesFolder}
              options={MEDclassesFolderList}
              onChange={(event) => setGeneratedClassesFolder(event.value)}
              optionLabel="path"
              placeholder="Select your MEDclasses folder"
            />
          ) : (
            <Dropdown placeholder="No Folder to show" disabled />
          )}
        </div>
        <div>
          MEDprofiles binary file : &nbsp;
          {binaryFileList.length > 0 ? (
            <Dropdown
              style={{ width: "250px" }}
              value={generatedMEDprofilesFile}
              options={binaryFileList}
              onChange={(event) => setGeneratedMEDprofilesFile(event.value)}
              optionLabel="name"
              placeholder="Select your MEDprofiles binary file"
            />
          ) : (
            <Dropdown placeholder="No file to show" disabled />
          )}
        </div>
        <div>
          <Button disabled={!generatedClassesFolder || !generatedMEDprofilesFile} onClick={openMEDprofilesViewer}>
            Open MEDprofiles Viewer
          </Button>
        </div>
      </div>
    </>
  )
}

export default MEDprofilesPrepareData
