import React, { useContext, useState } from "react"
import { InputText } from "primereact/inputtext"
import { Button } from "primereact/button"
import { SplitButton } from "primereact/splitbutton"
import { Message } from "primereact/message"
import { toast } from "react-toastify"
import { connectToMongoDB } from "../../mongoDB/mongoDBUtils"
import { DataContext } from "../../workspace/dataContext"

/**
 * @description
 * This component provides basic tools to add rows and columns to a dataset, and export the dataset.
 * @param {Object} props
 * @param {Object[]} props.exportOptions - Export options
 * @param {Function} props.refreshData - Function to refresh the data
 * @param {string} props.currentCollection - Current collection
 */
const BasicToolsDB = ({ exportOptions, refreshData, currentCollection }) => {
  const [newColumnName, setNewColumnName] = useState("")
  const [numRows, setNumRows] = useState("")
  const [columns, setColumns] = useState([])
  const [innerData, setInnerData] = useState([])
  const { globalData } = useContext(DataContext)

  // Add a new column to the table
  const handleAddColumn = async () => {
    if (newColumnName !== "") {
      try {
        console.log("currentCollection", currentCollection)
        const db = await connectToMongoDB()
        const collection = db.collection(globalData[currentCollection].id)
        const existingDocument = await collection.findOne({})
        if (existingDocument && newColumnName in existingDocument) {
          toast.warn("Column name already exists, please use a different column name")
          return
        }
        const newColumn = { field: newColumnName, header: newColumnName }
        setColumns([...columns, newColumn])
        const newInnerData = innerData.map((row) => ({ ...row, [newColumn.field]: "" }))
        setInnerData(newInnerData)
        setNewColumnName("")
        await collection.updateMany({}, { $set: { [newColumnName]: "" } })
        toast.success("Column " + newColumnName + " added successfully")
      } catch (error) {
        console.error("Error adding column:", error)
        toast.error("Error adding column")
      }
    } else {
      toast.warn("New column name cannot be empty")
    }
  }

  // Add a new row to the table
  const handleAddRow = async () => {
    if (!numRows || isNaN(numRows)) {
      toast.warn("Please enter a valid number for # of rows")
      return
    }
    const newRows = Array.from({ length: numRows }, () => {
      const newRow = {}
      columns.forEach((col) => (newRow[col.field] = ""))
      return newRow
    })

    try {
      const db = await connectToMongoDB()
      const collection = db.collection(globalData[currentCollection].id)
      await collection.insertMany(newRows)
      setNumRows("")
      setInnerData([...innerData, ...newRows])
      toast.success(numRows + " rows added successfully")
    } catch (error) {
      console.error("Error adding rows:", error)
      toast.error("Error adding rows")
    }
  }

  return (
    <>
      <div style={{ textAlign: "center", marginBottom: "10px" }}>
        <Message severity="info" text={"The Basic Tools enable you to add rows and columns to a dataset, and export the dataset"} />
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-around",
          alignItems: "center",
          padding: "2px",
          flexWrap: "wrap"
        }}
      >
        <div style={{ display: "flex", marginLeft: "100px" }}>
          <InputText id="numRows" value={numRows} onChange={(e) => setNumRows(e.target.value)} style={{ width: "100px" }} placeholder="# of Rows" />
          <Button
            icon="pi pi-plus"
            onClick={handleAddRow}
            style={{
              width: "50px"
            }}
          />
        </div>
        <div style={{ display: "flex" }}>
          <InputText id="newColumnName" value={newColumnName} style={{ width: "130px" }} onChange={(e) => setNewColumnName(e.target.value)} placeholder="Column Name" />
          <Button
            icon="pi pi-plus"
            onClick={() => handleAddColumn()}
            style={{
              width: "50px"
            }}
          />
        </div>
        <SplitButton icon="pi pi-file-export" model={exportOptions} className="p-button-success" style={{ marginRight: "100px" }} tooltip="Export the dataset" tooltipOptions={{ position: "top" }} />
      </div>
    </>
  )
}

export default BasicToolsDB
