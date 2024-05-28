import React, { useContext, useEffect } from "react"
import { Tree } from "primereact/tree"
import { MongoDBContext } from "../../../mongoDB/mongoDBContext"
import { ipcRenderer } from "electron"
import { toast } from "react-toastify"

const SidebarDBTree = () => {
  const { DB, DBData } = useContext(MongoDBContext)

  useEffect(() => {
    const handleUploadSuccess = (event, filename) => {
      toast.success("Collection " + filename + " imported successfully")
      ipcRenderer.send("get-collections", DB.name)
    }

    ipcRenderer.on("upload-csv-success", handleUploadSuccess)

    // Cleanup function to remove the event listener
    return () => {
      ipcRenderer.removeListener("upload-csv-success", handleUploadSuccess)
    }
  }, [DB.name])

  const handleFileUpload = (event) => {
    const file = event.target.files[0]
    if (file) {
      ipcRenderer.send("upload-csv", file.path, DB.name) // Send the file path and DB name to the main process
    }
  }

  return (
    <>
      <input type="file" accept=".csv" onChange={handleFileUpload} />
      <Tree value={[{ key: DB.name, label: DB.name, icon: "pi pi-database", children: DBData }]}></Tree>
    </>
  )
}

export default SidebarDBTree
