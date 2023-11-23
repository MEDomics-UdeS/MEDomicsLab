/* eslint-disable no-undef */
import React, { createContext, useState, useEffect } from "react"
import { loadJsonPath } from "../../../utilities/fileManagementUtils"
import { customZipFile2Object } from "../../../utilities/customZipFile"
import Path from "path"

// This context is used to store the pageInfos (id and config of the workflow)
const PageInfosContext = createContext()
const ZipFileExtensions = ["medml", "medimg", "medeval", "medmodel"]

/**
 * @param {*} children components that will use the context
 * @description This component is used to provide the pageInfos context to all the components that need it.
 *  It is used to store the pageInfos (id and config of the workflow)
 */
function PageInfosProvider({ children }) {
  const [config, setConfig] = useState(null)
  const [configPath, setConfigPath] = useState("")
  const [pageId, setPageId] = useState("")

  // We use the useEffect hook to reload the config when the configPath changes
  useEffect(() => {
    console.log("reloading config", configPath)
    if (configPath && configPath !== "") {
      const fs = require("fs")
      if (fs.existsSync(configPath)) {
        let config = {}
        let extension = Path.extname(configPath).slice(1)
        console.log("extension", extension)
        if (ZipFileExtensions.includes(extension)) {
          customZipFile2Object(configPath)
            .then((content) => {
              console.log("raw read content", content)
              Object.keys(content).includes("metadata") && (content = content.metadata)
              console.log("loaded config path", configPath)
              console.log("loaded config", content)
              setConfig(content)
            })
            .catch((err) => {
              console.log("error while loading config", err)
            })
        } else {
          config = loadJsonPath(configPath)
          console.log("loaded config", config)
          console.log("config", config)
          setConfig(config)
        }
      } else {
        console.log("configPath", configPath)
        console.log("config not found")
      }
    }
  }, [configPath])

  return (
    // in the value attribute we pass the pageInfos and the function to update it.
    // These will be available to all the components that use this context
    <PageInfosContext.Provider
      value={{
        config,
        setConfig,
        configPath,
        setConfigPath,
        pageId,
        setPageId
      }}
    >
      {children}
    </PageInfosContext.Provider>
  )
}

export { PageInfosContext, PageInfosProvider }
