import React from "react"
import ModulePage from "./moduleBasics/modulePage"
import EvaluationPageContent from "../evaluation/evaluationPageContent"

const EvaluationPage = ({ pageId = "evaluation-456" }) => {
  return (
    <>
      <ModulePage pageId={pageId} shadow className="EvaluationPage">
      <h2>🧪 Model Evaluation</h2>
        <EvaluationPageContent />
        <div className="gitbook-container">
          <p className="gitbook-link">
          📖 Learn how to use this tool in  
          <span> our </span> 
            <a href="https://medomics-udes.gitbook.io/medomicslab-docs/tutorials/development/evaluation-module" 
              target="_blank" rel="noopener noreferrer" style={{ color: "#0056b3", textDecoration: "none" }} className="gitbook-anchor">
              GitBook documentation
            </a>. 🔗
          </p>
        </div>

      </ModulePage>
    </>
  )
}

export default EvaluationPage
