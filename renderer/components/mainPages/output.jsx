import React from "react"
import ModulePage from "./moduleBasics/modulePage"

const OutputPage = ({ pageId = "output", configPath = null }) => {
  return (
    <>
      <ModulePage pageId={pageId} configPath={configPath}>
        <text>Future output will be here</text>
      </ModulePage>
    </>
  )
}

export default OutputPage
