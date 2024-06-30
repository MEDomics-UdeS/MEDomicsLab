import React, { useState, useEffect } from "react"
import ModulePage from "../mainPages/moduleBasics/modulePage"
import { loadFileFromPathSync, loadJsonPath } from "../../utilities/fileManagementUtils"
import MDRCurve from "./resultsComponents/mdrCurve"
import TreeWorkflow from "./resultsComponents/treeWorkflow"
import NodeParameters from "./resultsComponents/nodeParams"
import TreeParameters from "./resultsComponents/treeParams"
import DetectronResults from "./resultsComponents/detectronResults"
import fs from "fs"
import path from "path"

const MED3paResultsPage = ({ pageId, configPath = "" }) => {
  const [fileData, setFileData] = useState(null)
  const [buttonClicked, setButtonClicked] = useState("reset")
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState(false)
  const [loadedFiles, setLoadedFiles] = useState(null)
  const [treeData, setTreeData] = useState({})
  const [fullscreen, setFullscreen] = useState(false)
  const [metrics, setMetrics] = useState() // State to store the metrics keys
  const [treeParams, setTreeParams] = useState({
    declarationRate: 100,
    maxDepth: 5,
    minConfidenceLevel: 39,
    minSamplesRatio: 0
  })
  const [nodeParams, setNodeParams] = useState({
    focusView: "Node information",
    thresholdEnabled: false,
    customThreshold: 29,
    selectedParameter: "declaration rate",
    metrics: metrics
  })
  const filterData = (data, treeParams, nodeParams) => {
    // Implement your filtering logic based on treeParams and nodeParams
    // This is just an example, replace it with your actual logic
    let filteredData = []

    // Iterate over the top-level keys
    for (const topKey in data.profiles) {
      const topLevel = data.profiles[topKey]

      // Check if the top-level key meets the minSamplesRatio condition
      if (parseInt(topKey) === treeParams.minSamplesRatio) {
        // Iterate over the second-level keys
        for (const subKey in topLevel) {
          // Check if the sub-level key meets the declarationRate condition
          if (parseInt(subKey) === treeParams.declarationRate) {
            // Apply additional filtering based on maxDepth
            const filteredItems = topLevel[subKey].filter((item) => item.path.length <= treeParams.maxDepth)
            filteredData = filteredData.concat(filteredItems)
          }
        }
      }
    }

    // Further filter the items based on nodeParams.focusView
    filteredData = filteredData.map((item) => {
      const newItem = { id: item.id, path: item.path } // Keep id and path

      if (nodeParams.focusView === "Node information") {
        // Remove metrics and detectron_results
        newItem.value = parseFloat(item.value.toFixed(5))
        return newItem
      } else if (nodeParams.focusView === "Covariate-shift probabilities") {
        // Keep only detectron_results
        // eslint-disable-next-line camelcase
        newItem.detectron_results = item.detectron_results
        return newItem
      } else {
        // Keep only the metrics defined in nodeParams.metrics
        newItem.metrics = {}

        for (const metric of nodeParams.metrics) {
          if (item.metrics && item.metrics[metric.name]) {
            newItem.metrics[metric.name] = item.metrics[metric.name]
          }
        }
        console.log("NEW ITEM", newItem.metrics)
        return newItem
      }
    })

    return filteredData
  }

  const handleButtonClicked = (buttonType) => {
    setButtonClicked(buttonType)

    if (buttonType === "reset") {
      setNodeParams({
        focusView: "Node information",
        thresholdEnabled: false,
        customThreshold: 29,
        selectedParameter: "declaration rate",
        metrics: metrics
      })
      setTreeParams({
        declarationRate: 100,
        maxDepth: 5,
        minConfidenceLevel: 39,
        minSamplesRatio: 0
      })
    } else {
      setFilter(!filter)
    }
  }

  const updateTreeParams = (newTreeParams) => {
    setTreeParams(newTreeParams)
  }

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
  }, [])

  useEffect(() => {
    const loadJsonFiles = async () => {
      if (!fileData || !fileData.file_path) return

      try {
        const filenames = fs.readdirSync(fileData.file_path)
        const jsonFiles = filenames.filter((filename) => filename.endsWith(".json"))

        const loadedFiles = jsonFiles.reduce((acc, filename) => {
          const jsonPath = path.join(fileData.file_path, filename)
          const fileContent = loadJsonPath(jsonPath)
          if (fileContent) {
            acc[filename.replace(".json", "")] = fileContent
          }
          return acc
        }, {})

        const filteredData = filterData(loadedFiles, treeParams, nodeParams)
        setLoadedFiles(loadedFiles)

        setTreeData(filteredData)
        setLoading(true) // Set loading to true before fetching data

        // Extract the metrics keys from the first item in the filtered data
        if (!metrics) {
          const firstItem = loadedFiles.profiles[0][1][0]

          if (firstItem && firstItem.metrics) {
            setMetrics(Object.keys(firstItem.metrics))
          }
        }
      } catch (error) {
        console.error("Error loading JSON files:", error)
      }
    }

    loadJsonFiles()
  }, [fileData])

  useEffect(() => {
    const loadFiles = () => {
      if (!loadedFiles) return
      try {
        const filteredData = filterData(loadedFiles, treeParams, nodeParams)
        setTreeData(filteredData)
      } catch (error) {
        console.error("Error loading filtered files:", error)
      }
    }

    loadFiles()
  }, [buttonClicked, filter])

  useEffect(() => {
    console.log("treeData here:", treeData)
  }, [treeData])

  useEffect(() => {
    console.log("treeParams changed to:", treeParams)
  }, [treeParams])

  useEffect(() => {
    console.log("nodeParams changed to:", nodeParams)
  }, [nodeParams])

  useEffect(() => {
    console.log("nodeParams changed to:", nodeParams)
    // Update nodeParams with new metrics
    if (metrics) {
      setNodeParams((prevNodeParams) => ({
        ...prevNodeParams,
        metrics: metrics
      }))
    }
  }, [metrics])
  const toggleFullscreen = () => {
    setFullscreen(!fullscreen) // Toggle fullscreen state
  }

  return (
    <ModulePage pageId={pageId} configPath={configPath}>
      <div style={{ display: "flex", flexDirection: "column", height: "100vh", overflowX: "hidden" }}>
        {fullscreen ? (
          <div style={{ flex: "1", display: "flex", position: "relative" }}>
            <div style={{ position: "absolute", inset: "0", display: "flex", flexDirection: "column" }}>
              {!loading ? <p>Loading tree data...</p> : <TreeWorkflow treeData={treeData} onButtonClicked={handleButtonClicked} onFullScreenClicked={toggleFullscreen} fullscreen={fullscreen} />}
            </div>
          </div>
        ) : (
          <>
            <div className="row" style={{ flex: "0 0 auto", display: "flex" }}>
              <div className="col-md-7 mb-3" style={{ display: "flex", flexDirection: "column" }}>
                <TreeParameters treeParams={treeParams} setTreeParams={updateTreeParams} />
              </div>
              <div className="col-md-5 mb-3" style={{ display: "flex", flexDirection: "column" }}>
                <NodeParameters nodeParams={nodeParams} setNodeParams={setNodeParams} />
              </div>
            </div>
            <div className="row" style={{ flex: "1", display: "flex" }}>
              <div className="col-md-7 mb-3" style={{ display: "flex", flexDirection: "column", flex: "1", paddingRight: "15px" }}>
                {!loading ? <p>Loading tree data...</p> : <TreeWorkflow treeData={treeData} onButtonClicked={handleButtonClicked} onFullScreenClicked={toggleFullscreen} fullscreen={fullscreen} />}
              </div>
              <div className="col-md-5 mb-3" style={{ display: "flex", flexDirection: "column" }}>
                <MDRCurve />
                <DetectronResults />
              </div>
            </div>
          </>
        )}
      </div>
    </ModulePage>
  )
}

export default MED3paResultsPage
