import React from "react"
import { Button } from "react-bootstrap"
import Modal from "react-bootstrap/Modal"
import { JsonView, allExpanded } from "react-json-view-lite"

const OptimResultsModal = ({ show, onHide, title, results }) => {
  console.log(results)
  return (
    <div>
      <Modal show={show} onHide={onHide} size="lg" aria-labelledby="contained-modal-title-vcenter" centered className="modal-settings-chooser">
        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-vcenter">{title}</Modal.Title>
        </Modal.Header>
        {/* Display all the options available for the node */}
        <Modal.Body>
          {results["data"] ? (
            <>
              <div className="h4">
                Metric : <span className="text-danger">{results["data"]["Metric"]}</span>
              </div>
              <div className="h4">
                Best Score : <span className="text-danger">{results["data"]["Best Score"]}</span>
              </div>
              <div className="h4">
                Best HyperParameters : <span></span>
              </div>
              <JsonView data={results["data"]["Best Parameters"]} shouldExpandNode={allExpanded} />

              <img src={`data:image/png;base64,${results["data"]["opt_history"]}`} alt="Optimization History" />
              <img src={`data:image/png;base64,${results["data"]["parallel_coordinates"]}`} alt="parallel_coordinates" />
              <img src={`data:image/png;base64,${results["data"]["param_importance"]}`} alt="param_importance" />
            </>
          ) : (
            "Loading"
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={onHide}>Save results</Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}

export default OptimResultsModal
