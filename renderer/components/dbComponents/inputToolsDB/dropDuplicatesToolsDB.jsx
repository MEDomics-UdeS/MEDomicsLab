import React, { useState, useEffect, useContext } from "react"
import { Message } from "primereact/message"
import { DataTable } from "primereact/datatable"
import { Column } from "primereact/column"
import { Button } from "primereact/button"
import { toast } from "react-toastify"
import { connectToMongoDB } from "../../mongoDB/mongoDBUtils"
import { DataContext } from "../../workspace/dataContext"
import { Card } from "primereact/card"

const DropDuplicatesToolsDB = ({ currentCollection }) => {
  const { globalData } = useContext(DataContext)
  const [data, setData] = useState([])
  const [columns, setColumns] = useState([])
  const [duplicateColumns, setDuplicateColumns] = useState([])
  const [selectedColumn, setSelectedColumn] = useState(null)
  const [loadingData, setLoadingData] = useState(false)

  const fetchData = async () => {
    setLoadingData(true)
    if (!currentCollection) {
      toast.warn("No collection selected.")
      return
    }

    try {
      const db = await connectToMongoDB()
      const collection = db.collection(currentCollection)

      const documents = await collection.find({}).limit(10).toArray()
      setData(documents)

      const sampleDocument = documents[0]
      if (sampleDocument) {
        const allKeys = Object.keys(sampleDocument).filter((key) => key !== "_id")
        const columnStructure = allKeys.map((key) => ({
          field: key,
          header: key.charAt(0).toUpperCase() + key.slice(1)
        }))
        setColumns(columnStructure)

        findDuplicateColumns(allKeys, collection)
      }
    } catch (error) {
      console.error("Error fetching data:", error)
      toast.error("An error occurred while fetching data.")
    } finally {
      setLoadingData(false)
    }
  }

  const findDuplicateColumns = async (allKeys, collection) => {
    let duplicatePairs = []
    const documentCount = await collection.countDocuments()

    if (documentCount <= 1) {
      setDuplicateColumns(duplicatePairs)
      return
    }

    try {
      for (let i = 0; i < allKeys.length; i++) {
        for (let j = i + 1; j < allKeys.length; j++) {
          const column1 = allKeys[i]
          const column2 = allKeys[j]

          const pipeline = [{ $project: { areEqual: { $eq: [`$${column1}`, `$${column2}`] } } }, { $match: { areEqual: false } }, { $count: "mismatchedDocuments" }]

          const result = await collection.aggregate(pipeline).toArray()
          if (result.length === 0 || (result[0]?.mismatchedDocuments || 0) === 0) {
            duplicatePairs.push({ column1, column2 })
          }
        }
      }

      setDuplicateColumns(duplicatePairs)
    } catch (error) {
      console.error("Error finding duplicate columns:", error)
      toast.error("An error occurred while finding duplicate columns.")
    }
  }

  const handleDeleteColumn = async () => {
    if (!selectedColumn) {
      toast.warn("Please select a column to delete.")
      return
    }

    try {
      const db = await connectToMongoDB()
      const collection = db.collection(globalData[currentCollection].id)

      await collection.updateMany({}, { $unset: { [selectedColumn]: "" } })

      toast.success(`Column "${selectedColumn}" has been deleted.`)
      setSelectedColumn(null)
      await fetchData()
    } catch (error) {
      console.error("Error deleting column:", error)
      toast.error("An error occurred while deleting the column.")
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
      <Message severity="info" text="This tool identifies duplicate columns in your dataset and allows you to choose one for deletion." style={{ marginBottom: "15px" }} />
      <Message severity="success" text={`Current Collection: ${globalData[currentCollection]?.name || "None"}`} style={{ marginBottom: "15px" }} />
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
                  backgroundColor: col.field === selectedColumn ? "#ee6b6e" : "transparent"
                }} // Highlight the selected column
              />
            ))}
          </DataTable>
        </Card>
      )}
      {duplicateColumns.length > 0 && (
        <div style={{ marginTop: "20px" }}>
          <h4>Duplicate Columns</h4>
          <ul style={{ listStyleType: "none", padding: 0 }}>
            {duplicateColumns.map((pair, index) => (
              <li key={index} style={{ marginBottom: "10px" }}>
                {pair.column1} and {pair.column2}{" "}
                <Button
                  label={`Delete ${pair.column2}`}
                  className="p-button-danger"
                  onClick={() => setSelectedColumn(pair.column2)}
                  style={{
                    marginLeft: "10px",
                    marginTop: "5px",
                    display: "inline-block"
                  }}
                />
              </li>
            ))}
          </ul>
        </div>
      )}

      {selectedColumn && (
        <div style={{ marginTop: "20px", textAlign: "center" }}>
          <h4>Selected Column: {selectedColumn}</h4>
          <Button label="Confirm Delete" icon="pi pi-trash" className="p-button-danger" onClick={handleDeleteColumn} />
        </div>
      )}
    </div>
  )
}

export default DropDuplicatesToolsDB
