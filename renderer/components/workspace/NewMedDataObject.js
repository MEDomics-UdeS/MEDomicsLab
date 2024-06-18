export class MEDDataObject {
  constructor({ id, name, type, parentID, childrenIDs }) {
    this.id = id
    this.name = name
    this.type = type
    this.parentID = parentID
    this.childrenIDs = childrenIDs
  }
}
