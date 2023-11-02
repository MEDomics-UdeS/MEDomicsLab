import ModulePage from "../../mainPages/moduleBasics/modulePage"
import React, { useContext, useEffect, useState } from "react"
import { requestJson } from "../../../utilities/requests"
import { toast } from "react-toastify"
import { WorkspaceContext } from "../../workspace/workspaceContext"
import MEDcohortFigure from "./MEDcohortFigure"


const MEDprofilesViewer= ({ pageId, configPath = "", MEDclassesFolder, MEDprofilesBinaryFile }) => {
  const [jsonFilePath, setJsonFilePath] = useState(null)
  const { port } = useContext(WorkspaceContext) // we get the port for server connexion

  const loadCohort = () => {
    requestJson(
      port,
      "/MEDprofiles/load_pickle_cohort",
      {
        MEDclassesFolder: MEDclassesFolder.path,
        MEDprofilesBinaryFile: MEDprofilesBinaryFile.path
      },
      (jsonResponse) => {
        console.log("received results:", jsonResponse)
        if (!jsonResponse.error) {
          setJsonFilePath(jsonResponse.jsonFilePath)
        } else {
          toast.error(`Instantiation failed: ${jsonResponse.error.message}`)
        }
      },
      function (err) {
        console.error(err)
        toast.error(`Instantiation failed: ${err}`)
      }
    )
  }

  // Called when the page open, in order to load data
  useEffect(() => {
    if (MEDclassesFolder && MEDprofilesBinaryFile) {
      loadCohort()
    }
  }, [])
  
    return (
      <>
      <ModulePage pageId={pageId} configPath={configPath}>
        <h1 className="center">MEDprofiles Viewer</h1>
        <div>MEDclasses folder : {MEDclassesFolder?.path}</div>
        <div>MEDprofiles binary file : {MEDprofilesBinaryFile?.path}</div>
        {jsonFilePath && <MEDcohortFigure jsonFilePath={jsonFilePath}/>}
      </ModulePage> 
      </>
    )
  }
  
  export default MEDprofilesViewer