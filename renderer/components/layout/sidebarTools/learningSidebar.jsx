import React, { useContext, useEffect, useState, useRef } from "react"
import { Button, Stack } from "react-bootstrap"
import { WorkspaceContext } from "../../workspace/workspaceContext"
import { WorkspaceDirectoryTree } from "./workspaceDirectoryTree"
import * as Icon from "react-bootstrap-icons"
import { InputText } from "primereact/inputtext"
import { writeJson, loadJsonPath } from "../../../utilities/fileManagementUtils"
import { OverlayPanel } from "primereact/overlaypanel"

/**
 * @description - This component is the sidebar tools component that will be used in the sidebar component as the learning page
 * @summary - It contains the dropzone component and the workspace directory tree filtered to only show the models and experiment folder and the model files
 * @returns {JSX.Element} - This component is the sidebar tools component that will be used in the sidebar component as the learning page
 */
const LearningSidebar = () => {
  const { workspace } = useContext(WorkspaceContext) // We get the workspace from the context to retrieve the directory tree of the workspace, thus retrieving the data files
  const [btnCreateSceneState, setBtnCreateSceneState] = useState(false)
  const [sceneName, setSceneName] = useState("") // We initialize the experiment name state to an empty string
  const [experimentList, setExperimentList] = useState([]) // We initialize the experiment list state to an empty array
  const [showErrorMessage, setShowErrorMessage] = useState(false) // We initialize the create experiment error message state to an empty string
  const createSceneRef = useRef(null)


  useEffect(() => {
    console.log(workspace)
    let experimentList = []
    if (workspace) {
      workspace.workingDirectory.children[1].children.forEach((child) => {
        console.log(child.name)
        experimentList.push(child.name)
      })
    }
    setExperimentList(experimentList)
  }, [workspace]) // We log the workspace when it changes

  useEffect(() => {
    if (sceneName != "" && !experimentList.includes(sceneName)) {
      setBtnCreateSceneState(true)
      setShowErrorMessage(false)
    } else {
      setBtnCreateSceneState(false)
      setShowErrorMessage(true)
    }
  }, [sceneName]) // We set the button state to true if the experiment name is empty, otherwise we set it to false

  const createExperiment = (e) => {
    console.log("Create Scene")
    console.log(`Scene Name: ${sceneName}`) // We log the experiment name when the create button is clicked
    createSceneRef.current.toggle(e)
    createEmptyScene(workspace.workingDirectory.children[1].path, sceneName)
  }

  const createEmptyScene = (path, name) => {
    const emptyScene = loadJsonPath("./resources/emptyScene.json")
    writeJson(emptyScene, path, name)
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
        <Button
          className="btn-sidebar-learning"
          onClick={(e) => createSceneRef.current.toggle(e)}
        >
          Create Scene
          <Icon.Plus />
        </Button>
        <WorkspaceDirectoryTree />
        {/* We render the workspace only if it is set, otherwise it throws an error */}
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
          <InputText
            id="expName"
            value={sceneName}
            onChange={(e) => setSceneName(e.target.value)}
            aria-describedby="name-msg"
            className={`${showErrorMessage ? "p-invalid" : ""}`}
            />
          <label htmlFor="expName">Enter scene name</label>
        </span>
        <small id="name-msg" className="text-red">
          {showErrorMessage ? "Scene name is empty or already exists" : ""}
        </small>
         
          <hr className="solid" />
          <Button
              variant="secondary"
              onClick={(e) => createSceneRef.current.toggle(e)}
              style={{ marginRight: "1rem" }}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              disabled={!btnCreateSceneState}
              onClick={createExperiment}
            >
              Create
            </Button>
         </div>
        </Stack>
      </OverlayPanel>

    </>
  )
}

export default LearningSidebar
