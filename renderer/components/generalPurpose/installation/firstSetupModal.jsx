import { Dialog } from "primereact/dialog"
import React, { useState, useContext, useEffect } from "react"
import { NotificationContext } from "../notificationContext"
import { ipcRenderer } from "electron"
import { ProgressBar } from "primereact/progressbar"
import { Button } from "react-bootstrap"

/**
 *
 * @param {*} param0
 * @returns
 */
const FirstSetupModal = ({ visible, onHide, closable, setRequirementsMet }) => {
  const { notifications, setNotifications } = useContext(NotificationContext)
  const [pythonNotifications, setPythonNotifications] = useState({})
  const [mongoDBNotifications, setMongoDBNotifications] = useState({})
  const [pythonIsInstalled, setPythonIsInstalled] = useState(false)
  const [pythonIsInstalling, setPythonIsInstalling] = useState(false)
  const [pythonInstallationProgress, setPythonInstallationProgress] = useState(0)
  const [pythonEmbedded, setPythonEmbedded] = useState({ pythonEmbedded: null, pythonPackages: [] })
  const [mongoDBIsInstalled, setMongoDBIsInstalled] = useState(false)
  const [mongoDBIsInstalling, setMongoDBIsInstalling] = useState(false)
  const [mongoDBInstallationProgress, setMongoDBInstallationProgress] = useState(0)
  const [numberOfPythonNotifications, setNumberOfPythonNotifications] = useState(0)
  const [checkIsRunning, setCheckIsRunning] = useState(false)
  const [localRequirementsMet, setLocalRequirementsMet] = useState(false)

  const checkPython = () => {
    ipcRenderer.invoke("getBundledPythonEnvironment").then((data) => {
      if (data) {
        ipcRenderer.invoke("checkPythonRequirements").then((data) => {
          console.log("Python requirements: ", data)
          if (data) {
            setPythonIsInstalled(true)
            setPythonInstallationProgress(100)
          }
        })
      }
    })
  }

  const checkMongoDB = () => {
    ipcRenderer.invoke("checkMongoDBisInstalled").then((data) => {
      console.log("MongoDB is installed: ", data)
      if (data !== null) {
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
    console.log("FirstSetupModal pythonNotifications: ", pythonNotifications)
  }, [pythonNotifications])

  useEffect(() => {
    console.log("FirstSetupModal mongoDBNotifications: ", mongoDBNotifications)
  }, [mongoDBNotifications])

  useEffect(() => {
    console.log("FirstSetupModal notifications: ", notifications)

    // Count the number of Python notifications and calculate the progress
    let numPythonNotifications = 0
    let accumulatedPythonProgress = 0
    let numMongoDBNotifications = 0
    let accumulatedMongoDBProgress = 0
    let totalNumberOfPythonNotifications = 2000

    let newPythonNotifications = { ...pythonNotifications }
    let newMongoDBNotifications = { ...mongoDBNotifications }

    for (let notification of notifications) {
      if (notification.header.includes("Python")) {
        // Check if the notification is already in the dictionary
        if (newPythonNotifications[notification.id] === undefined) {
          notification.messages = [notification.message]
          notification.messages_count = 1
          notification.done = false
          newPythonNotifications[notification.id] = notification
        } else {
          // Update the notification
          let newPythonNotification = newPythonNotifications[notification.id]
          newPythonNotification.messages.push(notification.message)
          newPythonNotification.messages_count = newPythonNotification.messages_count + 1
          newPythonNotifications[notification.id] = newPythonNotification
        }

        if (notification.message.includes("exited with code 0")) {
          newPythonNotifications[notification.id].done = true
        }
      } else if (notification.header.toLowerCase().includes("mongodb")) {
        if (newMongoDBNotifications[notification.id] === undefined) {
          notification.messages = [notification.message]
          notification.messages_count = 1
          notification.done = false
          newMongoDBNotifications[notification.id] = notification
        } else {
          // Update the notification
          let newMongoDBNotification = newMongoDBNotifications[notification.id]
          newMongoDBNotification.messages.push(notification.message)
          newMongoDBNotification.messages_count = newMongoDBNotification.messages_count + 1
          newMongoDBNotifications[notification.id] = newMongoDBNotification
        }

        if (notification.message.includes("exited with code 0")) {
          newMongoDBNotifications[notification.id].done = true
        }
      }
    }

    if (!mongoDBIsInstalled) {
      let numberOfSteps = 3
      for (let notification in newMongoDBNotifications) {
        let mongoDBNotification = newMongoDBNotifications[notification]
        if (!mongoDBNotification.done) {
          accumulatedMongoDBProgress += 1
        }
      }
      if (accumulatedMongoDBProgress == numberOfSteps) {
        setMongoDBIsInstalled(true)
      }
      if (accumulatedMongoDBProgress == 0) {
      }
      setMongoDBInstallationProgress(((accumulatedMongoDBProgress / numberOfSteps) * 100).toFixed(2))
    }

    if (!pythonIsInstalled) {
      let numberOfSteps = 6
      for (let notification in newPythonNotifications) {
        let pythonNotification = newPythonNotifications[notification]
        if (!pythonNotification.done) {
          accumulatedPythonProgress += 1
        }
      }
      setPythonInstallationProgress(((accumulatedPythonProgress / numberOfSteps) * 100).toFixed(2))
    }
    setPythonNotifications(newPythonNotifications)
    setMongoDBNotifications(newMongoDBNotifications)
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
      setCheckIsRunning(true)
      ipcRenderer.invoke("checkRequirements").then((data) => {
        console.log("Requirements: ", data)
        setCheckIsRunning(false)
        let pythonIsFullyInstalled = false
        if (data.pythonInstalled) {
          setPythonIsInstalled(true)
          // Check if the python requirements are met
          ipcRenderer.invoke("checkPythonRequirements").then((pythonRequirements) => {
            console.log("Python requirements met: ", pythonRequirements)
            if (pythonRequirements) {
              setPythonIsInstalled(true)
              console.log("Python requirements met 2: ", pythonRequirements)
              pythonIsFullyInstalled = true
            }

            if (data.mongoDBInstalled) {
              setMongoDBIsInstalled(true)
            }

            if (data.mongoDBInstalled && pythonIsFullyInstalled) {
              console.log("REQUIREMENTS MET")
              try {
                setLocalRequirementsMet(true)
              } catch (error) {
                console.warn(error)
              }
            }
          })
        }
      })
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
          {/* <button className="p-button p-button-primary" onClick={onHide}> */}
          <button className="p-button p-button-primary" onClick={() => setRequirementsMet(true)}>
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
            color={pythonInstallationProgress == 100 ? "#22c55e" : ""}
          />
        </div>
      </div>
      {localRequirementsMet && (
        <>
          <Button onClick={() => setRequirementsMet(true)}>Close</Button>
          <Button onClick={() => ipcRenderer.send("restartApp")}>Restart the app</Button>
        </>
      )}
    </Dialog>
  )
}

export default FirstSetupModal
