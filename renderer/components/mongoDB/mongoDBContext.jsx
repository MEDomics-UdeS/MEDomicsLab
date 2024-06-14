import { React, createContext } from "react"

const MongoDBContext = createContext(null)

function MongoDBProvider({ children, DB, setDB, DBData, setDBData, collectionData, setCollectionData }) {
  return (
    <>
      <MongoDBContext.Provider value={{ DB, setDB, DBData, setDBData, collectionData, setCollectionData }}>{children}</MongoDBContext.Provider>
    </>
  )
}

export { MongoDBContext, MongoDBProvider }
