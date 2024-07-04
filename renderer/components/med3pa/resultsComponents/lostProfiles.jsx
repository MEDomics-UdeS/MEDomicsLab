import React, { useEffect, useRef, useState } from "react"
import ReactECharts from "echarts-for-react"
import { filterUniqueLostProfiles } from "../resultTabs/tabFunctions"
import { MdGroupRemove } from "react-icons/md"
import { Typography } from "@mui/material"

const ChartComponent = ({ lostData }) => {
  const [key, setKey] = useState(0) // State to manage the key for remounting
  const chartRef = useRef(null)

  useEffect(() => {
    // Function to handle reinitialization
    const initializeChart = () => {
      if (!lostData || !chartRef.current) return

      // Filter unique points from JSON data
      const uniquePoints = filterUniqueLostProfiles(lostData)

      // Prepare data for ECharts
      const seriesData = Object.entries(uniquePoints).flatMap(([key, items]) =>
        items.map((item) => ({
          id: item.id,
          name: item.path.filter((p) => p !== "*").join("\n"), // Use path as tooltip display
          value: [parseInt(key, 10), item.id] // Use key for x-axis, id as y-axis
        }))
      )

      // ECharts option configuration
      const option = {
        xAxis: {
          type: "value",
          name: "Declaration Rate",
          nameLocation: "middle",
          nameGap: 25, // Gap between x-axis name and axis line
          min: 10,
          max: 100,
          scale: true,
          axisLine: {
            show: true
          }
        },
        toolbox: {
          feature: {
            saveAsImage: {}
          }
        },
        yAxis: {
          type: "category",
          show: false // Hide y-axis
        },
        grid: {
          top: "10%", // Adjusted top padding
          bottom: "10%", // Adjusted bottom padding
          left: "5%", // Adjusted left padding
          right: "5%", // Adjusted right padding
          containLabel: true
        },
        tooltip: {
          trigger: "item",
          formatter: function (params) {
            return `ID: ${params.data.value[1]}<br/>Path:<br/>${params.data.name.replace(/\n/g, "<br/>")}`
          }
        },
        series: [
          {
            type: "scatter",
            data: seriesData,
            symbolSize: 10, // Example symbol size
            itemStyle: {
              color: "rgba(75, 192, 192, 0.8)" // Example color
            }
          }
        ]
      }

      // Set option to chart component
      if (chartRef.current) {
        chartRef.current.getEchartsInstance().setOption(option)
      }
    }

    initializeChart() // Call the initialization function

    // Clean up function
    return () => {
      if (chartRef.current) {
        chartRef.current.getEchartsInstance().dispose() // Dispose the chart instance
      }
    }
  }, [lostData, key]) // Add key to dependencies

  useEffect(() => {
    // Increment key to remount component
    setKey((prevKey) => prevKey + 1)
  }, []) // Empty dependency array means it runs only once on mount

  return (
    <div className="card-paresults p-3" style={{ width: "100%", height: "100%" }}>
      <Typography
        variant="h6"
        style={{
          color: "#868686",
          fontSize: "1.2rem",
          display: "flex",
          alignItems: "center",
          marginBottom: "0.5rem"
        }}
      >
        <MdGroupRemove style={{ marginRight: "0.5rem", fontSize: "1.4rem" }} />
        Lost Profiles
      </Typography>
      <hr style={{ borderColor: "#868686", borderWidth: "0.5px", width: "100%" }} />

      <ReactECharts ref={chartRef} option={{}} style={{ width: "100%" }} />
    </div>
  )
}

export default ChartComponent
