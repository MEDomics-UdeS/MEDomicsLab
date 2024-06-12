/* eslint-disable react/jsx-key */
import React, { useState, useEffect } from "react"
import { Button, Modal, Tab, Tabs, Card } from "react-bootstrap"
import { FiArrowLeft } from "react-icons/fi"

const NodeDetails = ({ node }) => {
  const [isExpanded, setIsExpanded] = useState(false)

  if (!node || !node.settings) {
    return null
  }
  const settings = node.settings

  const toggleExpansion = () => {
    setIsExpanded(!isExpanded)
  }

  const renderSettings = (obj, depth = 0) => {
    return Object.entries(obj).map(([key, value]) => {
      const isObject = typeof value === "object" && value !== null

      return (
        <div key={key} style={{ paddingLeft: depth * 20 }}>
          <strong>{key}:</strong> {isObject ? renderSettings(value, depth + 1) : value}
        </div>
      )
    })
  }

  return (
    <Card className="mb-2">
      <Card.Body>
        <Card.Title>{node.label}</Card.Title>
        <Button onClick={toggleExpansion} variant="link" className={`p-0 text-decoration-none ${isExpanded ? "expanded" : ""}`} style={{ fontSize: "0.85rem" }}>
          {isExpanded ? "Hide Details" : "Expand Details"}
        </Button>
        {isExpanded && (
          <>
            <hr />
            {renderSettings(settings)}
          </>
        )}
      </Card.Body>
    </Card>
  )
}

const RunPipelineModal = ({ show, onHide, configs, onRun }) => {
  let med3paNodeCount = 0

  const [selectedConfig, setSelectedConfig] = useState(null)

  useEffect(() => {
    if (!show) {
      setSelectedConfig(null) // Reset the selectedConfig when the modal is hidden
    }
  }, [show])

  const handleShowSubNodes = (children) => {
    console.log(children)
    // Filter configurations with subNodeId equal to med3paId

    // Update state with the filtered configurations
    setSelectedConfig(children)
  }

  const handleBack = () => {
    setSelectedConfig(null)
  }

  const handleRunPipeline = () => {
    onRun(configs)
    onHide()
  }

  return (
    <div>
      <Modal show={show} onHide={onHide} size="lg" aria-labelledby="contained-modal-title-vcenter" centered className="modal-settings-chooser">
        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-vcenter">{selectedConfig ? "Sub Node Details" : "Run the MED3pa Pipeline"}</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {selectedConfig ? (
            <>
              <div style={{ display: "flex", alignItems: "center", marginBottom: "20px" }}>
                <FiArrowLeft onClick={handleBack} size={25} style={{ cursor: "pointer", marginRight: "5px", color: "#007bff" }} />
                <span style={{ cursor: "pointer", color: "#007bff" }} onClick={handleBack}>
                  Back to General Configurations
                </span>
              </div>

              <Tabs defaultActiveKey="conf0" id="uncontrolled-tab-example" className="mb-3">
                {selectedConfig.map((config, index) => {
                  const isMed3paConfig = config.some((node) => node.label.startsWith("MED3pa."))
                  const configName = isMed3paConfig ? `MED3PA NODE Configuration ${++med3paNodeCount}` : `Configuration ${index + 1}`
                  return (
                    <Tab eventKey={"conf" + index} title={configName}>
                      <div>
                        {config.map((node) => (
                          <NodeDetails key={node.id} node={node} />
                        ))}
                      </div>
                    </Tab>
                  )
                })}
              </Tabs>
            </>
          ) : (
            <Tabs defaultActiveKey="conf0" id="uncontrolled-tab-example" className="mb-3">
              {configs
                .filter((config) => config.every((node) => node.supIdNode === ""))
                .map((config, index) => {
                  const med3paNode = config.find((node) => node.label === "MED3pa")

                  return (
                    <Tab eventKey={"conf" + index} title={`Configuration ${index + 1}`}>
                      <div>
                        {config.map((node) => (
                          <NodeDetails key={node.id} node={node} />
                        ))}
                      </div>
                      {med3paNode && (
                        <>
                          <br></br>
                          <Button onClick={() => handleShowSubNodes(med3paNode.children)} variant="outline-primary" size="sm">
                            Show MED3pa Node Configurations
                          </Button>
                        </>
                      )}
                    </Tab>
                  )
                })}
            </Tabs>
          )}
        </Modal.Body>
        <Modal.Footer>{!selectedConfig && <Button onClick={handleRunPipeline}>Run Pipeline</Button>}</Modal.Footer>
      </Modal>
    </div>
  )
}

export default RunPipelineModal
