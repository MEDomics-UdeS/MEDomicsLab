import React, { useEffect, useState } from "react"

import FlInput from "../paInput"
import GlobalMetricsCurve from "./globMetricsCurve"
import { Slider, Tooltip, Typography } from "@mui/material"
import { Card, Col, Container, Row } from "react-bootstrap"
import { MdExpandMore, MdOutlineInfo } from "react-icons/md"
import { formatValue } from "../resultTabs/tabFunctions"
import { BiSearchAlt } from "react-icons/bi"
import { transformKey } from "./objSettings"

/**
 *
 * @param {Object} profileMetrics Data used to generate the curve chart.
 * @returns {JSX.Element} The ProfMetricsCurve component.
 *
 *
 * @description
 * ProfMetricsCurve component renders a curve chart based on provided curve data and the type of the exepriment.
 */
const ProfMetricsCurve = ({ profileMetrics, type }) => {
  const [minSamplesRatio, setMinSamplesRatio] = useState(0) // Store Min Samples Ratio state
  const [profile, setProfile] = useState("*") // Store Profile State
  const [profiles, setProfiles] = useState([]) // Store the available Profiles at a specific Min Samples Ratio
  const [filteredProMetrics, setFilteredProMetrics] = useState() // Store Filtered Data
  const [maxMinSRatio, setMaxMinSRatio] = useState(50) // Maximum Minimum Samples Ratio Slider Value
  const [profMetrics, setProfMetrics] = useState() // Store profile metrics state based on the type
  const [detectronProfile, setDetectronProfile] = useState({}) // Store DET3PA Information
  const [toggleStates, setToggleStates] = useState({}) // Toggle Object

  /**
   *
   * @param {Object} value The Updated Value (Input)
   *
   *
   * @description
   * This function is used to update the minSamplesRatio variable
   */
  const handleSliderChange = (value) => {
    setMinSamplesRatio(value)
  }

  /**
   *
   * @param {Object} value The Updated Value (Input)
   *
   *
   * @description
   * This function is used to update the Profile variable
   */
  const handleProfileChange = (value) => {
    setProfile(value.value)
  }

  /**
   *
   * @returns {number} The maximum value of the Minimum Samples Ratio
   *
   *
   * @description
   * This function is used to find the maximum of the minSamplesRatio
   */
  const getMaxSamplesRatio = () => {
    const topKeys = Object.keys(profMetrics).map((key) => parseInt(key))
    return Math.max(...topKeys)
  }

  /**
   *
   * @returns {Object} Profiles list at a specific Minimum Samples Ratio
   *
   *
   * @description
   * This function is used to extract the list of present profiles at a specific MinSamplesRatio value
   */
  const getProfileChoices = () => {
    const selectedData = profMetrics[minSamplesRatio] || {}
    return Object.keys(selectedData)
  }

  // Set initial value of maxMinSRatio and profMetrics when initial data  `profileMetrics` is loaded
  useEffect(() => {
    if (!profileMetrics) return
    if (type === "med3pa") {
      setProfMetrics(profileMetrics)
    }
    if (type === "det3pa") {
      setProfMetrics(profileMetrics.profiles_metrics_comparaison)
    }
  }, [profileMetrics, type])

  /* 
  Set initial state of profiles AND 
  detectron profile results if it's a DET3pa experiment when `profMetrics` is set
  */
  useEffect(() => {
    if (!profMetrics) return
    setMaxMinSRatio(getMaxSamplesRatio())
    setProfiles(getProfileChoices())
    if (type === "det3pa") {
      setDetectronProfile(profileMetrics.profiles_detectron_comparaison[profile])
    }
    setFilteredProMetrics(profMetrics[minSamplesRatio][profile])
  }, [profMetrics])

  // Update filteredProMetrics when profile or minSamplesRatio change
  useEffect(() => {
    if (!profMetrics) return
    if (type === "det3pa") {
      setDetectronProfile(profileMetrics.profiles_detectron_comparaison[profile])
    }

    setFilteredProMetrics(profMetrics[minSamplesRatio][profile])
  }, [minSamplesRatio, profile, profMetrics])

  /**
   *
   * @param {Object|Array} obj  The object or array of objects to render. If it's an array, each item should be an object containing a "Strategy" key.
   * @param {string} [parentKey=""] The parent key used for nested objects to create a unique identifier. Defaults to an empty string for top-level objects.
   * @param {Object} toggleStates The state object managing which sections are expanded or collapsed.
   * @param {Function} setToggleStates Function to update the `toggleStates` state.
   * @returns {JSX.Element | null} Returns a `JSX.Element` for rendering nested objects or `null` if the object is neither an array nor a valid object.
   *
   *
   * @description
   * The function renders a nested object as a collapsible structure,
   * supporting both array of objects with a "Strategy" key and general objects.
   */
  const renderNestedObject = (obj, parentKey = "", toggleStates, setToggleStates) => {
    const toggleKey = (key) => {
      setToggleStates((prev) => ({ ...prev, [key]: !prev[key] }))
    }

    // Handle array of objects with "Strategy" key
    if (Array.isArray(obj) && obj.every((item) => typeof item === "object" && item !== null && "Strategy" in item)) {
      return (
        <div style={{ marginLeft: "20px" }}>
          {obj.map((item, index) => (
            <div key={index} style={{ marginBottom: "10px" }}>
              <div style={{ display: "flex", alignItems: "center", cursor: "pointer" }} onClick={() => toggleKey(item.Strategy)}>
                <MdOutlineInfo style={{ marginRight: "5px" }} />
                <Typography variant="subtitle1" style={{ fontWeight: "bold", marginRight: "10px", color: "#777" }}>
                  {item.Strategy}
                </Typography>
                <MdExpandMore style={{ marginLeft: "10px", transform: toggleStates[item.Strategy] ? "rotate(180deg)" : "rotate(0deg)" }} />
              </div>
              {toggleStates[item.Strategy] && (
                <div style={{ marginLeft: "20px" }}>
                  {Object.entries(item).map(([key, value]) => {
                    if (key === "Strategy") return null // Skip Strategy key itself
                    const fullKey = `${item.Strategy}.${key}`
                    if (typeof value === "object" && value !== null) {
                      return (
                        <div key={fullKey}>
                          <div style={{ display: "flex", alignItems: "center", cursor: "pointer" }} onClick={() => toggleKey(fullKey)}>
                            <MdOutlineInfo style={{ marginRight: "5px" }} />
                            <Typography variant="subtitle1" style={{ fontWeight: "bold", marginRight: "10px", color: "#777" }}>
                              {transformKey(key)}
                            </Typography>
                            <MdExpandMore style={{ marginLeft: "10px", transform: toggleStates[fullKey] ? "rotate(180deg)" : "rotate(0deg)" }} />
                          </div>
                          {toggleStates[fullKey] && <div style={{ marginLeft: "20px" }}>{renderNestedObject(value, fullKey, toggleStates, setToggleStates)}</div>}
                        </div>
                      )
                    } else {
                      return (
                        <div key={fullKey} style={{ display: "flex", alignItems: "center", marginBottom: "10px" }}>
                          <Typography variant="subtitle1" style={{ fontWeight: "bold", marginRight: "10px", color: "#777" }}>
                            {transformKey(key)}:
                          </Typography>
                          <Tooltip title={formatValue(value)}>
                            <Typography style={{ color: "#777", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "200px" }}>{formatValue(value)}</Typography>
                          </Tooltip>
                        </div>
                      )
                    }
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      )
    }

    // Handle general case
    if (typeof obj === "object" && obj !== null) {
      return (
        <div style={{ marginLeft: "20px" }}>
          {Object.entries(obj).map(([key, value]) => {
            const fullKey = parentKey ? `${parentKey}.${key}` : key
            if (typeof value === "object" && value !== null) {
              return (
                <div key={fullKey}>
                  <div style={{ display: "flex", alignItems: "center", cursor: "pointer" }} onClick={() => toggleKey(fullKey)}>
                    <MdOutlineInfo style={{ marginRight: "5px" }} />
                    <Typography variant="subtitle1" style={{ fontWeight: "bold", marginRight: "10px", color: "#777" }}>
                      {transformKey(key)}
                    </Typography>
                    <MdExpandMore style={{ marginLeft: "10px", transform: toggleStates[fullKey] ? "rotate(180deg)" : "rotate(0deg)" }} />
                  </div>
                  {toggleStates[fullKey] && <div style={{ marginLeft: "20px" }}>{renderNestedObject(value, fullKey, toggleStates, setToggleStates)}</div>}
                </div>
              )
            } else {
              return (
                <div key={fullKey} style={{ display: "flex", alignItems: "center", marginBottom: "10px" }}>
                  <Typography variant="subtitle1" style={{ fontWeight: "bold", marginRight: "10px", color: "#777" }}>
                    {transformKey(key)}:
                  </Typography>
                  <Tooltip title={formatValue(value)}>
                    <Typography style={{ color: "#777", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "200px" }}>{formatValue(value)}</Typography>
                  </Tooltip>
                </div>
              )
            }
          })}
        </div>
      )
    }

    return null
  }

  /**
   *
   * @returns {JSX.Element[] | null} An array of `Card` components, or `null` if the conditions are not met.
   *
   *
   * @description
   * This function renders a list of `Card` components for each entry in the `detectronProfile` object.
   *
   */
  const renderDetectronCards = () => {
    if (type !== "det3pa" || !detectronProfile) return null

    return Object.entries(detectronProfile).map(([key, value]) => (
      <Card key={key} style={{ padding: "20px", marginBottom: "20px" }}>
        <Typography variant="h6" style={{ marginBottom: "10px", color: "#555" }}>
          <BiSearchAlt style={{ marginRight: "0.5rem", fontSize: "1.6rem" }} />
          {transformKey(key)}
          <hr style={{ borderColor: "#868686", borderWidth: "0.5px", width: "100%" }} />
        </Typography>

        {renderNestedObject(value, key, toggleStates, setToggleStates)}
      </Card>
    ))
  }

  return (
    <>
      {filteredProMetrics !== undefined && (
        <Container fluid style={{ padding: "0 15px" }}>
          <Row>
            <Col md={12}>
              <Card style={{ padding: "20px", marginBottom: "20px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
                  <div style={{ flexGrow: 1, width: "50%" }}>
                    <Typography className="default-text-color-paresults">Min Population Percentage</Typography>
                    <Slider
                      value={minSamplesRatio}
                      onChange={(e, value) => handleSliderChange(value)}
                      aria-labelledby="min-samples-ratio-slider"
                      sx={{ color: "#F1E7D7" }}
                      valueLabelDisplay="auto"
                      min={0}
                      max={maxMinSRatio}
                      step={5}
                    />
                  </div>
                  <div style={{ flexGrow: 1, width: "50%" }}>
                    <FlInput
                      key={"profil"}
                      name={"Profile"}
                      settingInfos={{
                        type: "list",
                        tooltip: "<p>Choose the Profile</p>",
                        choices: profiles?.map((metric) => ({ name: metric }))
                      }}
                      currentValue={profile}
                      onInputChange={(value) => handleProfileChange(value)}
                    />
                  </div>
                </div>
              </Card>
            </Col>
            {type === "det3pa" && (
              <>
                <Col md={6}>
                  <Card style={{ padding: "20px", height: "100%" }}>
                    <GlobalMetricsCurve globalMetrics={filteredProMetrics} />
                  </Card>
                </Col>
                <Col md={6}>
                  <Card style={{ padding: "20px", height: "100%" }}>{renderDetectronCards()}</Card>
                </Col>
              </>
            )}
            {type !== "det3pa" && (
              <Col md={12}>
                <Card style={{ padding: "20px" }}>
                  <GlobalMetricsCurve globalMetrics={filteredProMetrics} />
                </Card>
              </Col>
            )}
          </Row>
        </Container>
      )}
    </>
  )
}

export default ProfMetricsCurve
