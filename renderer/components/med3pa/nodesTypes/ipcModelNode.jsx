import React, { useState, useContext, useEffect } from "react"
import Node from "../../flow/node"
import FlInput from "../paInput"
import { Button, Modal, OverlayTrigger, Tooltip } from "react-bootstrap"
import * as Icon from "react-bootstrap-icons"
import { FlowFunctionsContext } from "../../flow/context/flowFunctionsContext"

export default function IPCModelNode({ id, data }) {
  // context
  const [showDetails, setShowDetails] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const { updateNode } = useContext(FlowFunctionsContext)
  const [hovered, setHovered] = useState(false)

  // Initialize the files field in the internal data if it doesn't exist
  useEffect(() => {
    updateNode({
      id: id,
      updatedData: data.internal
    })
  }, [])

  const handleInputChange = (key, value) => {
    // Check if the value is an array (multi-select) or a single value (text input)
    const selectedValues = Array.isArray(value.value) ? value.value.map((option) => option.name) : value.value

    // Update the context with the new value
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

  const handleModalShow = () => setShowModal(true)
  const handleModalClose = () => setShowModal(false)

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
              <Button variant="light" className="width-100 btn-contour" onClick={handleModalShow}>
                {data.internal.settings.target ? "Change Selected Parameters" : "Select IPC Model Parameters"}
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
                    <div className="row mb-2" key={key}>
                      <div className="col-sm-6">
                        <p className="fw-bold mb-2">{key}</p>
                      </div>
                      <div className="col-sm-6 text-end">
                        <OverlayTrigger
                          placement="top"
                          overlay={
                            <Tooltip id="tooltip">{Array.isArray(data.setupParam.possibleSettings[key].default_val) ? data.internal.settings[key].join(", ") : data.internal.settings[key]}</Tooltip>
                          }
                        >
                          <p className="fw-bold mb-0" style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {Array.isArray(data.setupParam.possibleSettings[key].default_val) ? data.internal.settings[key].join(", ") : data.internal.settings[key]}
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
            <div>IPC Model is responsible for extracting individual problematic patients</div>
          </>
        }
        // node specific is the body of the node, so optional settings
        nodeSpecific={<></>}
      />
      <Modal show={showModal} onHide={handleModalClose} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Select IPC Model Parameters</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {/* Iterate over possible settings and render FlInput components */}
          {Object.keys(data.setupParam.possibleSettings).map((key) => (
            <FlInput
              key={key}
              name={key}
              settingInfos={{
                ...data.setupParam.possibleSettings[key],
                ...(data.setupParam.possibleSettings[key].options && {
                  choices: data.setupParam.possibleSettings[key].options
                })
              }}
              currentValue={data.internal.settings[key] || ""}
              onInputChange={(value) => handleInputChange(key, value)}
            />
          ))}
          {/* Add the DecisionTree component here */}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleModalClose}>
            Close
          </Button>
          <Button variant="primary" onClick={handleModalClose}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  )
}
