//import MedDataObject from "../../components/workspace/medDataObject"
import { MEDDataObject } from "../../components/workspace/NewMedDataObject"
import { recursivelyRecenseWorkspaceTree, createListOfFilesNotFoundInWorkspace } from "./workspaceUtils"

/**
 * Load the global data from a file
 */
export const loadGlobalDataFromFile = (workspaceObject) => {
  return new Promise((resolve, reject) => {
    // eslint-disable-next-line no-undef
    const fsx = require("fs-extra")
    let path = workspaceObject.workingDirectory.path + "/.medomics"
    fsx.readFile(path + "/globalData.json", "utf8", (err, data) => {
      if (err) {
        console.error(err)
        reject(err)
      }
      resolve(parseGlobalData(JSON.parse(data)))
    })
  })
}

/**
 * Parse the global data so that the objects are MedDataObjects
 * @param {Object} globalData - The global data to parse
 * @returns {Object} - The parsed global data
 */
export const parseGlobalData = (globalData) => {
  let parsedGlobalData = {}
  Object.keys(globalData).forEach((key) => {
    let dataObject = globalData[key]
    let parsedDataObject = new MEDDataObject(dataObject)
    parsedGlobalData[key] = parsedDataObject
  })
  return parsedGlobalData
}

export const updateGlobalData = async (globalData, workspaceObject) => {
  // Create a copy of the `globalData` state object.
  let newGlobalData = { ...globalData }
  // Check if the `workingDirectory` property of the `workspaceObject` has been set.
  if (workspaceObject.hasBeenSet === true) {
    // Loop through each child of the `workingDirectory`.
    /* let metadataFileExists = checkIfMetadataFileExists(workspaceObject)
    if (metadataFileExists && Object.keys(globalData).length == 0) {
      // Load the global data from the metadata file
      newGlobalData = await loadGlobalDataFromFile(workspaceObject)
    } */
    let rootChildren = workspaceObject.workingDirectory.children
    let rootParentID = "ROOT"
    let rootName = workspaceObject.workingDirectory.name
    let rootType = "directory"
    let rootDataObject = new MEDDataObject({
      id: rootParentID,
      name: rootName,
      type: rootType,
      parentID: null,
      childrenIDs: []
    })
    newGlobalData[rootParentID] = rootDataObject
    recursivelyRecenseWorkspaceTree(rootChildren, rootParentID, newGlobalData)
  }
  // Clean the globalData from files & folders that are not in the workspace
  //newGlobalData = cleanGlobalDataFromFilesNotFoundInWorkspace(workspaceObject, newGlobalData)

  return newGlobalData
}

/**
 * Cleans the global data from files and folders not found in the workspace
 * @param {Object} workspace - The current workspace
 * @param {Object} dataContext - The current global data
 * @returns {Object} - The new global data
 */
export const cleanGlobalDataFromFilesNotFoundInWorkspace = (workspace, dataContext) => {
  let newGlobalData = { ...dataContext }
  let listOfFilesNotFoundInWorkspace = createListOfFilesNotFoundInWorkspace(workspace, dataContext)
  console.log("listOfFilesNotFoundInWorkspace", listOfFilesNotFoundInWorkspace)
  listOfFilesNotFoundInWorkspace.forEach((file) => {
    if (newGlobalData[file] !== undefined && file !== "UUID_ROOT") delete newGlobalData[file]
  })
  return newGlobalData
}
