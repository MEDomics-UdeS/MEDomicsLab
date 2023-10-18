import ExtractionTabularData from "../extractionTabular/extractionTabularData"
import React from "react"
import ModulePage from "./moduleBasics/modulePage"
const ExtractionTextPage = ({ pageId, configPath = "" }) => {
  return (
    <>
      <ModulePage pageId={pageId} configPath={configPath}>
        <h1 className="center">Extraction - Text Notes</h1>
        <ExtractionTabularData extractionTypeList={["BioBERT"]} serverUrl={"/extraction_text/"} defaultFilename={"text_extracted_features.csv"} />
      </ModulePage>
    </>
  )
}

export default ExtractionTextPage
