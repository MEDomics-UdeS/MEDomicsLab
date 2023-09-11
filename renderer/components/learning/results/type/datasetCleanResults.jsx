import React from "react"
import Parameters from "./parameters"
import DataTableResults from "./dataTableResults"
import { TabView, TabPanel } from "primereact/tabview"

const DatasetCleanResults = ({ selectedResults }) => {
  return (
    <>
      <TabView>
        <TabPanel header="Table" leftIcon="pi pi-fw pi-table ">
          <DataTableResults tableResults={selectedResults.data} />
        </TabPanel>
        <TabPanel header="Params" leftIcon="pi pi-fw pi-cog">
          <Parameters params={selectedResults.logs.setup} />
        </TabPanel>
      </TabView>
    </>
  )
}

export default DatasetCleanResults
