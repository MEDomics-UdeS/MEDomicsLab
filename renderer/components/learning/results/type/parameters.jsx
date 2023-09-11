import React, { useEffect, useState } from "react"
import { DataTable } from "primereact/datatable"
import { Column } from "primereact/column"

const Parameters = ({ params }) => {
  const [data, setData] = useState([])
  useEffect(() => {
    console.log("params", params)
    if (params) {
      let dataList = []
      Object.keys(params).forEach((key) => {
        dataList.push({ Parameter: key, Value: params[key] })
      })
      setData(dataList)
    }
  }, [params])

  return (
    <>
      <DataTable value={data} stripedRows scrollable scrollHeight="400px">
        <Column field="Parameter" header="Parameter"></Column>
        <Column field="Value" header="Value"></Column>
      </DataTable>
    </>
  )
}

export default Parameters
