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
      console.log("WorkingDirectory set by Electron:", data)
      if (workspaceObject !== data) {
        let workspace = { ...data }
        setWorkspaceObject(workspace)
      }
    })

    ipcRenderer.on("updateDirectory", (event, data) => {
      console.log("WorkingDirectory update from Electron:", data)
      // if (workspaceObject.hasBeenSet === true) {

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

  useEffect(() => {
    // This is a hook that is called whenever the layoutModel state variable changes
    // Log a message to the console whenever the layoutModel state variable changes
    console.log("layoutModel changed", layoutModel)
  }, [layoutModel]) // Here, we specify that the hook should only be called when the layoutModel state variable changes

  return (
    <>
      <Head>
        <title>MedomicsLab App</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
        {/* <script src="http://localhost:8097"></script> */}
        {/* Uncomment if you want to use React Dev tools */}
      </Head>
      <div style={{ height: "100%" }}>
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
