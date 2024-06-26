import React, { useState } from "react"
import { Button } from "react-bootstrap"
import { MdOutlineGroups3 } from "react-icons/md"
import * as Icon from "react-bootstrap-icons"
import { Handle } from "reactflow"

export default function TreeNode({ id, data }) {
  const [showDetails, setShowDetails] = useState(false)
  const [hovered, setHovered] = useState(false)

  const metrics = data.internal.settings.metrics
  const basicMetrics = {
    "Node%": metrics["Node%"],
    "Population%": metrics["Population%"],
    "Mean confidence level": metrics["Mean confidence level"],
    "Positive%": metrics["Positive%"]
  }

  const detailedMetrics = {
    Auc: metrics.Auc,
    Accuracy: metrics.Accuracy,
    BalancedAccuracy: metrics.BalancedAccuracy
  }

  return (
    <>
      <div
        className="node"
        style={{
          background: "#F5F5F5",
          borderRadius: "8px",
          border: "1px solid rgba(0, 0, 0, 0.1)",
          boxShadow: "0px 4px 4px rgba(0, 0, 0, 0.1)",
          padding: "10px",
          position: "relative"
        }}
      >
        {/* Top handle */}
        <Handle type="source" position="bottom" id={`${id}_top`} style={{ background: "#555", left: "50%", transform: "translateX(-50%)" }} />
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: "10px"
          }}
        >
          <MdOutlineGroups3 style={{ fontSize: "28px", color: "#353535", marginRight: "10px" }} />
          <h5 style={{ margin: 0, fontSize: "1.2rem" }}>Profil {data.internal.settings.id}</h5>
        </div>
        <div
          className="node-body"
          style={{
            background: "white",
            borderRadius: "8px",
            padding: "10px",
            boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)"
          }}
        >
          {Object.keys(basicMetrics).map((key) => (
            <div className="row mb-2" key={key}>
              <div className="col-sm-6">
                <p className="fw-bold mb-2" style={{ fontSize: "1.2rem" }}>
                  {key}
                </p>
              </div>
              <div className="col-sm-6 text-end">
                <p className="fw-bold mb-0" style={{ fontSize: "1.2rem" }}>
                  {basicMetrics[key]}
                </p>
              </div>
            </div>
          ))}
        </div>
        <div className="center">
          <Button
            variant="light"
            className="width-100 btn-contour"
            onClick={() => setShowDetails(!showDetails)}
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
                  fontSize: "0.9rem",
                  color: hovered ? "black" : "#999"
                }}
              >
                {showDetails ? "Hide Details" : "Show Details"}
              </span>
              {showDetails ? <Icon.Dash style={{ color: hovered ? "black" : "#999", marginRight: "5px" }} /> : <Icon.Plus style={{ color: hovered ? "black" : "#999", marginRight: "5px" }} />}
            </div>
          </Button>
        </div>
        {/* Bottom handle */}
        <Handle type="target" position="top" id={`${id}_bottom`} style={{ background: "#555", left: "50%", transform: "translateX(-50%)" }} />
        {showDetails && (
          <div className="border border-light p-3 mb-3">
            <hr className="my-2" />
            <br />
            <div className="mb-3">
              <p className="fw-bold mb-0" style={{ fontSize: "1.2rem" }}>
                Detailed Metrics
              </p>
              <br />
              {Object.keys(detailedMetrics).map((key) => (
                <div className="row mb-2" key={key}>
                  <div className="col-sm-6">
                    <p className="fw-bold mb-2" style={{ fontSize: "1.2rem" }}>
                      {key}
                    </p>
                  </div>
                  <div className="col-sm-6 text-end">
                    <p className="fw-bold mb-0" style={{ fontSize: "1.2rem" }}>
                      {detailedMetrics[key]}
                    </p>
                  </div>
                </div>
              ))}
              <div className="row mb-2">
                <div className="col-sm-6">
                  <p className="fw-bold mb-2" style={{ fontSize: "1.2rem" }}>
                    Detectron Results
                  </p>
                </div>
                <div className="col-sm-6 text-end">
                  <p className="fw-bold mb-0" style={{ fontSize: "1.2rem" }}>
                    {data.internal.settings.detectron_results === null ? "No results to show" : data.internal.settings.detectron_results}
                  </p>
                </div>
              </div>
              <div className="row mb-2">
                <div className="col-sm-6">
                  <p className="fw-bold mb-2" style={{ fontSize: "1.2rem" }}>
                    Value
                  </p>
                </div>
                <div className="col-sm-6 text-end">
                  <p className="fw-bold mb-0" style={{ fontSize: "1.2rem" }}>
                    {data.internal.settings.value}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
