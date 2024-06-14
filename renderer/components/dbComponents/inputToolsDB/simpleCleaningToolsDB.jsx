import React, { useState, useEffect } from "react"
import { Message } from "primereact/message"
import { DataTable } from "primereact/datatable"
import { Column } from "primereact/column"
import { getCollectionData, updateDBCollections } from "../utils"
import { Slider } from "primereact/slider"
import { InputText } from "primereact/inputtext"
import { Button } from "primereact/button"
import { toast } from "react-toastify"
const mongoUrl = "mongodb://localhost:27017"
import { OverlayPanel } from "primereact/overlaypanel"
import { MongoClient } from "mongodb"
import { InputNumber } from "primereact/inputnumber"

const SimpleCleaningToolsDB = ({ lastEdit, DB, data, columns, currentCollection, refreshData }) => {
  const [tableData, setTableData] = useState([])
  const [rowData, setRowData] = useState([])
  const [threshold, setThreshold] = useState(0)
  const [threshold2, setThreshold2] = useState(0)
  const [percentage, setPercentage] = useState("0%")
  const [percentage2, setPercentage2] = useState("0%")
  const [hoveredButton, setHoveredButton] = useState(null)
  const [columnsToDrop, setColumnsToDrop] = useState([])
  const [rowsToDrop, setRowsToDrop] = useState([])
  const [newCollectionName, setNewCollectionName] = useState("")
  const [newCollectionName2, setNewCollectionName2] = useState("")
  const [newData, setNewData] = useState([])
  const op = React.useRef(null)
  const op2 = React.useRef(null)

  useEffect(() => {
    async function fetchData() {
      const fetchedData = await getCollectionData(DB.name, currentCollection)
      console.log("data:", fetchedData)

      const columnsData = columns.map((column) => {
        const nonNaNValues = fetchedData.reduce((count, row) => {
          return count + (row[column.field] !== null && row[column.field] !== undefined && row[column.field] !== "" ? 1 : 0)
        }, 0)
        const percentage = (nonNaNValues / fetchedData.length) * 100

        return { column: column.header, nonNaN: nonNaNValues, percentage: `${percentage.toFixed(2)}%` }
      })

      setTableData(columnsData)

      const rowData = fetchedData.map((row, index) => {
        const nonNaNValues = Object.values(row).reduce((count, value) => {
          return count + (value !== null && value !== undefined && value !== "" ? 1 : 0)
        }, 0)
        const percentage = (nonNaNValues / Object.keys(row).length) * 100
        console.log("#columns", Object.keys(row).length - 1)

        return { rowIndex: `${index}`, nonNaN: nonNaNValues - 1, percentage: `${percentage.toFixed(2)}%` }
      })

      setRowData(rowData)
    }

    fetchData()
  }, [currentCollection, data, columns, lastEdit])

  const handleDropColumns = () => {
    const columnsBelowThreshold = columns
      .filter((column) => {
        const columnData = tableData.find((data) => data.column === column.header)
        const percentage = parseFloat(columnData.percentage)
        return percentage <= threshold
      })
      .map((column) => column.header)

    setColumnsToDrop(columnsBelowThreshold)
  }

  const handleDeleteColumnsToDrop = async (event) => {
    const currentData = await getCollectionData(DB.name, currentCollection)
    currentData.map((row) => {
      const newRow = { ...row }
      columnsToDrop.forEach((column) => {
        delete newRow[column]
      })
      return newRow
    })
    op.current.toggle(event)
  }

  const handleDropRows = () => {
    const rowsBelowThreshold = rowData
      .filter((row) => {
        const percentage = parseFloat(row.percentage)
        return percentage <= threshold2
      })
      .map((row) => row.rowIndex)

    setRowsToDrop(rowsBelowThreshold)
  }

  const handleDeleteRowsToDrop = async (event) => {
    const currentData = await getCollectionData(DB.name, currentCollection)
    const filteredData = currentData.filter((_, index) => !rowsToDrop.includes(index.toString()))
    setNewData(filteredData)
    op2.current.toggle(event)
  }

  return (
    <>
      <div style={{ textAlign: "center", marginBottom: "10px" }}>
        <Message
          severity="info"
          text={
            "The Simple Cleaning tool assists in handling missing values within your datasets, whether by rows, columns, or both. It provides various methods such as dropping missing values or filling them in."
          }
        />
        <Message style={{ marginTop: "10px" }} severity="success" text={`Current Collection: ${currentCollection}`} />
      </div>
      <div>
        <DataTable value={tableData} readOnly rowClassName={(rowData) => (columnsToDrop.includes(rowData.column) ? "highlight-row" : "")}>
          <Column field="column" header={`Columns (${columns.length})`} sortable></Column>
          <Column field="nonNaN" header="Number of non-NaN" sortable></Column>
          <Column field="percentage" header="% of non-NaN" sortable></Column>
        </DataTable>
        <div style={{ marginTop: "20px" }}>
          <DataTable value={rowData} readOnly rowClassName={(rowData) => (columnsToDrop.includes(rowData.column) ? "highlight-row" : "")}>
            <Column field="rowIndex" header={`Row index (${columns.length})`} sortable></Column>
            <Column field="nonNaN" header="Number of non-NaN" sortable></Column>
            <Column field="percentage" header="% of non-NaN" sortable></Column>
          </DataTable>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "space-between",
            border: "1px solid grey",
            borderRadius: "5px",
            marginTop: "20px",
            backgroundColor: "lightgrey"
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", width: "100%", marginTop: "10px" }}>
            <p style={{ marginLeft: "10px", color: "black" }}>Column threshold of NaN values (%) ({columnsToDrop.length})</p>
          </div>
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
              value={threshold}
              onChange={(e) => {
                setThreshold(e.value)
                setPercentage(`${e.value}%`)
              }}
              onSlideEnd={handleDropColumns}
              style={{ width: "70%", marginLeft: "10px", marginRight: "10px" }}
            />
            <InputNumber
              value={percentage.replace("%", "")}
              onValueChange={(e) => {
                setPercentage(`${e.value}%`)
                setThreshold(e.value)
                handleDropColumns() // Call the function to update the columnsToDrop state
              }}
              mode="decimal"
              min={0}
              max={100}
              useGrouping={false}
              showButtons
            />
            <Button
              icon="pi pi-trash"
              style={{
                backgroundColor: hoveredButton === "column_button" ? "#d32f2f" : "grey",
                color: "white",
                border: "none",
                marginLeft: "10px",
                width: "50px"
              }}
              onMouseEnter={() => setHoveredButton("column_button")}
              onMouseLeave={() => setHoveredButton(null)}
              onClick={(event) => handleDeleteColumnsToDrop(event)}
              tooltip="Drop Columns"
              tooltipOptions={{ position: "top" }}
            />
          </div>
          <Message
            style={{
              marginBottom: "10px"
            }}
            severity={columnsToDrop.length === 0 ? "error" : "success"}
            text={columnsToDrop.length === 0 ? "No columns will be dropped" : `Columns that will be dropped: ${columnsToDrop.join(", ")}`}
          />
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "space-between",
            border: "1px solid grey",
            borderRadius: "5px",
            marginTop: "20px",
            backgroundColor: "lightgrey"
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", width: "100%", marginTop: "10px" }}>
            <p style={{ marginLeft: "10px", color: "black" }}>Row threshold of NaN values (%) ({rowsToDrop.length})</p>
          </div>
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
              value={threshold2}
              onChange={(e) => {
                setThreshold2(e.value)
                setPercentage2(`${e.value}%`)
              }}
              onSlideEnd={handleDropRows}
              style={{ width: "70%", marginLeft: "10px", marginRight: "10px" }}
            />
            <InputNumber
              value={percentage2.replace("%", "")}
              onValueChange={(e) => {
                setPercentage2(`${e.value}%`)
                setThreshold2(e.value)
                handleDropRows() // Call the function to update the columnsToDrop state
              }}
              mode="decimal"
              min={0}
              max={100}
              useGrouping={false}
              showButtons
            />
            <Button
              icon="pi pi-trash"
              style={{
                backgroundColor: hoveredButton === "row_button" ? "#d32f2f" : "grey",
                color: "white",
                border: "none",
                marginLeft: "10px",
                width: "50px"
              }}
              onMouseEnter={() => setHoveredButton("row_button")}
              onMouseLeave={() => setHoveredButton(null)}
              onClick={(event) => handleDeleteRowsToDrop(event)}
              tooltip="Drop Rows"
              tooltipOptions={{ position: "top" }}
            />
          </div>
          <Message
            style={{
              marginBottom: "10px"
            }}
            severity={rowsToDrop.length === 0 ? "error" : "success"}
            text={rowsToDrop.length === 0 ? "No rows will be dropped" : `Rows that will be dropped: ${rowsToDrop.join(", ")}`}
          />
        </div>
      </div>
      <div style={{ textAlign: "center", marginTop: "20px" }}>
        <Message severity="info" text={"Create a new clean dataset by dropping the selected columns and rows below the specified thresholds."} />
      </div>
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
        <InputText
          value={newCollectionName2}
          onChange={(e) => setNewCollectionName2(e.target.value)}
          placeholder="New clean dataset name"
          style={{ margin: "5px", fontSize: "1rem", width: "205px", marginTop: "20px" }}
        />
        <Button
          icon="pi pi-plus"
          style={{ margin: "5px", fontSize: "1rem", padding: "6px 10px", width: "150px", marginTop: "20px" }}
          onClick={async () => {
            if (newCollectionName2) {
              const client = new MongoClient(mongoUrl)
              try {
                await client.connect()
                const db = client.db(DB.name)
                const currentData = await getCollectionData(DB.name, currentCollection)
                const filteredData = currentData.filter((_, index) => !rowsToDrop.includes(index.toString()))
                const cleanedData = filteredData.map((row) => {
                  const newRow = { ...row }
                  columnsToDrop.forEach((column) => {
                    delete newRow[column]
                  })
                  return newRow
                })
                const newCollection = await db.collection(newCollectionName2)
                await newCollection.insertMany(cleanedData)
                toast.success(`Clean dataset ${newCollectionName2} created successfully`)
                refreshData()
                updateDBCollections(DB.name)
              } catch (error) {
                console.error("Error creating new clean dataset:", error)
              } finally {
                await client.close()
              }
            } else {
              toast.warn("No dataset name provided.")
            }
          }}
          tooltip="Create Clean Dataset"
          tooltipOptions={{ position: "top" }}
        />
      </div>
      <OverlayPanel ref={op} showCloseIcon={true} dismissable={true} style={{ width: "420px", padding: "10px" }} onHide={() => setNewCollectionName("")}>
        <h4 style={{ fontSize: "0.8rem", margin: "10px 0" }}>
          Do you want to <b>overwrite</b> the dataset or <b>create a new one</b> ?
        </h4>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <Button
            className="p-button-danger"
            label="Overwrite"
            style={{ margin: "5px", fontSize: "0.8rem", padding: "6px 10px" }}
            onClick={async () => {
              const client = new MongoClient(mongoUrl)
              try {
                await client.connect()
                const db = client.db(DB.name)
                const collection = db.collection(currentCollection)
                const unsetObject = columnsToDrop.reduce((acc, column) => {
                  acc[column] = ""
                  return acc
                }, {})
                await collection.updateMany({}, { $unset: unsetObject })
                toast.success("Collection overwritten and cleaned successfully.")
                refreshData()
                op.current.hide()
              } catch (error) {
                console.error("Error deleting columns:", error)
              } finally {
                await client.close()
              }
            }}
          />
          <InputText value={newCollectionName} onChange={(e) => setNewCollectionName(e.target.value)} placeholder="Enter new collection name" style={{ margin: "5px", fontSize: "0.8rem" }} />
          <Button
            label="Create New"
            style={{ margin: "5px", fontSize: "0.8rem", padding: "6px 10px" }}
            onClick={async () => {
              if (newCollectionName) {
                const client = new MongoClient(mongoUrl)
                try {
                  await client.connect()
                  const db = client.db(DB.name)
                  const collection = db.collection(currentCollection)
                  const newData = await collection.find({}).toArray()
                  const newCollection = await db.collection(newCollectionName)
                  await newCollection.insertMany(newData)
                  const unsetObject = columnsToDrop.reduce((acc, column) => {
                    acc[column] = ""
                    return acc
                  }, {})
                  await newCollection.updateMany({}, { $unset: unsetObject })
                  toast.success(`Cleaned collection ${newCollectionName} created successfully`)
                  refreshData()
                  updateDBCollections(DB.name)
                } catch (error) {
                  console.error("Error creating new collection and deleting columns:", error)
                } finally {
                  await client.close()
                }
                op.current.hide()
              } else {
                toast.error("No collection name provided. Operation cancelled.")
              }
            }}
          />
        </div>
      </OverlayPanel>
      <OverlayPanel ref={op2} showCloseIcon={true} dismissable={true} style={{ width: "420px", padding: "10px" }} onHide={() => setNewCollectionName("")}>
        <h4 style={{ fontSize: "0.8rem", margin: "10px 0" }}>
          Do you want to <b>overwrite</b> the dataset or <b>create a new one</b> ?
        </h4>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <Button
            className="p-button-danger"
            label="Overwrite"
            style={{ margin: "5px", fontSize: "0.8rem", padding: "6px 10px" }}
            onClick={async () => {
              const client = new MongoClient(mongoUrl)
              try {
                await client.connect()
                const db = client.db(DB.name)
                const collection = db.collection(currentCollection)
                await collection.deleteMany({})
                await collection.insertMany(newData)
                toast.success("Collection overwritten and cleaned successfully.")
                refreshData()
                op2.current.hide()
              } catch (error) {
                console.error("Error overwriting collection:", error)
              } finally {
                await client.close()
              }
            }}
          />
          <InputText value={newCollectionName} onChange={(e) => setNewCollectionName(e.target.value)} placeholder="Enter new collection name" style={{ margin: "5px", fontSize: "0.8rem" }} />
          <Button
            label="Create New"
            style={{ margin: "5px", fontSize: "0.8rem", padding: "6px 10px" }}
            onClick={async () => {
              if (newCollectionName) {
                const client = new MongoClient(mongoUrl)
                try {
                  await client.connect()
                  const db = client.db(DB.name)
                  const newCollection = await db.collection(newCollectionName)
                  await newCollection.insertMany(newData)
                  toast.success(`Cleaned collection ${newCollectionName} created successfully`)
                  refreshData()
                  updateDBCollections(DB.name)
                } catch (error) {
                  console.error("Error creating new collection:", error)
                } finally {
                  await client.close()
                }
                op2.current.hide()
              } else {
                toast.error("No collection name provided. Operation cancelled.")
              }
            }}
          />
        </div>
      </OverlayPanel>
    </>
  )
}

export default SimpleCleaningToolsDB
