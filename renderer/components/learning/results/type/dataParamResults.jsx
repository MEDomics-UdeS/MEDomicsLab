import React from "react"
import Parameters from "./parameters"
import DataTableResults from "./dataTableResults"
import { TabView, TabPanel } from "primereact/tabview"

const DataParamResults = ({ selectedResults }) => {
  return (
    <>
      <TabView>
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
      </TabView>
    </>
  )
}

export default DataParamResults
