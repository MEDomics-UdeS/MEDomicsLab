import React, { useEffect, useState } from "react"
import ReactECharts from "echarts-for-react"

/**
 *
 * @param {Object} rejectionData Data used to generate the curve chart.
 * @returns {JSX.Element} The RejectionCountsCurve component.
 *
 *
 * @description
 * RejectionCountsCurve component renders a curve chart based on provided curve data.
 * It is specific to comparing results of two experiments of similar type (Detectron Experiment)
 */
const RejectionCountsCurve = ({ rejectionData }) => {
  const [options, setOptions] = useState({})
  // Initialize and plot the curve
  useEffect(() => {
    // Extract data for the curves
    const keys = Object.keys(rejectionData)
    const xAxisData = Array.from({ length: rejectionData[keys[0]].reference.length }, (_, i) => i + 1)

    const getSeries = (key, type) => ({
      name: `${key}.${type}`,
      type: "line",
      data: rejectionData[key][type]
    })

    const series = keys.flatMap((key) => [getSeries(key, "reference"), getSeries(key, "test")])

    // Specify which series are shown initially
    const initialLegendSelected = series.reduce((acc, serie) => {
      acc[serie.name] = serie.name.endsWith("test")
      return acc
    }, {})

    const newOptions = {
      tooltip: {
        trigger: "axis"
      },
      legend: {
        data: series.map((serie) => serie.name),
        selected: initialLegendSelected
      },
      xAxis: {
        type: "category",
        data: xAxisData
      },
      yAxis: {
        type: "value"
      },
      series
    }

    setOptions(newOptions)
  }, [rejectionData])

  return <ReactECharts option={options} style={{ height: "500px", width: "100%" }} />
}

export default RejectionCountsCurve
