import React, { useContext, useState, useEffect, use } from "react"
import { DataContext } from "../../workspace/dataContext"
import { ListBox } from "primereact/listbox"
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
const DataTableFromContext = (MedDataObject) => {
  console.log("MedDataObject", MedDataObject)
  const { globalData } = useContext(DataContext) // We get the global data from the context to retrieve the directory tree of the workspace, thus retrieving the data files
  let datasetObject = MedDataObject["MedDataObject"]
  const [isLoaded, setIsLoaded] = useState(MedDataObject.isLoaded ? MedDataObject.isLoaded : false)

  const [dataset, setDataset] = useState(null)

  useEffect(() => {
    if (datasetObject !== undefined && datasetObject !== null) {
      if (isLoaded) {
        setDataset(datasetObject.data)
      } else {
        if (globalData !== undefined) {
          let extension = datasetObject.extension
          console.log("extension", extension)
          if (extension == "csv") {
            let csvPath = datasetObject.path
            fs.readFile(csvPath, "utf8", (err, data) => {
              if (err) {
                console.error("Error reading file:", err)
              } else {
                console.log("File read successfully")
                console.log("data", data)
                let array = []
                Papa.parse(data, {
                  step: function (row) {
                    array.push(row.data)
                  }
                })
                let columns = array.shift()
                let df = new dfd.DataFrame(array, { columns: columns })
                setDataset(df)
              }
            })
          } else if (extension == "xlsx") {
            dfd.readExcel(datasetObject.path).then((df) => {
              console.log("XLSX data loaded", df)
              setDataset(df)
              setIsLoaded(true)
            })
          } else if (extension == "json") {
            dfd.readJSON(datasetObject.path).then((df) => {
              console.log("JSON data loaded", df)
              setDataset(df)
              setIsLoaded(true)
            })
          } else {
            toast.error("File type not supported")
          }
        }
      }
    }
  }, [isLoaded, datasetObject])

  useEffect(() => {
    console.log("dataset", dataset)
  }, [dataset])

  return (
    <>
      {console.log("dataset", dataset)}
      {dataset && (
        <div className="container">
          <DataTableWrapper data={dfd.toJSON(dataset)} tablePropsData={{ scrollable: true }} />
        </div>
      )}
    </>
  )
}

export default DataTableFromContext
