import React, { useEffect, useState } from "react"
import Path from "path"
import Iframe from "react-iframe"
import { toLocalPath } from "../../utilities/fileManagementUtils"

/**
 *
 * @returns a page that shows the model informations
 */
const HtmlViewer = ({ configPath }) => {
  const [localPath, setLocalPath] = useState(undefined)

  useEffect(() => {
    console.log("html config", configPath)
    console.log(Path.basename(configPath))
    toLocalPath(configPath).then((localPath) => {
      setLocalPath(localPath)
    })
  }, [configPath])

  return <>{localPath && <Iframe url={localPath} width="100%" height="100%" />}</>
}

export default HtmlViewer
