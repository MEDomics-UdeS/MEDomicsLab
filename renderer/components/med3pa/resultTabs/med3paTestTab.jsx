import React, { useState, useEffect } from "react"

import MDRCurve from "../resultsComponents/mdrCurve"
import { FaExpand, FaCompress } from "react-icons/fa" // Import the icons
import NodeParameters from "../resultsComponents/nodeParams"
import TreeParameters from "../resultsComponents/treeParams"
import FlowWithProvider from "../resultsComponents/treeWorkflow"
import { filterData, filterLost, filterMetrics } from "./tabFunctions"
import LostProfiles from "../resultsComponents/lostProfiles"
import { Typography } from "@mui/material"
import { TbFilterCog } from "react-icons/tb"

const MED3paTestTab = ({ loadedFiles }) => {
  const [buttonClicked, setButtonClicked] = useState("reset")
  const [loadingTree, setLoadingTree] = useState(false)
  const [loadingLost, setLoadingLost] = useState(false)
  const [loadingCurve, setLoadingCurve] = useState(false)

  const [isExpanded, setIsExpanded] = useState(false)

  const [settings, setSettings] = useState({
    metrics: null,
    strategy: null
  })
  const [filter, setFilter] = useState(false)

  const [treeData, setTreeData] = useState({})
  const [lostData, setLostData] = useState({})

  const [fullscreen, setFullscreen] = useState(false)
  const [curveData, setCurveData] = useState({})
  const [treeParams, setTreeParams] = useState({
    declarationRate: 100,
    maxDepth: 5,
    minConfidenceLevel: 1,
    minSamplesRatio: 0
  })
  const [nodeParams, setNodeParams] = useState({
    focusView: "Node information",
    thresholdEnabled: false,
    customThreshold: 100,
    selectedParameter: "",
    metrics: settings.metrics
  })

  const handleButtonClicked = (buttonType) => {
    setButtonClicked(buttonType)

    if (buttonType === "reset") {
      setNodeParams({
        focusView: "Node information",
        thresholdEnabled: false,
        customThreshold: 100,
        selectedParameter: "",
        metrics: settings.metrics
      })
      setTreeParams({
        declarationRate: 100,
        maxDepth: 5,
        minConfidenceLevel: 1,
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
        const filteredData = filterData(loadedFiles.profiles, treeParams, nodeParams)
        const filteredLost = filterLost(loadedFiles.lost_profiles, treeParams)
        if (filteredData) {
          setTreeData(filteredData)
          setLostData(filteredLost)
          setLoadingTree(true)
        }

        if (loadedFiles.metrics_dr) {
          setCurveData(loadedFiles.metrics_dr)
          setLoadingCurve(true)
          setLoadingLost(true)
        }

        // Extract the metrics keys from the first item in the filtered data
        if (!settings.metrics) {
          const firstItem = loadedFiles.metrics_dr[0]
          let newMetrics = null
          if (firstItem && firstItem.metrics) {
            newMetrics = Object.keys(firstItem.metrics).map((metric) => ({
              name: metric
            }))
          }
          setSettings((prevSettings) => ({
            ...prevSettings,
            metrics: newMetrics
          }))
        }
      } catch (error) {
        console.error("Error loading JSON files:", error)
      }
    }

    loadJsonFiles()
  }, [loadedFiles])
  const loadFiles = () => {
    if (!loadedFiles) return

    try {
      const filteredData = filterData(loadedFiles.profiles, treeParams, nodeParams)
      const filteredLost = filterLost(loadedFiles.lost_profiles, treeParams)
      if (filteredData || filteredLost) {
        setTreeData(filteredData)
        setLostData(filteredLost)
        setLoadingTree(true) // Set loading to true after fetching data
      }
      const filteredMDRData = filterMetrics(loadedFiles.metrics_dr, nodeParams)

      if (filteredMDRData) {
        setCurveData(filteredMDRData)
        setLoadingCurve(true) // Set loading to true after fetching data
        setLoadingLost(true)
      }
    } catch (error) {
      console.error("Error loading files:", error)
    }
  }
  useEffect(() => {
    loadFiles()
  }, [buttonClicked, filter])

  useEffect(() => {
    console.log("treeData here:", treeData)
  }, [treeData])
  useEffect(() => {
    console.log("curveData changed to:", curveData)
  }, [curveData])

  useEffect(() => {
    console.log("treeParams changed to:", treeParams)
  }, [treeParams])

  useEffect(() => {
    console.log("nodeParams changed to:", nodeParams)
  }, [nodeParams])

  useEffect(() => {
    if (!loadedFiles || !loadedFiles.metrics_dr || treeParams.declarationRate === undefined) return

    // Access the metrics_dr based on declarationRate
    const declarationRateKey = String(treeParams.declarationRate)
    const values = loadedFiles.metrics_dr[declarationRateKey]

    if (values) {
      setTreeParams((prevTreeParams) => ({
        ...prevTreeParams,
        minConfidenceLevel: values.min_confidence_level
      }))
    }
  }, [treeParams.declarationRate])

  const toggleFullscreen = () => {
    // Toggle fullscreen state
    setFullscreen(!fullscreen)
  }
  const toggleExpand = () => {
    setIsExpanded(!isExpanded) // Toggle expand/minimize state
  }
  return (
    <>
      <div style={{ marginTop: "5px", display: "flex", flexDirection: "column", overflowX: "hidden", overflowY: "auto" }}>
        {fullscreen ? (
          <div className="fullscreen-container">
            <div className="fullscreen-treeWorkflow">
              {!loadingTree ? (
                <p>Loading tree data...</p>
              ) : (
                <FlowWithProvider treeData={treeData} onButtonClicked={handleButtonClicked} onFullScreenClicked={toggleFullscreen} fullscreen={fullscreen} />
              )}
            </div>
          </div>
        ) : (
          <>
            <div className="card mb-3">
              <div className="card-header d-flex justify-content-between align-items-center">
                <Typography variant="h6" style={{ color: "#868686", fontSize: "1.2rem", display: "flex", alignItems: "center" }}>
                  <TbFilterCog style={{ marginRight: "0.5rem", fontSize: "1.7rem" }} />
                  Filter Results
                </Typography>
                <hr style={{ borderColor: "#868686", borderWidth: "0.5px" }} />
                <button className="btn btn-link p-0" onClick={toggleExpand}>
                  {isExpanded ? <FaCompress /> : <FaExpand />}
                </button>
              </div>
              {isExpanded ? (
                <div className="row" style={{ flex: "0 0 auto", display: "flex", padding: "1%" }}>
                  <div className="col-md-7 mb-3" style={{ display: "flex", flexDirection: "column" }}>
                    <TreeParameters treeParams={treeParams} setTreeParams={updateTreeParams} />
                  </div>
                  <div className="col-md-5 mb-3" style={{ display: "flex", flex: "1", flexDirection: "column", height: "100%" }}>
                    <NodeParameters parentId="test" nodeParams={nodeParams} setNodeParams={setNodeParams} settings={settings} />
                  </div>
                </div>
              ) : (
                <p></p>
              )}
            </div>

            <div className="row" style={{ flex: "1", display: "flex" }}>
              <div className="col-md-7 mb-3" style={{ display: "flex", flexDirection: "column", flex: "1", paddingRight: "15px" }}>
                {!loadingTree ? (
                  <p>Loading tree data...</p>
                ) : (
                  <FlowWithProvider treeData={treeData} onButtonClicked={handleButtonClicked} onFullScreenClicked={toggleFullscreen} fullscreen={fullscreen} />
                )}
              </div>
              <div className="col-md-5 mb-3" style={{ flex: "1", display: "flex", flexDirection: "column" }}>
                {!loadingCurve ? <p>Loading CURVE data...</p> : <MDRCurve curveData={curveData} />}
                {!loadingLost ? <p>Loading tree data...</p> : <LostProfiles lostData={lostData} />}
              </div>
            </div>
          </>
        )}
      </div>
    </>
  )
}

export default MED3paTestTab
