import React, { useContext, useState, useEffect } from "react"
import {
  UncontrolledTreeEnvironment,
  Tree,
  StaticTreeDataProvider
} from "react-complex-tree"
import { DataContext } from "../../workspace/dataContext"
import MedDataObject from "../../workspace/medDataObject"

const cx = (...classNames) => classNames.filter((cn) => !!cn).join(" ")

/**
 * @description - This component is the sidebar tools component that will be used in the sidebar component
 * @param {Object} props - Props passed from parent component
 * @returns a sidebar item component that can be a file or a folder and that is rendered recursively
 */
const SidebarDirectoryTree = () => {
  // const environment = useRef()
  // const tree

  const { globalData, setGlobalData } = useContext(DataContext) // We get the global data from the context to retrieve the directory tree of the workspace, thus retrieving the data files

  const [dirTree, setDirTree] = useState({}) // We get the directory tree from the workspace

  const [showContextMenu, setShowContextMenu] = useState({
    show: false,
    id: ""
  }) // We get the directory tree from the workspace
  const [contextMenuPosition, setContextMenuPosition] = useState({
    x: 0,
    y: 0
  })

  const renderItem = (
    { item, depth, children, title, context, arrow },
    additionalParams
  ) => {
    const InteractiveComponent = context.isRenaming ? "div" : "button"

    const type = context.isRenaming ? undefined : "button"

    // TODO have only root li component create all the classes
    return (
      <>
        <li
          {...context.itemContainerWithChildrenProps}
          className={cx(
            "rct-tree-item-li",
            item.isFolder && "rct-tree-item-li-isFolder",
            context.isSelected && "rct-tree-item-li-selected",
            context.isExpanded && "rct-tree-item-li-expanded",
            context.isFocused && "rct-tree-item-li-focused",
            context.isDraggingOver && "rct-tree-item-li-dragging-over",
            context.isSearchMatching && "rct-tree-item-li-search-match"
          )}
        >
          <div
            {...context.itemContainerWithoutChildrenProps}
            style={{ paddingLeft: `${(depth + 1) * 4}px` }}
            className={cx(
              "rct-tree-item-title-container",
              item.isFolder && "rct-tree-item-title-container-isFolder",
              context.isSelected && "rct-tree-item-title-container-selected",
              context.isExpanded && "rct-tree-item-title-container-expanded",
              context.isFocused && "rct-tree-item-title-container-focused",
              context.isDraggingOver &&
                "rct-tree-item-title-container-dragging-over",
              context.isSearchMatching &&
                "rct-tree-item-title-container-search-match"
            )}
          >
            {arrow}
            <InteractiveComponent
              type={type}
              {...context.interactiveElementProps}
              className={cx(
                "rct-tree-item-button",
                item.isFolder && "rct-tree-item-button-isFolder",
                context.isSelected && "rct-tree-item-button-selected",
                context.isExpanded && "rct-tree-item-button-expanded",
                context.isFocused && "rct-tree-item-button-focused",
                context.isDraggingOver && "rct-tree-item-button-dragging-over",
                context.isSearchMatching && "rct-tree-item-button-search-match"
              )}
              onContextMenu={(e) => {
                console.log("CONTEXT MENU", e.target)
                additionalParams.setShowContextMenu({
                  show: true,
                  id: e.target
                })
                additionalParams.setContextMenuPosition({
                  x: e.clientX,
                  y: e.clientY
                })
                // e.target.click()
                e.preventDefault()
                // console.log("CONTEXT MENU", e.target)
              }}
            >
              {additionalParams.showContextMenu["show"] && (
                <div
                  className="context-menu-overlay"
                  style={{
                    position: "fixed",
                    left: additionalParams.contextMenuPosition.x,
                    top: additionalParams.contextMenuPosition.y
                  }}
                >
                  <ul className="context-menu" title={title}>
                    <li
                      onClick={() => {
                        handleContextMenuAction(
                          "Open",
                          additionalParams.showContextMenu.id
                        )
                      }}
                    >
                      Open
                    </li>
                    <li
                      onClick={() => {
                        handleContextMenuAction(
                          "Rename",
                          additionalParams.showContextMenu.id
                        )
                      }}
                    >
                      Rename
                    </li>
                    <li
                      onClick={() => {
                        handleContextMenuAction(
                          "Delete",
                          additionalParams.showContextMenu.id
                        )
                      }}
                    >
                      Delete
                    </li>
                  </ul>
                </div>
              )}
              {title}
            </InteractiveComponent>
          </div>
          {children}
        </li>
      </>
    )
  }

  function handleContextMenuAction(action, name) {
    let nameId = name.dataset["rctItemId"]
    console.log("ACTION", action)
    console.log("NAME", name.dataset["rctItemId"])

    console.log(globalData[nameId])

    if (action === "Open") {
      console.log("OPEN")
    } else if (action === "Rename") {
      console.log("RENAME")
    } else if (action === "Delete") {
      console.log("DELETE")
      onDelete(nameId)
    }
    setShowContextMenu({ show: false, id: "" })
  }

  /**
   * Handles the focus out event on the sidebar file component to hide the context menu.
   * @param {Event} event - The focus out event.
   */
  function handleFocusOut(event) {
    console.log("FOCUS OUT", event)
    // if (showContextMenu && !event.target.closest(".context-menu-overlay")) {
    //   setShowContextMenu({"show": false, "id":""})
    // }

    // setShowContextMenu({"show": false, "id":""})
  }

  /**
   * Handles the key down event on the sidebar file component to hide the context menu and cancel renaming if the escape key is pressed.
   * @param {Event} event - The key down event.
   */
  function handleKeyDown(event) {
    if (event.key === "Escape") {
      setShowContextMenu({ show: false, id: "" })
    }
  }

  /**
   * Handles the click outside event on the sidebar file component to hide the context menu.
   * @param {Event} event - The click outside event.
   */
  function handleClickOutside(event) {
    if (showContextMenu && !event.target.closest(".context-menu-overlay")) {
      setShowContextMenu({ show: false, id: "" })
    } else if (
      showContextMenu &&
      event.target.closest(".context-menu-overlay")
    ) {
      // console.log("CLICKED INSIDE")
    }
  }

  /**
   * Handles the context menu outside event on the sidebar file component to hide the context menu.
   * @param {Event} event - The context menu outside event.
   */

  useEffect(() => {
    console.log("SHOW CONTEXT MENU", showContextMenu)
    window.addEventListener("click", handleClickOutside)
    window.addEventListener("keydown", handleKeyDown)
    window.addEventListener("focusout", handleFocusOut)

    return () => {
      window.removeEventListener("click", handleClickOutside)
      window.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("focusout", handleFocusOut)
    }
  }, [showContextMenu])

  function onDelete(uuid) {
    // Get the UUID of the `MedDataObject` with the current name from the `globalData` object.

    if (uuid == "") {
      console.log("Error: UUID not found")
      return
    } else if (uuid == "UUID_ROOT") {
      console.log("Error: Cannot delete root")
      return
    } else if (globalData[uuid] == undefined) {
      console.log("Error: UUID not found in globalData")
    } else {
      // Delete the `MedDataObject` with the current name from the `globalData` object.
      let globalDataCopy = { ...globalData }
      MedDataObject.delete(globalDataCopy[uuid])
      delete globalDataCopy[uuid]
      setGlobalData(globalDataCopy)
      MedDataObject.updateWorkspaceDataObject(300)
    }
  }

  function handleNameChange(medObject, newName) {
    // Check if the new name is the same as the current name.

    // Get the UUID of the `MedDataObject` with the current name from the `globalData` object.

    let dataObject = globalData[medObject.UUID]
    let uuid = medObject.UUID
    // Rename the `MedDataObject` with the new name and update the `globalData` object.
    let renamedDataObject = MedDataObject.rename(
      dataObject,
      newName,
      globalData
    )
    let globalDataCopy = { ...globalData }
    globalDataCopy[uuid] = renamedDataObject
    setGlobalData(globalDataCopy)
    MedDataObject.updateWorkspaceDataObject()
  }

  function fromJSONtoTree(medDataContext) {
    const treeToSend = {}

    Object.keys(medDataContext).forEach((key) => {
      let medDataItem = medDataContext[key]
      let medDataItemName = medDataItem.name
      let itemIsFolder = medDataItem.type === "folder"
      let treeItem = {
        index: key,
        isFolder: itemIsFolder,
        UUID: key,
        name: medDataItemName,
        type: medDataItem.type,
        path: medDataItem.path,
        children:
          medDataItem.childrenIDs !== null ? medDataItem.childrenIDs : [],
        data: medDataItemName
      }
      treeToSend[key] = treeItem
      if (medDataItem.parentID.length == 0) {
        treeToSend.root.children.push(key)
      }
    })
    console.log("TREE TO SEND", treeToSend)
    return treeToSend
  }

  useEffect(() => {
    console.log("GLOBAL DATA", globalData)
    if (globalData) {
      let newTree = fromJSONtoTree({ ...globalData })
      console.log("NEW TREE", newTree)
      setDirTree(newTree)
    }
  }, [globalData])

  // This component is used to render a directory tree in the sidebar
  // console.log("PROPS", props)

  return (
    <>
      <UncontrolledTreeEnvironment
        props={{ "data-testid": "tree-environment" }}
        dataProvider={
          new StaticTreeDataProvider(dirTree, (item, data) => ({
            ...item,
            data
          }))
        }
        getItemTitle={(item) => item.data}
        viewState={{}}
        canDropOnFolder={true}
        canRename={true}
        canDragAndDrop={true}
        canReorderItems={true}
        autoFocus={true}
        onDrop={(item, target) => {
          console.log("ITEM DROP", item)
          console.log("TARGET DROP", target)
        }}
        onRenameItem={handleNameChange}
        onPrimaryAction={(item) => {
          console.log("ITEM-PrimaryAction", item)
        }}
        onSearchItem={(searchString) => {
          console.log("SEARCH STRING", searchString)
        }}
        renderItem={(json) =>
          renderItem(json, {
            showContextMenu,
            setShowContextMenu,
            contextMenuPosition,
            setContextMenuPosition,
            handleContextMenuAction
          })
        }
      >
        <Tree
          treeId="tree-1"
          rootItem="UUID_ROOT"
          treeLabel="tree"
          // test={globalData}
        />
      </UncontrolledTreeEnvironment>
    </>
  )
}

export { SidebarDirectoryTree }
