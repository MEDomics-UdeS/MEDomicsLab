import React, { useState, useEffect } from "react"

import MDRCurve from "../resultsComponents/mdrCurve"

import NodeParameters from "../resultsComponents/nodeParams"
import TreeParameters from "../resultsComponents/treeParams"
import FlowWithProvider from "../resultsComponents/treeWorkflow"

const MED3paTestTab = ({ loadedFiles }) => {
  const [buttonClicked, setButtonClicked] = useState("reset")
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState(false)

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
    customThreshold: 100,
    selectedParameter: "",
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
      newItem.className = ""
      let customThreshold = nodeParams.customThreshold
      if (!nodeParams.selectedParameter.endsWith("%")) {
        customThreshold = customThreshold / 100
      }

      if (nodeParams.focusView === "Node information") {
        // Remove metrics and detectron_results
        newItem.value = parseFloat(item.value.toFixed(5))
        if (newItem.value >= customThreshold) {
          newItem.className = "panode-threshold"
        }
        return newItem
      } else {
        // Keep only the metrics defined in nodeParams.metrics
        newItem.metrics = {}

        for (const metric of nodeParams.metrics) {
          if (item.metrics && item.metrics[metric.name]) {
            newItem.metrics[metric.name] = typeof item.metrics[metric.name] === "number" ? parseFloat(item.metrics[metric.name].toFixed(5)) : item.metrics[metric.name]
          }
        }
        if (newItem.metrics[nodeParams.selectedParameter] >= customThreshold) {
          newItem.className = "panode-threshold"
        }
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
        customThreshold: 100,
        selectedParameter: "",
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
    const loadJsonFiles = async () => {
      if (!loadedFiles) return

      try {
        const filteredData = filterData(loadedFiles, treeParams, nodeParams)

        setTreeData(filteredData)
        setLoading(true) // Set loading to true before fetching data

        // Extract the metrics keys from the first item in the filtered data
        if (!metrics) {
          const firstItem = loadedFiles.profiles[0][1][0]

          if (firstItem && firstItem.metrics) {
            setMetrics(Object.keys(firstItem.metrics).map((metric) => ({ name: metric })))
          }
        }
      } catch (error) {
        console.error("Error loading JSON files:", error)
      }
    }

    loadJsonFiles()
  }, [loadedFiles])

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
    <>
      <div style={{ marginTop: "5px", display: "flex", flexDirection: "column", height: "100vh", overflowX: "hidden" }}>
        {fullscreen ? (
          <div style={{ flex: "1", display: "flex", position: "relative" }}>
            <div style={{ position: "absolute", inset: "0", display: "flex", flexDirection: "column" }}>
              {!loading ? <p>Loading tree data...</p> : <FlowWithProvider treeData={treeData} onButtonClicked={handleButtonClicked} onFullScreenClicked={toggleFullscreen} fullscreen={fullscreen} />}
            </div>
          </div>
        ) : (
          <>
            <div className="row" style={{ flex: "0 0 auto", display: "flex" }}>
              <div className="col-md-7 mb-3" style={{ display: "flex", flexDirection: "column" }}>
                <TreeParameters treeParams={treeParams} setTreeParams={updateTreeParams} />
              </div>
              <div className="col-md-5 mb-3" style={{ display: "flex", flexDirection: "column" }}>
                <NodeParameters parentId="test" nodeParams={nodeParams} setNodeParams={setNodeParams} />
              </div>
            </div>
            <div className="row" style={{ flex: "1", display: "flex" }}>
              <div className="col-md-7 mb-3" style={{ display: "flex", flexDirection: "column", flex: "1", paddingRight: "15px" }}>
                {!loading ? <p>Loading tree data...</p> : <FlowWithProvider treeData={treeData} onButtonClicked={handleButtonClicked} onFullScreenClicked={toggleFullscreen} fullscreen={fullscreen} />}
              </div>
              <div className="col-md-5 mb-3" style={{ display: "flex", flexDirection: "column" }}>
                <MDRCurve metricsByDrFile={loadedFiles?.metrics_dr} />
              </div>
            </div>
          </>
        )}
      </div>
    </>
  )
}

export default MED3paTestTab
