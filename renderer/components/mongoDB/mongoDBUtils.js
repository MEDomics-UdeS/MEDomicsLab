const { MongoClient } = require("mongodb")
const fs = require("fs")
const Papa = require("papaparse")

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
 * @param {MEDDataObject} medData MEDDataObject to insert in the database
 * @param {String} path path of the data we want to import in the database
 * @param {Json} jsonData the data to insert in MongoDB
 * @returns id the id of the MEDDataObject in the DB
 */
export async function insertMEDDataObjectIfNotExists(medData, path = null, jsonData = null) {
  const db = await connectToMongoDB()
  const collection = db.collection("medDataObjects")

  // Check if MEDDataObject exists in the DB
  const existingObjectByID = await collection.findOne({ id: medData.id })
  if (existingObjectByID) {
    // If object already in the DB we stop here
    return existingObjectByID.id
  }

  const existingObjectByAttributes = await collection.findOne({ name: medData.name, type: medData.type, parentID: medData.parentID })
  if (existingObjectByAttributes) {
    // If object already in the DB we stop here
    return existingObjectByAttributes.id
  }

  // Insert MEDdataObject if not exists
  const result = await collection.insertOne(medData)
  console.log(`MEDDataObject inserted with _id: ${result.insertedId}`)

  // Add the id of the inserted object to the childrenIDs of its parent
  if (medData.parentID) {
    const parent = await collection.findOne({ id: medData.parentID })
    if (parent) {
      let children = parent.childrenIDs || []

      // Fetch the actual child objects to sort them
      const childrenObjects = await collection.find({ id: { $in: children } }).toArray()
      childrenObjects.push(medData)

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
      await collection.updateOne({ id: medData.parentID }, { $set: { childrenIDs: children } })
    }
  }

  // Insert MEDdataObject data (if contains data)
  if (jsonData) {
    const dataCollection = db.collection(medData.id)
    const result = await dataCollection.insertMany(jsonData)
    console.log(`Data inserted with ${result.insertedCount} documents`)
  } else if (path) {
    switch (medData.type) {
      case "csv":
        await insertCSVIntoCollection(path, medData.id)
        break
      default:
        break
    }
  }
  return medData.id
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
    Papa.parse(fs.createReadStream(filePath), {
      header: true,
      dynamicTyping: true, // Automatically convert numeric fields to numbers
      complete: async (results) => {
        try {
          const result = await collection.insertMany(results.data)
          console.log(`CSV data inserted with ${result.insertedCount} documents`)
          resolve(result)
        } catch (error) {
          reject(error)
        }
      },
      error: (error) => {
        reject(error)
      }
    })
  })
}

/**
 * @description overwrite a MEDDataObject data in the DataBase
 * @param {String} id id of the MEDDataObject data to overwrite
 * @param {Json} jsonData the new data for the MEDDataObject
 */
export async function overwriteMEDDataObject(id, jsonData) {
  const db = await connectToMongoDB()
  const collection = db.collection(id)
  await collection.deleteMany({})
  await collection.insertMany(jsonData)
}
