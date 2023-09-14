import React, { useEffect, useState } from "react"
import DataTable from "../../../dataTypeVisualisation/dataTableWrapper"
import { loadCSVPath } from "../../../../utilities/fileManagementUtils"

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
          scrollHeight: "400px"
        }}
        tablePropsColumn={{
          sortable: true
        }}
      />
    </>
  )
}

export default DataTablePath
