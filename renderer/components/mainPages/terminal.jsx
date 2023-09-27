import React from "react"
import ModulePage from "./moduleBasics/modulePage"

const TerminalPage = ({ pageId = "terminal", configPath = null }) => {
  return (
    <>
      <ModulePage pageId={pageId} configPath={configPath}>
        <text>Future terminal will be here</text>
      </ModulePage>
    </>
  )
}

export default TerminalPage
