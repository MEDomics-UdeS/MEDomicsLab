import React, { useEffect, useState } from "react"
import DataTable from "../../../dataTypeVisualisation/dataTableWrapper"
import { loadCSVPath } from "../../../../utilities/fileManagementUtils"

const DataTableResults = ({ tableResults }) => {
  const [data, setData] = useState([])

  useEffect(() => {
    loadCSVPath(tableResults.paths[0], whenDataLoaded)
  }, [])

  const whenDataLoaded = (data) => {
    setData(data)
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

export default DataTableResults
