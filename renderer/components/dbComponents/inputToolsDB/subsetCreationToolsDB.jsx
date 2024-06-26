import { useState, useEffect } from "react"
import { Message } from "primereact/message"
import * as React from "react"
import { getCollectionData, getCollectionColumnTypes } from "../utils"
import { DataTable } from "primereact/datatable"
import { Column } from "primereact/column"
import { InputText } from "primereact/inputtext"
import { InputNumber } from "primereact/inputnumber"
import { MultiSelect } from "primereact/multiselect"
import { FilterMatchMode, FilterOperator } from "primereact/api"
import { Row } from "react-bootstrap"
import { Button } from "primereact/button"

const SubsetCreationToolsDB = ({ DB, currentCollection }) => {
  const [data, setData] = useState([])
  const [columns, setColumns] = useState([])
  const [columnTypes, setColumnTypes] = useState({})
  const [filters, setFilters] = useState({})
  const [newCollectionName, setNewCollectionName] = useState("")
  const filterDisplay = "menu"

  const initFilters = () => {
    let newFilters = {}
    newFilters["global"] = { value: "", matchMode: "contains" }

    Object.keys(columnTypes).forEach((column) => {
      if (columnTypes[column] === "category") {
        newFilters[column] = { value: "", matchMode: FilterMatchMode.IN }
      } else if (columnTypes[column] === "int32" || columnTypes[column] === "float32") {
        newFilters[column] = { operator: FilterOperator.AND, constraints: [{ value: "", matchMode: FilterMatchMode.EQUALS }] }
      } else if (columnTypes[column] === "string") {
        newFilters[column] = { operator: FilterOperator.AND, constraints: [{ value: "", matchMode: FilterMatchMode.STARTS_WITH }] }
      }
    })

    setFilters(newFilters)
  }

  const categoryFilterTemplate = (options) => {
    return <MultiSelect />
  }

  const numberFilterTemplate = (options) => {
    return <InputNumber />
  }

  const stringFilterTemplate = (options) => {
    return <InputText />
  }

  const filterTemplateRenderer = (column) => {
    const columnType = columnTypes[column]
    console.log(columnType)

    if (columnType === "category") {
      return categoryFilterTemplate
    } else if (columnType === "int32" || columnType === "float32") {
      return numberFilterTemplate
    } else if (columnType === "string" || columnType === "date") {
      return stringFilterTemplate
    }
  }

  useEffect(() => {
    initFilters()
  }, [columnTypes])

  useEffect(() => {
    const fetchData = async () => {
      const collectionData = await getCollectionData(DB.name, currentCollection)
      const formattedData = collectionData.map((row, index) => {
        return {
          ...row
        }
      })
      setData(formattedData)
      console.log(formattedData)

      const columns = Object.keys(formattedData[0])
        .filter((key) => key !== "_id")
        .map((key) => ({
          field: key,
          header: key.charAt(0).toUpperCase() + key.slice(1)
        }))
      setColumns(columns)
      console.log(columns)

      const collectionColumnTypes = await getCollectionColumnTypes(DB.name, currentCollection)
      setColumnTypes(collectionColumnTypes)
      console.log(collectionColumnTypes)
    }

    fetchData()
  }, [DB, currentCollection])

  const overwriteCollection = async () => {
    // todo: overwrite collection with new data with the filters applied
  }

  const createNewCollectionSubset = async (newCollectionName) => {
    // todo: create new collection with the subset of data with the filters applied
  }

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
      <Message
        className="margin-top-15 margin-bottom-15 center"
        severity="info"
        text="The Subset Creation tool enables the creation of a subset of rows from a dataset by applying filters to columns."
      />
      <Message className="margin-top-15 margin-bottom-15 center" severity="success" text={`Current Collection: ${currentCollection}`} />
      <DataTable className="p-datatable-striped p-datatable-gridlines" value={data} paginator rows={5} filters={filters} filterDisplay={filterDisplay} size={"small"}>
        {columns.map((col) => (
          <Column key={col.field} field={col.field} header={col.header} sortable filter filterElement={filterTemplateRenderer(col.field)} filterPlaceholder={`Search by ${col}`} />
        ))}
      </DataTable>
      <Row
        className={"card"}
        style={{
          display: "flex",
          justifyContent: "space-evenly",
          flexDirection: "row",
          marginTop: "1rem",
          backgroundColor: "transparent",
          padding: "0.5rem"
        }}
      >
        <h6>
          Rows selected : <b>{data.length}</b>&nbsp; of &nbsp;
          <b>{data ? data.length : 0}</b>
        </h6>
      </Row>
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", marginTop: "1rem" }}>
        <Button className="p-button-danger" label="Overwrite" style={{ margin: "5px", fontSize: "1rem", padding: "6px 10px" }} onClick={() => overwriteCollection} />
        <InputText value={newCollectionName} onChange={(e) => setNewCollectionName(e.target.value)} placeholder="New subset name" style={{ margin: "5px", fontSize: "1rem", width: "205px" }} />
        <Button
          icon="pi pi-plus"
          style={{ margin: "5px", fontSize: "1rem", padding: "6px 10px", width: "100px", marginTop: "0.25rem" }}
          onClick={() => createNewCollectionSubset(newCollectionName)}
          tooltip="Create subset"
          tooltipOptions={{ position: "top" }}
        />
      </div>
    </div>
  )
}

export default SubsetCreationToolsDB
