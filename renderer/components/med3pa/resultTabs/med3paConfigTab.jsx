import React, { useEffect, useState } from "react"
import { Typography } from "@mui/material"
import { TbListDetails } from "react-icons/tb"
import { MdExpandMore, MdExpandLess } from "react-icons/md"

const ExpandableSection = ({ title, children }) => {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className="card mb-3">
      <div className="card-header" onClick={() => setIsExpanded(!isExpanded)}>
        <h4>
          {isExpanded ? <MdExpandLess /> : <MdExpandMore />} {title}
        </h4>
      </div>
      {isExpanded && (
        <div className="card-body p-3">
          <div className="inner-content">{children}</div>
        </div>
      )}
    </div>
  )
}

const renderObject = (obj) => {
  return Object.entries(obj).map(([key, value]) => {
    if (key === "experiment_name") return
    if (typeof value === "object" && value !== null) {
      return (
        <ExpandableSection title={key} key={key}>
          {renderObject(value)}
        </ExpandableSection>
      )
    }
    return (
      <div className="card-body py-2" key={key}>
        <p className="m-0">
          <strong>{key}:</strong> {JSON.stringify(value)}
        </p>
      </div>
    )
  })
}

const insertSpacesBeforeUppercase = (str) => {
  return str.replace(/([a-z])([A-Z])/g, "$1 $2")
}

const MED3paConfigTab = ({ loadedFiles }) => {
  useEffect(() => {
    console.log("LoadedFiles", loadedFiles)
  }, [loadedFiles])

  if (!loadedFiles || Object.keys(loadedFiles).length === 0) {
    return (
      <div className="card-paresults">
        <Typography
          variant="h6"
          style={{
            color: "#868686",
            fontSize: "1.2rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}
        >
          <div style={{ display: "flex", alignItems: "center" }}>
            <TbListDetails style={{ marginRight: "0.5rem", fontSize: "1.4rem" }} />
            <span style={{ marginRight: "0.5rem" }}>Configuration Information</span>
          </div>
          <span style={{ fontSize: "0.8rem", color: "#777" }}>{insertSpacesBeforeUppercase(loadedFiles["experiment_name"])}</span>
        </Typography>
        <hr style={{ borderColor: "#868686", borderWidth: "0.5px", width: "100%" }} />
        <p>No Data Loaded...</p>
      </div>
    )
  }

  return (
    <div className="card-paresults">
      <Typography
        variant="h6"
        style={{
          color: "#868686",
          fontSize: "1.2rem",
          display: "flex",
          justifyContent: "space-between", // Align items horizontally with space in between
          alignItems: "center" // Align items vertically
        }}
      >
        <div style={{ display: "flex", alignItems: "center" }}>
          <TbListDetails style={{ marginRight: "0.5rem", fontSize: "1.4rem" }} />
          <span style={{ marginRight: "0.5rem" }}>Configuration Details</span>
        </div>
        <span style={{ fontSize: "0.8rem", color: "#777" }}>{insertSpacesBeforeUppercase(loadedFiles["experiment_name"])}</span>
      </Typography>
      <hr style={{ borderColor: "#868686", borderWidth: "0.5px", width: "100%" }} />
      {renderObject(loadedFiles)}
    </div>
  )
}

export default MED3paConfigTab
