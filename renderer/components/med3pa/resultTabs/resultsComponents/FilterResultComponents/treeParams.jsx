import React from "react"
import { Slider, Typography } from "@mui/material"
import { TbSettingsCog } from "react-icons/tb"

/**
 *
 * @param {Object} treeParams The current tree parameters, including declarationRate, maxDepth, minConfidenceLevel, and minSamplesRatio.
 * @param {Function} setTreeParams Function to update the tree parameters.
 * @param {boolean} disableFilter Flag to disable or enable certain sliders based on the filter state.
 * @returns {JSX.Element} the tree parameter sliders.
 *
 *
 * @description
 * TreeParameters component renders a set of sliders for adjusting tree-related parameters.
 */
const TreeParameters = ({ treeParams, setTreeParams, maxMinSRatio, disableFilter }) => {
  /**
   *
   * @param {string} property The name of the tree parameter to be updated.
   * @param {number} value  The updated value (Input).
   *
   *
   * @description
   * A function that handle the change event for sliders to update the corresponding parameter.
   */
  const handleSliderChange = (property, value) => {
    setTreeParams({
      ...treeParams,
      [property]: value
    })
  }

  return (
    <div className="card-paresults">
      <Typography variant="h6" style={{ color: "#868686", fontSize: "1.2rem", display: "flex", alignItems: "center" }}>
        <TbSettingsCog style={{ marginRight: "0.5rem", fontSize: "1.4rem" }} />
        Tree Parameters
      </Typography>
      <hr style={{ borderColor: "#868686", borderWidth: "0.5px" }} />
      <div className="slider-group-paresults">
        <div className="slider-container-paresults">
          <Typography className="default-text-color-paresults">Declaration Rate</Typography>
          <Slider
            value={treeParams.declarationRate || 0}
            onChange={(e, value) => handleSliderChange("declarationRate", value)}
            aria-labelledby="declaration-rate-slider"
            sx={{ color: "#D2DBEB" }}
            valueLabelDisplay="auto"
            min={0}
            max={100}
            step={1}
            disabled={disableFilter}
          />
        </div>
        <div className="slider-container-paresults">
          <Typography className="default-text-color-paresults">Max Depth</Typography>
          <Slider
            value={treeParams.maxDepth - 1 || 0}
            onChange={(e, value) => handleSliderChange("maxDepth", value + 1)}
            aria-labelledby="max-depth-slider"
            sx={{ color: "#D2EBE1" }}
            valueLabelDisplay="auto"
            min={0}
            max={4}
            step={1}
          />
        </div>
      </div>

      <div className="slider-group-paresults" style={{ marginTop: "25px" }}>
        <div className="slider-container-paresults">
          <Typography className="default-text-color-paresults">Min Confidence Level</Typography>

          <Slider
            value={treeParams.minConfidenceLevel || 0}
            onChange={(e, value) => handleSliderChange("minConfidenceLevel", value)}
            aria-labelledby="min-confidence-level-slider"
            sx={{ color: "#FFCAC7" }}
            valueLabelDisplay="auto"
            min={0}
            max={1}
            step={0.1}
            disabled={true}
            style={{ pointerEvents: "auto" }}
          />
        </div>
        <div className="slider-container-paresults">
          <Typography className="default-text-color-paresults">Min Population Percentage</Typography>
          <Slider
            value={treeParams.minSamplesRatio || 0}
            onChange={(e, value) => handleSliderChange("minSamplesRatio", value)}
            aria-labelledby="min-samples-ratio-slider"
            sx={{ color: "#F1E7D7" }}
            valueLabelDisplay="auto"
            min={0}
            max={maxMinSRatio}
            step={5}
            disabled={disableFilter}
          />
        </div>
      </div>
    </div>
  )
}

export default TreeParameters
