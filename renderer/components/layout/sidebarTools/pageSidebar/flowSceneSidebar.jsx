import React, { useContext, useEffect, useState, useRef } from "react"
import { Button, Stack } from "react-bootstrap"
import { EXPERIMENTS, WorkspaceContext } from "../../../workspace/workspaceContext"
import * as Icon from "react-bootstrap-icons"
import { InputText } from "primereact/inputtext"
import SidebarDirectoryTreeControlled from "../directoryTree/sidebarDirectoryTreeControlled"
import { loadJsonPath } from "../../../../utilities/fileManagementUtils"
import { OverlayPanel } from "primereact/overlaypanel"
import { Accordion } from "react-bootstrap"
import MedDataObject from "../../../workspace/medDataObject"
import { DataContext } from "../../../workspace/dataContext"
import { toast } from "react-toastify"
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
  const { workspace, getBasePath } = useContext(WorkspaceContext) // We get the workspace from the context to retrieve the directory tree of the workspace, thus retrieving the data files
  const [btnCreateSceneState, setBtnCreateSceneState] = useState(false)
  const [sceneName, setSceneName] = useState("") // We initialize the experiment name state to an empty string
  const [experimentList, setExperimentList] = useState([]) // We initialize the experiment list state to an empty array
  const [showErrorMessage, setShowErrorMessage] = useState(false) // We initialize the create experiment error message state to an empty string
  const createSceneRef = useRef(null)
  const [selectedItems, setSelectedItems] = useState([]) // We initialize the selected items state to an empty array
  const [dbSelectedItem, setDbSelectedItem] = useState(null) // We initialize the selected item state to an empty string
  const { globalData } = useContext(DataContext)

  // We use the useEffect hook to update the experiment list state when the workspace changes
  useEffect(() => {
    let experimentList = []
    if (globalData && selectedItems && globalData[selectedItems[0]] && globalData[selectedItems[0]].childrenIDs) {
      globalData[selectedItems[0]].childrenIDs.forEach((childId) => {
        experimentList.push(globalData[childId].name)
      })
    }
    setExperimentList(experimentList)
  }, [workspace, selectedItems, globalData[selectedItems[0]]]) // We log the workspace when it changes

  const checkIsNameValid = (name) => {
    return name != "" && !experimentList.includes(name) && !name.includes(" ")
  }

  /**
   * @param {String} path The path of the folder where the scene will be created
   * @param {String} name The name of the scene
   * @description - This function is used to create an empty scene
   */
  const createEmptyScene = async (path, name) => {
    if (selectedItems.length == 0 || selectedItems[0] == undefined) {
      toast.error("Please select the EXPERIMENT folder to create the scene in")
    } else {
      if (globalData[selectedItems[0]] == undefined) {
        toast.error("The selected folder does not exist")
        return
      } else if (globalData[selectedItems[0]].parentID == undefined) {
        toast.error("The selected folder does not have a parent")
        return
      } else {
        // if the selected folder is the EXPERIMENT folder
        if (globalData[selectedItems[0]].parentID == MedDataObject.checkIfMedDataObjectInContextbyPath(path, globalData).getUUID()) {
          if (globalData[selectedItems[0]].type == "folder") {
            path = globalData[selectedItems[0]].path
          } else {
            path = globalData[globalData[selectedItems[0]].parentID].path
          }
          createSceneContent(path, name, typeInfo[type].extension)
        } else {
          MedDataObject.createEmptyFolderFSsync("experiment", path).then((folderPath) => {
            console.log("folderPath", folderPath)
            createSceneContent(folderPath, name, typeInfo[type].extension)
          })
        }
      }
    }
  }

  /**
   *
   * @param {String} path The path of the folder where the scene will be created
   * @param {String} sceneName The name of the scene
   * @param {String} extension The extension of the scene
   */
  const createSceneContent = (path, sceneName, extension) => {
    const emptyScene = loadJsonPath("./resources/emptyScene.json")
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
          <SidebarDirectoryTreeControlled setExternalSelectedItems={setSelectedItems} setExternalDBClick={setDbSelectedItem} />
        </Accordion>
      </Stack>
    </>
  )
}

export default FlowSceneSidebar
