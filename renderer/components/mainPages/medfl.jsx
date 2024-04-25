import React from "react"
import ModulePage from "./moduleBasics/modulePage"
import MEDflHelloWorldPanel from "../medfl/medflHelloWorldPanel"

const MEDflPage = ({ pageId, configPath = "" }) => {
  return (
    <>
      <ModulePage pageId={pageId} configPath={configPath} shadow={true}>
        <h1 className="center">MEDfl Module</h1>
        <MEDflHelloWorldPanel />
      </ModulePage>
    </>
  )
}

export default MEDflPage
