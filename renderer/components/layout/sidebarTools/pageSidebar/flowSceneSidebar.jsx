import React, { useContext, useEffect, useState } from "react"
import { Stack } from "react-bootstrap"
import { EXPERIMENTS, WorkspaceContext } from "../../../workspace/workspaceContext"
import SidebarDirectoryTreeControlled from "../directoryTree/sidebarDirectoryTreeControlled"
import { loadJsonPath } from "../../../../utilities/fileManagementUtils"
import { Accordion } from "react-bootstrap"
import MedDataObject from "../../../workspace/medDataObject"
import { DataContext, UUID_ROOT } from "../../../workspace/dataContext"
import { createZipFileSync } from "../../../../utilities/customZipFile"
import Path from "path"
import { sceneDescription as learningSceneDescription } from "../../../../public/setupVariables/learningNodesParams"
import { sceneDescription as extractionMEDimageSceneDescription } from "../../../../public/setupVariables/extractionMEDimageNodesParams"
import FileCreationBtn from "../fileCreationBtn"

const typeInfo = {
  learning: {
    title: "Learning",
    ...learningSceneDescription
  },
  extractionMEDimage: {
    title: "Extraction MEDimage",
    ...extractionMEDimageSceneDescription
  }
}

/**
 * @description - This component is the sidebar tools component that will be used in the sidebar component as the learning page
 * @summary - It contains the dropzone component and the workspace directory tree filtered to only show the models and experiment folder and the model files
 * @returns {JSX.Element} - This component is the sidebar tools component that will be used in the sidebar component as the learning page
 */
const FlowSceneSidebar = ({ type }) => {
  const { workspace } = useContext(WorkspaceContext) // We get the workspace from the context to retrieve the directory tree of the workspace, thus retrieving the data files
  const [experimentList, setExperimentList] = useState([]) // We initialize the experiment list state to an empty array
  const { globalData } = useContext(DataContext)
  const isProd = process.env.NODE_ENV === "production"

  // We use the useEffect hook to update the experiment list state when the workspace changes
  useEffect(() => {
    let experimentList = []
    let expFolderUUID = MedDataObject.checkIfMedDataObjectInContextbyName(EXPERIMENTS, globalData, UUID_ROOT)
    if (globalData && expFolderUUID && globalData[expFolderUUID] && globalData[expFolderUUID].childrenIDs) {
      globalData[expFolderUUID].childrenIDs.forEach((childId) => {
        if (globalData[childId] && globalData[childId].name) {
          experimentList.push(globalData[childId].name)
        }
      })
    }
    setExperimentList(experimentList)
  }, [workspace, globalData]) // We log the workspace when it changes

  const checkIsNameValid = (name) => {
    return name != "" && !experimentList.includes(name) && !name.includes(" ")
  }

  /**
   * @param {String} path The path of the folder where the scene will be created
   * @param {String} name The name of the scene
   * @description - This function is used to create an empty scene
   */
  const createEmptyScene = async (name) => {
    let path = Path.join(globalData[UUID_ROOT].path, EXPERIMENTS)
    createSceneContent(path, name, typeInfo[type].extension)
  }

  /**
   *
   * @param {String} path The path of the folder where the scene will be created
   * @param {String} sceneName The name of the scene
   * @param {String} extension The extension of the scene
   */
  const createSceneContent = (path, sceneName, extension) => {
    const emptyScene = loadJsonPath(isProd ? Path.join(process.resourcesPath, "baseFiles", "emptyScene.json") : "./baseFiles/emptyScene.json")
    MedDataObject.createEmptyFolderFSsync(sceneName, path).then(async (sceneFolderPath) => {
      // create folder models in the experiment folder
      typeInfo[type].extrenalFolders.forEach(async (folder) => {
        await MedDataObject.createEmptyFolderFSsync(folder, sceneFolderPath, false)
      })
      // create custom zip file
      console.log("zipFilePath", Path.join(sceneFolderPath, sceneName + "." + extension))
      await createZipFileSync(Path.join(sceneFolderPath, sceneName + "." + extension), async (path) => {
        // do custom actions in the folder while it is unzipped
        await MedDataObject.writeFileSync(emptyScene, path, "metadata", "json")

        typeInfo[type].internalFolders.forEach(async (folder) => {
          await MedDataObject.createEmptyFolderFSsync(folder, path, false)
        })
      })
    })
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
          {typeInfo[type].title} Module
        </p>
        <FileCreationBtn label="Create scene" piIcon="pi-plus" createEmptyFile={createEmptyScene} checkIsNameValid={checkIsNameValid} />

        <Accordion defaultActiveKey={["dirTree"]} alwaysOpen>
          <SidebarDirectoryTreeControlled />
        </Accordion>
      </Stack>
    </>
  )
}

export default FlowSceneSidebar
