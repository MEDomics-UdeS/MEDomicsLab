import React, { useContext, useEffect, useState } from "react"
import { Stack } from "react-bootstrap"
import { WorkspaceContext } from "../../../workspace/workspaceContext"
import SidebarDirectoryTreeControlled from "../directoryTree/sidebarDirectoryTreeControlled"
import { Accordion } from "react-bootstrap"
import MedDataObject from "../../../workspace/medDataObject"
import { DataContext } from "../../../workspace/dataContext"
import { createZipFileSync } from "../../../../utilities/customZipFile"
import Path from "path"
import FileCreationBtn from "../fileCreationBtn"

// Variable used to store some modularity information about the module
const typeInfo = {
  title: "Evaluation",
  extension: "medeval",
  internalFolders: []
}

/**
 * @description - This component is the sidebar tools component that will be used in the sidebar component as the learning page
 * @summary - It contains the dropzone component and the workspace directory tree filtered to only show the models and experiment folder and the model files
 * @returns {JSX.Element} - This component is the sidebar tools component that will be used in the sidebar component as the learning page
 */
const EvaluationSidebar = () => {
  const { workspace } = useContext(WorkspaceContext) // We get the workspace from the context to retrieve the directory tree of the workspace, thus retrieving the data files
  const [experimentList, setExperimentList] = useState([]) // We initialize the experiment list state to an empty array
  const { globalData } = useContext(DataContext)

  // We use the useEffect hook to update the experiment list state when the workspace changes
  useEffect(() => {
    let experimentList = []
    if (globalData) {
      let element = globalData["UUID_ROOT"]
      element.childrenIDs.forEach((childID) => {
        if (globalData[childID].type == "file" && globalData[childID].extension == typeInfo.extension) {
          experimentList.push(globalData[childID].name.replace("." + typeInfo.extension, ""))
        }
      })
    }
    setExperimentList(experimentList)
  }, [workspace, globalData]) // We log the workspace when it changes

  const checkIsNameValid = (name) => {
    return name != "" && !experimentList.includes(name) && !name.includes(" ")
  }

  /**
   * @param {String} name The name of the scene
   * @description - This function is used to create an empty scene
   */
  const createEmptyScene = async (name) => {
    let path = globalData["UUID_ROOT"].path
    await createSceneContent(path, name, typeInfo.extension)
  }

  /**
   *
   * @param {String} path The path of the folder where the scene will be created
   * @param {String} sceneName The name of the scene
   * @param {String} extension The extension of the scene
   */
  const createSceneContent = async (path, sceneName, extension) => {
    const emptyScene = {}
    // create custom zip file
    console.log("zipFilePath", Path.join(path, sceneName + "." + extension))
    await createZipFileSync(Path.join(path, sceneName + "." + extension), async (path) => {
      // do custom actions in the folder while it is unzipped
      await MedDataObject.writeFileSync(emptyScene, path, "metadata", "json")

      typeInfo.internalFolders.forEach(async (folder) => {
        await MedDataObject.createEmptyFolderFSsync(folder, path, false)
      })
    })
  }

  /**
   * @description - This function is used to handle the click on the create scene button
   */
  const handleClick = () => {
    // setSelectedItems([...selectedItems])
    console.log("eval clicked")
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
          {typeInfo.title} Module
        </p>
        <FileCreationBtn label="Create evaluation page" piIcon="pi-plus" createEmptyFile={createEmptyScene} checkIsNameValid={checkIsNameValid} handleClickCreateScene={handleClick} />

        <Accordion defaultActiveKey={["dirTree"]} alwaysOpen>
          <SidebarDirectoryTreeControlled/>
        </Accordion>
      </Stack>
    </>
  )
}

export default EvaluationSidebar
