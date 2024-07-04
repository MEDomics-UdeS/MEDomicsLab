import React, { useState, useEffect } from "react"

import MDRCurve from "../resultsComponents/mdrCurve"
import FlowWithProvider from "../resultsComponents/treeWorkflow"
import NodeParameters from "../resultsComponents/nodeParams"
import TreeParameters from "../resultsComponents/treeParams"
import DetectronResults from "../resultsComponents/detectronResults"
import { filterData, filterLost, filterMetrics } from "./tabFunctions"
import LostProfiles from "../resultsComponents/lostProfiles"
import { Typography } from "@mui/material"
import { TbFilterCog } from "react-icons/tb"
import { FaCompress, FaExpand } from "react-icons/fa"
const MED3paEvaluationTab = ({ loadedFiles }) => {
  const [buttonClicked, setButtonClicked] = useState("reset")
  const [loadingTree, setLoadingTree] = useState(false)
  const [loadingCurve, setLoadingCurve] = useState(false)
  const [loadingLost, setLoadingLost] = useState(false)
  const [lostData, setLostData] = useState({})
  const [filter, setFilter] = useState(false)
  const [curveData, setCurveData] = useState({})
  const [treeData, setTreeData] = useState({})
  const [fullscreen, setFullscreen] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [detectronR, setdetectronR] = useState({})
  const [loadingDetectron, setLoadingDetectron] = useState(false)

  const [settings, setSettings] = useState({
    metrics: null,
    strategy: null
  })
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
    metrics: settings.metrics,
    detectronStrategy: settings.strategy
  })

  const handleButtonClicked = (buttonType) => {
    setButtonClicked(buttonType)

    if (buttonType === "reset") {
      setNodeParams({
        focusView: "Node information",
        thresholdEnabled: false,
        customThreshold: 100,
        selectedParameter: "",
        metrics: settings.metrics,
        detectronStrategy: settings.strategy
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
  const updateTreeParams = (newTreeParams) => {
    setTreeParams(newTreeParams)
  }

  useEffect(() => {
    const loadJsonFiles = async () => {
      if (!loadedFiles) return
      console.log("LOADED FILE:", loadedFiles)
      // eslint-disable-next-line camelcase
      const { test, detectron_results } = loadedFiles
      try {
        setdetectronR(detectron_results)
        const filteredData = filterData(test.profiles, treeParams, nodeParams)
        const filteredLost = filterLost(test.lost_profiles, treeParams)

        if (filteredData) {
          setTreeData(filteredData)
          setLoadingTree(true)
        }

        if (test.metrics_dr) {
          setCurveData(test.metrics_dr)
          setLoadingCurve(true)
          setLostData(filteredLost)
          setLoadingLost(true)
        }
        if (detectronR) {
          setLoadingDetectron(true)
        }
        // Extract the metrics keys from the first item in the filtered data
        if (!settings.metrics) {
          const firstItem = test.metrics_dr[0]
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

        if (!settings.strategy) {
          let newStrategy = null
          const foundItem = test.profiles[0]["100"].find((item) => item && item.detectron_results.Executed === "Yes")
          if (foundItem) {
            newStrategy = foundItem.detectron_results["Tests Results"].map((obj) => ({
              name: obj.Strategy
            }))
          }
          setSettings((prevSettings) => ({
            ...prevSettings,
            strategy: newStrategy
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
    const { test } = loadedFiles
    try {
      const filteredData = filterData(test.profiles, treeParams, nodeParams)

      if (filteredData) {
        setTreeData(filteredData)

        setLoadingTree(true) // Set loading to true after fetching data
      }
      const filteredMDRData = filterMetrics(test.metrics_dr, nodeParams)
      const filteredLost = filterLost(test.lost_profiles, treeParams)
      if (filteredMDRData) {
        setCurveData(filteredMDRData)

        setLoadingCurve(true) // Set loading to true after fetching data
        setLostData(filteredLost)
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
    console.log("treeParams changed to:", treeParams)
  }, [treeParams])

  useEffect(() => {
    console.log("nodeParams changed to:", nodeParams)
  }, [nodeParams])

  const toggleFullscreen = () => {
    setFullscreen(!fullscreen) // Toggle fullscreen state
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
                    <NodeParameters parentId="eval" nodeParams={nodeParams} setNodeParams={setNodeParams} settings={settings} />
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
                {!loadingDetectron ? <p>Loading Detectron Results... </p> : <DetectronResults detectronResults={detectronR.detectron_results}></DetectronResults>}
              </div>
            </div>
          </>
        )}
      </div>
    </>
  )
}

export default MED3paEvaluationTab
