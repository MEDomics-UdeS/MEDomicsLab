import React, { createContext, useState, useEffect } from "react"
import { loadJsonPath } from "../../../utilities/fileManagementUtils"
import { customZipFile2Object } from "../../../utilities/customZipFile"

// This context is used to store the pageInfos (id and config of the workflow)
const PageInfosContext = createContext()
const ZipFileExtensions = ["medml", "medimg", "medeval", "medmodel"]
/**
 *
 * @param {*} children components that will use the context
 * @description This component is used to provide the pageInfos context to all the components that need it.
 *  It is used to store the pageInfos (id and config of the workflow)
 */
function PageInfosProvider({ children }) {
  const [config, setConfig] = useState(null)
  const [configPath, setConfigPath] = useState("")
  const [pageId, setPageId] = useState("")
  const [configReloadTrigger, setConfigReloadTrigger] = useState(false)

  const reloadConfig = () => {
    console.log("reloadConfig")
    setConfigReloadTrigger(!configReloadTrigger)
  }

  useEffect(() => {
    if (configPath && configPath !== "") {
      const fs = require("fs")
      if (fs.existsSync(configPath)) {
        let config = {}
        let extension = configPath.split(".")[configPath.split(".").length - 1]
        if (ZipFileExtensions.includes(extension)) {
          customZipFile2Object(configPath).then((content) => {
            content.metadata && (content = content.metadata)
            console.log("loaded config path", configPath)
            console.log("loaded config", content)
            setConfig(content)
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
  }, [configPath, configReloadTrigger])

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
        setPageId,
        reloadConfig
      }}
    >
      {children}
    </PageInfosContext.Provider>
  )
}

export { PageInfosContext, PageInfosProvider }
