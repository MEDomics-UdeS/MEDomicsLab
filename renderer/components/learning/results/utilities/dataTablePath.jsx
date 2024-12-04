import React, { useEffect, useState } from "react"
import DataTable from "../../../dataTypeVisualisation/dataTableWrapper"
import { loadCSVPath } from "../../../../utilities/fileManagementUtils"

/**
 * 
 * @param {String} path The path of the csv file to display 
 * @returns {JSX.Element} The DataTablePath component
 * 
 * @description
 * This component is an adaptation of the DataTable component to display a csv fil from a path.
 */
const DataTablePath = ({ path }) => {
  const [data, setData] = useState([])

  useEffect(() => {
    loadCSVPath(path, whenDataLoaded)
  }, [])

  const whenDataLoaded = (data) => {
    setData(data)
    console.log("data", data)
  }

  return (
    <>
      <DataTable
        data={data}
        tablePropsData={{
          paginator: true,
          rows: 10,
          scrollable: true,
          scrollHeight: "400px",
          size: "small"
        }}
        tablePropsColumn={{
          sortable: true
        }}
      />
    </>
  )
}

export default DataTablePath
