import { Typography } from "@mui/material"
import React, { useState, useEffect } from "react"
import ReactECharts from "echarts-for-react"
import { TbChartDots2 } from "react-icons/tb"
import { AiOutlineFullscreen, AiOutlineFullscreenExit } from "react-icons/ai"

/**
 *
 * @param {Object} curveData Data used to generate the curve chart.
 * @param {number} clickedLostElement The declaration rate of the clicked element.
 * @param {function} onFullScreenClicked Function to toggle fullscreen mode.
 * @param {boolean} fullscreenCurve Boolean indicating whether the curve is in fullscreen mode.
 * @returns {JSX.Element} The MDRCurve component.
 *
 *
 * @description
 * MDRCurve component renders a curve chart based on provided curve data.
 * It allows toggling between fullscreen and normal view
 */
const MDRCurve = ({ curveData, clickedLostElement, onFullScreenClicked, fullscreenCurve }) => {
  const [options, setOptions] = useState(null)

  /**
   * Update the chart options whenever `curveData` or `clickedLostElement` changes.
   * Process `curveData` to filter out invalid entries and generates the options for the chart.
   * Reset options to null if `curveData` is not provided.
   */
  useEffect(() => {
    if (!curveData) {
      setOptions(null) // Reset options if curveData is null or undefined
      return
    }

    // Filter out entries where metrics are null or undefined
    const filteredCurveData = Object.keys(curveData)
      .filter((key) => curveData[key].metrics !== null && curveData[key].metrics !== undefined)
      .reduce((obj, key) => {
        obj[key] = curveData[key]
        return obj
      }, {})

    const metricNames = Object.keys(filteredCurveData[Object.keys(filteredCurveData)[0]].metrics)

    const series = metricNames.map((metric) => ({
      name: metric,
      type: "line",
      symbolSize: (value, params) => {
        const declarationRate = params.data[0]
        return declarationRate === clickedLostElement ? 15 : 5 // Larger size for clickedLostElement
      },
      data: Object.keys(filteredCurveData).map((key) => {
        const declarationRate = parseInt(key, 10) // Assuming key is the declarationRate
        return {
          value: [declarationRate, filteredCurveData[key].metrics[metric]],
          itemStyle: {
            color: declarationRate === clickedLostElement ? "#f00" : null, // Red for clickedLostElement
            opacity: declarationRate === clickedLostElement ? 1 : 0 // Full opacity for clickedLostElement, reduced for others
          }
        }
      })
    }))

    const newOptions = {
      title: {
        show: false
      },
      grid: {
        left: "5%",
        right: "5%",
        bottom: "10%",
        padding: "5%",
        containLabel: true
      },
      toolbox: {
        feature: {
          saveAsImage: {
            // type: "svg",
            backgroundColor: "transparent"
          }
        }
      },
      tooltip: {
        trigger: "axis"
      },
      legend: {
        orient: "horizontal",
        type: "scroll",

        width: "80%"
      },
      xAxis: {
        type: "value",
        name: "Declaration Rate",
        nameLocation: "middle",
        nameGap: 25,
        data: Object.keys(filteredCurveData).map((key) => parseInt(key, 10))
      },
      yAxis: {
        type: "value",
        name: "Metrics"
      },
      series: series
    }

    setOptions(newOptions)
  }, [curveData, clickedLostElement])

  /**
   *
   *
   * @description
   * This function switches the state of `fullscreenCurve` between `true` and `false`
   */
  const toggleFullscreen = () => {
    onFullScreenClicked(!fullscreenCurve) // Toggle fullscreen state in the parent component
  }

  /**
   * Update the chart options to remove styling from series data
   * if `clickedLostElement` is null. Reset the color and opacity of all data points.
   */
  useEffect(() => {
    if (!options) return // Do nothing if options are null

    // Remove styling if selectedLostId[0] and selectedLostId[1] are equal
    if (clickedLostElement === null) {
      const updatedSeries = options.series.map((serie) => ({
        ...serie,
        data: serie.data.map((item) => ({
          ...item,
          itemStyle: {
            ...item.itemStyle,
            color: null,
            opacity: 1
          }
        }))
      }))

      const updatedOptions = {
        ...options,
        series: updatedSeries
      }

      setOptions(updatedOptions)
    }
  }, [clickedLostElement])

  if (!options) return <div>Loading...</div> // Render loading state while options are null

  return (
    <div className="card-paresults p-3" style={{ display: "flex", flexDirection: "column", height: "100%", alignItems: "flex-start" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
        <Typography
          variant="h6"
          style={{
            color: "#868686",
            fontSize: "1.2rem",
            display: "flex",
            alignItems: "center"
          }}
        >
          <TbChartDots2 style={{ marginRight: "0.5rem", fontSize: "1.4rem" }} />
          Metrics By Declaration Rate Curve
        </Typography>
        {fullscreenCurve !== null && (
          <>
            {fullscreenCurve ? (
              <AiOutlineFullscreenExit onClick={toggleFullscreen} style={{ cursor: "pointer", color: "#868686", fontSize: "1.6rem" }} />
            ) : (
              <AiOutlineFullscreen onClick={toggleFullscreen} style={{ cursor: "pointer", color: "#868686", fontSize: "1.6rem" }} />
            )}
          </>
        )}
      </div>
      <hr style={{ borderColor: "#868686", borderWidth: "0.5px", width: "100%" }} />
      <div style={{ width: "100%", height: "100%" }}>
        <ReactECharts key={JSON.stringify(options)} option={options} />
      </div>
    </div>
  )
}

export default MDRCurve
