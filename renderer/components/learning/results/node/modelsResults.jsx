import React, { useState, useEffect } from "react"
import Parameters from "../utilities/parameters"
import DataTable from "../../../dataTypeVisualisation/dataTableWrapper"
import { Column } from "primereact/column"

/**
 * 
 * @param {Object} selectedResults The selected results 
 * @returns {JSX.Element} The ModelsResults component
 */
const ModelsResults = ({ selectedResults }) => {
  const [models, setModels] = useState([])
  const [allModelsData, setAllModelsData] = useState([])
  const [expandedRows, setExpandedRows] = useState([])

  useEffect(() => {
    let models = []
    if (selectedResults.logs.models) {
      Object.keys(selectedResults.logs.models).forEach((key) => {
        models.push(
          Object.assign(selectedResults.logs.models[key], {
            name: key.substring(key.indexOf("-") + 1)
          })
        )
      })
    }
    console.log("models", models)
    setModels(models)
  }, [selectedResults])

  useEffect(() => {
    let allModelsData = []
    if (models.length > 0) {
      models.forEach((model) => {
        let modifiedRow = model.metrics[0]
        modifiedRow["Parameters"] = model.params[0]
        modifiedRow = Object.assign({ Name: model.name }, modifiedRow)
        allModelsData.push(modifiedRow)
      })
    }
    console.log("allModelsData", allModelsData)
    setAllModelsData(allModelsData)
  }, [models])

  const rowExpansionTemplate = (rowData) => {
    return (
      <>
        <Parameters
          params={rowData.Parameters}
          tableProps={{
            size: "small",
            style: { width: "100%" }
          }}
          columnNames={["Parameter", "Value"]}
        />
      </>
    )
  }

  /**
   * @param {Object} data data to display in the table
   * @returns {JSX.Element} A JSX element containing the columns of the data table according to primereact specifications
   */
  const getColumnsFromData = (data) => {
    if (data.length > 0) {
      let toReturn = [
        <Column key="first key" expander={true} style={{ width: "5rem" }} />
      ]
      Object.keys(data[0]).map((key) => {
        if (key != "Parameters") {
          let sortableOpt = key != "Name" ? { sortable: true } : {}
          toReturn.push(
            <Column key={key} field={key} header={key} {...sortableOpt} />
          )
        }
      })
      return toReturn
    }
    return <></>
  }

  return (
    <>
      <DataTable
        data={allModelsData}
        customGetColumnsFromData={getColumnsFromData}
        tablePropsData={{
          scrollable: true,
          scrollHeight: "65vh",
          rowExpansionTemplate: rowExpansionTemplate,
          onRowToggle: (e) => setExpandedRows(e.data),
          expandedRows: expandedRows,
          size: "small"
        }}
      />
    </>
  )
}

export default ModelsResults
