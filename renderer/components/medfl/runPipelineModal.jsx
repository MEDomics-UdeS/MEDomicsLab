import { Message } from "primereact/message"
import React, { useEffect, useState } from "react"
import { Button, Modal, Tab, Tabs } from "react-bootstrap"
import { JsonView, allExpanded } from "react-json-view-lite"
import "react-json-view-lite/dist/index.css"

const RunPipelineModal = ({ show, onHide, configs, nodes, onRun }) => {
  const [experimentConfig, setConfig] = useState(null)

  const getConfigInfos = () => {
    console.log("this is the nodes", configs)
    let fullConfig = []
    configs.map((config, index) => {
      fullConfig[index] = {}
      Object.keys(config).map((key) => {
        let nodeId = config[key].id
        fullConfig[index][key] = getNodeById(nodeId)
      })
    })

    setConfig(fullConfig)
  }

  useEffect(() => {
    setConfig(null)
  }, [show])

  const getNodeById = (id) => {
    let n

    nodes.forEach((node) => {
      if (node.id == id) {
        switch (node.type) {
          case "masterDatasetNode":
            n = {
              name: node.data.internal.settings.files?.name,
              path: node.data.internal.settings.files?.path,
              target: node.data.internal.settings.target
            }
            break
          case "groupNode":
            n = {
              name: node.data.internal.name,
              clients: []
            }
            nodes.forEach((client) => {
              if (client.data.internal.subflowId == node.id) {
                if (client.type == "flClientNode") {
                  n.clients = [
                    ...n.clients,
                    {
                      name: client.data.internal.name,
                      type: client.data.internal.settings.nodeType,
                      dataset: client.data.internal.settings.Node_Dataset
                    }
                  ]
                } else {
                  n.server = {
                    name: client.data.internal.name,
                    nRounds: client.data.internal.settings.nRounds,
                    activateDP: client.data.internal.settings.diffPrivacy
                  }
                  if (client.data.internal.settings.diffPrivacy == "Activate") {
                    n.server = {
                      ...n.server,
                      delta: client.data.internal.settings.delta,
                      alpha: client.data.internal.settings.alpha
                    }
                  } else {
                    n.server.delta && delete n.server.delta
                    n.server.alpha && delete n.server.alpha
                  }
                }
              }
            })

            break

          case "flSetupNode":
            n = {
              name: node.data.internal.name,
              description: node.data.internal.settings.description
            }
            break

          case "flDatasetNode":
            n = {
              name: node.data.internal.name,
              validationFraction: node.data.internal.settings.validFrac,
              testFraction: node.data.internal.settings.testFrac
            }
            break
          case "flModelNode":
            if (node.data.internal.settings.activateTl == "false") {
              delete node.data.internal.settings.file
            }
            n = {
              activateTl: node.data.internal.settings.activateTl,
              noTlModelType: node.data.internal.settings.noTlModelType,
              model: node.data.internal.settings.activateTl == "true" ? node.data.internal.settings.file : node.data.internal.settings
            }
            break
          case "flStrategyNode":
            n = node.data.internal.settings
            break
          case "flPipelineNode":
            n = node.data.internal.settings
            break
          default:
            n = {
              name: node.data.internal.name,
              description: node.data.internal.settings.description
            }
            break
        }
      }
    })

    return n
  }

  useEffect(() => {
    if (!experimentConfig) getConfigInfos()
  }, [experimentConfig, configs])

  return (
    <div>
      <Modal show={show} onHide={onHide} size="lg" aria-labelledby="contained-modal-title-vcenter" centered className="modal-settings-chooser">
        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-vcenter">List of configurations to Run ( {configs.length} configurations ) </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {experimentConfig?.length > 0 ? (
            <Tabs defaultActiveKey="conf0" id="uncontrolled-tab-example" className="mb-3">
              {experimentConfig?.map((config, index) => {
                return (
                  <Tab key={index} eventKey={"conf" + index} title={"Configuration " + (index + 1)}>
                    {Object.keys(config).map((key) => (
                      <div key={key} style={{ border: "solid 0.5px grey", borderRadius: 5, margin: 5 }}>
                        <div style={{ borderRadius: "5px 5px 0 0", background: "#D7DBFA", padding: 5, fontWeight: 700, fontSize: 17 }}>{key}</div>
                        <JsonView data={config[key]} shouldExpandNode={allExpanded} />
                      </div>
                    ))}
                  </Tab>
                )
              })}
            </Tabs>
          ) : (
            <div className="text-center fs-3">
              <Message severity="info" text="    You have no configurations !! " className="w-100   " />
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            onClick={() => {
              onRun(experimentConfig)
            }}
          >
            Run Pipeline
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}

export default RunPipelineModal
