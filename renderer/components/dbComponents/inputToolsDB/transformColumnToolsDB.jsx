import React, { useEffect, useState } from "react"
import { MultiSelect } from "primereact/multiselect"
import { SplitButton } from "primereact/splitbutton"
import { Button } from "primereact/button"
import { Message } from "primereact/message"
import { toast } from "react-toastify"
import { getCollectionData } from "../utils"
import { connectToMongoDB } from "../../mongoDB/mongoDBUtils"
import Papa from "papaparse"

/**
 * @description
 * This component provides tools to transform columns in a dataset.
 * @param {Object} props
 * @param {string} props.currentCollection - Current collection
 * @param {Function} props.refreshData - Function to refresh the data
 */
const TransformColumnToolsDB = ({ currentCollection, refreshData }) => {
  const [isHovered, setIsHovered] = useState(false)
  const [selectedColumns, setSelectedColumns] = useState([])
  const [columns, setColumns] = useState([])
  const [fileName, setFileName] = useState("Choose File")
  const customFileUpload = {
    padding: "6px 12px",
    cursor: "pointer",
    backgroundColor: isHovered ? "grey" : "darkgrey",
    color: "white",
    border: "none",
    borderRadius: "4px"
  }

  useEffect(() => {
    const fetchData = async () => {
      const collectionData = await getCollectionData(currentCollection)
      if (collectionData && collectionData.length > 0) {
        setColumns(Object.keys(collectionData[0]))
      }
    }
    fetchData()
  }, [currentCollection])

  const handleFileUploadUpdated = (event) => {
    handleFileUpload(event)
    if (event.target.files.length > 0) {
      setFileName(event.target.files[0].name)
    }
  }

  const transformData = async (type, currentCollection) => {
    const data = await getCollectionData(currentCollection) // Await the async call
    const newTransformedData = data.map((row) => {
      let newRow = { ...row }
      selectedColumns.forEach((column) => {
        const cellValue = newRow[column]
        if (type === "Binary") {
          newRow[column] = cellValue && !isNaN(cellValue) ? 1 : 0
        } else if (type === "Non-empty") {
          newRow[column] = cellValue && !isNaN(cellValue) ? cellValue : 0
        }
      })
      return newRow
    })

    const db = await connectToMongoDB()
    const collection = db.collection(currentCollection)
    await collection.deleteMany({})
    await collection.insertMany(newTransformedData)
    toast.success("Data transformed to " + type + " successfully")
    refreshData()
  }

  // Handle exporting selected columns
  const handleExportColumns = () => {
    if (selectedColumns.length > 0) {
      const csvString = selectedColumns.join(",")
      const blob = new Blob([csvString], { type: "text/csv;charset=utf-8" })
      saveAs(blob, "selected_columns.csv")
    } else {
      toast.warn("No columns selected for export")
    }
  }

  // Handle deleting selected columns
  const handleDeleteColumns = async () => {
    if (selectedColumns.length > 0) {
      const db = await connectToMongoDB()
      const collection = db.collection(currentCollection)
      const data = await collection.find({}).toArray()
      const newTransformedData = data.map((row) => {
        let newRow = { ...row }
        selectedColumns.forEach((column) => {
          delete newRow[column]
        })
        return newRow
      })
      await collection.deleteMany({})
      await collection.insertMany(newTransformedData)
      setColumns(Object.keys(newTransformedData[0]))
      setSelectedColumns([])
      toast.success("Columns deleted successfully")
      refreshData()
    }
  }

  // Handle file upload
  const handleFileUpload = (event) => {
    const file = event.target.files[0]
    if (!file) {
      toast.warn("No file selected")
      return
    }

    if (file.type !== "text/csv") {
      toast.warn("File must be a CSV")
      return
    }

    Papa.parse(file, {
      complete: (result) => {
        const uploadedColumns = result.data[0] // Assuming the first row contains column names
        if (result.data.length !== 1) {
          toast.warn("CSV file must contain only one line with column names")
          return
        }

        const missingColumns = uploadedColumns.filter((col) => !columns.includes(col))
        if (missingColumns.length > 0) {
          toast.warn("Missing columns: " + missingColumns.join(", "))
        } else {
          setSelectedColumns(uploadedColumns)
        }
      },
      skipEmptyLines: true,
      header: false
    })
  }

  return (
    <>
      <div style={{ textAlign: "center", marginBottom: "10px" }}>
        <Message
          severity="info"
          text="The Transform Columns Tools provide functionalities to alter dataset columns. This includes converting selected columns to binary, replacing empty cells with zeros, and facilitating the import and export of column lists."
        />
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
        <MultiSelect
          value={selectedColumns}
          options={columns.filter((col) => col !== "_id")}
          display="chip"
          onChange={(e) => {
            setSelectedColumns(e.value)
          }}
          placeholder="Select Columns"
          style={{ marginRight: "5px", width: "200px" }}
        />
        <SplitButton
          label="Transform"
          model={[
            {
              label: "Binary",
              command: () => {
                if (selectedColumns.length > 0) {
                  transformData("Binary", currentCollection)
                } else {
                  toast.warn("No columns selected for transformation")
                }
              }
            },
            {
              label: "Non-empty",
              command: () => {
                if (selectedColumns.length > 0) {
                  transformData("Non-empty", currentCollection)
                } else {
                  toast.warn("No columns selected for transformation")
                }
              }
            }
          ]}
          className="p-button-success"
          style={{
            width: "auto",
            marginRight: "5px"
          }}
          tooltip="Transform selected columns"
          tooltipOptions={{ position: "top" }}
        />
        <Button
          icon="pi pi-file-export"
          onClick={handleExportColumns}
          className="p-button-success"
          style={{
            width: "50px",
            marginRight: "2px"
          }}
          tooltip="Export selected columns"
          tooltipOptions={{ position: "top" }}
        />
        <Button
          icon="pi pi-trash"
          onClick={handleDeleteColumns}
          className="p-button-danger"
          style={{
            width: "50px",
            marginRight: "2px"
          }}
          tooltip="Delete selected columns"
          tooltipOptions={{ position: "top" }}
        />
        <label htmlFor="fileUpload" style={customFileUpload} onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
          {fileName}
        </label>
        <input id="fileUpload" type="file" accept=".csv" onChange={handleFileUploadUpdated} style={{ display: "none" }} />
      </div>
    </>
  )
}

export default TransformColumnToolsDB
