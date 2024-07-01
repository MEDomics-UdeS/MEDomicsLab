import React, { useState, useEffect } from "react"
import { Typography, FormControl, RadioGroup, FormControlLabel, Radio, Switch } from "@mui/material"
import FlInput from "../paInput"
import { TbSettingsCog } from "react-icons/tb"

const NodeParameters = ({ nodeParams, setNodeParams }) => {
  const { focusView, thresholdEnabled, customThreshold, selectedParameter, metrics } = nodeParams

  // Local state for metrics selection
  const [localMetrics, setLocalMetrics] = useState()

  // Effect to initialize localMetrics when metrics change
  useEffect(() => {
    if (metrics && !localMetrics) {
      setLocalMetrics(metrics)
    }
  }, [metrics])

  const handleFocusViewChange = (event) => {
    setNodeParams((prevState) => ({
      ...prevState,
      focusView: event.target.value
    }))
  }

  const handleThresholdToggleChange = () => {
    setNodeParams((prevState) => ({
      ...prevState,
      thresholdEnabled: !prevState.thresholdEnabled
    }))
  }

  const handleCustomThresholdChange = (event) => {
    setNodeParams((prevState) => ({
      ...prevState,
      customThreshold: event.value
    }))
  }

  const handleParameterChange = (event) => {
    setNodeParams((prevState) => ({
      ...prevState,
      selectedParameter: event.value
    }))
  }

  const handleMetricsChange = (event) => {
    // Update local state only

    // Update parent state if needed
    setNodeParams((prevState) => ({
      ...prevState,
      metrics: event.value
    }))
  }

  const getHighlightChoices = () => {
    if (focusView === "Node information") {
      return [{ name: "Profile value" }]
    } else if (focusView === "Node performance" && metrics) {
      return metrics.map((metric) => ({ name: metric.name }))
    } else if (focusView === "Covariate-shift probabilities") {
      return [{ name: "Detectron results" }]
    }
    return []
  }

  return (
    <div className="card-paresults">
      <Typography
        variant="h6"
        style={{
          color: "#868686",
          fontSize: "1.2rem",
          display: "flex",
          alignItems: "center"
        }}
      >
        <TbSettingsCog style={{ marginRight: "0.5rem", fontSize: "1.4rem" }} />
        Node Parameters
      </Typography>
      <hr style={{ borderColor: "#868686", borderWidth: "0.5px" }} />
      <div className="node-param-section-paresults">
        <Typography variant="h6" className="default-text-color-paresults" style={{ fontSize: "1.1rem" }}>
          Focus on
        </Typography>
        <FormControl component="fieldset">
          <RadioGroup
            value={focusView}
            onChange={handleFocusViewChange}
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "flex-start",
              width: "100%",
              margin: "0%"
            }}
          >
            <FormControlLabel value="Node information" control={<Radio />} label="General information" className="default-text-color-paresults" />
            <FormControlLabel value="Node performance" control={<Radio />} label="Node performance" className="default-text-color-paresults" />
            <FormControlLabel value="Covariate-shift probabilities" control={<Radio />} label="Covariate-shift probs" className="default-text-color-paresults" />
          </RadioGroup>
        </FormControl>
        {focusView === "Node performance" && (
          <div style={{ width: "100%" }}>
            <FlInput
              name="Select Metrics"
              settingInfos={{
                type: "list-multiple",
                tooltip: "Select metrics",
                choices: localMetrics
              }}
              currentValue={metrics}
              onInputChange={handleMetricsChange}
              disabled={false}
              className="default-text-color-paresults"
            />
          </div>
        )}
        <hr style={{ borderColor: "#868686", borderWidth: "0.5px" }} />
      </div>

      <div
        className="node-param-section-paresults"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}
      >
        <Typography variant="h6" className="default-text-color-paresults" style={{ fontSize: "1.1rem" }}>
          Highlight from certain threshold
        </Typography>
        <FormControlLabel control={<Switch checked={thresholdEnabled} onChange={handleThresholdToggleChange} />} label="" />
      </div>

      {thresholdEnabled && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}
        >
          <div style={{ width: "50%" }}>
            <FlInput
              name="Highlight by parameter"
              settingInfos={{
                type: "list",
                tooltip: "Select here the highlight element",
                choices: getHighlightChoices()
              }}
              currentValue={selectedParameter}
              onInputChange={handleParameterChange}
              disabled={false}
              className="default-text-color-paresults"
            />
          </div>
          <div style={{ width: "40%" }}>
            <FlInput
              name="Custom Threshold"
              settingInfos={{
                type: "float",
                tooltip: "Input threshold"
              }}
              currentValue={customThreshold}
              onInputChange={handleCustomThresholdChange}
              disabled={false}
              className="default-text-color-paresults"
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default NodeParameters
