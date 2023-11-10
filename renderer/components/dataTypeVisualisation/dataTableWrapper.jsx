import React, { useEffect, useState } from "react"
//data table
import { DataTable } from "primereact/datatable"
import { deepCopy } from "../../utilities/staticFunctions"
import { Column } from "primereact/column"
// refer to https://primereact.org/datatable/

/**
 *
 * @param {Object} data data to display in the table. should be an array of arrays or an array of dictionaries
 * @param {Object} tablePropsData props to pass to the data
 * @param {Object} tablePropsColumn props to pass to the columns
 * @param {Function} customGetColumnsFromData function to get the columns from the data
 * @param {Array[Object]} columns Optional. If provided, the columns to display in the table
 * @returns {JSX.Element} A JSX element containing the data table
 * @description This component is a wrapper for the primereact datatable. It is used to display data in a table.
 */
const DataTableWrapper = ({ data, tablePropsData, tablePropsColumn, customGetColumnsFromData, columns }) => {
  const [header, setHeader] = useState([])
  const [rows, setRows] = useState([])

  useEffect(() => {
    if (data != undefined) {
      const extractedHeader = getColumnsFromData(data)
      setHeader(extractedHeader)
      // Remove header from data if its an array or arrays to avoid keeping it on rows
      let rows = deepCopy(data)
      if (Array.isArray(rows[0])) {
        rows.shift()
      }
      setRows(rows)
      customGetColumnsFromData ? setHeader(customGetColumnsFromData(data)) : setHeader(getColumnsFromData(data))
    }
  }, [data])

  /**
   * @param {Object} data data to display in the table
   * @returns {JSX.Element} A JSX element containing the columns of the data table according to primereact specifications
   */
  const getColumnsFromData = (data) => {
    if (data.length > 0) {
      // Depending of data type the process is different
      if (Array.isArray(data[0])) {
        // Case data is an array of arrays
        let keys = Object.keys(data[0])
        return keys.map((key) => {
          return <Column key={key} field={key} header={data[0][key]} {...tablePropsColumn} />
        })
      } else {
        // Case data is an array of dictionaries
        return Object.keys(data[0]).map((key) => <Column key={key} field={key} header={key} {...tablePropsColumn} />)
      }
    }

    return <></>
  }

  return (
    <>
      <DataTable value={rows} {...tablePropsData} size="small" scrollable height={"100%"} width={"100%"}>
        {columns ? columns.map((col) => <Column key={col.title} field={col.title} header={col.title} {...col.props} />) : header}
      </DataTable>
    </>
  )
}

export default DataTableWrapper
