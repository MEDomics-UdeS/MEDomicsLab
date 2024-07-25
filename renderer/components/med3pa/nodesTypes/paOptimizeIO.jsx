import React from "react"
import { OverlayTrigger, Tooltip } from "react-bootstrap"

/**
 * @param {string} id used to identify the node
 * @returns {JSX.Element} A PaOptimizeIO node
 * @description This component is used to display a PaOptimizeIO node.
 * It is a container with a label and description.
 * Its purpose is to be used in a subflow as a visually appealing demo node.
 * This node is a copy of the OptimizeIO of the learning module
 */
const PaOptimizeIO = ({ id, data }) => {
  // Define inline styles
  const containerStyle = {
    padding: "30px",
    borderRadius: "8px",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    fontFamily: "Verdana, sans-serif",
    color: "#333",
    textAlign: "center",
    border: "2px #ccc"
  }

  const labelStyle = {
    fontSize: "18px",
    fontWeight: "bold",
    color: "#333"
  }

  let tooltipContent = ""
  if (data.internal.name.toLowerCase() === "start") {
    tooltipContent = "Workflow start guide"
  }
  if (data.internal.name.toLowerCase() === "end") {
    tooltipContent = "Workflow End guide"
  }

  return (
    <OverlayTrigger
      placement="top"
      overlay={
        <Tooltip id="tooltip" style={{ backgroundColor: "blue", color: "white" }}>
          {tooltipContent}
        </Tooltip>
      }
    >
      <div style={containerStyle} className={`${id} optimize-io text-center node pa-optimize-io`}>
        <label style={labelStyle}>{data.internal.name}</label>
        <p style={{ fontSize: "14px", color: "#708090", marginTop: "10px" }} className="description">
          {data.internal.description}
        </p>
      </div>
    </OverlayTrigger>
  )
}

export default PaOptimizeIO
