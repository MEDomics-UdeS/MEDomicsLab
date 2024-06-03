import React, { useContext, useEffect, useState } from "react";
import { Tree } from "primereact/tree";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { MongoDBContext } from "../../../mongoDB/mongoDBContext";
import { ipcRenderer } from "electron";
import { toast } from "react-toastify";
import { LayoutModelContext } from "../../layoutContext";

const SidebarDBTree = () => {
  const { DB, DBData, collectionData } = useContext(MongoDBContext);
  const [treeData, setTreeData] = useState([]);
  const { dispatchLayout, developerMode } = useContext(LayoutModelContext)

  useEffect(() => {
    const handleUploadSuccess = (event, filename) => {
      toast.success("Collection " + filename + " imported successfully");
      ipcRenderer.send("get-collections", DB.name);
    };

    ipcRenderer.on("upload-file-success", handleUploadSuccess);

    if (DBData) {
      setTreeData([
        { key: DB.name, label: DB.name, icon: "pi pi-database", children: mapDBDataToNodes(DBData) }
      ]);
    }

    // Cleanup function to remove the event listener
    return () => {
      ipcRenderer.removeListener("upload-file-success", handleUploadSuccess);
    };
  }, [DBData, DB]);

  useEffect(() => {
    console.log('collectionData changed inner child', collectionData)
  }, [collectionData]);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      ipcRenderer.send("upload-file", file.path, DB.name); // Send the file path and DB name to the main process
    }
  };

  const mapDBDataToNodes = (data) => {
    return data.map((item) => ({
      key: item.key,
      label: item.label,
      icon: "pi pi-folder",
      children: []
    }));
  };

  const handleNodeSelect = (event) => {
    dispatchLayout({ type: "openInDataTableFromDBViewer", payload: {name: event, UUID: event, path: DB.name, uuid: event, extension: DB.name}})
  };

  return (
      <>
        <input type="file" accept=".csv, .tsv, .json" onChange={handleFileUpload} />
        <Tree
            value={treeData}
            className="db-tree"
            selectionMode="single"
            onSelectionChange={(e) => {
              console.log('selected node', e.value)
              handleNodeSelect(e.value)
            }}
        />
      </>
  );
};

export default SidebarDBTree;
