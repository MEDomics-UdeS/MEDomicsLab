import React from "react"
import ModulePage from "./moduleBasics/modulePage"

const EvaluationPage = ({ pageId = "evaluation-456", configPath = null }) => {
  return (
    <>
      <ModulePage pageId={pageId} configPath={configPath} shadow>
        <h1>Evaluation Page - TO BE IMPLEMENTED</h1>
      </ModulePage>
    </>
  )
}

export default EvaluationPage
