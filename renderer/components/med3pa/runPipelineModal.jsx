import React, { useState, useEffect } from "react"
import { Button, Modal, Tab, Tabs, Card, Container, Row, Col } from "react-bootstrap"
import { FiArrowLeft } from "react-icons/fi"

/**
 *
 * @param {Object} node The node object containing details and settings to display.
 * @param {string} labelColor The color for the label text.
 * @returns {JSX.Element} The rendered component showing node details.
 *
 * @description
 * This component renders a card displaying the details of a node. The node's label and settings are shown,
 * with the option to expand or collapse the detailed settings view.
 */
const NodeDetails = ({ node, labelColor }) => {
  const [isExpanded, setIsExpanded] = useState(false)

  if (!node || !node.settings) {
    return null
  }
  const settings = node.settings

  /**
   *
   * @description
   * The function toggles the expansion state to show or hide details.
   */
  const toggleExpansion = () => {
    setIsExpanded(!isExpanded)
  }

  /**
   *
   * @param {Object} obj The settings object to render.
   * @param {number} depth The depth level for indentation.
   * @param {string} parentKey he key of the parent object for unique key generation.
   * @returns {JSX.Element[]} Array of Card components displaying the settings.
   *
   *
   * @description
   * Recursively renders the settings object into a list of Card components.
   */
  const renderSettings = (obj, depth = 0, parentKey = "") => {
    return Object.entries(obj).map(([key, value]) => {
      const isObject = typeof value === "object" && value !== null
      const uniqueKey = parentKey ? `${parentKey}.${key}` : key
      // Check if the node label is "Dataset Loader"

      if (key.startsWith("file_")) {
        const fileIndex = parseInt(key.split("_")[1])
        key = `file_${["train", "val", "test", "eval"][fileIndex]}`
      } else if (key.startsWith("target_")) {
        const targetIndex = parseInt(key.split("_")[1])
        key = `target_${["train", "val", "test", "eval"][targetIndex]}`
      }
      return (
        <Card key={uniqueKey} className="mb-2" style={{ paddingLeft: depth * 10, backgroundColor: "#f8f9fa", borderRadius: "8px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
          <Card.Body>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <strong style={{ color: labelColor }}>{key}:</strong>
              </div>
              <div style={{ fontFamily: "Arial, sans-serif", fontSize: "0.9rem", color: "#555" }}>{isObject ? renderSettings(value, depth + 1, uniqueKey) : value}</div>
            </div>
          </Card.Body>
        </Card>
      )
    })
  }

  return (
    <Card className="mb-2" style={{ borderRadius: "8px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
      <Card.Body>
        <Card.Title style={{ color: labelColor }}>{node.label}</Card.Title>
        {isExpanded && (
          <>
            <hr />
            <Container>
              <Row>
                <Col>{renderSettings(settings)}</Col>
              </Row>
            </Container>
          </>
        )}
        <div className="d-flex justify-content-end">
          <Button onClick={toggleExpansion} variant="link" className={`p-0 text-decoration-none ${isExpanded ? "expanded" : ""}`} style={{ fontSize: "0.85rem", color: "#007bff" }}>
            {isExpanded ? "Hide Details" : "Show Details"}
          </Button>
        </div>
      </Card.Body>
    </Card>
  )
}

/**
 *
 * @param {boolean} show Indicates if the modal is visible.
 * @param {function} onHide Function to call when hiding the modal.
 * @param {Array} configs Array of configurations to display.
 * @param {function} onRun Function to call when running the pipeline.
 *
 *
 * @description
 * Modal for running the MED3pa pipeline / displaying detailed configurations.
 */
const RunPipelineModal = ({ show, onHide, configs, onRun }) => {
  const [selectedConfig, setSelectedConfig] = useState(null)

  // Update the selectedConfig when show state changes
  useEffect(() => {
    if (!show) {
      setSelectedConfig(null) // Reset the selectedConfig when the modal is hidden
    }
  }, [show])

  /**
   *
   * @param {Array} children Array of child nodes to display.
   *
   *
   * @description
   * The function sets the selected configuration to show sub-nodes.
   */
  const handleShowSubNodes = (children) => {
    setSelectedConfig(children)
  }

  /**
   * Resets the selected configuration to return to the previous view.
   */
  const handleBack = () => {
    setSelectedConfig(null)
  }

  /**
   * Executes the pipeline with the current configurations and hides the modal.
   */
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
                  const configName = isMed3paConfig ? `MED3PA NODE Configuration ${index + 1}` : `Configuration ${index + 1}`
                  return (
                    <Tab key={index} eventKey={"conf" + index} title={configName}>
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
                    <Tab key={index} eventKey={"conf" + index} title={`Configuration ${index + 1}`}>
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
