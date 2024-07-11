import React, { useState, useContext, useEffect } from "react"
import Node from "../../flow/node"
import FlInput from "../paInput"
import { Button } from "react-bootstrap" // Ensure Dropdown is imported from react-bootstrap
import * as Icon from "react-bootstrap-icons"
import { FlowFunctionsContext } from "../../flow/context/flowFunctionsContext"
import { OverlayTrigger, Tooltip } from "react-bootstrap"

export default function DetectronNode({ id, data }) {
  const [showDetails, setShowDetails] = useState(false)
  const { updateNode } = useContext(FlowFunctionsContext)
  const [hovered, setHovered] = useState(false)
  const [settingsLoaded, setSettingsLoaded] = useState(false)

  useEffect(() => {
    // Simulate loading delay with setTimeout
    const timer = setTimeout(() => {
      const defaultSettings = {}
      for (const key in data.setupParam.possibleSettings) {
        defaultSettings[key] = data.setupParam.possibleSettings[key].default_val
      }

      updateNode({
        id: id,
        updatedData: {
          ...data.internal,
          settings: {
            ...defaultSettings
          }
        }
      })
      setSettingsLoaded(true)
    }, 2000) // Adjust timeout delay as needed (2000ms = 2 seconds)

    return () => clearTimeout(timer) // Cleanup timeout on component unmount
  }, [id, data.internal, data.setupParam.possibleSettings, updateNode])

  useEffect(() => {
    console.log("HEY:", data.internal.settings)
    console.log("HEY2:", data.setupParam.possibleSettings)
  }, [settingsLoaded])

  const handleInputChange = (key, value) => {
    const selectedValues = Array.isArray(value.value) ? value.value.map((option) => option) : value.value

    updateNode({
      id: id,
      updatedData: {
        ...data.internal,
        settings: {
          ...data.internal.settings,
          [key]: selectedValues
        }
      }
    })
  }

  const toggleShowDetails = () => {
    setShowDetails(!showDetails)
  }

  return (
    <>
      <Node
        key={id}
        id={id}
        data={data}
        setupParam={data.setupParam}
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
                      color: hovered ? "black" : "#999"
                    }}
                  >
                    {showDetails ? "Hide Details" : "Show Details"}
                  </span>
                  {showDetails ? (
                    <Icon.Dash
                      style={{
                        color: hovered ? "black" : "#999",
                        marginRight: "5px"
                      }}
                    />
                  ) : (
                    <Icon.Plus
                      style={{
                        color: hovered ? "black" : "#999",
                        marginRight: "5px"
                      }}
                    />
                  )}
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
                    <div className="row mb-2" key={key}>
                      <div className="col-sm-6">
                        <p className="fw-bold mb-2">{key}</p>
                      </div>
                      <div className="col-sm-6 text-end">
                        <OverlayTrigger
                          placement="top"
                          overlay={
                            <Tooltip id={`tooltip-${key}`}>
                              {Array.isArray(data.internal.settings[key]) ? data.internal.settings[key].map((item) => item.name).join(", ") : data.internal.settings[key]}
                            </Tooltip>
                          }
                        >
                          <p
                            className="fw-bold mb-0"
                            style={{
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis"
                            }}
                          >
                            {Array.isArray(data.internal.settings[key]) ? data.internal.settings[key].map((item) => item.name).join(", ") : data.internal.settings[key]}
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
        defaultSettings={
          <>
            {settingsLoaded &&
              Object.keys(data.setupParam.possibleSettings).map((key) => (
                <div key={key} style={{ marginBottom: "2px" }}>
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
                    currentValue={data.internal?.settings[key] || data.setupParam.possibleSettings[key].default_val}
                    onInputChange={(value) => handleInputChange(key, value)}
                  />
                </div>
              ))}
          </>
        }
        nodeSpecific={<></>}
      />
    </>
  )
}
