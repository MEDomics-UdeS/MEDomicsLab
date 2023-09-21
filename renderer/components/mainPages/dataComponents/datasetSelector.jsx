import React, { useContext, useState, useEffect } from "react"
import { DataContext } from "../../workspace/dataContext"
import { ListBox } from "primereact/listbox"
import DataTableWrapper from "../../dataTypeVisualisation/dataTableWrapper"
import DataTableFromContext from "./dataTableFromContext"

/**
 * @description - This component is the dataset selector component that will show the datasets available in the workspace
 * @returns the dataset selector component
 * @param {Object} props - The props object
 *  @param {Object} props.keepOnlyFolder - The only parent folder to keep in the dataset selector
 */
const DatasetSelector = (props) => {
  const { globalData } = useContext(DataContext) // We get the global data from the context to retrieve the directory tree of the workspace, thus retrieving the data files
  const [datasetList, setDatasetList] = useState([])
  const [selectedDatasets, setSelectedDatasets] = useState(null)

  function generateDatasetListFromDataContext(dataContext) {
    let keys = Object.keys(dataContext)
    let datasetListToShow = []
    keys.forEach((key) => {
      if (dataContext[key].type !== "folder") {
        datasetListToShow.push(dataContext[key])
      }
    })
    setDatasetList(datasetListToShow)
  }

  useEffect(() => {
    if (globalData !== undefined) {
      generateDatasetListFromDataContext(globalData)
    }
  }, [globalData])

  function handleDatasetSelect(event) {
    console.log("Dataset selected", event.target.value)
  }

  return (
    <>
      <h1>Dataset Selector</h1>
      <DataTableFromContext MedDataObject={selectedDatasets} />
      <div className="dataset-selector card flex justify-content-center">
        <ListBox
          value={selectedDatasets}
          onChange={(e) => {
            console.log(e.value)
            setSelectedDatasets(e.value)
          }}
          options={datasetList}
          optionLabel="name"
          className="listbox-multiple w-full md:w-14rem"
        />
      </div>
    </>
  )
}

export default DatasetSelector
