import React from "react"
import Parameters from "../utilities/parameters"
import DataTableResults from "../utilities/dataTableResults"
import { TabView, TabPanel } from "primereact/tabview"
import { Accordion, AccordionTab } from "primereact/accordion"
import { ScrollPanel } from "primereact/scrollpanel"

const DataParamResults = ({ selectedResults }) => {
  return (
    <>
      {/* <TabView>
        <TabPanel header="Table" rightIcon="pi pi-fw pi-table ">
          <DataTableResults tableResults={selectedResults.data} />
        </TabPanel>
        <TabPanel header="Params" rightIcon="pi pi-fw pi-cog">
          <Parameters
            params={selectedResults.logs.setup}
            tableProps={{
              scrollable: true,
              scrollHeight: "400px"
            }}
            columnNames={["Parameter", "Value"]}
          />
        </TabPanel>
      </TabView> */}
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
        <DataTableResults tableResults={selectedResults.data} />
      </ScrollPanel>
    </>
  )
}

export default DataParamResults
