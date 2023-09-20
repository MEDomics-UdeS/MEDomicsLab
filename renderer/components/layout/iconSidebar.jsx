import React, { useState, useContext, useEffect } from "react"
import { Files, HouseFill, Gear, GraphUp, Image, Magnet, Server, Stack, TextLeft, FileEarmarkBarGraph, RocketTakeoff, PatchCheck, Search, BandaidFill } from "react-bootstrap-icons"
import Nav from "react-bootstrap/Nav"
import { NavDropdown } from "react-bootstrap"
import { WorkspaceContext } from "../workspace/workspaceContext"
import { Tooltip } from "primereact/tooltip"

/**
 * @description Sidebar component containing icons for each page
 * @param {function} onSidebarItemSelect - function to handle sidebar item selection
 * @returns Returns the sidebar component with icons for each page
 */

const IconSidebar = ({ onSidebarItemSelect }) => {
  // eslint-disable-next-line no-unused-vars
  const [activeKey, setActiveKey] = useState("home") // activeKey is the name of the page
  const [disabledIcon, setDisabledIcon] = useState("disabled") // disabled is the state of the page

  const { workspace } = useContext(WorkspaceContext)

  useEffect(() => {
    if (workspace.hasBeenSet == false) {
      setActiveKey("home")
      setDisabledIcon(true)
    } else {
      setDisabledIcon(false)
    }
  }, [workspace])

  function handleClick(event, name) {
    onSidebarItemSelect(name)
    console.log(`clicked ${name}`, event)
    setActiveKey(name)
  }

  const [buttonClass, setButtonClass] = useState("")

  const handleNavClick = () => {
    setButtonClass(buttonClass === "" ? "show" : "")
  }

  const delayOptions = { showDelay: 750, hideDelay: 0 }

  return (
    <>
      <div
        className="col"
        style={{
          display: "flex",
          position: "relative",
          height: "100%",
          width: "55px",
          maxWidth: "55px",
          minWidth: "55px",
          backgroundColor: "#3a3a3a",
          borderRadius: "0px !important",
          paddingRight: "0px"
        }}
      >
        {/* ------------------------------------------- Tooltips ----------------------------------------- */}
        <Tooltip target=".homeNavIcon" {...delayOptions} className="tooltip-icon-sidebar" />
        <Tooltip target=".explorerNav" {...delayOptions} className="tooltip-icon-sidebar" />
        <Tooltip target=".searchNav" {...delayOptions} className="tooltip-icon-sidebar" />
        <Tooltip target=".inputNav" {...delayOptions} className="tooltip-icon-sidebar" />
        <Tooltip target=".extractionNav" {...delayOptions} className="tooltip-icon-sidebar" />
        <Tooltip target=".discoveryNav" {...delayOptions} className="tooltip-icon-sidebar" />
        <Tooltip target=".learningNav" {...delayOptions} className="tooltip-icon-sidebar" />
        <Tooltip target=".resultsNav" {...delayOptions} className="tooltip-icon-sidebar" />
        <Tooltip target=".applicationNav" {...delayOptions} className="tooltip-icon-sidebar" />
        <Tooltip target=".layoutTestNav" {...delayOptions} className="tooltip-icon-sidebar" />
        <Tooltip target=".settingsNav" {...delayOptions} className="tooltip-icon-sidebar" />

        {/* ------------------------------------------- END Tooltips ----------------------------------------- */}

        {/* ------------------------------------------- ICON NAVBAR ----------------------------------------- */}

        <Nav defaultActiveKey="/home" className="flex-column" style={{ width: "100%", maxWidth: "100%", minWidth: "100%" }}>
          <Nav.Link data-pr-at="right bottom" data-pr-tooltip="Home" data-pr-my="left bottom" className="homeNavIcon btnSidebar" href="#home" eventKey="home" data-tooltip-id="tooltip-home" onClick={(event) => handleClick(event, "home")}>
            <HouseFill size={"1.25rem"} width={"100%"} height={"100%"} style={{ scale: "0.65" }} />
          </Nav.Link>

          <Nav.Link className="explorerNav btnSidebar" data-pr-at="right bottom" data-pr-tooltip="Explorer" data-pr-my="left bottom" eventKey="explorer" data-tooltip-id="tooltip-explorer" onClick={(event) => handleClick(event, "explorer")}>
            <Files size={"1.25rem"} width={"100%"} height={"100%"} style={{ scale: "0.65" }} />
          </Nav.Link>

          <Nav.Link className="searchNav btnSidebar" data-pr-at="right bottom" data-pr-tooltip="Search" data-pr-my="left bottom" eventKey="search" data-tooltip-id="tooltip-search" onClick={(event) => handleClick(event, "search")} disabled={disabledIcon}>
            <Search size={"1.25rem"} width={"100%"} height={"100%"} style={{ scale: "0.65" }} />
          </Nav.Link>

          <NavDropdown.Divider style={{ height: "1rem" }} />

          <Nav.Link className="inputNav btnSidebar" data-pr-at="right bottom" data-pr-my="left bottom" data-pr-tooltip="Input" eventKey="input" data-tooltip-id="tooltip-input" onClick={(event) => handleClick(event, "input")} disabled={disabledIcon}>
            <Server size={"1.25rem"} width={"100%"} height={"100%"} style={{ scale: "0.65" }} />
          </Nav.Link>

          <Nav.Link className="extractionNav btnSidebar" data-pr-at="right bottom" data-pr-my="left bottom" data-pr-tooltip="Extraction" eventKey="extraction" data-tooltip-id="tooltip-extraction" onClick={(event) => handleClick(event, "extraction")} disabled={disabledIcon}>
            <Magnet size={"1.25rem"} width={"100%"} height={"100%"} style={{ scale: "0.65" }} />
          </Nav.Link>

          <Nav.Link className="discoveryNav btnSidebar" data-pr-at="right bottom" data-pr-my="left bottom" data-pr-tooltip="Exploratory" eventKey="discovery" data-tooltip-id="tooltip-discovery" onClick={(event) => handleClick(event, "discovery")} disabled={disabledIcon}>
            <FileEarmarkBarGraph size={"1.25rem"} width={"100%"} height={"100%"} style={{ scale: "0.65" }} />
          </Nav.Link>

          <Nav.Link className="learningNav btnSidebar" data-pr-at="right bottom" data-pr-my="left bottom" data-pr-tooltip="Learning" eventKey="Learning" data-tooltip-id="tooltip-learning" onClick={(event) => handleClick(event, "learning")} disabled={disabledIcon}>
            <Stack size={"1.25rem"} width={"100%"} height={"100%"} style={{ scale: "0.65" }} />
          </Nav.Link>

          <Nav.Link className="resultsNav btnSidebar" data-pr-at="right bottom" data-pr-my="left bottom" data-pr-tooltip="Results" eventKey="Results" onClick={(event) => handleClick(event, "results")} disabled={disabledIcon}>
            <PatchCheck size={"1.25rem"} width={"100%"} height={"100%"} style={{ scale: "0.65" }} />
          </Nav.Link>

          <Nav.Link className="applicationNav btnSidebar" data-pr-at="right bottom" data-pr-my="left bottom" data-pr-tooltip="Application" eventKey="Application" data-tooltip-id="tooltip-application" onClick={(event) => handleClick(event, "application")} disabled={disabledIcon}>
            <RocketTakeoff size={"1.25rem"} width={"100%"} height={"100%"} style={{ scale: "0.65" }} />
          </Nav.Link>

          {/* div that puts the buttons to the bottom of the sidebar*/}
          <div className="d-flex" style={{ flexGrow: "1" }}></div>

          <Nav.Link className="layoutTestNav btnSidebar" data-pr-at="right bottom" data-pr-my="left bottom" data-pr-tooltip="Layout Test" eventKey="LayoutTest" data-tooltip-id="tooltip-layoutTest" onClick={(event) => handleClick(event, "layoutTest")}>
            <BandaidFill size={"1.25rem"} width={"100%"} height={"100%"} style={{ scale: "0.65" }} />
          </Nav.Link>

          <div className="d-flex" style={{ flexGrow: "1" }}></div>

          <NavDropdown className="settingsNav btnSidebar" data-pr-at="right bottom" data-pr-my="left bottom" data-pr-tooltip="Settings" data-tooltip-id="tooltip-settings" onClick={handleNavClick} title={<Gear size={"1.25rem"} width={"100%"} height={"100%"} style={{ scale: "0.75" }} />}>
            <NavDropdown.Item className="developerModeNav" data-pr-at="right bottom" data-pr-my="left bottom" data-pr-tooltip="Developer Mode" href="#/action-1">
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
