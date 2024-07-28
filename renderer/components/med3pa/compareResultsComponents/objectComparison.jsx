import React, { useEffect, useState } from "react"
import { CardContent, Typography } from "@mui/material"
import { getIconAndNameByType, transformKey } from "./objSettings"
import { Card } from "react-bootstrap"
import { MdOutlineInfo } from "react-icons/md"
import { FaCompress, FaExpand } from "react-icons/fa"
import { TbListDetails } from "react-icons/tb"
import GlobalMetricsCurve from "./globMetricsCurve"
import ProfMetricsCurve from "./profMetricsCurve"
import { formatValue } from "../resultTabs/tabFunctions"
import Tooltip from "@mui/material/Tooltip"
const ObjectComparison = ({ loadedFile, type }) => {
  const { icon, name } = getIconAndNameByType(type)

  useEffect(() => {
    if (loadedFile && Object.keys(loadedFile).length > 0) {
      console.log("LOADED FILE INFO:", loadedFile)
    } else {
      console.log("No loaded file found ")
    }
  }, [loadedFile])

  const [toggleStates, setToggleStates] = useState({})
  const [mainToggle, setMainToggle] = useState(true) // State for the main content toggle

  const toggleKey = (key) => {
    setToggleStates((prevState) => ({
      ...prevState,
      [key]: !prevState[key]
    }))
  }

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

  const renderObject = (obj) => {
    const objectsEndingIn1 = {}
    const objectsEndingIn2 = {}
    Object.keys(obj).forEach((key) => {
      if (key.endsWith("1")) {
        objectsEndingIn1[key] = obj[key]
      } else if (key.endsWith("2")) {
        objectsEndingIn2[key] = obj[key]
      }
    })
    if (name === "Profiles Metrics Comparison") return <ProfMetricsCurve profileMetrics={obj} />

    if (name === "Global Metrics Comparison") return <GlobalMetricsCurve globalMetrics={obj} />

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
