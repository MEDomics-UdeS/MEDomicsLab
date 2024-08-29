import React, { useEffect, useRef, useState } from "react"
import ReactECharts from "echarts-for-react"
import { filterUniqueLostProfiles } from "../tabFunctions"
import { MdGroupRemove } from "react-icons/md"
import { Typography } from "@mui/material"

/**
 *
 * @param {Object} lostData The data representing lost profiles.
 * @param {Object} filters An object containing filters with properties:
 *   - {number} dr - The declaration rate threshold.
 *   - {number} maxDepth - The maximum depth for filtering profiles.
 * @param {function} onElementClick - A callback function triggered when an element in the chart is clicked.
 * It receives the clicked element object.
 * @returns {JSX.Element} The LostProfiles component.
 *
 *
 * @description
 * This component renders a scatter interactive and dynamic plot of lost profiles.
 * Profiles are displayed based on their declaration rate and their path's length.
 * Profiles are filtered based on the provided `dr` (declaration rate) and `maxDepth` (maximum depth).
 */
const LostProfiles = ({ lostData, filters, onElementClick }) => {
  // eslint-disable-next-line no-unused-vars
  const [key, setKey] = useState(0)
  const chartRef = useRef(null)
  const { dr, maxDepth } = filters
  const [selectedElement, setSelectedElement] = useState(null)

  /**
   *
   * @param {Object} params  The parameters from the chart click event.
   *
   *
   * @description
   * Handles click events on the chart.
   */
  const onChartClick = (params) => {
    const clickedElement = {
      data: params.data
    }
    if (params.color === "rgba(255, 0, 0, 0.5)") {
      clickedElement.className = "panode-lost-dr"
    } else {
      clickedElement.className = "panode-lost-dr2"
    }

    if (selectedElement && selectedElement.data.id === clickedElement.data.id) {
      setSelectedElement(null) // Deselect if already selected
    } else {
      setSelectedElement(clickedElement)
    }
    onElementClick(clickedElement)
  }

  const onEvents = {
    click: onChartClick
  }

  // Increment key to remount component
  useEffect(() => {
    setKey((prevKey) => prevKey + 1)
  }, []) // Empty dependency array means it runs only once on mount

  // Filter unique points from JSON data
  const uniquePoints = filterUniqueLostProfiles(lostData)

  // Prepare data for ECharts
  const seriesData = Object.entries(uniquePoints).flatMap(([key, items]) =>
    items.map((item) => {
      const declarationRate = parseInt(key, 10)
      const isGreaterThanDR = declarationRate > dr

      // Filter out items exceeding maxDepth
      if (item.path.length > maxDepth) {
        return {
          id: item.id,
          name: item.path.filter((p) => p !== "*").join("\n"), // Use path as tooltip display
          value: [declarationRate, item.id], // Use key for x-axis, id as y-axis
          symbolSize: selectedElement && selectedElement.data.id === item.id ? 30 : 10, // Larger size for selected element
          itemStyle: {
            color: "transparent" // Conditional color based on DR comparison
          }
        }
      }
      return {
        id: item.id,
        name: item.path.filter((p) => p !== "*").join("\n"), // Use path as tooltip display
        value: [declarationRate, item.id], // Use key for x-axis, id as y-axis
        symbolSize: selectedElement && selectedElement.data.id === item.id ? 30 : 10, // Larger size for selected element
        itemStyle: {
          color: isGreaterThanDR ? "rgba(255, 0, 0, 0.5)" : "rgba(138, 138, 138, 0.6)" // Conditional color based on DR comparison
        }
      }
    })
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
      splitLine: {
        show: true
      },
      axisLabel: {
        rich: {
          highlighted: {
            color: "rgba(255, 0, 0, 0.5)",
            fontSize: 12,
            fontWeight: "bold"
          },
          normal: {
            color: "#666",
            fontSize: 12
          }
        },
        formatter: function (value) {
          if (value >= dr) {
            return "{highlighted|" + value + "}"
          }
          return "{normal|" + value + "}"
        }
      },
      axisLine: {
        show: true
      }
    },
    toolbox: {
      feature: {
        saveAsImage: {
          name: "lost_profiles",
          type: "svg",

          backgroundColor: "transparent"
        }
      }
    },
    yAxis: {
      type: "category",
      show: false // Hide y-axis
    },
    grid: {
      top: "20%", // Adjusted top padding
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
    legend: {
      orient: "horizontal",
      type: "scroll",
      left: 0,
      top: 0,

      data: [
        {
          name: "Lost Profiles >= Declaration Rate",
          icon: "circle",
          itemStyle: {
            color: "rgba(255, 0, 0, 0.5)"
          }
        },
        {
          name: "Lost Profiles < Declaration Rate",
          icon: "circle",
          itemStyle: {
            color: "rgba(138, 138, 138, 0.6)"
          }
        }
      ],
      textStyle: {
        color: "#5a5555"
      },

      selectedMode: true
    },
    series: [
      {
        name: "Lost Profiles >= Declaration Rate",
        type: "scatter",
        data: seriesData.filter((item) => item.value[0] >= dr), // Filter data for Lost Profiles >= DR
        symbolSize: 10,
        itemStyle: {
          color: "rgba(255, 0, 0, 0.5)"
        }
      },
      {
        name: "Lost Profiles < Declaration Rate",
        type: "scatter",
        data: seriesData.filter((item) => item.value[0] < dr), // Filter data for Lost Profiles < DR
        symbolSize: 10,
        itemStyle: {
          color: "rgba(138, 138, 138, 0.6)"
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
        <ReactECharts ref={chartRef} option={option} onEvents={onEvents} opts={{ renderer: "svg" }} />
      </div>
    </div>
  )
}

export default LostProfiles
