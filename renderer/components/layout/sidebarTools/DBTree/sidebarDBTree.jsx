import React, { useContext, useEffect, useState } from "react"
import { Tree } from "primereact/tree"
import { MongoDBContext } from "../../../mongoDB/mongoDBContext"
import { ipcRenderer } from "electron"
import { toast } from "react-toastify"
import { Button } from "primereact/button"

const SidebarDBTree = () => {
  const { DB, DBData } = useContext(MongoDBContext)
  const [treeData, setTreeData] = useState([])

  useEffect(() => {
    const handleUploadSuccess = (event, filename) => {
      toast.success("Collection " + filename + " imported successfully")
      ipcRenderer.send("get-collections", DB.name)
    }

    const handleSecondUploadSuccess = (event, filename) => {
      toast.success("Collection " + filename + " imported in chunks")
      ipcRenderer.send("get-collections", DB.name)
    }

    ipcRenderer.on("upload-file-success", handleUploadSuccess)
    ipcRenderer.on("second-upload-file-success", handleSecondUploadSuccess)

    if (DBData) {
      setTreeData([{ key: DB.name, label: renderNodeLabel(DB.name), icon: "pi pi-database", children: mapDBDataToNodes(DBData), className: "db-node-main" }])
    }

    // Cleanup function to remove the event listener
    return () => {
      ipcRenderer.removeListener("upload-file-success", handleUploadSuccess)
      ipcRenderer.removeListener("second-upload-file-success", handleSecondUploadSuccess)
    }
  }, [DBData, DB])

  const handleFileUpload = (event) => {
    const file = event.target.files[0]
    if (file) {
      ipcRenderer.send("upload-file", file.path, DB.name) // Send the file path and DB name to the main process
    }
  }

  const mapDBDataToNodes = (data) => {
    return data.map((item) => ({
      key: item.key,
      label: item.label,
      icon: "pi pi-folder",
      children: [],
      className: "db-node-child"
    }))
  }

  const handleNodeSelect = (event) => {
    ipcRenderer.send("get-collection-data", DB.name, event)
  }

  const renderNodeLabel = (label) => {
    return (
      <div className="node-label">
        {label}
        <Button icon="pi pi-upload" className="p-button-text p-button-secondary p-button-sm" onClick={() => document.getElementById("file-input").click()} />
        <input type="file" id="file-input" style={{ display: "none" }} accept=".csv, .tsv, .json, .jpg, .jpeg, .png, .gif, .bmp, .dcm" onChange={handleFileUpload} />
      </div>
    )
  }

  return (
    <>
      <Tree value={treeData} className="db-tree" selectionMode="single" onSelectionChange={(e) => handleNodeSelect(e.value)}></Tree>
    </>
  )
}

export default SidebarDBTree
