import React, { useState, useEffect, useContext } from "react"
import { DataContext } from "../../workspace/dataContext"
import { Form } from "react-bootstrap"

/**
 * @typedef {React.FunctionComponent} WsDataSelect
 * @description This component is used to select a data file from the workspace (DataContext). The data file is then used in the flow.
 * @params props.selectedPath - The path of the selected data file
 * @params props.onChange - The function to call when the selected data file changes
 * @params props.name - The name of the component
 */
const WsDataSelect = ({ selectedPath, onChange, name = "Select data" }) => {
  const { globalData } = useContext(DataContext) // We get the global data from the context to retrieve the directory tree of the workspace, thus retrieving the data files
  const [datasetList, setDatasetList] = useState([])

  /**
   * @description This function is used to generate the list of data files from the global data context
   * @param {Object} dataContext - The global data context
   * @returns {void} sets the datasetList state
   */
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

  /**
   * @description This useEffect is used to generate the dataset list from the global data context if it's defined
   * @returns {void} calls the generateDatasetListFromDataContext function
   */
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
