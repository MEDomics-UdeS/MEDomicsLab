import { Typography } from "@mui/material"
import { BiSearchAlt } from "react-icons/bi"
import React, { useEffect, useState } from "react"
import { Tab, Tabs } from "react-bootstrap"
import { Table } from "react-bootstrap"
import ReactECharts from "echarts-for-react"

import ResultsRejectionCountsCurve from "./detectronComponents/resultsRejectionCountsCurve"

/**
 *
 * @param {Array} detectronResults The array of results from Detectron Experiment.
 * @returns {JSX.Element} The DetectronResults component.
 *
 *
 * @description
 * This component displays the results of the Detectron analysis as tabs,
 *  specifically for covariate shift detection. Each tab displays the results of a Detectron Strategy.
 * It initializes and manages the state for the results,
 *  including rendering pie charts for significance descriptions.
 */
const DetectronResults = ({ detectronResults, rejectionCounts }) => {
  const [initialized, setInitialized] = useState(false) // If the results are set
  const [activeKey, setActiveKey] = useState("0") // Initialize the active tab

  // Initialize the component state based on the detectronResults prop
  useEffect(() => {
    if (detectronResults && detectronResults.length > 0) {
      setInitialized(true)
    }
  }, [detectronResults, rejectionCounts])

  /**
   *
   * @param {Object} significanceDescription An object where keys are significance categories and values are their respective percentages.
   * @returns {Object} Configuration options for the pie chart.
   *
   *
   * @description
   * This function takes the significance description data and maps it to the format required by ECharts.
   * It prepares the data and legend items for the pie chart, assigns colors, and sets up chart options including tooltip and legend.
   */
  const getPieChartOptions = (significanceDescription) => {
    const pieData = []
    const legendData = []
    const colors = ["#7cbf77", "#ffd966", "#ffa05c", "#ff6f69"] // Define colors

    Object.keys(significanceDescription).forEach((key, index) => {
      const value = significanceDescription[key]
      pieData.push({ value: value, name: key })
      legendData.push({ name: key, icon: "circle" }) // Add key to legend data
      // Assign color based on index, looping through colors array
      const colorIndex = index % colors.length
      pieData[index].itemStyle = { color: colors[colorIndex] }
    })

    return {
      title: {
        text: "Chart Pie Representing Shift Significance",
        left: "center", // Center the title
        top: 0 // Position title at the top
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
          center: ["50%", "55%"],
          selectedMode: "single",
          data: pieData.map((item) => ({
            value: item.value.toFixed(2), // Limit to two decimal places
            name: item.name,
            itemStyle: item.itemStyle,
            label: {
              fontSize: 16 // Adjust the font size here
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
  // Render no results message if detectronResults is empty
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
      <Tabs activeKey={activeKey} onSelect={(k) => setActiveKey(k)} id="strategy-tabs" className="mb-3">
        {detectronResults.map((result, index) => (
          <Tab key={index} eventKey={index.toString()} title={result.Strategy}>
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
                      ) : activeKey === index.toString() ? (
                        <tr key={key}>
                          <td colSpan="2">
                            <ReactECharts option={getPieChartOptions(value)} style={{ height: "300px", width: "100%" }} />
                          </td>
                        </tr>
                      ) : null
                    ) : null
                  )}
                </tbody>
              </Table>
            </div>
          </Tab>
        ))}
      </Tabs>
      {/* Plot The rejection counts curve*/}
      {rejectionCounts && <ResultsRejectionCountsCurve rejectionData={rejectionCounts} />}
    </div>
  )
}

export default DetectronResults
