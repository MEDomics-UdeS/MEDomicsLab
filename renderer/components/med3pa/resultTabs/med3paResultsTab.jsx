/* eslint-disable camelcase */
import React, { useState, useEffect } from "react"

import MDRCurve from "../resultsComponents/mdrCurve"
import FlowWithProvider from "../resultsComponents/treeWorkflow"

import DetectronResults from "../resultsComponents/detectronResults"
import { filterData, filterMetrics, isLost, isSubPath } from "./tabFunctions"
import LostProfiles from "../resultsComponents/lostProfiles"
import ResultsFilter from "../resultsComponents/resultsFilter"
import PaModelsEval from "../resultsComponents/paModelsEval"

/**
 *
 * @param {Object} loadedFiles The loaded results file of the executed experiment.
 * @param {string} type The type of the executed experiment: test or evaluation experiment.
 * @returns {JSX.Element} The rendered component displaying the MED3pa results.
 *
 *
 * @description
 * This component displays the executed configuration's results.
 */
const MED3paResultsTab = ({ loadedFiles, type }) => {
  const [buttonClicked, setButtonClicked] = useState("reset") // Store the filter button state
  const [filter, setFilter] = useState(false)

  // Store Loading results states: Profiles Tree, MDR Curve, Lost Profiles chart and Detectron card
  const [loadingTree, setLoadingTree] = useState(false)
  const [loadingEval, setLoadingEval] = useState(false)
  const [loadingCurve, setLoadingCurve] = useState(false)
  const [loadingLost, setLoadingLost] = useState(false)
  const [loadingDetectron, setLoadingDetectron] = useState(false)

  // Store Loaded Data: Lost Profiles, Tree Data, MDR Curve Data and Detectron Data
  const [lostData, setLostData] = useState({})
  const [evalData, setEvalData] = useState({})
  const [curveData, setCurveData] = useState({})
  const [treeData, setTreeData] = useState({})
  const [detectronR, setdetectronR] = useState()

  // Full Screen State Variables: Profiles Tree and MDR Curve
  const [fullscreen, setFullscreen] = useState(false)
  const [fullscreenCurve, setFullscreenCurve] = useState(false)

  const [isExpanded, setIsExpanded] = useState(false)

  // Store selected elements ID iof Lost Profiles Chart
  const [prevSelectedId, setPrevSelectedId] = useState(null)
  const [currentSelectedId, setCurrentSelectedId] = useState(null)

  // Initial Settings: Evaluation Metrics and Executed Detectron Strategies
  const [settings, setSettings] = useState({
    metrics: null,
    strategy: null
  })

  // Initialize Filtering Configurations: Tree Parameters and Nodes Parameters
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

  /**
   *
   *
   * @param {Object} loadedFiles The loaded results file of the executed experiment.
   * @param {string} type The type of the executed experiment: test or evaluation experiment.
   * @returns {Object} An object containing the formatted test and detectron results.
   *
   *
   * @description
   * Formats the loaded files based on the type of the experiment.
   */
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

  /**
   *
   * @param {string} buttonType The type of the clicked button, which determines the action to be performed.
   *
   *
   * @description
   * Handles button click events to either reset settings or toggle the filter state.
   */
  const handleButtonClicked = (buttonType) => {
    setButtonClicked(buttonType)

    if (buttonType === "reset") {
      // If the "reset" button was clicked, reset the node and tree parameters to their default values
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
      // toggle the filter state
      setFilter(!filter)
    }
  }

  /**
   * Update the `minConfidenceLevel` in `treeParams` based on
   * the `declarationRate` and corresponding metrics from `loadedFiles`. It retrieves
   * and applies the `min_confidence_level` value from `loadedFiles.metrics_dr`
   * whenever `treeParams.declarationRate` changes.
   */
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

  /**
   *
   * @param {Object} newTreeParams The new tree parameters to set in the state.
   *
   *
   * @description
   * The function updates the `treeParams` state with the provided `newTreeParams` object.
   */
  const updateTreeParams = (newTreeParams) => {
    setTreeParams(newTreeParams)
  }

  // Runs when `loadedFiles` changes.

  useEffect(() => {
    /**
     *
     * @param {Object} loadedFiles The JSON data containing results of the executed experiment.
     * @param {string} type The type of the executed experiment (e.g., "test" or "evaluation").
     *
     *
     * @description
     * Asynchronously loads and processes JSON data from `loadedFiles` based on the experiment type.
     * This function performs the following actions:
     * - **Detectron Results:** If `detectronResults` is present, it updates the `detectronR` state and appends new strategy names to the `settings` state if no strategies are defined.
     * - **Test Data:** If `test` data is available:
     *   - Updates the evaluation data and sets the loading state for evaluation.
     *   - Processes metrics data to filter out "LogLoss" and updates the `settings` state if metrics are not already defined. It then filters and sets curve data.
     *   - Filters and sets tree data and lost data based on profiles, while also updating the loading states for detectron, lost data, and tree data.
     * - Catches and logs any errors that occur during the data loading process.
     */
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
        if (test.models_evaluation) {
          setLoadingEval(true)
          setEvalData(test.models_evaluation)
        }

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
            setLoadingDetectron(true)
          }
          setLoadingLost(true)

          setTimeout(() => {
            setLoadingTree(true)
          }, 600)
        }
      } catch (error) {
        console.error("Error loading JSON files:", error)
      }
    }

    loadJsonFiles()
  }, [loadedFiles])

  /**
   *
   * @param {Object} loadedFiles The JSON data from the executed experiment.
   *
   *
   * @description
   * The function:
   * - Filters and sets curve data if metrics are available.
   * - Filters and sets tree data and lost data if profiles are available.
   * - Updates loading states.
   * - Logs errors if data processing fails.
   */
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
      console.error("Error filtering file:", error)
    }
  }

  // Runs when `buttonClicked` and `filter` change.
  useEffect(() => {
    loadFiles()
  }, [buttonClicked, filter])

  /**
   *
   * @description
   * Filters and updates the curve data based on the loaded files.
   */
  const FilterMDRCurve = () => {
    if (!loadedFiles) return

    const { test } = formatDisplay(loadedFiles, type)

    try {
      if (!test) return

      const filteredMDRData = filterMetrics(test.metrics_dr, nodeParams)
      if (filteredMDRData) {
        setCurveData(filteredMDRData)

        setLoadingCurve(true) // Set loading to true after fetching data
      }
    } catch (error) {
      console.error("Error filtering curve:", error)
    }
  }
  // Update Curve Data  when `nodeParams.metrics` change.
  useEffect(() => {
    FilterMDRCurve()
  }, [nodeParams.metrics])

  /**
   *
   * @param {Object} data The data associated with the clicked element.
   *
   *
   * @description
   * The function handles the click event for a tree element node.
   * - Updates the current selected ID.
   * - Processes and updates tree data based on the clicked element's path and ID.
   * - Updates the previous selected element ID.
   */
  const handleElementClick = (data) => {
    setCurrentSelectedId(data.data["value"][0])
    setTreeData((prevTreeData) => {
      let dataPathArray = data.data.name.split("\n").map((pathItem) => pathItem.trim())
      if (dataPathArray[0] === "") {
        dataPathArray = ["*"]
      } else {
        dataPathArray = ["*", ...dataPathArray]
      }

      // Bool to check if the the node is clicked again
      const resetAllClassNames = data.data.id === prevSelectedId?.data.id

      const updatedTreeData = prevTreeData.map((item) => {
        if (resetAllClassNames) {
          // no current selected node
          setCurrentSelectedId(null)

          // Update classNames depending on the profile status: Lost or Present
          if (isLost(item)) {
            return { ...item, className: "panode-lost" }
          }
          return { ...item, className: "" }
        } else if (item.id === data.data.id) {
          return { ...item, className: data.className }
        } else if (isSubPath(item.path, dataPathArray)) {
          return { ...item, className: "" }
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

  // Keep Track of the updates
  useEffect(() => {
    console.log("treeData here:", treeData)
  }, [treeData])

  useEffect(() => {
    console.log("treeParams changed to:", treeParams)
  }, [treeParams])

  useEffect(() => {
    console.log("nodeParams changed to:", nodeParams)
  }, [nodeParams])

  /**
   *
   * @param {string} component The component to toggle fullscreen mode for ("Profile tree" or "MDRCurve").
   *
   *
   * @description
   * The function Toggles fullscreen state for the "Profile tree" component or "MDRCurve" component based on the input.
   */
  const toggleFullscreen = (component) => {
    if (component === "tree") {
      setFullscreen(!fullscreen) // Toggle Tree fullscreen state
    }
    if (component === "curve") {
      setFullscreenCurve(!fullscreenCurve) // Toggle MDR Curve fullscreen state
    }
    if (fullscreen) {
      setLoadingTree(false)
      // Create a visual effect
      setTimeout(() => {
        setLoadingTree(true)
      }, 300)
    }
  }

  /**
   *
   * @description
   * The function updates the `isExpanded` state to switch between expanded and minimized views.
   */
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
                  onFullScreenClicked={() => toggleFullscreen("tree")}
                  fullscreen={fullscreen}
                />
              )}
            </div>
          </div>
        ) : fullscreenCurve ? (
          <div className="fullscreen-container">
            <div className="fullscreen-treeWorkflow">
              {!loadingCurve ? (
                <p>Loading Curve data...</p>
              ) : (
                <MDRCurve curveData={curveData} clickedLostElement={currentSelectedId} onFullScreenClicked={() => toggleFullscreen("curve")} fullscreenCurve={fullscreenCurve} setFilter={setFilter} />
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
                  isDetectron={loadingDetectron}
                />
                <MDRCurve curveData={curveData} clickedLostElement={currentSelectedId} onFullScreenClicked={toggleFullscreen} fullscreenCurve={null} />
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
                  isDetectron={loadingDetectron}
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
                        onFullScreenClicked={() => toggleFullscreen("tree")}
                        fullscreen={fullscreen}
                      />
                    )}
                  </div>
                  <div className="col-md-5 mb-3" style={{ flex: "1", display: "flex", flexDirection: "column" }}>
                    {!loadingCurve ? (
                      <p>Loading CURVE data...</p>
                    ) : (
                      <MDRCurve curveData={curveData} clickedLostElement={currentSelectedId} onFullScreenClicked={() => toggleFullscreen("curve")} fullscreenCurve={fullscreenCurve} />
                    )}
                    {!loadingLost ? null : <LostProfiles lostData={lostData} filters={{ dr: treeParams.declarationRate, maxDepth: treeParams.maxDepth }} onElementClick={handleElementClick} />}
                    {!loadingDetectron ? null : type === "eval" && <DetectronResults detectronResults={detectronR} />}
                  </div>
                </div>
                <div>{!loadingEval ? <p>Loading MED3pa Models Evaluation...</p> : <PaModelsEval loadedFile={evalData} />}</div>
              </>
            )}
          </>
        )}
      </div>
    </>
  )
}

export default MED3paResultsTab
