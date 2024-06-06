const MongoClient = require("mongodb").MongoClient
const mongoUrl = "mongodb://127.0.0.1:27017"

/**
 * @description Get data from collectionName in dbname
 * @param {String} dbname
 * @param {String} collectionName
 * @returns fetchedData
 */
export const getCollectionData = async (dbname, collectionName) => {
  const client = new MongoClient(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true })
  try {
    await client.connect()
    const db = client.db(dbname)
    const collection = db.collection(collectionName)
    const fetchedData = await collection.find({}).toArray()
    return fetchedData
  } catch (error) {
    console.error("Error fetching data:", error)
    throw error
  } finally {
    await client.close()
  }
}

/**
 * @description Get the types of each column in a collection
 * @param {String} dbname
 * @param {String} collectionName
 * @returns columnTypes
 */
export const getCollectionColumnTypes = async (dbname, collectionName) => {
  const client = new MongoClient(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true })
  try {
    await client.connect()
    const db = client.db(dbname)
    const collection = db.collection(collectionName)

    // Sample a number of documents to determine column types
    const sampleSize = 100
    const sampleDocs = await collection.aggregate([{ $sample: { size: sampleSize } }]).toArray()

    // Determine column types
    const columnTypes = {}

    sampleDocs.forEach((doc) => {
      Object.keys(doc).forEach((key) => {
        let type

        const value = doc[key]
        if (typeof value === "string") {
          // Check if the string is a date
          const date = new Date(value)
          if (!isNaN(date.getTime())) {
            type = "date"
          } else {
            type = "string"
          }
        } else if (typeof value === "number") {
          // Check if the number is an integer or float
          type = Number.isInteger(value) ? "integer" : "float"
        } else {
          // Fallback to typeof for other types
          type = typeof value
        }

        if (!columnTypes[key]) {
          columnTypes[key] = new Set()
        }

        columnTypes[key].add(type)
      })
    })

    // Convert sets to arrays
    Object.keys(columnTypes).forEach((key) => {
      columnTypes[key] = Array.from(columnTypes[key])
    })

    return columnTypes
  } catch (error) {
    console.error("Error determining column types:", error)
    throw error
  } finally {
    await client.close()
  }
}
