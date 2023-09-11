import { randomUUID } from 'crypto';



export default class CustomDataObject {
    constructor(originalName, name, type, value, parentID, path, childrenIDs) {
        this.id = randomUUID();
        this.originalName = originalName;
        if (name === undefined) {
            this.name = originalName;
        } else {
            this.name = name;
        }
        this.type = type;
        this.value = value;
        this.path = path;

        this.UUID = randomUUID();
        this.parentID = parentID;
        this.childrenIDs = childrenIDs;

        this.lastModified = Date.now();
        this.created = Date.now();
        this.dataLoaded = false;
        this.data = null;
        this.dataModificationQueue = [];



    }

    static fromJSON(json) {
        let customDataObject = new CustomDataObject(json.originalName, json.name, json.type, json.value, json.parentID, json.path, json.childrenIDs);
        customDataObject.id = json.id;
        customDataObject.lastModified = json.lastModified;
        customDataObject.created = json.created;
        customDataObject.dataLoaded = json.dataLoaded;
        customDataObject.data = json.data;
        return customDataObject;
    }

    static fromJSONList(jsonList) {
        let customDataObjectList = [];
        for (let json of jsonList) {
            customDataObjectList.push(CustomDataObject.fromJSON(json));
        }
        return customDataObjectList;
    }

    static modifyDataObject(dataObject, name, type, value, parentID, path, childrenIDs) {
        dataObject.name = name;
        dataObject.type = type;
        dataObject.value = value;
        dataObject.parentID = parentID;
        dataObject.path = path;
        dataObject.childrenIDs = childrenIDs;
        dataObject.lastModified = Date.now();
    }







