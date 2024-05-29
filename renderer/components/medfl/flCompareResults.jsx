import React, { useState } from "react"
import ReactEcharts from "echarts-for-react"
import { MultiSelect } from "@blueprintjs/select"

const FlCompareResults = ({ data }) => {
  //states
  const [selectedNodes, selectNodes] = useState(
    data.map((item) => {
      return item.node_name
    })
  )

  console.log(selectedNodes)

  const parsedData = data.map((item) => {
    return {
      nodeName: item.node_name,
      classificationReport: JSON.parse(item.classification_report.replace(/'/g, '"'))
    }
  })

  const metrics = Object.keys(parsedData[0].classificationReport)
  const nodes = parsedData.map((item) => item.nodeName)
  const seriesData = metrics.map((metric) => {
    return {
      name: metric,
      type: "bar",
      data: parsedData.map((item) => item.classificationReport[metric])
    }
  })

  const chartOptions = {
    tooltip: {
      trigger: "axis"
    },
    legend: {
      data: metrics
    },
    toolbox: {
      show: true,
      feature: {
        saveAsImage: {}
      }
    },
    xAxis: {
      type: "category",
      data: nodes
    },
    yAxis: {
      type: "value"
    },
    series: seriesData
  }
  return (
    <>
      <MultiSelect
        value={
          []
          //   selectedNodes ? selectedNodes : []}
          // options={data.map((item) => {
          //   return item.node_name
          // })
        }
        onChange={(e) => selectNodes(e.value)}
        optionLabel="name"
        placeholder="Select Countries"
        className="w-full md:w-20rem"
        display="chip"
      />

      <ReactEcharts option={chartOptions} style={{ height: "400px", width: "100%" }} notMerge={true} lazyUpdate={true} theme={"theme_name"} />
    </>
  )
}

export default FlCompareResults
