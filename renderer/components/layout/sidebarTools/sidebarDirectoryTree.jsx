import React, { useContext, useRef, useState, useEffect } from "react"
import { Accordion, Stack } from "react-bootstrap"
import { Folder } from "react-bootstrap-icons"
import { SidebarFolder, SidebarFile } from "./components"
import {
  UncontrolledTreeEnvironment,
  Tree,
  StaticTreeDataProvider
} from "react-complex-tree"
import { WorkspaceContext } from "../../workspace/workspaceContext"
import { DataContext } from "../../workspace/dataContext"
import MedDataObject from "../../workspace/medDataObject"
import renderers from "./renderers"
import { assert } from "console"
import { toast } from "react-toastify"
import {
  showContextMenu,
  Menu,
  MenuDivider,
  MenuItem,
  hideContextMenu
} from "@blueprintjs/core"
import MedContextMenu from "./medContextMenu"
const cx = (...classNames) => classNames.filter((cn) => !!cn).join(" ")

/**
 * @description - This component is the sidebar tools component that will be used in the sidebar component
 * @param {Object} props - Props passed from parent component
 * @returns a sidebar item component that can be a file or a folder and that is rendered recursively
 */
const SidebarDirectoryTree = () => {
  // const environment = useRef()
  // const tree

  const { workspace } = useContext(WorkspaceContext) // We get the workspace from the context to retrieve the directory tree of the workspace, thus retrieving the data files
  const { globalData, setGlobalData } = useContext(DataContext) // We get the global data from the context to retrieve the directory tree of the workspace, thus retrieving the data files

  const [dirTree, setDirTree] = useState({}) // We get the directory tree from the workspace

  const [showContextMenu, setShowContextMenu] = useState(false)
  const [contextMenuPosition, setContextMenuPosition] = useState({
    x: 0,
    y: 0
  })

  const renderItem = (
    { item, depth, children, title, context, arrow, info, ...test },
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
                additionalParams.setShowContextMenu(true)
                e.preventDefault()
                setContextMenuPosition({ x: e.clientX, y: e.clientY })

                // addEventListener("click", (e) => {
                //   if (e.target.className !== "context-menu-overlay") {
                //     additionalParams.setShowContextMenu(false)
                //   }
                // })

                console.log("CONTEXT MENU", e)
                console.log("ITEM", item)
                console.log("DEPTH", depth)
                console.log("CHILDREN", children)
                console.log("TITLE", title)
                console.log("CONTEXT", context)
                console.log("ARROW", arrow)
                console.log("INFO", info)
                console.log("PROPS", test)
                console.log("ADDITIONAL PARAMS", additionalParams)
              }}
            >
              {title}
            </InteractiveComponent>
            {additionalParams.showContextMenu && (
              <div
                className="context-menu-overlay"
                style={{
                  position: "fixed",
                  left: additionalParams.contextMenuPosition.x,
                  top: additionalParams.contextMenuPosition.y
                }}
              >
                <ul className="context-menu">
                  <li onClick={(e) => handleContextMenuAction("Open", item)}>
                    Open
                  </li>
                  <li onClick={(e) => handleContextMenuAction("Rename", item)}>
                    Rename
                  </li>
                  <li onClick={(e) => handleContextMenuAction("Delete", item)}>
                    Delete
                  </li>
                </ul>
              </div>
            )}
          </div>
          {children}
        </li>
      </>
    )
  }

  const handleContextMenuAction = (action, name) => {
    console.log("ACTION", action)
    console.log("NAME", name)
    setShowContextMenu(false)
  }

  /**
   * Handles the focus out event on the sidebar file component to hide the context menu.
   * @param {Event} event - The focus out event.
   */
  function handleFocusOut(event) {
    setShowContextMenu(false)
  }

  /**
   * Handles the key down event on the sidebar file component to hide the context menu and cancel renaming if the escape key is pressed.
   * @param {Event} event - The key down event.
   */
  function handleKeyDown(event) {
    if (event.key === "Escape") {
      setShowContextMenu(false)
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

  useEffect(() => {
    window.addEventListener("click", handleClickOutside)
    window.addEventListener("keydown", handleKeyDown)
    window.addEventListener("focusout", handleFocusOut)

    return () => {
      window.removeEventListener("click", handleClickOutside)
      window.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("focusout", handleFocusOut)
    }
  }, [showContextMenu])

  function verifyAuthenticity(medObject, foundObject) {
    if (medObject.path !== foundObject.path) {
      toast.error(
        `The file ${medObject.name} has been moved or deleted outside of the application. The path found is ${foundObject.path} and the one expected was ${medObject.path}.`
      )
      return false
    } else if (medObject.type !== foundObject.type) {
      toast.error(
        `The file ${medObject.name} has been modified outside of the application. The type found is ${foundObject.type} and the one expected was ${medObject.type}.`
      )
      return false
    } else if (medObject.name !== foundObject.name) {
      toast.error(
        `The file ${medObject.name} has been renamed outside of the application. The name found is ${foundObject.name} and the one expected was ${medObject.name}.`
      )
      return false
    }
    return true
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

  const dataProvider = new StaticTreeDataProvider(dirTree, (item, data) => ({
    ...item,
    data
  }))

  async function listener(changedItemIds) {
    // const changedItems = changedItemIds.map(dataProvider.getTreeItem)
    changedItemIds.forEach((changedItemId) => {
      dataProvider.getTreeItem(changedItemId).then((item) => {
        console.log("ITEM", item)
        let medDataObject = globalData[item.UUID]
        console.log("MED DATA OBJECT", medDataObject)
      })
    })
  }

  dataProvider.onDidChangeTreeData(listener)

  useState(() => {
    console.log("GLOBAL DATA", globalData)
    if (globalData) {
      let newTree = fromJSONtoTree(globalData)
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
        dataProvider={dataProvider}
        getItemTitle={(item) => item.data}
        viewState={{}}
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
        renderItem={(json) =>
          renderItem(json, {
            showContextMenu,
            setShowContextMenu,
            contextMenuPosition,
            setContextMenuPosition
          })
        }
      >
        <Tree treeId="tree-1" rootItem="UUID_ROOT" treeLabel="tree" />
      </UncontrolledTreeEnvironment>
    </>
  )
}

export { SidebarDirectoryTree }
// {context.showContextMenu && (
//   <div
//     className="context-menu-overlay"
//     style={{
//       left: context.contextMenuPosition.x,
//       top: context.contextMenuPosition.y
//     }}
//   >
//     <ul className="context-menu">
//       <li
//         onClick={(e) =>
//           console.log("Open", e.name)
//         }
//       >
//         Open
//       </li>
//       <li
//         onClick={(e) =>
//           console.log("Rename", e.name)
//         }
//       >
//         Rename
//       </li>
//       <li
//         onClick={(e) =>
//           console.log("Delete", e.name)
//         }
//       >
//         Delete
//       </li>
//     </ul>
//   </div>
// )}
