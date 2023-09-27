import React, { useContext, useState, useEffect } from "react"
import { DataContext } from "../../workspace/dataContext"
import { ListBox } from "primereact/listbox"
import DataTableFromContext from "./dataTableFromContext"
import { Tab, Tabs } from "react-bootstrap"
/**
 * @description - This component is the dataset selector component that will show the datasets available in the workspace
 * @returns the dataset selector component
 * @param {Object} props - The props object
 *  @param {Object} props.keepOnlyFolder - The only parent folder to keep in the dataset selector
 */
const ListBoxSelector = ({ setSelectedDatasets, selectedDatasets, multiSelect = true }) => {
  const { globalData } = useContext(DataContext) // We get the global data from the context to retrieve the directory tree of the workspace, thus retrieving the data files
  const [datasetList, setDatasetList] = useState([])
  const [activeKey, setActiveKey] = useState("0") // activeKey is the name of the page
  const [tabMenuItems, setTabMenuItems] = useState([{ label: "Dataset", icon: "pi pi-fw pi-file" }])

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

  useEffect(() => {
    let tabMenuJSX = []
    if (selectedDatasets !== null) {
      if (selectedDatasets.length > 0) {
        selectedDatasets.forEach((dataset) => {
          tabMenuJSX.push({ label: dataset.name, icon: "pi pi-fw pi-file" })
        })
      }
    }
    setTabMenuItems(tabMenuJSX)
  }, [selectedDatasets])

  useEffect(() => {
    console.log("tabMenuItems", tabMenuItems)
  }, [tabMenuItems])
  return (
    <>
      <ListBox
        multiple={multiSelect}
        value={selectedDatasets}
        onChange={(e) => {
          console.log(e.value)
          if (e.value.includes(activeKey) == false) {
            if (e.value.length > 0) {
              setActiveKey(e.value[0].getUUID())
            } else {
              setActiveKey("0")
            }
          }
          setSelectedDatasets(e.value)
        }}
        options={datasetList}
        optionLabel="name"
        className="listbox-multiple w-mid md:w-14rem"
      />
    </>
  )
}

export default ListBoxSelector