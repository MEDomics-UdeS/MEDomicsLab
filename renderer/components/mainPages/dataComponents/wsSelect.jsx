import React, { useState, useEffect, useContext } from "react"
import { DataContext } from "../../workspace/dataContext"
import { Form } from "react-bootstrap"
import { MultiSelect } from 'primereact/multiselect';

/**
 * @typedef {React.FunctionComponent} WsSelect
 * @description This component is used to select a data file from the workspace (DataContext). The data file is then used in the flow.
 * @params props.selectedPath - The path of the selected data file
 * @params props.onChange - The function to call when the selected data file changes
 * @params props.name - The name of the component
 */
const WsSelect = ({ selectedPath, onChange, rootDir, acceptFolder = false, acceptedExtensions = ["all"], disabled }) => {
  const { globalData } = useContext(DataContext) // We get the global data from the context to retrieve the directory tree of the workspace, thus retrieving the data files
  const [datasetList, setDatasetList] = useState([])

  useEffect(() => {
    console.log(datasetList)
  }, [datasetList])

  /**
   * @description This useEffect is used to generate the dataset list from the global data context if it's defined
   * @returns {void} calls the generateDatasetListFromDataContext function
   */
  useEffect(() => {
    if (globalData !== undefined) {
      let uuids = Object.keys(globalData)

      let datasetListToShow = [{ name: "No selection", path: "", isFolder: false, default: true }]
      uuids.forEach((uuid) => {
        // in this case, we want to show only the files in the selected root directory
        if (rootDir != undefined) {
          if (globalData[globalData[uuid].parentID]) {
            if (globalData[globalData[uuid].parentID].originalName == rootDir) {
              if (!(!acceptFolder && globalData[uuid].type == "folder")) {
                if (acceptedExtensions.includes("all") || acceptedExtensions.includes(globalData[uuid].extension)) {
                  datasetListToShow.push({ name: globalData[uuid].name, path: globalData[uuid].path, isFolder: globalData[uuid].type == "folder" })
                }
              }
            }
          }
          // else, we want to add any file (or folder) from acceptedExtensions
        } else {
          if (acceptedExtensions.includes(globalData[uuid].extension) || acceptedExtensions.includes("all")) {
            if (acceptedExtensions.includes("all") || acceptedExtensions.includes(globalData[uuid].extension)) {
              datasetListToShow.push({ name: globalData[uuid].name, path: globalData[uuid].path, isFolder: globalData[uuid].type == "folder" })
            }
          }
        }
      })
      setDatasetList(datasetListToShow)
    }
  }, [globalData])

return (
  <>
    {
      <Form.Select disabled={disabled} value={selectedPath && selectedPath.name} onChange={(e) => onChange(e, datasetList.find((dataset) => dataset.name == e.target.value).path)}>
        {datasetList.map((dataset) => {
          return (
            <option key={dataset.name} value={dataset.name}>
              {dataset.isFolder ? "📁 " : dataset.default ? "❌ " : "📄 "}
              {dataset.name}
            </option>
          )
        })}
      </Form.Select>
    }
  </>
)
    
}

export default WsSelect
