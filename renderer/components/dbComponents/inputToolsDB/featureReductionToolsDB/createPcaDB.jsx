/* eslint-disable no-unused-vars */
import { useContext, useEffect, useState } from "react"
import { Message } from "primereact/message"
import { MultiSelect } from "primereact/multiselect"
import { getCollectionData } from "../../utils"
import { Button } from "primereact/button"
import { requestBackend } from "../../../../utilities/requests"
import { toast } from "react-toastify"
import { ServerConnectionContext } from "../../../serverConnection/connectionContext"
import { DataTable } from "primereact/datatable"
import { Column } from "primereact/column"
import { Checkbox } from "primereact/checkbox"
import { InputText } from "primereact/inputtext"
import { DataContext } from "../../../workspace/dataContext"
import { randomUUID } from "crypto"
import { MEDDataObject } from "../../../workspace/NewMedDataObject"
import { insertMEDDataObjectIfNotExists } from "../../../mongoDB/mongoDBUtils"

/**
 * Component that renders the CreatePCA feature reduction tool
 */
const CreatePCADB = ({ currentCollection, refreshData }) => {
  const [columnPrefix, setColumnPrefix] = useState("pca")
  const [exportTransformation, setExportTransformation] = useState(false)
  const [keepUnselectedColumns, setKeepUnselectedColumns] = useState(false)
  const [selectedColumns, setSelectedColumns] = useState([])
  const [columns, setColumns] = useState([])
  const [selectedPCRow, setSelectedPCRow] = useState(null)
  const explainedVarColumns = [
    { field: "index", header: "Number of Principal Components" },
    { field: "value", header: "Explained Variance" }
  ]
  const [explainedVar, setExplainedVar] = useState([])
  const { port } = useContext(ServerConnectionContext)
  const [newCollectionName, setNewCollectionName] = useState("")
  const { globalData } = useContext(DataContext)

  useEffect(() => {
    const fetchData = async () => {
      const collectionData = await getCollectionData(currentCollection)
      if (collectionData && collectionData.length > 0) {
        setColumns(Object.keys(collectionData[0]))
      }
    }
    fetchData()
  }, [currentCollection])

  useEffect(() => {
    setSelectedPCRow(null)
  }, [explainedVar])

  useEffect(() => {
    console.log("selectedPCRow", selectedPCRow)
  }, [selectedPCRow])

  /**
   *
   * @param {String} name
   *
   * @description
   * Called when the user change the column prefix.
   *
   */
  const handleColumnPrefixChange = (name) => {
    if (name.match("^[a-zA-Z0-9_]+$") != null) {
      setColumnPrefix(name)
    }
  }

  /**
   * @description
   * Call the server to compute eigenvalues from the selected columns on
   * the selected dataset
   */
  const computeEigenvalues = () => {
    requestBackend(
      port,
      "/input/compute_eigenvaluesDB/",
      {
        columns: selectedColumns,
        databaseName: "data",
        collectionName: globalData[currentCollection].id
      },
      (jsonResponse) => {
        console.log("received results:", jsonResponse)
        if (!jsonResponse.error) {
          let data = jsonResponse["explained_var"]
          console.log("data", data)
          if (data.length > 0) {
            if (typeof data[0] != "number") {
              setExplainedVar(data.map((value, index) => ({ index: index + 1, value: value.real + "i + " + value.imaginary + "j" })))
            } else {
              setExplainedVar(data.map((value, index) => ({ index: index + 1, value })))
            }
          }
          toast.success("Eigenvalues computed successfully!")
        } else {
          toast.error(`Computation failed: ${jsonResponse.error.message}`)
          return
        }
      },
      function (err) {
        console.error(err)
        toast.error(`Computation failed: ${err}`)
      }
    )
  }

  /**
   * @description
   * Call the server to compute pca
   * @param {Boolean} overwrite - True if the dataset should be overwritten, false otherwise
   */
  const applyPCA = async (overwrite) => {
    if (!selectedPCRow) {
      toast.error("Please select the number of principal components")
      return
    }
    const id = randomUUID()
    const id2 = randomUUID()

    const object = new MEDDataObject({
      id: id,
      name: newCollectionName,
      type: "csv",
      parentID: "ROOT",
      childrenIDs: [],
      inWorkspace: false
    })

    const object2 = new MEDDataObject({
      id: id2,
      name: "PCA_Transformations_" + newCollectionName,
      type: "csv",
      parentID: "ROOT",
      childrenIDs: [],
      inWorkspace: false
    })

    let jsonToSend = {}
    jsonToSend = {
      columns: selectedColumns,
      nComponents: selectedPCRow.index,
      columnPrefix: columnPrefix,
      keepUnselectedColumns: keepUnselectedColumns,
      overwrite: overwrite,
      exportTransformation: exportTransformation,
      collectionName: globalData[currentCollection].id,
      databaseName: "data",
      newCollectionName: id,
      newPCATransformationName: id2
    }
    
    requestBackend(
      port,
      "/input/create_pcaDB/",
      jsonToSend,
      async (jsonResponse) => {
        console.log("received results:", jsonResponse)
        if (!jsonResponse.error) {
          if (exportTransformation) {
            // Creates 1 collection with the PCA transformations
            if (overwrite) {
              await insertMEDDataObjectIfNotExists(object2)
              MEDDataObject.updateWorkspaceDataObject()
              // Create 2 collections with the PCA transformations and the results with the PCA applied
            } else {
              await insertMEDDataObjectIfNotExists(object)
              await insertMEDDataObjectIfNotExists(object2)
              MEDDataObject.updateWorkspaceDataObject()
            }
          } else {
            // Creates 1 collection with the results of the PCA applied
            if (!overwrite) {
              await insertMEDDataObjectIfNotExists(object)
              MEDDataObject.updateWorkspaceDataObject()
            } else {
              MEDDataObject.updateWorkspaceDataObject()
            }
          }
          toast.success("PCA applied successfully!")
        } else {
          toast.error(`Computation failed: ${jsonResponse.error.message}`)
          return
        }
      },
      function (err) {
        console.error(err)
        toast.error(`Computation failed: ${err}`)
      }
    )
  }

  return (
    <>
      <div className="margin-top-15 center">
        <Message text="This tool enables you to perform Principal Component Analysis (PCA) on a dataset by computing the eigenvalues of the selected data and selecting a number of principal components to retain based on the eigenvalues. You can then apply the PCA transformation to your data and export it to apply it to another dataset if needed." />
      </div>
      <div className="margin-top-15 center">
        <hr />
        <b>Select the columns you want to apply PCA on</b>
        <div className="margin-top-15">
          <MultiSelect
            value={selectedColumns}
            options={columns.filter((col) => col !== "_id")}
            display="chip"
            onChange={(e) => setSelectedColumns(e.value)}
            placeholder="Select columns"
            style={{ marginTop: "10px", maxWidth: "900px" }}
          />
          <hr />
        </div>
        <div className="margin-top-15 center">
          {/* Compute eigenvalues */}
          <Button disabled={!selectedColumns} onClick={computeEigenvalues}>
            Compute eigenvalues
          </Button>
        </div>
        <hr></hr>
        <div className="margin-top-15 center">
          <b>Select the desired number of principal components</b>
          <div className="margin-top-15 maxwidth-80 mx-auto">
            <DataTable value={explainedVar} size={"small"} selectionMode="single" selection={selectedPCRow} onSelectionChange={(e) => setSelectedPCRow(e.value)} paginator rows={3}>
              {explainedVarColumns.map((col) => (
                <Column key={col.field} field={col.field} header={col.header} />
              ))}
            </DataTable>
          </div>
        </div>
        <hr></hr>
        <div className="margin-top-15 center">
          <b>Set your dataset options</b>
        </div>
        <div className="margin-top-15 flex-container-wrap">
          {/* Save data */}
          <div>
            <Checkbox onChange={(e) => setKeepUnselectedColumns(e.checked)} checked={keepUnselectedColumns}></Checkbox>
            &nbsp;Merge unselected columns in the result dataset&nbsp;
          </div>
          <div>
            <Checkbox onChange={(e) => setExportTransformation(e.checked)} checked={exportTransformation}></Checkbox>
            &nbsp;Export transformation&nbsp;
          </div>
          <div>
            {/* Text input for column names */}
            Column name prefix : &nbsp;
            <InputText value={columnPrefix} onChange={(e) => handleColumnPrefixChange(e.target.value)} />
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", marginTop: "1rem" }}>
          <Button
            className="p-button-danger"
            label="Overwrite"
            style={{ margin: "5px", fontSize: "1rem", padding: "6px 10px" }}
            onClick={() => applyPCA(true)}
            tooltip="Overwrite current collection with PCA results"
            tooltipOptions={{ position: "top" }}
            disabled={!selectedPCRow}
          />
          <InputText
            value={newCollectionName}
            onChange={(e) => setNewCollectionName(e.target.value)}
            placeholder="New name"
            style={{ margin: "5px", fontSize: "1rem", width: "205px" }}
            disabled={!selectedPCRow}
          />
          <Button
            icon="pi pi-plus"
            style={{ margin: "5px", fontSize: "1rem", padding: "6px 10px", width: "100px", marginTop: "0.25rem" }}
            onClick={() => applyPCA(false)}
            tooltip="Create new collection with PCA results"
            tooltipOptions={{ position: "top" }}
            disabled={!selectedPCRow}
          />
        </div>
      </div>
    </>
  )
}

export default CreatePCADB
