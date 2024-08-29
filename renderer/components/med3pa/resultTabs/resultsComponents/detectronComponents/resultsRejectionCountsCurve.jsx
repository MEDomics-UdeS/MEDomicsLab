import React, { useEffect, useState } from "react"
import ReactECharts from "echarts-for-react"
/**
 *
 * @param {Object} rejectionData Data used to generate the curve chart.
 * @returns {JSX.Element} The RejectionCountsCurve component.
 *
 *
 * @description
 * ResultsRejectionCountsCurve component renders a curve chart based on provided curve data.
 * It is specific to displaying the results (Detectron Experiment)
 */
const ResultsRejectionCountsCurve = ({ rejectionData }) => {
  const [options, setOptions] = useState({})

  // Initialize and plot the curve
  useEffect(() => {
    // Ensure rejectionData has both 'reference' and 'test' arrays
    if (!rejectionData || !rejectionData.reference || !rejectionData.test) return

    const xAxisData = Array.from({ length: rejectionData.reference.length }, (_, i) => i + 1)

    // Helper function to create series data for the chart
    const getSeries = (type) => ({
      name: type,
      type: "line",
      data: rejectionData[type]
    })

    // Create series for 'reference' and 'test'
    const series = [getSeries("reference"), getSeries("test")]

    // Define initial legend selection (show both series initially)
    const initialLegendSelected = {
      reference: true,
      test: true
    }

    // Configure chart options
    const newOptions = {
      title: {
        text: "Rejection Counts Across Runs Curve",
        left: "center",
        top: "bottom",
        textStyle: {
          fontSize: 20,
          fontWeight: "bold"
        }
      },
      tooltip: {
        trigger: "axis"
      },
      legend: {
        data: ["reference", "test"],
        selected: initialLegendSelected
      },
      xAxis: {
        type: "category",
        data: xAxisData
      },
      yAxis: {
        type: "value"
      },
      toolbox: {
        feature: {
          saveAsImage: {
            name: "rejection_counts",
            type: "svg",

            backgroundColor: "transparent"
          }
        }
      },
      series
    }

    setOptions(newOptions)
  }, [rejectionData])

  return <ReactECharts option={options} style={{ height: "500px", width: "100%" }} opts={{ renderer: "svg" }} />
}

export default ResultsRejectionCountsCurve
