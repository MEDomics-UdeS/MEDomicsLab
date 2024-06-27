import React, { useContext, useEffect, useState } from "react"
import { Checkbox } from "primereact/checkbox"
import { MultiSelect } from "primereact/multiselect"
import { Message } from "primereact/message"
import { getCollectionData } from "../utils"
import { InputNumber } from "primereact/inputnumber"
import { ipcRenderer } from "electron"
import { Slider } from "primereact/slider"
import { Dropdown } from "primereact/dropdown"
import { InputText } from "primereact/inputtext"
import { Button } from "primereact/button"
import { requestBackend } from "../../../utilities/requests"
import { ServerConnectionContext } from "../../serverConnection/connectionContext"
import { toast } from "react-toastify"

const HoldoutSetCreationToolsDB = ({ refreshData, data, collection, currentCollection }) => {
  const [shuffle, setShuffle] = useState(false)
  const [stratify, setStratify] = useState(false)
  const [selectedColumns, setSelectedColumns] = useState([])
  const [columns, setColumns] = useState([])
  const [seed, setSeed] = useState(54288)
  const [holdoutSetSize, setHoldoutSetSize] = useState(20)
  const [cleaningOption, setCleaningOption] = useState("drop")
  const cleaningOptions = ["drop", "random fill", "mean fill", "median fill", "mode fill", "bfill", "ffill"]
  const [newCollectionName, setNewCollectionName] = useState("")
  const { port } = useContext(ServerConnectionContext)

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
    ipcRenderer.invoke("get-settings").then((receivedSettings) => {
      console.log("received settings", receivedSettings)
      if (receivedSettings?.seed) {
        setSeed(receivedSettings?.seed)
      }
    })
  }, [])

  /**
   * Function to create the holdout set, send the request to the backend
   * @returns {Void}
   * @async
   */
  const createHoldoutSet = async () => {
    let JSONToSend = {}
    JSONToSend = {
      databaseName: "data",
      collectionName: currentCollection,
      name: newCollectionName,
      holdoutSetSize: holdoutSetSize,
      shuffle: shuffle,
      stratify: stratify,
      columnsToStratifyWith: selectedColumns,
      nanMethod: cleaningOption,
      randomState: seed
    }
    requestBackend(port, "/input/create_holdout_set_DB/", JSONToSend, (jsonResponse) => {
      console.log("jsonResponse", jsonResponse)
      refreshData()
      //ipcRenderer.send("get-collections", DB.name)
      toast.success("Holdout and learning sets created successfully.")
    })
  }

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "5px"
      }}
    >
      <div style={{ textAlign: "center", marginBottom: "10px" }}>
        <Message
          content={
            <div>
              <i className="pi pi-info-circle" />
              &nbsp; The Holdout Set Creation tool serves as a visual representation of the{" "}
              <i>
                <a href="https://scikit-learn.org/stable/modules/generated/sklearn.model_selection.train_test_split.html" target="_blank">
                  scikit-learn Python package's model_selection train_test_split function
                </a>
              </i>
              . This tool will create a folder containing your holdout and learning sets.
            </div>
          }
        />
        <Message severity="success" text={`Current collection: ${currentCollection}`} style={{ marginTop: "10px" }} />
        <div style={{ marginTop: "10px", marginLeft: "80px" }}>
          <div style={{ marginTop: "10px", display: "flex", justifyContent: "center", marginRight: "70px", alignItems: "center" }}>
            <Checkbox
              inputId="shuffle"
              checked={shuffle}
              onChange={(e) => {
                setShuffle(e.checked)
                if (!e.checked) {
                  setSelectedColumns([])
                  setStratify(false)
                }
              }}
              style={{ marginLeft: "30px" }}
            />
            <label htmlFor="shuffle" style={{ marginLeft: "8px" }}>
              Shuffle
            </label>
            <Checkbox
              inputId="stratify"
              checked={stratify}
              onChange={(e) => {
                setStratify(e.checked)
                if (!e.checked) {
                  setSelectedColumns([])
                }
              }}
              disabled={!shuffle}
              style={{ marginLeft: "30px" }}
            />
            <label htmlFor="stratify" style={{ marginLeft: "8px" }}>
              Stratify
            </label>
            <MultiSelect
              value={selectedColumns}
              options={columns.filter((col) => col !== "_id")}
              onChange={(e) => setSelectedColumns(e.value)}
              placeholder="Select Columns"
              disabled={!(shuffle && stratify)}
              style={{ marginLeft: "30px", marginTop: "10px" }}
            />
          </div>
          <div style={{ marginTop: "10px", display: "flex", justifyContent: "center", marginRight: "70px", alignItems: "center" }}>
            <InputNumber
              value={seed}
              inputId="seed"
              onChange={(e) => {
                setSeed(e.value)
              }}
              mode="decimal"
              showButtons
              min={0}
              max={100000}
              size={6}
              tooltip="Seed for random number generation."
              tooltipOptions={{ position: "top" }}
              style={{ marginRight: "1em", flex: "1 1 auto", width: "1px" }}
            />
            <Slider
              className="custom-slider holdout-slider"
              value={holdoutSetSize}
              style={{ marginRight: "1em", flex: "2 1 auto" }}
              onChange={(e) => {
                setHoldoutSetSize(e.value)
              }}
            />
            <InputNumber
              prefix="% "
              inputId="minmax-buttons"
              value={holdoutSetSize}
              onValueChange={(e) => {
                setHoldoutSetSize(e.value)
              }}
              mode="decimal"
              showButtons
              min={0}
              max={100}
              size={5}
              tooltip="Holdout set size (%)."
              tooltipOptions={{ position: "top" }}
              style={{ flex: "1 1 auto", width: "1px" }}
            />
          </div>
          <div style={{ marginTop: "10px", justifyContent: "center", marginRight: "70px" }}>
            <Dropdown
              value={cleaningOption}
              options={cleaningOptions}
              onChange={(e) => setCleaningOption(e.value)}
              tooltip="Empty cells cleaning method. Only applies to the stratified columns."
              tooltipOptions={{ position: "top" }}
              style={{ margin: "10px" }}
            />
            <InputText
              value={newCollectionName}
              onChange={(e) => setNewCollectionName(e.target.value)}
              placeholder="Holdout set name"
              style={{
                margin: "10px",
                fontSize: "1rem",
                width: "160px",
                marginTop: "20px"
              }}
            />
            <Button
              icon="pi pi-plus"
              style={{ margin: "10px", fontSize: "1rem", marginTop: "20px" }}
              onClick={() => {
                createHoldoutSet()
              }}
              tooltip="Create holdout set "
              tooltipOptions={{ position: "top" }}
              disabled={newCollectionName === ""}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default HoldoutSetCreationToolsDB
