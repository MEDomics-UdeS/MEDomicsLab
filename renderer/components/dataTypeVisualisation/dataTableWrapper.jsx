import React, { useEffect, useState } from "react"
import { loadCSVPath } from "../../utilities/fileManagementUtils"
//data table
import { DataTable } from "primereact/datatable"
import { Column } from "primereact/column"
// refer to https://primereact.org/datatable/

/**
 *
 * @param {Object} data data to display in the table
 * @param {Object} tablePropsData props to pass to the data
 * @param {Object} tablePropsColumn props to pass to the columns
 * @returns {JSX.Element} A JSX element containing the data table
 * @description This component is a wrapper for the primereact datatable. It is used to display data in a table.
 */
const DataTableWrapper = ({
  data,
  tablePropsData,
  tablePropsColumn,
  customGetColumnsFromData
}) => {
  const [header, setHeader] = useState([])
  const [rows, setRows] = useState([])

  useEffect(() => {
    console.log("dataTable data refreshed: ", data)
    if (data != undefined) {
      setRows(data)
      customGetColumnsFromData
        ? setHeader(customGetColumnsFromData(data))
        : setHeader(getColumnsFromData(data))
    }
  }, [data])

  /**
   * @param {Object} data data to display in the table
   * @returns {JSX.Element} A JSX element containing the columns of the data table according to primereact specifications
   */
  const getColumnsFromData = (data) => {
    if (data.length > 0) {
      return Object.keys(data[0]).map((key) => (
        <Column key={key} field={key} header={key} {...tablePropsColumn} />
      ))
    }
    return <></>
  }

  return (
    <>
      <DataTable value={rows} {...tablePropsData}>
        {header}
      </DataTable>
    </>
  )
}

export default DataTableWrapper
