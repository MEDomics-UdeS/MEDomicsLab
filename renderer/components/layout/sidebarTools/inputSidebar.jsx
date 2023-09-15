import React, { useContext } from "react"
import { Button, Stack, Accordion } from "react-bootstrap"
import { Plus } from "react-bootstrap-icons"
import DropzoneComponent from "../../mainPages/dataComponents/dropzoneComponent"
import { WorkspaceContext } from "../../workspace/workspaceContext"
import { SidebarDirectoryTreeControlled } from "./sidebarDirectoryTreeControlled"

/**
 * @description - This component is the sidebar tools component that will be used in the sidebar component as the input page
 * @summary - It contains the dropzone component and the workspace directory tree filtered to only show the data folder and the data files
 * @returns {JSX.Element} - This component is the sidebar tools component that will be used in the sidebar component as the input page
 */
const InputSidebar = () => {
  // eslint-disable-next-line no-unused-vars
  const { workspace } = useContext(WorkspaceContext) // We get the workspace from the context to retrieve the directory tree of the workspace, thus retrieving the data files

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
          Input Module
        </p>
        <DropzoneComponent>
          <Button style={{ alignItems: "flex-end", marginInline: "2%" }}>
            <Plus size={"2rem"} />
          </Button>
        </DropzoneComponent>
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
              <SidebarDirectoryTreeControlled />
            </Accordion.Body>
          </Accordion.Item>
        </Accordion>
        {/* We render the workspace only if it is set, otherwise it throws an error */}
      </Stack>
    </>
  )
}

export default InputSidebar
