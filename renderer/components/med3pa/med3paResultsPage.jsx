import React, { useState, useEffect } from "react"
import ModulePage from "../mainPages/moduleBasics/modulePage"
import { loadFileFromPathSync } from "../../utilities/fileManagementUtils"
import { Tabs, Tab } from "react-bootstrap"
import "bootstrap/dist/css/bootstrap.min.css"

import MED3paResultsTab from "./resultTabs/med3paResultsTab.jsx"
import DetectronResults from "./resultsComponents/detectronResults.jsx"
import MED3paConfigTab from "./resultTabs/med3paConfigTab.jsx"
import MED3paCompareResults from "./med3paCompareResults.jsx"

/**
 *
 * @param {string} pageId The ID of the page.
 * @param {string} [configPath=""] The path to the configuration file.
 * @returns {JSX.Element} A JSX element rendering a ModulePage showing results or results comparison.
 *
 * @description
 * MED3paResultsPage component displays two types of pages:
 * - General Experiment Results page: For displaying results of an experiment and its configuration information.
 * - Comparison between Experiment Results Page: For displaying comparative information and configuration information.
 */
const MED3paResultsPage = ({ pageId, configPath = "" }) => {
  const [fileData, setFileData] = useState(null) // Loaded Page Files
  const [activeTab, setActiveTab] = useState("reference") // Active Tab if it's a resultsPage

  // Load the file data when configPath is initialized
  useEffect(() => {
    if (configPath) {
      loadFileFromPathSync(configPath)
        .then((data) => {
          setFileData(data)
        })
        .catch((err) => {
          console.error("Error reading results:", err)
        })
    }
  }, [configPath])

  // Set active tabs based on fileData changes
  useEffect(() => {
    if (fileData) {
      console.log("FILEDATA:", fileData)

      // Determine the initial active tab based on experiment type

      if (fileData.loadedFiles && fileData.isDetectron) {
        setActiveTab("results") // Set to "results" if Detectron experiment
      } else {
        setActiveTab("reference") // Set to "reference" for non-Detectron experiment
      }
    }
  }, [fileData])

  // If fileData is not initialized return an empty Module Page
  if (!fileData) {
    return <ModulePage pageId={pageId} configPath={configPath} />
  }

  // Return Experiment Results Tabs
  return (
    <ModulePage pageId={pageId} configPath={configPath}>
      {!fileData.loadedFiles ? (
        <MED3paCompareResults file={fileData} />
      ) : (
        <div>
          {fileData.isDetectron && fileData.loadedFiles ? (
            <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k)}>
              <Tab eventKey="results" title="Configuration Results">
                <DetectronResults detectronResults={fileData.loadedFiles.detectron_results} />
              </Tab>
              <Tab eventKey="infoConfig" title="Configuration Information">
                <MED3paConfigTab loadedFiles={fileData.loadedFiles?.experiment_config} />
              </Tab>
            </Tabs>
          ) : (
            <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k)}>
              <Tab eventKey="reference" title="Reference Set Results">
                <MED3paResultsTab loadedFiles={fileData.loadedFiles.reference} type="test" />
              </Tab>
              <Tab eventKey="test" title="Test Set Results">
                <MED3paResultsTab loadedFiles={{ ...fileData.loadedFiles.test, ...fileData.loadedFiles.detectron_results }} type="eval" />
              </Tab>
              <Tab eventKey="infoConfig" title="Configuration Information">
                <MED3paConfigTab loadedFiles={fileData.loadedFiles?.infoConfig.experiment_config} />
              </Tab>
            </Tabs>
          )}
        </div>
      )}
    </ModulePage>
  )
}

export default MED3paResultsPage
