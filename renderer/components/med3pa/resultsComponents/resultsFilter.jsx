import React, { useEffect } from "react"
import { Typography } from "@mui/material"
import { TbFilterCog } from "react-icons/tb"
import { FaCompress, FaExpand } from "react-icons/fa"
import TreeParameters from "./treeParams"
import NodeParameters from "./nodeParams"
import FlInput from "../paInput"

const ResultsFilter = ({ isExpanded, toggleExpand, treeParams, updateTreeParams, nodeParams, setNodeParams, type, settings, tree }) => {
  const handleMetricsChange = (event) => {
    setNodeParams((prevParams) => ({
      ...prevParams,
      metrics: event.value
    }))
  }

  useEffect(() => {
    if (nodeParams.metrics === null) {
      setNodeParams((prevNodeParams) => ({
        ...prevNodeParams,
        metrics: settings.metrics
      }))
    }
  }, [settings])

  return (
    <div className={`card mb-3 ${isExpanded ? "expanded" : ""}`} style={{ overflowY: "visible" }}>
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
      <div className={`card-body ${isExpanded ? "expanded-body" : ""}`}>
        {isExpanded && (
          <div style={{ display: "flex", flexDirection: "column", padding: "1%", height: "100%" }}>
            {tree ? (
              <div className="row" style={{ flex: "0 0 auto", display: "flex", padding: "1%" }}>
                <div className="col-md-7 mb-3" style={{ display: "flex", flexDirection: "column" }}>
                  <TreeParameters treeParams={treeParams} setTreeParams={updateTreeParams} />
                </div>
                <div className="col-md-5 mb-3" style={{ display: "flex", flex: "1", flexDirection: "column", height: "100%" }}>
                  <NodeParameters parentId={type} nodeParams={nodeParams} setNodeParams={setNodeParams} settings={settings} />
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
                  currentValue={nodeParams.metrics}
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
