import React, { useEffect, useState } from "react"
import ModulePage from "./moduleBasics/modulePage"
import { PageInfosContext } from "./moduleBasics/pageInfosContext"
import Path from "path"
import Iframe from "react-iframe"
import fs from "fs"

/**
 *
 * @returns a page that shows the model informations
 */
const HtmlViewer = ({ configPath }) => {
  const [localPath, setLocalPath] = useState(undefined)

  useEffect(() => {
    return () => {
      console.log("html viewer unmounted")
      fs.unlinkSync("./renderer/public/tmp/" + Path.basename(configPath))
    }
  }, [])

  useEffect(() => {
    console.log("html config", configPath)
    console.log(Path.basename(configPath))
    fs.copyFileSync(configPath, "./renderer/public/tmp/" + Path.basename(configPath))
    setLocalPath(Path.join("./tmp/" + Path.basename(configPath)))
  }, [configPath])

  return <>{localPath && <Iframe url={localPath} width="100%" height="100%" />}</>
}

export default HtmlViewer
