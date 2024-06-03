import React, { useEffect, useState, useContext } from "react"
//data table
import { MongoDBContext } from "../../components/mongoDB/mongoDBContext"
import { DataTable } from "primereact/datatable"
import { deepCopy } from "../../utilities/staticFunctions"
import { Column } from "primereact/column"
import { set } from "react-hook-form"
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
const DataTableFromDB = ({ data, tablePropsData, tablePropsColumn, customGetColumnsFromData, columns }) => {
  const [header, setHeader] = useState([])
  const [rows, setRows] = useState([])
  const [columsn, setColumns] = useState([{title: "title", props: {}}])

  const { DB, DBData, collectionData } = useContext(MongoDBContext);


  useEffect(() => {
    console.log("data", collectionData)
    if (collectionData != undefined) {
        let keys = Object.keys(collectionData[0]) 
        console.log("keys", keys)
        let newColumns= []
        keys.forEach((key) => {
            newColumns.push({title: key, props: {}})
        })
        setColumns(newColumns)
    }
    }, [data])

    useEffect(() => {
        console.log("Columns", columns)
    }, [columns])


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
      <h1>DataTableFromDB</h1>
      <p>DB: {DB.name}</p>
      
      {/* <DataTable value={data} {...tablePropsData} size="small" scrollable height={"100%"} width={"100%"}>
        
      </DataTable> */}
    </>
  )
}

export default DataTableFromDB
