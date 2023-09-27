import React, { useContext, useRef, useState, useEffect } from "react"
import { Trash, BoxArrowUpRight, Eraser, FolderPlus } from "react-bootstrap-icons"
import { Accordion, Stack } from "react-bootstrap"
import { ControlledTreeEnvironment, Tree } from "react-complex-tree"
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
const SidebarDirectoryTreeControlled = ({ setExternalSelectedItems, setExternalDBClick }) => {
  const environment = useRef() // This ref is used to get the environment of the directory tree
  const tree = useRef() // This ref is used to get the directory tree
  const MENU_ID = "tree-2" // This is the id of the context menu
  const { show } = useContextMenu() // This is the context menu

  const [focusedItem, setFocusedItem] = useState() // This state is used to keep track of the item that is currently focused
  const [expandedItems, setExpandedItems] = useState([]) // This state is used to keep track of the items that are currently expanded
  const [selectedItems, setSelectedItems] = useState([]) // This state is used to keep track of the items that are currently selected
  const [copiedItems, setCopiedItems] = useState([]) // This state is used to keep track of the items that have been copied
  const [dbClickedItem, setDbClickedItem] = useState([]) // This state is used to keep track of the items that have been copied
  // eslint-disable-next-line no-unused-vars
  const [cutItems, setCutItems] = useState([]) // This state is used to keep track of the items that have been cut
  const [isHovering, setIsHovering] = useState(false) // This state is used to know if the mouse is hovering the directory tree

  const [isAccordionShowing, setIsAccordionShowing] = useState(false) // This state is used to know if the accordion is collapsed or not
  const { globalData, setGlobalData } = useContext(DataContext) // We get the global data from the context to retrieve the directory tree of the workspace, thus retrieving the data files
  const { dispatchLayout } = useContext(LayoutModelContext)

  const [dirTree, setDirTree] = useState({}) // We get the directory tree from the workspace

  useEffect(() => {
    setExternalSelectedItems && setExternalSelectedItems(selectedItems)
  }, [selectedItems])

  /**
   * This function handles the key press event. It is attached to the document.
   * @param {Object} event - The key press event
   * @returns {void}
   * @note - This function is called when the user presses a key.
   */
  const handleKeyPress = (event) => {
    if (event.key === "Delete") {
      if (selectedItems.length > 0) {
        console.log("DELETE", selectedItems[0])
        selectedItems.forEach((item) => {
          onDelete(item)
        })
      }
    } else if (event.code === "KeyC" && event.ctrlKey) {
      setCopiedItems(selectedItems)
    } else if (event.code === "KeyX" && event.ctrlKey) {
      setCutItems(selectedItems)
    } else if (event.code === "KeyV" && event.ctrlKey) {
      if (copiedItems.length > 0) {
        console.log("PASTE", copiedItems)
        copiedItems.forEach((item) => {
          onPaste(item, selectedItems[0])
        })
      }
    }
  }

  /**
   * This useEffect hook attaches an event listener to the document to listen for key presses.
   */
  useEffect(() => {
    // attach the event listener
    document.addEventListener("keydown", handleKeyPress)
    // remove the event listener
    return () => {
      document.removeEventListener("keydown", handleKeyPress)
    }
  }, [handleKeyPress])

  /**
   * This function renames a `MedDataObject` in the workspace.
   * @param {string} uuid - The UUID of the `MedDataObject` to rename
   * @returns {void}
   * @note this function is useful to rename
   */
  function onRename(uuid) {
    setSelectedItems([uuid])
    tree.current.startRenamingItem(uuid)
  }

  /**
   * This function opens a `MedDataObject` in the workspace.
   * @param {string} uuid - The UUID of the `MedDataObject` to open
   * @returns {void}
   * @note - This function is called when the user double-clicks on a file or folder in the directory tree, or when the user right-clicks and selects "Open".
   * @todo - This function should open the file in the default application.
   * @README - This function is not implemented yet.
   */
  function onOpen(uuid) {
    let dataObjectUUID = uuid
    let path = globalData[dataObjectUUID].path
    // dispatchLayout({
    //   type: "add",
    //   payload: {
    //     type: "tab",
    //     name: name,
    //     component: "dataTable",
    //     config: { path: path }
    //   }
    // })
  }

  /**
   * This function pastes a `MedDataObject` in the workspace.
   * @param {string} uuid - The UUID of the `MedDataObject` to paste
   * @param {string} selectedItem - The UUID of the copied `MedDataObject`
   * @returns {void}
   * @note - This function is called when the user pastes a file or folder in the directory tree, either by pressing Ctrl+V or by right-clicking and selecting "Paste".
   */
  function onPaste(uuid, selectedItem) {
    let dataObject = globalData[uuid]
    if (selectedItem == undefined) {
      console.warn("PASTE - selectedItem undefined")
      return
    }

    let selectedItemObject = globalData[selectedItem]
    if (selectedItemObject.type !== undefined) {
      if (selectedItemObject.type == "folder") {
        MedDataObject.copy(dataObject, selectedItemObject, globalData, setGlobalData)
        MedDataObject.updateWorkspaceDataObject(300)
      } else {
        let parentObject = globalData[selectedItemObject.parentID]
        MedDataObject.copy(dataObject, parentObject, globalData, setGlobalData)
        MedDataObject.updateWorkspaceDataObject(300)
      }
    }
  }

  /**
   * This function deletes a `MedDataObject` in the workspace.
   * @param {string} uuid - The UUID of the `MedDataObject` to delete
   * @returns {void}
   * @note - This function is called when the user deletes a file or folder in the directory tree, either by pressing the delete key or by right-clicking and selecting "Delete".
   */
  function onDelete(uuid) {
    // Get the UUID of the `MedDataObject` with the current name from the `globalData` object.
    const namesYouCantDelete = ["UUID_ROOT", "DATA", "EXPERIMENTS", "RESULTS", "MODELS"]
    if (uuid == "") {
      toast.warning("Error: UUID not found")
      return
    } else if (uuid == "UUID_ROOT") {
      toast.warning("Error: Cannot delete root")
      return
    } else if (globalData[uuid] == undefined) {
      toast.warning("Error: UUID not found in globalData")
      return
    } else if (boolNameInArray(globalData[uuid].name, namesYouCantDelete)) {
      console.log("Error: This name cannot be deleted")
      toast.error(`Error: ${globalData[uuid].name} cannot be deleted`)
      return
    } else {
      // Delete the `MedDataObject` with the current name from the `globalData` object.
      let globalDataCopy = { ...globalData }
      globalDataCopy = MedDataObject.delete(globalDataCopy[uuid], globalData)
      setGlobalData(globalDataCopy)
      toast.success(`Deleted ${globalData[uuid].name}`)
      MedDataObject.updateWorkspaceDataObject(300)
    }
  }

  /**
   * This function handles the context menu action. It is passed to the render item function to be called when the user clicks on a context menu action.
   * @param {Object} param0 - The context menu action object
   *  @param {string} param0.id - The id of the context menu action
   *  @param {Object} param0.props - The props of the context menu action
   */
  function handleContextMenuAction({ id, props }) {
    switch (id) {
      case "openLearningModule":
        dispatchLayout({ type: "openInLearningModule", payload: props })
        break
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

  /**
   * This function handles the double click on an item in the directory tree.
   * @param {Object} event - The double click event
   * @param {Object} item - The item that was double clicked
   * @returns {void}
   */
  const onDBClickItem = (event, item) => {
    if (item.type == "medml") {
      dispatchLayout({ type: "openInLearningModule", payload: item })
    } else if (item.type == "csv" || item.type == "json" || item.type == "tsv" || item.type == "xlsx") {
      dispatchLayout({ type: "openInDataTable", payload: item })
    } else if (item.type == "py" || item.type == "ipynb") {
      dispatchLayout({ type: "openInCodeEditor", payload: item })
    } else if (item.type == "png" || item.type == "jpg" || item.type == "jpeg" || item.type == "gif" || item.type == "svg") {
      dispatchLayout({ type: "openInImageViewer", payload: item })
    } else if (item.type == "pdf") {
      dispatchLayout({ type: "openInPDFViewer", payload: item })
    } else if (item.type == "txt") {
      dispatchLayout({ type: "openInTextEditor", payload: item })
    } else if (item.type == "pkl") {
      dispatchLayout({ type: "openInModelViewer", payload: item })
    } else {
      console.log("DBCLICKED", event, item)
    }
    setDbClickedItem(item)
    // console.log("DBCLICKED", event, item)
  }

  /**
   * This useEffect hook sets the external double click item when the double click item changes.
   */
  useEffect(() => {
    if (setExternalDBClick) {
      setExternalDBClick(dbClickedItem)
    }
  }, [dbClickedItem])

  /**
   * This function displays the context menu.
   * @param {Object} e - The event
   * @param {Object} data - The data object
   * @returns {void}
   */
  function displayMenu(e, data) {
    console.log("DISPLAY MENU", e, data)
    if (data.isFolder) {
      show({
        id: "MENU_FOLDER",
        event: e,
        props: data
      })
    } else if (data.type == "medml") {
      show({
        id: "MENU_MEDML",
        event: e,
        props: data
      })
    } else if (data.type == "csv" || data.type == "json" || data.type == "tsv" || data.type == "xlsx") {
      show({
        id: "MENU_DATA",
        event: e,
        props: data
      })
    } else if (data.type == "py" || data.type == "ipynb") {
      show({
        id: "MENU_CODE",
        event: e,
        props: data
      })
    } else if (data.type == "png" || data.type == "jpg" || data.type == "jpeg" || data.type == "gif" || data.type == "svg") {
      show({
        id: "MENU_IMAGE",
        event: e,
        props: data
      })
    } else if (data.type == "pdf") {
      show({
        id: "MENU_PDF",
        event: e,
        props: data
      })
    } else if (data.type == "txt") {
      show({
        id: "MENU_TEXT",
        event: e,
        props: data
      })
    } else if (data.type == "pkl") {
      show({
        id: "MENU_MODEL",
        event: e,
        props: data
      })
    } else {
      show({
        id: "MENU_DEFAULT",
        event: e,
        props: data
      })
    }
  }

  /**
   * This function handles the drop of an item in the directory tree.
   * @param {Array} items - The array of items to drop
   * @param {Object} target - The target object
   * @returns {void}
   * @note - This function is called when the user drops an item in the directory tree.
   */
  const onDrop = async (items, target) => {
    const currentItems = tree.current.treeEnvironmentContext.items
    for (const item of items) {
      const parent = Object.values(currentItems).find((potentialParent) => potentialParent.children?.includes(item.index))

      if (!parent) {
        throw Error(`Could not find parent of item "${item.index}"`)
      }

      if (!parent.children) {
        throw Error(`Parent "${parent.index}" of item "${item.index}" did not have any children`)
      }

      if (target.targetType === "item" || target.targetType === "root") {
        if (target.targetItem === parent.index) {
          // NO Operation
        } else {
          let dataObject = globalData[item.UUID]
          if (dataObject.type == "folder") {
            MedDataObject.move(dataObject, globalData[target.targetItem], globalData, setGlobalData)
            MedDataObject.updateWorkspaceDataObject()
          } else {
            MedDataObject.move(dataObject, globalData[target.targetItem], globalData, setGlobalData)
            MedDataObject.updateWorkspaceDataObject()
          }
        }
      } else {
        if (target.parentItem === item.index) {
          // Trying to drop inside itself
          return
        }
        let dataObject = globalData[item.UUID]
        if (target.parentItem === dataObject.parentID) {
          // NO Operation
        } else {
          MedDataObject.move(dataObject, globalData[target.parentItem], globalData, setGlobalData)
          MedDataObject.updateWorkspaceDataObject()
        }
      }
    }
  }

  /**
   * This function renames a `MedDataObject` in the workspace.
   * @param {Object} medObject - The `MedDataObject` to rename
   * @param {string} newName - The new name of the `MedDataObject`
   * @returns {void}
   * @note - This function is called when the user renames a file or folder in the directory tree, either by F2 or by right-clicking and selecting "Rename".
   */
  function handleNameChange(medObject, newName) {
    const namesYouCantRename = ["UUID_ROOT", "DATA", "EXPERIMENTS", "RESULTS", "MODELS"]
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
      let renamedDataObject = MedDataObject.rename(dataObject, newName, globalData)
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

  /**
   * This function creates a new folder in the workspace with the name "New Folder" and the parent folder being the selected folder.
   * The button that triggers this function is only visible if the accordion is not collapsed.
   * @param {Array} selectedItems - The array of selected items in the directory tree
   * @returns {void}
   */
  function createFolder(selectedItems) {
    let selectedItem = selectedItems[0]
    let selectedItemObject = globalData[selectedItem]
    let parentObject = undefined
    if (selectedItemObject !== undefined && selectedItemObject.type !== undefined) {
      if (selectedItemObject.type == "folder") {
        parentObject = selectedItemObject
      } else {
        parentObject = globalData[selectedItemObject.parentID]
      }

      MedDataObject.createEmptyFolderFS("New Folder", parentObject.path)
      MedDataObject.updateWorkspaceDataObject()
      tree.current.expandItem(parentObject.getUUID()) // We expand the parent folder so that we see the new folder
    } else {
      toast.error("Error: Please select a folder")
    }
  }

  /**
   * This function reorders the array of folders and files so that the folders are first and the files are last.
   * @param {Array} array - The array of folders and files
   * @param {Object} dataContextObject - The data context object
   * @returns {Array} - The reordered array of folders and files
   */
  function reorderArrayOfFoldersAndFiles(array, dataContextObject) {
    let folders = []
    let files = []
    array.forEach((item) => {
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

  /**
   * This function converts the data context object to a tree object that can be used by the directory tree component.
   * @param {Object} medDataContext - The data context object
   * @returns {Object} - The tree object
   */
  function fromJSONtoTree(medDataContext) {
    const treeToSend = {}
    const namesYouCantRename = ["UUID_ROOT", "DATA", "EXPERIMENTS", "RESULTS", "MODELS"] // These names cannot be renamed

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
        children: medDataItem.childrenIDs !== null ? reorderArrayOfFoldersAndFiles(medDataItem.childrenIDs, medDataContext) : [],
        data: medDataItemName,
        canRename: ableToRename
      }
      treeToSend[key] = treeItem
      if (medDataItem.parentID.length == 0) {
        treeToSend.root.children.push(key)
      }
    })

    return treeToSend
  }

  /**
   * This useEffect hook updates the directory tree when the global data changes.
   */
  useEffect(() => {
    if (globalData) {
      let newTree = fromJSONtoTree({ ...globalData })
      setDirTree(newTree)
    }
  }, [globalData])

  return (
    <>
      <Accordion.Item eventKey="dirTree">
        <Accordion.Header>
          <Stack direction="horizontal" style={{ flexGrow: "1" }}>
            <p>
              <strong>OPEN EDITORS</strong>
            </p>
            <div style={{ flexGrow: "10" }} />

            {
              isAccordionShowing && (
                <>
                  <a
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      createFolder(selectedItems)
                    }}
                  >
                    <FolderPlus size={"1rem"} className="context-menu-icon" />
                  </a>
                </>
              ) /* We display the add folder icon only if the mouse is hovering the directory tree and if the accordion is not collapsed*/
            }
          </Stack>
        </Accordion.Header>
        <Accordion.Body className="sidebar-acc-body" onEnter={() => setIsAccordionShowing(true)} onExit={() => setIsAccordionShowing(false)}>
          <div className="directory-tree" onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)}>
            <ControlledTreeEnvironment
              ref={environment}
              items={dirTree}
              renderItem={(json) =>
                renderItem(json, {
                  show,
                  MENU_ID,
                  displayMenu,
                  isHovering,
                  onDBClickItem
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
              onExpandItem={(item) => setExpandedItems([...expandedItems, item.index])}
              onCollapseItem={(item) => setExpandedItems(expandedItems.filter((expandedItemIndex) => expandedItemIndex !== item.index))}
              onSelectItems={(items) => setSelectedItems(items)}
              canReorderItems={true}
              canDropOnFolder={true}
              canRename={true}
              canDragAndDrop={true}
              onRenameItem={handleNameChange}
              onDrop={onDrop}
              isHovering={isHovering}
            >
              <Tree treeId="tree-2" rootItem="UUID_ROOT" treeLabel="Tree Example" ref={tree} />
            </ControlledTreeEnvironment>
          </div>
        </Accordion.Body>
      </Accordion.Item>

      <Menu id={"MENU_DATA"}>
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
        <Item id="revealInFileExplorer" onClick={() => require("electron").shell.showItemInFolder(globalData[selectedItems[0]].path)}>
          {/* <BoxArrowUpRight size={"1rem"} className="context-menu-icon" /> */}
          Reveal in File Explorer
        </Item>
        <Item id="rename" onClick={handleContextMenuAction}>
          <Eraser size={"1rem"} className="context-menu-icon" />
          Rename
        </Item>
        <Item id="delete" onClick={handleContextMenuAction}>
          <Trash size={"1rem"} className="context-menu-icon" />
          Delete
        </Item>
      </Menu>

      <Menu id={"MENU_MEDML"}>
        <Submenu
          className="context-submenu"
          label={
            <>
              <BoxArrowUpRight size={"1rem"} className="context-menu-icon" />
              Open in...
            </>
          }
        >
          <Item id="openLearningModule" onClick={handleContextMenuAction}>
            Learning module (default)
          </Item>
        </Submenu>
        <Item id="revealInFileExplorer" onClick={() => require("electron").shell.showItemInFolder(globalData[selectedItems[0]].path)}>
          {/* <BoxArrowUpRight size={"1rem"} className="context-menu-icon" /> */}
          Reveal in File Explorer
        </Item>
        <Item id="rename" onClick={handleContextMenuAction}>
          <Eraser size={"1rem"} className="context-menu-icon" />
          Rename
        </Item>
        <Item id="delete" onClick={handleContextMenuAction}>
          <Trash size={"1rem"} className="context-menu-icon" />
          Delete
        </Item>
      </Menu>

      <Menu id="MENU_FOLDER">
        <Item id="revealInFileExplorer" onClick={() => require("electron").shell.showItemInFolder(globalData[selectedItems[0]].path)}>
          {/* <BoxArrowUpRight size={"1rem"} className="context-menu-icon" /> */}
          Reveal in File Explorer
        </Item>
        <Item id="rename" onClick={handleContextMenuAction}>
          <Eraser size={"1rem"} className="context-menu-icon" />
          Rename
        </Item>
        <Item id="delete" onClick={handleContextMenuAction}>
          <Trash size={"1rem"} className="context-menu-icon" />
          Delete
        </Item>
      </Menu>

      <Menu id="MENU_CODE">
        <Submenu
          className="context-submenu"
          label={
            <>
              <BoxArrowUpRight size={"1rem"} className="context-menu-icon" />
              Open in...
            </>
          }
        >
          <Item>Code editor (default)</Item>
          <Item>Jupyter Notebook</Item>
        </Submenu>
        <Item id="revealInFileExplorer" onClick={() => require("electron").shell.showItemInFolder(globalData[selectedItems[0]].path)}>
          {/* <BoxArrowUpRight size={"1rem"} className="context-menu-icon" /> */}
          Reveal in File Explorer
        </Item>
        <Item id="rename" onClick={handleContextMenuAction}>
          <Eraser size={"1rem"} className="context-menu-icon" />
          Rename
        </Item>
        <Item id="delete" onClick={handleContextMenuAction}>
          <Trash size={"1rem"} className="context-menu-icon" />
          Delete
        </Item>
      </Menu>

      <Menu id="MENU_IMAGE">
        <Submenu
          className="context-submenu"
          label={
            <>
              <BoxArrowUpRight size={"1rem"} className="context-menu-icon" />
              Open in...
            </>
          }
        >
          <Item>Image viewer (default)</Item>
          <Item>ImageJ</Item>
        </Submenu>
        <Item id="revealInFileExplorer" onClick={() => require("electron").shell.showItemInFolder(globalData[selectedItems[0]].path)}>
          {/* <BoxArrowUpRight size={"1rem"} className="context-menu-icon" /> */}
          Reveal in File Explorer
        </Item>
        <Item id="rename" onClick={handleContextMenuAction}>
          <Eraser size={"1rem"} className="context-menu-icon" />
          Rename
        </Item>
        <Item id="delete" onClick={handleContextMenuAction}>
          <Trash size={"1rem"} className="context-menu-icon" />
          Delete
        </Item>
      </Menu>

      <Menu id="MENU_PDF">
        <Submenu
          className="context-submenu"
          label={
            <>
              <BoxArrowUpRight size={"1rem"} className="context-menu-icon" />
              Open in...
            </>
          }
        >
          <Item>PDF viewer (default)</Item>
        </Submenu>
        <Item id="revealInFileExplorer" onClick={() => require("electron").shell.showItemInFolder(globalData[selectedItems[0]].path)}>
          {/* <BoxArrowUpRight size={"1rem"} className="context-menu-icon" /> */}
          Reveal in File Explorer
        </Item>
        <Item id="rename" onClick={handleContextMenuAction}>
          <Eraser size={"1rem"} className="context-menu-icon" />
          Rename
        </Item>
        <Item id="delete" onClick={handleContextMenuAction}>
          <Trash size={"1rem"} className="context-menu-icon" />
          Delete
        </Item>
      </Menu>

      <Menu id="MENU_TEXT">
        <Submenu
          className="context-submenu"
          label={
            <>
              <BoxArrowUpRight size={"1rem"} className="context-menu-icon" />
              Open in...
            </>
          }
        >
          <Item>Text editor (default)</Item>
        </Submenu>
        <Item id="revealInFileExplorer" onClick={() => require("electron").shell.showItemInFolder(globalData[selectedItems[0]].path)}>
          {/* <BoxArrowUpRight size={"1rem"} className="context-menu-icon" /> */}
          Reveal in File Explorer
        </Item>
        <Item id="rename" onClick={handleContextMenuAction}>
          <Eraser size={"1rem"} className="context-menu-icon" />
          Rename
        </Item>
        <Item id="delete" onClick={handleContextMenuAction}>
          <Trash size={"1rem"} className="context-menu-icon" />
          Delete
        </Item>
      </Menu>

      <Menu id="MENU_MODEL">
        <Submenu
          className="context-submenu"
          label={
            <>
              <BoxArrowUpRight size={"1rem"} className="context-menu-icon" />
              Open in...
            </>
          }
        >
          <Item>Model viewer (default)</Item>
          <Item>Evaluation Module</Item>
          <Item>Application Module</Item>
        </Submenu>
        <Item id="revealInFileExplorer" onClick={() => require("electron").shell.showItemInFolder(globalData[selectedItems[0]].path)}>
          {/* <BoxArrowUpRight size={"1rem"} className="context-menu-icon" /> */}
          Reveal in File Explorer
        </Item>
        <Item id="rename" onClick={handleContextMenuAction}>
          <Eraser size={"1rem"} className="context-menu-icon" />
          Rename
        </Item>
        <Item id="delete" onClick={handleContextMenuAction}>
          <Trash size={"1rem"} className="context-menu-icon" />
          Delete
        </Item>
      </Menu>

      <Menu id="MENU_DEFAULT">
        <Item id="revealInFileExplorer" onClick={() => require("electron").shell.showItemInFolder(globalData[selectedItems[0]].path)}>
          {/* <BoxArrowUpRight size={"1rem"} className="context-menu-icon" /> */}
          Reveal in File Explorer
        </Item>
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

export default SidebarDirectoryTreeControlled
