import React, { useContext, useState, useEffect } from "react"
import { DataContext } from "../../workspace/dataContext"
import { ListBox } from "primereact/listbox"
import DataTableFromContext from "./dataTableFromContext"
import { Tab, Tabs } from "react-bootstrap"
import DataTableWrapperBPClass from "../../dataTypeVisualisation/dataTableWrapperBPClass"
import DataTableFromContextBP from "./dataTableFromContextBP"
/**
 * @description - This component is the dataset selector component that will show the datasets available in the workspace
 * @returns the dataset selector component
 * @param {Object} props - The props object
 *  @param {Object} props.keepOnlyFolder - The only parent folder to keep in the dataset selector
 */
const DatasetSelector = ({ multiSelect }) => {
  const { globalData } = useContext(DataContext) // We get the global data from the context to retrieve the directory tree of the workspace, thus retrieving the data files
  const [datasetList, setDatasetList] = useState([])
  const [selectedDatasets, setSelectedDatasets] = useState([])
  const [activeKey, setActiveKey] = useState("0") // activeKey is the name of the page
  const [tabMenuItems, setTabMenuItems] = useState([{ label: "Dataset", icon: "pi pi-fw pi-file" }])

  /**
   * @description - This function will generate the dataset list to show in the dataset selector
   */
  function generateDatasetListFromDataContext(dataContext) {
    let keys = Object.keys(dataContext)
    let datasetListToShow = []
    const dataExtensions = ["csv", "json", "txt", "tsv", "xls", "xlsx"]
    keys.forEach((key) => {
      if (dataContext[key].type !== "folder") {
        if (dataExtensions.includes(dataContext[key].extension)) {
          datasetListToShow.push(dataContext[key])
        }
      }
    })
    setDatasetList(datasetListToShow)
  }

  // We generate the dataset list from the global data
  useEffect(() => {
    if (globalData !== undefined) {
      generateDatasetListFromDataContext(globalData)
    }
  }, [globalData])

  // We generate the tab menu items from the selected datasets
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

  // We log the tab menu items
  useEffect(() => {
    console.log("tabMenuItems", tabMenuItems)
  }, [tabMenuItems])
  return (
    <>
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
          className="listbox-multiple w-full md:w-14rem"
        />
        <Tabs activeKey={activeKey} defaultActiveKey={"0"} id="dataTable-selector-tabs" className="mb-3" onSelect={(k) => setActiveKey(k)}>
          {selectedDatasets.length > 0 &&
            tabMenuItems.map((item, index) => {
              if (selectedDatasets[index] !== undefined) {
                return (
                  <Tab style={{ height: "100%" }} title={selectedDatasets[index].name} key={selectedDatasets[index].getUUID()} eventKey={selectedDatasets[index].getUUID()}>
                    <DataTableFromContext MedDataObject={selectedDatasets[index]} tablePropsData={{ size: "small", scrollable: true }} />
                  </Tab>
                )
              } else {
                return <></>
              }
            })}
        </Tabs>
      </>
    </>
  )
}

export default DatasetSelector
