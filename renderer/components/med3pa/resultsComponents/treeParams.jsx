import React, { useState } from "react"
import { Slider, Typography } from "@mui/material"

const TreeParameters = () => {
  // State for the values of the sliders
  const [declarationRate, setDeclarationRate] = useState(82)
  const [maxDepth, setMaxDepth] = useState(3)
  const [minConfidenceLevel, setMinConfidenceLevel] = useState(39)
  const [minSamplesRatio, setMinSamplesRatio] = useState(10)

  return (
    <div className="card">
      <Typography variant="h6" style={{ color: "#868686", fontSize: "1.2rem" }}>
        Tree Parameters
        <hr style={{ borderColor: "#868686", borderWidth: "0.5px" }} />
      </Typography>

      <div className="slider-group">
        <div className="slider-container">
          <Typography className="default-text-color">Declaration Rate</Typography>
          <Slider
            value={declarationRate}
            onChange={(e, value) => setDeclarationRate(value)}
            aria-labelledby="declaration-rate-slider"
            sx={{ color: "#D2DBEB" }}
            valueLabelDisplay="auto"
            min={0}
            max={100}
            step={1}
          />
        </div>
        <div className="slider-container">
          <Typography className="default-text-color">Max Depth</Typography>
          <Slider value={maxDepth} onChange={(e, value) => setMaxDepth(value)} aria-labelledby="max-depth-slider" sx={{ color: "#D2EBE1" }} valueLabelDisplay="auto" min={0} max={100} step={1} />
        </div>
      </div>

      <div className="slider-group" style={{ marginTop: "25px" }}>
        <div className="slider-container">
          <Typography className="default-text-color">Min Confidence Level</Typography>
          <Slider
            value={minConfidenceLevel}
            onChange={(e, value) => setMinConfidenceLevel(value)}
            aria-labelledby="min-confidence-level-slider"
            sx={{ color: "#FFCAC7" }}
            valueLabelDisplay="auto"
            min={0}
            max={100}
            step={1}
          />
        </div>
        <div className="slider-container">
          <Typography className="default-text-color">Min Samples Ratio</Typography>
          <Slider
            value={minSamplesRatio}
            onChange={(e, value) => setMinSamplesRatio(value)}
            aria-labelledby="min-samples-ratio-slider"
            sx={{ color: "#F1E7D7" }}
            valueLabelDisplay="auto"
            min={0}
            max={100}
            step={5}
          />
        </div>
      </div>
    </div>
  )
}

export default TreeParameters
