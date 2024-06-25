import { ToastContainer } from "react-toastify"
import React, { useEffect, useState } from "react"
import Head from "next/head"
import LayoutManager from "../components/layout/layoutManager"
import { LayoutModelProvider } from "../components/layout/layoutContext"
import { WorkspaceProvider } from "../components/workspace/workspaceContext"
import { ipcRenderer } from "electron"
import { DataContextProvider } from "../components/workspace/dataContext"
import { ActionContextProvider } from "../components/layout/actionContext"
import { HotkeysProvider } from "@blueprintjs/core"
import { ConfirmPopup } from "primereact/confirmpopup"
import { ConfirmDialog } from "primereact/confirmdialog"
import { ServerConnectionProvider } from "../components/serverConnection/connectionContext"
import { loadMEDDataObjects, updateGlobalData } from "./appUtils/globalDataUtils"

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
import "../styles/input/MEDprofiles.css"
import "../styles/workspaceSidebar.css"
import "../styles/iconSidebar.css"
import "../styles/DBtreeSidebar.css"
import "../styles/learning/sidebar.css"
import "../styles/flow/results.css"
import "../styles/sidebarTree.css"
import "../styles/customPrimeReact.css"
import "../styles/imageContainer.css"
import "../styles/datatableWrapper.css"
import "../styles/inputPage.css"
import "../styles/evaluation/evaluation.css"
import "../styles/output.css"
import "../styles/exploratory/exploratory.css"
import "../styles/application/application.css"

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
  const [recentWorkspaces, setRecentWorkspaces] = useState([]) // The list of recent workspaces
  const [port, setPort] = useState() // The port of the server

  const [globalData, setGlobalData] = useState({}) // The global data object

  /**
   * @ReadMe
   * This useEffect hook is called only once and it sets the ipcRenderer to listen for the "updateDirectory" message from the main process
   * *important* : The update directory message is used to call an update of the working directory tree
   * The HasBeenSet property is used to prevent the workspaceObject from being updated before the working directory has been set
   * The HasBeenSet property is set to true when the workingDirectorySet message is received
   */
  useEffect(() => {
    localStorage.clear()
    // This useEffect hook is called only once and it sets the ipcRenderer to listen for the "messageFromElectron" message from the main process
    // Log a message to the console whenever the ipcRenderer receives a message from the main process
    ipcRenderer.on("messageFromElectron", (event, data) => {
      console.log("Received message from Electron:", data)
      // Handle the received message from the Electron side
    })

    ipcRenderer.on("setWorkingDirectoryInApp", (event, data) => {
      ipcRenderer.invoke("setWorkingDirectory", data).then((data) => {
        if (workspaceObject !== data) {
          let workspace = { ...data }
          setWorkspaceObject(workspace)
        }
      })
    })

    // This useEffect hook is called only once and it sets the ipcRenderer to listen for the "workingDirectorySet" message from the main process
    // The working directory tree is stored in the workspaceObject state variable
    /* ipcRenderer.on("workingDirectorySet", (event, data) => {
      if (workspaceObject !== data) {
        let workspace = { ...data }
        setWorkspaceObject(workspace)
      }
    }) */

    /**
     * IMPORTANT - Related to the MongoDB
     */
    /* ipcRenderer.on("DBSet", (event, data) => {
      if (DBObject !== data) {
        let DB = { ...data }
        setDBObject(DB)
      }
    })

    ipcRenderer.on("collections", (event, collections) => {
      let treeCollections = collections.map((item) => ({
        key: item,
        label: item,
        icon: "pi pi-folder"
      }))
      setDBData(treeCollections)
    })

    ipcRenderer.on("collection-data", (event, data) => {
      let collData = data.map((item) => {
        let keys = Object.keys(item)
        let values = Object.values(item)
        let dataObject = {}
        for (let i = 0; i < keys.length; i++) {
          dataObject[keys[i]] = values[i]
        }
        return dataObject
      })
      setCollectionData(collData)
    })
 */
    /*  ipcRenderer.on("updateDirectory", (event, data) => {
      let workspace = { ...data }
      setWorkspaceObject(workspace)
      // Send IPC event to main process to start MongoDB
      //ipcRenderer.send("change-workspace", data.workingDirectory.path)
    }) */

    ipcRenderer.on("getServerPort", (event, data) => {
      console.log("server port update from Electron:", data)
      setPort(data.newPort)
    })

    /*  ipcRenderer.on("openWorkspace", (event, data) => {
      console.log("openWorkspace from NEXT", data)
      let workspace = { ...data }
      setWorkspaceObject(workspace)
    }) */

    ipcRenderer.on("toggleDarkMode", () => {
      console.log("toggleDarkMode")
      // setIsDarkMode(!isDarkMode)
    })

    ipcRenderer.on("recentWorkspaces", (event, data) => {
      console.log("recentWorkspaces", data)
      setRecentWorkspaces(data)
    })

    /**
     * This is to log messages from the main process in the console
     */
    ipcRenderer.on("log", (event, data) => {
      console.log("log", data)
    })

    /*   ipcRenderer.on("databases", (event, databases) => {
      console.log("DATABASES", databases)
    }) */

    ipcRenderer.send("messageFromNext", "getServerPort")

    // Cleanup function to remove the event listener
    return () => {
      ipcRenderer.removeAllListeners("collections")
    }
  }, []) // Here, we specify that the hook should only be called at the launch of the app

  // This useEffect hook is called whenever the `globalData` state changes.
  useEffect(() => {
    console.log("globalData changed", globalData)
    // Save the global data to a file
    /* if (workspaceObject.hasBeenSet === true) {
      let path = workspaceObject.workingDirectory.path + "/.medomics"
      // Check if the .medomics folder exists
      // eslint-disable-next-line no-undef
      const fsx = require("fs-extra")
      fsx.ensureDirSync(workspaceObject.workingDirectory.path + "/.medomics")
      // Save the global data to a file
      saveObjectToFile(globalData, path + "/globalData.json")
    } */
  }, [globalData])

  // This useEffect hook is called whenever the `layoutModel` state changes.
  useEffect(() => {
    // Log a message to the console whenever the layoutModel state variable changes
    console.log("layoutModel changed", layoutModel)
  }, [layoutModel]) // Here, we specify that the hook should only be called when the layoutModel state variable changes

  // This useEffect hook is called whenever the `workspaceObject` state changes.
  useEffect(() => {
    console.log("WORKSPACE OBJECT CHANGED")
    async function getGlobalData() {
      await updateGlobalData(workspaceObject)
      const newGlobalData = await loadMEDDataObjects()
      setGlobalData(newGlobalData)
    }
    if (workspaceObject.hasBeenSet == true) {
      console.log("workspaceObject changed", workspaceObject)
      getGlobalData()
    }
  }, [workspaceObject])

  return (
    <>
      <Head>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
        <title>MEDomicsLab</title>
        {/* <script src="http://localhost:8097"></script> */}
        {/* Uncomment if you want to use React Dev tools */}
      </Head>
      <div style={{ height: "100%", width: "100%" }}>
        <HotkeysProvider>
          <ActionContextProvider>
            <DataContextProvider globalData={globalData} setGlobalData={setGlobalData}>
              <WorkspaceProvider
                workspace={workspaceObject}
                setWorkspace={setWorkspaceObject}
                port={port}
                setPort={setPort}
                recentWorkspaces={recentWorkspaces}
                setRecentWorkspaces={setRecentWorkspaces}
              >
                <ServerConnectionProvider port={port} setPort={setPort}>
                  <LayoutModelProvider // This is the LayoutContextProvider, which provides the layout model to all the children components of the LayoutManager
                    layoutModel={layoutModel}
                    setLayoutModel={setLayoutModel}
                  >
                    {/* This is the WorkspaceProvider, which provides the workspace model to all the children components of the LayoutManager */}
                    {/* This is the LayoutContextProvider, which provides the layout model to all the children components of the LayoutManager */}
                    <LayoutManager layout={initialLayout} />
                    {/** We pass the initialLayout as a parameter */}
                  </LayoutModelProvider>
                </ServerConnectionProvider>
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
