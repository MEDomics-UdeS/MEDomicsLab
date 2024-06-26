// src/MetricsComponent.jsx
import { Typography } from "@mui/material"
import React from "react"
import { TbChartDots2 } from "react-icons/tb"
const MDRCurve = () => {
  return (
    <div className="card-paresults p-3">
      <Typography variant="h6" style={{ color: "#868686", fontSize: "1.2rem", display: "flex", alignItems: "center" }}>
        <TbChartDots2 style={{ marginRight: "0.5rem", fontSize: "1.4rem" }} />
        Metrics By Declaration Rate Curve
      </Typography>
      <hr style={{ borderColor: "#868686", borderWidth: "0.5px" }} />
      <div className="default-text-color-paresults">Here Metrics chart...</div>
    </div>
  )
}

export default MDRCurve
