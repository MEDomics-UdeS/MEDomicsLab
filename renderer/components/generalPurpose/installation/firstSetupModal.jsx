import { Dialog } from "primereact/dialog"
import React, { useState, useContext, useEffect } from "react"
import { NotificationContext } from "../notificationContext"
import { ipcRenderer } from "electron"
import { ProgressBar } from "primereact/progressbar"

/**
 *
 * @param {*} param0
 * @returns
 */
const FirstSetupModal = ({ visible, onHide, closable, setRequirementsMet = null }) => {
  const { notifications, setNotifications } = useContext(NotificationContext)
  const [pythonIsInstalled, setPythonIsInstalled] = useState(false)
  const [pythonIsInstalling, setPythonIsInstalling] = useState(false)
  const [pythonInstallationProgress, setPythonInstallationProgress] = useState(0)
  const [pythonEmbedded, setPythonEmbedded] = useState({ pythonEmbedded: null, pythonPackages: [] })
  const [mongoDBIsInstalled, setMongoDBIsInstalled] = useState(false)
  const [mongoDBIsInstalling, setMongoDBIsInstalling] = useState(false)
  const [mongoDBInstallationProgress, setMongoDBInstallationProgress] = useState(0)
  const [numberOfPythonNotifications, setNumberOfPythonNotifications] = useState(0)
  const [checkIsRunning, setCheckIsRunning] = useState(false)

  const checkPython = () => {
    ipcRenderer.invoke("getBundledPythonEnvironment").then((data) => {
      if (data) {
        setPythonIsInstalled(true)
        setPythonInstallationProgress(100)
      }
    })
  }

  const checkMongoDB = () => {
    ipcRenderer.invoke("checkMongoDBisInstalled").then((data) => {
      if (data) {
        setMongoDBIsInstalled(true)
        setMongoDBInstallationProgress(100)
      } else {
        setMongoDBIsInstalled(false)
      }
    })
  }

  const installPython = () => {
    setPythonIsInstalling(true)
    ipcRenderer.invoke("installBundledPythonExecutable")
  }

  const installMongoDB = () => {
    setMongoDBIsInstalling(true)
    ipcRenderer.invoke("installMongoDB")
  }

  useEffect(() => {
    checkMongoDB()
    checkPython()
  }, [])

  useEffect(() => {
    console.log("FirstSetupModal notifications: ", notifications)
    // Count the number of Python notifications and calculate the progress
    let numPythonNotifications = 0
    let accumulatedPythonProgress = 0
    let numMongoDBNotifications = 0
    let accumulatedMongoDBProgress = 0
    let totalNumberOfPythonNotifications = 2000

    for (let notification of notifications) {
      if (notification.header.includes("Python")) {
        numPythonNotifications += 1
        if (notification.message.includes("exited with code 0")) {
          accumulatedPythonProgress += 1
        }
      } else if (notification.header.toLowerCase().includes("mongodb")) {
        numMongoDBNotifications += 1
        if (notification.message.includes("exited with code 0")) {
          accumulatedMongoDBProgress += 1
        }
      }
    }

    if (!mongoDBIsInstalled) {
      setMongoDBInstallationProgress((accumulatedMongoDBProgress / numMongoDBNotifications) * 100)
    }
    if (!pythonIsInstalled) {
      setPythonInstallationProgress((accumulatedPythonProgress / totalNumberOfPythonNotifications) * 100)
    }
    let newNumberOfPythonNotifications = numberOfPythonNotifications + 1
    setNumberOfPythonNotifications(newNumberOfPythonNotifications)
    console.log("Number of Python notifications: ", newNumberOfPythonNotifications)
  }, [notifications])

  /**
   * Timer to check the requirements
   * @returns
   * @summary This function is used to check the requirements every 5 seconds
   *         If the requirements are met, the function stops
   *         If the requirements are not met, the function continues
   */
  useEffect(() => {
    const interval = setInterval(() => {
      if (!pythonIsInstalled || !mongoDBIsInstalled) {
        setCheckIsRunning(true)
        ipcRenderer.invoke("checkRequirements").then((data) => {
          console.log("Requirements: ", data)
          setCheckIsRunning(false)
          let pythonIsFullyInstalled = false
          if (data.pythonInstalled) {
            setPythonIsInstalled(true)
            // Check if the python requirements are met
            ipcRenderer.invoke("checkPythonRequirements").then((data) => {
              if (data) {
                setPythonIsInstalled(true)
                pythonIsFullyInstalled = true
              }
            })
          }
          if (data.mongoDBInstalled) {
            setMongoDBIsInstalled(true)
          }
          if (data.pythonInstalled && data.mongoDBInstalled && setRequirementsMet && pythonIsFullyInstalled) {
            setRequirementsMet(true)
          }
        })
      }
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <Dialog header="Application first setup" visible={visible} onHide={onHide} style={{ width: "50vw" }} closable={closable}>
      <div className="p-grid p-fluid">
        <div className="p-col-12">
          <h4>Thank you for installing the MEDomicsLab application!</h4>
          <p>Before you can start using it, we need to perform some initial setup.</p>
          <p>Ensure you are connected to the internet and click the button below to start the setup.</p>
          <p>Once the setup is complete, the application will automatically start.</p>
        </div>
        <div className="p-col-12 p-md-4">
          <button className="p-button p-button-primary" onClick={onHide}>
            Start setup
          </button>
        </div>
        <div className="p-col-12 p-md-4">
          <button className="p-button p-button-primary" onClick={installMongoDB}>
            Install MongoDB
          </button>
          {/* Progress bar */}
          <ProgressBar
            value={mongoDBInstallationProgress}
            displayValueTemplate={() => `${mongoDBInstallationProgress}%`}
            mode={checkIsRunning ? "indeterminate" : "determinate"}
            color={mongoDBIsInstalled ? "#22c55e" : ""}
          />
        </div>
        <div className="p-col-12 p-md-4">
          <h4>Python Installation</h4>
          <p>Python is required to run the application.</p>
          <p>Click the button below to install the bundled Python executable.</p>
          <button className="p-button p-button-primary" onClick={installPython}>
            Install Python
          </button>
          {/* Progress bar */}
          <ProgressBar
            value={pythonInstallationProgress}
            displayValueTemplate={() => `${pythonInstallationProgress}%`}
            mode={checkIsRunning ? "indeterminate" : "determinate"}
            color={pythonIsInstalled ? "#22c55e" : ""}
          />
        </div>
      </div>
    </Dialog>
  )
}

export default FirstSetupModal
