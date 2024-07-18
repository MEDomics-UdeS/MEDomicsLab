import React, { useState, useContext, useEffect } from "react" // Corrected imports
import { toast } from "react-toastify" // Assuming toast is from react-toastify
import { DataContext } from "../../workspace/dataContext"
import { Message } from "primereact/message"
import { MultiSelect } from "primereact/multiselect"
import { getCollectionData } from "../utils"

const GroupingTaggingToolsDB = ({ currentCollection, refreshData }) => {
  const [options, setOptions] = useState([])
  const { globalData } = useContext(DataContext)
  const [selectedCollection, setSelectedCollection] = useState([])
  const [collectionColumns, setCollectionColumns] = useState([])
  const [selectedColumns, setSelectedColumns] = useState([])

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
        const data1 = await getCollectionData(selectedCollection[0])
        const columns1 = Object.keys(data1[0])
        setCollectionColumns(columns1.filter((column) => column !== "_id"))
      } catch (error) {
        toast.error("Failed to fetch collection data.")
      }
    }

    fetchData()
  }, [globalData, selectedCollection])

  const handleSelectChange = (newSelection) => {
    setSelectedCollection(newSelection)
  }

  return (
    <>
      <div className="margin-top-15 margin-bottom-15 center">
        <Message text="The Grouping/Tagging tool enables you to create and apply tags to dataset columns." />
      </div>
      <h6 style={{ paddingBottom: "0.25rem", margin: "0rem", marginInline: "0.5rem", height: "1.5rem" }}> Select the datasets you want to tag</h6>
      <MultiSelect value={selectedCollection} options={options} onChange={(e) => handleSelectChange(e.value)} placeholder={"Select Collections"} style={{ width: "200px", marginRight: "10px" }} />
      <MultiSelect value={selectedColumns} options={collectionColumns} onChange={(e) => setSelectedColumns(e.value)} placeholder="Select Columns" style={{ width: "200px", marginRight: "10px" }} />
    </>
  )
}

export default GroupingTaggingToolsDB
