import React from "react"
import { calculateRanges } from "../resultTabs/tabFunctions"
import {  Panel } from "reactflow"

const TreeLegend = ({ customThreshold }) => {
  // Calculate ranges based on customThreshold
  const calculatedRanges = calculateRanges(customThreshold)

  // Render the component conditionally based on customThreshold
  return (
    customThreshold !== 0 && (
      <Panel position="bottom-right">
        <div className="legend-items">
          {Object.keys(calculatedRanges).map((key) => (
            <div key={key} className="legend-item">
              <div className={`threshold-circle ${calculatedRanges[key].className}`}></div>
              <div className="threshold-description">{calculatedRanges[key].description}</div>
            </div>
          ))}
        </div>
      </Panel>
    )
  )
}

export default TreeLegend
