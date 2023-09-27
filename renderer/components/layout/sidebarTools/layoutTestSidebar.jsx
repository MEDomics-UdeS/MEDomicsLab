import React, { useContext, useState } from "react"
import { Accordion, Stack, Button } from "react-bootstrap"
import { ArrowCounterclockwise, Folder, Plus } from "react-bootstrap-icons"
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

  const handleResetLayout = (e) => {
    let layoutModelCopy = { ...layoutModel }
    console.log("RESET LAYOUT", e, layoutModelCopy)
    localStorage.removeItem("layout")
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
          Layout Test Sidebar
        </p>
        <Button className="btn-sidebar-learning" onClick={handleResetLayout}>
          Reset Layout
          <ArrowCounterclockwise />
        </Button>
        <Accordion defaultActiveKey={["0"]} alwaysOpen>
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
          <SidebarDirectoryTreeControlled />
        </Accordion>
      </Stack>
    </>
  )
}

export default LayoutTestSidebar
