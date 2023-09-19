import { ToastContainer } from "react-toastify"
import React, { useState } from "react"
import Head from "next/head"
import LayoutManager from "../components/layout/layoutManager"
import LayoutContextProvider from "../components/layout/layoutContext"
import WorkspaceProvider from "../components/workspace/workspaceContext"
import { useEffect } from "react"
import { ipcRenderer } from "electron"

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

// --my styles (priority over bootstrap and other dist styles)
import "../styles/flow/reactFlow.css"
import "../styles/globals.css"
import "../styles/learning/learning.css"
import "../styles/learning/learningTree.css"
import "../styles/extraction/extraction.css"
import "flexlayout-react/style/light.css"
import "../styles/workspaceSidebar.css"
import "../styles/iconSidebar.css"
import "../styles/learning/sidebar.css"
import "../styles/learning/results.css"
import DataContextProvider from "../components/workspace/dataContext"
import MedDataObject from "../components/workspace/medDataObject"

/**
 * This is the main app component. It is the root component of the app.
 * It is the parent of all other components.
 * It is the parent of the LayoutContextProvider, which provides the layout model to all components.
 * @constructor
 */
export default function App() {
  let initialLayout = {
    // this is the intial layout model for flexlayout model that is passed to the LayoutManager -- See flexlayout-react docs for more info
    global: { tabEnableClose: true }, // this is a global setting for all tabs in the layout, it enables the close button on all tabs
    borders: [
      // this is the border model for the layout, it defines the borders and their children
      {
        type: "border",
        location: "bottom",
        size: 100,
        children: [
          {
            type: "tab",
            name: "four",
            component: "text"
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
              name: "data table",
              component: "dataTable",
              config: {
                path: "./learning-tests-scene/data/eicu_processed.csv"
              }
            }
          ]
        },
        {
          type: "tabset",
          weight: 50,
          selected: 0,
          children: [
            {
              type: "tab",
              name: "Discovery",
              enableClose: true,
              component: "grid"
            },
            {
              type: "tab",
              name: "Application",
              component: "grid"
            },
            {
              type: "tab",
              name: "Extraction",
              component: {
                module: "input",
                path: "C:\\Users\\nicol\\Downloads\\learning-tests-scene\\learning-tests-scene\\data\\eicu_processed.csv"
              },
              config: {
                path: "C:\\Users\\nicol\\Downloads\\learning-tests-scene\\learning-tests-scene\\data\\eicu_processed.csv"
              }
            }
          ]
        }
      ]
    }
  }

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
      console.log("WorkingDirectory updated:", workspace)

      // }
    })

    ipcRenderer.on("getFlaskPort", (event, data) => {
      console.log("flask port update from Electron:", data)
      setPort(data.newPort)
    })
  }, []) // Here, we specify that the hook should only be called at the launch of the app

  // This useEffect hook is called whenever the `workspaceObject` state changes.
  useEffect(() => {
    // Create a copy of the `globalData` state object.
    let newGlobalData = { ...globalData }
    // Check if the `workingDirectory` property of the `workspaceObject` has been set.
    if (workspaceObject.hasBeenSet === true) {
      // Loop through each child of the `workingDirectory`.
      workspaceObject.workingDirectory.children.forEach((child) => {
        // Check if a `MedDataObject` with the same name as the child already exists in the `newGlobalData` object.
        let uuid = MedDataObject.checkIfMedDataObjectInContextbyName(
          child.name,
          newGlobalData
        )
        let folderType = "folder"
        let folderUUID = uuid
        // If a `MedDataObject` with the same name as the child does not exist in the `newGlobalData` object, create a new `MedDataObject` instance for the child and add it to the `newGlobalData` object.
        if (uuid == "") {
          let dataObjectFolder = new MedDataObject({
            originalName: child.name,
            path: child.path,
            type: folderType
          })
          folderUUID = dataObjectFolder.getUUID()
          newGlobalData[folderUUID] = dataObjectFolder
        } else {
          console.log("Folder is already in globalDataContext", child)
        }

        // Loop through each child of the current child.
        child.children.forEach((fileChild) => {
          // Check if the current child is a file.
          if (fileChild.children === undefined) {
            // Check if a `MedDataObject` with the same name as the file already exists in the `newGlobalData` object.
            let fileUUID = MedDataObject.checkIfMedDataObjectInContextbyName(
              fileChild.name,
              newGlobalData
            )
            if (fileUUID == "") {
              // If a `MedDataObject` with the same name as the file does not exist in the `newGlobalData` object, create a new `MedDataObject` instance for the file and add it to the `newGlobalData` object.
              let type = fileChild.name.split(".")[1]
              let dataObject = new MedDataObject({
                originalName: fileChild.name,
                path: fileChild.path,
                type: type
              })
              dataObject.parentIDs.push(folderUUID)
              newGlobalData[dataObject.getUUID()] = dataObject

              newGlobalData[folderUUID]["childrenIDs"].push(
                dataObject.getUUID()
              )
            } else {
              console.log("File is already in globalDataContext", fileChild)
            }
          }
        })
      })
    }
    // Update the `globalData` state object with the new `newGlobalData` object.
    setGlobalData(newGlobalData)
  }, [workspaceObject])

  // This useEffect hook is called whenever the `globalData` state changes.
  useEffect(() => {
    console.log("globalData changed", globalData)
  }, [globalData])

  useEffect(() => {
    // Log a message to the console whenever the layoutModel state variable changes
    console.log("layoutModel changed", layoutModel)
  }, [layoutModel]) // Here, we specify that the hook should only be called when the layoutModel state variable changes

  return (
    <>
      <Head>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
        <title>MedomicsLab App</title>
        {/* <script src="http://localhost:8097"></script> */}
        {/* Uncomment if you want to use React Dev tools */}
      </Head>
      <div style={{ height: "100%", width: "100%" }}>
        <DataContextProvider
          globalData={globalData}
          setGlobalData={setGlobalData}
        >
          <WorkspaceProvider
            workspace={workspaceObject}
            setWorkspace={setWorkspaceObject}
            port={port}
            setPort={setPort}
          >
            {" "}
            {/* This is the WorkspaceProvider, which provides the workspace model to all the children components of the LayoutManager */}
            <LayoutContextProvider // This is the LayoutContextProvider, which provides the layout model to all the children components of the LayoutManager
              layoutModel={layoutModel}
              setLayoutModel={setLayoutModel}
            >
              {/* This is the LayoutContextProvider, which provides the layout model to all the children components of the LayoutManager */}
              <LayoutManager layout={initialLayout} />
              {/** We pass the initialLayout as a parameter */}
            </LayoutContextProvider>
          </WorkspaceProvider>
        </DataContextProvider>
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
