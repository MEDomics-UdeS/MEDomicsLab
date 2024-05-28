import React, { useContext, useEffect } from "react"
import { Tree } from "primereact/tree"
import { MongoDBContext } from "../../../mongoDB/mongoDBContext"

const SidebarDBTree = () => {
  const { DB, DBData } = useContext(MongoDBContext)

  useEffect(() => {
    console.log("USE EFFECT ", DBData)
  }, [DBData])

  return <Tree value={[{ key: DB.name, label: DB.name, icon: "pi pi-database", children: DBData }]}></Tree>
}

export default SidebarDBTree
