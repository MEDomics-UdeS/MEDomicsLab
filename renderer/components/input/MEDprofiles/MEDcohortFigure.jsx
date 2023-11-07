import { loadJsonPath } from "../../../utilities/fileManagementUtils"
import React, { useEffect, useState } from "react"
import dynamic from "next/dynamic"
import * as d3 from "d3"
import { randInt } from "three/src/math/MathUtils"

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
const MEDcohortFigure = ({ jsonFilePath, classes, setClasses, relativeTime }) => {
  const [jsonData, setJsonData] = useState(null)
  const [plotData, setPlotData] = useState([])
  // const [relativeTimePatients, setRelativeTimePatients] = useState([])
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
    let newClasses = new Set()
    jsonData?.list_MEDprofile?.forEach((profile) => {
      const color = d3.interpolateTurbo(jsonData.list_MEDprofile.indexOf(profile) / jsonData.list_MEDprofile.length)
      let profilteData = { x: [], y: [], mode: "markers", type: "scatter", marker: { color: color }, text: [], name: profile.PatientID }
      profile?.list_MEDtab?.forEach((tab) => {
        let attributes = Object.keys(tab)
        attributes.forEach((attribute) => {
          newClasses.add(attribute)
          if (attribute !== "Date" && attribute !== "Time_point" && isNotNull(tab, attribute)) {
            let attributeValue = tab[attribute]
            console.log("attributeValue", attributeValue)
            profilteData.x.push(new Date(tab.Date))
            profilteData.y.push(attribute)
            profilteData.text.push(`${attribute}: ` + { attributeValue })
          }
        })
      })
      formattedData.push(profilteData)
    })
    setClasses(newClasses)
    setPlotData(formattedData)
  }

  const getTimeZeroForClass = (className, profileIndex) => {
    let timeZeroAttribute = null
    jsonData?.list_MEDprofile[profileIndex]?.list_MEDtab?.forEach((tab) => {
      let attributes = Object.keys(tab)
      let attributeIndex = attributes.indexOf(className)
      if (attributeIndex !== -1) {
        let attribute = attributes[attributeIndex]
        if (attribute !== "Date" && attribute !== "Time_point" && isNotNull(tab, attribute)) {
          if (attribute === relativeTime && timeZeroAttribute === null) {
            return (timeZeroAttribute = tab.Date)
          }
        }
      }
    })
    return timeZeroAttribute
  }

  const setRelativeTimeData = () => {
    let formattedData = []
    let timeZeroAttribute = null
    jsonData?.list_MEDprofile?.forEach((profile, index) => {
      let profileRandomTime = index
      let profilAttributeTimeZero = getTimeZeroForClass(relativeTime, index)
      const color = d3.interpolateTurbo(jsonData.list_MEDprofile.indexOf(profile) / jsonData.list_MEDprofile.length)
      profile?.list_MEDtab?.forEach((tab) => {
        let attributes = Object.keys(tab)
        attributes.forEach((attribute) => {
          if (attribute !== "Date" && attribute !== "Time_point" && isNotNull(tab, attribute)) {
            let attributeValue = tab[attribute]
            if (attribute === relativeTime && timeZeroAttribute === null) {
              timeZeroAttribute = tab.Date
            }
            console.log("attributeValue", attributeValue)
            if (timeZeroAttribute !== null) {
              let newDate = new Date(new Date(tab.Date) - new Date(profilAttributeTimeZero))
              newDate.setHours(newDate.getHours() + profileRandomTime)
              formattedData.push({
                x: [newDate],
                y: [attribute],
                mode: "markers",
                type: "scatter",
                marker: { color: color },
                text: `PatientID: ${profile.PatientID}` + ` ${attribute}: ` + { attributeValue },
                name: attribute
              })
            } else {
              let newDate = new Date(new Date(tab.Date) - new Date(profilAttributeTimeZero))
              newDate.setHours(newDate.getHours() + profileRandomTime)
              formattedData.push({
                x: [newDate],
                y: [attribute],
                mode: "markers",
                type: "scatter",
                marker: { color: color },
                text: `PatientID: ${profile.PatientID}` + ` ${attribute}: ` + { attributeValue },
                name: attribute,
                transforms: [
                  {
                    type: "groupby",
                    groups: [profile.PatientID],
                    styles: [
                      {
                        target: "PatientID",
                        value: {
                          marker: { color: color }
                        }
                      }
                    ]
                  }
                ]
              })
            }
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

  // If the relativeTime is changed, we update the figure
  useEffect(() => {
    console.log("relativeTime", relativeTime)
    if (relativeTime !== null) {
      setRelativeTimeData()
    } else {
      formatData()
    }
  }, [relativeTime])

  useEffect(() => {
    console.log("plotData", plotData)
  }, [plotData])

  return (
    <div className="MEDcohort-figure">
      <Plot
        data={plotData}
        onClick={(data) => {
          console.log("data", data, plotData, jsonData)
        }}
        layout={{
          width: 750,
          height: 750,
          title: "MEDcohort",
          showlegend: true,
          xaxis: {
            title: "<b>Date</b>",
            type: "date"
          },
          yaxis: {
            title: "<b>Classes</b>",
            type: "category"
          }
        }}
      />
    </div>
  )
}

export default MEDcohortFigure
