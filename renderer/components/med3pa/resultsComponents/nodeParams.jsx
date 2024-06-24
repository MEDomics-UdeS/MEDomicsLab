import React, { useState } from "react"
import { Typography, FormControl, RadioGroup, FormControlLabel, Radio, Switch } from "@mui/material"
import FlInput from "../paInput"

const NodeParameters = () => {
  const [focusView, setFocusView] = useState("")
  const [thresholdEnabled, setThresholdEnabled] = useState(false)
  const [customThreshold, setCustomThreshold] = useState("")
  const [selectedParameter, setSelectedParameter] = useState("")

  const handleFocusViewChange = (event) => {
    setFocusView(event.target.value)
  }

  const handleThresholdToggleChange = () => {
    setThresholdEnabled(!thresholdEnabled)
  }

  const handleCustomThresholdChange = (event) => {
    setCustomThreshold(event.value)
  }

  const handleParameterChange = (event) => {
    setSelectedParameter(event.value)
  }

  return (
    <div className="card">
      <Typography variant="h6" style={{ color: "#868686", fontSize: "1.2rem" }}>
        Node Parameters
        <hr style={{ borderColor: "#868686", borderWidth: "0.5px" }} />
      </Typography>
      <div className="node-param-section">
        <Typography variant="h6" className="default-text-color" style={{ fontSize: "1.1rem" }}>
          Focus view on
        </Typography>
        <FormControl component="fieldset">
          <RadioGroup value={focusView} onChange={handleFocusViewChange} style={{ display: "flex", flexDirection: "row", justifyContent: "flex-start", width: "100%", margin: "0%" }}>
            <FormControlLabel value="Node information" control={<Radio />} label="Node information" className="default-text-color" />
            <FormControlLabel value="Node performance" control={<Radio />} label="Node performance" className="default-text-color" />
            <FormControlLabel value="Covariate-shift probabilities" control={<Radio />} label="Covariate-shift probs" className="default-text-color" />
          </RadioGroup>
        </FormControl>
        <hr style={{ borderColor: "#868686", borderWidth: "0.5px" }} />
      </div>
      <div className="node-param-section" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Typography variant="h6" className="default-text-color" style={{ fontSize: "1.1rem" }}>
          Highlight from certain threshold
        </Typography>
        <FormControlLabel control={<Switch checked={thresholdEnabled} onChange={handleThresholdToggleChange} />} label="" />
      </div>

      {thresholdEnabled && (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ width: "50%" }}>
            <FlInput
              name="Highlight by parameter"
              settingInfos={{
                type: "list",
                tooltip: "Select here the highlight element",
                choices: [{ name: "min confidence level" }, { name: "declaration rate" }, { name: "Max Depth" }, { name: "Min Sample Ratio" }]
              }}
              currentValue={selectedParameter}
              onInputChange={handleParameterChange}
              disabled={false}
              className="default-text-color"
            />
          </div>
          <div style={{ width: "40%" }}>
            <FlInput
              name="Highlight Threshold %"
              settingInfos={{
                type: "int",
                tooltip: "Input threshold"
              }}
              currentValue={customThreshold}
              onInputChange={handleCustomThresholdChange}
              disabled={false}
              className="default-text-color"
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default NodeParameters
