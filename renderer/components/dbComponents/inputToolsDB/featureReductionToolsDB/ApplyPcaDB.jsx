import React, { useEffect, useState, useContext } from "react"
import { Message } from "primereact/message"
import { Dropdown } from "primereact/dropdown"
import { MultiSelect } from "primereact/multiselect"
import { getCollectionData } from "../../utils"
import { Checkbox } from "primereact/checkbox"
import { Button } from "primereact/button"
import { InputText } from "primereact/inputtext"
import { toast } from "react-toastify"
import { requestBackend } from "../../../../utilities/requests"
import { ServerConnectionContext } from "../../../serverConnection/connectionContext"
import { MEDDataObject } from "../../../workspace/NewMedDataObject"
import { insertMEDDataObjectIfNotExists } from "../../../mongoDB/mongoDBUtils"
import { randomUUID } from "crypto"
import { DataContext } from "../../../workspace/dataContext"

const ApplyPCADB = ({ currentCollection, refreshData }) => {
  const { globalData } = useContext(DataContext)
  const [transformationCollection, setTransformationSelected] = useState("")
  const [collections, setCollections] = useState([])
  const [selectedColumns, setSelectedColumns] = useState([])
  const [columns, setColumns] = useState([])
  const [numOfCoefficients, setNumOfCoefficients] = useState(0)
  const [keepUnselectedColumns, setKeepUnselectedColumns] = useState(false)
  const [newCollectionName, setNewCollectionName] = useState("")
  const { port } = useContext(ServerConnectionContext)

  useEffect(() => {
    console.log("selectedColumns", selectedColumns.length)
  }, [selectedColumns])

  useEffect(() => {
    console.log("setNumOfCoefficients", numOfCoefficients)
  }, [numOfCoefficients])

  useEffect(() => {
    const fetchData = async () => {
      if (transformationCollection) {
        try {
          const collectionData2 = await getCollectionData(transformationCollection)
          if (collectionData2) {
            let count = 0
            for (let i = 0; i < collectionData2.length; i++) {
              count++
            }
            setNumOfCoefficients(count)
            return
          }
        } catch (error) {
          console.error("Error fetching collection data:", error)
        }
      }
    }

    fetchData()
  }, [transformationCollection, getCollectionData])

  useEffect(() => {
    async function getCollections() {
      try {
        const allEntries = Object.values(globalData)
        const csvEntries = allEntries.filter((entry) => entry.type === "csv")
        const newOptions = csvEntries.map(({ id, name }) => ({
          label: name,
          value: id
        }))
        let filteredCollections = newOptions.filter((collection) => collection.label.toLowerCase().includes("pca_transformations"))
        setCollections(filteredCollections)
      } catch (error) {
        console.error("Error fetching collections:", error)
      }
    }

    getCollections()
  }, [])

  useEffect(() => {
    const fetchData = async () => {
      const collectionData = await getCollectionData(currentCollection)
      if (collectionData && collectionData.length > 0) {
        setColumns(Object.keys(collectionData[0]))
      }
    }
    fetchData()
  }, [currentCollection])

  /**
   * @description
   * Call the server to compute pca
   * @param {Boolean} overwrite - True if the dataset should be overwritten, false otherwise
   */
  const computePCA = async (overwrite) => {
    const id = randomUUID()
    const object = new MEDDataObject({
      id: id,
      name: newCollectionName + "_reduced_features",
      type: "csv",
      parentID: "ROOT",
      childrenIDs: [],
      inWorkspace: false
    })

    let jsonToSend = {}
    jsonToSend = {
      columns: selectedColumns,
      keepUnselectedColumns: keepUnselectedColumns,
      overwrite: overwrite,
      collectionName: globalData[currentCollection].id,
      databaseName: "data",
      newCollectionName: id,
      transformationCollection: transformationCollection
    }

    // Send the request to the backend
    requestBackend(
      port,
      "/input/apply_pcaDB/",
      jsonToSend,
      async (jsonResponse) => {
        console.log("jsonResponse", jsonResponse)
        if (jsonResponse.error) {
          if (jsonResponse.error.message) {
            console.error(jsonResponse.error.message)
            toast.error(jsonResponse.error.message)
          } else {
            console.error(jsonResponse.error)
            toast.error(jsonResponse.error)
          }
        } else {
          if (!overwrite) {
            await insertMEDDataObjectIfNotExists(object)
            MEDDataObject.updateWorkspaceDataObject()
          } else {
            MEDDataObject.updateWorkspaceDataObject()
          }
          toast.success("PCA applied successfully")
        }
      },
      (error) => {
        console.log(error)
        toast.error("Error applying PCA" + error)
      }
    )
  }

  return (
    <>
      <div className="margin-top-15 center">
        <Message text="This tool enables you to perform Principal Component Analysis (PCA) on your selected data using an existing PCA transformation (which you can create using the Create PCA tool)." />
      </div>
      <hr></hr>
      <div className="margin-top-15 center">
        <b>Select the transformation you want to apply</b>
        <div className="margin-top-15">
          <Dropdown value={transformationCollection} options={collections} onChange={(e) => setTransformationSelected(e.value)} placeholder="Select a transformation collection" />
        </div>
      </div>
      <hr></hr>
      <div className="margin-top-15 center">
        <b>Select the columns you want to apply PCA on</b>
        <div className="margin-top-15">
          <MultiSelect
            className="maxwidth-80"
            display="chip"
            value={selectedColumns}
            onChange={(e) => setSelectedColumns(e.value)}
            options={columns.filter((col) => col !== "_id")}
            placeholder="Select columns"
            style={{ maxWidth: "800px" }}
          />
        </div>
        <div className="margin-top-15 center">
          {selectedColumns.length > 0 && numOfCoefficients > 0 && selectedColumns.length !== numOfCoefficients && (
            <Message severity="warn" text="The number of selected columns doesn't match the number of coefficients in the transformation" />
          )}
        </div>
      </div>
      <hr></hr>
      <div className="margin-top-15 center">
        <b>Set your dataset options</b>
      </div>
      <div className="margin-top-15 flex-container-wrap">
        <div>
          Merge unselected columns in the result dataset &nbsp;
          <Checkbox onChange={(e) => setKeepUnselectedColumns(e.checked)} checked={keepUnselectedColumns}></Checkbox>
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", marginTop: "1rem" }}>
        <Button
          className="p-button-danger"
          label="Overwrite"
          style={{ margin: "5px", fontSize: "1rem", padding: "6px 10px" }}
          onClick={() => computePCA(true)}
          tooltip="Overwrite current collection with PCA results"
          tooltipOptions={{ position: "top" }}
        />
        <InputText value={newCollectionName} onChange={(e) => setNewCollectionName(e.target.value)} placeholder="New name" style={{ margin: "5px", fontSize: "1rem", width: "205px" }} />
        <Button
          icon="pi pi-plus"
          style={{ margin: "5px", fontSize: "1rem", padding: "6px 10px", width: "100px", marginTop: "0.25rem" }}
          onClick={() => computePCA(false)}
          tooltip="Create new collection with PCA results"
          tooltipOptions={{ position: "top" }}
        />
      </div>
    </>
  )
}

export default ApplyPCADB
