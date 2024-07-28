import React, { useEffect, useState } from "react"

import FlInput from "../paInput"
import GlobalMetricsCurve from "./globMetricsCurve"
import { Slider, Typography } from "@mui/material"
import { Card } from "react-bootstrap"

/**
 *
 * @param {Object} profileMetrics Data used to generate the curve chart.
 * @returns {JSX.Element} The ProfMetricsCurve component.
 *
 *
 * @description
 * ProfMetricsCurve component renders a curve chart based on provided curve data.
 */
const ProfMetricsCurve = ({ profileMetrics }) => {
  const [minSamplesRatio, setMinSamplesRatio] = useState(0) // Store Min Samples Ratio state
  const [profile, setProfile] = useState("*") // Store Profile State
  const [profiles, setProfiles] = useState([]) // Store the available Profiles at a specific Min Samples Ratio
  const [filteredProMetrics, setFilteredProMetrics] = useState() // Store Filtered Data
  const [maxMinSRatio, setMaxMinSRatio] = useState(50) // Maximum Minimum Samples Ratio Slider Value

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
    const topKeys = Object.keys(profileMetrics).map((key) => parseInt(key))
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
    const selectedData = profileMetrics[minSamplesRatio] || {}
    return Object.keys(selectedData)
  }

  // Set initial value of maxMinSRatio and profiles when initial data  `profileMetrics` is loaded
  useEffect(() => {
    setMaxMinSRatio(getMaxSamplesRatio())
    setProfiles(getProfileChoices())
  }, [profileMetrics])

  // Update filteredProMetrics when profile or minSamplesRatio change
  useEffect(() => {
    setFilteredProMetrics(profileMetrics[minSamplesRatio][profile])
  }, [minSamplesRatio, profile])

  return (
    <>
      {filteredProMetrics !== undefined && (
        <Card style={{ padding: "20px", marginBottom: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
            <div style={{ flexGrow: 1, width: "50%" }}>
              <Typography className="default-text-color-paresults">Min Node Percentage</Typography>
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
      )}
      <Card style={{ padding: "20px" }}>
        <GlobalMetricsCurve globalMetrics={filteredProMetrics} />
      </Card>
    </>
  )
}

export default ProfMetricsCurve
