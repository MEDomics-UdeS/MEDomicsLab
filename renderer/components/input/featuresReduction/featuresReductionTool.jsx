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
// eslint-disable-next-line no-unused-vars
const FeatureReductionTool = ({ pageId = "inputModule", configPath = "" }) => {
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
