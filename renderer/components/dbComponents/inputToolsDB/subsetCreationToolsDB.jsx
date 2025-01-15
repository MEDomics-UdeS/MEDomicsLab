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
import { connectToMongoDB, insertMEDDataObjectIfNotExists } from "../../mongoDB/mongoDBUtils"
import { MEDDataObject } from "../../workspace/NewMedDataObject"
import { DataContext } from "../../workspace/dataContext"
import { getCollectionColumnTypes, getCollectionData } from "../utils"
import { Checkbox } from "primereact/checkbox"
import { requestBackend } from "../../../utilities/requests"
import {ServerConnectionContext} from "../../serverConnection/connectionContext";

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
  const { port } = useContext(ServerConnectionContext)
  const filterDisplay = "menu"
  const [groupName, setGroupName] = useState("")
  const [isGroupNameEnabled, setIsGroupNameEnabled] = useState(false)
  const [showInfoBox, setShowInfoBox] = useState(false)
  const [loading, setLoading] = useState(false)

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
  }

  const createNewCollectionSubset = async (newCollectionName) => {
    let collectionName = newCollectionName + ".csv";
    const id = randomUUID();
    const object = new MEDDataObject({
      id: id,
      name: collectionName,
      type: "csv",
      parentID: globalData[currentCollection].parentID,
      childrenIDs: [],
      inWorkspace: false
    });

    // Check if the collection already exists
    let exists = false;
    for (const item of Object.keys(globalData)) {
      if (globalData[item].name && globalData[item].name === collectionName) {
        exists = true;
        break;
      }
    }

    // If the collection already exists, ask the user if they want to overwrite it
    let overwriteConfirmation = true;
    if (exists) {
      overwriteConfirmation = await new Promise((resolve) => {
        confirmDialog({
          closable: false,
          message: `A dataset with the name "${collectionName}" already exists in the database. Do you want to overwrite it?`,
          header: "Confirmation",
          icon: "pi pi-exclamation-triangle",
          accept: () => resolve(true),
          reject: () => resolve(false)
        });
      });
    }
    if (!overwriteConfirmation) {
      return;
    }

    const db = await connectToMongoDB();
    const newCollection = await db.createCollection(id);
    await newCollection.insertMany(filteredData);
    await insertMEDDataObjectIfNotExists(object);
    MEDDataObject.updateWorkspaceDataObject();
    toast.success(`New subset ${collectionName} created with filtered data.`);
  };

  function createGroup(groupName) {
    let jsonToSend = {}
    jsonToSend = {
        collectionName: currentCollection,
        groupName: groupName,
        data: filteredData
    }

    setLoading(true)

    requestBackend(
        port,
        "/input/create_group_DB/",
        jsonToSend,
        async (jsonResponse) => {
          console.log("jsonResponse", jsonResponse)
          setLoading(false)
          if (jsonResponse.error) {
            if (jsonResponse.error.message) {
              console.error(jsonResponse.error.message)
              toast.error(jsonResponse.error.message)
            } else {
              console.error(jsonResponse.error)
              toast.error(jsonResponse.error)
            }
          } else {
            refreshData()
            toast.success("Group created successfully.")
          }
        }
    )

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
        <Message style={{marginBottom: "15px"}} severity="success"
                 text={`Current Collection: ${globalData[currentCollection].name}`}/>
        <Card style={{width: "900px"}}>
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
              removableSort={true}
              filters={filters}
              filterDisplay={filterDisplay}
              globalFilterFields={columns.map((col) => col.field)}
          >
            {columns.length > 0 &&
                columns.map((col) => <Column key={col} field={col.field} header={col.header} sortable={true} filter
                                             filterPlaceholder={`Search by ${col.header}`} filterField={col.field}/>)}
          </DataTable>
        </Card>

        <Row className={"card"} style={{
          display: "flex",
          justifyContent: "space-evenly",
          flexDirection: "row",
          marginTop: "0.5rem",
          backgroundColor: "transparent",
          padding: "0.5rem"
        }}>
          <h6>
            Rows selected : <b>{filteredData.length}</b>&nbsp; of &nbsp;
            <b>{data ? data.length : 0}</b>
          </h6>
        </Row>
        {showInfoBox && (
            <Message
                style={{ marginBottom: "15px", marginTop: "2rem", textAlign: "justify" }}
                severity="info"
                text="Enabling this will create a column named 'Group' in the existing dataset and assign every row in the current subset to this group. This action does not create a new subset; it simply groups the selected rows within the existing dataset by adding them to the 'Group' column."
                icon="pi pi-info-circle"
                iconPos="left"
                iconstyle={{ fontSize: "2rem" }}
            />
        )}
        <div style={{display: "flex", alignItems: "center", marginTop: "1rem"}}>
          <Checkbox
              inputId="groupNameCheckbox"
              checked={isGroupNameEnabled}
              onChange={(e) => {
                setIsGroupNameEnabled(e.checked);
                setShowInfoBox(e.checked);
                if (!e.checked) {
                  setGroupName("");
                }
              }}
              style={{marginRight: "0.5rem"}}
              tooltip={"Enable to create a group with the selected rows"}
                tooltipOptions={{position: "top"}}
          />
          <InputText
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Group Name"
              style={{margin: "5px", fontSize: "1rem", padding: "6px 10px"}}
              disabled={!isGroupNameEnabled}
          />
          <Button
              label="Create Group"
              onClick={() => {createGroup(groupName)}}
              style={{ marginLeft: "0.5rem", fontSize: "1rem", padding: "6px 10px" }}
              disabled={!isGroupNameEnabled || !groupName}
              loading={loading}
          />
        </div>
        <div style={{display: "flex", justifyContent: "center", alignItems: "center", marginTop: "1rem"}}>
          <Button
              className="p-button-danger"
              label="Overwrite"
              style={{margin: "5px", fontSize: "1rem", padding: "6px 10px"}}
              onClick={overwriteCollection}
              tooltip="Overwrite current collection with filtered data"
              tooltipOptions={{position: "top"}}
          />
          <div className="p-inputgroup w-full md:w-30rem"
               style={{margin: "10px", fontSize: "1rem", width: "230px", marginTop: "5px"}}>
            <InputText
                value={newCollectionName}
                onChange={(e) => setNewCollectionName(e.target.value)}
                placeholder="New subset name"
            />
            <span className="p-inputgroup-addon">.csv</span>
          </div>
          <Button
              icon="pi pi-plus"
              onClick={() => createNewCollectionSubset(newCollectionName)}
              tooltip="Create subset"
              tooltipOptions={{position: "top"}}
          />
        </div>
      </div>
  )
}

export default SubsetCreationToolsDB
