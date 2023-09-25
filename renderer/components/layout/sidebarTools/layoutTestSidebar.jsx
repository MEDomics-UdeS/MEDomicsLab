import React, { useContext, useState } from "react"
import { Accordion, Stack } from "react-bootstrap"
import { Folder } from "react-bootstrap-icons"
import { SidebarFile, SidebarFolder } from "./components"
import { LayoutModelContext } from "../layoutContext"
import { useEffect } from "react"
import SidebarDirectoryTreeControlled from "./sidebarDirectoryTreeControlled"

const LayoutTestSidebar = () => {
  /**
   * @description - This component is the sidebar pane for the layout test page
   *
   */

  const { layoutModel } = useContext(LayoutModelContext) // Here we retrieve the layoutModel from the LayoutContext
  const deleteBool = true // This is a boolean that will be passed to the SidebarFile component to enable the delete button, for development purposes
  const addBool = true // This is a boolean that will be passed to the SidebarFile component to enable the add button, for development purposes
  const [tabsList, setTabsList] = useState(layoutModel) // This is the list of tabs that will be displayed in the sidebar
  useEffect(() => {
    console.log("TABS LIST", tabsList)
    setTabsList(layoutModel)
  }, [layoutModel])

  return (
    <>
      <Stack direction="vertical" gap={0}>
        <Accordion defaultActiveKey={["0"]} alwaysOpen>
          <Accordion.Item eventKey="0">
            <Accordion.Header>
              <p className="title-text">Add page</p>
            </Accordion.Header>
            <Accordion.Body>
              <Stack direction="vertical" gap={0}>
                <SidebarFile name="Test page" add={addBool} delete={deleteBool} />
                <SidebarFile name="Input page" add={addBool} delete={deleteBool} />
                <SidebarFile name="Extraction page" add={addBool} delete={deleteBool} />
                <SidebarFile name="Discovery page" add={addBool} delete={deleteBool} />
                <SidebarFile name="Learning page" add={addBool} delete={deleteBool} />
                <SidebarFile name="Results page" add={addBool} delete={deleteBool} />
                <SidebarFile name="Application page" add={addBool} delete={deleteBool} />
              </Stack>
            </Accordion.Body>
          </Accordion.Item>
          <Accordion.Item eventKey="1">
            <Accordion.Header>
              <Stack direction="horizontal" gap={1} style={{ padding: "0 0 0 0", alignContent: "center" }}>
                <Folder style={{ marginLeft: "0.2rem" }} />
                Tabs explorer
              </Stack>
            </Accordion.Header>
            <Accordion.Body className="sidebar-acc-body">
              <Stack direction="vertical" gap={0}>
                <SidebarFolder name={"Workspace #1"}>{tabsList.layout.children}</SidebarFolder>
              </Stack>
            </Accordion.Body>
          </Accordion.Item>
          {/* <SidebarDirectoryTreeControlled /> */}
        </Accordion>
      </Stack>
    </>
  )
}

export default LayoutTestSidebar
