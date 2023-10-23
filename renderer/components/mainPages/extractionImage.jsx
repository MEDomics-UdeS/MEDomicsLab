import React from "react"
import ModulePage from "./moduleBasics/modulePage"

const ExtractionImagePage = ({ pageId, configPath = "" }) => {
  return (
    <>
      <ModulePage pageId={pageId} configPath={configPath}>
        <h1 className="center">Extraction - Images</h1>
      </ModulePage>
    </>
  )
}

export default ExtractionImagePage