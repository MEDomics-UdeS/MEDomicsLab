import React, { useContext, useEffect, useState, useRef } from "react"
import { Button, Stack } from "react-bootstrap"
import { EXPERIMENTS, RESULTS, WorkspaceContext } from "../../workspace/workspaceContext"
import * as Icon from "react-bootstrap-icons"
import { InputText } from "primereact/inputtext"
import SidebarDirectoryTreeControlled from "./sidebarDirectoryTreeControlled"
import { writeFile, loadJsonPath } from "../../../utilities/fileManagementUtils"
import { OverlayPanel } from "primereact/overlaypanel"
import { Accordion } from "react-bootstrap"
import MedDataObject from "../../workspace/medDataObject"
import { DataContext } from "../../workspace/dataContext"
import { LayoutModelContext } from "../layoutContext"

/**
 * @description - This component is the sidebar tools component that will be used in the sidebar component as the learning page
 * @summary - It contains the dropzone component and the workspace directory tree filtered to only show the models and experiment folder and the model files
 * @returns {JSX.Element} - This component is the sidebar tools component that will be used in the sidebar component as the learning page
 */
const LearningSidebar = () => {
  const { workspace, getBasePath } = useContext(WorkspaceContext) // We get the workspace from the context to retrieve the directory tree of the workspace, thus retrieving the data files
  const [btnCreateSceneState, setBtnCreateSceneState] = useState(false)
  const [sceneName, setSceneName] = useState("") // We initialize the experiment name state to an empty string
  const [experimentList, setExperimentList] = useState([]) // We initialize the experiment list state to an empty array
  const [showErrorMessage, setShowErrorMessage] = useState(false) // We initialize the create experiment error message state to an empty string
  const createSceneRef = useRef(null)
  const [selectedItems, setSelectedItems] = useState([]) // We initialize the selected items state to an empty array
  const [dbSelectedItem, setDbSelectedItem] = useState(null) // We initialize the selected item state to an empty string
  const { globalData } = useContext(DataContext)
  const { dispatchLayout } = useContext(LayoutModelContext)

  useEffect(() => {
    let experimentList = []
    if (globalData && selectedItems && globalData[selectedItems[0]] && globalData[selectedItems[0]].childrenIDs) {
      globalData[selectedItems[0]].childrenIDs.forEach((childId) => {
        experimentList.push(globalData[childId].name)
      })
    }

    setExperimentList(experimentList)
  }, [workspace, selectedItems, globalData[selectedItems[0]]]) // We log the workspace when it changes

  useEffect(() => {
    if (sceneName != "" && !experimentList.includes(sceneName)) {
      setBtnCreateSceneState(true)
      setShowErrorMessage(false)
    } else {
      setBtnCreateSceneState(false)
      setShowErrorMessage(true)
    }
  }, [sceneName, experimentList]) // We set the button state to true if the experiment name is empty, otherwise we set it to false

  const createExperiment = (e) => {
    console.log("Create Scene")
    console.log(`Scene Name: ${sceneName}`) // We log the experiment name when the create button is clicked
    createSceneRef.current.toggle(e)
    createEmptyScene(getBasePath(EXPERIMENTS), sceneName)
  }

  const createEmptyScene = async (path, name) => {
    const emptyScene = loadJsonPath("./resources/emptyScene.medml")
    if (globalData[selectedItems[0]].parentID == MedDataObject.checkIfMedDataObjectInContextbyPath(path, globalData).getUUID()) {
      if (globalData[selectedItems[0]].type == "folder") {
        path = globalData[selectedItems[0]].path
      } else {
        path = globalData[globalData[selectedItems[0]].parentID].path
      }
      MedDataObject.createEmptyFolderFSsync(path.split(MedDataObject.getPathSeparator())[path.split(MedDataObject.getPathSeparator()).length - 1], getBasePath(RESULTS), false)
      // create sccene folder
      MedDataObject.createEmptyFolderFSsync(sceneName, path).then((sceneFolderPath) => {
        writeFile(emptyScene, sceneFolderPath, name, "medml")
        // create folder tmp in the experiment folder
        MedDataObject.createEmptyFolderFSsync("tmp", sceneFolderPath, false)
        // create floder notebooks in the experiment folder
        MedDataObject.createEmptyFolderFSsync("notebooks", sceneFolderPath, false)
      })
    } else {
      MedDataObject.createEmptyFolderFSsync("experiment", path).then((folderPath) => {
        console.log("folderPath", folderPath)
        // write the empty scene in the folder experiment
        // create the folder in results with the same name as the experiment
        MedDataObject.createEmptyFolderFSsync(folderPath.split(MedDataObject.getPathSeparator())[folderPath.split(MedDataObject.getPathSeparator()).length - 1], getBasePath(RESULTS), false)
        // create sccene folder
        MedDataObject.createEmptyFolderFSsync(sceneName, folderPath).then((sceneFolderPath) => {
          writeFile(emptyScene, sceneFolderPath, name, "medml")
          // create folder tmp in the experiment folder
          MedDataObject.createEmptyFolderFSsync("tmp", sceneFolderPath, false)
          // create floder notebooks in the experiment folder
          MedDataObject.createEmptyFolderFSsync("notebooks", sceneFolderPath, false)
        })
      })
    }
  }

  useEffect(() => {
    console.log(dbSelectedItem)
    // if (globalData[dbSelectedItem] !== undefined) {
    if (dbSelectedItem !== null) {
      if (dbSelectedItem.name !== undefined) {
        dispatchLayout({ type: "open LEARNING", payload: dbSelectedItem })
      }
    }
  }, [dbSelectedItem])

  const handleClickCreateScene = (e) => {
    console.log("Create Scene")
    createSceneRef.current.toggle(e)
  }

  return (
    <>
      <Stack direction="vertical" gap={0}>
        <p
          style={{
            color: "#a3a3a3",
            font: "Arial",
            fontSize: "12px",
            padding: "0.75rem 0.25rem 0.75rem 0.75rem",
            margin: "0 0 0 0"
          }}
        >
          Learning Module
        </p>

        <Accordion defaultActiveKey={["dirTree", "0"]} alwaysOpen>
          <Accordion.Item eventKey="0">
            <Accordion.Header>
              <Stack direction="horizontal" style={{ flexGrow: "1" }}>
                <p style={{ marginBottom: "0px", paddingLeft: "1rem" }}>
                  <strong>WORKSPACE</strong>
                </p>
                <div style={{ flexGrow: "10" }} />
              </Stack>
            </Accordion.Header>
            <Accordion.Body style={{ padding: "0.25rem" }}>
              <Stack direction="vertical" gap={0}>
                <Button className="btn-sidebar-learning" onClick={handleClickCreateScene}>
                  Create Scene
                  <Icon.Plus />
                </Button>
              </Stack>
            </Accordion.Body>
          </Accordion.Item>
          <SidebarDirectoryTreeControlled setExternalSelectedItems={setSelectedItems} setExternalDBClick={setDbSelectedItem} />
        </Accordion>
      </Stack>

      <OverlayPanel className="create-scene-overlayPanel" ref={createSceneRef}>
        <Stack direction="vertical" gap={4}>
          <div className="header">
            <Stack direction="vertical" gap={1}>
              <h5>Create Scene</h5>
              <hr className="solid" />
            </Stack>
          </div>
          <div className="body">
            <span className="p-float-label">
              <InputText id="expName" value={sceneName} onChange={(e) => setSceneName(e.target.value)} aria-describedby="name-msg" className={`${showErrorMessage ? "p-invalid" : ""}`} />
              <label htmlFor="expName">Enter scene name</label>
            </span>
            <small id="name-msg" className="text-red">
              {showErrorMessage ? "Scene name is empty or already exists" : ""}
            </small>

            <hr className="solid" />
            <Button variant="secondary" onClick={(e) => createSceneRef.current.toggle(e)} style={{ marginRight: "1rem" }}>
              Cancel
            </Button>
            <Button variant="primary" disabled={!btnCreateSceneState} onClick={createExperiment}>
              Create
            </Button>
          </div>
        </Stack>
      </OverlayPanel>
    </>
  )
}

export default LearningSidebar
