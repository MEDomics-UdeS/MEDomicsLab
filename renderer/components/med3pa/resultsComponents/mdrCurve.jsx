import { Typography } from "@mui/material"
import React from "react"
import ReactECharts from "echarts-for-react"
import { TbChartDots2 } from "react-icons/tb"

const MDRCurve = ({ metricsByDrFile }) => {
  // Transform JSON data into an array suitable for echarts
  if (!metricsByDrFile) return <div>Loading...</div>
  const transformedData = Object.keys(metricsByDrFile).map((key) => {
    return {
      declarationRate: parseInt(key, 10),
      ...metricsByDrFile[key].metrics
    }
  })

  // Extract metric names for series generation
  const metricNames = Object.keys(transformedData[0]).filter((key) => key !== "declarationRate")

  // Generate series data for echarts
  const series = metricNames.map((metric) => ({
    name: metric,
    type: "line",
    data: transformedData.map((item) => [item.declarationRate, item[metric]])
  }))

  const options = {
    title: {
      text: "Metrics by Declaration Rates Curves",
      left: "center",
      bottom: "0%",
      textStyle: {
        color: "#868686",
        fontSize: 16
      }
    },
    grid: {
      left: "5%",
      right: "5%",
      bottom: "10%",
      containLabel: true
    },
    toolbox: {
      feature: {
        saveAsImage: {}
      }
    },
    tooltip: {
      trigger: "axis"
    },
    legend: {
      data: metricNames
    },
    xAxis: {
      type: "value",
      name: "Declaration Rate",
      nameLocation: "middle",
      data: transformedData.map((item) => item.declarationRate)
    },
    yAxis: {
      type: "value",
      name: "Metrics"
    },

    series: series
  }
  return (
    <div className="card-paresults p-3" style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
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
      <div style={{ marginTop: 20, flex: 1, width: "100%" }}>
        <ReactECharts option={options} style={{ height: "100%", width: "100%" }} />
      </div>
    </div>
  )
}

export default MDRCurve
