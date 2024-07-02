import { ipcRenderer } from "electron"

/**
 * @description class definition of a MEDDataObject
 */
export class MEDDataObject {
  constructor({ id, name, type, parentID, childrenIDs }) {
    this.id = id
    this.name = name
    this.type = type
    this.parentID = parentID
    this.childrenIDs = childrenIDs
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
   * @description Updates the workspace data object.
   */
  static updateWorkspaceDataObject() {
    ipcRenderer.send("messageFromNext", "updateWorkingDirectory")
  }
}
