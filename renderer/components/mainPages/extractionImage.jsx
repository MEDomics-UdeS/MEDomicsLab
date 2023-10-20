import React from "react"
import ModulePage from "./moduleBasics/modulePage"
import ExtractionJPG from "../extractionImage/extractionJPG"

const ExtractionImagePage = ({ pageId, configPath = "" }) => {
  return (
    <>
      <ModulePage pageId={pageId} configPath={configPath}>
        <h1 className="center">Extraction - Images</h1>
        <hr></hr>
        <ExtractionJPG/>
      </ModulePage>
    </>
  )
}

export default ExtractionImagePage