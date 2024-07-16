import React, { useEffect, useState, useContext } from "react"
import { Message } from "primereact/message"
import { MultiSelect } from "primereact/multiselect"
import { getCollectionData } from "../../utils"
import { Dropdown } from "primereact/dropdown"
import { Button } from "primereact/button"
import { DataTable } from "primereact/datatable"
import { Column } from "primereact/column"
import { toast } from "react-toastify"
import { ServerConnectionContext } from "../../../serverConnection/connectionContext"
import { ipcRenderer } from "electron"
import { requestBackend } from "../../../../utilities/requests"
import { Checkbox } from "primereact/checkbox"
import { InputText } from "primereact/inputtext"
import { DataContext } from "../../../workspace/dataContext"
import { randomUUID } from "crypto"
import { MEDDataObject } from "../../../workspace/NewMedDataObject"
import { insertMEDDataObjectIfNotExists } from "../../../mongoDB/mongoDBUtils"

/**
 * Component that renders the Spearman feature reduction creation tool
 */
const SpearmanDB = ({ DB, currentCollection, refreshData }) => {
  const [selectedColumns, setSelectedColumns] = useState([])
  const [columns, setColumns] = useState([])
  const [selectedTarget, setSelectedTarget] = useState("")
  const [correlations, setCorrelations] = useState([])
  const [selectedSpearmanRows, setSelectedSpearmanRows] = useState([])
  const [keepUnselectedColumns, setKeepUnselectedColumns] = useState(false)
  const [keepTarget, setKeepTarget] = useState(false)
  const { port } = useContext(ServerConnectionContext)
  const [newCollectionName, setNewCollectionName] = useState("")
  const { globalData } = useContext(DataContext)
  const correlationsColumns = [
    { field: "index", header: "Column Name" },
    { field: "value", header: "Correlation with target" }
  ]

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
    setCorrelations([])
  }, [selectedColumns])

  useEffect(() => {
    setSelectedSpearmanRows([])
  }, [correlations])

  /**
   * @description
   * Call the server to compute eigenvalues from the selected columns on
   * the selected dataset
   */
  const computeCorrelations = () => {
    let jsonToSend = {}
    jsonToSend = {
      columns: selectedColumns,
      target: selectedTarget,
      collection: globalData[currentCollection].id,
      databaseName: "data"
    }
    requestBackend(
      port,
      "/input/compute_correlationsDB/",
      jsonToSend,
      (jsonResponse) => {
        console.log("received results:", jsonResponse)
        if (!jsonResponse.error) {
          let data = jsonResponse["correlations"]
          setCorrelations(
            Object.keys(data).map((key) => ({
              index: key,
              value: data[key]
            }))
          )
          refreshData()
          toast.success("Computation successful")
        } else {
          toast.error(`Computation failed: ${jsonResponse.error.message}`)
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
   * Call the server to compute Spearman
   * @param {Boolean} overwrite - True if the dataset should be overwritten, false otherwise
   */
  const computeSpearman = async (overwrite) => {
    const id = randomUUID()

    const object = new MEDDataObject({
      id: id,
      name: newCollectionName + "_reduced_spearman",
      type: "csv",
      parentID: "ROOT",
      childrenIDs: [],
      inWorkspace: false
    })

    let jsonToSend = {}
    jsonToSend = {
      selectedColumns: selectedColumns,
      target: selectedTarget,
      selectedSpearmanRows: selectedSpearmanRows,
      keepUnselectedColumns: keepUnselectedColumns,
      keepTarget: keepTarget,
      collection: globalData[currentCollection].id,
      databaseName: "data",
      newCollectionName: id,
      overwrite: overwrite
    }
    requestBackend(port, "/input/compute_spearmanDB/", jsonToSend, (jsonResponse) => {
      console.log("received results:", jsonResponse)
      refreshData()
    })

    if (!overwrite) {
      await insertMEDDataObjectIfNotExists(object)
      MEDDataObject.updateWorkspaceDataObject()
      toast.success("Spearman applied successfully")
    } else {
      MEDDataObject.updateWorkspaceDataObject()
      toast.success("Spearman applied successfully")
    }
  }

  return (
    <>
      <div className="margin-top-15 center">
        <div className="margin-top-15 center">
          <Message text="The Spearman tool enables you to compute correlations between columns in your data and a specified target. It also allows you to select columns to keep in your dataset based on the computed correlations." />
        </div>
        <hr></hr>
        <hr />
        <b>Select the columns you want to apply Spearman on (without target)</b>
        <div className="margin-top-15">
          <MultiSelect
            value={selectedColumns}
            options={columns.filter((col) => col !== "_id")}
            onChange={(e) => setSelectedColumns(e.value)}
            placeholder="Select columns"
            style={{ marginTop: "10px", maxWidth: "1000px" }}
            display="chip"
          />
          <hr></hr>
        </div>
        <div className="margin-top-15">
          <b>Select the target column</b>
          <div className="margin-top-15">
            {selectedColumns.length > 0 ? (
              <Dropdown value={selectedTarget} options={columns.filter((col) => col !== "_id")} onChange={(event) => setSelectedTarget(event.value)} placeholder="Select column" />
            ) : (
              <Dropdown placeholder="No columns to show" disabled />
            )}
          </div>
        </div>
        <div className="margin-top-15 center">
          <Button disabled={selectedColumns.length < 1 || !selectedTarget} onClick={computeCorrelations}>
            Compute correlations
          </Button>
        </div>
        <hr></hr>
        <div className="margin-top-15 center">
          <b>Select columns to keep</b>
          <div className="margin-top-15 maxwidth-80 mx-auto">
            <DataTable value={correlations} size={"small"} selectionMode="checkbox" selection={selectedSpearmanRows} onSelectionChange={(e) => setSelectedSpearmanRows(e.value)} paginator rows={3}>
              <Column selectionMode="multiple"></Column>
              {correlationsColumns.map((col) => (
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
          <div>
            Merge unselected columns in the result dataset &nbsp;
            <Checkbox onChange={(e) => setKeepUnselectedColumns(e.checked)} checked={keepUnselectedColumns}></Checkbox>
          </div>
          <div>
            Keep target in dataset &nbsp;
            <Checkbox onChange={(e) => setKeepTarget(e.checked)} checked={keepTarget}></Checkbox>
          </div>
        </div>
        <hr></hr>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", marginTop: "1rem" }}>
          <Button
            className="p-button-danger"
            label="Overwrite"
            style={{ margin: "5px", fontSize: "1rem", padding: "6px 10px" }}
            onClick={() => computeSpearman(true)}
            tooltip="Overwrite current collection with spearman results"
            tooltipOptions={{ position: "top" }}
          />
          <InputText value={newCollectionName} onChange={(e) => setNewCollectionName(e.target.value)} placeholder="New name" style={{ margin: "5px", fontSize: "1rem", width: "205px" }} />
          <Button
            icon="pi pi-plus"
            style={{ margin: "5px", fontSize: "1rem", padding: "6px 10px", width: "100px", marginTop: "0.25rem" }}
            onClick={() => computeSpearman(false)}
            tooltip="Create new collection with spearman results"
            tooltipOptions={{ position: "top" }}
          />
        </div>
      </div>
    </>
  )
}

export default SpearmanDB
