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
const DataTableFromDB = ({ data, tablePropsData, tablePropsColumn, customGetColumnsFromData }) => {
  const [columns, setColumns] = useState([{title: "title", props: {}}])
    const [values, setValues] = useState([{value: "value", props: {}}])

  const { DB, DBData, collectionData } = useContext(MongoDBContext);


  useEffect(() => {
    console.log("data", collectionData)
    if (collectionData !== undefined) {
        let keys = Object.keys(collectionData[0])
        console.log("keys", keys)
        let newColumns= []
        keys.forEach((key) => {
            newColumns.push({title: key, props: {}})
        })

        let values = Object.values(collectionData[0])
        console.log("values", values)
        let newValues = []
        values.forEach((value) => {
            newValues.push({value: value, props: {}})
        })
        setColumns(newColumns)
        setValues(newValues)
    }
    }, [data])

    useEffect(() => {
        console.log("Columns", columns)
    }, [columns])

    useEffect(() => {
        console.log("value", values)
    }, [values]);

  return (
    <>
        <DataTable value={collectionData}>
            {columns.map((column) => {
                return <Column header={column.title} />
            })}
        </DataTable>
    </>
  )
}

export default DataTableFromDB
