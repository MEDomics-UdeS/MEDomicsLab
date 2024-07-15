import { ipcRenderer } from "electron"
import { deleteMEDDataObject, insertMEDDataObjectIfNotExists, updateMEDDataObjectName, downloadCollectionToFile, overwriteMEDDataObjectProperties } from "../mongoDB/mongoDBUtils"
import { randomUUID } from "crypto"
import { toast } from "react-toastify"
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
   * @description Get a unique name for a copied MEDDataObject in a target directory
   * @param {Dictionary} dict - dictionary of all MEDDataObjects
   * @param {String} baseName - the base name of the object to copy
   * @param {String} parentID - the ID of the target directory
   * @returns {String} uniqueName - the unique name for the copied MEDDataObject
   */
  static getUniqueNameForCopy(dict, baseName, parentID) {
    let newName = baseName
    let counter = 1

    const parentObject = dict[parentID]
    const existingNames = new Set()

    if (parentObject && parentObject.childrenIDs) {
      parentObject.childrenIDs.forEach((childID) => {
        const child = dict[childID]
        if (child) {
          existingNames.add(child.name)
        }
      })
    }

    const baseNameParts = baseName.split(".")
    const isDirectory = baseNameParts.length === 1
    const nameWithoutExtension = isDirectory ? baseName : baseNameParts.slice(0, -1).join(".")
    const extension = isDirectory ? "" : `.${baseNameParts[baseNameParts.length - 1]}`

    while (existingNames.has(newName)) {
      if (isDirectory) {
        newName = `${baseName}_${counter}`
      } else {
        newName = `${nameWithoutExtension}_${counter}${extension}`
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
   * @description Delete a MEDDataObject and its children from the local workspace
   * @param {Dictionary} dict - dictionary of all MEDDataObjects
   * @param {String} id - the id of the object to delete
   * @param {String} workspacePath - the root path of the workspace
   * @param {Boolean} notify - Wether to display a toast message while success
   * @returns {Promise<void>}
   */
  static async deleteObjectAndChildrenFromWorkspace(dict, id, workspacePath, notify = true) {
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
      const success = await overwriteMEDDataObjectProperties(id, { inWorkspace: false })
      if (success) {
        this.updateWorkspaceDataObject()
        if (notify) {
          toast.success(`Removed ${dict[id].name} from workspace`)
        }
      }
    }
  }

  /**
   * @description Recursively copies a MEDDataObject and its children to a new parent directory
   * @param {Object} dict - dictionary of all MEDDataObjects
   * @param {Object} copiedObject - the MEDDataObject to copy
   * @param {Object} placeToCopy - the target MEDDataObject where the copied object will be placed
   * @returns {Promise<void>}
   */
  static async copyMedDataObject(dict, copiedObject, placeToCopy) {
    if (placeToCopy.type !== "directory") {
      throw new Error("Target object must be a directory")
    }

    const newId = randomUUID()
    const uniqueName = this.getUniqueNameForCopy(dict, copiedObject.name, placeToCopy.id)
    const newObject = new MEDDataObject({
      id: newId,
      name: uniqueName,
      type: copiedObject.type,
      parentID: placeToCopy.id,
      childrenIDs: [],
      inWorkspace: false
    })

    await insertMEDDataObjectIfNotExists(newObject, null, null, copiedObject.id)

    // Update the dictionary
    dict[newId] = newObject
    placeToCopy.childrenIDs.push(newId)

    // Recursively copy children
    for (const childId of copiedObject.childrenIDs) {
      const childObject = dict[childId]
      if (childObject) {
        await this.copyMedDataObject(dict, childObject, newObject)
      }
    }

    // Save the updated dictionary
    this.updateWorkspaceDataObject()
  }

  /**
   * @description Rename a MEDDataObject ensuring the new name is unique in the parent directory
   * @param {Dictionary} dict - dictionary of all MEDDataObjects
   * @param {String} id - the id of the MEDDataObject to rename
   * @param {String} newName - the new name for the MEDDataObject
   * @param {String} workspacePath - the root path of the workspace
   * @returns {void}
   */
  static async rename(dict, id, newName, workspacePath) {
    const object = dict[id]

    if (!object) {
      throw new Error(`Object with id ${id} not found`)
    }

    const uniqueName = this.getUniqueNameForCopy(dict, newName, object.parentID)

    // Update the dictionary with the new name
    const succeed = await updateMEDDataObjectName(id, newName)

    if (!succeed) {
      console.log("Failed to rename MEDDataObject")
      return
    }

    // Update the local filesystem if the object is in workspace
    if (object.inWorkspace) {
      const oldPath = this.getFullPath(dict, id, workspacePath)
      object.name = uniqueName
      const newPath = this.getFullPath(dict, id, workspacePath)
      fs.renameSync(oldPath, newPath)
      console.log(`Renamed ${oldPath} to ${newPath}`)
    }

    // Notify the system to update the workspace
    this.updateWorkspaceDataObject()
  }

  /**
   * @description Load the MEDdataObject (and its parents) content from the DB into the Workspace
   * @param {Dictionary} dict - dictionary of all MEDDataObjects
   * @param {String} id - the id of the MEDDataObject to sync
   * @param {String} workspacePath - the root path of the workspace
   * @param {Boolean} notify - Wether to display a toast message while success
   */
  static async sync(dict, id, workspacePath, notify = true) {
    const medDataObject = dict[id]

    if (!medDataObject) {
      console.log(`MEDDataObject with id ${id} not found`)
      return
    }

    // Recursively sync parent objects
    if (medDataObject.parentID && medDataObject.parentID !== "ROOT") {
      await this.sync(dict, medDataObject.parentID, workspacePath, notify)
    }

    // Define the file path where the content will be downloaded
    const filePath = this.getFullPath(dict, id, workspacePath)

    // Ensure the directory exists
    const directoryPath = path.dirname(filePath)
    if (!fs.existsSync(directoryPath)) {
      fs.mkdirSync(directoryPath, { recursive: true })
    }

    // Download the content based on the type
    try {
      if (medDataObject.type != "directory") {
        await downloadCollectionToFile(id, filePath, medDataObject.type)
      }

      // Update inWorkspace property to true after successful download
      if (!medDataObject.inWorkspace) {
        const updateData = { inWorkspace: true }
        const updateSuccess = await overwriteMEDDataObjectProperties(id, updateData)

        if (updateSuccess) {
          medDataObject.inWorkspace = true // Update local dictionary as well
          if (notify) {
            toast.success(`Sync ${medDataObject.name} successfully`)
          }
        } else {
          console.error(`Failed to update inWorkspace property for MEDDataObject with id ${id}`)
        }
      }
    } catch (error) {
      console.error(`Failed to download collection ${id}: ${error.message}`)
    }
  }

  /**
   * @description Updates the workspace data object.
   */
  static updateWorkspaceDataObject() {
    ipcRenderer.send("messageFromNext", "updateWorkingDirectory")
  }
}
