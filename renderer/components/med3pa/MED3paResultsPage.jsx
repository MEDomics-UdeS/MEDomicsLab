import React, { useState, useEffect } from "react"
import ModulePage from "../mainPages/moduleBasics/modulePage"
import { loadFileFromPathSync } from "../../utilities/fileManagementUtils"
import MDRCurve from "./resultsComponents/mdrCurve"
import TreeWorkflow from "./resultsComponents/treeWorkflow"
import NodeParameters from "./resultsComponents/nodeParams"
import TreeParameters from "./resultsComponents/treeParams"
import DetectronResults from "./resultsComponents/detectronResults"

const MED3paResultsPage = ({ pageId, configPath = "" }) => {
  const [fileData, setFileData] = useState(null)

  useEffect(() => {
    if (configPath) {
      loadFileFromPathSync(configPath)
        .then((data) => {
          setFileData(data)
        })
        .catch((err) => {
          console.error("Error reading results:", err)
        })
    }
  }, [configPath])

  return (
    <ModulePage pageId={pageId} configPath={configPath}>
      <div className="container">
        <div className="row">
          <div className="col-md-7 mb-3">
            <TreeParameters />
          </div>
          <div className="col-md-5 mb-3">
            <NodeParameters />
          </div>
        </div>
        <div className="row">
          <div className="col-md-7 mb-3">
            <TreeWorkflow filePath={fileData?.file_path} />
          </div>
          <div className="col-lg-5 mb-3">
            <MDRCurve />
            <DetectronResults />
          </div>
        </div>
      </div>
    </ModulePage>
  )
}

export default MED3paResultsPage
