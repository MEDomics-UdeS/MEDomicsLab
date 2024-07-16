import React, { useEffect, useState, useContext } from "react"
import { DataTable } from "primereact/datatable"
import { Column } from "primereact/column"
import { InputText } from "primereact/inputtext"
import { Button } from "primereact/button"
import { ObjectId } from "mongodb"
import { toast } from "react-toastify"
import { saveAs } from "file-saver"
import { getCollectionData } from "./utils"
import InputToolsComponent from "./inputToolsComponent"
import { Dialog } from "primereact/dialog"
import { LayoutModelContext } from "../layout/layoutContext"
import { connectToMongoDB } from "../mongoDB/mongoDBUtils"

/**
 * DataTableFromDB component
 * @param data - MongoDB data
 * @param tablePropsData - DataTable props
 * @param tablePropsColumn - Column props
 * @param isReadOnly - Read-only mode
 * @returns {Element} - DataTable component
 * @constructor - DataTableFromDB
 */
const DataTableFromDB = ({ data, tablePropsData, tablePropsColumn, isReadOnly }) => {
  const [innerData, setInnerData] = useState([])
  const [columns, setColumns] = useState([])
  const [hoveredButton, setHoveredButton] = useState(null)
  const [lastEdit, setLastEdit] = useState(Date.now())
  const { dispatchLayout } = useContext(LayoutModelContext)
  const exportOptions = [
    {
      label: "CSV",
      command: () => {
        handleExport("CSV")
      }
    },
    {
      label: "JSON",
      command: () => {
        handleExport("JSON")
      }
    }
  ]

  const buttonStyle = (id) => ({
    borderRadius: "10px",
    backgroundColor: hoveredButton === id ? "#d32f2f" : "#cccccc",
    color: "white",
    border: "none",
    padding: "2px",
    opacity: isReadOnly ? 0.5 : 1,
    cursor: isReadOnly ? "not-allowed" : "pointer"
  })

  const dataTableStyle = {
    height: "100%",
    overflow: "auto"
  }

  // Fetch data from MongoDB on component mount
  useEffect(() => {
    if (data && data.id) {
      console.log("Fetching data with:", data)
      getCollectionData(data.id)
        .then((fetchedData) => {
          console.log("Fetched data:", fetchedData)
          let collData = fetchedData.map((item) => {
            let keys = Object.keys(item)
            let values = Object.values(item)
            let dataObject = {}
            for (let i = 0; i < keys.length; i++) {
              dataObject[keys[i]] = keys[i] === "_id" ? item[keys[i]].toString() : values[i]
            }
            return dataObject
          })
          setInnerData(collData)
        })
        .catch((error) => {
          console.error("Failed to fetch data:", error)
        })
    } else {
      console.warn("Invalid data prop:", data)
    }
  }, [data])

  // Update columns when innerData changes
  useEffect(() => {
    console.log("innerData updated:", innerData)
    if (innerData.length > 0) {
      const allKeys = new Set()
      innerData.forEach((item) => {
        Object.keys(item).forEach((key) => allKeys.add(key))
      })
      const keys = Array.from(allKeys).filter((key) => key !== "_id")
      const newColumns = keys.map((key) => ({ field: key, header: key }))
      setColumns(newColumns)
    }
  }, [innerData])

  // Log columns when updated
  useEffect(() => {
    console.log("columns updated:", columns)
  }, [columns])

  const getColumnsFromData = (data) => {
    if (data.length > 0) {
      return Object.keys(data[0])
        .filter((key) => key !== "_id")
        .map((key) => <Column key={key} field={key} header={key} {...tablePropsColumn} />)
    }
    return null
  }

  // Update data in MongoDB
  const updateDatabaseData = async (dbname, collectionName, id, field, newValue) => {
    try {
      const db = await connectToMongoDB()
      const collection = db.collection(collectionName)
      console.log(`Updating document with _id: ${id}, setting ${field} to ${newValue}`)
      const result = await collection.updateOne({ _id: new ObjectId(id) }, { $set: { [field]: newValue } })
      console.log("Update result:", result)
      if (result.modifiedCount === 0) {
        console.error("No documents were updated")
      }
    } catch (error) {
      console.error("Error updating data:", error)
    }
  }

  // Delete data from MongoDB
  const deleteDatabaseData = async (dbname, collectionName, id) => {
    try {
      const db = await connectToMongoDB()
      const collection = db.collection(collectionName)
      console.log(`Deleting document with _id: ${id}`)
      const result = await collection.deleteOne({ _id: new ObjectId(id) })
      console.log("Delete result:", result)
      if (result.deletedCount === 0) {
        console.error("No documents were deleted")
      } else {
        setInnerData(innerData.filter((item) => item._id !== id))
      }
    } catch (error) {
      console.error("Error deleting data:", error)
    }
  }

  // Insert data into MongoDB
  const insertDatabaseData = async (dbname, collectionName, data) => {
    try {
      const db = await connectToMongoDB()
      const collection = db.collection(collectionName)
      console.log(`Inserting document: ${JSON.stringify(data)}`)
      const result = await collection.insertOne(data)
      console.log("Insert result:", result)
      return result.insertedId.toString()
    } catch (error) {
      console.error("Error inserting data:", error)
    }
  }

  // Handle cell edit completion
  const onCellEditComplete = (e) => {
    let { rowData, newValue, field } = e
    if (newValue === "" || newValue === null) {
      newValue = null
    } else if (!isNaN(newValue)) {
      if (Number.isInteger(parseFloat(newValue))) {
        newValue = parseInt(newValue)
      } else {
        newValue = parseFloat(newValue)
      }
    }
    rowData[field] = newValue
    if (!rowData._id) {
      console.log("Calling insertDatabaseData with:", {
        Filename: data.name,
        collectionName: data.id,
        data: rowData
      })
      insertDatabaseData(data.path, data.id, rowData)
        .then((id) => {
          console.log("Database inserted successfully")
          rowData._id = id
          setInnerData([...innerData])
        })
        .catch((error) => {
          console.error("Failed to insert database:", error)
        })
    } else {
      console.log("Calling updateDatabaseData with:", {
        Filename: data.name,
        collectionName: data.id,
        id: rowData._id,
        field,
        newValue
      })
      updateDatabaseData(data.path, data.id, rowData._id, field, newValue)
        .then(() => {
          console.log("Database updated successfully")
          setLastEdit(Date.now())
        })
        .catch((error) => {
          console.error("Failed to update database:", error)
        })
    }
  }

  // Handle row deletion
  const onDeleteRow = (rowData) => {
    const { _id } = rowData
    console.log("Deleting row with _id:", _id)
    deleteDatabaseData(data.path, data.id, _id)
      .then(() => {
        console.log("Row deleted successfully")
      })
      .catch((error) => {
        console.error("Failed to delete row:", error)
      })
  }

  // Handle column deletion
  const onDeleteColumn = async (field) => {
    setColumns(columns.filter((column) => column.field !== field))
    setInnerData(
      innerData.map((row) => {
        const { [field]: _, ...rest } = row
        return rest
      })
    )

    try {
      const db = await connectToMongoDB()
      const collection = db.collection(data.id)
      console.log(`Deleting field ${field} from all documents`)
      const result = await collection.updateMany({}, { $unset: { [field]: "" } })
      console.log("Delete column result:", result)
      if (result.modifiedCount === 0) {
        console.error("No documents were updated")
      }
    } catch (error) {
      console.error("Error deleting column:", error)
    }
  }

  // Text editor for cell editing
  const textEditor = (options) => {
    return <InputText type="text" value={options.value} onChange={(e) => options.editorCallback(e.target.value)} onKeyDown={(e) => e.stopPropagation()} style={{ width: "100%" }} />
  }

  // Refresh data from MongoDB
  const refreshData = () => {
    if (data && data.id) {
      getCollectionData(data.id)
        .then((fetchedData) => {
          let collData = fetchedData.map((item) => {
            let keys = Object.keys(item)
            let values = Object.values(item)
            let dataObject = {}
            for (let i = 0; i < keys.length; i++) {
              dataObject[keys[i]] = keys[i] === "_id" ? item[keys[i]].toString() : values[i]
            }
            return dataObject
          })
          setInnerData(collData)
        })
        .catch((error) => {
          console.error("Failed to fetch data:", error)
        })
    } else {
      console.warn("Invalid data prop:", data)
    }
  }

  // Export data to CSV or JSON
  function handleExport(format) {
    if (format === "CSV") {
      const headers = columns.map((column) => column.field)
      const csvData = [headers.join(",")]
      csvData.push(
        ...innerData.map((row) => {
          let csvRow = ""
          for (const [, value] of Object.entries(row)) {
            csvRow += value + ","
          }
          return csvRow.slice(0, -1)
        })
      )
      const csvString = csvData.join("\n")
      const blob = new Blob([csvString], { type: "text/csv;charset=utf-8" })
      saveAs(blob, data.uuid + ".csv")
    } else if (format === "JSON") {
      const jsonBlob = new Blob([JSON.stringify(innerData)], { type: "application/json" })
      saveAs(jsonBlob, data.uuid + ".json")
    } else {
      toast.warn("Please select a format to export")
    }
  }

  const handleDialogClick = () => {
    console.log("Opening Input Tools")
    let newProps = {
      data: { ...data },
      exportOptions: exportOptions,
      refreshData: refreshData,
      columns: columns,
      innerData: { ...innerData },
      lastEdit: { ...lastEdit }
    }
    dispatchLayout({ type: "openInputToolsDB", payload: { data: newProps } })
  }

  // Render the DataTable component
  return (
    <>
      {innerData.length === 0 ? (
        <p style={{ color: "red", fontSize: "20px", textAlign: "center", margin: "30px" }}>No data found in {data.name}</p>
      ) : (
        <div style={dataTableStyle}>
          <DataTable
            className="p-datatable-striped p-datatable-gridlines"
            value={innerData}
            editMode={!isReadOnly ? "cell" : undefined}
            size="small"
            scrollable
            height={"100%"}
            width={"100%"}
            paginator
            rows={20}
            rowsPerPageOptions={[20, 40, 80, 100]}
            {...tablePropsData}
            footer={
              !isReadOnly && (
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
                  <Button icon="pi pi-file-edit" onClick={handleDialogClick} tooltip="Open Input Tools" tooltipOptions={{ position: "bottom" }} />
                </div>
              )
            }
          >
            {!isReadOnly && (
              <Column
                field="delete"
                body={(rowData) => (
                  <Button
                    icon="pi pi-trash"
                    style={buttonStyle(rowData._id)}
                    onClick={() => onDeleteRow(rowData)}
                    onMouseEnter={() => setHoveredButton(rowData._id)}
                    onMouseLeave={() => setHoveredButton(null)}
                  />
                )}
              />
            )}
            {columns.length > 0
              ? columns.map((col) => (
                  <Column
                    key={col.field}
                    field={col.field}
                    header={
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                        {!isReadOnly && (
                          <Button
                            icon="pi pi-trash"
                            style={buttonStyle(col.field)}
                            onClick={() => onDeleteColumn(col.field)}
                            onMouseEnter={() => setHoveredButton(col.field)}
                            onMouseLeave={() => setHoveredButton(null)}
                          />
                        )}
                        {col.header}
                      </div>
                    }
                    editor={!isReadOnly ? (options) => textEditor(options) : undefined}
                    onCellEditComplete={!isReadOnly ? onCellEditComplete : undefined}
                  />
                ))
              : getColumnsFromData(innerData)}
          </DataTable>
        </div>
      )}
      <Dialog header="Input Tools" style={{ width: "80%", height: "80%" }} modal={true}>
        <InputToolsComponent data={data} exportOptions={exportOptions} refreshData={refreshData} columns={columns} innerData={innerData} lastEdit={lastEdit} />
      </Dialog>
    </>
  )
}

export default DataTableFromDB
