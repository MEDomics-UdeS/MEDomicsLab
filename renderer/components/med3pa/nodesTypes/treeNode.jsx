import React from "react"
import { Handle } from "reactflow"
import { MdOutlineGroups3 } from "react-icons/md"

export default function TreeNode({ id, data }) {
  const settings = data.internal.settings
  const { className } = settings

  const renderSettingValue = (value, parentKey) => {
    if (typeof value === "object" && value !== null) {
      // If value is an object, render its child fields as key-value pairs
      return (
        <div>
          {Object.keys(value).map((key) => (
            <div className="row mb-2" key={key}>
              <div className="col-sm-6">
                <p className="panode-value">{key}</p>
              </div>
              <div className="col-sm-6 text-end">
                <p className="panode-value-end">{value[key]}</p>
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
            <p className="panode-value">{parentKey}</p>
          </div>
          <div className="col-sm-6 text-end">
            <p className="panode-value-end">{value !== null ? value.toString() : "Nothing to show"}</p>
          </div>
        </div>
      )
    }
  }

  return (
    <div className={`panode ${className}`}>
      {/* Top handle */}
      <Handle type="source" position="bottom" id={`${id}_top`} style={{ background: "#555", left: "50%", transform: "translateX(-50%)" }} />
      <div className="panode-header">
        <MdOutlineGroups3 style={{ fontSize: "28px", color: "#353535", marginRight: "10px" }} />
        <h5>Profile {settings.id}</h5>
      </div>
      <div className="panode-body">
        {/* Display all settings dynamically, excluding 'path' */}
        {Object.keys(settings).map((key) => {
          if (key === "path" || key === "className") return null
          const value = settings[key]
          return <div key={key}>{renderSettingValue(value, key)}</div>
        })}
      </div>
      {/* Bottom handle */}
      <Handle type="target" position="top" id={`${id}_bottom`} style={{ background: "#555", left: "50%", transform: "translateX(-50%)" }} />
    </div>
  )
}
