import React, { useContext, useEffect, useState } from "react"
import { Message } from "primereact/message"
import { DataTable } from "primereact/datatable"
import { Column } from "primereact/column"
import { getCollectionData } from "../utils"
import { Slider } from "primereact/slider"
import { InputText } from "primereact/inputtext"
import { Button } from "primereact/button"
import { toast } from "react-toastify"
import { OverlayPanel } from "primereact/overlaypanel"
import { InputNumber } from "primereact/inputnumber"
import { Dropdown } from "primereact/dropdown"
import { SelectButton } from "primereact/selectbutton"
import { requestBackend } from "../../../utilities/requests"
import { ServerConnectionContext } from "../../serverConnection/connectionContext"
import { ipcRenderer } from "electron"

const SimpleCleaningToolsDB = ({ lastEdit, data, columns, currentCollection, refreshData }) => {
  const [tableData, setTableData] = useState([])
  const [rowData, setRowData] = useState([])
  const [columnThreshold, setColumnThreshold] = useState(100)
  const [rowThreshold, setRowThreshold] = useState(100)
  const [columnPercentage, setColumnPercentage] = useState("100%")
  const [rowPercentage, setRowPercentage] = useState("100%")
  const [hoveredButton, setHoveredButton] = useState(null)
  const [columnsToClean, setColumnsToClean] = useState([])
  const [rowsToClean, setRowsToClean] = useState([])
  const [newCollectionName, setNewCollectionName] = useState("")
  const [cleanType, setCleanType] = useState("columns")
  const op = React.useRef(null)
  const [cleaningOption, setCleaningOption] = useState("drop")
  const cleaningOptions = ["drop", "random fill", "mean fill", "median fill", "mode fill", "bfill", "ffill"]
  const [startWith, setStartWith] = useState("Columns")
  const { port } = useContext(ServerConnectionContext)

  // Function to show the data in the columns and rows datatables
  useEffect(() => {
    async function fetchData() {
      const fetchedData = await getCollectionData(currentCollection)

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

  // Sets the columns to drop
  const handleCleanColumns = () => {
    const columnsBelowThreshold = columns
      .filter((column) => {
        const columnData = tableData.find((data) => data.column === column.header)
        const percentage = parseFloat(columnData.percentage)
        return percentage >= columnThreshold
      })
      .map((column) => column.header)

    setColumnsToClean(columnsBelowThreshold)
  }

  // Sets the rows to drop
  const handleCleanRows = () => {
    const rowsBelowThreshold = rowData
      .filter((row) => {
        const percentage = parseFloat(row.percentage)
        return percentage >= rowThreshold
      })
      .map((row) => row.rowIndex)

    setRowsToClean(rowsBelowThreshold)
  }

  const cleanAll = (overwrite) => {
    clean("all", overwrite)
  }
  const cleanRowsOrColumns = (overwrite) => {
    clean(cleanType, overwrite)
  }

  const clean = (type, overwrite) => {
    let jsonToSend = {}
    if (type == "all") {
      jsonToSend = {
        type: type,
        cleanMethod: cleaningOption,
        overwrite: overwrite,
        databaseName: "data",
        collectionName: currentCollection,
        rowThreshold: rowThreshold,
        columnThreshold: columnThreshold,
        rowsToClean: rowsToClean,
        columnsToClean: columnsToClean,
        newDatasetName: newCollectionName,
        startWith: startWith
      }
    } else {
      jsonToSend = {
        type: type,
        cleanMethod: cleaningOption,
        overwrite: overwrite,
        databaseName: "data",
        collectionName: currentCollection,
        rowThreshold: rowThreshold,
        columnThreshold: columnThreshold,
        rowsToClean: rowsToClean,
        columnsToClean: columnsToClean,
        newDatasetName: newCollectionName
      }
    }
    requestBackend(port, "/input/cleanDB/", jsonToSend, (jsonResponse) => {
      console.log("jsonResponse", jsonResponse)
      refreshData()
      //ipcRenderer.send("get-collections", DB.name)
      toast.success("Data cleaned successfully.")
    })
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
        <DataTable value={tableData} readOnly rowClassName={(rowData) => (columnsToClean.includes(rowData.column) ? "highlight-row" : "")}>
          <Column field="column" header={`Columns (${columns.length})`} sortable></Column>
          <Column field="NaN" header="Number of empty" sortable></Column>
          <Column field="percentage" header="% of empty" sortable></Column>
        </DataTable>
        <div style={{ marginTop: "20px" }}>
          <DataTable value={rowData} readOnly rowClassName={(rowData) => (columnsToClean.includes(rowData.column) ? "highlight-row" : "")}>
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
            <p style={{ marginLeft: "10px", color: "black" }}>Column threshold of maximum empty values (%) ({columnsToClean.length})</p>
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
              value={columnThreshold}
              onChange={(e) => {
                setColumnThreshold(e.value)
                setColumnPercentage(`${e.value}%`)
              }}
              onSlideEnd={handleCleanColumns}
              style={{ width: "70%", marginLeft: "10px", marginRight: "10px" }}
            />
            <InputNumber
              value={columnPercentage.replace("%", "")}
              onValueChange={(e) => {
                setColumnPercentage(`${e.value}%`)
                setColumnThreshold(e.value)
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
              onClick={(e) => {
                setCleanType("columns")
                op.current.toggle(e)
              }}
              tooltip="Clean Columns"
              tooltipOptions={{ position: "top" }}
            />
          </div>
          <Message
            style={{
              marginBottom: "10px"
            }}
            severity={columnsToClean.length === 0 ? "error" : "success"}
            text={columnsToClean.length === 0 ? "No columns will be cleaned" : `Columns that will be cleaned: ${columnsToClean.join(", ")}`}
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
            <p style={{ marginLeft: "10px", color: "black" }}>Row threshold of maximum empty values (%) ({rowsToClean.length})</p>
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
              value={rowThreshold}
              onChange={(e) => {
                setRowThreshold(e.value)
                setRowPercentage(`${e.value}%`)
              }}
              onSlideEnd={handleCleanRows}
              style={{ width: "70%", marginLeft: "10px", marginRight: "10px" }}
            />
            <InputNumber
              value={rowPercentage.replace("%", "")}
              onValueChange={(e) => {
                setRowPercentage(`${e.value}%`)
                setRowThreshold(e.value)
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
              onClick={(e) => {
                setCleanType("rows")
                op.current.toggle(e)
              }}
              tooltip="Clean Rows"
              tooltipOptions={{ position: "top" }}
            />
          </div>
          <Message
            style={{
              marginBottom: "10px"
            }}
            severity={rowsToClean.length === 0 ? "error" : "success"}
            text={rowsToClean.length === 0 ? "No rows will be cleaned" : `Rows that will be cleaned: ${rowsToClean.join(", ")}`}
          />
        </div>
      </div>
      <div style={{ textAlign: "center", marginTop: "20px" }}>
        <Message severity="info" text={"Create a new clean dataset by cleaning the selected columns and rows."} />
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", marginTop: "20px" }}>
          <SelectButton
            value={startWith}
            options={["Columns", "Rows"]}
            onChange={(e) => setStartWith(e.value)}
            tooltip="This will determine whether to begin clearing with columns or rows."
            tooltipOptions={{ position: "top" }}
          />
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
        <InputText
          value={newCollectionName}
          onChange={(e) => setNewCollectionName(e.target.value)}
          placeholder="New clean dataset name"
          style={{ margin: "5px", fontSize: "1rem", width: "205px", marginTop: "20px" }}
        />
        <Button
          icon="pi pi-plus"
          style={{ margin: "5px", fontSize: "1rem", padding: "6px 10px", width: "150px", marginTop: "20px" }}
          onClick={() => cleanAll(false)}
          tooltip="Create Clean Dataset"
          tooltipOptions={{ position: "top" }}
        />
      </div>
      <OverlayPanel ref={op} showCloseIcon={true} dismissable={true} style={{ width: "420px", padding: "10px" }} onHide={() => setNewCollectionName("")}>
        <h4 style={{ fontSize: "0.8rem", margin: "10px 0" }}>
          Do you want to <b>overwrite</b> the dataset or <b>create a new one</b> ?
        </h4>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <Button className="p-button-danger" label="Overwrite" style={{ margin: "5px", fontSize: "0.8rem", padding: "6px 10px" }} onClick={() => cleanRowsOrColumns(true)} />
          <InputText value={newCollectionName} onChange={(e) => setNewCollectionName(e.target.value)} placeholder="Enter new collection name" style={{ margin: "5px", fontSize: "0.8rem" }} />
          <Button label="Create New" style={{ margin: "5px", fontSize: "0.8rem", padding: "6px 10px" }} onClick={() => cleanRowsOrColumns(false)} />
        </div>
      </OverlayPanel>
    </>
  )
}

export default SimpleCleaningToolsDB
