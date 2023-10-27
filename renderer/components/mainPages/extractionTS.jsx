import ExtractionTabularData from "../extractionTabular/extractionTabularData"
import React from "react"
import ModulePage from "./moduleBasics/modulePage"

const ExtractionTSPage = ({ pageId, configPath = "" }) => {
  return (
    <>
      <ModulePage pageId={pageId} configPath={configPath}>
        <h1 className="center">Extraction - Time Series</h1>
        <ExtractionTabularData extractionTypeList={["TSfresh"]} serverUrl={"/extraction_ts/"} defaultFilename={"ts_extracted_features.csv"} />
      </ModulePage>
    </>
  )
}

export default ExtractionTSPage
