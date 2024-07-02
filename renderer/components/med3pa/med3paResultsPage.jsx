import React, { useState, useEffect } from "react"
import ModulePage from "../mainPages/moduleBasics/modulePage"
import { loadFileFromPathSync, loadJsonPath } from "../../utilities/fileManagementUtils"
import fs from "fs"
import path from "path"
import { Tabs, Tab } from "react-bootstrap"
import "bootstrap/dist/css/bootstrap.min.css"
import MED3paTestTab from "./resultTabs/med3paTestTab"
import MED3paEvaluationTab from "./resultTabs/med3paEvaluationTab"
import MED3paCompareTab from "./resultTabs/med3paCompareTab.jsx"

const MED3paResultsPage = ({ pageId, configPath = "" }) => {
  const [fileData, setFileData] = useState(null)
  const [loadedFiles, setLoadedFiles] = useState({})
  const [activeTab, setActiveTab] = useState("reference")

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

  const loadJsonFiles = async (dirPath) => {
    if (!dirPath) return {}

    const readJsonFiles = (currentPath) => {
      let filenames
      try {
        filenames = fs.readdirSync(currentPath)
      } catch (error) {
        console.error("Error reading directory:", error)
        return {}
      }

      return filenames.reduce((acc, filename) => {
        const fullPath = path.join(currentPath, filename)
        if (filename.endsWith(".json")) {
          const fileContent = loadJsonPath(fullPath)
          if (fileContent) {
            acc[filename.replace(".json", "")] = fileContent
          }
        }
        return acc
      }, {})
    }

    try {
      const loadedFiles = readJsonFiles(dirPath)
      return loadedFiles
    } catch (error) {
      console.error("Error loading JSON files:", error)
      return {}
    }
  }

  useEffect(() => {
    if (fileData) {
      const tabs = ["reference", "test"]
      tabs.forEach((tab) => {
        let filePath = null
        if (tab === "reference") {
          filePath = path.join(fileData.file_path, "reference")
        } else if (tab === "test") {
          const parentFolderName = path.basename(fileData.file_path)
          if (parentFolderName.startsWith("det")) {
            filePath = path.join(fileData.file_path, "detectron_results")
          }
          if (parentFolderName.startsWith("det3") || parentFolderName.startsWith("med3")) {
            filePath = path.join(fileData.file_path, "test")
          }
        }

        if (filePath) {
          loadJsonFiles(filePath).then((files) => {
            setLoadedFiles((prevState) => ({ ...prevState, [tab]: files }))
          })
        }
      })
    }
  }, [fileData])

  return (
    <ModulePage pageId={pageId} configPath={configPath}>
      <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k)}>
        <Tab eventKey="reference" title="Test Set Results">
          <MED3paTestTab loadedFiles={loadedFiles["reference"]} />
        </Tab>
        <Tab eventKey="test" title="Evaluation Set Results">
          <MED3paEvaluationTab loadedFiles={loadedFiles["test"]} />
        </Tab>
        <Tab eventKey="compare" title="Compare Sets Results">
          <MED3paCompareTab loadedReferenceFiles={loadedFiles["reference"]} loadedTestFiles={loadedFiles["test"]} />
        </Tab>
      </Tabs>
    </ModulePage>
  )
}

export default MED3paResultsPage
