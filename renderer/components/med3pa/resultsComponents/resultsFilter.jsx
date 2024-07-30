import React, { useEffect, useState } from "react"
import { Typography } from "@mui/material"
import { TbFilterCog } from "react-icons/tb"
import { FaCompress, FaExpand } from "react-icons/fa"
import TreeParameters from "./treeParams"
import NodeParameters from "./nodeParams"
import FlInput from "../paInput"

/**
 *
 * @param {boolean} isExpanded Determines if the filter section is expanded or not.
 * @param {Function} toggleExpand Function to toggle the expanded state of the filter section.
 * @param {Object} treeParams The current parameters for the tree.
 * @param {Function} updateTreeParams Function to update the tree parameters.
 * @param {Object} nodeParams The current parameters for the node.
 * @param {Function} setNodeParams Function to update the node parameters.
 * @param {string} type The type of the filter (IPC or APC Model Filter).
 * @param {Object} settings The settings object containing available metrics, detectron strategies and maximum MinSmaplesRatio.
 * @param {Object} tree The tree object used for rendering parameters.
 * @param {boolean} isDetectron Flag indicating if Detectron is executed.
 * @returns {JSX.Element} The rendered component displaying the filter options.
 *
 * @description
 * Component to filter and display results filter options based on tree and node parameters.
 */
const ResultsFilter = ({ isExpanded, toggleExpand, treeParams, updateTreeParams, nodeParams, setNodeParams, type, settings, tree, isDetectron }) => {
  const [shouldDisable, setShouldDisable] = useState(false) // State used to disable/enable Detectron Results filtering
  const [disableFilter, setDisableFilter] = useState(false) // State used to disable/enable tree filtering

  /**
   *
   * @param {Object} event - The event object containing the new metrics value.
   *
   *
   * @description
   * A function that handles changes in the metrics selection.
   */
  const handleMetricsChange = (event) => {
    setNodeParams((prevParams) => ({
      ...prevParams,
      metrics: event.value
    }))
  }

  // Update the `shouldDisable` state based on `treeParams`.
  useEffect(() => {
    if (treeParams && (treeParams.declarationRate !== 100 || treeParams.minSamplesRatio !== 0)) {
      setShouldDisable(true)
    } else {
      setShouldDisable(false)
    }
  }, [treeParams])

  // Update the `disableFilter` state based on `nodeParams.focusView`.
  useEffect(() => {
    if (nodeParams && nodeParams.focusView === "Covariate-shift probabilities") {
      setDisableFilter(true)
    } else {
      setDisableFilter(false)
    }
  }, [nodeParams])

  return (
    <div className={`card mb-3 ${isExpanded ? "expanded" : ""}`} style={{ overflowY: "visible" }}>
      <div className="card-header d-flex justify-content-between align-items-center">
        <Typography variant="h6" style={{ color: "#868686", fontSize: "1.2rem", display: "flex", alignItems: "center" }}>
          <TbFilterCog style={{ marginRight: "0.5rem", fontSize: "1.7rem" }} />
          Filter Results
        </Typography>
        <hr style={{ borderColor: "#868686", borderWidth: "0.5px" }} />
        {/* Button to toggle expand/collapse state */}
        <button className="btn btn-link p-0" onClick={toggleExpand}>
          {isExpanded ? <FaCompress /> : <FaExpand />}
        </button>
      </div>
      <div className={`card-body ${isExpanded ? "expanded-body" : ""}`}>
        {isExpanded && (
          <div style={{ display: "flex", flexDirection: "column", padding: "1%", height: "100%" }}>
            {tree ? (
              <div className="row" style={{ flex: "0 0 auto", display: "flex", padding: "1%" }}>
                <div className="col-md-7 mb-3" style={{ display: "flex", flexDirection: "column" }}>
                  <TreeParameters treeParams={treeParams} setTreeParams={updateTreeParams} maxMinSRatio={settings?.maxMinSRatio} disableFilter={disableFilter} />
                </div>
                <div className="col-md-5 mb-3" style={{ display: "flex", flex: "1", flexDirection: "column", height: "100%" }}>
                  <NodeParameters parentId={type} nodeParams={nodeParams} setNodeParams={setNodeParams} settings={settings} isDetectron={isDetectron} shouldDisable={shouldDisable} />
                </div>
              </div>
            ) : (
              <div style={{ flex: "0 0 auto", display: "flex", padding: "2%" }}>
                <FlInput
                  name="Select General Metrics"
                  settingInfos={{
                    type: "list-multiple",
                    tooltip: "Select metrics",
                    choices: settings.metrics
                  }}
                  currentValue={nodeParams.metrics || settings.metrics?.filter((item) => ["Auc", "Accuracy", "F1Score", "Recall"].includes(item.name))}
                  onInputChange={handleMetricsChange}
                  disabled={false}
                  className="default-text-color-paresults"
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default ResultsFilter
