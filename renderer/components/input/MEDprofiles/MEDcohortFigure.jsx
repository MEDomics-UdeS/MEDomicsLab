import { loadJsonPath } from "../../../utilities/fileManagementUtils"
import React, { useEffect, useState } from "react"
import dynamic from "next/dynamic"
import * as d3 from "d3"

/**
 *
 * @param {jsonFilePath} jsonFilePath Path to the file containing a MEDcohort as JSON data
 *
 * @returns {JSX.Element} a page
 *
 * @description
 * This component is part of the MEDprofilesViewer page and is a plotly.js plot representing
 * a MEDcohort with interactive options.
 *
 */
const MEDcohortFigure = ({ jsonFilePath }) => {
  const [jsonData, setJsonData] = useState(null)
  const [plotData, setPlotData] = useState([])
  const Plot = dynamic(() => import("react-plotly.js"), { ssr: false })

  /**
   *
   * @param {MEDprofiles.list_MEDtab.MEDtab} tabObject
   * @param {String} className
   * @returns {boolean}
   *
   * @description
   * This functions returns true if the className attribute in MEDtab object is not null.
   */
  function isNotNull(tabObject, className) {
    let attributes = Object.keys(tabObject[className])
    let toRet = false
    attributes.forEach((attribute) => {
      if (tabObject[className][attribute] !== null) {
        toRet = true
      }
    })
    return toRet
  }

  // Format the JSON data in order to display it in the graph
  const formatData = () => {
    let formattedData = []

    jsonData?.list_MEDprofile?.forEach((profile) => {
      const color = d3.interpolateTurbo(jsonData.list_MEDprofile.indexOf(profile) / jsonData.list_MEDprofile.length)

      profile?.list_MEDtab?.forEach((tab) => {
        let attributes = Object.keys(tab)
        console.log("tab", tab)
        attributes.forEach((attribute) => {
          if (attribute !== "Date" && attribute !== "Time_point" && isNotNull(tab, attribute)) {
            let attributeValue = tab[attribute]
            console.log("attributeValue", attributeValue)
            formattedData.push({
              x: [new Date(tab.Date)],
              y: [attribute],
              mode: "markers",
              type: "scatter",
              marker: { color: color },
              text: `PatientID: ${profile.PatientID}` + ` ${attribute}: ` + { attributeValue },
              name: attribute
            })
          }
        })
      })
    })

    setPlotData(formattedData)
  }

  // Called at initialization in order to load the JSON data
  useEffect(() => {
    setJsonData(loadJsonPath(jsonFilePath))
  }, [])

  // Called while JSON data is loaded in order to call the formatData() function
  useEffect(() => {
    if (jsonData) {
      formatData()
    }
  }, [jsonData])

  return (
    <div className="MEDcohort-figure">
      <Plot
        onClick={(data) => {
          console.log(data)
        }}
        onClickAnnotation={(data) => {
          console.log("Annotation clicked!", data)
        }}
        onLegendClick={(data) => {
          console.log(data)
        }}
        data={plotData}
        layout={{
          width: 750,
          height: 750,
          title: "MEDcohort",
          showlegend: false,
          xaxis: {
            title: "<b>Date</b>",
            type: "date"
          },
          yaxis: {
            title: "<b>Classes</b>",
            type: "category"
          }
        }}
        editable={true}
      />
    </div>
  )
}

export default MEDcohortFigure
