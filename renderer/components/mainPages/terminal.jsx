import React from "react"
import ModulePage from "./moduleBasics/modulePage"

const TerminalPage = ({ pageId = "terminal", configPath }) => {
  return (
    <>
      <ModulePage pageId={pageId} configPath={configPath}>
        <p>Future terminal will be here</p>
      </ModulePage>
    </>
  )
}

export default TerminalPage
