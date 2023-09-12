import { randomUUID } from 'crypto';
import React from 'react';
import { toast } from 'react-toastify';
/**
 * This class represents a custom data object. It is the base class for all custom data objects.
 * @class MedDataObject
 * @property {string} id - The UUID of the custom data object
 * @property {string} originalName - The original name of the custom data object
 * @property {string} name - The name of the custom data object
 * @property {string} type - The type of the custom data object
 * @property {string} extension - The value of the custom data object
 * @property {string} path - The path of the custom data object
 * @property {string} virtualPath - The virtual path of the custom data object
 * @property {string} _UUID - The UUID of the custom data object, used for internal purposes (private)
 * @property {string} parentIDs - The UUID of the parent of the custom data object
 * @property {string} childrenIDs - The UUIDs of the children of the custom data object
 * @property {number} lastModified - The timestamp of the last modification of the custom data object
 * @property {number} created - The timestamp of the creation of the custom data object
 */
export default class MedDataObject {
    /**
     * 
     * @param {String} originalName 
     * @param {String} path 
     * @param {String} name 
     * @param {String} type 
     * @param {String} extension 
     * @param {[String]} parentIDs 
     * @param {[String]} childrenIDs 
     */

    constructor({ originalName = "Unnamed", name = undefined, type = "", parentIDs = [], path = "", childrenIDs = [] } = {}) {
        this.originalName = originalName;
        if (name === undefined) {
            this.name = originalName;
        } else {
            this.name = name;
        }
        this.nameWithoutExtension = splitStringAtTheLastSeparator(this.name, ".")[0];
        this.extension = splitStringAtTheLastSeparator(this.name, ".")[1];
        this.type = type;
        this.path = path;
        this.virtualPath = [];

        this._UUID = randomUUID();
        this.parentIDs = parentIDs;
        this.childrenIDs = childrenIDs;

        this.lastModified = Date(Date.now());
        this.created = Date(Date.now());
        this.dataLoaded = false;
        this.data = null;
        this.dataModificationQueue = [];
        this.size = 0;
        this.metadata = {};
    }



    static checkIfMedDataObjectInContextbyName(dataObjectName, globalDataContext) {
        let dataObjectDictionary = { ...globalDataContext };
        let globalDataContextArrayUUIDs = Object.keys(dataObjectDictionary);

        let dataObjectUUID = "";
        globalDataContextArrayUUIDs.forEach((key) => {
            let dataObject = dataObjectDictionary[key];
            let tempDataObjectName = dataObject.name;
            console.log(tempDataObjectName == dataObjectName)
            if (dataObject.name == dataObjectName) {
                dataObjectUUID = key;
                console.log("Data object found in context by name: " + dataObjectUUID);
            }
        });

        return dataObjectUUID;
    }

    static checkIfMedDataObjectInContextbyUUID(dataObjectUUID, globalDataContext) {
        let dataObjectList = globalDataContext;
        let dataObjectToReturn = null;
        for (let dataObject of dataObjectList) {
            if (dataObject.id === dataObjectUUID) {
                dataObjectToReturn = dataObject;
                break;
            }
        }
        return dataObjectToReturn;
    }

    static checkIfMedDataObjectInContextbyPath(dataObjectPath, globalDataContext) {
        let dataObjectList = globalDataContext;
        let dataObjectToReturn = null;
        for (let dataObject of dataObjectList) {
            if (dataObject.path === dataObjectPath) {
                dataObjectToReturn = dataObject;
                break;
            }
        }
        return dataObjectToReturn;
    }

    static createACopy(dataObject, globalDataContext) {
        let copyCanBeCreated = false;
        let copyIndex = 1;
        if (globalDataContext === undefined) {
            globalDataContext = {};
        }
        let copyName = dataObject.nameWithoutExtension + "_copy" + "." + dataObject.extension;
        while (!copyCanBeCreated) {
            // Check if a data object with the same name already exists in the context
            let dataObjectUUID = MedDataObject.checkIfMedDataObjectInContextbyName(copyName, globalDataContext);
            if (dataObjectUUID !== "") {
                copyIndex++;
                copyName = dataObject.nameWithoutExtension + "_copy_" + copyIndex + "." + dataObject.extension;

            }
            else {
                copyCanBeCreated = true;
            }
        }
        let copy = new MedDataObject(dataObject.originalName, copyName, dataObject.type, dataObject.parentIDs, dataObject.path, dataObject.childrenIDs);
        copy.parentIDs = dataObject.getUUID();
    }

    static updateDataObjectInContext(dataObject, globalDataContext, setGlobalDataContext) {
        let newGlobalData = { ...globalDataContext };
        newGlobalData[dataObject.getUUID()] = dataObject;
        setGlobalDataContext(newGlobalData);
        console.log("Data object updated in context: " + dataObject.getUUID());
        console.log("Global data context updated", newGlobalData);
    }

    static rename(dataObject, newName, globalDataContext) {
        let fs = require("fs");
        let answer = "";
        let newNameFound = this.getNewName({ dataObject: dataObject, newName: newName, globalDataContext: globalDataContext });
        if (newNameFound !== "") {
            if (newNameFound !== newName) {
                toast.warning("Data object renamed to " + newNameFound + " because a data object with the same name already exists in the context");
            }
            else {
                toast.success("Data object renamed to " + newNameFound);
            }
            dataObject.name = newNameFound;

            dataObject.lastModified = Date(Date.now());
            let oldPath = dataObject.path;
            let dataObjectRenamed = dataObject.rename(newName);
            // Write data to file
            let newPath = dataObjectRenamed.path;
            fs.renameSync(oldPath, newPath, () => {
                console.log("File renamed");
            });

        }

        return dataObject;
    }

    static getNewName({ dataObject, newName, globalDataContext } = {}) {
        let answer = "";
        let copyCanBeCreated = false;
        let copyIndex = 1;
        let newNameWithoutExtension = splitStringAtTheLastSeparator(newName, ".")[0];
        if (globalDataContext === undefined) {
            globalDataContext = {};
        }
        console.log("newNameWithoutExtension", newNameWithoutExtension);
        console.log("dataObject", dataObject);
        let copyName = newNameWithoutExtension + "." + dataObject.extension;
        while (!copyCanBeCreated) {
            // Check if a data object with the same name already exists in the context
            let dataObjectUUID = MedDataObject.checkIfMedDataObjectInContextbyName(copyName, globalDataContext);
            if (dataObjectUUID !== "") {
                copyIndex++;
                copyName = newNameWithoutExtension + "_" + copyIndex + "." + dataObject.extension;

            }
            else {
                copyCanBeCreated = true;
            }
        }
        answer = copyName;
        return answer;
    }

    static fromJSON(json) {
        let medDataObject = new MedDataObject(json.originalName, json.name, json.type, json.parentIDs, json.path, json.childrenIDs);
        medDataObject.id = json.id;
        medDataObject.lastModified = json.lastModified;
        medDataObject.created = json.created;
        medDataObject.dataLoaded = json.dataLoaded;
        medDataObject.data = json.data;
        return medDataObject;
    }

    static fromJSONList(jsonList) {
        let medDataObjectList = [];
        for (let json of jsonList) {
            medDataObjectList.push(MedDataObject.fromJSON(json));
        }
        return medDataObjectList;
    }

    static modifyDataObject(dataObject, name, type, parentIDs, path, childrenIDs) {
        dataObject.name = name;
        dataObject.type = type;
        dataObject.parentIDs = parentIDs;
        dataObject.path = path;
        dataObject.childrenIDs = childrenIDs;
        dataObject.lastModified = Date(Date.now());
    }

    static saveDataObject(dataObject) {
        let fs = require("fs");
        // Write data to file
        let path = dataObject.path;


    }

    rename(newName) {
        this.name = newName;
        let newPath = splitStringAtTheLastSeparator(this.path, "\\")[0] + "\\" + newName;
        if (this.type === "folder") {
            this.extension = "";
            this.nameWithoutExtension = newName;
        }
        else {
            this.nameWithoutExtension = splitStringAtTheLastSeparator(this.name, ".")[0];
        }
        this.path = newPath;

        this.lastModified = Date(Date.now());
        return this;
    }

    changeType(type) {
        this.type = type;
        this.lastModified = Date(Date.now());
    }


    changeParentID(parentIDs) {
        this.parentIDs = parentIDs;
        this.lastModified = Date(Date.now());
    }

    changePath(path) {
        this.path = path;
        this.lastModified = Date(Date.now());
    }

    changeChildrenIDs(childrenIDs) {
        this.childrenIDs = childrenIDs;
        this.lastModified = Date(Date.now());
    }

    addChildID(childID) {
        this.childrenIDs.push(childID);
        this.lastModified = Date(Date.now());
    }

    removeChildID(childID) {
        this.childrenIDs = this.childrenIDs.filter(id => id !== childID);
        this.lastModified = Date(Date.now());
    }

    addVirtualPath(path) {
        this.virtualPath.push(path);
        this.lastModified = Date(Date.now());
    }

    removeVirtualPath(path) {
        this.virtualPath = this.virtualPath.filter(p => p !== path);
        this.lastModified = Date(Date.now());
    }

    setVirtualPath(pathArray) {
        this.virtualPath = pathArray;
        this.lastModified = Date(Date.now());
    }

    loadDataFromDisk() {
        let fs = require("fs")
        this.data = fs.readFileSync(this.path);
        this.dataLoaded = true;
        this.lastModified = Date(Date.now());
    }

    unloadData() {
        this.data = null;
        this.dataLoaded = false;
        this.lastModified = Date(Date.now());
    }

    addDataModification(modification) {
        this.dataModificationQueue.push(modification);
        this.lastModified = Date(Date.now());
    }

    removeDataModification(modification) {
        this.dataModificationQueue = this.dataModificationQueue.filter(m => m !== modification);
        this.lastModified = Date(Date.now());
    }

    setDataModificationQueue(modificationQueue) {
        this.dataModificationQueue = modificationQueue;
        this.lastModified = Date(Date.now());
    }

    clearDataModificationQueue() {
        this.dataModificationQueue = [];
        this.lastModified = Date(Date.now());
    }

    applyDataModifications() {
        for (let modification of this.dataModificationQueue) {
            modification.apply(this.data);
        }
        this.lastModified = Date(Date.now());
    }

    getUUID() {
        return this._UUID;
    }

}


class DataModification {
    constructor(type, value) {
        this.type = type;
        this.value = value;
    }

    apply(data) {
        switch (this.type) {
            case "append":
                data.append(this.value);
                break;
            case "prepend":
                data.prepend(this.value);
                break;
            case "insert":
                data.insert(this.value);
                break;
            case "replace":
                data.replace(this.value);
                break;
            case "delete":
                data.delete(this.value);
                break;
            default:
                break;
        }
    }
}


function splitStringAtTheLastSeparator(string, separator) {
    let splitString = string.split(separator);
    let lastElement = splitString.pop();
    let firstElements = splitString.join(separator);
    return [firstElements, lastElement];
}






