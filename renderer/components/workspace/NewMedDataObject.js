import { ipcRenderer } from "electron"
import { deleteMEDDataObject } from "../mongoDB/mongoDBUtils"
import fs from "fs"
import path from "path"

/**
 * @description class definition of a MEDDataObject
 */
export class MEDDataObject {
  constructor({ id, name, type, parentID, childrenIDs, inWorkspace }) {
    this.id = id
    this.name = name
    this.type = type
    this.parentID = parentID
    this.childrenIDs = childrenIDs
    this.inWorkspace = inWorkspace
  }

  /**
   * @description Get the MEDDataObjects matching specified types in dict of MEDDataObjects
   * @param {Dictionary} dict of MEDDataObjects (such as globalData)
   * @param {[String]} types property of MEDDataObjects
   * @returns matchingElement list of MEDDataObjects with type in types
   */
  static getMatchingTypesInDict(dict, types) {
    let matchingElements = []
    for (const [, value] of Object.entries(dict)) {
      if (types.includes(value.type)) {
        matchingElements.push(value)
      }
    }
    return matchingElements
  }

  /**
   * @description Get the default name for a new object in a dict of MEDDataObjects depending on its type
   * @param {Dictionary} dict of MEDDataObjects (such as globalData)
   * @param {String} type property of MEDDataObject
   * @param {String} parentID identifier of the parent MEDDataObject
   * @returns {String} newName the default name for the new MEDDataObject
   */
  static getNewNameForType(dict, type, parentID) {
    let baseName = type === "directory" ? `new_${type}` : `new_${type}.${type}`
    let newName = baseName
    let counter = 1

    // Get the names of children of the specified parent
    let parentObject = Object.values(dict).find((obj) => obj.id === parentID)
    let childrenNames = new Set()

    if (parentObject && parentObject.childrenIDs) {
      parentObject.childrenIDs.forEach((childID) => {
        let child = dict[childID]
        if (child && child.type === type) {
          childrenNames.add(child.name)
        }
      })
    }

    // Check for name uniqueness within the children of the specified parent
    while (childrenNames.has(newName)) {
      if (type === "directory") {
        newName = `${baseName}_${counter}`
      } else {
        newName = `new_${type}_${counter}.${type}`
      }
      counter++
    }

    return newName
  }

  /**
   * @description Recursively get the full path of the object in the workspace
   * @param {Dictionary} dict - dictionary of all MEDDataObjects
   * @param {String} id - the id of the object to find the path for
   * @param {String} workspacePath - the root path of the workspace
   * @returns {String} fullPath - the full path of the object
   */
  static getFullPath(dict, id, workspacePath) {
    let object = dict[id]
    let pathParts = [object.name]
    while (object.parentID) {
      object = dict[object.parentID]
      // Avoid to have 2 times the workspace name in the returned path
      if (object.id != "ROOT") {
        pathParts.unshift(object.name)
      }
    }
    return path.join(workspacePath, ...pathParts)
  }

  /**
   * @description Delete a MEDDataObject and its children from the dictionary and the local workspace
   * @param {Dictionary} dict - dictionary of all MEDDataObjects
   * @param {String} id - the id of the object to delete
   * @param {String} workspacePath - the root path of the workspace
   * @returns {Promise<void>}
   */
  static async deleteObjectAndChildren(dict, id, workspacePath) {
    // Get the object to delete
    const objectToDelete = dict[id]

    if (!objectToDelete) {
      console.log(`Object with id ${id} not found`)
      return
    }

    // Delete the file/directory from the local filesystem if it exists and is in workspace
    if (objectToDelete.inWorkspace) {
      // Get the full path of the object in the workspace
      const fullPath = this.getFullPath(dict, id, workspacePath)
      fs.rmSync(fullPath, { recursive: true, force: true })
      console.log(`Deleted ${fullPath} from workspace`)
    }

    // Delete the object and its children recursively
    await deleteMEDDataObject(id)
    this.updateWorkspaceDataObject()
  }

  /**
   * @description Updates the workspace data object.
   */
  static updateWorkspaceDataObject() {
    ipcRenderer.send("messageFromNext", "updateWorkingDirectory")
  }
}
