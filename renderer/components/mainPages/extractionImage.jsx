import React from "react"
import ModulePage from "./moduleBasics/modulePage"
import ExtractionJPG from "../extractionImage/extractionJPG"

const ExtractionImagePage = ({ pageId, configPath = "" }) => {
  return (
    <>
      <ModulePage pageId={pageId} configPath={configPath} shadow>
        <h1 className="center">Extraction - Images</h1>
        <hr></hr>
        <ExtractionJPG extractionTypeList={["DenseNet"]} serverUrl={"/extraction_image/"} defaultFilename={"image_extracted_features.csv"} />
      </ModulePage>
    </>
  )
}

export default ExtractionImagePage
