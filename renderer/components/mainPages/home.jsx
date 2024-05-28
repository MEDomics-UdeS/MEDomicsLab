import React, { useContext, useEffect, useState } from "react"
import Image from "next/image"
import myimage from "../../../resources/medomics_transparent_bg.png"
import { Button, Stack } from "react-bootstrap"
import { WorkspaceContext } from "../workspace/workspaceContext"
import { MongoDBContext } from "../mongoDB/mongoDBContext"
import { ipcRenderer } from "electron"
import { InputText } from "primereact/inputtext"

/**
 *
 * @returns the home page component
 */
const HomePage = () => {
  const { workspace, recentWorkspaces } = useContext(WorkspaceContext)
  const { DB, recentDBs } = useContext(MongoDBContext)
  const [hasBeenSet, setHasBeenSet] = useState(workspace.hasBeenSet)
  const [DBSet, setDBSet] = useState(DB.hasBeenSet)
  const [newDBName, setNewDBName] = useState("")

  async function handleWorkspaceChange() {
    ipcRenderer.send("messageFromNext", "requestDialogFolder")
  }

  async function handleDbChange() {
    ipcRenderer.send("messageFromNext", "handleDBChange", newDBName)
  }

  // We set the workspace hasBeenSet state
  useEffect(() => {
    if (workspace.hasBeenSet == false) {
      setHasBeenSet(true)
    } else {
      setHasBeenSet(false)
    }
  }, [workspace])

  // We set the db hasBeenSet state
  useEffect(() => {
    if (DB.hasBeenSet == false) {
      setDBSet(true)
    } else {
      setDBSet(false)
    }
  }, [DB])

  // We set the recent workspaces -> We send a message to the main process to get the recent workspaces, the workspace context will be updated by the main process in _app.js
  useEffect(() => {
    ipcRenderer.send("messageFromNext", "getRecentWorkspaces")
    ipcRenderer.send("messageFromNext", "get-databases")
  }, [])

  return (
    <>
      <div className="container" style={{ paddingTop: "1rem", display: "flex", flexDirection: "vertical", flexGrow: "10" }}>
        <Stack direction="vertical" gap={1} style={{ padding: "0 0 0 0", alignContent: "center" }}>
          <h2>Home page</h2>
          <Stack direction="horizontal" gap={0} style={{ padding: "0 0 0 0", alignContent: "center" }}>
            <h1 style={{ fontSize: "5rem" }}>MEDomicsLab </h1>

            <Image src={myimage} alt="" style={{ height: "175px", width: "175px" }} />
          </Stack>
          {hasBeenSet ? (
            <>
              <h5>Set up your workspace to get started</h5>
              <Button onClick={handleWorkspaceChange} style={{ margin: "1rem" }}>
                Set Workspace
              </Button>
              <h5>Or open a recent workspace</h5>
              <Stack direction="vertical" gap={0} style={{ padding: "0 0 0 0", alignContent: "center" }}>
                {recentWorkspaces.map((workspace, index) => {
                  if (index > 4) return
                  return (
                    <a
                      key={index}
                      onClick={() => {
                        ipcRenderer.send("setWorkingDirectory", workspace.path)
                      }}
                      style={{ margin: "0rem", color: "var(--blue-600)" }}
                    >
                      <h6>{workspace.path}</h6>
                    </a>
                  )
                })}
              </Stack>
            </>
          ) : (
            <h5>Workspace is set to {workspace.workingDirectory.path}</h5>
          )}
          {DBSet ? (
            <>
              <h5>Set up your database to get started</h5>
              <div sstyle={{ display: "flex" }}>
                <InputText value={newDBName} onChange={(e) => setNewDBName(e.target.value)} keyfilter="alpha" />
                <Button disabled={newDBName == ""} onClick={handleDbChange} style={{ margin: "1rem" }}>
                  Set Database
                </Button>
              </div>
              <h5>Or open an existing database</h5>
              <Stack direction="vertical" gap={0} style={{ padding: "0 0 0 0", alignContent: "center" }}>
                {recentDBs.map((DB, index) => {
                  return (
                    <a
                      key={index}
                      onClick={() => {
                        ipcRenderer.send("setDB", DB)
                      }}
                      style={{ margin: "0rem", color: "var(--blue-600)" }}
                    >
                      <h6>{DB}</h6>
                    </a>
                  )
                })}
              </Stack>
            </>
          ) : (
            <h5>Database is set to {DB.name}</h5>
          )}
        </Stack>
      </div>
    </>
  )
}

export default HomePage
