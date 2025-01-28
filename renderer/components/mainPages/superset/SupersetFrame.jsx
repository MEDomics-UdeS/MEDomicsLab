import { error } from "console"
import { ipcRenderer } from "electron"
import os from "os"
import { Accordion, AccordionTab } from 'primereact/accordion'
import { Button } from "primereact/button"
import { Card } from "primereact/card"
import { confirmDialog } from 'primereact/confirmdialog'
import { InputNumber } from 'primereact/inputnumber'
import { InputText } from 'primereact/inputtext'
import { OverlayPanel } from 'primereact/overlaypanel'
import { Password } from 'primereact/password'
import { Tooltip } from 'primereact/tooltip'
import React, { useContext, useEffect, useRef, useState } from 'react'
import Iframe from "react-iframe"
import { toast } from "react-toastify"
import { requestBackend } from "../../../utilities/requests"
import { ErrorRequestContext } from "../../generalPurpose/errorRequestContext"
import ProgressBarRequests from "../../generalPurpose/progressBarRequests"
import { WorkspaceContext } from "../../workspace/workspaceContext"
import ModulePage from "../moduleBasics/modulePage"
import { SupersetRequestContext } from "./supersetRequestContext"

/**
 *
 * @returns the superset page
 */
const SupersetDashboard = () => {
  const [dashboardPort, setDashboardPort] = useState(null)
  const [newUserUsername, setNewUserUsername] = useState(null)
  const [newUserPassword, setNewUserPassword] = useState(null)
  const [newFirstName, setNewFirstName] = useState(null)
  const [newLastName, setNewLastName] = useState(null)
  const [newUserEmail, setNewUserEmail] = useState(null)
  const [isEmailValid, setIsEmailValid] = useState(true)
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [loadingUser, setLoadingUser] = useState(false)
  const [refresh, setRefresh] = useState(0)
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const { port } = useContext(WorkspaceContext)
  const { setError } = useContext(ErrorRequestContext)
  const { url, supersetPort, launched, setUrl, setSupersetPort, setLaunched } = useContext(SupersetRequestContext)
  const op = useRef(null)
  const [services, setServices] = useState([])

  async function getSupersetProcesses() {
    // Run tasklist
    const { exec } = require('child_process')
    const system = os.platform()
    // Windows
    if (system === "win32") {
      const pid = await new Promise((resolve, reject) => {
        exec(`tasklist | findstr superset.exe`, (err, stdout, stderr) => {
          if (err) {
            console.error(err)
            reject(error)
          }
          console.log("stdout", stdout)
          console.log("stderr", stderr)

          // Parse stdout
          if (stdout === "") {
            resolve(null)
            return
          }
          let match = stdout.split(/\s+/g)
          match = match.filter((el) => el !== "")

          // Update services
          resolve(match[1])
        })
      })
      return pid
    }
    // Linux or MacOS
    else {
      exec(`lsof -i :8080`, (err, stdout, stderr) => {
        if (err) {
          console.error(err)
          return
        }
        console.log("stdout", stdout)
        console.log("stderr", stderr)

        // Parse stdout
        let match = stdout.split(/\s+/g)
        match = match.filter((el) => el !== "")

        // Update services
        const PID = match[1]
        const onPort = match[8]
        let supersetService = [{
          pid: PID,
          port: onPort
        }]
        setServices(supersetService)
      })
    }
  }

  async function launchSuperset() {
    let freePort = 8080 // in the future maybe we'll use getPort() from get-port package
    let pythonPath = await ipcRenderer.invoke("getBundledPythonEnvironment")
    let scriptsPath = pythonPath.split(".medomics")[0] + ".medomics\\python\\Scripts"
    let SupersetLibPath = pythonPath.split(".medomics")[0] + ".medomics\\python\\Lib\\site-packages\\superset"

    // Send the request to the backend
    let jsonToSend = {
      "port": freePort,
      "scriptsPath": scriptsPath,
      "SupersetLibPath": SupersetLibPath,
    }
    setLoading(true)
    requestBackend(
      port,
      "/superset/launch/",
      jsonToSend,
      async (jsonResponse) => {
        setLoading(false)
        if (jsonResponse.error) {
          if (jsonResponse.error.message) {
            console.error(jsonResponse.error.message)
            toast.error(jsonResponse.error.message, {autoClose: 5000})
            setError(jsonResponse.error)
          } else {
            console.error(jsonResponse.error)
            toast.error("Error launching superset. Check console for more details", {autoClose: 5000})
            setError({"message": jsonResponse.error})
          }
          setLoading(false)
        } else {
          // get port
          if (!jsonResponse.hasOwnProperty("port")){
            toast.error("Could not retrieve port from response", {autoClose: 5000})
            console.error("Could not retrieve port from response", jsonResponse)
            setLoading(false)
            return
          }
          freePort = jsonResponse.port
          setSupersetPort(freePort)
          setUrl("http://localhost:" + freePort)
          setLaunched(true)
          setLoading(false)
          refreshSuperset()
          toast.success("Superset launched successfully on port " + freePort)
        }
      },
      (error) => {
        console.error(error)
        toast.error("Error launching superset. Check console for more details", {autoClose: 5000})
        setLoading(false)
      }
    )
  }

  async function connectSuperset() {
    setUrl("http://localhost:" + dashboardPort)
    setLaunched(true)
    refreshSuperset()
  }

  async function createUser() {
    // get superset path
    let pythonPath = await ipcRenderer.invoke("getBundledPythonEnvironment")
    const supersetPath = pythonPath.split(".medomics")[0] + ".medomics\\python\\Scripts\\superset"

    // Send the request to the backend
    let jsonToSend = {
      "supersetPath": supersetPath,
      "username": newUserUsername,
      "password": newUserPassword,
      "firstname": newFirstName,
      "lastname": newLastName,
      "email": newUserEmail,
    }
    setLoadingUser(true)
    requestBackend(
      port,
      "/superset/create_user/",
      jsonToSend,
      async (jsonResponse) => {
        console.log("jsonResponse", jsonResponse)
        setLoadingUser(false)
        if (jsonResponse.error) {
          if (jsonResponse.error.message) {
            console.error(jsonResponse.error.message)
            toast.error(jsonResponse.error.message, {autoClose: 5000})
          } else {
            console.error(jsonResponse.error)
            toast.error(jsonResponse.error, {autoClose: 5000})
          }
        } else {
          toast.success("User created successfully")
          op.current.hide()
          // Reset the fields
          setNewUserUsername(null)
          setNewUserPassword(null)
          setNewFirstName(null)
          setNewLastName(null)
          setNewUserEmail(null)
        }
      },
      (error) => {
        setLoadingUser(false)
        console.log(error)
        toast.error("Error creating user " + error, {autoClose: 5000})
      }
    )
  }

  function renderCreateUser() {
    return (
      <Card title="Create New User" subTitle="Enter the details of the new user" 
        style={{
          background: "transparent",
          boxShadow: "none",
          border: "none",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}>
        <div className="card flex justify-content-center flex-column gap-2" style={{borderWidth: "0px"}}>
          <div className="p-inputgroup">
              <span className="p-inputgroup-addon">
                <i className="pi pi-user"></i>
              </span>
              <InputText placeholder="Username" onChange={(e) => {setNewUserUsername(e.target.value)}}/>
          </div>
          <div className="p-inputgroup">
              <span className="p-inputgroup-addon">
                <i className="pi pi-user"></i>
              </span>
              <InputText placeholder="First Name" onChange={(e) => setNewFirstName(e.target.value)}/>
          </div>
          <div className="p-inputgroup">
              <span className="p-inputgroup-addon">
                <i className="pi pi-user"></i>
              </span>
              <InputText placeholder="Last Name" onChange={(e) => setNewLastName(e.target.value)}/>
          </div>
          <div className="p-inputgroup">
              <span className="p-inputgroup-addon">
                <i className="pi pi-key"></i>
              </span>
              <Password placeholder="Password" onChange={(e) => setNewUserPassword(e.target.value)} toggleMask/>
          </div>
          <div className="p-inputgroup">
              <span className="p-inputgroup-addon">
                <i className="pi pi-envelope"></i>
              </span>
              <InputText placeholder="Email" onChange={(e) => setNewUserEmail(e.target.value)}/>
          </div>
          {!isEmailValid && <small className="text-danger">Please enter a valid email address</small>}
          <Button 
            label="Create User" 
            severity="info" 
            loading={loadingUser}
            disabled={newUserUsername === null || newUserPassword === null || newFirstName === null || newLastName === null || newUserEmail === null} 
            onClick={() => createUser()}
          />
        </div>
      </Card>
    )
  }

  async function killProcess() {
    // Get PID of the process
    const pid = await getSupersetProcesses()
    
    // Confirm dialog
    if (!pid) {
      toast.error("Superset's PID not found", {autoClose: 5000})
      return
    }
    const accept = () => {
      // Kill the process
      const { exec } = require('child_process')
      const system = os.platform()

      // Windows
      if (system === "win32") {
        exec(`taskkill /F /PID ${pid}`, (err, stdout, stderr) => {
          if (err) {
            console.error(err)
            toast.error("Error killing process", {autoClose: 5000})
            return
          }
          console.log("stdout", stdout)
          console.log("stderr", stderr)
          setLaunched(false)
          setSupersetPort(null)
          toast.success("Process killed successfully")
        })
        return
      }
      // Linux or MacOS
      else {
        exec(`kill -9 ${pid}`, (err, stdout, stderr) => {
          if (err) {
            console.error(err)
            return
          }
          console.log("stdout", stdout)
          console.log("stderr", stderr)
          setLaunched(false)
          setSupersetPort(null)
          toast.success("Process killed successfully")
        })
      }
    }
    const reject = () => {
      return
    }
    confirmDialog({
      message: `This will shutdown Superset, are you sure you want to proceed?`, 
      header: "Confirmation",
      icon: "pi pi-exclamation-triangle",
      accept,
      reject,
      acceptClassName: 'p-button-danger',
      rejectClassName: 'p-button-info',
    })
    return
  }

  function editConfig() {
    // If object already in the DB, show a confirmation dialog to overwrite it
    const accept = () => {
        toast.success('You have accepted', { life: 3000 })
    }

    const reject = () => {
        toast.warning('You have rejected', { life: 3000 })
    }
    confirmDialog({
      message: `Editing the Superset default configuration is a dangerous operation. Are you sure you want to proceed?`, 
      header: "Confirmation",
      icon: "pi pi-exclamation-triangle",
      accept,
      reject,
      acceptClassName: 'p-button-danger',
      rejectClassName: 'p-button-info',
    })
    return
  }

  async function refreshSuperset() {
    await sleep(5000)
    setRefresh(refresh+1)
    getSupersetProcesses()
  }

  useEffect(() => {
    if (newUserEmail) {
      if (newUserEmail.match(/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/)) {
        setIsEmailValid(true)
      }
      else {
        setIsEmailValid(false)
      }
    }
  }, [newUserEmail])

  useEffect(() => {
    if (services.length === 0) {
      setRefresh(refresh+1)
    }
  }, [services])

  useEffect(() => {
    refreshSuperset()
  }, [url])

  useEffect(() => {
    if (dashboardPort){
      // Check if Iframe body is not empty
      const iframe = document.getElementById("superset-frame")
      if (iframe) {
        if (iframe.contentDocument.body.innerHTML === "") {
          setLaunched(false)
          toast.error("Superset is not running on port " + dashboardPort, {autoClose: 5000})
          setDashboardPort(null)
        }
      }
    }
  }, [url, launched])

  return (
    <>
      {launched ? (
        <div>
          {/* Tooltips */}
          <Tooltip target=".p-button" />
          <OverlayPanel ref={op} showCloseIcon id="overlaypanel" style={{width: '450px'}}>
            {renderCreateUser()}
          </OverlayPanel>
          <Accordion>
            <AccordionTab header="Superset tools">
              <div className="card flex flex-container gap-2" style={{borderWidth: "0px", justifyContent: "left"}}>
                <span className="p-inputgroup-addon" style={{border: "0.5px solid #ccc"}}>Superset is running on port {supersetPort ? supersetPort : "8080"}</span>
                <Button icon="pi pi-refresh" severity="success" tooltip="Refresh page" tooltipOptions={{ position: 'bottom' }} onClick={() => refreshSuperset()}/>
                <Button label="Create New User" severity="info" onClick={(e) => op.current.toggle(e)} />
                <Button label="Edit Superset Configuration" severity="info" onClick={() => editConfig()}/>
                <Button label="Kill Superset" severity="danger" onClick={() => killProcess()}/>
              </div>
            </AccordionTab>
          </Accordion>

          {/* Superset Frame */}
          <Iframe
            id="superset-frame"
            key={refresh}
            src={url}
            frameborder="0"
            width="100%"
            height="900"
            allowtransparency
          ></Iframe>
        </div>
      ) : (
        <div className="center-page config-page">
          <Card title="Superset port selection" subTitle="Enter the port of your Superset server, if you haven't launched Superset, click Launch.">
          <div className="card flex justify-content-center flex-column gap-2" style={{borderWidth: "0px"}}>
            <div className="p-inputgroup">
              <span className="p-inputgroup-addon">
                <i className="pi pi-sitemap"></i>
              </span>
              <InputNumber placeholder="Port" useGrouping={false} onChange={(e) => setDashboardPort(e.value)}/>
            </div>
            <Button label="Connect" severity="info" disabled={dashboardPort === null} onClick={() => connectSuperset()}/>
            <Button 
              label="Launch Superset For Me" 
              tooltip={"This will change and override your superset configuration file and launch superset in the background.\
                \nDo not click if you have a running instance of superset or if you want to keep your current configuration."} 
              tooltipOptions={{ position: 'bottom' }}
              loading={loading} 
              severity="info" 
              onClick={() => launchSuperset()}
            />
            </div>
          </Card>
        </div>
      )}
      {/* bottom center - progress bar */}
      <div className="panel-bottom-center">
        {loading && (
          <ProgressBarRequests
            progressBarProps={{ animated: true, variant: "success" }}
            isUpdating={loading}
            setIsUpdating={setLoading}
            progress={progress}
            setProgress={setProgress}
            requestTopic={"superset/progress/"}
          />
        )}
      </div>
    </>
  )
}

/**
 *
 * @param {String} pageId The page id
 * @returns the super page with the module page
 */
const SupersetFrame = ({ pageId = "SupersetDashboard-id" }) => {
  return (
    <ModulePage pageId={pageId} shadow>
        <SupersetDashboard pageId={pageId} />
    </ModulePage>
  )
}

export default SupersetFrame
