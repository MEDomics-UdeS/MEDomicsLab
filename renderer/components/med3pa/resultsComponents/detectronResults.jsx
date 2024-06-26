import { Typography } from "@mui/material"
import { BiSearchAlt } from "react-icons/bi"
import React from "react"

const DetectronResults = () => {
  return (
    <div className="card-paresults p-3">
      <Typography variant="h6" style={{ color: "#868686", fontSize: "1.2rem", display: "flex", alignItems: "center" }}>
        <BiSearchAlt style={{ marginRight: "0.5rem", fontSize: "1.6rem" }} /> {/* Icon before the text */}
        Covariate Shift Detection
      </Typography>
      <hr style={{ borderColor: "#868686", borderWidth: "0.5px", flex: "1", marginLeft: "0.5rem" }} />
      <div className="default-text-color-paresults">Here Covariate shift chart...</div>
    </div>
  )
}

export default DetectronResults
