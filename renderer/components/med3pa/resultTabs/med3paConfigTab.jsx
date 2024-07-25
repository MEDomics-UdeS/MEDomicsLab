import React, { useState } from "react"
import { Typography } from "@mui/material"
import { TbListDetails } from "react-icons/tb"
import { MdExpandMore, MdExpandLess } from "react-icons/md"

/**
 *
 * @param {Object} loadedFiles The loaded configuration file of the executed experiment
 * @returns {JSX.Element} The rendered component displaying the configuration details
 *
 *
 * @description
 * This component displays the executed configuration's details and information.
 */
const MED3paConfigTab = ({ loadedFiles }) => {
  /**
   *
   * @param {string} title The title of the expandable section
   * @param {Object} children The content of the expandable section
   * @returns {JSX.Element} The rendered component displaying the expandable section
   *
   *
   * @description
   * This component displays a section that can be expanded or collapsed by clicking on the header.
   */
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

  /**
   *
   * @param {Object} obj The object to be rendered.
   * @returns {JSX.Element[]} An array of JSX elements representing the object's structure.
   *
   *
   * @description
   * This function takes an object and recursively renders its keys and values. If a value is
   * an object, it will be rendered inside an ExpandableSection. Otherwise, it will be displayed
   * as a key-value pair.
   */
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

  /**
   *
   * @param {string} str The string to be processed.
   * @returns {string} The processed string with spaces inserted before uppercase letters.
   *
   *
   * @description
   * This function takes a camelCase or PascalCase string and inserts spaces before each uppercase
   * letter, making it more readable.
   */
  const insertSpacesBeforeUppercase = (str) => {
    return str.replace(/([a-z])([A-Z])/g, "$1 $2")
  }

  // No data loaded if the loadedFiles variable is undefined or empty
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
