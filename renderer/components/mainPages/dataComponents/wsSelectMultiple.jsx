import React, { useState, useEffect, useContext } from "react"
import { DataContext } from "../../workspace/dataContext"
import { MultiSelect } from "primereact/multiselect"
import { deepCopy } from "../../../utilities/staticFunctions"

/**
 * @typedef {React.FunctionComponent} WsSelectMultiple
 * @description This component is used to select a data file from the workspace (DataContext). The data file is then used in the flow.
 * @params props.selectedPath - The path of the selected data file
 * @params props.onChange - The function to call when the selected data file changes
 * @params props.name - The name of the component
 */
const WsSelectMultiple = ({
  key,
  selectedPaths,
  onChange,
  rootDir,
  acceptFolder = false,
  acceptedExtensions = ["all"],
  matchRegex = null,
  disabled,
  placeholder,
  whenEmpty = null,
  setHasWarning = null
}) => {
  const { globalData } = useContext(DataContext) // We get the global data from the context to retrieve the directory tree of the workspace, thus retrieving the data files
  const [datasetList, setDatasetList] = useState([])

  /**
   * Get the columns from a promise
   * @param {object} dataObject - Data object
   * @returns {array} - Columns
   * @summary This function is used to get the columns from a promise - async function
   */
  async function getColumnsFromPromise(dataObject) {
    let promise = new Promise((resolve) => {
      resolve(dataObject.getColumnsOfTheDataObjectIfItIsATable())
    })
    let columns = await promise
    return columns
  }

  /**
   * @description This useEffect is used to generate the dataset list from the global data context if it's defined
   * @returns {void} calls the generateDatasetListFromDataContext function
   */
  useEffect(() => {
    if (globalData !== undefined) {
      let uuids = Object.keys(globalData)

      let datasetListToShow = []
      uuids.forEach((uuid) => {
        // in this case, we want to show only the files in the selected root directory
        if (rootDir != undefined) {
          if (globalData[globalData[uuid].parentID]) {
            if (rootDir.includes(globalData[globalData[uuid].parentID].name) || rootDir.includes(globalData[globalData[uuid].parentID].originalName)) {
              if (!(!acceptFolder && globalData[uuid].type == "folder")) {
                if (acceptedExtensions.includes("all") || acceptedExtensions.includes(globalData[uuid].extension)) {
                  if (!matchRegex || matchRegex.test(globalData[uuid].nameWithoutExtension)) {
                    console.log("dataset", globalData[uuid])
                    if (!globalData[uuid].metadata.columnsTag) {
                      getColumnsFromPromise(globalData[uuid]).then((columns) => {
                        console.log("columns", columns)
                      })
                    } else {
                      let columnsTag = deepCopy(globalData[uuid].metadata.columnsTag)
                      let timePrefix = globalData[uuid].originalName.split("_")[0]
                      columnsTag = Object.keys(columnsTag).reduce((acc, key) => {
                        acc[timePrefix + "_" + key] = columnsTag[key]
                        return acc
                      }, {})
                      datasetListToShow.push({
                        name: globalData[uuid].name,
                        path: globalData[uuid].path,
                        tags: Object.keys(globalData[uuid].metadata.tagsDict),
                        columnsTags: globalData[uuid].metadata.columnsTag
                      })
                    }
                  }
                }
              }
            }
          }
          // else, we want to add any file (or folder) from acceptedExtensions
        } else {
          if (acceptedExtensions.includes(globalData[uuid].extension) || acceptedExtensions.includes("all")) {
            if (acceptedExtensions.includes("all") || acceptedExtensions.includes(globalData[uuid].extension)) {
              datasetListToShow.push({
                name: globalData[uuid].name,
                path: globalData[uuid].path,
                tags: Object.keys(globalData[uuid].metadata.tagsDict),
                columnsTags: globalData[uuid].metadata.columnsTag
              })
            }
          }
        }
      })
      setDatasetList(datasetListToShow)
      if (datasetListToShow.length == 0) {
        setHasWarning({ state: true, tooltip: "No data file found in the workspace" })
      }
    }
  }, [globalData])

  return (
    <>
      {datasetList.length > 0 ? (
        <MultiSelect
          key={key}
          disabled={disabled}
          placeholder={placeholder}
          value={Array.isArray(selectedPaths) ? selectedPaths : []}
          onChange={(e) => onChange(e.value)}
          options={datasetList}
          optionLabel="name"
          display="chip"
        />
      ) : (
        whenEmpty
      )}
    </>
  )
}

export default WsSelectMultiple
