import React from "react"
import Parameters from "../utilities/parameters"
import DataTablePath from "../utilities/dataTablePath"
import { Accordion, AccordionTab } from "primereact/accordion"
import { ScrollPanel } from "primereact/scrollpanel"

const DataParamResults = ({ selectedResults }) => {
  return (
    <>
      <ScrollPanel style={{ width: "100%", height: "60vh" }}>
        <Accordion className="data-param-results-accordion">
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
        </Accordion>
        <DataTablePath path={selectedResults.data.paths[0]} />
      </ScrollPanel>
    </>
  )
}

export default DataParamResults
