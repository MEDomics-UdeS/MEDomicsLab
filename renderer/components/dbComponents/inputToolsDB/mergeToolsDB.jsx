import React, { useState, useEffect, useContext } from "react"
import { MultiSelect } from "primereact/multiselect"
import { Button } from "primereact/button"
import { toast } from "react-toastify"
import { getCollectionData } from "../utils"
import { Dropdown } from "primereact/dropdown"
import { Message } from "primereact/message"
import { DataContext } from "../../workspace/dataContext"
import { requestBackend } from "../../../utilities/requests"
import { ServerConnectionContext } from "../../serverConnection/connectionContext"
import { MEDDataObject } from "../../workspace/NewMedDataObject"
import { insertMEDDataObjectIfNotExists } from "../../mongoDB/mongoDBUtils"
import { randomUUID } from "crypto"

/**
 * @description MergeToolsDB component
 * This component provides tools to merge two collections in a database.
 * @param {[collections]} - Array of collections
 * @param {currentCollection} - Current collection
 */
const MergeToolsDB = ({ currentCollection }) => {
  const { globalData } = useContext(DataContext)
  const [selectedCollections, setSelectedCollections] = useState([currentCollection])
  const [selectedColumns, setSelectedColumns] = useState([])
  const [collectionColumns, setCollectionColumns] = useState([])
  const [selectedMergeType, setSelectedMergeType] = useState("")
  const [options, setOptions] = useState([])
  const { port } = useContext(ServerConnectionContext)
  const mergeTypes = [
    { value: "left", label: "Left" },
    { value: "right", label: "Right" },
    { value: "inner", label: "Inner" },
    { value: "outer", label: "Outer" },
    { value: "cross", label: "Cross" }
  ]

  useEffect(() => {
    const fetchData = async () => {
      try {
        const allEntries = Object.values(globalData)
        const csvEntries = allEntries.filter((entry) => entry.type === "csv")
        const newOptions = csvEntries.map(({ id, name }) => ({
          label: name,
          value: id
        }))
        setOptions(newOptions)

        if (selectedCollections.length === 2) {
          const data1 = await getCollectionData(selectedCollections[0])
          const data2 = await getCollectionData(selectedCollections[1])
          const columns1 = Object.keys(data1[0])
          const columns2 = Object.keys(data2[0])
          const matchingColumns = columns1.filter((column) => columns2.includes(column) && column !== "_id")
          setCollectionColumns(matchingColumns)
          if (matchingColumns.length === 0) {
            setSelectedColumns([])
          }
        }
      } catch (error) {
        console.error("Failed to fetch collection data:", error)
        toast.error("Failed to fetch collection data.")
      }
    }

    fetchData()
  }, [globalData, selectedCollections])

  const handleSelectChange = (newSelection) => {
    if (newSelection.length < selectedCollections.length) {
      setCollectionColumns([])
    }
    if (!newSelection.includes(currentCollection)) {
      newSelection.push(currentCollection)
    }
    if (newSelection.length > 2) {
      const lastSelected = newSelection.find((item) => item !== currentCollection)
      setSelectedCollections([currentCollection, lastSelected])
    } else {
      setSelectedCollections(newSelection)
    }
  }

  /**
   * This function is called when the user clicks on the merge button
   * It is used to merge the datasets, create a new dataset and update the workspace
   */
  const merge = async (selectedMergeType) => {
    if (!selectedMergeType) {
      toast.warn("Please select a merge type.")
      return
    }

    const id = randomUUID()
    const object = new MEDDataObject({
      id: id,
      name: globalData[selectedCollections[0]].name + "_" + globalData[selectedCollections[1]].name + "_" + selectedMergeType,
      type: "csv",
      parentID: "ROOT",
      childrenIDs: [],
      inWorkspace: false
    })

    let jsonToSend = {}
    jsonToSend = {
      newCollectionName: id,
      mergeType: selectedMergeType,
      columns: selectedColumns,
      databaseName: "data",
      collection1: globalData[selectedCollections[0]].id,
      collection2: globalData[selectedCollections[1]].id
    }
    requestBackend(port, "/input/merge_datasets_DB/", jsonToSend, (jsonResponse) => {
      console.log("jsonResponse", jsonResponse)
      toast.success("Datasets merged successfully.")
    })
    await insertMEDDataObjectIfNotExists(object)
    MEDDataObject.updateWorkspaceDataObject()
  }

  return (
    <>
      <div style={{ textAlign: "center", marginBottom: "10px" }}>
        <Message
          severity="info"
          text={"The Merge Tools enable you to merge two collections in a database. You can select the collections to merge, the columns to merge on, and the type of merge to perform."}
        />
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: "5px"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", margin: "5px" }}>
          <MultiSelect value={selectedCollections} options={options} onChange={(e) => handleSelectChange(e.value)} placeholder={"Select Collections"} style={{ width: "200px", marginRight: "10px" }} />
          <MultiSelect
            value={selectedColumns}
            options={collectionColumns}
            onChange={(e) => setSelectedColumns(e.value)}
            placeholder="Select Columns"
            style={{ width: "200px", marginRight: "10px" }}
            disabled={selectedMergeType === "cross"}
          />
          <Dropdown value={selectedMergeType} options={mergeTypes} onChange={(e) => setSelectedMergeType(e.value)} placeholder="Select Merge Type" style={{ width: "200px", marginRight: "10px" }} />
          <Button
            icon={"pi pi-check"}
            onClick={() => merge(selectedMergeType)}
            className="p-button-success"
            style={{
              width: "100px",
              marginRight: "10px"
            }}
            tooltip="Merge"
            tooltipOptions={{ position: "top" }}
            disabled={selectedCollections.length !== 2 || selectedColumns.length === 0 || !selectedMergeType}
          />
        </div>
      </div>
    </>
  )
}

export default MergeToolsDB
