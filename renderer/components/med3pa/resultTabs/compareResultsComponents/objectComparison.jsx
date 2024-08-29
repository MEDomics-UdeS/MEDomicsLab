import React, { useEffect, useState } from "react"
import { CardContent, Typography } from "@mui/material"
import { getIconAndNameByType, transformKey } from "./objSettings"
import { Card } from "react-bootstrap"
import { MdOutlineInfo } from "react-icons/md"
import { FaCompress, FaExpand } from "react-icons/fa"
import { TbListDetails } from "react-icons/tb"
import GlobalMetricsCurve from "./compareObjectComponents/globMetricsCurve"
import ProfMetricsCurve from "./compareObjectComponents/profMetricsCurve"
import { formatValue } from "../../resultTabs/tabFunctions"
import Tooltip from "@mui/material/Tooltip"
import ConfigComparison from "./compareObjectComponents/configComparison"
import RejectionCountsCurve from "./compareObjectComponents/rejectionCountsCurve"
import ComparisonCards from "./compareObjectComponents/compCards"

/**
 *
 * @param {Object} loadedFile The file data to be processed and displayed. This object contains key-value pairs for various comparisons.
 * @param {string} type The type of comparison to determine which icon and title to use.
 * @returns {JSX.Element} A React element representing the comparison view, including different components or a layout based on the `type` prop.
 *
 *
 * @description
 * The `ObjectComparison` component renders different types of comparison views based on the `type` and `loadedFile` props.
 *
 */
const ObjectComparison = ({ loadedFile, type }) => {
  const { icon, name } = getIconAndNameByType(type) // Get the Title and the Icon of the comparison component
  const [toggleStates, setToggleStates] = useState({}) //  Store toggle states
  const [mainToggle, setMainToggle] = useState(true) // State for the main content toggle

  // Log the loaded File
  useEffect(() => {
    if (loadedFile && Object.keys(loadedFile).length > 0) {
      console.log("LOADED FILE INFO:", loadedFile)
    } else {
      console.log("No loaded file found ")
    }
  }, [loadedFile])

  /**
   *
   * @param {string} key The key whose state needs to be toggled.
   *
   *
   * @description
   * The function toggles the boolean state of a given key in the toggleStates object.
   */
  const toggleKey = (key) => {
    setToggleStates((prevState) => ({
      ...prevState,
      [key]: !prevState[key]
    }))
  }

  /**
   *
   * @param {Array} arr The array of items to be rendered.
   * @param {string} parentKey The key used as a prefix for identifying each item in the array.
   * @returns {JSX.Element} A React element that renders the array items with nested objects or primitive values.
   *
   *
   * @description
   * The function renders an array of items, where each item can be an object with a "Strategy" key or a primitive value.
   * The `parentKey` is used to uniquely identify each item and manage its toggle state.
   */
  const renderArray = (arr, parentKey) => (
    <div style={{ marginLeft: "20px" }}>
      {arr.map((item, index) => {
        const itemKey = `${parentKey}.${index}`
        if (typeof item === "object" && item !== null && "Strategy" in item) {
          return (
            <div key={itemKey} style={{ marginBottom: "10px" }}>
              <div style={{ display: "flex", alignItems: "center", cursor: "pointer" }} onClick={() => toggleKey(itemKey)}>
                <MdOutlineInfo style={{ marginRight: "5px" }} />
                <Typography variant="subtitle1" style={{ fontWeight: "bold", marginRight: "10px", color: "#777" }}>
                  {item.Strategy}
                </Typography>
              </div>
              {toggleStates[itemKey] && <div style={{ marginLeft: "20px" }}>{renderNestedObject(item, itemKey)}</div>}
            </div>
          )
        } else {
          return (
            <div key={itemKey} style={{ marginBottom: "10px" }}>
              {typeof item === "object" ? renderNestedObject(item, itemKey) : <Typography style={{ color: "#777" }}>{formatValue(item)}</Typography>}
            </div>
          )
        }
      })}
    </div>
  )

  /**
   *
   *
   * @param {Object} obj The object to be rendered. This can be an object, array, or primitive value.
   * @param {string} [parentKey=""] The key used as a prefix for identifying nested items.
   * @returns {JSX.Element} A React element that renders the nested object based on its type.
   *
   *
   * @description
   * The function renders a nested object, supporting various data types including arrays and objects.
   * The `parentKey` helps uniquely identify each part of the object for rendering and toggle management.
   */
  const renderNestedObject = (obj, parentKey = "") => {
    if (typeof obj !== "object" || obj === null) {
      const key = parentKey.split(".").pop()
      return (
        <div style={{ display: "flex", alignItems: "center" }}>
          <Typography variant="subtitle1" style={{ fontWeight: "bold", marginRight: "10px", color: "#777" }}>
            {transformKey(key)}:
          </Typography>
          <Tooltip title={formatValue(obj)}>
            <Typography style={{ color: "#777", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "200px" }} data-tip={formatValue(obj)} data-for={key}>
              {formatValue(obj)}
            </Typography>
          </Tooltip>
        </div>
      )
    }

    if (Array.isArray(obj)) {
      return renderArray(obj, parentKey)
    }

    return (
      <div style={{ marginLeft: "20px" }}>
        {Object.entries(obj).map(([key, value]) => {
          const fullKey = parentKey ? `${parentKey}.${key}` : key
          const displayKey = !key || typeof key === "number" ? "Strategies" : transformKey(key)
          if (typeof value !== "object" || value === null) {
            return (
              <div key={fullKey} style={{ display: "flex", alignItems: "center", marginBottom: "10px" }}>
                <MdOutlineInfo style={{ marginRight: "5px" }} />
                <Typography variant="subtitle1" style={{ fontWeight: "bold", marginRight: "10px", color: "#777" }}>
                  {displayKey}:
                </Typography>
                <Tooltip title={formatValue(value)}>
                  <Typography style={{ color: "#777", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "200px" }} data-tip={formatValue(value)} data-for={fullKey}>
                    {formatValue(value)}
                  </Typography>
                </Tooltip>
              </div>
            )
          } else {
            return (
              <div key={fullKey} style={{ marginBottom: "10px" }}>
                <div style={{ display: "flex", alignItems: "center", cursor: "pointer" }} onClick={() => toggleKey(fullKey)}>
                  <MdOutlineInfo style={{ marginRight: "5px" }} />
                  <Typography variant="subtitle1" style={{ fontWeight: "bold", marginRight: "10px", color: "#777" }}>
                    {displayKey}
                  </Typography>
                </div>
                {toggleStates[fullKey] && <div style={{ marginLeft: "20px" }}>{renderNestedObject(value, fullKey)}</div>}
              </div>
            )
          }
        })}
      </div>
    )
  }

  /**
   *
   * @param {Object} columnObj The object where each key-value pair is rendered as a card in a column.
   * @returns {JSX.Element} A React element representing a column of cards, each card displaying a nested object.
   *
   *
   * @description
   * The function renders a column of cards for each entry in a given column object.
   * Uses `toggleKey` to manage the visibility of the nested content when the header is clicked.
   */
  const renderColumn = (columnObj) => (
    <div style={{ flex: 1, margin: "0 10px" }}>
      {Object.entries(columnObj).map(([key, value]) => (
        <Card key={key} style={{ marginBottom: "20px" }}>
          <CardContent>
            <div style={{ display: "flex", alignItems: "center", cursor: "pointer" }} onClick={() => toggleKey(key)}>
              <TbListDetails style={{ marginRight: "5px" }} />
              <Typography variant="subtitle1" style={{ fontWeight: "bold", color: "#555" }}>
                {transformKey(key)}
              </Typography>
            </div>
            {toggleStates[key] && <div style={{ marginLeft: "20px" }}>{renderNestedObject(value, key)}</div>}
          </CardContent>
        </Card>
      ))}
    </div>
  )
  /**
   *
   *
   * @param {Object} obj The object to be processed and rendered. It contains key-value pairs where keys are used to categorize the data.
   * @returns {JSX.Element} A React element representing a specific component or layout based on the `name` prop.
   *
   *
   * @description
   * The function renders different types of components based on the `name` prop.
   */
  const renderObject = (obj) => {
    // For Specific comparison results, render a specific react component
    if (name === "Profiles Metrics Comparison") {
      return <ProfMetricsCurve profileMetrics={obj} type="med3pa" />
    }

    if (name === "Detectron Results Comparison" || name === "General Base Model Evaluation Comparison") {
      return <ComparisonCards data={obj} />
    }

    if (name === "Profiles Metrics And Detectron Comparison") {
      return <ProfMetricsCurve profileMetrics={obj} type="det3pa" />
    }

    if (name === "Global Metrics Comparison") return <GlobalMetricsCurve globalMetrics={obj} />

    if (name === "Configuration Comparison") return <ConfigComparison configData={obj} />

    if (name === "Detectron Rejection Counts Comparison") return <RejectionCountsCurve rejectionData={obj} />

    /* 
    Else display  `div` containing two `Card` components:
      Each `Card` displays content from `renderColumn`, 
      one for each of the categorized objects (`objectsEndingIn1` and `objectsEndingIn2`).
  */
    const objectsEndingIn1 = {}
    const objectsEndingIn2 = {}
    Object.keys(obj).forEach((key) => {
      if (key.endsWith("1")) {
        objectsEndingIn1[key] = obj[key]
      } else if (key.endsWith("2")) {
        objectsEndingIn2[key] = obj[key]
      }
    })
    return (
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <Card style={{ flex: 1, margin: "10px" }}>
          <CardContent>{renderColumn(objectsEndingIn1)}</CardContent>
        </Card>
        <Card style={{ flex: 1, margin: "10px" }}>
          <CardContent>{renderColumn(objectsEndingIn2)}</CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="card-paresults">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Typography variant="h6" style={{ color: "#868686", fontSize: "1.2rem", display: "flex", alignItems: "center" }}>
          {icon}
          {name}
        </Typography>

        <div className="btn btn-link p-0" onClick={() => setMainToggle(!mainToggle)} style={{ cursor: "pointer" }}>
          {mainToggle ? <FaCompress /> : <FaExpand />}
        </div>
      </div>
      <hr style={{ borderColor: "#868686", borderWidth: "0.5px" }} />
      {mainToggle && renderObject(loadedFile)}
    </div>
  )
}

export default ObjectComparison
