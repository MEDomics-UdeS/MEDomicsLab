import React, { useEffect, useState, useContext } from "react"
import { Accordion, Stack } from "react-bootstrap"
import { FileEarmark, Folder, PlusSquare, XSquare } from "react-bootstrap-icons"
import { randomUUID } from "crypto"
import { LayoutModelContext } from "../layoutContext"
import { DataContext } from "../../workspace/dataContext"
import MedDataObject from "../../workspace/medDataObject"
import EditableLabel from "react-simple-editlabel"
import { ipcRenderer } from "electron"
/**
 * @description - This component is the sidebar tools component that will be used in the sidebar component
 * @param {Object} props - Props passed from parent component
 * @returns a sidebar item component that can be a file or a folder and that is rendered recursively
 */
const SidebarItem = (props) => {
  function renderChildren(parent) {
    // This function is used to render the children of the parent component recursively
    console.log(parent.name)
    if (parent.children !== undefined) {
      // If the parent has children, then we render the children, otherwise we render the file
      return (
        <>
          <Accordion defaultActiveKey={parent.name}>
            <Accordion.Item eventKey={parent.name}>
              <Accordion.Header>{parent.name}</Accordion.Header>
              <Accordion.Body>
                <Stack direction="vertical" gap={0}>
                  {parent.children.map((child) => {
                    renderChildren(child)
                    console.log(child)
                  })}
                </Stack>
              </Accordion.Body>
            </Accordion.Item>
          </Accordion>
        </>
      )
    } else {
      return <SidebarFile name={parent.name} />
    }
  }

  return <>{renderChildren(props)}</>
}

/**
 * @description - This component is the sidebar folder component that will be used in the sidebar component
 * @param {Object} props - Props passed from parent component
 * @returns a sidebar folder component
 */
const SidebarFolder = (props) => {
  return (
    <Accordion defaultActiveKey={props.name}>
      <Accordion.Item eventKey={props.name}>
        <Accordion.Header>
          <Stack
            className="sidebar-file-stack"
            direction="horizontal"
            gap={1}
            style={{ padding: "0 0 0 0", alignContent: "center" }}
          >
            <Folder size={"1rem"} style={{ marginLeft: "0.2rem" }} />
            {props.name}
            {props.afterHeader}
          </Stack>
        </Accordion.Header>
        <Accordion.Body className="sidebar-acc-body">
          <Stack className="sidebar-folder-stack" direction="vertical" gap={0}>
            {props.children.map((child) => {
              if (child.children !== undefined) {
                return (
                  <SidebarFolder name={child.name} key={randomUUID()}>
                    {child.children}
                  </SidebarFolder>
                )
              } else {
                let UUID = ""
                try {
                  UUID = child.metadata.UUID
                } catch (error) {
                  UUID = randomUUID()
                }
                return <SidebarFile name={child.name} key={UUID} />
              }
            })}
          </Stack>
        </Accordion.Body>
      </Accordion.Item>
    </Accordion>
  )
}

const SidebarFile = (props) => {
  // Define state variables for the component.
  const [isRenaming, setIsRenaming] = useState(false)
  const [newName, setNewName] = useState(props.name)

  const [showContextMenu, setShowContextMenu] = useState(false)
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 })

  // Get the `dispatchLayout` and `globalData` state objects from the `LayoutModelContext` and `DataContext` contexts, respectively.
  const { dispatchLayout } = useContext(LayoutModelContext)
  const { globalData, setGlobalData } = useContext(DataContext)

  // Define functions to handle various events.
  const handleRename = () => {
    setIsRenaming(true)
  }

  const handleRenameCancel = () => {
    setIsRenaming(false)
    setNewName(props.name)
  }

  function handleNameChange(event) {
    // Check if the new name is the same as the current name.
    if (event == props.name) {
      handleRenameCancel()
    } else {
      // Get the UUID of the `MedDataObject` with the current name from the `globalData` object.
      let uuid = MedDataObject.checkIfMedDataObjectInContextbyName(
        props.name,
        globalData
      )
      let dataObject = globalData[uuid]

      // Rename the `MedDataObject` with the new name and update the `globalData` object.
      let renamedDataObject = MedDataObject.rename(
        dataObject,
        event,
        globalData
      )
      let globalDataCopy = { ...globalData }
      globalDataCopy[uuid] = renamedDataObject
      setGlobalData(globalDataCopy)
      MedDataObject.updateWorkspaceDataObject()
    }
  }

  // Define functions to handle the click events on the add and delete buttons.
  function OnClickAdd(e, name) {
    dispatchLayout({
      type: "add",
      payload: { type: "tab", name: name, component: "grid" }
    })
  }
  function OnClickDelete(e, name) {
    dispatchLayout({
      type: "remove",
      payload: { type: "tab", name: name, component: "grid" }
    })
  }

  // Define functions to handle the open and delete actions from the context menu.
  function onOpen(name) {
    let dataObjectUUID = MedDataObject.checkIfMedDataObjectInContextbyName(
      name,
      globalData
    )
    let path = globalData[dataObjectUUID].path
    dispatchLayout({
      type: "add",
      payload: {
        type: "tab",
        name: name,
        component: "dataTable",
        config: { path: path }
      }
    })
  }

  function onDelete() {
    // Get the UUID of the `MedDataObject` with the current name from the `globalData` object.
    let uuid = MedDataObject.checkIfMedDataObjectInContextbyName(
      props.name,
      globalData
    )
    if (uuid == "") {
      console.log("Error: UUID not found")
      return
    } else {
      // Delete the `MedDataObject` with the current name from the `globalData` object.
      let globalDataCopy = { ...globalData }
      MedDataObject.delete(globalDataCopy[uuid])
      delete globalDataCopy[uuid]
      setGlobalData(globalDataCopy)
      MedDataObject.updateWorkspaceDataObject()
    }
  }

  // Define functions to handle the click and context menu events on the file.
  function handleClick(event, name) {
    console.log(`Clicked on file ${name}`)
  }

  /**
   * Handles the right-click event on the sidebar file component to show the context menu.
   * @param {Event} event - The right-click event.
   * @param {string} name - The name of the file.
   */
  function handleContextMenu(event) {
    event.preventDefault()
    setShowContextMenu(true)
    setContextMenuPosition({ x: event.clientX, y: event.clientY })
  }

  /**
   * Handles the click event on a context menu action.
   * @param {string} action - The name of the action that was clicked.
   * @param {string} name - The name of the file.
   */
  function handleContextMenuAction(action, name) {
    console.log(`Clicked on action ${action} of the file ${name}`)
    switch (action) {
      case "Open":
        onOpen(name)
        break
      case "Rename":
        handleRename()
        break
      case "Delete":
        onDelete(name)
        break
      default:
        break
    }
    setShowContextMenu(false)
  }

  /**
   * Handles the focus out event on the sidebar file component to hide the context menu.
   * @param {Event} event - The focus out event.
   */
  function handleFocusOut() {
    setShowContextMenu(false)
  }

  /**
   * Handles the key down event on the sidebar file component to hide the context menu and cancel renaming if the escape key is pressed.
   * @param {Event} event - The key down event.
   */
  function handleKeyDown(event) {
    if (event.key === "Escape") {
      setShowContextMenu(false)
      handleRenameCancel()
    }
  }

  /**
   * Handles the click outside event on the sidebar file component to hide the context menu.
   * @param {Event} event - The click outside event.
   */
  function handleClickOutside(event) {
    if (showContextMenu && !event.target.closest(".context-menu-overlay")) {
      setShowContextMenu(false)
    }
  }

  /**
   * Handles the context menu outside event on the sidebar file component to hide the context menu.
   * @param {Event} event - The context menu outside event.
   */
  function handleContextMenuOutside(event) {
    if (props.name !== event.target.innerText) {
      setShowContextMenu(false)
    }
  }

  // Add event listeners for various events.
  useEffect(() => {
    window.addEventListener("click", handleClickOutside)
    window.addEventListener("keydown", handleKeyDown)
    window.addEventListener("focusout", handleFocusOut)
    window.addEventListener("contextmenu", handleContextMenuOutside)

    return () => {
      window.removeEventListener("click", handleClickOutside)
      window.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("focusout", handleFocusOut)
      window.removeEventListener("contextmenu", handleContextMenuOutside)
    }
  }, [showContextMenu])

  // Define variables for the add and delete icons.
  let plusIcon = (
    <button
      className="sidebar-file-button"
      onClick={(e) => OnClickAdd(e, props.name)}
    >
      <PlusSquare />
    </button>
  )
  let deleteIcon = (
    <button
      className="sidebar-file-button"
      onClick={(e) => OnClickDelete(e, props.name)}
    >
      <XSquare />
    </button>
  )

  // Define variables for the `before` and `after` elements.
  let before = <></>
  let after = <></>

  return (
    <>
      <Stack
        className="sidebar-file-main-button"
        onClick={(e) => handleClick(e, props.name)}
        onContextMenu={(e) => handleContextMenu(e, props.name)}
        direction="horizontal"
        gap={1}
        style={{ padding: "0 0 0 0", alignContent: "center" }}
      >
        <FileEarmark style={{ marginLeft: "0.2rem" }} />

        {before}
        <EditableLabel
          className="sidebar-file-editable-label"
          labelClassName="file-editable-label"
          inputClassName="file-editable-input"
          text={newName}
          isEditing={isRenaming}
          inputWidth="20ch"
          inputHeight="25px"
          labelFontWeight="bold"
          inputFontWeight="bold"
          // raiseOnFocusOutOnEsc={true}
          onFocusOut={(e) => handleNameChange(e, props._UUID)}
          onFocus={handleRename}
        />
        {after}

        <div style={{ flexGrow: "5" }} />
        {props.add ? plusIcon : <></>}
        {props.delete ? deleteIcon : <></>}
        {/* Here above we render the add and delete icons if the props are set to true */}
      </Stack>

      {showContextMenu && (
        <div
          className="context-menu-overlay"
          style={{ left: contextMenuPosition.x, top: contextMenuPosition.y }}
        >
          <ul className="context-menu">
            <li onClick={() => handleContextMenuAction("Open", props.name)}>
              Open
            </li>
            <li onClick={() => handleContextMenuAction("Rename", props.name)}>
              Rename
            </li>
            <li onClick={() => handleContextMenuAction("Delete", props.name)}>
              Delete
            </li>
          </ul>
        </div>
      )}
    </>
  )
}

export { SidebarFile, SidebarFolder, SidebarItem }
