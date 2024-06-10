/* eslint-disable camelcase */
import React, { useState, useContext, useEffect } from "react"
import Node from "../../flow/node"
import FlInput from "../paInput"
import { Button, OverlayTrigger, Tooltip } from "react-bootstrap"
import { FlowFunctionsContext } from "../../flow/context/flowFunctionsContext"
import * as Icon from "react-bootstrap-icons"

export default function EvaluationNode({ id, data }) {
  const [showDetails, setShowDetails] = useState(false)
  const { updateNode } = useContext(FlowFunctionsContext)
  const [hovered, setHovered] = useState(false)
  const [updatedSettings, setUpdatedSettings] = useState(data.setupParam?.possibleSettings || {})
  const [updatedParams, setUpdatedParams] = useState(data?.setupParam || {})

  useEffect(() => {
    setUpdatedParams(data?.setupParam || {})
  }, [data.setupParam])

  useEffect(() => {
    updateNode({
      id: id,
      updatedData: data.internal
    })
  }, [id, data.internal, updateNode])

  useEffect(() => {
    setUpdatedSettings(data.setupParam?.possibleSettings || {})
  }, [data.setupParam?.possibleSettings])

  const handleInputChange = (key, value) => {
    const selectedValues = Array.isArray(value.value) ? value.value.map((option) => option.name) : value.value

    setUpdatedSettings((prevSettings) => ({
      ...prevSettings,
      [key]: {
        ...prevSettings[key],
        default_val: selectedValues
      }
    }))
  }

  const toggleShowDetails = () => {
    setShowDetails(!showDetails)
  }

  const renderDefaultSettings = () => (
    <>
      {Object.keys(data.setupParam?.possibleSettings || {}).map((key) => (
        <FlInput
          key={key}
          name={key}
          settingInfos={{
            type: data.setupParam?.possibleSettings[key]?.type,
            tooltip: data.setupParam?.possibleSettings[key]?.tooltip,
            ...(data.setupParam?.possibleSettings[key]?.options && {
              choices: data.setupParam?.possibleSettings[key]?.options
            })
          }}
          currentValue={updatedSettings[key]?.default_val || ""}
          onInputChange={(value) => handleInputChange(key, value)}
        />
      ))}
    </>
  )

  const renderDetailsSection = () => (
    <>
      <div className="center">
        <Button
          variant="light"
          className="width-100 btn-contour"
          onClick={toggleShowDetails}
          style={{
            backgroundColor: "transparent",
            border: "none",
            padding: 0,
            textAlign: "left",
            display: "flex",
            alignItems: "center"
          }}
        >
          <div
            className="d-flex align-items-center"
            style={{
              transition: "color 0.3s",
              cursor: "pointer",
              marginLeft: "auto"
            }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
          >
            <span
              className="ms-2"
              style={{
                fontSize: "0.8rem",
                color: hovered ? "black" : "#999"
              }}
            >
              {showDetails ? "Hide Details" : "Show Details"}
            </span>
            {showDetails ? <Icon.Dash style={{ color: hovered ? "black" : "#999", marginRight: "5px" }} /> : <Icon.Plus style={{ color: hovered ? "black" : "#999", marginRight: "5px" }} />}
          </div>
        </Button>
      </div>
      {showDetails && (
        <div className="border border-light p-3 mb-3">
          <hr className="my-2" />
          <br />
          <div className="mb-3">
            <p className="fw-bold mb-0">Default Settings</p>
            <br />
            {Object.keys(data.setupParam?.possibleSettings || {}).map((key) => (
              <div key={key} className="row mb-2">
                <div className="col-sm-6">
                  <p className="fw-bold mb-2">{key}</p>
                </div>
                <div className="col-sm-6 text-end">
                  <OverlayTrigger
                    placement="top"
                    overlay={<Tooltip id="tooltip">{Array.isArray(updatedSettings[key]?.default_val) ? updatedSettings[key]?.default_val.join(", ") : updatedSettings[key]?.default_val}</Tooltip>}
                  >
                    <p
                      className="fw-bold mb-0"
                      style={{
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis"
                      }}
                    >
                      {Array.isArray(updatedSettings[key]?.default_val) ? updatedSettings[key]?.default_val.join(", ") : updatedSettings[key]?.default_val}
                    </p>
                  </OverlayTrigger>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  )

  const renderBodyContent = () => {
    let buttonText
    let description

    switch (data.internal.contentType) {
      case "evalDetectron":
        buttonText = data.internal.settings.target ? "Change Evaluation Metrics" : "Select Detectron Evaluation Metrics"
        description = "Evaluation Node for Detectron."
        break
      case "evalMed3pa":
        buttonText = data.internal.settings.target ? "Change Evaluation Metrics" : "Select MED3pa Evaluation Metrics"
        description = "Evaluation Node for MED3pa."
        break
      case "evalDet3pa":
        buttonText = data.internal.settings.target ? "Change Evaluation Metrics" : "Select DET3pa Evaluation Metrics"
        description = "Evaluation Node for DET3pa."
        break
      default:
        buttonText = data.internal.settings.target ? "Change Evaluation Metrics" : "Select Model Evaluation Metrics"
        description = "Evaluation Node for ML models."
    }

    return (
      <>
        <div className="center">
          <Button variant="light" className="width-100 btn-contour">
            {buttonText}
          </Button>
        </div>
        {renderDetailsSection()}
        <div className="center">
          <p>{description}</p>
        </div>
      </>
    )
  }

  return (
    <>
      <Node key={id} id={id} data={data} setupParam={updatedParams} nodeBody={renderBodyContent()} defaultSettings={renderDefaultSettings()} nodeSpecific={<></>} />
    </>
  )
}
