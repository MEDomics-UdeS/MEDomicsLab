import React, { useContext, useState, useEffect } from "react"
import { DataContext } from "../../workspace/dataContext"
import DataTableWrapper from "../../dataTypeVisualisation/dataTableWrapper"
import * as dfd from "danfojs"
import { toast } from "react-toastify"
import fs from "fs"
import Papa from "papaparse"

/**
 * @description - This component is the dataset selector component that will show the datasets available in the workspace
 * @returns the dataset selector component
 * @param {Object} props - The props object
 *  @param {Object} props.keepOnlyFolder - The only parent folder to keep in the dataset selector
 */
            console.log("HasBeenRefreshed FALSE")
const DataTableFromContext = ({MedDataObject, tablePropsData, tablePropsColumn, isDatasetLoaded, setIsDatasetLoaded=false, hasBeenRefreshed=false}) => {
  const { globalData, setGlobalData } = useContext(DataContext) // We get the global data from the context to retrieve the directory tree of the workspace, thus retrieving the data files
  const [isLoaded, setIsLoaded] = useState(MedDataObject.isLoaded ? MedDataObject.isLoaded : false)

  const [dataset, setDataset] = useState(null)

  useEffect(() => {
    console.log("isLoaded", isLoaded)
    console.log("datasetObject.data", MedDataObject.data)
    console.log("isDatasetLoaded", isDatasetLoaded)
    console.log("isDatasetLoaded==true", isDatasetLoaded==true)
    console.log("!(isDatasetLoaded && isDatasetLoaded==true)", !(isDatasetLoaded && isDatasetLoaded==true))
    if (MedDataObject !== undefined && MedDataObject !== null) {
      if (isLoaded && MedDataObject.data && !(isDatasetLoaded && isDatasetLoaded==true)) {
        console.log("was already loaded")
      } else {
        console.log("in ELSE")
        if (globalData !== undefined) {
          let extension = MedDataObject.extension
          if (extension == "csv") {
            let csvPath = MedDataObject.path
            fs.readFile(csvPath, "utf8", (err, data) => {
              if (err) {
                console.error("Error reading file:", err)
              } else {
                let array = []
                Papa.parse(data, {
                  step: function (row) {
                    array.push(row.data)
                  }
                })
                let columns = array.shift()
                let df = new dfd.DataFrame(array, { columns: columns })
                let dfJSON = dfd.toJSON(df)
                setDataset(dfJSON)
                let globalDataCopy = { ...globalData }
                globalDataCopy[MedDataObject.getUUID()].data = dfJSON
                globalDataCopy[MedDataObject.getUUID()].isLoaded = true
                setGlobalData(globalDataCopy)
                setIsLoaded(true)
                if (setIsDatasetLoaded) {
                  console.log("in datasetloaded")
                  setIsDatasetLoaded(true)
                }
                
              }
            })
          } else if (extension == "xlsx") {
            toast.error("XLSX data not supported yet")
          } else if (extension == "json") {
            toast.error("JSON data not supported yet")
          } else {
            toast.error("File type not supported")
          }
        }
      }
    }
  }, [isLoaded, MedDataObject, isDatasetLoaded])

  useEffect(()=>{
    if (hasBeenRefreshed){
      console.log("HERE")
      setIsLoaded(false)
    }
  },[hasBeenRefreshed])

  return <>{dataset && <DataTableWrapper data={dataset} tablePropsData={tablePropsData} tablePropsColumn={tablePropsColumn} />}</>
}

export default DataTableFromContext
