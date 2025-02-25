import React, { useState, useEffect, useContext } from "react"
import { Message } from "primereact/message"
import { DataTable } from "primereact/datatable"
import { Column } from "primereact/column"
import { Button } from "primereact/button"
import { toast } from "react-toastify"
import { connectToMongoDB } from "../../mongoDB/mongoDBUtils"
import { DataContext } from "../../workspace/dataContext"
import { Card } from "primereact/card"
import { Slider } from "primereact/slider"
import { InputNumber } from "primereact/inputnumber"
import { ObjectId } from "mongodb"
import { requestBackend } from "../../../utilities/requests"
import { ServerConnectionContext } from "../../serverConnection/connectionContext"

const ConvertCategoricalColumnIntoNumericDB = ({ currentCollection }) => {
  const { globalData } = useContext(DataContext)
  const [data, setData] = useState([])
  const [columns, setColumns] = useState([])
  const [categoricalColumns, setCategoricalColumns] = useState([])
  const [loadingData, setLoadingData] = useState(false)
  const [originalData, setOriginalData] = useState([])
  const [modifiedColumns, setModifiedColumns] = useState([])
  const [highlightedColumns, setHighlightedColumns] = useState([])
  const [previousData, setPreviousData] = useState(null)
  const [previousColumns, setPreviousColumns] = useState(null)
  const [categoricalThreshold, setCategoricalThreshold] = useState(20)
  const [categoricalThresholdPercentage, setCategoricalThresholdPercentage] = useState("100%")
  const [allKeys, setAllKeys] = useState([])
  const [cleanedDocuments, setCleanedDocuments] = useState([])
  const { port } = useContext(ServerConnectionContext)

  const fetchData = async () => {
    setLoadingData(true)
    if (!currentCollection) {
      toast.warn("No collection selected.")
      return
    }

    try {
      const db = await connectToMongoDB()
      const collection = db.collection(globalData[currentCollection].id)

      const documents = await collection.find({}).limit(10).toArray()
      // Clean all the data
      const cleanedDocuments = cleanData(documents)

      setData(cleanedDocuments)
      // Stock the original data
      setOriginalData(cleanedDocuments)

      const allKeys = Object.keys(cleanedDocuments[0] || {}).filter((key) => key !== "_id")
      const columnStructure = allKeys.map((key) => ({
        field: key,
        header: key.charAt(0).toUpperCase() + key.slice(1)
      }))

      setColumns(columnStructure)
      setAllKeys(allKeys)
      setCleanedDocuments(cleanedDocuments)
      identifyCategoricalColumns(allKeys, cleanedDocuments)
    } catch (error) {
      console.error("Error fetching data:", error)
      toast.error("An error occurred while fetching data.")
    } finally {
      setLoadingData(false)
    }
  }

  // Convert complex object into strings
  const cleanData = (documents) => {
    return documents.map((doc) => {
      const cleanedDoc = { ...doc }

      Object.keys(cleanedDoc).forEach((key) => {
        if (typeof cleanedDoc[key] === "object" && cleanedDoc[key] !== null) {
          cleanedDoc[key] = JSON.stringify(cleanedDoc[key])
        }
      })

      return cleanedDoc
    })
  }

  const markColumnAsModified = (column) => {
    // Mark the column as modified
    setModifiedColumns((prev) => [...new Set([...prev, column])])
  }

  const isDataModified = () => {
    // Compare both data to dectect any modification
    return JSON.stringify(data) !== JSON.stringify(originalData)
  }

  // Identify categorical columns
  const identifyCategoricalColumns = (allKeys, documents) => {
    const detectedColumns = allKeys.filter((key) => {
      const uniqueValues = [...new Set(documents.map((doc) => doc[key]))]
      console.log("THRESHOLD", categoricalThreshold)
      // Categorical threshold represent the minimum number of different value a column must have to be consider categorical
      return uniqueValues.length <= categoricalThreshold && uniqueValues.some((val) => isNaN(parseFloat(val)))
    })

    setCategoricalColumns(detectedColumns)
  }

  //One-hot Encoding on the selected column
  const oneHotEncodeColumn = (data, column) => {
    const uniqueValues = [...new Set(data.map((row) => row[column]))]

    return data.map((row) => {
      const encodedRow = { ...row }

      //Add the old column name as a prefix like oldColumn__
      uniqueValues.forEach((value) => {
        const newColumnName = `${column}__${value}`
        encodedRow[newColumnName] = row[column] === value ? 1 : 0
      })

      // Delete the original column
      delete encodedRow[column]
      return encodedRow
    })
  }

  // Convert a column into a One-Hot encoding one
  const convertColumnToOneHot = async (column) => {
    try {
      // Copy data before encoding
      setPreviousData([...data])
      // Copy the column before encoding
      setPreviousColumns([...columns])

      const encodedData = oneHotEncodeColumn(data, column)

      const uniqueValues = [...new Set(data.map((row) => row[column]))]
      const newColumns = uniqueValues.map((value) => ({
        field: `${column}__${value}`,
        header: `${column}__${value}`
      }))

      // Update column and data
      setColumns((prevColumns) => [
        // Delete the original column
        ...prevColumns.filter((col) => col.field !== column),
        // Add the new encoded Column
        ...newColumns
      ])

      setData(encodedData)
      setHighlightedColumns(newColumns.map((col) => col.field))

      // Mark the modified column
      markColumnAsModified(column)

      toast.success(`Column "${column}" has been one-hot encoded.`)
    } catch (error) {
      console.error("Error during One-Hot Encoding:", error)
      toast.error("An error occurred while encoding the column.")
    }
  }

  const undoChanges = () => {
    if (previousData && previousColumns) {
      // Restorve previous data
      setData(previousData)
      // Restore previous column
      setColumns(previousColumns)
      // Reset highlighted column to null
      setHighlightedColumns([])
      setModifiedColumns([])
      toast.info("Changes have been undone.")
    } else {
      toast.warn("No changes to undo.")
    }
  }

  // //Save encoded data to MongoDb
  // //OVERWRITE the old data
  // const overwriteEncodedDataToDB = async () => {
  //   try {
  //     const db = await connectToMongoDB()
  //     const collection = db.collection(globalData[currentCollection].id)

  //     console.log("DB", db)
  //     console.log("collection", collection)
  //     console.log("Data", data)

  //     // Overwrite old data to save encoded one
  //     await collection.deleteMany({})
  //     await collection.insertMany(data)
  //     // Reset modified column to null
  //     setModifiedColumns([])
  //     // Reset highlighted column to null
  //     setHighlightedColumns([])
  //     fetchData()

  //     toast.success("Encoded data has been saved to the database!")
  //   } catch (error) {
  //     console.error("Error saving encoded data:", error)
  //     toast.error("An error occurred while saving the data.")
  //   }
  // }

  // const appendEncodedDataToDB = async () => {
  //   try {
  //     const db = await connectToMongoDB()
  //     const collection = db.collection(globalData[currentCollection].id)

  //     // Extract the id of each row and update it
  //     for (const row of data) {
  //       const { _id, ...updatedFields } = row

  //       // Verification :_id must exist and be valid
  //       if (!_id) {
  //         console.error("Skipping row without _id:", row)
  //         continue
  //       }

  //       // if id is not valid, try to convert it in an ObjectId
  //       const mongoId = ObjectId.isValid(_id) ? ObjectId(_id) : _id

  //       // Verification : updatedFields must be an object
  //       if (typeof updatedFields !== "object" || updatedFields === null) {
  //         console.error("Skipping invalid updatedFields:", updatedFields)
  //         continue
  //       }

  //       // Update or add new column
  //       const result = await collection.updateOne(
  //         { _id: mongoId },
  //         // Add of update each column in updateFields
  //         { $set: updatedFields },
  //         { upsert: false }
  //       )

  //       console.log(`Update result for _id ${_id}:`, result)
  //     }

  //     setModifiedColumns([])
  //     setHighlightedColumns([])
  //     fetchData()

  //     toast.success("New columns have been appended to the database!")
  //   } catch (error) {
  //     console.error("Error appending encoded data:", error)
  //     toast.error("An error occurred while appending the data.")
  //   }
  // }

  const overwriteEncodedDataToDB = async () => {
    try {
      if (!globalData || !currentCollection || !data.length) {
        throw new Error("Missing database configuration or data")
      }

      const requestBody = {
        databaseName: "data",
        collectionName: globalData[currentCollection]?.id,
        data
      }

      requestBackend(
        port,
        "/input/overwrite_encoded_data",
        requestBody,
        (response) => {
          console.log("Response from backend:", response)
          if (response?.status === "success") {
            toast.success("Encoded data has been overwritten in the database!")
            // Reset modified column to null
            setModifiedColumns([])
            // Reset highlighted column to null
            setHighlightedColumns([])
            fetchData()
          } else {
            throw new Error("Failed to overwrite data")
          }
        },
        (error) => {
          console.error("Error from backend:", error)
        }
      )
    } catch (error) {
      console.error("Error overwriting encoded data:", error)
      toast.error("An unexpected error occurred.")
    }
  }

  const appendEncodedDataToDB = () => {
    try {
      if (!globalData || !currentCollection || !data.length) {
        throw new Error("Missing database configuration or data")
      }

      const requestBody = {
        databaseName: "data",
        collectionName: globalData[currentCollection]?.id,
        data
      }

      requestBackend(
        port,
        "/input/append_encoded_data",
        requestBody,
        (response) => {
          console.log("Response from backendS:", response)
          if (response?.status === "success") {
            toast.success("Encoded data has been append in the database!")
            // Reset modified column to null
            setModifiedColumns([])
            // Reset highlighted column to null
            setHighlightedColumns([])
            fetchData()
          } else {
            throw new Error("Failed to append data")
          }
        },
        (error) => {
          console.error("Error from backend:", error)
        }
      )
    } catch (error) {
      console.error("Error appending encoded data:", error)
      toast.error("An unexpected error occurred.")
    }
  }

  useEffect(() => {
    fetchData()
  }, [currentCollection])

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: "5px"
      }}
    >
      {loadingData && <Message severity="info" text="Loading..." style={{ marginBottom: "15px" }} />}
      <Message severity="info" text="This tool identifies categorical columns in your dataset and converts them to numeric using One-Hot Encoding." style={{ marginBottom: "15px" }} />
      <Message severity="success" text={`Current Collection: ${globalData[currentCollection]?.name || "None"}`} style={{ marginBottom: "15px" }} />
      <div
        style={{
          display: "flex",
          alignItems: "center",
          width: "100%",
          marginBottom: "20px",
          marginLeft: "10px",
          marginRight: "10px"
        }}
      >
        <Slider
          value={categoricalThreshold}
          onChange={(e) => {
            setCategoricalThreshold(e.value)
            setCategoricalThresholdPercentage(`${e.value}%`)
            identifyCategoricalColumns(allKeys, cleanedDocuments)
          }}
          style={{ width: "70%", marginLeft: "10px", marginRight: "10px" }}
          min={1}
          max={20}
        />
        <InputNumber
          value={categoricalThresholdPercentage.replace("%", "")}
          onValueChange={(e) => {
            setCategoricalThreshold(e.value)
            setCategoricalThresholdPercentage(`${e.value}%`)
            identifyCategoricalColumns(allKeys, cleanedDocuments)
          }}
          mode="decimal"
          min={1}
          max={20}
          useGrouping={false}
          showButtons
          style={{ width: "80px", marginLeft: "10px" }}
        />
      </div>
      {data.length > 0 && (
        <Card style={{ width: "900px" }}>
          <DataTable value={data} paginator rows={5} rowsPerPageOptions={[5, 10, 15]} className="p-datatable-gridlines">
            {columns.map((col) => (
              <Column
                key={col.field}
                field={col.field}
                header={col.header}
                sortable
                style={{
                  // Red if categorical
                  color: categoricalColumns.includes(col.field) ? "red" : "inherit",
                  // Red if highlighted
                  color: highlightedColumns.includes(col.field) ? "red" : "inherit"
                }}
                bodyStyle={{
                  // Red for modified cells
                  color: highlightedColumns.includes(col.field) ? "red" : "inherit",
                  // Red for highlighted cell
                  background: categoricalColumns.includes(col.field) ? "red" : "inherit"
                }}
              />
            ))}
          </DataTable>
        </Card>
      )}
      {categoricalColumns.length > 0 && (
        <div style={{ marginTop: "20px" }}>
          <h4>Categorical Columns</h4>
          <ul
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: "10px"
            }}
          >
            {modifiedColumns.length == 0 && (
              <span>
                {" "}
                {categoricalColumns.map((col, index) => (
                  <li key={index} style={{ marginBottom: "10px" }}>
                    <span style={{ marginRight: "10px" }}>Convert Categorical Column into Numeric :</span>
                    <Button label={col} onClick={() => convertColumnToOneHot(col)} style={{ marginLeft: "10px", marginTop: "5px", display: "inline-block" }} />
                  </li>
                ))}
              </span>
            )}
          </ul>
        </div>
      )}
      {modifiedColumns.length > 0 && <Button label={`Undo Changes:  ${modifiedColumns}`} className="p-button-danger" onClick={undoChanges} style={{ marginTop: "20px", marginRight: "10px" }} />}
      {isDataModified() && <Button label="OVERWRITE Modified Data and Save it into MongoDB" className="p-button-success" onClick={overwriteEncodedDataToDB} style={{ marginTop: "20px" }} />}{" "}
      {isDataModified() && <Button label="Save New Columns and Append to MongoDB" className="p-button-success" onClick={appendEncodedDataToDB} style={{ marginTop: "20px" }} />}{" "}
    </div>
  )
}

export default ConvertCategoricalColumnIntoNumericDB
