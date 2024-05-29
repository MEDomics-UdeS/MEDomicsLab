import React, { useContext, useEffect, useState } from "react";
import { Tree } from "primereact/tree";
import { MongoDBContext } from "../../../mongoDB/mongoDBContext";
import {ipcRenderer} from "electron";

const SidebarDBTree = () => {
  const { DB, DBData } = useContext(MongoDBContext);
  const [treeData, setTreeData] = useState([]);
  const [selectedKey, setSelectedKey] = useState('');
  const [DBObject, setDBObject] = useState({
    name: "",
    hasBeenSet: false,
    workingDirectory: ""
  })

  useEffect(() => {
    if (DBData) {
      setTreeData([{ key: DB.name, label: DB.name, icon: 'pi pi-database', children: mapDBDataToNodes(DBData) }]);
    }
  }, [DBData, DB]);



  const mapDBDataToNodes = (data) => {
    return data.map(item => ({
      key: item.key,
      label: item.label,
      icon: 'pi pi-folder',
      children: []
    }));
  };

  const handleNodeSelect = (event) => {
    console.log("Event:", event);
    ipcRenderer.send('get-collection-data', DB.name, event);
  };


  return <Tree value={treeData}
               selectionMode="single"
               selectionKeys={selectedKey}
               onSelectionChange={(e) => handleNodeSelect(e.value)}
               className="w-full md:w-30rem"></Tree>;
};

export default SidebarDBTree;
