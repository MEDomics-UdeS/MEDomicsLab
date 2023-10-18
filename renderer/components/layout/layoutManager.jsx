import React, { useEffect, useState, useCallback, useRef, useContext } from "react"
import { PanelGroup, Panel, PanelResizeHandle } from "react-resizable-panels"
import resizable from "../../styles/resizable.module.css"
import IconSidebar from "../layout/iconSidebar"
import Home from "../mainPages/home"
import Input from "../mainPages/input"
import Learning from "../mainPages/learning"
import ExtractionImagePage from "../mainPages/extraction_images"
import ExtractionTextPage from "../mainPages/extraction_text"
import ExtractionTSPage from "../mainPages/extraction_ts"
import ExploratoryPage from "../mainPages/exploratory"
import ResultsPage from "../mainPages/results"
import ApplicationPage from "../mainPages/application"
import HomeSidebar from "./sidebarTools/homeSidebar"
import ExplorerSidebar from "./sidebarTools/explorerSidebar"
import SearchSidebar from "./sidebarTools/searchSidebar"
import LayoutTestSidebar from "./sidebarTools/layoutTestSidebar"
import InputSidebar from "./sidebarTools/inputSidebar"
import LearningSidebar from "./sidebarTools/learningSidebar"
import ExtractionSidebar from "./sidebarTools/extractionSidebar"
import { ipcRenderer } from "electron"
import { MainContainer } from "./flexlayout/mainContainerClass"
import EvaluationPage from "../mainPages/evaluation"
import SidebarDirectoryTreeControlled from "./sidebarTools/sidebarDirectoryTreeControlled"
import { Accordion, Stack } from "react-bootstrap"
import { LayoutModelContext } from "./layoutContext"
import { WorkspaceContext } from "../workspace/workspaceContext"

const LayoutManager = (props) => {
  const [activeSidebarItem, setActiveSidebarItem] = useState("home") // State to keep track of active nav item
  const [workspaceIsSet, setWorkspaceIsSet] = useState(true) // State to keep track of active nav item
  const sidebarRef = useRef(null) // Reference to the sidebar object

  const { layoutState, dispatchLayout, developerMode, setDeveloperMode } = useContext(LayoutModelContext)
  const { workspace } = useContext(WorkspaceContext)
  useEffect(() => {
    if (workspace.hasBeenSet == false) {
      setWorkspaceIsSet(false)
    } else {
      setWorkspaceIsSet(true)
    }
  }, [workspace])

  // This is a callback that will be called when the user presses a key
  // It will check if the user pressed ctrl+b and if so, it will collapse or expand the sidebar
  const handleKeyPress = useCallback((event) => {
    if (event.ctrlKey && event.key === "b") {
      let newShowSidebar = sidebarRef.current.getCollapsed()
      if (newShowSidebar) {
        sidebarRef.current.expand()
      } else {
        sidebarRef.current.collapse()
      }
    }
  }, [])

  useEffect(() => {
    // attach the event listener
    document.addEventListener("keydown", handleKeyPress)
    // remove the event listener
    return () => {
      document.removeEventListener("keydown", handleKeyPress)
    }
  }, [handleKeyPress])

  const handleSidebarItemSelect = (selectedItem) => {
    setActiveSidebarItem(selectedItem) // Update activeNavItem state with selected item
    ipcRenderer.send("messageFromNext", "updateWorkingDirectory")
  }

  // Render content component based on activeNavItem state
  const renderContentComponent = ({ props }) => {
    if (developerMode && workspaceIsSet) {
      return <MainContainer />
    } else {
      switch (activeSidebarItem) {
        case "home":
          return <Home />
        case "input":
          return <Input pageId="42" />
        case "learning":
          return <Learning pageId="123" />
        case "extraction_images":
          return <ExtractionImagePage pageId="1234" />
        case "extraction_text":
          return <ExtractionTextPage pageId="4567"/>
        case "extraction_ts":
          return <ExtractionTSPage pageId="456" />
        case "exploratory":
          return <ExploratoryPage />
        case "results":
          return <ResultsPage />
        case "evaluation":
          return <EvaluationPage />
        case "application":
          return <ApplicationPage />
        case "layoutTest":
          return <MainContainer />
        default:
      }
    }
  }

  const renderSidebarComponent = () => {
    switch (activeSidebarItem) {
      case "home":
        return <HomeSidebar />
      case "explorer":
        return <ExplorerSidebar />
      case "search":
        return <SearchSidebar />
      case "layoutTest":
        return <LayoutTestSidebar />
      case "input":
        return <InputSidebar />
      case "learning":
        return <LearningSidebar />
      case "extraction_text":
        return <ExtractionSidebar />
      case "extraction_ts":
        return <ExtractionSidebar />

      default:
        return (
          <>
            <Stack direction="vertical" gap={3} style={{ marginLeft: "0.5rem" }}>
              <h5 style={{ color: "#d3d3d3", marginLeft: "0.5rem" }}>{activeSidebarItem}</h5>
              <Accordion defaultActiveKey={["0"]} alwaysOpen>
                <SidebarDirectoryTreeControlled />
              </Accordion>
            </Stack>
          </>
        )
    }
  }

  return (
    <>
      <div style={{ height: "100%", display: "flex", width: "100%" }}>
        <IconSidebar onSidebarItemSelect={handleSidebarItemSelect} activeSidebarItem={activeSidebarItem} />
        <div className="main-app-container">
          <PanelGroup autoSaveId="test" direction="horizontal">
            <Panel className={resizable.Panel} collapsible={true} minSize={20} maxSize={80} defaultSize={20} order={1} ref={sidebarRef}>
              <div className={`${resizable.PanelContent} sidebar-content`} style={{ backgroundColor: "#353535" }}>
                {renderSidebarComponent()}
              </div>
            </Panel>
            <PanelResizeHandle className={resizable.ResizeHandleOuter}>
              <div className={resizable.ResizeHandleInner} />
            </PanelResizeHandle>
            <Panel className={resizable.Panel} collapsible={true} order={2}>
              {renderContentComponent({ props })} {/* Render content component based on activeNavItem state */}
            </Panel>
          </PanelGroup>
        </div>
      </div>
    </>
  )
}

export default LayoutManager
