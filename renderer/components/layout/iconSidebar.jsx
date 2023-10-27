import React, { useState, useContext, useEffect } from "react"
import { Files, HouseFill, Gear, Server, Search, BandaidFill, Send } from "react-bootstrap-icons"
import Nav from "react-bootstrap/Nav"
import { NavDropdown } from "react-bootstrap"
import { WorkspaceContext } from "../workspace/workspaceContext"
import { Tooltip } from "primereact/tooltip"
import { LayoutModelContext } from "./layoutContext"
import { PiFlaskFill } from "react-icons/pi"
import { VscGraph } from "react-icons/vsc"
import { FaMagnifyingGlassChart } from "react-icons/fa6"
import { LuNetwork } from "react-icons/lu"
import { Button } from "primereact/button"
import { TbFileExport } from "react-icons/tb"
import { VscChromeClose } from "react-icons/vsc"

/**
 * @description Sidebar component containing icons for each page
 * @param {function} onSidebarItemSelect - function to handle sidebar item selection
 * @returns Returns the sidebar component with icons for each page
 */
const IconSidebar = ({ onSidebarItemSelect }) => {
  // eslint-disable-next-line no-unused-vars
  const { dispatchLayout, developerMode, setDeveloperMode } = useContext(LayoutModelContext)
  const [activeKey, setActiveKey] = useState("home") // activeKey is the name of the page
  const [disabledIcon, setDisabledIcon] = useState("disabled") // disabled is the state of the page
  const [developerModeNav, setDeveloperModeNav] = useState(true)
  const [extractionBtnstate, setExtractionBtnstate] = useState(false)
  const [buttonClass, setButtonClass] = useState("")

  const delayOptions = { showDelay: 750, hideDelay: 0 }

  // default action to set developer mode to true
  useEffect(() => {
    handleToggleDeveloperMode()
  }, [])

  /**
   * @description Toggles the developer mode
   */
  function handleToggleDeveloperMode() {
    console.log("handleToggleDeveloperMode")
    setDeveloperMode(!developerMode)
    setDeveloperModeNav(!developerModeNav)
  }

  /**
   *
   * @param {Event} event
   * @param {string} name
   */
  function handleRightClick(event, name) {
    event.stopPropagation()
    console.log(`right clicked ${name}`, event, `open${name}Module`)
    dispatchLayout({ type: `open${name}Module`, payload: { pageId: name } })
  }

  const { workspace } = useContext(WorkspaceContext)

  /**
   * @description Sets the active key and disabled state of the sidebar icons
   */
  useEffect(() => {
    if (!workspace.hasBeenSet) {
      setActiveKey("home")
      setDisabledIcon(true)
    } else {
      setDisabledIcon(false)
    }
  }, [workspace])

  useEffect(() => {}, [extractionBtnstate])

  /**
   *
   * @param {Event} event The event that triggered the click
   * @param {string} name The name of the page
   */
  function handleClick(event, name) {
    onSidebarItemSelect(name)
    console.log(`clicked ${name}`, event)
    setActiveKey(name)
  }

  /**
   * @description Handles the click on the settings button
   */
  const handleNavClick = () => {
    setButtonClass(buttonClass === "" ? "show" : "")
  }

  return (
    <>
      <div className="icon-sidebar">
        {/* ------------------------------------------- Tooltips ----------------------------------------- */}
        <Tooltip target=".homeNavIcon" {...delayOptions} className="tooltip-icon-sidebar" />
        <Tooltip target=".explorerNav" {...delayOptions} className="tooltip-icon-sidebar" />
        <Tooltip target=".searchNav" {...delayOptions} className="tooltip-icon-sidebar" />
        <Tooltip target=".inputNav" {...delayOptions} className="tooltip-icon-sidebar" />
        <Tooltip target=".extractionNav" {...delayOptions} className="tooltip-icon-sidebar" data-pr-disabled={extractionBtnstate} />
        <Tooltip target=".exploratoryNav" {...delayOptions} className="tooltip-icon-sidebar" />
        <Tooltip target=".learningNav" {...delayOptions} className="tooltip-icon-sidebar" />
        <Tooltip target=".resultsNav" {...delayOptions} className="tooltip-icon-sidebar" />
        <Tooltip target=".evaluationNav" {...delayOptions} className="tooltip-icon-sidebar" />
        <Tooltip target=".applicationNav" {...delayOptions} className="tooltip-icon-sidebar" />
        <Tooltip target=".layoutTestNav" {...delayOptions} className="tooltip-icon-sidebar" />
        <Tooltip target=".ext-MEDimg-btn" {...delayOptions} className="tooltip-icon-sidebar" />
        <Tooltip target=".ext-text-btn" {...delayOptions} className="tooltip-icon-sidebar" />
        <Tooltip target=".ext-ts-btn" {...delayOptions} className="tooltip-icon-sidebar" />
        <Tooltip target=".ext-img-btn" {...delayOptions} className="tooltip-icon-sidebar" />

        {/* ------------------------------------------- END Tooltips ----------------------------------------- */}

        {/* ------------------------------------------- ICON NAVBAR ----------------------------------------- */}

        <Nav defaultActiveKey="/home" className="flex-column" style={{ width: "100%", height: "100%" }}>
          <Nav.Link className="homeNavIcon btnSidebar" data-pr-at="right center" data-pr-tooltip="Home" data-pr-my="left center" href="#home" eventKey="home" data-tooltip-id="tooltip-home" onClick={(event) => handleClick(event, "home")} onAuxClick={(event) => handleRightClick(event, "Home")}>
            <HouseFill size={"1.25rem"} width={"100%"} height={"100%"} style={{ scale: "0.65" }} />
          </Nav.Link>

          <Nav.Link className="explorerNav btnSidebar" data-pr-at="right center" data-pr-tooltip="Explorer" data-pr-my="left center" eventKey="explorer" data-tooltip-id="tooltip-explorer" onClick={(event) => handleClick(event, "explorer")}>
            <Files size={"1.25rem"} width={"100%"} height={"100%"} style={{ scale: "0.65" }} />
          </Nav.Link>

          <Nav.Link className="searchNav btnSidebar" data-pr-at="right center" data-pr-tooltip="Search" data-pr-my="left center" eventKey="search" data-tooltip-id="tooltip-search" onClick={(event) => handleClick(event, "search")} disabled={disabledIcon}>
            <Search size={"1.25rem"} width={"100%"} height={"100%"} style={{ scale: "0.65" }} />
          </Nav.Link>

          <NavDropdown.Divider className="icon-sidebar-divider" style={{ height: "3rem" }} />
          <div className="medomics-layer design">
            <div className="sidebar-icons">
              <Nav.Link className="inputNav btnSidebar" data-pr-at="right center" data-pr-my="left center" data-pr-tooltip="Input" eventKey="input" data-tooltip-id="tooltip-input" onAuxClick={(event) => handleRightClick(event, "Input")} onClick={(event) => handleClick(event, "input")} disabled={disabledIcon}>
                <Server size={"1.25rem"} width={"100%"} height={"100%"} style={{ scale: "0.65" }} />
              </Nav.Link>

              <Nav.Link
                className="extractionNav btnSidebar align-center"
                data-pr-at="right center"
                data-pr-my="left center"
                data-pr-tooltip="extraction"
                data-pr-disabled={extractionBtnstate}
                eventKey="extraction"
                data-tooltip-id="tooltip-extraction"
                onAuxClick={(event) => handleRightClick(event, "extraction")}
                onClick={() => {
                  setExtractionBtnstate(!extractionBtnstate)
                }}
                disabled={disabledIcon}
                onBlur={(event) => {
                  let clickedTarget = event.relatedTarget
                  let blurAccepeted = true
                  if (clickedTarget) {
                    blurAccepeted = !clickedTarget.getAttribute("data-is-ext-btn")
                  } else {
                    blurAccepeted = true
                  }
                  blurAccepeted && setExtractionBtnstate(false)
                }}
              >
                {extractionBtnstate ? <VscChromeClose style={{ height: "1.7rem", width: "auto" }} /> : <TbFileExport style={{ height: "1.7rem", width: "auto" }} />}
                <div className={`btn-group-ext ${extractionBtnstate ? "clicked" : ""}`}>
                  <Button
                    className="ext-MEDimg-btn"
                    icon="pi pi-image"
                    data-pr-at="right center"
                    data-pr-my="left center"
                    data-pr-tooltip="MEDimage"
                    data-is-ext-btn
                    onClick={(event) => {
                      console.log("clicked extraction image", event)
                      event.stopPropagation()
                      event.preventDefault()
                      handleClick(event, "extractionMEDimage")
                      setExtractionBtnstate(!extractionBtnstate)
                    }}
                    onAuxClick={(event) => handleRightClick(event, "ExtractionMEDimage")}
                  />
                  <Button
                    className="ext-text-btn"
                    icon="pi pi-align-left"
                    data-pr-at="right center"
                    data-pr-my="left center"
                    data-pr-tooltip="Text"
                    data-is-ext-btn
                    onClick={(event) => {
                      console.log("clicked extraction text", event)
                      event.stopPropagation()
                      event.preventDefault()
                      handleClick(event, "extractionText")
                      setExtractionBtnstate(!extractionBtnstate)
                    }}
                    onAuxClick={(event) => handleRightClick(event, "ExtractionText")}
                  />
                  <Button
                    className="ext-ts-btn"
                    icon="pi pi-chart-line"
                    data-pr-at="right center"
                    data-pr-my="left center"
                    data-pr-tooltip="Time Series"
                    data-is-ext-btn
                    onClick={(event) => {
                      console.log("clicked extraction ts", event)
                      event.stopPropagation()
                      event.preventDefault()
                      handleClick(event, "extractionTS")
                      setExtractionBtnstate(!extractionBtnstate)
                    }}
                    onAuxClick={(event) => handleRightClick(event, "ExtractionTS")}
                  />
                  <Button
                    className="ext-img-btn"
                    icon="pi pi-database"
                    data-pr-at="right center"
                    data-pr-my="left center"
                    data-pr-tooltip="Image"
                    data-is-ext-btn
                    onClick={(event) => {
                      console.log("clicked extraction image", event)
                      event.stopPropagation()
                      event.preventDefault()
                      handleClick(event, "extractionImage")
                      setExtractionBtnstate(!extractionBtnstate)
                    }}
                    onAuxClick={(event) => handleRightClick(event, "ExtractionImage")}
                  />
                </div>
              </Nav.Link>

              <Nav.Link className="exploratoryNav btnSidebar align-center" data-pr-at="right center" data-pr-my="left center" data-pr-tooltip="Exploratory" eventKey="exploratory" data-tooltip-id="tooltip-exploratory" onAuxClick={(event) => handleRightClick(event, "Exploratory")} onClick={(event) => handleClick(event, "exploratory")} disabled={disabledIcon}>
                {" "}
                <FaMagnifyingGlassChart style={{ height: "1.7rem", width: "auto" }} />
              </Nav.Link>
            </div>
            <div className="medomics-layer-text">Design</div>
          </div>
          <NavDropdown.Divider style={{ height: "3rem" }} />

          <div className="medomics-layer development ">
            <div className="sidebar-icons">
              <Nav.Link className="learningNav btnSidebar align-center" data-pr-at="right center" data-pr-my="left center" data-pr-tooltip="Learning" eventKey="Learning" data-tooltip-id="tooltip-learning" onClick={(event) => handleClick(event, "learning")} disabled={disabledIcon}>
                <LuNetwork style={{ height: "1.7rem", width: "auto", rotate: "-90deg" }} />
              </Nav.Link>

              <Nav.Link className="resultsNav btnSidebar align-center" data-pr-at="right center" data-pr-my="left center" data-pr-tooltip="Results" eventKey="Results" onClick={(event) => handleClick(event, "results")} disabled={disabledIcon} onAuxClick={(event) => handleRightClick(event, "Results")}>
                <VscGraph style={{ height: "1.7rem", width: "auto" }} />
              </Nav.Link>

              <Nav.Link className="evaluationNav btnSidebar align-center" data-pr-at="right center" data-pr-my="left center" data-pr-tooltip="Evaluation" eventKey="Evaluation" onClick={(event) => handleClick(event, "evaluation")} disabled={disabledIcon} onAuxClick={(event) => handleRightClick(event, "Evaluation")}>
                <PiFlaskFill style={{ height: "2.2rem", width: "auto" }} />
              </Nav.Link>
            </div>
            <div className="medomics-layer-text">Development</div>
          </div>
          <NavDropdown.Divider style={{ height: "3rem" }} />

          <div className="medomics-layer deployment">
            <div className="sidebar-icons">
              <Nav.Link className="applicationNav btnSidebar" data-pr-at="right center" data-pr-my="left center" data-pr-tooltip="Application" eventKey="Application" data-tooltip-id="tooltip-application" onClick={(event) => handleClick(event, "application")} disabled={disabledIcon} onAuxClick={(event) => handleRightClick(event, "Application")}>
                <Send size={"1.25rem"} width={"100%"} height={"100%"} style={{ scale: "0.65" }} />
              </Nav.Link>
            </div>
            <div className="medomics-layer-text">Deployment</div>
          </div>

          {/* div that puts the buttons to the bottom of the sidebar*/}
          <div className="d-flex icon-sidebar-divider" style={{ flexGrow: "1" }}></div>

          <Nav.Link className="layoutTestNav btnSidebar" data-pr-at="right center" data-pr-my="left center" data-pr-tooltip="Layout Test" eventKey="LayoutTest" data-tooltip-id="tooltip-layoutTest" onClick={(event) => handleClick(event, "layoutTest")}>
            <BandaidFill size={"1.25rem"} width={"100%"} height={"100%"} style={{ scale: "0.65" }} />
          </Nav.Link>

          <div className="d-flex icon-sidebar-divider" style={{ flexGrow: "1" }}></div>

          <NavDropdown className="settingsNav btnSidebar" onClick={handleNavClick} title={<Gear size={"1.25rem"} width={"100%"} height={"100%"} style={{ scale: "0.75" }} />}>
            <NavDropdown.Item className="developerModeNav" data-pr-at="right center" data-pr-my="left center" data-pr-tooltip="Developer Mode" href="#/action-1" onClick={(event) => handleToggleDeveloperMode(event)}>
              Toggle developer mode
            </NavDropdown.Item>
            <NavDropdown.Item href="#/action-2">Help</NavDropdown.Item>
            <NavDropdown.Item href="#/action-3">About</NavDropdown.Item>
          </NavDropdown>
        </Nav>
        {/* ------------------------------------------- END ICON NAVBAR ----------------------------------------- */}
      </div>
    </>
  )
}

export default IconSidebar
