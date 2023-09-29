import React, { useState, useEffect, useContext } from "react"
import { Dropdown } from "primereact/dropdown"
import { DataContext } from "../../workspace/dataContext"
import { Form } from "react-bootstrap"

const WsDataSelect = ({ selectedPath, onChange, name = "Select data" }) => {
  const { globalData } = useContext(DataContext) // We get the global data from the context to retrieve the directory tree of the workspace, thus retrieving the data files
  const [datasetList, setDatasetList] = useState([])

  function generateDatasetListFromDataContext(dataContext) {
    let uuids = Object.keys(dataContext)
    let datasetListToShow = []
    uuids.forEach((uuid) => {
      if (dataContext[dataContext[uuid].parentID].originalName == "DATA") {
        console.log(dataContext[uuid])
        datasetListToShow.push({ name: dataContext[uuid].name, path: dataContext[uuid].path, isFolder: dataContext[uuid].type == "folder" })
      }
    })
    setDatasetList(datasetListToShow)
  }

  useEffect(() => {
    if (globalData !== undefined) {
      generateDatasetListFromDataContext(globalData)
    }
  }, [globalData])

  return (
    <Form.Select value={selectedPath && selectedPath.name} onChange={(e) => onChange(e, datasetList.find((dataset) => dataset.name == e.target.value).path)}>
      {datasetList.map((dataset) => {
        return (
          <option key={dataset.name} value={dataset.name}>
            {dataset.isFolder ? "📁 " : "📄 "}
            {dataset.name}
          </option>
        )
      })}
    </Form.Select>
  )
}

export default WsDataSelect
