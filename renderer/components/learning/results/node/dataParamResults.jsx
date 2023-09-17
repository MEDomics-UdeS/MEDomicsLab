import React from "react"
import Parameters from "../utilities/parameters"
import DataTablePath from "../utilities/dataTablePath"
import { Accordion, AccordionTab } from "primereact/accordion"

const DataParamResults = ({ selectedResults }) => {
  return (
    <>
      <Accordion multiple className="data-param-results-accordion">
        <AccordionTab header="Parameters">
          <Parameters
            params={selectedResults.logs.setup}
            tableProps={{
              scrollable: true,
              scrollHeight: "400px",
              size: "small"
            }}
            columnNames={["Parameter", "Value"]}
          />
        </AccordionTab>
        <AccordionTab header="Data">
          <div className="card">
            <DataTablePath path={selectedResults.data.paths[0]} />
          </div>
        </AccordionTab>
      </Accordion>
    </>
  )
}

export default DataParamResults
