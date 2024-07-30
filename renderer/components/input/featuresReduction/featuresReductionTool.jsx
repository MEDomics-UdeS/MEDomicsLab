import React from "react"
import CreatePCA from "./createPca"
import ApplyPCA from "./applyPca"
import Spearman from "./spearman"
import { TabView, TabPanel } from "primereact/tabview"

/**
 * Component that renders the feature reduction tool
 * @param {Object} props
 * @param {String} props.pageId - The id of the page
 */
const FeatureReductionTool = () => {
  return (
    <>
      <TabView>
        <TabPanel header="PCA">
          <TabView>
            <TabPanel header="Create PCA">
              <CreatePCA />
            </TabPanel>
            <TabPanel header="Apply PCA">
              <ApplyPCA />
            </TabPanel>
          </TabView>
        </TabPanel>
        <TabPanel header="Spearman">
          <Spearman />
        </TabPanel>
      </TabView>
    </>
  )
}

export default FeatureReductionTool
