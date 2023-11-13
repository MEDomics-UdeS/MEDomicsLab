import { loadJsonPath } from "../../../utilities/fileManagementUtils"
import React, { useEffect, useState } from "react"
import dynamic from "next/dynamic"
import * as d3 from "d3"
import { Button } from "primereact/button"
import { Col, Row } from "react-bootstrap"
import { ToggleButton } from "primereact/togglebutton"
import { Dropdown } from "primereact/dropdown"
import { deepCopy } from "../../../utilities/staticFunctions"
import { XSquare } from "react-bootstrap-icons"
import ReactECharts from "echarts-for-react"

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
const MEDcohortFigure = ({ jsonFilePath, classes, setClasses }) => {
  const [jsonData, setJsonData] = useState(null)
  const [plotData, setPlotData] = useState([])
  const [selectedClass, setSelectedClass] = useState() // list of selected classes in the dropdown menu
  const [relativeTime, setRelativeTime] = useState(null) // relative time for the selected class [0, 1
  const [annotations, setAnnotations] = useState([])
  const [separateVertically, setSeparateVertically] = useState(false)
  const [separateHorizontally, setSeparateHorizontally] = useState(false)
  const [selectedClassToSetTimePoint, setSelectedClassToSetTimePoint] = useState(null)
  const [shapes, setShapes] = useState([])
  const [timePoints, setTimePoints] = useState([{ label: "1", value: 1 }])
  const [timePoint, setTimePoint] = useState(1)
  const [selectedData, setSelectedData] = useState([])
  const [timePointClusters, setTimePointClusters] = useState([])
  const [test, setTest] = useState(null)
  const [layout, setLayout] = useState({})
  const [echartsOptions, setEchartsOptions] = useState(null)

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

  const getTimeZeroForClass = (className, profileIndex) => {
    let timeZeroAttribute = null
    if (className === null) return null
    jsonData?.list_MEDprofile[profileIndex]?.list_MEDtab?.forEach((tab) => {
      let attributes = Object.keys(tab)
      let attributeIndex = attributes.indexOf(className)
      if (attributeIndex !== -1) {
        let attribute = attributes[attributeIndex]
        if (attribute !== "Date" && attribute !== "Time_point" && isNotNull(tab, attribute)) {
          if (attribute === relativeTime && timeZeroAttribute === null && tab.Date !== null) {
            return (timeZeroAttribute = tab.Date)
          }
        }
      } else {
        console.log("Attribute not found", className, attributes)
      }
    })
    return timeZeroAttribute
  }

  // Format the JSON data in order to display it in the graph
  // const formatData = () => {
  //   let formattedData = []
  //   let newClasses = new Set()
  //   let timeZeroAttribute = null
  //   let newTimePointsClusters = []
  //   jsonData?.list_MEDprofile?.forEach((profile, index) => {
  //     const color = d3.interpolateTurbo(jsonData.list_MEDprofile.indexOf(profile) / jsonData.list_MEDprofile.length)
  //     let profileData = { x: [], y: [], mode: "markers", type: "scatter", marker: { color: color }, text: [], name: profile.PatientID, customdata: [] }
  //     let profileRandomTime = index
  //     let profilAttributeTimeZero = getTimeZeroForClass(relativeTime, index)
  //     profile?.list_MEDtab?.forEach((tab) => {
  //       let attributes = Object.keys(tab)
  //       attributes.forEach((attribute) => {
  //         newClasses.add(attribute)
  //         if (attribute !== "Date") {
  //           if (attribute === relativeTime && timeZeroAttribute === null) {
  //             timeZeroAttribute = 0
  //           }
  //           let newDate = new Date(tab.Date)
  //           if (profilAttributeTimeZero !== null) {
  //             newDate = (new Date(tab.Date) - new Date(profilAttributeTimeZero)) / (1000 * 60 * 60 * 24 * 365)
  //           }
  //           if (separateHorizontally) {
  //             newDate.setHours(newDate.getHours() + profileRandomTime)
  //           }
  //           if (attribute !== "Time_point" && isNotNull(tab, attribute)) {
  //             profileData.x.push(newDate)
  //             if (separateVertically) {
  //               profileData.y.push(attribute + profileRandomTime)
  //             } else {
  //               profileData.y.push(attribute)
  //             }
  //             profileData.text.push(`${attribute}`)
  //             profileData.customdata.push(tab[attribute])
  //           } else if (attribute === "Time_point") {
  //             let timePoint = tab[attribute]
  //             if (timePoint === null) return
  //             if (newTimePointsClusters[timePoint] === undefined || newTimePointsClusters[timePoint] === null) {
  //               newTimePointsClusters[timePoint] = { x: [], y: [], mode: "lines", type: "scatter", marker: { color: color }, text: [], name: timePoint, customdata: [], fill: "toself" }
  //             }
  //             newTimePointsClusters[timePoint].x.push(newDate)
  //             if (separateVertically) {
  //               newTimePointsClusters[timePoint].y.push(attribute + profileRandomTime)
  //             } else {
  //               newTimePointsClusters[timePoint].y.push(attribute)
  //             }
  //           }
  //         }
  //       })
  //     })

  //     formattedData.push(profileData)
  //   })
  //   let correctedTimePointClusters = []
  //   Object.keys(newTimePointsClusters).forEach((key) => {
  //     correctedTimePointClusters.push(newTimePointsClusters[key])
  //   })
  //   setPlotData(formattedData)
  //   setClasses(newClasses)
  //   setTimePointClusters(correctedTimePointClusters)
  // }

  // Called at initialization in order to load the JSON data
  useEffect(() => {
    setJsonData(loadJsonPath(jsonFilePath))
  }, [])

  // Called while JSON data is loaded in order to call the formatData() function
  useEffect(() => {
    if (jsonData) {
      // formatData()
      // formatData()
      generateEchartsOptions()
    }
  }, [jsonData])

  const generateEchartsOptions = () => {
    let newEchartsOption = {
      title: {
        text: "MEDcohort"
      },
      tooltip: {
        trigger: "item"
      },
      grid: {
        left: "3%",
        right: "4%",
        bottom: "5%",
        containLabel: true
      },
      xAxis: [
        {
          type: (relativeTime !== null && "value") || "time"
        }
      ],
      yAxis: [
        {
          type: "category",
          data: []
        }
      ],
      brush: {
        brushLink: "all",
        toolbox: ["rect", "polygon", "clear"],
        seriesIndex: "all",
        xAxisIndex: 0,
        inBrush: {
          opacity: 1
        },
        throttleType: "debounce",
        throttleDelay: 300
      },
      series: [],
      legend: {
        // Legend shows each patient
        title: {
          text: "<b>Patients</b>"
        },
        type: "scroll",
        orient: "vertical",
        right: 10,
        top: 50,
        bottom: "10%",
        padding: [150, 20],
        data: []
      },
      dataZoom: [
        {
          type: "inside",
          bottom: 100
        },
        {
          start: 1,
          end: 200
        }
      ],
      toolbox: {
        feature: {
          dataZoom: {
            yAxisIndex: "none"
          },
          restore: {},
          saveAsImage: {}
        }
      }
      // visualMap: {}
    }

    let patientNames = new Set()
    let innerYClasses = new Set()
    let newClasses = new Set()
    let timeZeroAttribute = 0
    let newTimePointsClusters = []
    let numberOfPatients = jsonData?.list_MEDprofile?.length
    jsonData?.list_MEDprofile?.forEach((profile, index) => {
      if (profile.PatientID !== "32379" && profile.PatientID !== "25881" && profile.PatientID !== "21690" && profile.PatientID !== "18089") {
        const color = d3.interpolateTurbo(jsonData.list_MEDprofile.indexOf(profile) / jsonData.list_MEDprofile.length)
        patientNames.add(profile.PatientID)
        let profileSerie = { type: "scatter", data: [], name: profile.PatientID, itemStyle: { color: color }, symbolSize: 5, emphasis: { focus: "series" }, selectMode: "multiple" }
        let profileRandomTime = index
        let profilAttributeTimeZero = getTimeZeroForClass(relativeTime, index)
        profile?.list_MEDtab?.forEach((tab) => {
          let attributes = Object.keys(tab)
          attributes.forEach((attribute) => {
            newClasses.add(attribute)
            if (attribute !== "Date") {
              if (attribute === relativeTime && timeZeroAttribute === null) {
                timeZeroAttribute = tab.Date
              }
              let newDate = new Date(tab.Date)
              if (profilAttributeTimeZero !== null) {
                newDate = new Date(new Date(tab.Date) - new Date(profilAttributeTimeZero))
              }
              if (separateHorizontally) {
                newDate = Date.parse(newDate + profileRandomTime)
              }
              let x, y
              if (attribute !== "Time_point" && isNotNull(tab, attribute)) {
                if (relativeTime !== null) {
                  x = newDate.valueOf() / (1000 * 60 * 60 * 24)
                  if (separateHorizontally) {
                    x = x + profileRandomTime / (numberOfPatients * 2)
                  }
                } else {
                  x = newDate
                }
                if (separateVertically) {
                  y = attribute + profileRandomTime
                  innerYClasses.add(attribute + profileRandomTime)
                } else {
                  y = attribute
                  innerYClasses.add(attribute)
                }
                profileSerie.data.push([x, y])
              } else if (attribute === "Time_point") {
                let timePoint = tab[attribute]
                if (timePoint === null) return
                if (newTimePointsClusters[timePoint] === undefined || newTimePointsClusters[timePoint] === null) {
                  newTimePointsClusters[timePoint] = { x: [], y: [], mode: "lines", type: "scatter", marker: { color: color }, text: [], name: timePoint, customdata: [], fill: "toself" }
                }
                newTimePointsClusters[timePoint].x.push(newDate)
                if (separateVertically) {
                  newTimePointsClusters[timePoint].y.push(attribute + profileRandomTime)
                } else {
                  newTimePointsClusters[timePoint].y.push(attribute)
                }
              }
            }
          })
        })
        newEchartsOption.series.push(profileSerie)
      }

      // formattedData.push(profileData)
    })
    newEchartsOption.yAxis[0].data = [...innerYClasses]
    newEchartsOption.legend.data = [...patientNames]
    let correctedTimePointClusters = []
    Object.keys(newTimePointsClusters).forEach((key) => {
      correctedTimePointClusters.push(newTimePointsClusters[key])
    })
    setEchartsOptions(newEchartsOption)
    setClasses(newClasses)
    setTimePointClusters(correctedTimePointClusters)
  }

  useEffect(() => {
    console.log("echartsOptions", echartsOptions)
  }, [echartsOptions])

  // If the relativeTime is changed, we update the figure
  useEffect(() => {
    console.log("relativeTime", relativeTime)
    // formatData()
    generateEchartsOptions()
  }, [relativeTime])

  useEffect(() => {
    console.log("plotData", plotData, jsonData)
  }, [plotData])

  const getFindPatientFunction = (patientId) => {
    return (patient) => {
      return patient.PatientID === patientId
    }
  }

  const handleClick = (data) => {
    var point = data.points[0]
    console.log("point", point)
    let customdata = point.customdata
    let textToShow = "<div>"
    console.log("customdata", customdata)

    textToShow += "<b>Patient</b> " + point.data.name + "<br>"
    textToShow += "<b>Time</b> " + point.x + "<br>"
    textToShow += "<b>Class</b> " + point.y + "<br>"
    Object.entries(customdata).forEach((data) => {
      textToShow += "<b>" + data[0] + "</b> " + data[1] + "<br>"
    })
    textToShow += "</div>"
    let newAnnotation = {
      x: point.x,
      y: point.y,
      arrowhead: 6,
      ax: 0,
      ay: -80,
      bgcolor: "rgba(255, 255, 255, 0.9)",
      arrowcolor: point.fullData.marker.color,
      font: { size: 11 },
      bordercolor: point.fullData.marker.color,
      borderwidth: 3,
      borderpad: 4,
      height: 120,
      width: 200,

      text: textToShow
    }

    console.log(point.pointNumber)
    let newAnnotations = [...annotations]
    let toDelete = false
    newAnnotations.forEach((annotation) => {
      if (annotation.x === newAnnotation.x && annotation.y === newAnnotation.y) {
        newAnnotations.splice(newAnnotations.indexOf(annotation), 1)
        toDelete = true
      }
    })
    if (toDelete) {
      setAnnotations(newAnnotations)
      return
    }

    newAnnotations.push(newAnnotation)
    setAnnotations(newAnnotations)
    // delete instead if clicked twic
  }

  useEffect(() => {
    console.log("separate", separateVertically, separateHorizontally)
    // formatData()
    generateEchartsOptions()
  }, [separateVertically, separateHorizontally])

  useEffect(() => {
    console.log("annotations", annotations)
  }, [annotations])

  const getClassesOptions = () => {
    if (classes.size === 0) return []
    let classesArray = []
    classes.forEach((className) => {
      if (className !== "Date" && className !== "Time_point") {
        classesArray.push({ label: className, value: className })
      }
    })
    classesArray.sort((a, b) => (a.label > b.label ? 1 : -1))
    return classesArray
  }

  const handleSetTimePointByClass = () => {
    console.log("selectedClassToSetTimePoint", selectedClassToSetTimePoint)
    let newJsonData = { ...jsonData }
    newJsonData.list_MEDprofile.forEach((profile) => {
      profile.list_MEDtab.forEach((tab) => {
        let attributes = Object.keys(tab)
        attributes.forEach((attribute) => {
          if (attribute !== "Date" && attribute !== "Time_point" && isNotNull(tab, attribute)) {
            if (attribute === selectedClassToSetTimePoint) {
              tab.Time_point = timePoint
            }
          }
        })
      })
    })
    setJsonData(newJsonData)
  }

  const handleSetTimePoint = () => {
    console.log("timePoint", timePoint)
    console.log("selectedData", selectedData)
    let newJsonData = { ...jsonData }
    selectedData.forEach((data) => {
      console.log("data", data, newJsonData.list_MEDprofile)
      let profileIndex = newJsonData.list_MEDprofile.findIndex(getFindPatientFunction(data.name))

      // Go through all the profiles and set the time point to the selected value for the selected data
      let profile = newJsonData.list_MEDprofile[profileIndex]
      let selectedPoints = data.selectedpoints
      selectedPoints.forEach((pointIndex) => {
        let tab = profile.list_MEDtab[pointIndex]
        console.log("pointIndex", pointIndex, profile, tab)
        tab.Time_point = timePoint
      })
    })
    setJsonData(newJsonData)
  }

  useEffect(() => {
    console.log("selectedData", selectedData)
  }, [selectedData])

  useEffect(() => {
    if (echartsOptions !== null) {
      let newEchartsOptions = { ...echartsOptions }
      shapes.forEach((shape) => {
        newEchartsOptions.series.push(shape)
      })
      setEchartsOptions(newEchartsOptions)
    }
  }, [shapes])

  useEffect(() => {
    console.log("timePointClusters", timePointClusters)
    let newShapes = []
    let length = timePointClusters.length
    timePointClusters.forEach((cluster, index) => {
      let rect = createRectFromTimePoint(index, length)
      newShapes.push(rect)
    })
    setShapes(newShapes)

    let newTimePoints = updateTimePoints()
    if (newTimePoints.length === timePointClusters.length) {
      // Get last time point
      let lastElement = newTimePoints[newTimePoints.length - 1]
      let lastTimePoint = lastElement.value

      range(lastTimePoint, 1).forEach((timePoint) => {
        if (newTimePoints.findIndex((element) => element.value === timePoint) === -1) {
          newTimePoints.push({ label: timePoint, value: timePoint })
        }
      })
      if (newTimePoints.length !== 1 + timePointClusters.length) {
        // Add the future time point
        newTimePoints.push({ label: lastTimePoint + 1, value: lastTimePoint + 1 })
      }
    }
    newTimePoints.sort((a, b) => (a.value > b.value ? 1 : -1))
    setTimePoints(newTimePoints)
  }, [timePointClusters])

  function range(size, startAt) {
    return [...Array(size).keys()].map((i) => i + startAt)
  }

  const updateTimePoints = () => {
    let newTimePoints = new Set([1])
    timePointClusters.forEach((cluster, index) => {
      newTimePoints.add(cluster.name)
    })
    console.log("newTimePoints", newTimePoints)
    let newTimePointsArray = []
    newTimePoints.forEach((timePoint) => {
      newTimePointsArray.push({ label: timePoint, value: timePoint })
    })
    return newTimePointsArray
  }

  const createRectFromTimePoint = (timePoint, length) => {
    const findEarliestDate = (timePoint) => {
      let earliestDate = null
      timePointClusters[timePoint].x.forEach((x, index) => {
        if (earliestDate === null) {
          earliestDate = x
        } else if (x < earliestDate) {
          earliestDate = x
        }
      })
      return earliestDate
    }
    const findLatestDate = (timePoint) => {
      let latestDate = new Date(0)
      timePointClusters[timePoint].x.forEach((x, index) => {
        if (x > latestDate) {
          latestDate = x
        }
      })
      return latestDate
    }
    let earliestDate = findEarliestDate(timePoint)
    let latestDate = findLatestDate(timePoint)
    console.log("earliestDate", earliestDate, "latestDate", latestDate, earliestDate === latestDate)
    // if (earliestDate.toTimeString() === latestDate.toTimeString()) {
    //   // earliestDate.setHours(earliestDate.getHours() - 1)
    //   // latestDate.setHours(latestDate.getHours() + 1)
    // }
    if (relativeTime !== null) {
      earliestDate = earliestDate.valueOf() / (1000 * 60 * 60 * 24)
      latestDate = latestDate.valueOf() / (1000 * 60 * 60 * 24)
    }
    let rect = {
      name: `T${timePoint + 1}`,
      type: "scatter",

      markArea: {
        silent: true,
        itemStyle: {
          color: returnTurboColorFromIndexInList(timePoint, 5),
          opacity: 0.1,
          borderWidth: 1,
          borderType: "dashed"
        },
        label: {
          position: "bottom",
          show: true,
          formatter: `T${timePoint + 1}`
        },
        data: [
          [
            {
              name: `T${timePoint + 1}`,
              xAxis: earliestDate,
              yAxis: -1
            },
            {
              xAxis: latestDate,
              yAxis: echartsOptions.yAxis[0].data.length
            }
          ]
        ]
      },
      data: [
        [earliestDate, -1],
        [latestDate, echartsOptions.yAxis[0].data.length]
      ]
    }
    return rect
  }

  const darkenColorFromTurbo = (color) => {
    let rgb = d3.rgb(color)
    let hsl = d3.hsl(rgb)
    hsl.l = hsl.l - 0.2
    return hsl.toString()
  }

  const addTransparencyToColor = (color, transparency) => {
    let rgb = d3.rgb(color)
    let hsl = d3.hsl(rgb)
    hsl.opacity = transparency
    return hsl.toString()
  }

  const returnTurboColorFromIndexInList = (index, length) => {
    return d3.interpolateTurbo(index / length)
  }

  const removeTimePointFromJsonData = (timePoint) => {
    let newJsonData = { ...jsonData }
    console.log("timepoint to remove", timePoint)
    newJsonData.list_MEDprofile.forEach((profile) => {
      profile.list_MEDtab.forEach((tab) => {
        if (tab.Time_point === timePoint) {
          tab.Time_point = null
        }
      })
    })
    setJsonData(newJsonData)
  }

  useEffect(() => {
    console.log("Layout", layout)
  }, [layout])

  // const handleSelect = (param, echartSelected) => {
  //   console.log("selected", echartSelected, param)
  //   // let batch = param.batch
  //   if (param.areas === null) return
  //   else if (param.areas !== undefined) {
  //     // let areas = batch["0"].areas
  //     // let newSelectedData = []
  //     // areas.forEach((area) => {
  //     //   newSelectedData.push({ type: "lineX", range: area.coordRanges })
  //     // })
  //     // setSelectedData(param.areas)
  //   }
  // }
  // const handleSelect = (param, echartSelected) => {
  //   console.log("selected", echartSelected, param)
  //   let batch = param.batch
  //   if (batch === null) return
  //   else if (batch["0"].areas !== undefined) {
  //     let areas = batch["0"].areas
  //     let newSelectedData = []
  //     areas.forEach((area) => {
  //       newSelectedData.push({ type: "lineX", range: area.coordRanges })
  //     })
  //     // setSelectedData(newSelectedData)
  //   }
  // }

  const ref = React.useRef(null)
  // console.log("echartsOptions", ref.current.getEchartsInstance())
  return (
    <>
      <Row style={{ width: "100%", justifyContent: "center" }}>
        <Col lg={8} className="center">
          <div className="MEDcohort-figure" style={{ display: "flex", flexDirection: "column", boxShadow: "2px 2px 4px rgba(0, 0, 0, 0.25)" }}>
            {echartsOptions && <ReactECharts ref={ref} option={echartsOptions} onEvents={{}} style={{ width: "100%", height: "100%" }} lazyUpdate={true} />}

            {/* <Plot
              data={plotData}
              onClick={(data) => {
                console.log("data", data, plotData, jsonData)
                handleClick(data)
              }}
              onClickAnnotation={(data) => {
                console.log("ANNOTATION", data)
              }}
              layout={{
                // Add sliders with multiple timestamps
                sliders: [
                  // Add a slider for the relative time
                ],
                shapes: shapes,
                selections: [],
                selectdirection: "h",
                autosize: true,
                title: "MEDcohort",
                showlegend: true,
                legend: {
                  title: {
                    text: "<b>Patients</b>"
                  }
                },
                xaxis: {
                  title: "<b>Date</b>",
                  type: "date"
                  // rangeslider: {}
                },
                yaxis: {
                  title: "<b>Classes</b>",
                  type: "category",
                  automargin: true
                },
                annotations: annotations
              }}
              useResizeHandler={true}
              onUpdate={(figure) => {
                console.log("UPDATE LAYOUT", figure)
                console.log("Selections", figure.layout.selections)
              }}
              onInitialized={(figure) => {
                console.log("INITIALIZED", figure)
              }}
              style={{ width: "100%", height: "100%" }}
            /> */}
          </div>
        </Col>

        <Col lg={4} style={{ display: "flex", flexDirection: "column", justifyContent: "space-evenly" }}>
          <Row className="justify-content-md-center medprofile-buttons" style={{ display: "flex", flexDirection: "row", alignContent: "center", alignItems: "center", width: "100%", justifyContent: "center", boxShadow: "2px 2px 4px rgba(0, 0, 0, 0.25)", padding: "1rem", borderRadius: "1rem" }}>
            <Col xxl="6" style={{ display: "flex", flexDirection: "row", justifyContent: "center", marginBottom: "1rem" }}>
              <ToggleButton className="separate-toggle-button" checked={separateHorizontally} onChange={(e) => setSeparateHorizontally(e.value)} onLabel="Overlap horizontally" offLabel="Separate horizontally" onIcon="pi pi-check" offIcon="pi pi-times" />
            </Col>
            <Col xxl="6" style={{ display: "flex", flexDirection: "row", justifyContent: "center", marginBottom: "1rem" }}>
              <ToggleButton className="separate-toggle-button" checked={separateVertically} onChange={(e) => setSeparateVertically(e.value)} onLabel="Overlap vertically" offLabel="Separate vertically" onIcon="pi pi-check" offIcon="pi pi-times" />
            </Col>
            <Col style={{ display: "flex", flexDirection: "row", justifyContent: "center", marginBottom: "1rem" }}>
              <Button size="small" label="Clear annotations" onClick={() => setAnnotations([])} />
            </Col>
            <Col style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <label htmlFor="dd-city">Select the class for relative time</label>
              <Col style={{ display: "flex", flexDirection: "row", justifyContent: "center", marginTop: "0rem" }}>
                <div style={{ width: "100%" }} className="p-inputgroup ">
                  <Dropdown style={{ width: "100%" }} value={selectedClass} options={getClassesOptions()} onChange={(e) => setSelectedClass(e.value)} />
                  <ToggleButton
                    className={`relative-time-toggle-button ${relativeTime !== null ? "p-button-success" : "p-button-info"}`}
                    checked={relativeTime === null}
                    onLabel="Set"
                    offLabel="Unset"
                    onChange={(e) => {
                      if (relativeTime === null) {
                        setRelativeTime(selectedClass)
                      } else {
                        setRelativeTime(null)
                      }
                    }}
                    style={{ borderRadius: "0 4px 4px 0" }}
                  />
                </div>
              </Col>
            </Col>
            <Col style={{ display: "flex", flexDirection: "column", justifyContent: "center", marginTop: "1rem" }}>
              <label htmlFor="dd-city">Set time points to selected data points</label>
              <Col style={{ display: "flex", flexDirection: "row", justifyContent: "center", marginTop: "0rem" }}>
                <div style={{ width: "100%" }} className="p-inputgroup ">
                  <Dropdown style={{ width: "100%" }} value={timePoint} options={timePoints} onChange={(e) => setTimePoint(e.value)} />
                  <Button className="separate-toggle-button" style={{ borderRadius: "0 4px 4px 0", width: "5rem", padding: "0rem" }} onClick={handleSetTimePoint} label={`Set T${timePoint}`} />
                </div>
              </Col>
            </Col>
            <Col style={{ display: "flex", flexDirection: "column", justifyContent: "center", marginTop: "1rem" }}>
              <label htmlFor="dd-city">Set time points by classes</label>
              <Col style={{ display: "flex", flexDirection: "row", justifyContent: "center", marginTop: "0rem" }}>
                <div style={{ width: "100%" }} className="p-inputgroup ">
                  <Dropdown style={{ width: "100%" }} value={selectedClassToSetTimePoint} options={getClassesOptions()} onChange={(e) => setSelectedClassToSetTimePoint(e.value)} />
                  <Button className="separate-toggle-button" style={{ borderRadius: "0 4px 4px 0", width: "5rem", padding: "0rem" }} onClick={handleSetTimePointByClass} label={`Set T${timePoint}`} />
                </div>
              </Col>
            </Col>
            <Col style={{ display: "flex", flexDirection: "column", justifyContent: "center", marginTop: "1rem", alignItems: "flex-start" }}>
              {timePointClusters.length !== 0 && (
                <>
                  <label htmlFor="">
                    <b>
                      <u>Time Points associated data</u>
                    </b>
                  </label>
                  {timePointClusters.map((cluster, index) => {
                    console.log("cluster", cluster)
                    return (
                      <>
                        <div style={{ display: "flex", flexDirection: "row", alignContent: "center", alignItems: "flex-start", justifyContent: "center" }}>
                          <h6 style={{ margin: "0" }}>{`T${cluster.name}`}</h6>
                          &nbsp;
                          <p style={{ margin: "0", marginLeft: "0.5rem" }}>
                            {" "}
                            {`Number of data points: `}
                            <b> {`${cluster.x.length}`}</b>
                          </p>
                          <a
                            value={cluster.name}
                            style={{ margin: "0", marginLeft: "0.5rem", cursor: "pointer" }}
                            onClick={(e) => {
                              let newTimePointsClusters = deepCopy(timePointClusters)
                              newTimePointsClusters.splice(index, 1)
                              let newTimePoints = deepCopy(timePoints)
                              let indexOfTimePoint = newTimePoints.findIndex((timePoint) => timePoint.value === cluster.name)
                              console.log("indexOfTimePoint", indexOfTimePoint)
                              if (indexOfTimePoint !== -1 && cluster.name !== 1) {
                                newTimePoints.splice(indexOfTimePoint, 1)
                              }
                              setTimePoints(newTimePoints)
                              setTimePointClusters(newTimePointsClusters)
                              removeTimePointFromJsonData(cluster.name)
                            }}
                          >
                            <XSquare size={20} />
                          </a>
                        </div>
                      </>
                    )
                  })}
                </>
              )}
            </Col>
          </Row>
        </Col>
      </Row>
    </>
  )
}

export default MEDcohortFigure
