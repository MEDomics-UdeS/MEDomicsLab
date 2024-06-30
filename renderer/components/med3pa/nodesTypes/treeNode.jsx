import React from "react"
import { Handle } from "reactflow"
import { MdOutlineGroups3 } from "react-icons/md"

export default function TreeNode({ id, data }) {
  const settings = data.internal.settings

  const renderSettingValue = (value, parentKey) => {
    if (typeof value === "object" && value !== null) {
      // If value is an object, render its child fields as key-value pairs
      return (
        <div>
          {Object.keys(value).map((key) => (
            <div className="row mb-2" key={key}>
              <div className="col-sm-6">
                <p className="fw-bold mb-2" style={{ fontSize: "1.2rem" }}>
                  {key}
                </p>
              </div>
              <div className="col-sm-6 text-end">
                <p className="fw-bold mb-0" style={{ fontSize: "1.2rem" }}>
                  {value[key]}
                </p>
              </div>
            </div>
          ))}
        </div>
      )
    } else {
      // Render the value directly with its key if available
      return (
        <div className="row mb-2">
          <div className="col-sm-6">
            <p className="fw-bold mb-2" style={{ fontSize: "1.2rem" }}>
              {parentKey}
            </p>
          </div>
          <div className="col-sm-6 text-end">
            <p className="fw-bold mb-0" style={{ fontSize: "1.2rem" }}>
              {value !== null ? value.toString() : "Nothing to show"}
            </p>
          </div>
        </div>
      )
    }
  }

  return (
    <div
      className="node"
      style={{
        background: "#F5F5F5",
        borderRadius: "8px",
        border: "1px solid rgba(0, 0, 0, 0.1)",
        boxShadow: "0px 4px 4px rgba(0, 0, 0, 0.1)",
        padding: "10px",
        position: "relative",
        minHeight: "150px" // Set a minimum height to ensure content visibility
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
        <h5 style={{ margin: 0, fontSize: "1.2rem" }}>Profil {settings.id}</h5>
      </div>
      <div
        className="node-body"
        style={{
          background: "white",
          borderRadius: "8px",
          padding: "15px",
          boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)"
        }}
      >
        {/* Display all settings dynamically, excluding 'path' */}
        {Object.keys(settings).map((key) => {
          if (key === "path") return null // Skip rendering 'path'
          const value = settings[key]
          return <div key={key}>{renderSettingValue(value, key)}</div>
        })}
      </div>
      {/* Bottom handle */}
      <Handle type="target" position="top" id={`${id}_bottom`} style={{ background: "#555", left: "50%", transform: "translateX(-50%)" }} />
    </div>
  )
}
