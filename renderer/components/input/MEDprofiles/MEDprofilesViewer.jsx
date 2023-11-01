import ModulePage from "../../mainPages/moduleBasics/modulePage"
import React from "react"


const MEDprofilesViewer= ({ pageId, configPath = "" }) => {
  
    return (
      <>
      <ModulePage pageId={pageId} configPath={configPath}>
        <h1 className="center">MEDprofiles Viewer</h1>
      </ModulePage> 
      </>
    )
  }
  
  export default MEDprofilesViewer