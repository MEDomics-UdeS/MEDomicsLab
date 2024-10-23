import { Dialog } from "primereact/dialog"
import React, { useState, useContext, useEffect } from "react"
import { NotificationContext } from "./notificationContext"
import { ipcRenderer } from "electron"
import { ProgressBar } from "primereact/progressbar"

/**
 *
 * @param {*} param0
 * @returns
 */
const FirstSetupModal = ({ visible, onHide, closable }) => {
  const { notifications, setNotifications } = useContext(NotificationContext)
  const [pythonIsInstalled, setPythonIsInstalled] = useState(false)
  const [pythonIsInstalling, setPythonIsInstalling] = useState(false)
  const [pythonInstallationProgress, setPythonInstallationProgress] = useState(0)
  const [pythonEmbedded, setPythonEmbedded] = useState({ pythonEmbedded: null, pythonPackages: [] })
  const [mongoDBIsInstalled, setMongoDBIsInstalled] = useState(false)
  const [mongoDBIsInstalling, setMongoDBIsInstalling] = useState(false)
  const [mongoDBInstallationProgress, setMongoDBInstallationProgress] = useState(0)

  const installPython = () => {
    setPythonIsInstalling(true)
    ipcRenderer.invoke("installBundledPythonExecutable")
  }

  const installMongoDB = () => {
    ipcRenderer.invoke("installMongoDB")
  }

  useEffect(() => {
    console.log("FirstSetupModal notifications: ", notifications)
    // Count the number of Python notifications and calculate the progress
    let numPythonNotifications = 0
    let accumulatedPythonProgress = 0
    let numMongoDBNotifications = 0
    let accumulatedMongoDBProgress = 0

    for (let notification of notifications) {
      if (notification.header.toLowerCase().includes("python")) {
        if (notification.message.includes("exited with code 0")) {
          accumulatedPythonProgress += 1
        }
      } else if (notification.header.toLowerCase().includes("mongodb")) {
        if (notification.message.includes("exited with code 0")) {
          accumulatedMongoDBProgress += 1
        }
      }
    }
    setPythonInstallationProgress((accumulatedPythonProgress / numPythonNotifications) * 100)
    setMongoDBInstallationProgress((accumulatedMongoDBProgress / numMongoDBNotifications) * 100)
  }, [notifications])

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
          <ProgressBar value={mongoDBInstallationProgress} displayValueTemplate={() => `${mongoDBInstallationProgress}%`} />
        </div>
        <div className="p-col-12 p-md-4">
          <h4>Python Installation</h4>
          <p>Python is required to run the application.</p>
          <p>Click the button below to install the bundled Python executable.</p>
          <button className="p-button p-button-primary" onClick={installPython}>
            Install Python
          </button>
          {/* Progress bar */}
          <ProgressBar value={pythonInstallationProgress} displayValueTemplate={() => `${pythonInstallationProgress}%`} />
        </div>
      </div>
    </Dialog>
  )
}

export default FirstSetupModal
