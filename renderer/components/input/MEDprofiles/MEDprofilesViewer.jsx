import ModulePage from "../../mainPages/moduleBasics/modulePage"
import React, { useContext, useEffect, useState } from "react"
import { requestJson } from "../../../utilities/requests"
import { toast } from "react-toastify"
import { WorkspaceContext } from "../../workspace/workspaceContext"
import MEDcohortFigure from "./MEDcohortFigure"
import { Col, Row } from "react-bootstrap"

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
  /**
   * @description
   * This function is called while the page elements are loaded in order
   * to load the MEDprofiles' data (ie. MEDcohort) as JSON data
   */
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
        <div>MEDclasses folder : {MEDclassesFolder?.path}</div>
        <div>MEDprofiles binary file : {MEDprofilesBinaryFile?.path}</div>
        {jsonFilePath && <MEDcohortFigure jsonFilePath={jsonFilePath} />}
        <Row className="justify-content-md-center" style={{ display: "flex", flexDirection: "row", alignContent: "center", alignItems: "center", width: "100%" }}>
          <Col md="auto">
            <h6>Select the class for relative time</h6>
          </Col>
        </Row>
      </ModulePage>
    </>
  )
}

export default MEDprofilesViewer
