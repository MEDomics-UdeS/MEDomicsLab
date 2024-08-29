import React from "react"
import { calculateRanges } from "../../resultTabs/tabFunctions"
import { Panel } from "reactflow"

/**
 *
 * @param {number} customThreshold The step value used to calculate and display colors possible ranges.
 * @returns {JSX.Element|null} Returns a JSX element representing the legend if `customThreshold` is not zero; otherwise, returns null.
 *
 *
 * @description
 * TreeLegend component displays a legend panel showing color-coded ranges
 * based on a custom threshold value.
 */
const TreeLegend = ({ customThreshold }) => {
  // Calculate color ranges based on customThreshold (Step)
  const calculatedRanges = calculateRanges(customThreshold)

  // Render the component conditionally based on customThreshold
  return customThreshold !== 0 ? (
    <Panel position="bottom-right">
      <div className="legend-container">
        <div className="legend-items">
          {Object.keys(calculatedRanges).map((key) => (
            <div
              key={key}
              className="threshold-circle"
              style={{
                backgroundColor: calculatedRanges[key].color,
                height: calculatedRanges[key].color ? `${1 + parseInt(customThreshold)}px` : "0px"
              }}
            >
              {calculatedRanges[key].description && <p className="threshold-description">{calculatedRanges[key].description}</p>}
            </div>
          ))}
        </div>
      </div>
    </Panel>
  ) : null
}

export default TreeLegend
