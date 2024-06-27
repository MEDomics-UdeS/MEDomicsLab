import { MEDDataObject } from "../../components/workspace/NewMedDataObject"
import { randomUUID } from "crypto"
import { insertMEDDataObjectIfNotExists } from "../../components/mongoDB/mongoDBUtils"

// Import fs and path
const fs = require("fs")
const path = require("path")

/**
 * @param {Object} children - The children of the current directory
 * @param {String} parentID - The UUID of the parent directory
 * @param {Object} newGlobalData - The global data object
 * @param {Array} acceptedFileTypes - The accepted file types for the current directory
 * @returns {Object} - The children IDs of the current directory
 * @description This function is used to recursively recense the directory tree and add the files and folders to the global data object
 * It is called when the working directory is set
 */
export async function recursivelyRecenseWorkspaceTree(children, parentID) {
  for (const child of children) {
    const stats = fs.lstatSync(child.path)
    let uuid = child.name == "DATA" || child.name == "EXPERIMENTS" ? child.name : randomUUID()
    let childType = stats.isDirectory() ? "directory" : path.extname(child.path).slice(1)
    let childObject = new MEDDataObject({
      id: uuid,
      name: child.name,
      type: childType,
      parentID: parentID,
      childrenIDs: []
    })
    // Real ID in DataBase if object already exists
    const IDinDB = await insertMEDDataObjectIfNotExists(childObject, child.path)
    if (childType == "directory" && child.name != ".medomics") {
      await recursivelyRecenseWorkspaceTree(child.children, IDinDB)
    }
  }
}
