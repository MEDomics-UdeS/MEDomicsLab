import React, { useState, useContext, useEffect } from "react"
import {
  Files,
  HouseFill,
  Gear,
  Magnet,
  Server,
  Stack,
  FileEarmarkBarGraph,
  RocketTakeoff,
  PatchCheck,
  Search,
  BandaidFill
} from "react-bootstrap-icons"
import OverlayTrigger from "react-bootstrap/OverlayTrigger"
import Tooltip from "react-bootstrap/Tooltip"
import Nav from "react-bootstrap/Nav"
import { NavDropdown } from "react-bootstrap"
import { WorkspaceContext } from "../workspace/workspaceContext"

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

  return (
    <>
      <div className="icon-sidebar">
        <Nav
          defaultActiveKey="/home"
          className="flex-column"
          style={{ width: "100%", maxWidth: "100%", minWidth: "100%" }}
        >
          <OverlayTrigger
            placement={"right"}
            overlay={<Tooltip id={"tooltip-home"}>Home</Tooltip>}
          >
            <Nav.Link
              className="btnSidebar"
              href="#home"
              eventKey="home"
              data-tooltip-id="tooltip-home"
              onClick={(event) => handleClick(event, "home")}
            >
              <HouseFill
                size={"1.25rem"}
                width={"100%"}
                height={"100%"}
                style={{ scale: "0.65" }}
              />
            </Nav.Link>
          </OverlayTrigger>

          <OverlayTrigger
            placement={"right"}
            overlay={<Tooltip id={"tooltip-explorer"}>Explorer</Tooltip>}
          >
            <Nav.Link
              className="btnSidebar"
              eventKey="explorer"
              data-tooltip-id="tooltip-explorer"
              onClick={(event) => handleClick(event, "explorer")}
            >
              <Files
                size={"1.25rem"}
                width={"100%"}
                height={"100%"}
                style={{ scale: "0.65" }}
              />
            </Nav.Link>
          </OverlayTrigger>

          <OverlayTrigger
            placement={"right"}
            overlay={<Tooltip id={"tooltip-search"}>Search</Tooltip>}
          >
            <Nav.Link
              className="btnSidebar"
              eventKey="search"
              data-tooltip-id="tooltip-search"
              onClick={(event) => handleClick(event, "search")}
              disabled={disabledIcon}
            >
              <Search
                size={"1.25rem"}
                width={"100%"}
                height={"100%"}
                style={{ scale: "0.65" }}
              />
            </Nav.Link>
          </OverlayTrigger>

          <NavDropdown.Divider style={{ height: "1rem" }} />
          <OverlayTrigger
            placement={"right"}
            overlay={<Tooltip id={"tooltip-input"}>Input Module</Tooltip>}
          >
            <Nav.Link
              className="btnSidebar"
              eventKey="input"
              data-tooltip-id="tooltip-input"
              onClick={(event) => handleClick(event, "input")}
              disabled={disabledIcon}
            >
              <Server
                size={"1.25rem"}
                width={"100%"}
                height={"100%"}
                style={{ scale: "0.65" }}
              />
            </Nav.Link>
          </OverlayTrigger>

          <OverlayTrigger
            placement={"right"}
            overlay={
              <Tooltip id={"tooltip-extraction"}>Extraction Module</Tooltip>
            }
          >
            <Nav.Link
              className="btnSidebar"
              eventKey="extraction"
              data-tooltip-id="tooltip-extraction"
              onClick={(event) => handleClick(event, "extraction")}
              disabled={disabledIcon}
            >
              <Magnet
                size={"1.25rem"}
                width={"100%"}
                height={"100%"}
                style={{ scale: "0.65" }}
              />
            </Nav.Link>
          </OverlayTrigger>

          <OverlayTrigger
            placement={"right"}
            overlay={
              <Tooltip id={"tooltip-discovery"}>Discovery Module</Tooltip>
            }
          >
            <Nav.Link
              className="btnSidebar"
              eventKey="discovery"
              data-tooltip-id="tooltip-discovery"
              onClick={(event) => handleClick(event, "discovery")}
              disabled={disabledIcon}
            >
              <FileEarmarkBarGraph
                size={"1.25rem"}
                width={"100%"}
                height={"100%"}
                style={{ scale: "0.65" }}
              />
            </Nav.Link>
          </OverlayTrigger>

          <OverlayTrigger
            placement={"right"}
            overlay={<Tooltip id={"tooltip-learning"}>Learning Module</Tooltip>}
          >
            <Nav.Link
              className="btnSidebar"
              eventKey="Learning"
              data-tooltip-id="tooltip-learning"
              onClick={(event) => handleClick(event, "learning")}
              disabled={disabledIcon}
            >
              <Stack
                size={"1.25rem"}
                width={"100%"}
                height={"100%"}
                style={{ scale: "0.65" }}
              />
            </Nav.Link>
          </OverlayTrigger>

          <OverlayTrigger
            placement={"right"}
            overlay={<Tooltip id={"tooltip-results"}>Results Module</Tooltip>}
          >
            <Nav.Link
              className="btnSidebar"
              eventKey="Results"
              data-tooltip-id="tooltip-resutls"
              onClick={(event) => handleClick(event, "results")}
              disabled={disabledIcon}
            >
              <PatchCheck
                size={"1.25rem"}
                width={"100%"}
                height={"100%"}
                style={{ scale: "0.65" }}
              />
            </Nav.Link>
          </OverlayTrigger>

          <OverlayTrigger
            placement={"right"}
            overlay={
              <Tooltip id={"tooltip-application"}>Application Module</Tooltip>
            }
          >
            <Nav.Link
              className="btnSidebar"
              eventKey="Application"
              data-tooltip-id="tooltip-application"
              onClick={(event) => handleClick(event, "application")}
              disabled={disabledIcon}
            >
              <RocketTakeoff
                size={"1.25rem"}
                width={"100%"}
                height={"100%"}
                style={{ scale: "0.65" }}
              />
            </Nav.Link>
          </OverlayTrigger>

          {/* div that puts the buttons to the bottom of the sidebar*/}
          <div className="d-flex" style={{ flexGrow: "1" }}></div>

          <OverlayTrigger
            placement={"right"}
            overlay={<Tooltip id={"tooltip-layoutTest"}>Layout Test</Tooltip>}
          >
            <Nav.Link
              className="btnSidebar"
              eventKey="LayoutTest"
              data-tooltip-id="tooltip-layoutTest"
              onClick={(event) => handleClick(event, "layoutTest")}
            >
              <BandaidFill
                size={"1.25rem"}
                width={"100%"}
                height={"100%"}
                style={{ scale: "0.65" }}
              />
            </Nav.Link>
          </OverlayTrigger>

          <div className="d-flex" style={{ flexGrow: "1" }}></div>

          <NavDropdown
            className="btnSidebar"
            data-tooltip-id="tooltip-settings"
            onClick={handleNavClick}
            title={
              <OverlayTrigger
                placement={"right"}
                overlay={<Tooltip id={"tooltip-settings"}>Settings</Tooltip>}
              >
                <Gear
                  size={"1.25rem"}
                  width={"100%"}
                  height={"100%"}
                  style={{ scale: "0.75" }}
                />
              </OverlayTrigger>
            }
          >
            <OverlayTrigger
              placement={"right"}
              overlay={
                <Tooltip id={"tooltip-application"}>
                  Toggle between a dynamic tab layout and a navbar based layout
                </Tooltip>
              }
            >
              <NavDropdown.Item href="#/action-1">
                Toggle developer mode
              </NavDropdown.Item>
            </OverlayTrigger>
            <NavDropdown.Item href="#/action-2">Help</NavDropdown.Item>
            <NavDropdown.Item href="#/action-3">About</NavDropdown.Item>
          </NavDropdown>
        </Nav>
      </div>
    </>
  )
}

export default IconSidebar
