/* eslint-disable react/jsx-key */
import React from "react"
import { Button, Modal, Tab, Tabs } from "react-bootstrap"

const RunPipelineModal = ({ show, onHide, configs }) => {
  return (
    <div>
      <Modal show={show} onHide={onHide} size="lg" aria-labelledby="contained-modal-title-vcenter" centered className="modal-settings-chooser">
        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-vcenter">Run the MED3pa Pipeline</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Tabs defaultActiveKey="conf0" id="uncontrolled-tab-example" className="mb-3">
            {configs.map((config, index) => {
              return (
                <Tab eventKey={"conf" + index} title={"Configuration " + (index + 1)}>
                  {Object.keys(config).map((key) => (
                    <div>
                      {Object.keys(config[key]).map(
                        (k) =>
                          k != "nodes" && (
                            <div>
                              {k} : {config[key][k]}
                            </div>
                          )
                      )}
                      <div></div>
                    </div>
                  ))}
                </Tab>
              )
            })}
          </Tabs>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={onHide}>Run Pipeline</Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}

export default RunPipelineModal
