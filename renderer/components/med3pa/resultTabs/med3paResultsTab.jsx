/* eslint-disable camelcase */
import React, { useState, useEffect } from "react"

import MDRCurve from "../resultsComponents/mdrCurve"
import FlowWithProvider from "../resultsComponents/treeWorkflow"

import DetectronResults from "../resultsComponents/detectronResults"
import { filterData, filterMetrics, isLost, isSubPath } from "./tabFunctions"
import LostProfiles from "../resultsComponents/lostProfiles"
import ResultsFilter from "../resultsComponents/resultsFilter"
const MED3paResultsTab = ({ loadedFiles, type }) => {
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
  const [prevSelectedId, setPrevSelectedId] = useState(null)
  const [currentSelectedId, setCurrentSelectedId] = useState(null)

  const [detectronR, setdetectronR] = useState()
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
    customThreshold: 0,
    selectedParameter: "",
    metrics: null,
    detectronStrategy: settings.strategy
  })
  // Function to determine and format loaded files based on type
  const formatDisplay = (loadedFiles, type) => {
    let test, detectronResults

    if (type === "eval") {
      // eslint-disable-next-line no-unused-vars
      const { detectron_results, ...rest } = loadedFiles

      detectronResults = detectron_results
      test = rest
    } else {
      test = loadedFiles
      detectronResults = null
    }

    return { test, detectronResults }
  }
  const handleButtonClicked = (buttonType) => {
    setButtonClicked(buttonType)

    if (buttonType === "reset") {
      setNodeParams({
        focusView: "Node information",
        thresholdEnabled: false,
        customThreshold: 0,
        selectedParameter: "",
        metrics: settings.metrics.filter((item) => ["Auc", "Accuracy", "F1Score", "Recall"].includes(item.name)) || null,
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

      const { test, detectronResults } = formatDisplay(loadedFiles, type)

      try {
        if (detectronResults) {
          setdetectronR(detectronResults)

          if (!settings.strategy) {
            let newStrategy = []
            detectronResults.forEach((result) => {
              newStrategy.push({ name: result.Strategy })
            })

            setSettings((prevSettings) => ({
              ...prevSettings,
              strategy: newStrategy
            }))
          }
        }
        if (!test) return

        if (test.metrics_dr) {
          if (!settings.metrics) {
            const firstItem = test.metrics_dr[0]
            let newMetrics = null

            if (firstItem && firstItem.metrics) {
              newMetrics = Object.keys(firstItem.metrics)
                .filter((metric) => metric !== "LogLoss") // Filter out "LogLoss"
                .map((metric) => ({
                  name: metric
                }))
            }

            setSettings((prevSettings) => ({
              ...prevSettings,
              metrics: newMetrics
            }))
          }

          const filteredMDRData = filterMetrics(test.metrics_dr, nodeParams)
          setCurveData(filteredMDRData)
          setLoadingCurve(true)
        }
        if (!test.profiles) return

        const filteredData = filterData(
          test.profiles[treeParams.minSamplesRatio][treeParams.declarationRate],
          test.lost_profiles[treeParams.minSamplesRatio][treeParams.declarationRate],
          nodeParams,
          treeParams.maxDepth
        )

        if (filteredData) {
          setTreeData(filteredData)

          setLostData(test.lost_profiles[treeParams.minSamplesRatio])

          if (detectronR) {
            setTimeout(() => {
              setLoadingDetectron(true)
            }, 3000)
          }
          setLoadingLost(true)

          setTimeout(() => {
            setLoadingTree(true)
          }, 500)
        }
      } catch (error) {
        console.error("Error loading JSON files:", error)
      }
    }

    loadJsonFiles()
  }, [loadedFiles])

  const loadFiles = () => {
    if (!loadedFiles) return

    const { test } = formatDisplay(loadedFiles, type)

    try {
      if (!test) return

      const filteredMDRData = filterMetrics(test.metrics_dr, nodeParams)
      if (filteredMDRData) {
        setCurveData(filteredMDRData)
        setLoadingCurve(true) // Set loading to true after fetching data
      }

      if (!test.profiles) return

      const filteredData = filterData(
        test.profiles[treeParams.minSamplesRatio][treeParams.declarationRate],
        test.lost_profiles[treeParams.minSamplesRatio][treeParams.declarationRate],
        nodeParams,
        treeParams.maxDepth
      )

      if (filteredData) {
        setTreeData(filteredData)

        setLoadingLost(true)
        setLostData(test.lost_profiles[treeParams.minSamplesRatio])
        setTimeout(() => {
          setLoadingTree(true)
        }, 500)
        if (detectronR) {
          setTimeout(() => {
            setLoadingDetectron(true)
          }, 1000)
        }
      }
    } catch (error) {
      console.error("Error loading files:", error)
    }
  }
  useEffect(() => {
    loadFiles()
  }, [buttonClicked, filter])

  // Handle element click function
  const handleElementClick = (data) => {
    setCurrentSelectedId(data.data["value"][0])
    setTreeData((prevTreeData) => {
      let dataPathArray = data.data.name.split("\n").map((pathItem) => pathItem.trim())
      if (dataPathArray[0] === "") {
        dataPathArray = ["*"]
      } else {
        dataPathArray = ["*", ...dataPathArray]
      }

      const resetAllClassNames = data.data.id === prevSelectedId?.data.id

      const updatedTreeData = prevTreeData.map((item) => {
        if (resetAllClassNames) {
          setCurrentSelectedId(null)
          if (isLost(item)) {
            return { ...item, className: "panode-lost" }
          }
          return { ...item, className: "" }
        } else if (item.id === data.data.id && isLost(item)) {
          return { ...item, className: "panode-lost-dr" }
        } else if (isSubPath(item.path, dataPathArray)) {
          return { ...item, className: data.className }
        } else {
          return { ...item, className: "panode-notimportant" }
        }
      })
      // Update prevSelectedId

      if (resetAllClassNames) {
        setPrevSelectedId(null)
      } else {
        setPrevSelectedId(data)
      }

      return updatedTreeData
    })
  }

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

    if (fullscreen) {
      setLoadingTree(false)
      setTimeout(() => {
        setLoadingTree(true)
      }, 300)
    }
  }
  const toggleExpand = () => {
    setIsExpanded(!isExpanded) // Toggle expand/minimize state
  }
  return (
    <>
      <div style={{ marginTop: "5px", display: "flex", flexDirection: "column", overflowX: "hidden", overflowY: "hidden" }}>
        {fullscreen ? (
          <div className="fullscreen-container">
            <div className="fullscreen-treeWorkflow">
              {!loadingTree ? (
                <p>Loading tree data...</p>
              ) : (
                <FlowWithProvider
                  treeData={treeData}
                  maxDepth={treeParams.maxDepth}
                  customThreshold={nodeParams.customThreshold}
                  onButtonClicked={handleButtonClicked}
                  onFullScreenClicked={toggleFullscreen}
                  fullscreen={fullscreen}
                />
              )}
            </div>
          </div>
        ) : (
          <>
            {!loadingLost && !loadingTree && loadingCurve ? (
              <>
                <ResultsFilter
                  isExpanded={isExpanded}
                  toggleExpand={toggleExpand}
                  treeParams={treeParams}
                  updateTreeParams={updateTreeParams}
                  nodeParams={nodeParams}
                  setNodeParams={setNodeParams}
                  type={type}
                  settings={settings}
                  tree={false}
                />

                <MDRCurve curveData={curveData} clickedLostElement={currentSelectedId} />
              </>
            ) : (
              <>
                <ResultsFilter
                  isExpanded={isExpanded}
                  toggleExpand={toggleExpand}
                  treeParams={treeParams}
                  updateTreeParams={updateTreeParams}
                  nodeParams={nodeParams}
                  setNodeParams={setNodeParams}
                  type={type}
                  settings={settings}
                  tree={true}
                />
                <div className="row">
                  <div className="col-md-7 mb-3" style={{ display: "flex", flexDirection: "column", flex: "1", paddingRight: "15px" }}>
                    {!loadingTree ? (
                      <p>Loading tree data...</p>
                    ) : (
                      <FlowWithProvider
                        treeData={treeData}
                        maxDepth={treeParams.maxDepth}
                        customThreshold={nodeParams.customThreshold}
                        onButtonClicked={handleButtonClicked}
                        onFullScreenClicked={toggleFullscreen}
                        fullscreen={fullscreen}
                      />
                    )}
                  </div>
                  <div className="col-md-5 mb-3" style={{ flex: "1", display: "flex", flexDirection: "column" }}>
                    {!loadingCurve ? <p>Loading CURVE data...</p> : <MDRCurve curveData={curveData} clickedLostElement={currentSelectedId} />}
                    {!loadingLost ? null : <LostProfiles lostData={lostData} filters={{ dr: treeParams.declarationRate, maxDepth: treeParams.maxDepth }} onElementClick={handleElementClick} />}
                    {!loadingDetectron ? null : type === "eval" && <DetectronResults detectronResults={detectronR} />}
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </>
  )
}

export default MED3paResultsTab
