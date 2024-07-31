import { useState, useEffect, useContext } from "react"
import { Message } from "primereact/message"
import * as React from "react"
import { getCollectionData, getCollectionColumnTypes } from "../utils"
import { DataTable } from "primereact/datatable"
import { Column } from "primereact/column"
import { InputText } from "primereact/inputtext"
import { FilterMatchMode, FilterOperator } from "primereact/api"
import { Row } from "react-bootstrap"
import { Button } from "primereact/button"
import { toast } from "react-toastify"
import { connectToMongoDB } from "../../mongoDB/mongoDBUtils"
import { MEDDataObject } from "../../workspace/NewMedDataObject"
import { DataContext } from "../../workspace/dataContext"
import { randomUUID } from "crypto"
import { insertMEDDataObjectIfNotExists } from "../../mongoDB/mongoDBUtils"

/**
 * @description
 * This component provides tools to create a subset from a dataset.
 * @param {Object} props
 * @param {Function} props.refreshData - Function to refresh the data
 * @param {string} props.currentCollection - Current collection
 */
const SubsetCreationToolsDB = ({ currentCollection, refreshData }) => {
  const [data, setData] = useState([])
  const [columns, setColumns] = useState([])
  const [columnTypes, setColumnTypes] = useState({})
  const [filters, setFilters] = useState({})
  const [newCollectionName, setNewCollectionName] = useState("")
  const [filteredData, setFilteredData] = useState([])
  const { globalData } = useContext(DataContext)
  const filterDisplay = "menu"

  useEffect(() => {
    const fetchData = async () => {
      const collectionData = await getCollectionData(currentCollection)
      const formattedData = collectionData.map((row) => {
        return {
          ...row
        }
      })
      setData(formattedData)
      setFilteredData(formattedData)
      console.log(formattedData)

      const columns = Object.keys(formattedData[0])
        .filter((key) => key !== "_id")
        .map((key) => ({
          field: key,
          header: key.charAt(0).toUpperCase() + key.slice(1)
        }))
      setColumns(columns)
      console.log(columns)

      const collectionColumnTypes = await getCollectionColumnTypes(currentCollection)
      setColumnTypes(collectionColumnTypes)
      console.log(collectionColumnTypes)

      initFiltersDynamically(columns, columnTypes)
    }
    fetchData()
  }, [currentCollection])

  useEffect(() => {
    console.log("filteredData", filteredData)
  }, [filteredData])

  const initFiltersDynamically = (columns, columnTypes) => {
    columns.reduce((acc, col) => {
      const type = columnTypes[col.field]
      if (type === "string" || type === "date") {
        acc[col.field] = { operator: FilterOperator.AND, constraints: [{ value: "", matchMode: FilterMatchMode.STARTS_WITH }] }
      } else if (type === "number" || type === "integer" || type === "float" || type === "int32") {
        acc[col.field] = { operator: FilterOperator.AND, constraints: [{ value: "", matchMode: FilterMatchMode.EQUALS }] }
      }
      setFilters(acc)
    }, {})
  }

  const overwriteCollection = async () => {
    const db = await connectToMongoDB()
    const collection = db.collection(currentCollection)
    await collection.deleteMany({})
    await collection.insertMany(filteredData)
    toast.success(`Data in ${globalData[currentCollection].name} overwritten with filtered data.`)
    refreshData()
  }

  const createNewCollectionSubset = async (newCollectionName) => {
    const id = randomUUID()
    const object = new MEDDataObject({
      id: id,
      name: newCollectionName,
      type: "csv",
      parentID: "ROOT",
      childrenIDs: [],
      inWorkspace: false
    })
    const db = await connectToMongoDB()
    const collections = await db.listCollections().toArray()
    const collectionExists = collections.some((collection) => collection.name === id)

    if (collectionExists) {
      toast.warn(`A subset with the name ${globalData[id].name} already exists.`)
      return
    }

    const newCollection = await db.createCollection(id)
    await newCollection.insertMany(filteredData)
    await insertMEDDataObjectIfNotExists(object)
    MEDDataObject.updateWorkspaceDataObject()
    toast.success(`New subset ${newCollectionName} created with filtered data.`)
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
      <Message style={{ marginBottom: "15px" }} severity="success" text={`Current Collection: ${globalData[currentCollection].name}`} />
      <DataTable
        onValueChange={(e) => {
          setFilteredData(e)
        }}
        className="p-datatable-striped p-datatable-gridlines"
        value={data}
        paginator={true}
        rows={5}
        rowsPerPageOptions={[5, 10, 15, 20]}
        size={"small"}
        removableSort={true}
        filters={filters}
        filterDisplay={filterDisplay}
        globalFilterFields={columns.map((col) => col.field)}
      >
        {columns.length > 0 &&
          columns.map((col) => <Column key={col} field={col.field} header={col.header} sortable={true} filter filterPlaceholder={`Search by ${col.header}`} filterField={col.field} />)}
      </DataTable>

      <Row className={"card"} style={{ display: "flex", justifyContent: "space-evenly", flexDirection: "row", marginTop: "0.5rem", backgroundColor: "transparent", padding: "0.5rem" }}>
        <h6>
          Rows selected : <b>{filteredData.length}</b>&nbsp; of &nbsp;
          <b>{data ? data.length : 0}</b>
        </h6>
      </Row>
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", marginTop: "1rem" }}>
        <Button
          className="p-button-danger"
          label="Overwrite"
          style={{ margin: "5px", fontSize: "1rem", padding: "6px 10px" }}
          onClick={overwriteCollection}
          tooltip="Overwrite current collection with filtered data"
          tooltipOptions={{ position: "top" }}
        />
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
