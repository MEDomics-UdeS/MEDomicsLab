import { useContext, useEffect, useState } from "react" // Ensure useState and useEffect are imported
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
import { ipcRenderer } from "electron"

/**
 * Component that renders the CreatePCA feature reduction tool
 */
const CreatePCADB = ({ currentCollection, DB, refreshData }) => {
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

  useEffect(() => {
    const fetchData = async () => {
      const collectionData = await getCollectionData(DB.name, currentCollection)
      if (collectionData && collectionData.length > 0) {
        setColumns(Object.keys(collectionData[0]))
      }
    }
    fetchData()
  }, [DB, currentCollection])

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
        databaseName: DB.name,
        collectionName: currentCollection
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
  const applyPCA = (overwrite) => {
    if (!selectedPCRow) {
      toast.error("Please select the number of principal components")
      return
    }

    let jsonToSend = {}
    jsonToSend = {
      columns: selectedColumns,
      nComponents: selectedPCRow.index,
      columnPrefix: columnPrefix,
      keepUnselectedColumns: keepUnselectedColumns,
      overwrite: overwrite,
      exportTransformation: exportTransformation,
      collectionName: currentCollection,
      databaseName: DB.name,
      newCollectionName: newCollectionName
    }
    requestBackend(port, "/input/create_pcaDB/", jsonToSend, (jsonResponse) => {
      console.log("received results:", jsonResponse)
      refreshData()
      ipcRenderer.send("get-collections", DB.name)
      toast.success("PCA applied successfully")
    })
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
            onChange={(e) => setSelectedColumns(e.value)}
            placeholder="Select columns"
            style={{ marginTop: "10px", maxWidth: "1000px" }}
            display="chip"
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
            Merge unselected columns in the result dataset &nbsp;
            <Checkbox onChange={(e) => setKeepUnselectedColumns(e.checked)} checked={keepUnselectedColumns}></Checkbox>
          </div>
          <div>
            Export transformation &nbsp;
            <Checkbox onChange={(e) => setExportTransformation(e.checked)} checked={exportTransformation}></Checkbox>
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
            enabled={selectedPCRow ? true : false}
          />
          <InputText
            value={newCollectionName}
            onChange={(e) => setNewCollectionName(e.target.value)}
            placeholder="New name"
            style={{ margin: "5px", fontSize: "1rem", width: "205px" }}
            enabled={selectedPCRow ? true : false}
          />
          <Button
            icon="pi pi-plus"
            style={{ margin: "5px", fontSize: "1rem", padding: "6px 10px", width: "100px", marginTop: "0.25rem" }}
            onClick={() => applyPCA(false)}
            tooltip="Create new collection with PCA results"
            tooltipOptions={{ position: "top" }}
            enabled={selectedPCRow ? true : false}
          />
        </div>
      </div>
    </>
  )
}

export default CreatePCADB
