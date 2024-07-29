import React, { useState } from "react"
import { Card, CardContent, Typography, Tooltip } from "@mui/material"
import { MdExpandMore, MdExpandLess, MdOutlineInfo } from "react-icons/md"
import { TbListDetails } from "react-icons/tb"

/**
 *
 * @param {Object} configData The configuration data to be compared and displayed.
 * @returns {JSX.Element} A React element representing a comparison view of configuration data.
 *
 *
 * @description
 * The ConfigComparison component takes configuration data and renders it in a series of expandable cards.
 * Each card represents a configuration key and displays its associated data.
 * The main component renders a list of Card components, each corresponding to a key in `configData`.
 * The content of each Card is controlled by the `toggles` state, allowing users to expand or collapse details.
 */
const ConfigComparison = ({ configData }) => {
  const [toggles, setToggles] = useState({}) // Store toggle state

  /**
   *
   * @param {string} key The key whose boolean state needs to be toggled.
   *
   *
   * @description
   * This function toggles the state of a specified key in the `toggles` state object.
   */
  const handleToggle = (key) => {
    setToggles((prev) => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  /**
   *
   * @param {string} key The base key used to access the value within the `value` object.
   * @param {Object} value The object containing data to be rendered.
   * @returns {JSX.Element} A React element that displays the content based on whether it is different or not.
   *
   *
   * @description
   * This function renders content based on the key and value provided, handling cases where the content is different.
   */
  const renderContent = (key, value) => {
    if (value.different) {
      const columns = ["1", "2"]
      return (
        <div style={{ display: "flex" }}>
          {columns.map((col) => (
            <div key={col} style={{ flex: 1, margin: "0 10px" }}>
              {renderSubObject(value[`${key}${col}`])}
            </div>
          ))}
        </div>
      )
    } else {
      return renderSubObject(value[`${key}1`])
    }
  }

  /**
   *
   * @param {Object} obj  The object to be rendered, where each key-value pair is displayed inside the Card.
   * @returns {JSX.Element} A React element representing a Card with nested content.
   *
   *
   * @description
   * This function Renders a nested object within a styled Card component, displaying key-value pairs.
   */
  const renderSubObject = (obj) => {
    return (
      <Card style={{ boxShadow: "none", border: "1px solid #ddd", marginTop: "10px" }}>
        <CardContent>
          {Object.entries(obj).map(([key, value]) => (
            <div key={key} style={{ marginBottom: "10px" }}>
              {typeof value === "object" && value !== null ? (
                <div>
                  <Tooltip title={key}>
                    <Typography
                      variant="subtitle1"
                      style={{
                        color: "#777",
                        display: "flex",
                        alignItems: "center",
                        cursor: "pointer",
                        overflow: "hidden",
                        textOverflow: "ellipsis"
                      }}
                      onClick={() => handleToggle(key)}
                    >
                      <MdOutlineInfo style={{ marginRight: "5px" }} />
                      <strong> {key}:</strong>
                      {toggles[key] ? <MdExpandLess /> : <MdExpandMore />}
                    </Typography>
                  </Tooltip>
                  {toggles[key] && <div style={{ paddingLeft: "20px" }}>{renderSubObject(value)}</div>}
                </div>
              ) : (
                <Tooltip title={key}>
                  <Typography
                    variant="subtitle1"
                    style={{
                      color: "#777",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap"
                    }}
                  >
                    <MdOutlineInfo style={{ marginRight: "5px" }} />
                    <strong>{key}:</strong> {JSON.stringify(value)}
                  </Typography>
                </Tooltip>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    )
  }

  return (
    <div>
      {Object.entries(configData).map(([key, value]) => (
        <Card key={key} style={{ marginBottom: "10px", boxShadow: "none", border: "1px solid #ddd", backgroundColor: "#f9f9f9" }}>
          <CardContent>
            <div style={{ display: "flex", alignItems: "center", cursor: "pointer" }} onClick={() => handleToggle(key)}>
              <Typography variant="h6" style={{ fontWeight: "bold", color: "#555", flex: 1 }}>
                <TbListDetails style={{ marginRight: "5px" }} />
                {key}
              </Typography>
              {toggles[key] ? <MdExpandLess /> : <MdExpandMore />}
            </div>
            {toggles[key] && renderContent(key, value)}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export default ConfigComparison
