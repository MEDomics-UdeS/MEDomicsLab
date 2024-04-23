import React from "react"
import PCA from "./pca"
import Spearman from "./spearman"
import { TabView, TabPanel } from "primereact/tabview"

/**
 * Component that renders the feature reduction tool
 * @param {Object} props
 * @param {String} props.pageId - The id of the page
 * @param {String} props.configPath - The path of the config file
 */
const FeatureReductionTool = () => {
  return (
    <>
      <TabView>
        <TabPanel header="PCA">
          <PCA />
        </TabPanel>
        <TabPanel header="Spearman">
          <Spearman />
        </TabPanel>
      </TabView>
    </>
  )
}

export default FeatureReductionTool
