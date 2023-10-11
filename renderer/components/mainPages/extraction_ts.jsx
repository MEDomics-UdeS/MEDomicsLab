import ExtractionTabularData from "../extraction_ts/extractionTabularData"
import React from "react"
import ModulePage from "./moduleBasics/modulePage"

const ExtractionTSPage = ({ pageId, configPath = "" }) => {
  return (
    <>
      <ModulePage pageId={pageId} configPath={configPath}>
        <ExtractionTabularData extractionTypeList={["TSfresh"]} />
      </ModulePage>
    </>
  )
}

export default ExtractionTSPage
