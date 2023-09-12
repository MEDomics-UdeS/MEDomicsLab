import React, { useContext } from "react"
import { Accordion, Button, Stack } from "react-bootstrap"
import { WorkspaceContext } from "../../workspace/workspaceContext"
import { ipcRenderer } from "electron"
import { WorkspaceDirectoryTree } from "./workspaceDirectoryTree"

const HomeSidebar = () => {
  /**
   * @description - This component is the sidebar tools component that will be used in the sidebar component as the home page
   *
   */

  const { workspace } = useContext(WorkspaceContext) // We get the workspace from the context to retrieve the directory tree of the workspace, thus retrieving the data files

  async function handleWorkspaceChange() {
    ipcRenderer.send("messageFromNext", "requestDialogFolder")
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
        {workspace.hasBeenSet == false && (
          <h3 style={{ color: "white", paddingInline: "1rem" }}>
            No workspace
          </h3>
        )}
        {workspace.hasBeenSet == false && (
          <Button onClick={handleWorkspaceChange} style={{ margin: "1rem" }}>
            Set Workspace
          </Button>
        )}
        <Accordion defaultActiveKey={["0"]} alwaysOpen>
          <Accordion.Item eventKey="0">
            <Accordion.Header className="accordionHeader">
              <Stack direction="horizontal" style={{ flexGrow: "1" }}>
                <p style={{ marginInlineStart: "1rem" }}>
                  <strong>OPEN EDITORS</strong>
                </p>
              </Stack>
            </Accordion.Header>
            <Accordion.Body className="accordion-body-tight">
              <WorkspaceDirectoryTree />
              {/* {workspace.workingDirectory["name"] && SidebarFolder({ name: workspace.workingDirectory["name"], children: workspace.workingDirectory["children"]})}
							We render the workspace only if it is set, otherwise it throws an error */}
            </Accordion.Body>
          </Accordion.Item>
        </Accordion>
      </Stack>
    </>
  )
}

export default HomeSidebar
