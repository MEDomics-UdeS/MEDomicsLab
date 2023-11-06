import { ToastContainer } from "react-toastify"
import React, { useState } from "react"
import Head from "next/head"
import LayoutManager from "../components/layout/layoutManager"
import { LayoutModelProvider } from "../components/layout/layoutContext"
import { WorkspaceProvider } from "../components/workspace/workspaceContext"
import { useEffect } from "react"
import { ipcRenderer } from "electron"
import { DataContextProvider } from "../components/workspace/dataContext"
import MedDataObject from "../components/workspace/medDataObject"
import { ActionContextProvider } from "../components/layout/actionContext"
import { HotkeysProvider } from "@blueprintjs/core"
import { ConfirmPopup } from "primereact/confirmpopup"
import { ConfirmDialog } from "primereact/confirmdialog"

// CSS
import "bootstrap/dist/css/bootstrap.min.css"
// import 'bootswatch/dist/lux/bootstrap.min.css';
import "react-toastify/dist/ReactToastify.css"
import "react-tooltip/dist/react-tooltip.css"
import "react-simple-tree-menu/dist/main.css"

// --primereact
import "primereact/resources/primereact.min.css"
import "primereact/resources/themes/lara-light-indigo/theme.css"
import "primeicons/primeicons.css"

// blueprintjs
import "@blueprintjs/core/lib/css/blueprint.css"
import "@blueprintjs/table/lib/css/table.css"

import "react-complex-tree/lib/style-modern.css"
import "react-contexify/dist/ReactContexify.css"
import "flexlayout-react/style/light.css"

// --my styles (priority over bootstrap and other dist styles)
import "../styles/flow/reactFlow.css"
import "../styles/globals.css"
import "../styles/learning/learning.css"
import "../styles/extraction/extractionMEDimage.css"
import "../styles/extraction/extractionTabular.css"
import "../styles/workspaceSidebar.css"
import "../styles/iconSidebar.css"
import "../styles/learning/sidebar.css"
import "../styles/flow/results.css"
import "../styles/sidebarTree.css"
import "../styles/customPrimeReact.css"
import "../styles/imageContainer.css"
import "../styles/datatableWrapper.css"
import "../styles/inputPage.css"
import "../styles/evaluation/evaluation.css"
import "../styles/output.css"

/**
 * This is the main app component. It is the root component of the app.
 * It is the parent of all other components.
 * It is the parent of the LayoutContextProvider, which provides the layout model to all components.
 * @constructor
 */
function App() {
  /* TODO: Add a dark mode toggle button  
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [theme, setTheme] = useState("light-mode")
  const darkMode = useDarkMode(false)

  useEffect(() => {
    console.log("isDarkMode", isDarkMode)
    if (isDarkMode) {
      darkMode.enable
    } else {
      darkMode.disable
    }
  }, [isDarkMode])

  useEffect(() => {
    document.documentElement.className = theme
    // localStorage.setItem("theme", themeName)
  }, [theme])
  */

  let initialLayout = {
    // this is the intial layout model for flexlayout model that is passed to the LayoutManager -- See flexlayout-react docs for more info
    global: {
      tabEnableClose: true,
      tabEnableRenderOnDemand: false,
      tabEnableRename: false,
      autoSelectTab: true
    }, // this is a global setting for all tabs in the layout, it enables the close button on all tabs
    borders: [
      // this is the border model for the layout, it defines the borders and their children
      {
        type: "border",
        location: "bottom",
        size: 100,
        children: [
          {
            type: "tab",
            name: "Terminal",
            component: "terminal"
          }
        ]
      }
    ],
    layout: {
      // the layout item contains the tabsets and the tabs inside them
      type: "row",
      weight: 100,
      children: [
        {
          type: "tabset",
          weight: 50,
          selected: 0,
          children: [
            {
              type: "tab",
              name: "JSON",
              component: "json"
            }
          ]
        }
      ]
    }
  }

  /**
   * TODO : When changing the working directory, the global data should be cleared and the new working directory should be set
   */

  /**
   * This is the state for the layout model. It is passed to the LayoutContextProvider, which provides the layout model to all components.
   * @param {Object} layoutModel - The layout model for the LayoutContextProvider
   * @param {Function} setLayoutModel - The function to set the layout model for the LayoutContextProvider
   * @description Using the useState hook, the layout model is set to the initial layout model. Then, ever
   */
  const [layoutModel, setLayoutModel] = useState(initialLayout)
  const [workspaceObject, setWorkspaceObject] = useState({
    hasBeenSet: false,
    workingDirectory: ""
  })
  const [port, setPort] = useState(5000)

  const [globalData, setGlobalData] = useState({})

  useEffect(() => {
    localStorage.clear()
  }, [])

  useEffect(() => {
    // This useEffect hook is called only once and it sets the ipcRenderer to listen for the "messageFromElectron" message from the main process
    // Log a message to the console whenever the ipcRenderer receives a message from the main process
    ipcRenderer.on("messageFromElectron", (event, data) => {
      console.log("Received message from Electron:", data)
      // Handle the received message from the Electron side
    })
  }, []) // Here, we specify that the hook should only be called at the launch of the app

  /**
   * @ReadMe
   * This useEffect hook is called only once and it sets the ipcRenderer to listen for the "updateDirectory" message from the main process
   * *important* : The update directory message is used to call an update of the working directory tree
   * The HasBeenSet property is used to prevent the workspaceObject from being updated before the working directory has been set
   * The HasBeenSet property is set to true when the workingDirectorySet message is received
   */
  useEffect(() => {
    // This useEffect hook is called only once and it sets the ipcRenderer to listen for the "workingDirectorySet" message from the main process
    // The working directory tree is stored in the workspaceObject state variable
    ipcRenderer.on("workingDirectorySet", (event, data) => {
      if (workspaceObject !== data) {
        let workspace = { ...data }
        setWorkspaceObject(workspace)
      }
    })

    ipcRenderer.on("updateDirectory", (event, data) => {
      let workspace = { ...data }
      setWorkspaceObject(workspace)
    })

    ipcRenderer.on("getFlaskPort", (event, data) => {
      console.log("flask port update from Electron:", data)
      setPort(data.newPort)
    })

    ipcRenderer.on("toggleDarkMode", () => {
      console.log("toggleDarkMode")
      // setIsDarkMode(!isDarkMode)
    })
  }, []) // Here, we specify that the hook should only be called at the launch of the app

  /**
   * @param {Object} children - The children of the current directory
   * @param {String} parentID - The UUID of the parent directory
   * @param {Object} newGlobalData - The global data object
   * @param {Array} acceptedFileTypes - The accepted file types for the current directory
   * @returns {Object} - The children IDs of the current directory
   * @description This function is used to recursively recense the directory tree and add the files and folders to the global data object
   * It is called when the working directory is set
   */
  function recursivelyRecenseTheDirectory(children, parentID, newGlobalData, acceptedFileTypes = undefined) {
    let childrenIDsToReturn = []

    children.forEach((child) => {
      let uuid = MedDataObject.checkIfMedDataObjectInContextbyName(child.name, newGlobalData, parentID)
      let objectType = "folder"
      let objectUUID = uuid
      let childrenIDs = []
      if (uuid == "") {
        let dataObject = new MedDataObject({
          originalName: child.name,
          path: child.path,
          parentID: parentID,
          type: objectType
        })

        objectUUID = dataObject.getUUID()
        let acceptedFiles = MedDataObject.setAcceptedFileTypes(dataObject, acceptedFileTypes)
        dataObject.setAcceptedFileTypes(acceptedFiles)
        if (child.children === undefined) {
          console.log("File:", child)
          objectType = "file"
          childrenIDs = null
        } else if (child.children.length == 0) {
          console.log("Empty folder:", child)
        } else {
          console.log("Folder:", child)
          let answer = recursivelyRecenseTheDirectory(child.children, objectUUID, newGlobalData, acceptedFiles)
          childrenIDs = answer.childrenIDsToReturn
        }
        dataObject.setType(objectType)
        dataObject.setChildrenIDs(childrenIDs)
        newGlobalData[objectUUID] = dataObject
        childrenIDsToReturn.push(objectUUID)
      } else {
        let dataObject = newGlobalData[uuid]
        let acceptedFiles = dataObject.acceptedFileTypes
        if (child.children !== undefined) {
          let answer = recursivelyRecenseTheDirectory(child.children, uuid, newGlobalData, acceptedFiles)
          childrenIDs = answer.childrenIDsToReturn
          newGlobalData[objectUUID]["childrenIDs"] = childrenIDs
          newGlobalData[objectUUID]["parentID"] = parentID
        }
        childrenIDsToReturn.push(uuid)
      }
    })
    return { childrenIDsToReturn: childrenIDsToReturn }
  }

  /**
   * Gets the children paths of the children passed as a parameter
   * @param {Object} children - The children of the current directory
   * @returns {Array} - The children paths of the current directory
   * @description This function is used to recursively recense the directory tree and add the files and folders to the global data object
   */
  const getChildrenPaths = (children) => {
    let childrenPaths = []
    children.forEach((child) => {
      childrenPaths.push(child.path)
      if (child.children !== undefined) {
        let answer = getChildrenPaths(child.children)
        childrenPaths = childrenPaths.concat(answer)
      }
    })
    return childrenPaths
  }

  /**
   * Creates a list of files not found in the workspace
   * @param {Object} currentWorkspace - The current workspace
   * @param {Object} currentGlobalData - The current global data
   * @returns {Array} - The list of files not found in the workspace
   */
  const createListOfFilesNotFoundInWorkspace = (currentWorkspace, currentGlobalData) => {
    let listOfFilesNotFoundInWorkspace = []
    let workspaceChildren = currentWorkspace.workingDirectory.children
    let workspaceChildrenPaths = []
    if (workspaceChildren !== undefined) {
      workspaceChildrenPaths = getChildrenPaths(workspaceChildren)
    } else {
      return listOfFilesNotFoundInWorkspace
    }

    Object.keys(currentGlobalData).forEach((key) => {
      let dataObject = currentGlobalData[key]
      let filePath = dataObject.path
      if (!workspaceChildrenPaths.includes(filePath)) {
        listOfFilesNotFoundInWorkspace.push(dataObject._UUID)
      }
    })
    return listOfFilesNotFoundInWorkspace
  }

  /**
   * Cleans the global data from files and folders not found in the workspace
   * @param {Object} workspace - The current workspace
   * @param {Object} dataContext - The current global data
   * @returns {Object} - The new global data
   */
  const cleanGlobalDataFromFilesNotFoundInWorkspace = (workspace, dataContext) => {
    let newGlobalData = { ...dataContext }
    let listOfFilesNotFoundInWorkspace = createListOfFilesNotFoundInWorkspace(workspace, dataContext)
    console.log("listOfFilesNotFoundInWorkspace", listOfFilesNotFoundInWorkspace)
    listOfFilesNotFoundInWorkspace.forEach((file) => {
      if (newGlobalData[file] !== undefined && file !== "UUID_ROOT") delete newGlobalData[file]
    })
    return newGlobalData
  }

  /**
   * Checks if a metadata file exists in the workspace
   */
  const checkIfMetadataFileExists = () => {
    // Check if a file ending with .medomics exists in the workspace directory
    let metadataFileExists = false
    let workspaceChildren = workspaceObject.workingDirectory.children
    workspaceChildren.forEach((child) => {
      console.log("child", child)
      if (child.name == ".medomics") {
        metadataFileExists = true
      }
    })
    return metadataFileExists
  }

  // This useEffect hook is called whenever the `workspaceObject` state changes.
  useEffect(() => {
    const updateGlobalData = async () => {
      // Create a copy of the `globalData` state object.
      let newGlobalData = { ...globalData }
      // Check if the `workingDirectory` property of the `workspaceObject` has been set.
      if (workspaceObject.hasBeenSet === true) {
        // Loop through each child of the `workingDirectory`.

        let metadataFileExists = checkIfMetadataFileExists()
        if (metadataFileExists && Object.keys(globalData).length == 0) {
          // Load the global data from the metadata file
          newGlobalData = await loadGlobalDataFromFile()
        }
        let rootChildren = workspaceObject.workingDirectory.children
        let rootParentID = "UUID_ROOT"
        let rootName = workspaceObject.workingDirectory.name
        let rootPath = workspaceObject.workingDirectory.path
        let rootType = "folder"
        let rootChildrenIDs = recursivelyRecenseTheDirectory(rootChildren, rootParentID, newGlobalData).childrenIDsToReturn

        let rootDataObject = new MedDataObject({
          originalName: rootName,
          path: rootPath,
          parentID: rootParentID,
          type: rootType,
          childrenIDs: rootChildrenIDs,
          _UUID: rootParentID
        })
        newGlobalData[rootParentID] = rootDataObject
      }
      // Clean the globalData from files & folders that are not in the workspace
      newGlobalData = cleanGlobalDataFromFilesNotFoundInWorkspace(workspaceObject, newGlobalData)

      // Update the `globalData` state object with the new `newGlobalData` object.
      setGlobalData(newGlobalData)
    }
    updateGlobalData()
  }, [workspaceObject])

  // This useEffect hook is called whenever the `workspaceObject` state changes.
  useEffect(() => {
    console.log("workspaceObject changed", workspaceObject)
  }, [workspaceObject])

  /**
   * Function that saves a JSON Object to a file to a specified path
   * @param {Object} objectToSave - The object to save
   * @param {String} path - The path to save the object to
   * @returns {Promise} - A promise that resolves when the object is saved
   */
  const saveObjectToFile = (objectToSave, path) => {
    return new Promise((resolve, reject) => {
      // eslint-disable-next-line no-undef
      const fsx = require("fs-extra")
      fsx.writeFile(path, JSON.stringify(objectToSave, null, 2), (err) => {
        if (err) {
          console.error(err)
          reject(err)
        }
        resolve()
      })
    })
  }

  /**
   * Parse the global data so that the objects are MedDataObjects
   * @param {Object} globalData - The global data to parse
   * @returns {Object} - The parsed global data
   */
  const parseGlobalData = (globalData) => {
    let parsedGlobalData = {}
    Object.keys(globalData).forEach((key) => {
      let dataObject = globalData[key]
      let parsedDataObject = new MedDataObject(dataObject)
      parsedGlobalData[key] = parsedDataObject
    })
    return parsedGlobalData
  }

  /**
   * Load the global data from a file
   */
  const loadGlobalDataFromFile = () => {
    return new Promise((resolve, reject) => {
      // eslint-disable-next-line no-undef
      const fsx = require("fs-extra")
      let path = workspaceObject.workingDirectory.path + "/.medomics"
      fsx.readFile(path + "/globalData.json", "utf8", (err, data) => {
        if (err) {
          console.error(err)
          reject(err)
        }
        resolve(parseGlobalData(JSON.parse(data)))
      })
    })
  }

  // This useEffect hook is called whenever the `globalData` state changes.
  useEffect(() => {
    console.log("globalData changed", globalData)
    // Save the global data to a file
    if (workspaceObject.hasBeenSet === true) {
      let path = workspaceObject.workingDirectory.path + "/.medomics"
      // Check if the .medomics folder exists
      // eslint-disable-next-line no-undef
      const fsx = require("fs-extra")
      fsx.ensureDirSync(workspaceObject.workingDirectory.path + "/.medomics")
      // Save the global data to a file
      saveObjectToFile(globalData, path + "/globalData.json")
    }
  }, [globalData])

  // This useEffect hook is called whenever the `layoutModel` state changes.
  useEffect(() => {
    // Log a message to the console whenever the layoutModel state variable changes
    console.log("layoutModel changed", layoutModel)
  }, [layoutModel]) // Here, we specify that the hook should only be called when the layoutModel state variable changes

  // This useEffect hook is called at the beginning of the app to clear the localStorage
  // useEffect(() => {
  //   localStorage.clear()
  // }, [])
  return (
    <>
      <Head>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
        <title>MedomicsLab App</title>
        {/* <script src="http://localhost:8097"></script> */}
        {/* Uncomment if you want to use React Dev tools */}
      </Head>
      <div style={{ height: "100%", width: "100%" }}>
        <HotkeysProvider>
          <ActionContextProvider>
            <DataContextProvider globalData={globalData} setGlobalData={setGlobalData}>
              <WorkspaceProvider workspace={workspaceObject} setWorkspace={setWorkspaceObject} port={port} setPort={setPort}>
                <LayoutModelProvider // This is the LayoutContextProvider, which provides the layout model to all the children components of the LayoutManager
                  layoutModel={layoutModel}
                  setLayoutModel={setLayoutModel}
                >
                  {/* This is the WorkspaceProvider, which provides the workspace model to all the children components of the LayoutManager */}
                  {/* This is the LayoutContextProvider, which provides the layout model to all the children components of the LayoutManager */}
                  <LayoutManager layout={initialLayout} />
                  {/** We pass the initialLayout as a parameter */}
                </LayoutModelProvider>
              </WorkspaceProvider>
            </DataContextProvider>
          </ActionContextProvider>
        </HotkeysProvider>
        <ConfirmPopup />
        <ConfirmDialog />
        <ToastContainer // This is the ToastContainer, which is used to display toast notifications
          position="bottom-right"
          autoClose={2000}
          limit={3}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </div>
    </>
  )
}

export default App
