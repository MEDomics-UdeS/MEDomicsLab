import ModulePage from "../../mainPages/moduleBasics/modulePage"
import React, { useContext, useEffect, useState } from "react"
import { requestBackend } from "../../../utilities/requests"
import { toast } from "react-toastify"
import { WorkspaceContext } from "../../workspace/workspaceContext"
import MEDcohortFigure from "./MEDcohortFigure"
import { ProgressSpinner } from "primereact/progressspinner"

/**
 *
 * @param {String} pageId Page identifier
 * @param {String} configPath Path of the config file
 * @param {MedDataObject} MEDclassesFolder Folder containing the generated MEDclasses
 * @param {MedDataObject} MEDprofilesBinaryFile Binary file containing the instantiated MEDprofiles
 *
 * @returns {JSX.Element} a page
 *
 * @description
 * This page is part of the MEDprofiles' module (submodule of the input module) and all the necessary
 * elements to display and interact with the figure(s) displayed.
 *
 */
const MEDprofilesViewer = ({ pageId, configPath = "", MEDclassesFolder, MEDprofilesBinaryFile }) => {
  const [jsonFilePath, setJsonFilePath] = useState(null)
  const { port } = useContext(WorkspaceContext) // we get the port for server connexion
  const [jsonDataIsLoaded, setJsonDataIsLoaded] = useState(false)

  /**
   * @description
   * This function is called while the page elements are loaded in order
   * to load the MEDprofiles' data (ie. MEDcohort) as JSON data
   */
  const loadCohort = () => {
    requestBackend(
      port,
      "/MEDprofiles/load_pickle_cohort/" + pageId,
      {
        MEDclassesFolder: MEDclassesFolder.path,
        MEDprofilesBinaryFile: MEDprofilesBinaryFile.path,
        pageId: pageId
      },
      (jsonResponse) => {
        console.log("received results:", jsonResponse)
        if (!jsonResponse.error) {
          setJsonFilePath(jsonResponse.jsonFilePath)
        } else {
          toast.error(`Reading failed: ${jsonResponse.error.message}`)
        }
      },
      function (err) {
        console.error(err)
        toast.error(`Reading failed: ${err}`)
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
        {!jsonDataIsLoaded && (
          <div className="centered-container">
            <ProgressSpinner />
          </div>
        )}
        {jsonFilePath && <MEDcohortFigure jsonFilePath={jsonFilePath} setJsonDataIsLoaded={setJsonDataIsLoaded} />}
      </ModulePage>
    </>
  )
}

export default MEDprofilesViewer
