import { Typography } from "@mui/material"
import { BiSearchAlt } from "react-icons/bi"
import React, { useEffect, useState, useRef } from "react"
import { Tab, Tabs } from "react-bootstrap"
import { Table } from "react-bootstrap"
import echarts from "echarts/lib/echarts" // Import ECharts
import "echarts/lib/chart/pie" // Import pie chart
import "echarts/lib/component/tooltip" // Import tooltip component
import "echarts/lib/component/title" // Import title component
import "echarts/lib/component/legend" // Import legend component

const DetectronResults = ({ detectronResults }) => {
  const [initialized, setInitialized] = useState(false)
  const chartRef = useRef(null) // Reference for the chart DOM element

  useEffect(() => {
    if (detectronResults && detectronResults.length > 0) {
      setInitialized(true)
    }
  }, [detectronResults])

  useEffect(() => {
    if (initialized) {
      initializeCharts()
    }
  }, [initialized])

  const initializeCharts = () => {
    const chartDom = chartRef.current // Access the DOM element using the ref
    if (!chartDom) return // Ensure the chart DOM element exists

    const myChart = echarts.init(chartDom) // Initialize ECharts instance

    // Prepare data for pie chart
    const pieData = []
    const legendData = []
    if (detectronResults && detectronResults.length > 0) {
      const significanceDescription = detectronResults[0].significance_description
      Object.keys(significanceDescription).forEach((key) => {
        const value = significanceDescription[key]
        pieData.push({ value: value, name: key })
        legendData.push(key) // Add key to legend data
      })
    }

    // Set options for pie chart
    const option = {
      title: {
        text: "Chart Pie Representing Shift Probability",
        left: "center", // Center the title
        top: "top" // Position title at the top
      },
      tooltip: {
        trigger: "item",
        formatter: "{b}: {c}%"
      },
      legend: {
        type: "scroll",
        orient: "horizontal",

        bottom: 0,

        data: legendData
      },
      series: [
        {
          type: "pie",
          radius: "65%",
          center: ["50%", "50%"],
          selectedMode: "single",
          data: pieData.map((item) => ({
            value: item.value.toFixed(2), // Limit to two decimal places
            name: item.name,
            label: {
              borderWidth: 1,
              borderRadius: 4
            }
          })),
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: "rgba(0, 0, 0, 0.5)"
            }
          }
        }
      ]
    }

    // Set chart options and render
    myChart.setOption(option)
  }

  if (!initialized) {
    return (
      <div className="card-paresults p-3">
        <Typography
          variant="h6"
          style={{
            color: "#868686",
            fontSize: "1.2rem",
            display: "flex",
            alignItems: "center"
          }}
        >
          <BiSearchAlt style={{ marginRight: "0.5rem", fontSize: "1.6rem" }} /> Covariate Shift Detection
        </Typography>
        <hr
          style={{
            borderColor: "#868686",
            borderWidth: "0.5px",
            flex: "1",
            marginLeft: "0.5rem"
          }}
        />
        <div className="default-text-color-paresults">Loading...</div>
      </div>
    )
  }

  if (!detectronResults || detectronResults.length === 0) {
    return (
      <div className="card-paresults p-3">
        <Typography
          variant="h6"
          style={{
            color: "#868686",
            fontSize: "1.2rem",
            display: "flex",
            alignItems: "center"
          }}
        >
          <BiSearchAlt style={{ marginRight: "0.5rem", fontSize: "1.6rem" }} /> Covariate Shift Detection
        </Typography>
        <hr
          style={{
            borderColor: "#868686",
            borderWidth: "0.5px",
            flex: "1",
            marginLeft: "0.5rem"
          }}
        />
        <div className="default-text-color-paresults">No results were found. You haven't Executed Detectron</div>
      </div>
    )
  }

  return (
    <div className="card-paresults p-3">
      <Typography
        variant="h6"
        style={{
          color: "#868686",
          fontSize: "1.2rem",
          display: "flex",
          alignItems: "center"
        }}
      >
        <BiSearchAlt style={{ marginRight: "0.5rem", fontSize: "1.6rem" }} /> Covariate Shift Detection
      </Typography>
      <hr
        style={{
          borderColor: "#868686",
          borderWidth: "0.5px",
          flex: "1",
          marginLeft: "0.5rem"
        }}
      />

      {/* Render the Tabs component and map through detectronResults */}
      <Tabs defaultActiveKey="0" id="strategy-tabs" className="mb-3">
        {detectronResults.map((result, index) => (
          <Tab key={index} eventKey={index} title={result.Strategy}>
            <div style={{ marginTop: "1rem" }}>
              <Table bordered hover>
                <tbody>
                  {Object.entries(result).map(([key, value]) =>
                    key !== "Strategy" ? (
                      key !== "significance_description" ? (
                        <tr key={key}>
                          <th>{key}</th>
                          <td>
                            {typeof value === "number"
                              ? key.endsWith("%")
                                ? `${value.toFixed(2)}%`
                                : value.toFixed(2) // Limit to two decimal places
                              : value}
                          </td>
                        </tr>
                      ) : (
                        <tr key={key}>
                          <td colSpan="2">
                            <div ref={chartRef} style={{ height: "300px", width: "100%" }} />
                          </td>
                        </tr>
                      )
                    ) : null
                  )}
                </tbody>
              </Table>
            </div>
          </Tab>
        ))}
      </Tabs>
    </div>
  )
}

export default DetectronResults
