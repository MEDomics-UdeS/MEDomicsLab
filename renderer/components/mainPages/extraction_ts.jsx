import ExtractionTSCanvas from "../extraction_ts/extractionTSCanvas"
import React from "react"
import ModulePage from "./moduleBasics/modulePage"

const ExtractionTSPage = ({ pageId, configPath = "" }) => {
  return (
    <>
      <ModulePage pageId={pageId} configPath={configPath}>
        <ExtractionTSCanvas />
      </ModulePage>
    </>
  )
}

export default ExtractionTSPage
