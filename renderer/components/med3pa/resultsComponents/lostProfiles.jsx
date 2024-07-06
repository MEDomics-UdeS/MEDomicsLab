import React, { useEffect, useRef, useState } from "react"
import ReactECharts from "echarts-for-react"
import { filterUniqueLostProfiles } from "../resultTabs/tabFunctions"
import { MdGroupRemove } from "react-icons/md"
import { Typography } from "@mui/material"

const LostProfiles = ({ lostData, onElementClick }) => {
  // eslint-disable-next-line no-unused-vars
  const [key, setKey] = useState(0)
  const chartRef = useRef(null)
  const [selectedElement, setSelectedElement] = useState(null)

  const onChartClick = (params) => {
    const clickedElement = params.data
    if (selectedElement && selectedElement.id === clickedElement.id) {
      // Deselect if already selected
      setSelectedElement(null)
    } else {
      setSelectedElement(clickedElement)
    }
    onElementClick(clickedElement)
  }

  const onEvents = {
    click: onChartClick
  }

  useEffect(() => {
    // Increment key to remount component
    setKey((prevKey) => prevKey + 1)
  }, []) // Empty dependency array means it runs only once on mount

  // Filter unique points from JSON data
  const uniquePoints = filterUniqueLostProfiles(lostData)

  // Prepare data for ECharts
  const seriesData = Object.entries(uniquePoints).flatMap(([key, items]) =>
    items.map((item) => ({
      id: item.id,
      name: item.path.filter((p) => p !== "*").join("\n"), // Use path as tooltip display
      value: [parseInt(key, 10), item.id], // Use key for x-axis, id as y-axis
      symbolSize: selectedElement && selectedElement.id === item.id ? 30 : 10, // Larger size for selected element
      itemStyle: {
        color:
          selectedElement && selectedElement.id === item.id
            ? "rgb(168, 207, 255)" // Different color for selected element
            : "rgba(138, 138, 138, 0.6)" // Light blue with reduced opacity for others
      }
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
        return `ID: ${params.data.value[1]}<br/>DR: ${params.data.value[0]}<br/>Path:<br/>${params.data.name.replace(/\n/g, "<br/>")}`
      }
    },
    series: [
      {
        type: "scatter",
        data: seriesData,
        symbolSize: 10, // Example symbol size
        itemStyle: {
          color: "rgba(178, 211, 248, 0.8)" // Example color
        }
      }
    ]
  }

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
      <div style={{ width: "100%", height: "100%" }}>
        <ReactECharts ref={chartRef} option={option} onEvents={onEvents} />
      </div>
    </div>
  )
}
export default LostProfiles
