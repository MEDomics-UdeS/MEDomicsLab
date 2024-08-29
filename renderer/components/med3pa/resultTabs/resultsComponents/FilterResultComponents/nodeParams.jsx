import React, { useEffect } from "react"
import { Typography, FormControl, RadioGroup, FormControlLabel, Radio, Switch } from "@mui/material"
import FlInput from "../../../baseComponents/paInput"
import { TbSettingsCog } from "react-icons/tb"
import { nodeInformation, shiftInformation } from "../../tabFunctions"

/**
 *
 * @param {string} parentId ID of the parent node.
 * @param {Object} nodeParams Current parameters of the node.
 * @param {function} setNodeParams Function to update node parameters.
 * @param {Object} settings Settings used to populate available options for metrics and strategies.
 * @param {boolean} isDetectron Boolean indicating if the node is of Detectron type.
 * @param {boolean} shouldDisable Boolean to determine if the Detectron-related options should be disabled.
 * @returns {JSX.Element} The NodeParameters component.
 *
 *
 * @description
 * NodeParameters component allows the configuration of various parameters for a node.
 * It includes options for focus view, metrics, detectron strategies, and coloring nodes based on values.
 */
const NodeParameters = ({ parentId, nodeParams, setNodeParams, settings, isDetectron, shouldDisable }) => {
  const { focusView, thresholdEnabled, customThreshold, selectedParameter, metrics, detectronStrategy } = nodeParams

  /**
   * Initialize `metrics` and `detectronStrategy` if they are not already set in `nodeParams`.
   * Update the state with filtered metrics and strategy options from `settings`.
   */
  useEffect(() => {
    if (nodeParams.metrics === null) {
      setNodeParams((prevNodeParams) => ({
        ...prevNodeParams,
        metrics: settings.metrics?.filter((item) => ["Auc", "Accuracy", "F1Score", "Recall"].includes(item.name))
      }))
    }
    if (nodeParams.detectronStrategy === null) {
      setNodeParams((prevNodeParams) => ({
        ...prevNodeParams,
        detectronStrategy: settings.strategy
      }))
    }
  }, [settings])

  /**
   *
   * @param {Object} event The change event from the radio group.
   *
   *
   * @description
   * A function that handles changes in focus view selection.
   * Updates `focusView` in `nodeParams` state.
   */
  const handleFocusViewChange = (event) => {
    setNodeParams((prevState) => ({
      ...prevState,
      focusView: event.target.value
    }))
  }

  /**
   *
   * @description
   * A function that toggles the state of `thresholdEnabled` to enable or disable threshold-based coloring.
   */
  const handleThresholdToggleChange = () => {
    setNodeParams((prevState) => ({
      ...prevState,
      thresholdEnabled: !prevState.thresholdEnabled
    }))
  }

  /**
   *
   * @param {Object} event The change event from the input.
   *
   *
   * @description
   * A function that handles changes in custom threshold value.
   * it updates `customThreshold` in `nodeParams` state.
   */
  const handleCustomThresholdChange = (event) => {
    setNodeParams((prevState) => ({
      ...prevState,
      customThreshold: event.value
    }))
  }

  /**
   *
   * @param {Object} event The change event from the input.
   *
   *
   * @description
   * A function that handles changes in the selected parameter for highlighting nodes.
   * it updates `selectedParameter` in `nodeParams` state.
   */
  const handleParameterChange = (event) => {
    setNodeParams((prevState) => ({
      ...prevState,
      selectedParameter: event.value
    }))
  }

  /**
   *
   * @param {Object} event The change event from the input.
   *
   *
   * @description
   * A function that handles changes in selected metrics.
   * It updates `metrics` in `nodeParams` state.
   */
  const handleMetricsChange = (event) => {
    setNodeParams((prevState) => ({
      ...prevState,
      metrics: event.value
    }))
  }

  /**
   *
   * @param {Object} event The change event from the input.
   *
   *
   * @description
   * A function that handles changes in the detectron strategy selection.
   * it updates `detectronStrategy` in `nodeParams` state.
   */
  const handleStrategyChange = (event) => {
    setNodeParams((prevState) => ({
      ...prevState,
      detectronStrategy: event.value
    }))
  }

  /**
   *
   * @returns {Array} Array of choices for highlighting.
   *
   *
   * @description
   * A function that determines available choices for highlighting based on the current `focusView`.
   * It returns an array of choices to be used in a select input.
   */
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
            {parentId !== "test" && isDetectron && (
              <FormControlLabel disabled={shouldDisable} value="Covariate-shift probabilities" control={<Radio />} label="Covariate-shift probs" className="default-text-color-paresults" />
            )}
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
          Color Nodes By values
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
              name="Color by parameter"
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
              name="Color Range Step"
              settingInfos={{
                type: "percentage",
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
