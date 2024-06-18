import React, { useEffect, useState } from "react"
import { Message } from "primereact/message"
import { DataTable } from "primereact/datatable"
import { Column } from "primereact/column"
import { getCollectionData, updateDBCollections } from "../utils"
import { Slider } from "primereact/slider"
import { InputText } from "primereact/inputtext"
import { Button } from "primereact/button"
import { toast } from "react-toastify"
import { OverlayPanel } from "primereact/overlaypanel"
import { MongoClient } from "mongodb"
import { InputNumber } from "primereact/inputnumber"
import { Dropdown } from "primereact/dropdown"
import { SelectButton } from "primereact/selectbutton"
const mongoUrl = "mongodb://localhost:27017"

const SimpleCleaningToolsDB = ({ lastEdit, DB, data, columns, currentCollection, refreshData }) => {
  const [tableData, setTableData] = useState([])
  const [rowData, setRowData] = useState([])
  const [threshold, setThreshold] = useState(100)
  const [threshold2, setThreshold2] = useState(100)
  const [percentage, setPercentage] = useState("100%")
  const [percentage2, setPercentage2] = useState("100%")
  const [hoveredButton, setHoveredButton] = useState(null)
  const [columnsToDrop, setColumnsToDrop] = useState([])
  const [rowsToDrop, setRowsToDrop] = useState([])
  const [newCollectionName, setNewCollectionName] = useState("")
  const [newCollectionName2, setNewCollectionName2] = useState("")
  const [newData, setNewData] = useState([])
  const op = React.useRef(null)
  const op2 = React.useRef(null)
  const [cleaningOption, setCleaningOption] = useState("drop")
  const cleaningOptions = [
    { label: "Drop", value: "drop" }
    //{ label: "Random Fill", value: "randomFill" },
    //{ label: "Mean Fill", value: "meanFill" },
    //{ label: "Median Fill", value: "medianFill" },
    //{ label: "Mode Fill", value: "modeFill" },
    //{ label: "Backward Fill", value: "bfill" },
    //{ label: "Forward Fill", value: "ffill" }
  ]
  const [selectedOption, setSelectedOption] = useState("columns")
  const options = [
    { label: "Columns", value: "columns" },
    { label: "Rows", value: "rows" }
  ]

  useEffect(() => {
    async function fetchData() {
      const fetchedData = await getCollectionData(DB.name, currentCollection)

      const columnsData = columns.map((column) => {
        const NaNValues = fetchedData.reduce((count, row) => {
          return count + (row[column.field] === null || row[column.field] === undefined || row[column.field] === "" ? 1 : 0)
        }, 0)
        const percentage = (NaNValues / fetchedData.length) * 100

        return { column: column.header, NaN: NaNValues, percentage: `${percentage.toFixed(2)}%` }
      })

      setTableData(columnsData)

      const rowData = fetchedData.map((row, index) => {
        const NaNValues = Object.values(row).reduce((count, value) => {
          return count + (value === null || value === undefined || value === "" ? 1 : 0)
        }, 0)
        const percentage = (NaNValues / (Object.keys(row).length - 1)) * 100

        return { rowIndex: `${index}`, NaN: NaNValues, percentage: `${percentage.toFixed(2)}%` }
      })

      setRowData(rowData)
    }

    fetchData()
  }, [currentCollection, data, columns, lastEdit])

  const handleCleanColumns = () => {
    const columnsBelowThreshold = columns
      .filter((column) => {
        const columnData = tableData.find((data) => data.column === column.header)
        const percentage = parseFloat(columnData.percentage)
        return percentage >= threshold
      })
      .map((column) => column.header)

    setColumnsToDrop(columnsBelowThreshold)
  }

  const handleCleanRows = () => {
    const rowsBelowThreshold = rowData
      .filter((row) => {
        const percentage = parseFloat(row.percentage)
        return percentage >= threshold2
      })
      .map((row) => row.rowIndex)

    setRowsToDrop(rowsBelowThreshold)
  }

  const handleDeleteColumnsToDrop = async () => {
    const currentData = await getCollectionData(DB.name, currentCollection)
    const updatedData = currentData.map((row) => {
      const newRow = { ...row }
      columnsToDrop.forEach((column) => {
        delete newRow[column]
      })
      return newRow
    })
    setNewData(updatedData)
  }

  const handleDeleteRowsToDrop = async () => {
    const currentData = await getCollectionData(DB.name, currentCollection)
    const filteredData = currentData.filter((_, index) => !rowsToDrop.includes(index.toString()))
    setNewData(filteredData)
  }

  const insertCleanedDataBoth = (newCollectionName, cleaningOption, selectedOption) => {
    switch (cleaningOption) {
      case "drop":
        if (selectedOption === "columns") {
          // todo
        } else if (selectedOption === "rows") {
          // todo
        }
        break
      case "randomFill":
        if (selectedOption === "columns") {
          // todo
        } else if (selectedOption === "rows") {
          // todo
        }
        break
      case "meanFill":
        if (selectedOption === "columns") {
          // todo
        } else if (selectedOption === "rows") {
          // todo
        }
        break
      case "medianFill":
        if (selectedOption === "columns") {
          // todo
        } else if (selectedOption === "rows") {
          // todo
        }
        break
      case "modeFill":
        if (selectedOption === "columns") {
          // todo
        } else if (selectedOption === "rows") {
          // todo
        }
        break
      case "bfill":
        if (selectedOption === "columns") {
          // todo
        } else if (selectedOption === "rows") {
          // todo
        }
        break
      case "ffill":
        if (selectedOption === "columns") {
          // todo
        } else if (selectedOption === "rows") {
          // todo
        }
        break
    }
  }

  const createNewCleanedData = async () => {
    if (newCollectionName) {
      const client = new MongoClient(mongoUrl)
      try {
        await client.connect()
        const db = client.db(DB.name)
        const newCollection = await db.collection(newCollectionName)
        await newCollection.insertMany(newData)
        toast.success(`New collection ${newCollectionName} created successfully`)
        refreshData()
        setNewData([])
        updateDBCollections(DB.name)
      } catch (error) {
        console.error("Error creating new collection and inserting data:", error)
      } finally {
        await client.close()
      }
      op.current.hide()
    } else {
      toast.error("No collection name provided. Operation cancelled.")
    }
  }

  const insertCleanedData = async () => {
    const client = new MongoClient(mongoUrl)
    try {
      await client.connect()
      const db = client.db(DB.name)
      const collection = db.collection(currentCollection)
      await collection.deleteMany({})
      await collection.insertMany(newData)
      toast.success("Collection overwritten and cleaned successfully.")
      refreshData()
      setNewData([])
      op.current.hide()
    } catch (error) {
      console.error("Error overwriting collection:", error)
    } finally {
      await client.close()
    }
    op.current.hide()
  }

  const handleCleaningAction = (type, event) => {
    if (cleaningOption === "") {
      toast.warn("Please select a cleaning option")
      return
    }
    switch (cleaningOption) {
      case "drop":
        if (type === "column") {
          handleDeleteColumnsToDrop()
          op.current.toggle(event)
        } else if (type === "row") {
          handleDeleteRowsToDrop()
          op2.current.toggle(event)
        }
        break
      case "randomFill":
        break
      case "meanFill":
        break
      case "medianFill":
        // Implement median fill action
        break
      case "modeFill":
        // Implement mode fill action
        break
      case "bfill":
        // Implement backward fill action
        break
      case "ffill":
        // Implement forward fill action
        break
      default:
        // Handle unknown option
        break
    }
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
          <Column field="NaN" header="Number of empty" sortable></Column>
          <Column field="percentage" header="% of empty" sortable></Column>
        </DataTable>
        <div style={{ marginTop: "20px" }}>
          <DataTable value={rowData} readOnly rowClassName={(rowData) => (columnsToDrop.includes(rowData.column) ? "highlight-row" : "")}>
            <Column field="rowIndex" header={`Row index (${columns.length})`} sortable></Column>
            <Column field="NaN" header="Number of empty" sortable></Column>
            <Column field="percentage" header="% of empty" sortable></Column>
          </DataTable>
        </div>
        <div style={{ marginTop: "20px", display: "flex", justifyContent: "center" }}>
          <Dropdown value={cleaningOption} options={cleaningOptions} onChange={(e) => setCleaningOption(e.value)} placeholder="Select a Cleaning Option" />
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
            <p style={{ marginLeft: "10px", color: "black" }}>Column threshold of maximum empty values (%) ({columnsToDrop.length})</p>
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
              onSlideEnd={handleCleanColumns}
              style={{ width: "70%", marginLeft: "10px", marginRight: "10px" }}
            />
            <InputNumber
              value={percentage.replace("%", "")}
              onValueChange={(e) => {
                setPercentage(`${e.value}%`)
                setThreshold(e.value)
                handleCleanColumns()
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
              onClick={(event) => handleCleaningAction("column", event)}
              tooltip="Clean Columns"
              tooltipOptions={{ position: "top" }}
            />
          </div>
          <Message
            style={{
              marginBottom: "10px"
            }}
            severity={columnsToDrop.length === 0 ? "error" : "success"}
            text={columnsToDrop.length === 0 ? "No columns will be cleaned" : `Columns that will be cleaned: ${columnsToDrop.join(", ")}`}
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
            <p style={{ marginLeft: "10px", color: "black" }}>Row threshold of maximum empty values (%) ({rowsToDrop.length})</p>
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
              onSlideEnd={handleCleanRows}
              style={{ width: "70%", marginLeft: "10px", marginRight: "10px" }}
            />
            <InputNumber
              value={percentage2.replace("%", "")}
              onValueChange={(e) => {
                setPercentage2(`${e.value}%`)
                setThreshold2(e.value)
                handleCleanRows()
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
              onClick={(event) => handleCleaningAction("row", event)}
              tooltip="Clean Rows"
              tooltipOptions={{ position: "top" }}
            />
          </div>
          <Message
            style={{
              marginBottom: "10px"
            }}
            severity={rowsToDrop.length === 0 ? "error" : "success"}
            text={rowsToDrop.length === 0 ? "No rows will be cleaned" : `Rows that will be cleaned: ${rowsToDrop.join(", ")}`}
          />
        </div>
      </div>
      <div style={{ textAlign: "center", marginTop: "20px" }}>
        <Message severity="info" text={"Create a new clean dataset by cleaning the selected columns and rows."} />
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", marginTop: "20px" }}>
          <SelectButton
            value={selectedOption}
            options={options}
            onChange={(e) => setSelectedOption(e.value)}
            tooltip="This will determine whether to begin clearing with columns or rows."
            tooltipOptions={{ position: "top" }}
            disabled={true}
          />
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
        <InputText
          value={newCollectionName2}
          onChange={(e) => setNewCollectionName2(e.target.value)}
          placeholder="New clean dataset name"
          style={{ margin: "5px", fontSize: "1rem", width: "205px", marginTop: "20px" }}
          disabled={true}
        />
        <Button
          icon="pi pi-plus"
          style={{ margin: "5px", fontSize: "1rem", padding: "6px 10px", width: "150px", marginTop: "20px" }}
          onClick={() => insertCleanedDataBoth(newCollectionName2, cleaningOption, selectedOption)}
          tooltip="Create Clean Dataset"
          tooltipOptions={{ position: "top" }}
          disabled={true}
        />
      </div>
      <OverlayPanel ref={op} showCloseIcon={true} dismissable={true} style={{ width: "420px", padding: "10px" }} onHide={() => setNewCollectionName("")}>
        <h4 style={{ fontSize: "0.8rem", margin: "10px 0" }}>
          Do you want to <b>overwrite</b> the dataset or <b>create a new one</b> ?
        </h4>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <Button className="p-button-danger" label="Overwrite" style={{ margin: "5px", fontSize: "0.8rem", padding: "6px 10px" }} onClick={insertCleanedData} />
          <InputText value={newCollectionName} onChange={(e) => setNewCollectionName(e.target.value)} placeholder="Enter new collection name" style={{ margin: "5px", fontSize: "0.8rem" }} />
          <Button label="Create New" style={{ margin: "5px", fontSize: "0.8rem", padding: "6px 10px" }} onClick={createNewCleanedData} />
        </div>
      </OverlayPanel>
      <OverlayPanel ref={op2} showCloseIcon={true} dismissable={true} style={{ width: "420px", padding: "10px" }} onHide={() => setNewCollectionName("")}>
        <h4 style={{ fontSize: "0.8rem", margin: "10px 0" }}>
          Do you want to <b>overwrite</b> the dataset or <b>create a new one</b> ?
        </h4>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <Button className="p-button-danger" label="Overwrite" style={{ margin: "5px", fontSize: "0.8rem", padding: "6px 10px" }} onClick={insertCleanedData} />
          <InputText value={newCollectionName} onChange={(e) => setNewCollectionName(e.target.value)} placeholder="Enter new collection name" style={{ margin: "5px", fontSize: "0.8rem" }} />
          <Button label="Create New" style={{ margin: "5px", fontSize: "0.8rem", padding: "6px 10px" }} onClick={createNewCleanedData} />
        </div>
      </OverlayPanel>
    </>
  )
}

export default SimpleCleaningToolsDB
