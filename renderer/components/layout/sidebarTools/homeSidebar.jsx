import React, { useContext } from "react"

import { Accordion, Button, Stack } from "react-bootstrap"
import { WorkspaceContext } from "../../workspace/workspaceContext"
import { ipcRenderer } from "electron"
import SidebarDirectoryTreeControlled from "./sidebarDirectoryTreeControlled"
import { LayoutModelContext } from "../layoutContext"
import { Send, Server } from "react-bootstrap-icons"
import { FaMagnifyingGlassChart } from "react-icons/fa6"
import { PiFlaskFill } from "react-icons/pi"
const HomeSidebar = () => {
  /**
   * @description - This component is the sidebar tools component that will be used in the sidebar component as the home page
   */

  const { workspace } = useContext(WorkspaceContext) // We get the workspace from the context to retrieve the directory tree of the workspace, thus retrieving the data files
  const { dispatchLayout } = useContext(LayoutModelContext) // We get the dispatch function from the context to dispatch the action to change the layout
  async function handleWorkspaceChange() {
    ipcRenderer.send("messageFromNext", "requestDialogFolder")
  }

  /**
   * Handles the opening of a page called by the buttons in the sidebar
   * @param {Object} e - The event object
   * @param {String} page - The name of the page to open
   */
  const handleOpenPage = (e, page) => {
    dispatchLayout({ type: `open${page}Module`, payload: { pageId: page } })
  }

  return (
    <>
      <Stack direction="vertical" gap={0}>
        <p
          style={{
            color: "#a3a3a3",
            font: "Arial",
            fontSize: "12px",
            padding: "0.75rem 0.25rem 0.75rem 0.75rem",
            margin: "0 0 0 0"
          }}
        >
          Home
        </p>
        {workspace.hasBeenSet == false && <h3 style={{ color: "white", paddingInline: "1rem" }}>No workspace</h3>}
        {workspace.hasBeenSet == false && (
          <Button onClick={handleWorkspaceChange} style={{ margin: "1rem" }}>
            Set Workspace
          </Button>
        )}
        <Accordion defaultActiveKey={["dirTree"]} alwaysOpen>
          <Accordion.Item eventKey="buttons" style={{ borderBottom: "2px solid #00000015" }}>
            <Accordion.Header>
              <Stack direction="horizontal" style={{ flexGrow: "1" }}>
                <p style={{ marginBottom: "0px", paddingLeft: "1rem" }}>
                  <strong>OPEN MODULES...</strong>
                </p>
                <div style={{ flexGrow: "10" }} />
              </Stack>
            </Accordion.Header>
            <Accordion.Body>
              {workspace.hasBeenSet == true && (
                <div className="home-sidebar-page-buttons">
                  <Button
                    onClick={(e) => {
                      handleOpenPage(e, "ExtractionTS")
                    }}
                  >
                    <i className="pi pi-chart-line" style={{ marginRight: ".5rem" }}></i>
                    <b>Extraction</b>&nbsp;Module :&nbsp;<b>Time Series</b>
                  </Button>
                  <Button
                    onClick={(e) => {
                      handleOpenPage(e, "ExtractionText")
                    }}
                  >
                    <i className="pi pi-align-left" style={{ marginRight: ".5rem" }}></i>
                    <b>Extraction</b>&nbsp;Module :&nbsp;<b>Text</b>
                  </Button>
                  <Button
                    onClick={(e) => {
                      handleOpenPage(e, "ExtractionImage")
                    }}
                  >
                    <i className="pi pi-database" style={{ marginRight: ".5rem" }}></i>
                    <b>Extraction</b>&nbsp;Module :&nbsp;<b>Image</b>
                  </Button>
                  <Button
                    onClick={(e) => {
                      handleOpenPage(e, "ExtractionMEDimage")
                    }}
                  >
                    <i className="pi pi-image" style={{ marginRight: ".5rem" }}></i>
                    <b>Extraction</b>&nbsp;Module :&nbsp;<b>MEDimage</b>
                  </Button>
                  <Button
                    onClick={(e) => {
                      handleOpenPage(e, "Input")
                    }}
                  >
                    <Server style={{ marginRight: ".5rem" }} />
                    <b>Input</b>&nbsp;Module
                  </Button>
                  <Button
                    onClick={(e) => {
                      handleOpenPage(e, "Exploratory")
                    }}
                  >
                    <FaMagnifyingGlassChart style={{ marginRight: ".5rem" }} />
                    <b>Exploratory</b>&nbsp;Module
                  </Button>
                  <Button
                    onClick={(e) => {
                      handleOpenPage(e, "Evaluation")
                    }}
                  >
                    <PiFlaskFill style={{ marginRight: ".5rem" }} />
                    <b>Evaluation</b>&nbsp;Module
                  </Button>
                  <Button
                    onClick={(e) => {
                      handleOpenPage(e, "Application")
                    }}
                  >
                    <Send style={{ marginRight: ".5rem" }} />
                    <b>Application</b>&nbsp;Module
                  </Button>
                </div>
              )}
            </Accordion.Body>
          </Accordion.Item>
          <SidebarDirectoryTreeControlled />
        </Accordion>
      </Stack>
    </>
  )
}

export default HomeSidebar
