import ExtractionTabularData from "../extractionTabular/extractionTabularData"
import React from "react"
import ModulePage from "./moduleBasics/modulePage"

const ExtractionTextPage = ({ pageId = "extraction-text-456", configPath = null }) => {
  return (
    <>
      <ModulePage pageId={pageId} configPath={configPath}>
        <h1 className="center">Extraction - Text Notes</h1>
        <ExtractionTabularData extractionTypeList={["BioBERT"]} serverUrl={"/extraction_text/"} />
      </ModulePage>
    </>
  )
}

export default ExtractionTextPage
