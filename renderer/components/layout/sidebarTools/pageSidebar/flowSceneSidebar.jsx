import { randomUUID } from "crypto"
import Path from "path"
import React, { useContext, useEffect, useState } from "react"
import { toast } from "react-toastify"
import { sceneDescription as extractionMEDimageSceneDescription } from "../../../../public/setupVariables/extractionMEDimageNodesParams"
import { sceneDescription as learningMEDimageDefaultSettings } from "../../../../public/setupVariables/learningMEDimageNodesParams"
import { sceneDescription as learningSceneDescription } from "../../../../public/setupVariables/learningNodesParams"
import { loadJsonPath } from "../../../../utilities/fileManagementUtils"
import { insertMEDDataObjectIfNotExists } from "../../../mongoDB/mongoDBUtils"
import { MEDDataObject } from "../../../workspace/NewMedDataObject"
import { DataContext } from "../../../workspace/dataContext"
import { WorkspaceContext } from "../../../workspace/workspaceContext"
import FileCreationBtn from "../fileCreationBtn"

const typeInfo = {
  learning: {
    title: "Learning",
    ...learningSceneDescription
  },
  extractionMEDimage: {
    title: "MEDimage Extraction",
    ...extractionMEDimageSceneDescription
  },
  learningMEDimage: {
    title: "MEDimage Learning",
    ...learningMEDimageDefaultSettings
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
    let localExperimentList = []
    for (const experimentId of globalData["EXPERIMENTS"].childrenIDs) {
      localExperimentList.push(globalData[experimentId].name)
    }
    setExperimentList(localExperimentList)
  }, [workspace, globalData]) // We log the workspace when it changes

  const checkIsNameValid = (name) => {
    return name != "" && !experimentList.includes(name) && !name.includes(" ")
  }

  const checkExistingFolders = () => {
    let extractionExists = false
    let extractionFolder = null
    let learningExists = false
    let learningFolder = null
    let keys = Object.keys(globalData)
    keys.forEach((key) => {
      if (globalData[key].type === "directory" && globalData[key].parentID === "EXPERIMENTS" && globalData[key].name === "EXTRACTION") {
        extractionExists = true
        extractionFolder = globalData[key]
      }
      if (globalData[key].type === "directory" && globalData[key].parentID === "EXPERIMENTS" && globalData[key].name === "LEARNING") {
        learningExists = true
        learningFolder = globalData[key]
      }
    })
    return { extractionExists, learningExists, extractionFolder, learningFolder }
  }

  /**
   * @param {String} path The path of the folder where the scene will be created
   * @param {String} name The name of the scene
   * @description - This function is used to create an empty scene
   */
  const createEmptyScene = async (name) => {
    createSceneContent("EXPERIMENTS", name, typeInfo[type].extension)
  }

  /**
   *
   * @param {String} parentId The id of the folder where the scene will be created
   * @param {String} sceneName The name of the scene
   * @param {String} extension The extension of the scene
   */
  const createSceneContent = async (parentId, sceneName, extension) => {
    // Check if EXTRACTION and LEARNING folders exist
    let { extractionExists, learningExists, extractionFolder, learningFolder } = checkExistingFolders()
    let sceneFolder = null
    if (extension == "medimg.ml"){
      // Create LEARNING folder if it does not exist
      if (!learningExists) {
        learningFolder = new MEDDataObject({
          id: randomUUID(),
          name: "LEARNING",
          type: "directory",
          parentID: "EXPERIMENTS",
          childrenIDs: [],
          inWorkspace: true
        })
        await insertMEDDataObjectIfNotExists(learningFolder)
      }
      // Create scene folder
      sceneFolder = new MEDDataObject({
        id: randomUUID(),
        name: sceneName,
        type: "directory",
        parentID: learningFolder.id,
        childrenIDs: [],
        inWorkspace: true
      })
    } else if (extension == "medimg"){
      // Create EXTRACTION folder if it does not exist
      if (!extractionExists) {
        extractionFolder = new MEDDataObject({
          id: randomUUID(),
          name: "EXTRACTION",
          type: "directory",
          parentID: "EXPERIMENTS",
          childrenIDs: [],
          inWorkspace: true
        })
        await insertMEDDataObjectIfNotExists(extractionFolder)
      }
      // Create scene folder
      sceneFolder = new MEDDataObject({
        id: randomUUID(),
        name: sceneName,
        type: "directory",
        parentID: extractionFolder.id,
        childrenIDs: [],
        inWorkspace: true
      })
    } else {
      // Create scene folder
      sceneFolder = new MEDDataObject({
        id: randomUUID(),
        name: sceneName,
        type: "directory",
        parentID: parentId,
        childrenIDs: [],
        inWorkspace: false
      })
    }
    if (sceneFolder === null){
      console.error("Scene folder is null", sceneFolder, learningFolder, extractionFolder)
      toast.error("Error occurred while creating scene")
      return
    }
    let sceneFolderId = await insertMEDDataObjectIfNotExists(sceneFolder)

    // Create folder models and notebooks in the scene folder
    for (const folder of typeInfo[type].externalFolders) {
      let medObject = new MEDDataObject({
        id: randomUUID(),
        name: folder,
        type: "directory",
        parentID: sceneFolderId,
        childrenIDs: [],
        inWorkspace: false
      })
      await insertMEDDataObjectIfNotExists(medObject)
    }

    // Create custom zip file
    let sceneObject = new MEDDataObject({
      id: randomUUID(),
      name: sceneName + "." + extension,
      type: extension,
      parentID: sceneFolderId,
      childrenIDs: [],
      inWorkspace: false
    })
    let sceneObjectId = await insertMEDDataObjectIfNotExists(sceneObject)
    // Create hidden metadata file
    const emptyScene = [loadJsonPath(isProd ? Path.join(process.resourcesPath, "baseFiles", "emptyScene.json") : "./baseFiles/emptyScene.json")]
    let metadataObject = new MEDDataObject({
      id: randomUUID(),
      name: "metadata.json",
      type: "json",
      parentID: sceneObjectId,
      childrenIDs: [],
      inWorkspace: false
    })
    await insertMEDDataObjectIfNotExists(metadataObject, null, emptyScene)
    // Create hidden metadata file for backend
    let backendMetadataObject = new MEDDataObject({
      id: randomUUID(),
      name: "backend_metadata.json",
      type: "json",
      parentID: sceneObjectId,
      childrenIDs: [],
      inWorkspace: false
    })
    await insertMEDDataObjectIfNotExists(backendMetadataObject, null, emptyScene)
    // Create hidden folders
    for (const folder of typeInfo[type].internalFolders) {
      let medObject = new MEDDataObject({
        id: randomUUID(),
        name: folder,
        type: "directory",
        parentID: sceneObjectId,
        childrenIDs: [],
        inWorkspace: false
      })
      await insertMEDDataObjectIfNotExists(medObject)
    }

    // Load everything in globalData
    MEDDataObject.updateWorkspaceDataObject()
  }

  return (
    <>
      <FileCreationBtn label="Create scene" piIcon="pi-plus" createEmptyFile={createEmptyScene} checkIsNameValid={checkIsNameValid} />
    </>
  )
}

export default FlowSceneSidebar
