import React, { useContext, useEffect, useState } from "react"
import { Button, Stack } from "react-bootstrap"
import { Plus } from "react-bootstrap-icons"
import DropzoneComponent from "../../mainPages/dataComponents/dropzoneComponent"
import { WorkspaceContext } from "../../workspace/workspaceContext"
import { WorkspaceDirectoryTree } from "./workspaceDirectoryTree"
import * as Icon from "react-bootstrap-icons"
import { Dialog } from "primereact/dialog"
import { InputText } from "primereact/inputtext"
import { createFolder } from "../../../utilities/fileManagementUtils"

/**
 * @description - This component is the sidebar tools component that will be used in the sidebar component as the learning page
 * @summary - It contains the dropzone component and the workspace directory tree filtered to only show the models and experiment folder and the model files
 * @returns {JSX.Element} - This component is the sidebar tools component that will be used in the sidebar component as the learning page
 */
const LearningSidebar = () => {
  const { workspace } = useContext(WorkspaceContext) // We get the workspace from the context to retrieve the directory tree of the workspace, thus retrieving the data files
  const [showDialog, setShowDialog] = useState(false)
  const [btnDialogState, setBtnDialogState] = useState(false)
  const [experimentName, setExperimentName] = useState("") // We initialize the experiment name state to an empty string
  const [experimentList, setExperimentList] = useState([]) // We initialize the experiment list state to an empty array
  const [showErrorMessage, setShowErrorMessage] = useState(false) // We initialize the create experiment error message state to an empty string

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
    if (experimentName != "" && !experimentList.includes(experimentName)) {
      setBtnDialogState(true)
      setShowErrorMessage(false)
    } else {
      setBtnDialogState(false)
      setShowErrorMessage(true)
    }
  }, [experimentName]) // We set the button state to true if the experiment name is empty, otherwise we set it to false

  const createExperiment = () => {
    console.log("Create Experiment")
    console.log(`Experiment Name: ${experimentName}`) // We log the experiment name when the create button is clicked
    setShowDialog(false)
    createFolder(workspace.workingDirectory.children[1].path, experimentName)
  }

  const importExperiment = () => {
    console.log("Import Experiment")
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
          onClick={() => setShowDialog(true)}
        >
          Create Experiment
          <Icon.Plus />
        </Button>
        <Button className="btn-sidebar-learning" onClick={importExperiment}>
          Import Experiment
          <Icon.Download />
        </Button>

        <WorkspaceDirectoryTree />
        {/* We render the workspace only if it is set, otherwise it throws an error */}
      </Stack>

      <Dialog
        header="Create Experiment"
        visible={showDialog}
        style={{ width: "50vw" }}
        onHide={() => setShowDialog(false)}
        draggable={false}
        resizable={false}
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setShowDialog(false)}
              style={{ marginRight: "1rem" }}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              disabled={!btnDialogState}
              onClick={createExperiment}
            >
              Create
            </Button>
          </>
        }
      >
        <span className="p-float-label">
          <InputText
            id="expName"
            value={experimentName}
            onChange={(e) => setExperimentName(e.target.value)}
            aria-describedby="name-msg"
            className={showErrorMessage ? "p-invalid" : ""}
          />
          <label htmlFor="expName">Enter experiment name</label>
        </span>
        <small id="name-msg" className="text-red">
          {showErrorMessage ? "Experiment name is empty or already exists" : ""}
        </small>
      </Dialog>
    </>
  )
}

export default LearningSidebar
