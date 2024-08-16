import React, { useState, useEffect } from "react"
import ReactECharts from "echarts-for-react"
import FlInput from "../paInput"

/**
 *
 * @param {Object} globalMetrics Data used to generate the curve chart.
 * @returns {JSX.Element} The GlobalMetricsCurve component.
 *
 *
 * @description
 * GlobalMetricsCurve component renders a curve chart based on provided curve data.
 */
const GlobalMetricsCurve = ({ globalMetrics }) => {
  const [options, setOptions] = useState(null) // chartOptions
  const [metric, setMetric] = useState("Accuracy") // Selected Metric
  const [metrics, setMetrics] = useState({}) // List of available metrics

  /**
   *
   * @param {string} value The Updated Input
   *
   *
   * @description
   * This function sets the metric to the selected value from the input component.
   */
  const handleMetricChange = (value) => {
    setMetric(value.value)
  }

  /**
   * Update the chart options whenever `globalMetrics` or  `metric` change.
   * Process `globalMetrics` to filter out invalid entries and generate the options for the chart.
   * Reset options to null if `globalMetrics` is not provided.
   */
  useEffect(() => {
    if (!globalMetrics) {
      setOptions(null) // Reset options if globalMetrics is null or undefined
      return
    }

    // Determine available metric keys
    const sampleKey = Object.keys(globalMetrics)[100]
    const metricKeys = ["metrics_dr_1", "metrics_dr_2", "metrics_1", "metrics_2"]

    const availableMetricKeys = metricKeys.filter((key) => globalMetrics[sampleKey]?.[key] !== undefined)

    // Extract metric names from the first available metric key
    const firstAvailableMetricKey = availableMetricKeys[0]

    let metricNames
    if (firstAvailableMetricKey !== "metrics_dr_1") {
      metricNames = Object.keys(globalMetrics[sampleKey][firstAvailableMetricKey])
    } else {
      metricNames = Object.keys(globalMetrics[sampleKey][firstAvailableMetricKey].metrics)
    }
    setMetrics(metricNames)

    /**
     *
     * @param {string} metricName  The name of the metric to plot.
     * @param {string} drKey The key indicating the data rate.
     * @returns {Object} Series object to plot.
     *
     *
     * @description
     * This function generates a series object for plotting by extracting data points
     * from the globalMetrics object.
     */
    const createSeries = (metricName, drKey) => ({
      name: `${drKey} ${metricName}`,
      type: "line",
      data: Object.keys(globalMetrics).map((key) => {
        const declarationRate = parseInt(key, 10) //  key is the declarationRate
        return {
          value: [declarationRate, drKey.includes("dr") ? globalMetrics[key]?.[drKey]?.metrics?.[metricName] ?? null : globalMetrics[key]?.[drKey]?.[metricName] ?? null]
        }
      })
    })

    // Generate series only for the selected metric
    const series = availableMetricKeys.map((drKey) => createSeries(metric, drKey))
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
        orient: "horizontal",
        type: "scroll",
        width: "80%"
      },
      xAxis: {
        type: "value",
        name: "Declaration Rate",
        nameLocation: "middle",
        nameGap: 25,
        data: Object.keys(globalMetrics).map((key) => parseInt(key, 10))
      },
      yAxis: {
        type: "value",
        name: "Metrics"
      },
      series: series
    }

    setOptions(newOptions)
  }, [globalMetrics, metric])

  if (!options) return <div>Loading...</div> // Render loading state while options are null

  return (
    <>
      <div style={{ width: "15%" }}>
        <FlInput
          key={"metric"}
          name={"Metric"}
          settingInfos={{
            type: "list",
            tooltip: "<p>Draw the Metric Comparison Curve</p>",
            choices: metrics.map((metric) => ({ name: metric }))
          }}
          currentValue={metric}
          onInputChange={(value) => handleMetricChange(value)}
        />
      </div>
      <div style={{ width: "100%", height: "100%" }}>
        <ReactECharts key={JSON.stringify(options)} option={options} />
      </div>
    </>
  )
}

export default GlobalMetricsCurve
