import ExtractionTabularData from "../extractionTabular/extractionTabularData"
import React from "react"
import ModulePage from "./moduleBasics/modulePage"

const ExtractionTextPage = ({ pageId }) => {
  return (
    <>
      <ModulePage pageId={pageId} shadow>
        <h1 className="center">Extraction - Text Notes</h1>
        <div style={{ textAlign: "center", marginBottom: "20px", maxWidth: "800px", margin: "0 auto" }}>
          <p>
            The text extraction page takes a CSV file containing text notes as input 
            and extracts embeddings using a selected model.
          </p>
          <p className="gitbook-link">
          📖 Learn more about this process in <span> our </span> 
            <a href="https://medomics-udes.gitbook.io/medomicslab-docs/tutorials/design/extraction-modules/text-extraction-page" 
              target="_blank" rel="noopener noreferrer" style={{ color: "#0056b3", textDecoration: "none" }} className="gitbook-anchor">
              GitBook documentation
            </a>. 🔗
          </p>
        </div>
        <ExtractionTabularData extractionTypeList={["BioBERT"]} serverUrl={"/extraction_text/"} defaultFilename={"text_extracted_features"} />
      </ModulePage>
    </>
  )
}

export default ExtractionTextPage
