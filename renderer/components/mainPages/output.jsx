import React from "react"
import ModulePage from "./moduleBasics/modulePage"

const OutputPage = ({ pageId = "output", configPath = undefined }) => {
  return (
    <>
      <ModulePage pageId={pageId} configPath={configPath}>
        <p>Future output will be here</p>
      </ModulePage>
    </>
  )
}

export default OutputPage
