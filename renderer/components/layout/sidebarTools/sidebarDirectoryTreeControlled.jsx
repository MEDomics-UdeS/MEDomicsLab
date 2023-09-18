import React, { useContext, useRef, useState, useEffect } from "react"
import { Trash, BoxArrowUpRight, Eraser } from "react-bootstrap-icons"
import { ControlledTreeEnvironment, Tree } from "react-complex-tree"
import { WorkspaceContext } from "../../workspace/workspaceContext"
import { DataContext } from "../../workspace/dataContext"
import MedDataObject from "../../workspace/medDataObject"
import { toast } from "react-toastify"
import { LayoutModelContext } from "../layoutContext"

import { useContextMenu, Menu, Item, Submenu } from "react-contexify"
import renderItem from "./directoryTree/renderItem"
/**
 * @description - This component is the sidebar tools component that will be used in the sidebar component
 * @param {Object} props - Props passed from parent component
 * @returns a sidebar item component that can be a file or a folder and that is rendered recursively
 */
const SidebarDirectoryTreeControlled = () => {
  const environment = useRef()
  const tree = useRef()
  const MENU_ID = "tree-2"
  const { show } = useContextMenu({
    id: MENU_ID
  })

  const [focusedItem, setFocusedItem] = useState()
  const [expandedItems, setExpandedItems] = useState([])
  const [selectedItems, setSelectedItems] = useState([])

  const { globalData, setGlobalData } = useContext(DataContext) // We get the global data from the context to retrieve the directory tree of the workspace, thus retrieving the data files
  const { dispatchLayout } = useContext(LayoutModelContext)

  const [dirTree, setDirTree] = useState({}) // We get the directory tree from the workspace

  function onRename(uuid) {
    setSelectedItems([uuid])

    tree.current.startRenamingItem(uuid)
    // let f2 = new KeyboardEvent("keydown", { key: "F2" })
  }

  function onOpen(uuid) {
    let dataObjectUUID = uuid
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

  function handleContextMenuAction({ id, props }) {
    switch (id) {
      case "open":
        onOpen(props.UUID)
        break
      case "rename":
        onRename(props.UUID)
        break
      case "delete":
        onDelete(props.UUID)
        break
    }
  }

  function displayMenu(e, data) {
    show({ event: e, props: data })
  }

  function handleNameChange(medObject, newName) {
    const namesYouCantRename = [
      "UUID_ROOT",
      "DATA",
      "EXPERIMENTS",
      "RESULTS",
      "MODELS"
    ]
    if (newName == "") {
      toast.error("Error: Name cannot be empty")
      return
    } else if (medObject.name == newName) {
      toast.error("Error: You really wanted to rename to the same name?")
      return
    } else if (boolNameInArray(newName, namesYouCantRename)) {
      toast.error("Error: This name is reserved and cannot be used")
      return
    } else if (boolNameInArray(medObject.name, namesYouCantRename)) {
      console
      toast.error("Error: This name cannot be changed")
      return
    } else if (boolNameInArray(newName, Object.keys(globalData))) {
      toast.error("Error: This name is already used")
      return
    } else {
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
  }

  function boolNameInArray(name, array) {
    let nameInArray = false
    array.includes(name) ? (nameInArray = true) : (nameInArray = false)
    return nameInArray
  }

  function reorderArrayOfFoldersAndFiles(array, dataContextObject) {
    // Reorder the array of folders and files so that the folders are first and the files are last.
    let folders = []
    let files = []

    array.forEach((item) => {
      console.log("item", dataContextObject[item])
      if (dataContextObject[item] !== undefined) {
        if (dataContextObject[item].type == "folder") {
          folders.push(item)
        } else {
          files.push(item)
        }
      }
    })
    return folders.concat(files)
  }

  function fromJSONtoTree(medDataContext) {
    const treeToSend = {}
    const namesYouCantRename = [
      "UUID_ROOT",
      "DATA",
      "EXPERIMENTS",
      "RESULTS",
      "MODELS"
    ]

    Object.keys(medDataContext).forEach((key) => {
      let medDataItem = medDataContext[key]
      let medDataItemName = medDataItem.name
      let itemIsFolder = medDataItem.type === "folder"
      let ableToRename = !boolNameInArray(medDataItemName, namesYouCantRename)
      let treeItem = {
        index: key,
        isFolder: itemIsFolder,
        UUID: key,
        name: medDataItemName,
        type: medDataItem.extension,
        path: medDataItem.path,
        acceptedFiles: medDataItem.acceptedFileTypes,
        children:
          medDataItem.childrenIDs !== null
            ? reorderArrayOfFoldersAndFiles(
                medDataItem.childrenIDs,
                medDataContext
              )
            : [],
        data: medDataItemName,
        canRename: ableToRename
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

  return (
    <>
      <ControlledTreeEnvironment
        ref={environment}
        items={dirTree}
        renderItem={(json) =>
          renderItem(json, {
            show,
            MENU_ID,
            displayMenu
          })
        }
        getItemTitle={(item) => item.data}
        viewState={{
          ["tree-2"]: {
            focusedItem,
            expandedItems,
            selectedItems
          }
        }}
        onFocusItem={(item) => setFocusedItem(item.index)}
        onExpandItem={(item) =>
          setExpandedItems([...expandedItems, item.index])
        }
        onCollapseItem={(item) =>
          setExpandedItems(
            expandedItems.filter(
              (expandedItemIndex) => expandedItemIndex !== item.index
            )
          )
        }
        onSelectItems={(items) => setSelectedItems(items)}
        canReorderItems={true}
        canDropOnFolder={true}
        canRename={true}
        canDragAndDrop={true}
        onRenameItem={handleNameChange}
      >
        <Tree
          treeId="tree-2"
          rootItem="UUID_ROOT"
          treeLabel="Tree Example"
          ref={tree}
        />
      </ControlledTreeEnvironment>
      <Menu id={MENU_ID}>
        <Submenu
          className="context-submenu"
          label={
            <>
              <BoxArrowUpRight size={"1rem"} className="context-menu-icon" />
              Open in...
            </>
          }
        >
          <Item>DataTable Viewer (default)</Item>
          <Item>D-Tale</Item>
          <Item>PandasProfiling</Item>
        </Submenu>
        <Item id="rename" onClick={handleContextMenuAction}>
          <Eraser size={"1rem"} className="context-menu-icon" />
          Rename
        </Item>
        <Item id="delete" onClick={handleContextMenuAction}>
          <Trash size={"1rem"} className="context-menu-icon" />
          Delete
        </Item>
      </Menu>
    </>
  )
}

export { SidebarDirectoryTreeControlled }
