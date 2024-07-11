import { Typography } from "@mui/material"
import React, { useState, useEffect } from "react"
import ReactECharts from "echarts-for-react"
import { TbChartDots2 } from "react-icons/tb"

const MDRCurve = ({ curveData, clickedLostElement }) => {
  const [options, setOptions] = useState(null)

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
            type: "svg",
            backgroundColor: "transparent"
          }
        }
      },
      tooltip: {
        trigger: "axis"
      },
      legend: {
        data: metricNames,
        type: "scroll"
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
      <hr style={{ borderColor: "#868686", borderWidth: "0.5px", width: "100%" }} />
      <div style={{ width: "100%", height: "100%" }}>
        <ReactECharts key={JSON.stringify(options)} option={options} />
      </div>
    </div>
  )
}

export default MDRCurve
