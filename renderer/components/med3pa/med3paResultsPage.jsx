import React, { useState, useEffect } from "react"
import ModulePage from "../mainPages/moduleBasics/modulePage"
import { loadFileFromPathSync, loadJsonPath } from "../../utilities/fileManagementUtils"
import fs from "fs"
import path from "path"
import { Tabs, Tab } from "react-bootstrap"
import "bootstrap/dist/css/bootstrap.min.css"

import MED3paCompareTab from "./resultTabs/med3paCompareTab.jsx"
import MED3paResultsTab from "./resultTabs/med3paResultsTab.jsx"
import DetectronResults from "./resultsComponents/detectronResults.jsx"

const MED3paResultsPage = ({ pageId, configPath = "" }) => {
  const [fileData, setFileData] = useState(null)
  const [loadedFiles, setLoadedFiles] = useState({})
  const [activeTab, setActiveTab] = useState("reference")
  const [isDetectron, setIsDetectron] = useState(false)
  const [loaded, setLoaded] = useState(false)

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
        const testFiles = {}
        let testFilePath
        let detectronFilePath
        const parentFolderName = path.basename(fileData.file_path)
        if (parentFolderName.startsWith("detectron")) {
          setIsDetectron(true)
          detectronFilePath = path.join(fileData.file_path, "detectron_results")
          loadJsonFiles(detectronFilePath)
            .then((detectronFiles) => {
              setLoadedFiles((prevState) => ({
                ...prevState,
                detectronResults: detectronFiles
              }))
            })

            .catch((error) => {
              console.error("Error loading detectron files:", error)
            })
        } else {
          if (tab === "reference") {
            filePath = path.join(fileData.file_path, "reference")
          } else if (tab === "test") {
            const parentFolderName = path.basename(fileData.file_path)
            if (parentFolderName.startsWith("det")) {
              testFilePath = path.join(fileData.file_path, "test")
              detectronFilePath = path.join(fileData.file_path, "detectron_results")
            }

            loadJsonFiles(testFilePath)
              .then((files) => {
                testFiles["test"] = files
                return loadJsonFiles(detectronFilePath)
              })
              .then((detectronFiles) => {
                testFiles["detectron_results"] = detectronFiles
                setLoadedFiles((prevState) => ({
                  ...prevState,
                  [tab]: testFiles
                }))
              })
              .catch((error) => {
                console.error("Error loading files:", error)
              })
          } else if (parentFolderName.startsWith("med3")) {
            filePath = path.join(fileData.file_path, "test")
          }

          if (filePath) {
            loadJsonFiles(filePath)
              .then((files) => {
                setLoadedFiles((prevState) => ({
                  ...prevState,
                  [tab]: files
                }))
              })
              .catch((error) => {
                console.error("Error loading files:", error)
              })
          }
        }
      })
    }
  }, [fileData])

  useEffect(() => {
    if (loadedFiles.detectronResults) {
      console.log("TEST HERE:", loadedFiles.detectronResults)
      setLoaded(true)
    }
  }, [isDetectron, loadedFiles])

  useEffect(() => {
    console.log("Render condition:", isDetectron && loaded)
  }, [isDetectron, loaded])

  return (
    <ModulePage pageId={pageId} configPath={configPath}>
      {isDetectron && loaded ? (
        <DetectronResults detectronResults={loadedFiles.detectronResults.detectron_results} />
      ) : (
        <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k)}>
          <Tab eventKey="reference" title="Test Set Results">
            <MED3paResultsTab loadedFiles={loadedFiles["reference"]} type="test" />
          </Tab>
          <Tab eventKey="test" title="Evaluation Set Results">
            <MED3paResultsTab loadedFiles={loadedFiles["test"]} type="eval" />
          </Tab>
          <Tab eventKey="compare" title="Compare Sets Results">
            <MED3paCompareTab loadedReferenceFiles={loadedFiles["reference"]} loadedTestFiles={loadedFiles["test"]} />
          </Tab>
        </Tabs>
      )}
    </ModulePage>
  )
}

export default MED3paResultsPage
