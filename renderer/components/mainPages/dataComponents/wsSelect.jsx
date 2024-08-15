import React, { useState, useEffect, useContext } from "react"
import { DataContext } from "../../workspace/dataContext"
import { Form } from "react-bootstrap"

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
        if (rootDir !== undefined) {
          const parentID = globalData[uuid].parentID
          const parentData = globalData[parentID]

          if (parentData && parentData.originalName === rootDir) {
            const processNode = (nodeUUID) => {
              const nodeData = globalData[nodeUUID]
              if (!(!acceptFolder && nodeData.type === "folder")) {
                if (acceptedExtensions.includes("all") || acceptedExtensions.includes(nodeData.extension)) {
                  datasetListToShow.push({
                    name: nodeData.name,
                    path: nodeData.path,
                    isFolder: nodeData.type === "folder"
                  })
                }
              }
            }

            // Process the selected root directory
            processNode(uuid)

            // Process children recursively
            const processChildren = (parentUUID) => {
              Object.keys(globalData).forEach((key) => {
                if (globalData[key].parentID === parentUUID) {
                  processNode(key)
                  if (globalData[key].type === "folder") {
                    processChildren(key) // Recursively process child folders
                  }
                }
              })
            }

            processChildren(uuid)
          }
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
