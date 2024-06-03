import React, { useContext, useEffect, useState } from "react"
import { Tree } from "primereact/tree"
import { DataTable } from "primereact/datatable"
import { Column } from "primereact/column"
import { MongoDBContext } from "../../../mongoDB/mongoDBContext"
import { ipcRenderer } from "electron"
import { toast } from "react-toastify"
import { LayoutModelContext } from "../../layoutContext"
import { Button } from "primereact/button"

const SidebarDBTree = () => {
  const { DB, DBData, collectionData } = useContext(MongoDBContext)
  const [treeData, setTreeData] = useState([])
  const { dispatchLayout, developerMode } = useContext(LayoutModelContext)

  useEffect(() => {
    const handleFileUploadSuccess = (event, filename) => {
      toast.success("Collection " + filename + " imported successfully")
      ipcRenderer.send("get-collections", DB.name)
    }

    const handleFileUploadError = (event, filename) => {
      toast.error("Failed to import " + filename)
    }

    const handleSecondUploadSuccess = (event, filename) => {
      toast.warn("Collection " + filename + " imported in chunks")
      ipcRenderer.send("get-collections", DB.name)
    }

    const handleFolderUploadSuccess = (event, collectionName) => {
      toast.success("Collection " + collectionName + " imported successfully")
      ipcRenderer.send("get-collections", DB.name)
    }

    const handleFolderUploadError = (event, collectionName) => {
      toast.error("Failed to import " + collectionName)
    }

    const handleDeleteSuccess = (event, collectionName) => {
      toast.success("Collection " + collectionName + " deleted successfully")
      ipcRenderer.send("get-collections", DB.name)
    }

    const handleDeleteError = (event, collectionName) => {
      toast.error("Failed to delete " + collectionName)
    }

    ipcRenderer.on("upload-file-success", handleFileUploadSuccess)
    ipcRenderer.on("upload-file-error", handleFileUploadError)
    ipcRenderer.on("second-upload-file-success", handleSecondUploadSuccess)
    ipcRenderer.on("upload-folder-success", handleFolderUploadSuccess)
    ipcRenderer.on("upload-folder-error", handleFolderUploadError)
    ipcRenderer.on("delete-collection-success", handleDeleteSuccess)
    ipcRenderer.on("delete-collection-error", handleDeleteError)

    if (DBData) {
      setTreeData([{ key: DB.name, label: renderNodeLabel(DB.name), icon: "pi pi-database", children: mapDBDataToNodes(DBData), className: "db-node-main" }])
    }

    // Cleanup function to remove the event listener
    return () => {
      ipcRenderer.removeListener("upload-file-success", handleFileUploadSuccess)
      ipcRenderer.removeListener("upload-file-error", handleFileUploadError)
      ipcRenderer.removeListener("second-upload-file-success", handleSecondUploadSuccess)
      ipcRenderer.removeListener("upload-folder-success", handleFolderUploadSuccess)
      ipcRenderer.removeListener("upload-folder-error", handleFolderUploadError)
      ipcRenderer.removeListener("delete-collection-success", handleDeleteSuccess)
      ipcRenderer.removeListener("delete-collection-error", handleDeleteError)
    }
  }, [DBData, DB])

  useEffect(() => {
    console.log("collectionData changed inner child", collectionData)
  }, [collectionData])

  const handleFileUpload = () => {
    ipcRenderer.send("upload-files", DB.name)
  }

  const handleFolderUpload = () => {
    ipcRenderer.send("select-folder", DB.name) // Send a request to select a folder to the main process
  }

  const handleDeleteCollection = (collectionName) => {
    ipcRenderer.send("delete-collection", DB.name, collectionName)
  }

  const mapDBDataToNodes = (data) => {
    return data.map((item) => ({
      key: item.key,
      label: renderChildNodeLabel(item.label),
      icon: "pi pi-folder",
      children: [],
      className: "db-node-child"
    }))
  }

  const handleNodeSelect = (event) => {
    dispatchLayout({ type: "openInDataTableFromDBViewer", payload: { name: event, UUID: event, path: DB.name, uuid: event, extension: DB.name } })
  }

  const renderNodeLabel = (label) => {
    return (
      <div className="node-label">
        {label}
        <Button icon="pi pi-file-plus" className="p-button-text p-button-secondary p-button-sm" onClick={handleFileUpload} />
        <Button icon="pi pi-folder-plus" className="p-button-text p-button-secondary p-button-sm" onClick={handleFolderUpload} />
      </div>
    )
  }

  const renderChildNodeLabel = (label) => {
    return (
      <div className="node-label">
        {label}
        <Button icon="pi pi-trash" className="p-button-text p-button-danger p-button-sm" onClick={() => handleDeleteCollection(label)} />
      </div>
    )
  }

  return (
    <>
      <Tree
        value={treeData}
        className="db-tree"
        selectionMode="single"
        onSelectionChange={(e) => {
          console.log("selected node", e.value)
          handleNodeSelect(e.value)
        }}
      />
    </>
  )
}

export default SidebarDBTree
