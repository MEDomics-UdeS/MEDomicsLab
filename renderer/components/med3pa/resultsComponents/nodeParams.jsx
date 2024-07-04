import React, { useEffect } from "react"
import { Typography, FormControl, RadioGroup, FormControlLabel, Radio, Switch } from "@mui/material"
import FlInput from "../paInput"
import { TbSettingsCog } from "react-icons/tb"
import { nodeInformation, shiftInformation } from "../resultTabs/tabFunctions"

const NodeParameters = ({ parentId, nodeParams, setNodeParams, settings }) => {
  const { focusView, thresholdEnabled, customThreshold, selectedParameter, metrics, detectronStrategy } = nodeParams

  useEffect(() => {
    if (nodeParams.metrics === null) {
      setNodeParams((prevNodeParams) => ({
        ...prevNodeParams,
        metrics: settings.metrics
      }))
    }
    if (nodeParams.detectronStrategy === null) {
      setNodeParams((prevNodeParams) => ({
        ...prevNodeParams,
        detectronStrategy: settings.strategy
      }))
    }
  }, [settings])

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
    setNodeParams((prevState) => ({
      ...prevState,
      metrics: event.value
    }))
  }

  const handleStrategyChange = (event) => {
    setNodeParams((prevState) => ({
      ...prevState,
      detectronStrategy: event.value
    }))
  }

  const getHighlightChoices = () => {
    if (focusView === "Node information") {
      return nodeInformation.map((information) => ({ name: information }))
    } else if (focusView === "Node performance" && metrics) {
      return metrics.map((metric) => ({ name: metric.name }))
    } else {
      return shiftInformation.map((information) => ({ name: information }))
    }
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
            {parentId !== "test" && <FormControlLabel value="Covariate-shift probabilities" control={<Radio />} label="Covariate-shift probs" className="default-text-color-paresults" />}
          </RadioGroup>
        </FormControl>
        {focusView === "Node performance" && (
          <div style={{ width: "100%" }}>
            <FlInput
              name="Select Metrics"
              settingInfos={{
                type: "list-multiple",
                tooltip: "Select metrics",
                choices: settings.metrics
              }}
              currentValue={metrics}
              onInputChange={handleMetricsChange}
              disabled={false}
              className="default-text-color-paresults"
            />
          </div>
        )}
        {focusView === "Covariate-shift probabilities" && parentId === "eval" && (
          <div style={{ width: "100%", marginTop: "3%" }}>
            <FlInput
              name="Detectron Test Type"
              settingInfos={{
                type: "list",
                tooltip: "<p>Show on Node Detectron Test Results based on a specific Strategy</p>",
                choices: settings.strategy
              }}
              currentValue={detectronStrategy}
              onInputChange={handleStrategyChange}
              disabled={false}
              className="default-text-color-paresults"
            />
          </div>
        )}
      </div>
      <hr style={{ borderColor: "#868686", borderWidth: "0.5px" }} />
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
                tooltip: "<p>Select here the highlight element<p>",
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
                tooltip: "<p>Input threshold<p>"
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
