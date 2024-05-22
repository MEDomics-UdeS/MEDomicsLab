/* eslint-disable camelcase */
import React, { useState, useContext, useEffect } from "react"
import Node from "../../flow/node"
import FlInput from "../paInput"
import { Button } from "react-bootstrap"
import * as Icon from "react-bootstrap-icons"
import { FlowFunctionsContext } from "../../flow/context/flowFunctionsContext"

import { OverlayTrigger, Tooltip } from "react-bootstrap"

export default function DetectronNode({ id, data }) {
  // context
  const [showDetails, setShowDetails] = useState(false)
  const { updateNode } = useContext(FlowFunctionsContext)
  const [hovered, setHovered] = useState(false)
  const [updatedSettings, setUpdatedSettings] = useState(data.setupParam.possibleSettings)

  // Initialize the files field in the internal data if it doesn't exist

  useEffect(() => {
    updateNode({
      id: id,
      updatedData: data.internal
    })
  }, [])

  useEffect(() => {
    setUpdatedSettings(data.setupParam.possibleSettings)
  }, [data.setupParam.possibleSettings])

  const handleInputChange = (key, value) => {
    // Check if the value is an array (multi-select) or a single value (text input)
    const selectedValues = Array.isArray(value.value) ? value.value.map((option) => option.name) : value.value

    // Update the context with the new value
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

  return (
    <>
      {/* build on top of the Node component */}
      <Node
        key={id}
        id={id}
        data={data}
        setupParam={data.setupParam}
        // the body of the node is a form select (particular to this node)
        nodeBody={
          <>
            <div className="center">
              <Button variant="light" className="width-100 btn-contour">
                {data.internal.settings.target ? "Change Selected Parameters" : "Select Detectron Parameters"}
              </Button>
            </div>
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
                      color: hovered ? "black" : "#999" // Lighter color
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
                  {Object.keys(data.setupParam.possibleSettings).map((key) => (
                    // eslint-disable-next-line react/jsx-key
                    <div className="row mb-2">
                      <div className="col-sm-6">
                        <p className="fw-bold mb-2">{key}</p>
                      </div>
                      <div className="col-sm-6 text-end">
                        <OverlayTrigger
                          placement="top"
                          overlay={
                            <Tooltip id="tooltip">
                              {Array.isArray(data.setupParam.possibleSettings[key].default_val) ? updatedSettings[key].default_val.join(", ") : updatedSettings[key].default_val}
                            </Tooltip>
                          }
                        >
                          <p className="fw-bold mb-0" style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {Array.isArray(data.setupParam.possibleSettings[key].default_val) ? updatedSettings[key].default_val.join(", ") : updatedSettings[key].default_val}
                          </p>
                        </OverlayTrigger>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        }
        // default settings are the default settings of the node, so mandatory settings
        defaultSettings={
          <>
            {Object.keys(data.setupParam.possibleSettings).map((key) => (
              <FlInput
                key={key}
                name={key}
                settingInfos={{
                  type: data.setupParam.possibleSettings[key].type,
                  tooltip: data.setupParam.possibleSettings[key].tooltip,
                  ...(data.setupParam.possibleSettings[key].options && {
                    choices: data.setupParam.possibleSettings[key].options
                  })
                }}
                currentValue={updatedSettings[key].default_val || ""}
                onInputChange={(value) => handleInputChange(key, value)}
              />
            ))}
          </>
        }
        // node specific is the body of the node, so optional settings
        nodeSpecific={<></>}
      />
    </>
  )
}
