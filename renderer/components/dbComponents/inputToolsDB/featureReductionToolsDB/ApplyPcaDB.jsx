import React, { useEffect, useState, useContext } from "react"
import { Message } from "primereact/message"
import { Dropdown } from "primereact/dropdown"
import { ipcRenderer } from "electron"
import { MultiSelect } from "primereact/multiselect"
import { getCollectionData } from "../../utils"
import { Checkbox } from "primereact/checkbox"
import { Button } from "primereact/button"
import { InputText } from "primereact/inputtext"
import { toast } from "react-toastify"
import { requestBackend } from "../../../../utilities/requests"
import { ServerConnectionContext } from "../../../serverConnection/connectionContext"

const ApplyPCADB = ({ DB, currentCollection, refreshData }) => {
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
          const collectionData2 = await getCollectionData(DB.name, transformationCollection)
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
  }, [transformationCollection, DB.name, getCollectionData])

  useEffect(() => {
    async function getCollections() {
      try {
        let collections = await ipcRenderer.invoke("get-collections-list", DB.name)
        let filteredCollections = collections.filter((collection) => collection.includes("pca_transformations_"))
        setCollections(filteredCollections)
        console.log("collections", collections)
      } catch (error) {
        console.error("Error fetching collections:", error)
      }
    }

    getCollections()
  }, [DB.name])

  useEffect(() => {
    const fetchData = async () => {
      const collectionData = await getCollectionData(DB.name, currentCollection)
      if (collectionData && collectionData.length > 0) {
        setColumns(Object.keys(collectionData[0]))
      }
    }
    fetchData()
  }, [DB, currentCollection])

  /**
   * @description
   * Call the server to compute pca
   * @param {Boolean} overwrite - True if the dataset should be overwritten, false otherwise
   */
  const computePCA = (overwrite) => {
    let jsonToSend = {}
    jsonToSend = {
      columns: selectedColumns,
      keepUnselectedColumns: keepUnselectedColumns,
      overwrite: overwrite,
      collectionName: currentCollection,
      databaseName: DB.name,
      newCollectionName: newCollectionName,
      transformationCollection: transformationCollection
    }
    requestBackend(port, "/input/apply_pcaDB/", jsonToSend, (jsonResponse) => {
      console.log("received results:", jsonResponse)
      refreshData()
      ipcRenderer.send("get-collections", DB.name)
      toast.success("PCA applied successfully")
    })
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
            style={{ maxWidth: "1000px" }}
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
