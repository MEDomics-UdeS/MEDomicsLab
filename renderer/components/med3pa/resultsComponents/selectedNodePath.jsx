import React, { useState } from "react"
import { Typography } from "@mui/material"

import { GiPathDistance } from "react-icons/gi"
import { FaMinus, FaPlus } from "react-icons/fa"

/**
 *
 * @param {Object} selectedNodeInfo Information about the selected node.
 * @returns {JSX.Element|null} The rendered component, or `null` if no `selectedNodeInfo` is provided.
 *
 *
 * @description
 * Component that displays the path of a selected node and allows toggling its visibility.
 */
const SelectedNodePath = ({ selectedNodeInfo }) => {
  const [isContentVisible, setIsContentVisible] = useState(true) // Controls whether the path content is visible or hidden

  // If no selectedNodeInfo is provided, render nothing
  if (!selectedNodeInfo) return null

  return (
    <div
      style={{
        position: "relative",
        top: "20px",
        display: "inline-block",
        minWidth: "25%",
        borderRadius: "8px",
        backgroundColor: "#80cbc4",
        boxShadow: "0 4px 4px rgba(0, 0, 0, 0.1)",
        padding: "5px",
        border: "1px solid rgba(0, 0, 0, 0.1)",
        zIndex: 1000
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}
      >
        <Typography variant="h6" style={{ marginLeft: "5px", color: "black", display: "flex", alignItems: "center" }}>
          <GiPathDistance style={{ fontSize: "1.5rem", color: "black", marginRight: "10px" }} />
          Profile {selectedNodeInfo.data.internal.settings.id}
        </Typography>
        <div style={{ display: "flex", alignItems: "center" }}>
          {isContentVisible ? (
            <FaMinus style={{ cursor: "pointer", fontSize: "1rem", color: "black" }} onClick={() => setIsContentVisible(false)} />
          ) : (
            <FaPlus style={{ cursor: "pointer", fontSize: "1rem", color: "black" }} onClick={() => setIsContentVisible(true)} />
          )}
        </div>
      </div>
      {isContentVisible && (
        <div
          style={{
            backgroundColor: "#FFFFFF",
            padding: "20px",
            borderRadius: "8px",
            marginTop: "10px",
            boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)"
          }}
        >
          <Typography variant="body1">
            <div
              style={{ color: "black", fontWeight: "bold", width: "100%", fontSize: "100%", wordWrap: "break-word" }}
              dangerouslySetInnerHTML={{
                __html: `${selectedNodeInfo.data.internal.settings.path
                  .filter((item) => item !== "*")
                  .map((item) => item)
                  .join(" <br /> ")}`
              }}
            />
          </Typography>
        </div>
      )}
    </div>
  )
}

export default SelectedNodePath
