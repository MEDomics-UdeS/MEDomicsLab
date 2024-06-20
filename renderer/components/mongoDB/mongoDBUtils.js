const { MongoClient } = require("mongodb")
const fs = require("fs")
const csv = require("csv-parser")

const uri = "mongodb://localhost:27017" // Remplacez par votre URI MongoDB
const dbName = "data" // Remplacez par le nom de votre base de données

let client

/**
 * @description Establish a connection to MongoDB data database
 * @returns Connection to the data database
 */
export async function connectToMongoDB() {
  if (!client) {
    client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true })
    await client.connect()
  }
  return client.db(dbName)
}

/**
 * @description Insert a MEDDataObject in the database if not exists
 * @param {MEDDataObject} data data to insert in the database
 * @param {String} path path of the data we want to import in the database
 * @returns
 */
export async function insertMEDDataObjectIfNotExists(data, path) {
  const db = await connectToMongoDB()
  const collection = db.collection("medDataObjects")

  // Check if MEDDataObject exists in the DB
  const existingObjectByID = await collection.findOne({ id: data.id })
  const existingObjectByAttributes = await collection.findOne({ name: data.name, type: data.type, parentID: data.parentID })
  // If object already in the DB we stop here
  if (existingObjectByID || existingObjectByAttributes) {
    return
  }

  // Insert MEDdataObject if not exists
  const result = await collection.insertOne(data)
  console.log(`MEDDataObject inserted with _id: ${result.insertedId}`)

  // Add the id of the inserted object to the childrenIDs of its parent
  if (data.parentID) {
    const parent = await collection.findOne({ id: data.parentID })
    if (parent) {
      let children = parent.childrenIDs || []

      // Fetch the actual child objects to sort them
      const childrenObjects = await collection.find({ id: { $in: children } }).toArray()
      childrenObjects.push(data)

      // Sort the children objects first by type (directories first) and then alphabetically by name
      childrenObjects.sort((a, b) => {
        if (a.type === b.type) {
          return a.name.localeCompare(b.name)
        }
        return a.type === "directory" ? -1 : 1
      })

      // Extract the sorted ids
      children = childrenObjects.map((child) => child.id)

      // Update the parent with the sorted children ids
      await collection.updateOne({ id: data.parentID }, { $set: { childrenIDs: children } })
    }
  }

  // Insert MEDdataObject data
  switch (data.type) {
    case "csv":
      await insertCSVIntoCollection(path, data.id)
      break
    default:
      break
  }
}

/**
 * @description Insert a CSV file in the database based on the associated MEDDataObject id
 * @param {String} filePath path of the file to import in the database
 * @param {String} collectionName name of the collection in which we want to import the data
 * (which corresponds to the MEDDataObject id)
 * @returns
 */
async function insertCSVIntoCollection(filePath, collectionName) {
  const db = await connectToMongoDB()
  const collection = db.collection(collectionName)
  return new Promise((resolve, reject) => {
    const data = []
    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (row) => {
        data.push(row)
      })
      .on("end", async () => {
        try {
          const result = await collection.insertMany(data)
          console.log(`CSV data inserted with ${result.insertedCount} documents`)
          resolve(result)
        } catch (error) {
          reject(error)
        }
      })
      .on("error", (error) => {
        reject(error)
      })
  })
}
