import React, { useContext, useEffect, useState } from "react"
import { Tree } from "primereact/tree"
import { MongoDBContext } from "../../../mongoDB/mongoDBContext"
import { ipcRenderer } from "electron"
import { toast } from "react-toastify"

const SidebarDBTree = () => {
  const { DB, DBData } = useContext(MongoDBContext)
  const [treeData, setTreeData] = useState([])

  useEffect(() => {
    const handleUploadSuccess = (event, filename) => {
      toast.success("Collection " + filename + " imported successfully")
      ipcRenderer.send("get-collections", DB.name)
    }

    ipcRenderer.on("upload-file-success", handleUploadSuccess)

    if (DBData) {
      setTreeData([{ key: DB.name, label: DB.name, icon: "pi pi-database", children: mapDBDataToNodes(DBData) }])
    }

    // Cleanup function to remove the event listener
    return () => {
      ipcRenderer.removeListener("upload-file-success", handleUploadSuccess)
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
      children: []
    }))
  }

  const handleNodeSelect = (event) => {
    ipcRenderer.send("get-collection-data", DB.name, event)
  }

  return (
    <>
      <input type="file" accept=".csv, .tsv, .json" onChange={handleFileUpload} />
      <Tree value={treeData} className="db-tree" selectionMode="single" onSelectionChange={(e) => handleNodeSelect(e.value)}></Tree>
    </>
  )
}

export default SidebarDBTree
