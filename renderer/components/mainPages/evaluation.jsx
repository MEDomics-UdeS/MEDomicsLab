import React from "react"
import ModulePage from "./moduleBasics/modulePage"
import EvaluationPageContent from "../evaluation/evaluationPageContent"

const EvaluationPage = ({ pageId = "evaluation-456", configPath = null }) => {
  return (
    <>
      <ModulePage pageId={pageId} configPath={configPath} shadow className="EvaluationPage">
        <EvaluationPageContent />
      </ModulePage>
    </>
  )
}

export default EvaluationPage
