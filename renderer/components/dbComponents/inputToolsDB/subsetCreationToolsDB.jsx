/* eslint-disable no-unused-vars */
import { randomUUID } from "crypto"
import { FilterMatchMode, FilterOperator } from "primereact/api"
import { Button } from "primereact/button"
import { Card } from "primereact/card"
import { Column } from "primereact/column"
import { confirmDialog } from "primereact/confirmdialog"
import { DataTable } from "primereact/datatable"
import { InputText } from "primereact/inputtext"
import { Message } from "primereact/message"
import * as React from "react"
import { useContext, useEffect, useState } from "react"
import { Row } from "react-bootstrap"
import { toast } from "react-toastify"
import { insertMEDDataObjectIfNotExists, connectToMongoDB } from "../../mongoDB/mongoDBUtils"
import { MEDDataObject } from "../../workspace/NewMedDataObject"
import { DataContext } from "../../workspace/dataContext"
import { getCollectionColumnTypes, getCollectionData } from "../utils"
import { ServerConnectionContext } from "../../serverConnection/connectionContext"
import { requestBackend } from "../../../utilities/requests"
import { getCollectionColumns } from "../../mongoDB/mongoDBUtils"

// the python script command send by CLI when i do requestbacked with alot of filtered data is not working
// I need to fix this issue by sending the query instead of the full filtered data.

/**
 * @description
 * This component provides tools to create a subset from a dataset.
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
  const [loadingData, setLoadingData] = useState(false)
  const [loadingButtonOverwrite, setLoadingButtonOverwrite] = useState(false)
  const [loadingButtonNewCollection, setLoadingButtonNewCollection] = useState(false)
  const { port } = useContext(ServerConnectionContext)

  // THIS IS COMMENTED FOR NOW BECAUSE IT DOESN'T FOR HUGE CSV FILES WITH ALOT OF COLUMNS.. Python
  // can't seem to return the data, it's always undefined for big big big files.
  // Fetches the data from the current collection in the backend directly.
  // Returns the data and columns of the current collection. This is called everytime you open the tool.
  // useEffect(() => {
  //   const fetchData = async () => {
  //     const jsonToSend = {}
  //     jsonToSend["collection"] = currentCollection
  //     jsonToSend["database_name"] = "data"

  //     setLoadingData(true)

  //     const response = await requestBackend(
  //       port,
  //       "/input/get_subset_data/",
  //       jsonToSend,
  //       async (response) => {
  //         setLoadingData(false)
  //         if (!response || !response.data) {
  //           console.error("Received an invalid response", response)
  //           return
  //         }
  //         setData(response.data)
  //         setColumns(response.columns)
  //         const collectionColumnTypes = await getCollectionColumnTypes(currentCollection)
  //         setColumnTypes(collectionColumnTypes)
  //         initFiltersDynamically(response.columns, collectionColumnTypes)
  //       },
  //       (error) => {
  //         setLoadingData(false)
  //         console.error("Failed to fetch missing values data:", error)
  //       }
  //     )
  //   }
  //   fetchData()
  // }, [currentCollection])

  // For some reason this works even on big files with ALOT of columns, so i will use this for now.
  // Returns the data and columns of the current collection. This is called every time you open the tool.
  useEffect(() => {
    const fetchData = async () => {
      setLoadingData(true)
      const collectionData = await getCollectionData(currentCollection)
      const formattedData = collectionData.map((row) => {
        return {
          ...row
        }
      })
      const collectionColumnTypes = await getCollectionColumnTypes(currentCollection)
      setData(formattedData)
      setFilteredData(formattedData)
      const columns = Object.keys(formattedData[0])
        .filter((key) => key !== "_id")
        .map((key) => ({
          field: key,
          header: key.charAt(0).toUpperCase() + key.slice(1)
        }))
      setColumns(columns)
      setColumnTypes(collectionColumnTypes)
      initFiltersDynamically(columns, columnTypes)
      setLoadingData(false)
    }
    fetchData()
  }, [currentCollection])

  useEffect(() => {
    console.log("filteredData", filteredData)
  }, [filteredData])

  // Initializes the filters dynamically based on the column types
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

  // Overwrites the current collection with the filtered data
  const overwriteCollection = async () => {
    /**
     * COMMENTED FOR NOW BECAUSE THE CLI LIMIT ON WINDOWS IS NOT WORKING
     */
    /*let jsonToSend = {}
    jsonToSend["collection"] = currentCollection
    jsonToSend["database_name"] = "data"
    jsonToSend["data"] = filteredData

    setLoadingButtonOverwrite(true)

    requestBackend(
      port,
      "/input/overwrite_collection/",
      jsonToSend,
      (response) => {
        setLoadingButtonOverwrite(false)
        toast.success(`Data in ${globalData[currentCollection].name} overwritten with filtered data.`)
      },
      (error) => {
        setLoadingButtonOverwrite(false)
        toast.error("Failed to overwrite collection.")
        console.error("Failed to overwrite collection:", error)
      }
    )*/

    // THIS METHOD IS NOT OPTIMAL BUT IT IS WORKING FOR BIG FILES TOO BECAUSE
    // THE FILTERED DATA IS LOADED IN THE BACKEND, SO NO CLIENT-SIDE LOADING
    try {
      setLoadingButtonOverwrite(true)
      const db = await connectToMongoDB()
      const collection = db.collection(currentCollection)
      await collection.deleteMany({})
      await collection.insertMany(filteredData)
      toast.success(`${globalData[currentCollection].name} overwritten with filtered data.`)
      setLoadingButtonOverwrite(false)
    } catch (error) {
      setLoadingButtonOverwrite(false)
      toast.error("Failed to overwrite collection")
      console.error("Failed to overwrite collection:", error)
    }
  }

  // Creates a new collection subset with the filtered data
  const createNewCollectionSubset = async (newCollectionName) => {
    let collectionName = newCollectionName + ".csv"
    const id = randomUUID()
    const object = new MEDDataObject({
      id: id,
      name: collectionName,
      type: "csv",
      parentID: globalData[currentCollection].parentID,
      childrenIDs: [],
      inWorkspace: false
    })

    // Check if the collection already exists
    let exists = false
    for (const item of Object.keys(globalData)) {
      if (globalData[item].name && globalData[item].name === collectionName) {
        exists = true
        break
      }
    }

    // If the collection already exists, ask the user if they want to overwrite it
    let overwriteConfirmation = true
    if (exists) {
      overwriteConfirmation = await new Promise((resolve) => {
        confirmDialog({
          closable: false,
          message: `A dataset with the name "${collectionName}" already exists in the database. Do you want to overwrite it?`,
          header: "Confirmation",
          icon: "pi pi-exclamation-triangle",
          accept: () => resolve(true),
          reject: () => resolve(false)
        })
      })
    }
    if (!overwriteConfirmation) {
      return
    }

    /**
     * COMMENTED FOR NOW BECAUSE THE CLI LIMIT ON WINDOWS IS NOT WORKING
     */

    /*let jsonToSend = {}
    jsonToSend["collection"] = currentCollection
    jsonToSend["database_name"] = "data"
    jsonToSend["new_collection_name"] = id
    jsonToSend["data"] = filteredData

    setLoadingButtonNewCollection(true)

    requestBackend(
      port,
      "/input/create_new_collection/",
      jsonToSend,
      (response) => {
        setLoadingButtonNewCollection(false)
        insertMEDDataObjectIfNotExists(object)
        MEDDataObject.updateWorkspaceDataObject()
        toast.success(`New subset ${collectionName} created with filtered data.`)
      },
      (error) => {
        setLoadingButtonNewCollection(false)
        toast.error("Failed to create new collection")
        console.error("Failed to create new collection:", error)
      }
    )*/

    // THIS METHOD IS NOT OPTIMAL BUT IT IS WORKING FOR BIG FILES TOO BECAUSE
    // THE FILTERED DATA IS LOADED IN THE BACKEND, SO NO CLIENT-SIDE LOADING
    try {
      setLoadingButtonNewCollection(true)
      const db = await connectToMongoDB()
      const collection = db.collection(id)
      await collection.insertMany(filteredData)
      insertMEDDataObjectIfNotExists(object)
      MEDDataObject.updateWorkspaceDataObject()
      toast.success(`New subset ${collectionName} created with filtered data.`)
      setLoadingButtonNewCollection(false)
    } catch (error) {
      toast.error("Failed to create new collection")
      console.error("Failed to create new collection:", error)
    }
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
      <Card style={{ width: "900px" }}>
        <DataTable
          onValueChange={(e) => {
            setFilteredData(e)
          }}
          className="p-datatable-striped p-datatable-gridlines"
          value={data}
          paginator={true}
          rows={7}
          rowsPerPageOptions={[5, 10, 15, 20]}
          size={"small"}
          loading={loadingData}
          removableSort={true}
          filters={filters}
          filterDisplay={filterDisplay}
          globalFilterFields={columns.map((col) => col.field)}
        >
          {columns.length > 0 &&
            columns.map((col) => <Column key={col} field={col.field} header={col.header} sortable={true} filter filterPlaceholder={`Search by ${col.header}`} filterField={col.field} />)}
        </DataTable>
      </Card>

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
          loading={loadingButtonOverwrite}
        />
        <div className="p-inputgroup w-full md:w-30rem" style={{ margin: "10px", fontSize: "1rem", width: "230px", marginTop: "5px" }}>
          <InputText value={newCollectionName} onChange={(e) => setNewCollectionName(e.target.value)} placeholder="New subset name" />
          <span className="p-inputgroup-addon">.csv</span>
        </div>
        <Button loading={loadingButtonNewCollection} icon="pi pi-plus" onClick={() => createNewCollectionSubset(newCollectionName)} tooltip="Create subset" tooltipOptions={{ position: "top" }} />
      </div>
    </div>
  )
}

export default SubsetCreationToolsDB
