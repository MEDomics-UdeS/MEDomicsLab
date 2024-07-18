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
   * @description This useEffect is used to generate the dataset list from the global data context if it's defined
   * @returns {void} calls the generateDatasetListFromDataContext function
   */
  useEffect(() => {
    if (globalData !== undefined) {
      let ids = Object.keys(globalData)
      let datasetListToShow = []
      ids.forEach((id) => {
        // in this case, we want to show only the files in the selected root directory
        if (rootDir != undefined) {
          if (globalData[globalData[id].parentID]) {
            if (rootDir.includes(globalData[globalData[id].parentID].name) || rootDir.includes(globalData[globalData[id].parentID].originalName)) {
              if (!(!acceptFolder && globalData[id].type == "directory")) {
                if (acceptedExtensions.includes("all") || acceptedExtensions.includes(globalData[id].type)) {
                  if (!matchRegex || matchRegex.test(globalData[id].name)) {
                    let columnsTag = deepCopy(globalData[id].metadata?.columnsTag)
                    let timePrefix = globalData[id].name.split("_")[0]
                    if (columnsTag) {
                      columnsTag = Object.keys(columnsTag).reduce((acc, key) => {
                        acc[timePrefix + "_" + key] = columnsTag[key]
                        return acc
                      }, {})
                    }
                    datasetListToShow.push({
                      id: id,
                      name: globalData[id].name,
                      tags: globalData[id].metadata?.tagsDict ? Object.keys(globalData[id].metadata.tagsDict) : [],
                      columnsTags: globalData[id].metadata?.columnsTag ? globalData[id].metadata.columnsTag : []
                    })
                  }
                }
              }
            }
          }
          // else, we want to add any file (or folder) from acceptedExtensions
        } else {
          if (acceptedExtensions.includes(globalData[id].extension) || acceptedExtensions.includes("all")) {
            if (acceptedExtensions.includes("all") || acceptedExtensions.includes(globalData[id].extension)) {
              datasetListToShow.push({
                id: id,
                name: globalData[id].name,
                tags: Object.keys(globalData[id].metadata?.tagsDict),
                columnsTags: globalData[id].metadata?.columnsTag
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
