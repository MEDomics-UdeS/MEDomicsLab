import { React, createContext } from "react"

const MongoDBContext = createContext(null)

function MongoDBProvider({ children, DB, setDB, recentDBs, setRecentDBs }) {
  return (
    <>
      <MongoDBContext.Provider value={{ DB, setDB, recentDBs, setRecentDBs }}>{children}</MongoDBContext.Provider>
    </>
  )
}

export { MongoDBContext, MongoDBProvider }
