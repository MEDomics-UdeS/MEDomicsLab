import React from "react"
import { TabPanel, TabView } from "primereact/tabview"
import SpearmanDB from "./SpearmanDB"
import CreatePCADB from "./CreatePcaDB"
import ApplyPCADB from "./ApplyPcaDB"
import { Message } from "primereact/message"

const FeatureReductionToolsDB = ({ currentCollection, DB, refreshData }) => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: "5px"
      }}
    >
      <Message style={{ marginBottom: "15px" }} severity="success" text={`Current Collection: ${currentCollection}`} />
      <TabView>
        <TabPanel header="PCA">
          <TabView>
            <TabPanel header="Create PCA">
              <CreatePCADB currentCollection={currentCollection} DB={DB} refreshData={refreshData} />
            </TabPanel>
            <TabPanel header="Apply PCA">
              <ApplyPCADB currentCollection={currentCollection} DB={DB} refreshData={refreshData} />
            </TabPanel>
          </TabView>
        </TabPanel>
        <TabPanel header="Spearman">
          <SpearmanDB currentCollection={currentCollection} DB={DB} refreshData={refreshData} />
        </TabPanel>
      </TabView>
    </div>
  )
}

export default FeatureReductionToolsDB
