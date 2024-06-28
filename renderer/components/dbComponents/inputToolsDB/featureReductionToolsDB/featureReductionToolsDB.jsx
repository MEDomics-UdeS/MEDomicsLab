import React from "react"
import { TabPanel, TabView } from "primereact/tabview"
import SpearmanDB from "./SpearmanDB"
import CreatePCADB from "./CreatePcaDB"
import ApplyPCADB from "./ApplyPcaDB"

const FeatureReductionToolsDB = () => {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "5px"
      }}
    >
      <>
        <TabView>
          <TabPanel header="PCA">
            <TabView>
              <TabPanel header="Create PCA">
                <CreatePCADB />
              </TabPanel>
              <TabPanel header="Apply PCA">
                <ApplyPCADB />
              </TabPanel>
            </TabView>
          </TabPanel>
          <TabPanel header="Spearman">
            <SpearmanDB />
          </TabPanel>
        </TabView>
      </>
    </div>
  )
}

export default FeatureReductionToolsDB
