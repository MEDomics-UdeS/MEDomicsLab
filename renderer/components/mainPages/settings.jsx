import React, { useEffect, useState } from "react"
import { ipcRenderer } from "electron"
import ModulePage from "./moduleBasics/modulePage"
import { Button } from "primereact/button"
import { TabView, TabPanel } from "primereact/tabview"
import { Col } from "react-bootstrap"
import { Check2Circle, Folder2Open, XCircleFill } from "react-bootstrap-icons"
import { InputText } from "primereact/inputtext"

/**
 * Settings page
 * @returns {JSX.Element} Settings page
 */
const SettingsPage = () => {
  const [settings, setSettings] = useState(null) // Settings object
  const [serverIsRunning, setServerIsRunning] = useState(false) // Boolean to know if the server is running
  const [activeIndex, setActiveIndex] = useState(0) // Index of the active tab
  const [condaPath, setCondaPath] = useState("") // Path to the conda environment

  /**
   * Get the settings from the main process
   * if the conda path is defined in the settings, set it
   * Check if the server is running and set the state
   */
  useEffect(() => {
    ipcRenderer.invoke("get-settings").then((receivedSettings) => {
      console.log("received settings", receivedSettings)
      setSettings(receivedSettings)
      if (receivedSettings?.condaPath) {
        setCondaPath(receivedSettings?.condaPath)
      }
    })
    ipcRenderer.invoke("server-is-running").then((status) => {
      setServerIsRunning(status)
      console.log("server is running", status)
    })
  }, [])

  /**
   * Save the settings in the main process
   * @param {Object} newSettings - New settings object
   * @returns {void}
   * Creates a timeout to avoid too many calls to the server when the user is typing
   * The timeout is cleared and reset every time the user types
   */
  const saveSettings = (newSettings) => {
    clearTimeout(window.saveSettingsTimeout)
    window.saveSettingsTimeout = setTimeout(() => {
      ipcRenderer.send("save-settings", newSettings)
    }, 1000)
  }

  /**
   * Check if the server is running every 5 seconds
   */
  useEffect(() => {
    const interval = setInterval(() => {
      ipcRenderer.invoke("server-is-running").then((status) => {
        setServerIsRunning(status)
        console.log("server is running", status)
      })
    }, 5000)
    return () => clearInterval(interval)
  })

  return (
    <>
      <ModulePage pageId="Settings">
        <TabView panelContainerStyle={{ padding: "0rem" }} className="settingsTab" activeIndex={activeIndex} onTabChange={(e) => setActiveIndex(e.index)}>
          <TabPanel index={1} headerStyle={{ padding: "0rem", color: "black" }} style={{ padding: "0rem" }} header="User" leftIcon="pi pi-fw pi-cog">
            <div className="settings-user" style={{ marginTop: "1rem" }}>
              <Col>
                <Col xs={12} md={10} style={{ display: "flex", flexDirection: "row", justifyContent: "flex-start", alignItems: "center", flexWrap: "wrap" }}>
                  <h5 style={{ marginBottom: "0rem" }}>Server status : </h5>
                  <h5 style={{ marginBottom: "0rem", marginLeft: "1rem", color: serverIsRunning ? "green" : "#d55757" }}>{serverIsRunning ? "Running" : "Stopped"}</h5>
                  {serverIsRunning ? <Check2Circle size="30" style={{ marginInline: "1rem", color: "green" }} /> : <XCircleFill size="25" style={{ marginInline: "1rem", color: "#d55757" }} />}
                  <Button
                    label="Start server"
                    className=" p-button-success"
                    onClick={() => {
                      console.log("conda path", condaPath)
                      ipcRenderer.invoke("start-server", condaPath).then((status) => {
                        setServerIsRunning(true)
                        console.log("server is running", status)
                      })
                    }}
                    style={{ backgroundColor: serverIsRunning ? "grey" : "#54a559", borderColor: serverIsRunning ? "grey" : "#54a559" }}
                    disabled={serverIsRunning}
                  />
                  <Button
                    label="Stop server"
                    className="p-button-danger"
                    onClick={() => {
                      ipcRenderer.invoke("kill-server").then((stopped) => {
                        if (stopped) {
                          setServerIsRunning(false)
                          console.log("server was stopped", stopped)
                        }
                      })
                    }}
                    style={{ backgroundColor: serverIsRunning ? "#d55757" : "grey", borderColor: serverIsRunning ? "#d55757" : "grey" }}
                    disabled={!serverIsRunning}
                  />
                </Col>
                <Col xs={12} md={12} style={{ display: "flex", flexDirection: "row", justifyContent: "flex-start", alignItems: "center", flexWrap: "wrap", marginTop: ".75rem" }}>
                  <Col xs={12} md="auto" style={{ display: "flex", flexDirection: "row", justifyContent: "flex-start", alignItems: "center", flexWrap: "wrap" }}>
                    <h5>Python - Conda environment path : </h5>
                  </Col>
                  <Col xs={12} md="auto" style={{ display: "flex", flexDirection: "row", justifyContent: "flex-start", alignItems: "center", flexWrap: "nowrap", flexGrow: "1" }}>
                    <InputText
                      style={{ marginInline: "0.5rem", width: "90%" }}
                      placeholder={settings?.condaPath ? settings?.condaPath : "Not defined"}
                      value={condaPath}
                      onChange={(e) => {
                        setCondaPath(e.target.value)
                        saveSettings({ ...settings, condaPath: e.target.value })
                      }}
                    />
                    <a
                      onClick={() => {
                        ipcRenderer.invoke("open-dialog-exe").then((path) => {
                          console.log("path", path)
                          setCondaPath(path)
                          saveSettings({ ...settings, condaPath: path })
                        })
                      }}
                    >
                      <Folder2Open size="30" style={{ marginLeft: "0rem" }} />
                    </a>
                  </Col>
                </Col>
              </Col>
            </div>
          </TabPanel>
        </TabView>
      </ModulePage>
    </>
  )
}

export default SettingsPage
