import { MEDDataObject } from "../../components/workspace/NewMedDataObject"
import { recursivelyRecenseWorkspaceTree } from "./workspaceUtils"
import { connectToMongoDB, insertMEDDataObjectIfNotExists } from "../../components/mongoDB/mongoDBUtils"

/**
 * @description Used to update the data present in the DB with local files not present in the database
 * @param {Object} workspaceObject
 */
export const updateGlobalData = async (workspaceObject) => {
  let rootChildren = workspaceObject.workingDirectory.children
  let rootParentID = "ROOT"
  let rootName = workspaceObject.workingDirectory.name
  let rootType = "directory"
  let rootPath = workspaceObject.workingDirectory.path
  let rootDataObject = new MEDDataObject({
    id: rootParentID,
    name: rootName,
    type: rootType,
    parentID: null,
    childrenIDs: [],
    inWorkspace: true,
    path: rootPath,
    isLocked: false,
    usedIn: null
  })
  await insertMEDDataObjectIfNotExists(rootDataObject, rootPath)
  await recursivelyRecenseWorkspaceTree(rootChildren, rootParentID)
}

/**
 * @descritption load the MEDDataObjects from the MongoDB database
 * @returns medDataObjectsDict dict containing the MEDDataObjects in the Database
 */
export async function loadMEDDataObjects() {
  let medDataObjectsDict = {}
  try {
    // Get global data
    const db = await connectToMongoDB()
    const collection = db.collection("medDataObjects")
    const medDataObjectsArray = await collection.find().toArray()

    // Format data
    medDataObjectsArray.forEach((data) => {
      const medDataObject = new MEDDataObject(data)
      medDataObjectsDict[medDataObject.id] = medDataObject
    })
  } catch (error) {
    console.error("Failed to load MEDDataObjects: ", error)
  }
  return medDataObjectsDict
}
