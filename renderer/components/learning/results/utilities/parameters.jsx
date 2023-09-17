import React, { useEffect, useState } from "react"
import { DataTable } from "primereact/datatable"
import { Column } from "primereact/column"

const Parameters = ({ params, tableProps, columnNames }) => {
  const [data, setData] = useState([])
  const [selectedRows, setSelectedRows] = useState([])
  useEffect(() => {
    console.log("params", params)
    if (params) {
      let dataList = []
      Object.keys(params).forEach((key) => {
        dataList.push({
          param: key,
          Value: params[key] != null ? params[key] : "null"
        })
      })
      setData(dataList)
    }
  }, [params])

  return (
    <>
      <DataTable
        value={data}
        stripedRows
        {...tableProps}
        selectionMode="multiple"
        selection={selectedRows}
        onSelectionChange={(e) => setSelectedRows(e.value)}
      >
        <Column field="param" header={columnNames[0]} />
        <Column field="Value" header={columnNames[1]} />
      </DataTable>
    </>
  )
}

export default Parameters
