import React, { useState, useEffect } from "react"
import { MultiSelect } from "primereact/multiselect"
import { Button } from "primereact/button"
import { toast } from "react-toastify"
import { getCollectionData } from "../utils"
import { Dropdown } from "primereact/dropdown"
const mongoUrl = "mongodb://localhost:27017"
import { MongoClient, ObjectId } from "mongodb"
import { ipcRenderer } from "electron"
import { Message } from "primereact/message"
import _ from "lodash"

/**
 * @description MergeTools component
 * @param [collections] - Array of collections
 * @param {DB} - Database object
 * @param {currentCollection} - Current collection
 */
const MergeTools = ({ collections, DB, currentCollection }) => {
  const [selectedCollectionLabels, setSelectedCollectionLabels] = useState([currentCollection])
  const [selectedCollections, setSelectedCollections] = useState(collections.filter((collection) => collection.label === currentCollection))
  const [selectedColumns, setSelectedColumns] = useState([])
  const [selectedCollectionsData1, setSelectedCollectionsData1] = useState([])
  const [selectedCollectionsData2, setSelectedCollectionsData2] = useState([])
  const [selectedMergeType, setSelectedMergeType] = useState(null)
  const [collectionColumns, setCollectionColumns] = useState([])
  const [disabledColumns, setDisabledColumns] = useState([])
  const [matchingColumns, setMatchingColumns] = useState([])
  const mergeTypes = [
    { value: "left", label: "Left" },
    { value: "right", label: "Right" },
    { value: "inner", label: "Inner" },
    { value: "outer", label: "Outer" },
    { value: "cross", label: "Cross" }
  ]

  useEffect(() => {
    console.log("Data1:", selectedCollectionsData1) // Log selectedCollectionsData1
  }, [selectedCollectionsData1])

  useEffect(() => {
    console.log("Data2:", selectedCollectionsData2) // Log selectedCollectionsData2
  }, [selectedCollectionsData2])

  useEffect(() => {
    if (selectedCollectionsData1 && selectedCollectionsData2) {
      const columns1 = Object.keys(selectedCollectionsData1[0] || {}).filter((column) => column !== "_id")
      const columns2 = Object.keys(selectedCollectionsData2[0] || {}).filter((column) => column !== "_id")
      const matching = columns1.filter((column) => columns2.includes(column))
      setMatchingColumns(matching)
      const disabled = collectionColumns.filter((column) => !matching.includes(column))
      setDisabledColumns(disabled)
    }
  }, [selectedCollectionsData1, selectedCollectionsData2, collectionColumns])

  const handleCollectionSelect = async (selectedOptions) => {
    if (selectedOptions.length <= 2) {
      setSelectedCollections(selectedOptions)
      console.log(selectedOptions)
      const labels = selectedOptions.map((option) => option.label)
      setSelectedCollectionLabels(labels)

      const data1 = selectedOptions.length > 0 ? await getCollectionData(DB.name, labels[0]) : null
      const data2 = selectedOptions.length > 1 ? await getCollectionData(DB.name, labels[1]) : null

      setSelectedCollectionsData1(data1)
      setSelectedCollectionsData2(data2)

      const columns1 = data1 ? Object.keys(data1[0]).filter((column) => column !== "_id") : []
      const columns2 = data2 ? Object.keys(data2[0]).filter((column) => column !== "_id") : []
      const columnSet = new Set([...columns1, ...columns2])
      setCollectionColumns(Array.from(columnSet))
    } else {
      toast.warn("You can only select up to 2 collections to merge.")
    }
  }

  const handleColumnSelect = (e) => {
    setSelectedColumns(e.value)
  }

  const handleMergeTypeSelect = (e) => {
    setSelectedMergeType(e.value)
  }

  // Inner join
  const innerJoin = (arr1, arr2, keys) => {
    return _.filter(arr1, (item1) => {
      const item2 = _.find(arr2, (item2) => keys.every((key) => _.isEqual(item1[key], item2[key])))
      if (item2) {
        Object.assign(item1, item2)
        return true
      }
      return false
    })
  }

  // Outer join
  const outerJoin = (arr1, arr2, keys) => {
    const merged = _.unionWith(arr1, arr2, (a, b) => _.isEqual(_.pick(a, keys), _.pick(b, keys)))
    return merged.map((item) => {
      const item1 = arr1.find((i) => _.isEqual(_.pick(i, keys), _.pick(item, keys)))
      const item2 = arr2.find((i) => _.isEqual(_.pick(i, keys), _.pick(item, keys)))
      return _.merge({}, item1, item2)
    })
  }

  // Left join
  const leftJoin = (arr1, arr2, keys) => {
    return _.map(arr1, (item1) => {
      const item2 = _.find(arr2, (item2) => keys.every((key) => _.isEqual(item1[key], item2[key])))
      return _.merge({}, item1, item2)
    })
  }

  // Right join
  const rightJoin = (arr1, arr2, keys) => {
    return _.map(arr2, (item2) => {
      const item1 = _.find(arr1, (item1) => keys.every((key) => _.isEqual(item1[key], item2[key])))
      return _.merge({}, item2, item1)
    })
  }

  // Cross join
  const crossJoin = (arr1, arr2) => {
    return _.flatMap(arr1, (item1) => {
      return arr2.map((item2) => {
        const newItem = _.merge({}, item1, item2)
        newItem._id = new ObjectId()
        return newItem
      })
    })
  }

  const handleMerge = async () => {
    if (selectedCollections.length !== 2) {
      toast.warn("Please select 2 collections to merge.")
      return
    }
    if (selectedColumns.length === 0 && selectedMergeType !== "cross") {
      toast.warn("No columns are selected.")
      return
    }
    if (!selectedMergeType) {
      toast.warn("No merge type is selected.")
      return
    }
    let mergedData
    switch (selectedMergeType) {
      case "left":
        mergedData = leftJoin(selectedCollectionsData1, selectedCollectionsData2, selectedColumns)
        console.log("Left-Merged Data:", mergedData)
        toast.success("Data left-merged successfully.")
        break
      case "right":
        mergedData = rightJoin(selectedCollectionsData1, selectedCollectionsData2, selectedColumns)
        console.log("Right-Merged Data:", mergedData)
        toast.success("Data right-merged successfully.")
        break
      case "inner":
        mergedData = innerJoin(selectedCollectionsData1, selectedCollectionsData2, selectedColumns)
        console.log("Inner-Merged Data:", mergedData)
        toast.success("Data inner-merged successfully.")
        break
      case "outer":
        mergedData = outerJoin(selectedCollectionsData1, selectedCollectionsData2, selectedColumns)
        console.log("Outer-Merged Data:", mergedData)
        toast.success("Data outer-merged successfully.")
        break
      case "cross":
        mergedData = crossJoin(selectedCollectionsData1, selectedCollectionsData2)
        console.log("Cross-Joined Data:", mergedData)
        toast.success("Data cross-joined successfully.")
        break
    }

    if (mergedData) {
      const client = new MongoClient(mongoUrl)
      await client.connect()
      const db = client.db(DB.name)
      let baseCollectionName = `${selectedCollectionLabels[0]}${selectedCollectionLabels[1]}_${selectedMergeType}_Merged`
      let newCollectionName = baseCollectionName

      const collections = await db.listCollections().toArray()
      let collectionExists = collections.some((collection) => collection.name === newCollectionName)
      let i = 2

      while (collectionExists) {
        newCollectionName = baseCollectionName + "_" + i
        collectionExists = collections.some((collection) => collection.name === newCollectionName)
        i++
      }

      const newCollection = await db.createCollection(newCollectionName)
      await newCollection.insertMany(mergedData)
      ipcRenderer.send("get-collections", DB.name)
      console.log(`New collection ${newCollectionName} created with merged data.`)
      await client.close()
    }
  }

  return (
      <>
        <div style={{textAlign: "center", marginBottom: "10px"}}>
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
    <div style={{display: "flex", alignItems: "center", margin: "5px"}}>
      <MultiSelect
          value={selectedCollections}
          options={collections}
          onChange={(e) => handleCollectionSelect(e.value)}
          placeholder={selectedCollectionLabels.join(", ") || "Select Collections"}
          style={{ width: "200px", marginRight: "10px" }}
          optionDisabled={(option) => option.label === currentCollection}
        />
        <MultiSelect
          value={selectedColumns}
          options={collectionColumns}
          onChange={handleColumnSelect}
          placeholder="Select Columns"
          style={{ width: "200px", marginRight: "10px" }}
          optionDisabled={(option) => disabledColumns.includes(option) || selectedMergeType === "cross"}
          disabled={selectedMergeType === "cross"}
        />
        <Dropdown value={selectedMergeType} options={mergeTypes} onChange={handleMergeTypeSelect} placeholder="Select Merge Type" style={{ width: "200px", marginRight: "10px" }} />
        <Button
          label="Merge Datasets"
          onClick={handleMerge}
          className="p-button-success"
          style={{
            width: "170px",
            marginRight: "10px"
          }}
        />
        {selectedCollections.length === 2 &&
          (matchingColumns.length > 0 ? <Message severity="info" text={`Matching columns: ${matchingColumns.join(", ")}`} /> : <Message severity="warn" text="No matching columns." />)}
      </div>
    </div>
      </>
  )
}

export default MergeTools
