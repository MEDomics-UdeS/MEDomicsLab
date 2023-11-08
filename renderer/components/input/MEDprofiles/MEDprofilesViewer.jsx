import ModulePage from "../../mainPages/moduleBasics/modulePage"
import React, { use, useContext, useEffect, useState } from "react"
import { requestJson } from "../../../utilities/requests"
import { toast } from "react-toastify"
import { WorkspaceContext } from "../../workspace/workspaceContext"
import MEDcohortFigure from "./MEDcohortFigure"
import { Dropdown } from "primereact/dropdown"
import { Col, Row } from "react-bootstrap"
import { Button } from "primereact/button"

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
  const [classes, setClasses] = useState(new Set()) // list of classes in the MEDclasses folder
  const [selectedClass, setSelectedClass] = useState() // list of selected classes in the dropdown menu
  const [relativeTime, setRelativeTime] = useState(null) // relative time for the selected class [0, 1
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

  useEffect(() => {
    console.log("classes", classes)
  }, [classes])

  const getClassesOptions = () => {
    if (classes.size === 0) return []
    let classesArray = []
    classes.forEach((className) => {
      classesArray.push({ label: className, value: className })
    })
    classesArray.sort((a, b) => (a.label > b.label ? 1 : -1))
    classesArray.unshift({ label: "Select a class", value: null })
    return classesArray
  }

  return (
    <>
      <ModulePage pageId={pageId} configPath={configPath}>
        <h1 className="center">MEDprofiles Viewer</h1>
        <div>MEDclasses folder : {MEDclassesFolder?.path}</div>
        <div>MEDprofiles binary file : {MEDprofilesBinaryFile?.path}</div>
        {jsonFilePath && <MEDcohortFigure jsonFilePath={jsonFilePath} classes={classes} setClasses={setClasses} relativeTime={relativeTime} />}
        <Row className="justify-content-md-center" style={{ display: "flex", flexDirection: "row", alignContent: "center", alignItems: "center", width: "100%" }}>
          <Col md="auto">
            <h6>Select the class for relative time</h6>
          </Col>
          {/* <Col md="auto" style={{ display: "flex", flexDirection: "row" }}>
            <Dropdown value={selectedClass} options={getClassesOptions()} onChange={(e) => setSelectedClass(e.value)} style={{ width: "100%" }} />
            <Button label="Set" onClick={() => setRelativeTime(selectedClass)} />
          </Col> */}
        </Row>
      </ModulePage>
    </>
  )
}

export default MEDprofilesViewer
