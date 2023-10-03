import React from "react"
import ModulePage from "./moduleBasics/modulePage"

const ApplicationPage = ({ pageId = "application-456", configPath = null }) => {
  return (
    <>
      <ModulePage pageId={pageId} configPath={configPath}>
        <h1>Application Page - TO BE IMPLEMENTED</h1>
      </ModulePage>
    </>
  )
}

export default ApplicationPage
