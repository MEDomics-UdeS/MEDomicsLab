import { loadJsonPath } from "../../../utilities/fileManagementUtils"
import React, { useEffect, useState } from "react"
import dynamic from "next/dynamic"


const MEDcohortFigure = ({ jsonFilePath }) => {
    const [jsonData, setJsonData] = useState(null)
    const [plotData, setPlotData] = useState([])
    const [nbClasses, setnbClasses] = useState(0)
    const Plot = dynamic(() => import("react-plotly.js"), { ssr: false, })

    function getValuesFromClass(MEDclass) {
      let text = ""
      let y = null
      let attributes = Object.keys(MEDclass)
      attributes.forEach((attribute) => {
        if (MEDclass[attribute] != null) {
          text += `${attribute}: ${MEDclass[attribute]}\n`
          y = 1
        }
      }) 
      return [text, y]
    }

    const formatData = () => {
      let formattedData = []
      jsonData?.list_MEDprofile?.forEach((profile) => {
        profile?.list_MEDtab?.forEach((tab) => {
          let attributes = Object.keys(tab)
          let index = 0
          setnbClasses(attributes.length)
          attributes.forEach((attribute) => {
            if (attribute !== "Date" && attribute !== "Time_point") {
              let values = getValuesFromClass(tab[attribute])
              let text = values[0]
              let y = values[1]
              if (y !== null) {
                formattedData.push({
                  x: [new Date(tab.Date)],
                  y: [y],
                  yaxis: 'y' + index,
                  mode: "markers",
                  type: "scatter",
                  marker: {color: 'black'},
                  text: text,
                  name: text,
                })
              }
            }
            index += 1
          })
        })
      })
      setPlotData(formattedData)
    }

    useEffect(() => {
        setJsonData(loadJsonPath(jsonFilePath))
    }, [])

    useEffect(() => {
        console.log("JSON data", jsonData)
        formatData()
    }, [jsonData])

    useEffect(() => {
      console.log("plot data", plotData)
  }, [plotData])
  
    return (
      <>
      MEDcohortFigure
      { jsonFilePath }
      <Plot
        data = {plotData}
        layout={{width: 750, height: 750, title: 'MEDcohort', showlegend: false, xaxis:{type: 'date'}, grid: {rows: nbClasses, columns: 1}}}
      />
      </>
    )
  }
  
  export default MEDcohortFigure