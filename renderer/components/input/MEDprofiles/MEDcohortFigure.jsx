/* eslint-disable camelcase */
import React from "react"
import { loadJsonPath } from "../../../utilities/fileManagementUtils"
import { deepCopy } from "../../../utilities/staticFunctions"
import { XSquare } from "react-bootstrap-icons"
import ReactECharts from "echarts-for-react"
import * as d3 from "d3"
import { Col, Row } from "react-bootstrap"
import { ToggleButton } from "primereact/togglebutton"
import { Dropdown } from "primereact/dropdown"
import { Button } from "primereact/button"
import { MultiSelect } from "primereact/multiselect"
import MedDataObject from "../../workspace/medDataObject"
import { toast } from "react-toastify"

/**
 * @class MEDcohortFigureClass
 * @category Components
 * @classdesc Class component that renders a figure of the MEDcohort data.
 * @param {Object} props
 * @param {String} props.jsonFilePath - Path to the MEDcohort json file.
 * @param {MEDprofiles.list_MEDprofile.MEDprofile} props.jsonData - MEDcohort json data.
 * @param {String} props.classes - Classes to be displayed in the figure.
 * @param {String} props.relativeTime - Class to be used as relative time.
 * @param {Boolean} props.separateVertically - If true, the classes will be separated vertically.
 * @param {Boolean} props.separateHorizontally - If true, the classes will be separated horizontally.
 * @param {Boolean} props.selectedClassesToSetTimePoint - Classes to be used to set the time point.
 * @param {Boolean} props.shapes - Shapes to be displayed in the figure.
 * @param {Boolean} props.timePoints - Time points to be displayed in the figure.
 * @param {Boolean} props.timePoint - Time point to be displayed in the figure.
 * @param {Boolean} props.selectedData - Selected data to be displayed in the figure.
 * @param {Boolean} props.timePointClusters - Time point clusters to be displayed in the figure.
 * @param {Boolean} props.echartsOptions - Echarts options to be displayed in the figure.
 * @param {Boolean} props.annotations - Annotations to be displayed in the figure.
 * @param {Boolean} props.layout - Layout to be displayed in the figure.
 */
class MEDcohortFigureClass extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      jsonData: this.props.jsonData,
      selectedClass: undefined,
      relativeTime: null,
      annotations: [],
      separateVertically: false,
      separateHorizontally: false,
      selectedClassesToSetTimePoint: null,
      shapes: [],
      timePoints: [{ label: "1", value: 1 }],
      timePoint: 1,
      selectedData: [],
      timePointClusters: [],
      echartsOptions: null,
      classes: this.props.classes
    }
    this.chartRef = React.createRef()
  }

  // You can add lifecycle methods like componentDidMount, componentDidUpdate here
  componentDidMount() {
    this.setState({ jsonData: loadJsonPath(this.props.jsonFilePath) }, () => {
      this.generateEchartsOptions()
    })
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.chartRef.current !== null) {
      console.log("REF", this.chartRef.current.getEchartsInstance())
    }
    // Respond to changes in props or state
    if (prevProps.jsonData !== this.props.jsonData) {
      this.setState({ jsonData: this.props.jsonData }, () => {
        this.generateEchartsOptions()
      })
    } else if (prevState.jsonData !== this.state.jsonData) {
      this.generateEchartsOptions()
    } else if (prevState.separateHorizontally !== this.state.separateHorizontally || prevState.separateVertically !== this.state.separateVertically) {
      this.generateEchartsOptions()
    } else if (prevState.relativeTime !== this.state.relativeTime) {
      this.generateEchartsOptions()
    }
  }

  componentWillUnmount() {
    // Clean up event listeners, cancel timeouts, etc.
  }

  returnTurboColorFromIndexInList = (index, length) => {
    return d3.interpolateTurbo(index / length)
  }

  createRectFromTimePoint = (timePoint, length, timePointClusters, echartsOptions, name) => {
    const findEarliestDate = (timePoint) => {
      let earliestDate = null
      timePointClusters[timePoint].x.forEach((x) => {
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
      timePointClusters[timePoint].x.forEach((x) => {
        if (x > latestDate) {
          latestDate = x
        }
      })
      return latestDate
    }

    let earliestDate = findEarliestDate(timePoint)
    let latestDate = findLatestDate(timePoint)
    console.log("earliestDate", earliestDate, "latestDate", latestDate, earliestDate === latestDate)
    if (this.state.relativeTime !== null) {
      earliestDate = earliestDate.valueOf() / (1000 * 60 * 60 * 24)
      latestDate = latestDate.valueOf() / (1000 * 60 * 60 * 24)
    }
    let rect = {
      name: `T${name}`,
      type: "scatter",

      markArea: {
        silent: true,
        itemStyle: {
          color: this.returnTurboColorFromIndexInList(timePoint, 5),
          opacity: 0.1,
          borderWidth: 1,
          borderType: "dashed"
        },
        label: {
          position: "bottom",
          show: true,
          formatter: `T${name}`
        },
        data: [
          [
            {
              name: `T${name}`,
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

  handleTimePointClustersChange = (timePointClusters, echartsOptions) => {
    console.log("timePointClusters", timePointClusters)
    let newShapes = []
    let length = timePointClusters.length
    timePointClusters.forEach((cluster, index) => {
      let rect = this.createRectFromTimePoint(index, length, timePointClusters, echartsOptions, cluster.name)
      newShapes.push(rect)
    })

    let newTimePoints = this.updateTimePoints(timePointClusters)
    if (newTimePoints.length === timePointClusters.length) {
      // Get last time point
      let lastElement = newTimePoints[newTimePoints.length - 1]
      let lastTimePoint = lastElement.value

      this.range(lastTimePoint, 1).forEach((timePoint) => {
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
    this.setState({ timePoints: newTimePoints, shapes: newShapes })
  }

  range(size, startAt) {
    return [...Array(size).keys()].map((i) => i + startAt)
  }

  updateTimePoints = (timePointClusters) => {
    let newTimePoints = new Set([1])
    timePointClusters.forEach((cluster) => {
      newTimePoints.add(cluster.name)
    })
    console.log("newTimePoints", newTimePoints)
    let newTimePointsArray = []
    newTimePoints.forEach((timePoint) => {
      newTimePointsArray.push({ label: timePoint, value: timePoint })
    })
    return newTimePointsArray
  }

  /**
   *
   * @param {MEDprofiles.list_MEDtab.MEDtab} tabObject
   * @param {String} className
   * @returns {boolean}
   *
   * @description
   * This functions returns true if the className attribute in MEDtab object is not null.
   */
  isNotNull(tabObject, className) {
    let attributes = Object.keys(tabObject[className])
    let toRet = false
    attributes.forEach((attribute) => {
      if (tabObject[className][attribute] !== null) {
        toRet = true
      }
    })
    return toRet
  }

  getTimeZeroForClass = (className, profileIndex) => {
    let timeZeroAttribute = null
    if (className === null) return null
    this.state.jsonData?.list_MEDprofile[profileIndex]?.list_MEDtab?.forEach((tab) => {
      let attributes = Object.keys(tab)
      let attributeIndex = attributes.indexOf(className)
      if (attributeIndex !== -1) {
        let attribute = attributes[attributeIndex]
        if (attribute !== "Date" && attribute !== "Time_point" && this.isNotNull(tab, attribute)) {
          if (attribute === this.state.relativeTime && timeZeroAttribute === null && tab.Date !== null) {
            return (timeZeroAttribute = tab.Date)
          }
        }
      } else {
        console.log("Attribute not found", className, attributes)
      }
    })
    return timeZeroAttribute
  }

  handleSetTimePointByClass = () => {
    console.log("selectedClassesToSetTimePoint", this.state.selectedClassesToSetTimePoint)
    let newJsonData = { ...this.state.jsonData }
    newJsonData.list_MEDprofile.forEach((profile) => {
      profile.list_MEDtab.forEach((tab) => {
        let attributes = Object.keys(tab)
        attributes.forEach((attribute) => {
          if (attribute !== "Date" && attribute !== "Time_point" && this.isNotNull(tab, attribute)) {
            if (this.state.selectedClassesToSetTimePoint.includes(attribute)) {
              if (tab.Time_point === null) {
                tab.Time_point = [this.state.timePoint]
              } else {
                tab.Time_point.push(this.state.timePoint)
              }
            }
          }
        })
      })
    })
    this.setState({ jsonData: newJsonData })
  }

  generateEchartsOptions = () => {
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
          axisPointer: {
            snap: true
          },
          type: (this.state.relativeTime !== null && "value") || "time"
        }
      ],
      yAxis: [
        {
          axisPointer: {
            snap: true
          },
          type: "category",
          data: []
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
      },
      brush: {
        toolbox: ["lineX", "clear"],
        seriesIndex: "all",
        xAxisIndex: "all",
        yAxisIndex: "all",
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
      ]

      // visualMap: {}
    }
    // console.log("this.state.jsonData", this.state.jsonData)
    let patientNames = new Set()
    let innerYClasses = new Set()
    let newClasses = new Set()
    let timeZeroAttribute = 0
    let newTimePointsClusters = []
    let numberOfPatients = this.state.jsonData?.list_MEDprofile?.length
    this.state.jsonData?.list_MEDprofile?.forEach((profile, index) => {
      if (profile.PatientID !== "32379" && profile.PatientID !== "25881" && profile.PatientID !== "21690" && profile.PatientID !== "18089") {
        const color = d3.interpolateTurbo(this.state.jsonData.list_MEDprofile.indexOf(profile) / this.state.jsonData.list_MEDprofile.length)
        patientNames.add(profile.PatientID)
        let profileSerie = { type: "scatter", data: [], name: profile.PatientID, itemStyle: { color: color }, symbolSize: 5, emphasis: { focus: "series" }, selectMode: "multiple" }
        let profileRandomTime = index
        let profilAttributeTimeZero = this.getTimeZeroForClass(this.state.relativeTime, index)
        profile?.list_MEDtab?.forEach((tab) => {
          let attributes = Object.keys(tab)
          attributes.forEach((attribute) => {
            newClasses.add(attribute)
            if (attribute !== "Date") {
              if (attribute === this.state.relativeTime && timeZeroAttribute === null) {
                timeZeroAttribute = tab.Date
              }
              let newDate = new Date(tab.Date)
              if (profilAttributeTimeZero !== null) {
                newDate = new Date(new Date(tab.Date) - new Date(profilAttributeTimeZero))
              }
              if (this.state.separateHorizontally) {
                newDate = Date.parse(newDate + profileRandomTime)
              }
              let x, y
              if (attribute !== "Time_point" && this.isNotNull(tab, attribute)) {
                if (this.state.relativeTime !== null) {
                  x = newDate.valueOf() / (1000 * 60 * 60 * 24)
                  if (this.state.separateHorizontally) {
                    x = x + profileRandomTime / (numberOfPatients * 2)
                  }
                } else {
                  x = newDate
                }
                if (this.state.separateVertically) {
                  y = attribute + profileRandomTime
                  innerYClasses.add(attribute + profileRandomTime)
                } else {
                  y = attribute
                  innerYClasses.add(attribute)
                }
                profileSerie.data.push([x, y])
              } else if (attribute === "Time_point") {
                let timePoints = tab[attribute]
                if (timePoints === null) return
                timePoints.forEach((timePoint) => {
                  if (newTimePointsClusters[timePoint] === undefined || newTimePointsClusters[timePoint] === null) {
                    newTimePointsClusters[timePoint] = { x: [], y: [], mode: "lines", type: "scatter", marker: { color: color }, text: [], name: timePoint, customdata: [], fill: "toself" }
                  }
                  newTimePointsClusters[timePoint].x.push(newDate)
                  if (this.state.separateVertically) {
                    newTimePointsClusters[timePoint].y.push(attribute + profileRandomTime)
                  } else {
                    newTimePointsClusters[timePoint].y.push(attribute)
                  }
                })
              }
            }
          })
        })
        newEchartsOption.series.push(profileSerie)
      }
    })
    newEchartsOption.yAxis[0].data = [...innerYClasses]
    newEchartsOption.legend.data = [...patientNames]
    let correctedTimePointClusters = []
    Object.keys(newTimePointsClusters).forEach((key) => {
      correctedTimePointClusters.push(newTimePointsClusters[key])
    })
    this.handleTimePointClustersChange(correctedTimePointClusters, newEchartsOption)

    this.setState({ echartsOptions: newEchartsOption })
    this.setState({ timePointClusters: correctedTimePointClusters })
    this.setState({ classes: newClasses })
  }

  removeTimePointFromJsonData = (timePoint) => {
    let newJsonData = { ...this.state.jsonData }
    console.log("timepoint to remove", timePoint)
    newJsonData.list_MEDprofile.forEach((profile) => {
      profile.list_MEDtab.forEach((tab) => {
        if (tab.Time_point === null || tab.Time_point === undefined || tab.Time_point.length === 0) return
        console.log("REMOVE TAB", tab.Time_point, timePoint, tab.Time_point.includes(parseInt(timePoint)))
        if (tab.Time_point.includes(parseInt(timePoint))) {
          let timePointIndex = tab.Time_point.findIndex((timePointElement) => timePointElement === timePoint)
          tab.Time_point.splice(timePointIndex, 1)
        }
      })
    })
    let newShapes = [...this.state.shapes]
    console.log("newJsonData", newJsonData)
    this.state.shapes.forEach((shape) => {
      if (shape.name === `T${timePoint}`) {
        let shapeIndex = newShapes.findIndex((shapeElement) => shapeElement.name === `T${timePoint}`)
        newShapes.splice(shapeIndex, 1)
      }
    })
    console.log("newShapes", newShapes, this.state.shapes, this.state.shapes.length, newShapes.length)
    this.setState({ shapes: newShapes, jsonData: newJsonData }, () => {
      this.generateEchartsOptions()
      let newEchartsOptions = { ...this.state.echartsOptions }
      newEchartsOptions.series = [...this.state.echartsOptions.series, ...newShapes]

      this.chartRef.current.getEchartsInstance().setOption(newEchartsOptions, { notMerge: true })
      console.log("newEchartsOptions", newEchartsOptions, this.chartRef.current.getEchartsInstance().getOption())
    })
  }

  getClassesOptions = () => {
    let thisClasses = this.state.classes
    if (thisClasses === null) return []
    if (thisClasses.size === 0) return []
    let classesArray = []
    thisClasses.forEach((className) => {
      if (className !== "Date" && className !== "Time_point") {
        classesArray.push({ label: className, value: className })
      }
    })
    classesArray.sort((a, b) => (a.label > b.label ? 1 : -1))
    return classesArray
  }

  getFindPatientFunction = (patientId) => {
    return (patient) => {
      return patient.PatientID === patientId
    }
  }

  handleSetTimePoint = () => {
    console.log("SETTINT TIMEPOINT", this.state.timePoint)
    console.log("selectedData", this.state.selectedData, this.state.jsonData.list_MEDprofile)
    let newJsonData = { ...this.state.jsonData }
    /*
    selectedData: [
      {
        seriesId: '\x001693\x000',
        seriesName: '1693',
        seriesIndex: 0, 
        dataIndex: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
      }, 
      ...
    ]
    */

    this.state.selectedData.forEach((data, seriesIndex) => {
      let seriesName = data.seriesName
      let profileIndex = newJsonData.list_MEDprofile.findIndex(this.getFindPatientFunction(seriesName))
      let profile = newJsonData.list_MEDprofile[profileIndex]
      let selectedPoints = data.dataIndex
      console.log("selectedPoints", selectedPoints, profile, this.state.echartsOptions.series[seriesIndex])
      if (profile === undefined) return
      let correspondingData = this.state.echartsOptions.series[seriesIndex].data
      let onlySelectedData = []
      correspondingData.forEach((dataPoint, index) => {
        if (selectedPoints.includes(index)) {
          onlySelectedData.push(dataPoint)
        }
      })
      console.log("onlySelectedData", onlySelectedData)
      let patientGlobalIndex = 0
      profile.list_MEDtab.forEach((tab) => {
        let attributes = Object.keys(tab)
        attributes.forEach((attribute) => {
          if (attribute !== "Date" && attribute !== "Time_point" && this.isNotNull(tab, attribute)) {
            if (selectedPoints.includes(patientGlobalIndex)) {
              console.log("patientGlobalIndex", patientGlobalIndex, tab, attribute)
              if (tab.Time_point === null) {
                tab.Time_point = [this.state.timePoint]
              } else {
                if (!tab.Time_point.includes(this.state.timePoint)) {
                  tab.Time_point.push(this.state.timePoint)
                }
              }
            }
            patientGlobalIndex += 1
          }
        })
      })
    })
    this.setState({ jsonData: newJsonData })
  }

  handleSelectData = (data) => {
    // console.log("data", data.batch["0"].selected)
    this.setState({ selectedData: data.batch["0"].selected })
  }

  handleExportTimePoints = () => {
    const { jsonData } = this.state
    let newJsonData = { ...jsonData }
    let timePointsData = {}
    console.log("jsonData", newJsonData)
    newJsonData.list_MEDprofile.forEach((profile) => {
      profile.list_MEDtab.forEach((tab) => {
        if (tab.Time_point !== null) {
          if (tab.Time_point.length !== 0) {
            tab.Time_point.forEach((timePoint) => {
              if (timePointsData[timePoint] === undefined) {
                timePointsData[timePoint] = []
              }
              // Remove the time point from the tab
              delete tab.Time_point
              let attributes = Object.keys(tab)
              attributes.forEach((attribute) => {
                if (attribute !== "Date" && attribute !== "Time_point" && this.isNotNull(tab, attribute)) {
                  if (timePointsData[timePoint][attribute] === undefined) {
                    timePointsData[timePoint][attribute] = []
                  }
                  timePointsData[timePoint][attribute].push({ Date: tab.Date, ID: profile.PatientID, ...tab[attribute] })
                }
              })
            })
          }
        }
      })
    })
    console.log("timePointsData", timePointsData)
    let separator = MedDataObject.getPathSeparator()
    let folderPath = this.props.jsonFilePath.split(separator)
    let fileBaseName = folderPath.pop()
    folderPath = folderPath.join(separator)
    folderPath = folderPath + separator + "timePoints" + separator
    console.log("folderPath", folderPath, fileBaseName)
    MedDataObject.createFolderFromPath(folderPath)
    Object.keys(timePointsData).forEach((timePoint) => {
      let localFolderPath = folderPath + "T" + timePoint + separator
      MedDataObject.createFolderFromPath(localFolderPath)
      this.timePointToCsv(timePoint, timePointsData[timePoint], localFolderPath)
    })
  }

  timePointToCsv = (timePoint, timePointData, folderPath) => {
    // eslint-disable-next-line no-undef
    const dfd = require("danfojs-node")
    console.log("timePointData", timePointData, dfd)
    if (timePointData === undefined) return
    if (Object.keys(timePointData).length >= 1) {
      Object.keys(timePointData).forEach((attribute) => {
        let filePath = folderPath + "T" + timePoint + "_" + attribute + ".csv"
        let dfData = new dfd.DataFrame(timePointData[attribute])
        try {
          dfd.toCSV(dfData, { filePath: filePath })
        } catch (error) {
          console.log("error", error)
        } finally {
          toast.success(`Time point ${timePoint} exported to ${filePath}`)
        }
      })
      return
    }
  }

  render() {
    // Destructure state and props for easier access
    const { selectedClass, relativeTime, separateVertically, separateHorizontally, selectedClassesToSetTimePoint, shapes, timePoints, timePoint, timePointClusters, echartsOptions } = this.state
    let newEchartsOption = { ...echartsOptions }
    if (echartsOptions !== null) {
      newEchartsOption.series = [...echartsOptions.series, ...shapes]
    }

    return (
      <>
        <Row style={{ width: "100%", justifyContent: "center" }}>
          <Col lg={8} className="center">
            <div className="MEDcohort-figure" style={{ display: "flex", flexDirection: "column", boxShadow: "2px 2px 4px rgba(0, 0, 0, 0.25)" }}>
              {echartsOptions && <ReactECharts ref={this.chartRef} option={newEchartsOption} onEvents={{ brushselected: this.handleSelectData }} style={{ width: "100%", height: "100%" }} lazyUpdate={false} />}
            </div>
          </Col>

          <Col lg={4} style={{ display: "flex", flexDirection: "column", justifyContent: "space-evenly" }}>
            <Row className="justify-content-md-center medprofile-buttons" style={{ display: "flex", flexDirection: "row", alignContent: "center", alignItems: "center", width: "100%", justifyContent: "center", boxShadow: "2px 2px 4px rgba(0, 0, 0, 0.25)", padding: "1rem", borderRadius: "1rem" }}>
              <Col xxl="6" style={{ display: "flex", flexDirection: "row", justifyContent: "center", marginBottom: "1rem" }}>
                <ToggleButton className="separate-toggle-button" checked={separateHorizontally} onChange={(e) => this.setState({ separateHorizontally: e.value })} onLabel="Overlap horizontally" offLabel="Separate horizontally" onIcon="pi pi-check" offIcon="pi pi-times" />
              </Col>
              <Col xxl="6" style={{ display: "flex", flexDirection: "row", justifyContent: "center", marginBottom: "1rem" }}>
                <ToggleButton className="separate-toggle-button" checked={separateVertically} onChange={(e) => this.setState({ separateVertically: e.value })} onLabel="Overlap vertically" offLabel="Separate vertically" onIcon="pi pi-check" offIcon="pi pi-times" />
              </Col>
              <Col style={{ display: "flex", flexDirection: "row", justifyContent: "center", marginBottom: "1rem" }}>
                <Button size="small" label="Clear annotations" onClick={() => this.setState({ annotations: [] })} />
              </Col>
              <Col style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
                <label htmlFor="dd-city">Select the class for relative time</label>
                <Col style={{ display: "flex", flexDirection: "row", justifyContent: "center", marginTop: "0rem" }}>
                  <div style={{ width: "100%" }} className="p-inputgroup ">
                    <Dropdown style={{ width: "100%" }} value={selectedClass} options={this.getClassesOptions()} onChange={(e) => this.setState({ selectedClass: e.value })} />
                    <ToggleButton
                      className={`relative-time-toggle-button ${relativeTime !== null ? "p-button-success" : "p-button-info"}`}
                      checked={relativeTime === null}
                      onLabel="Set"
                      offLabel="Unset"
                      onChange={() => {
                        if (relativeTime === null) {
                          this.setState({ relativeTime: selectedClass })
                        } else {
                          this.setState({ relativeTime: null })
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
                    <Dropdown style={{ width: "100%" }} value={timePoint} options={timePoints} onChange={(e) => this.setState({ timePoint: e.value })} />
                    <Button className="separate-toggle-button" style={{ borderRadius: "0 4px 4px 0", width: "5rem", padding: "0rem" }} onClick={this.handleSetTimePoint} label={`Set T${timePoint}`} />
                  </div>
                </Col>
              </Col>
              <Col style={{ display: "flex", flexDirection: "column", justifyContent: "center", marginTop: "1rem" }}>
                <label htmlFor="dd-city">Set time points by classes</label>
                <Col style={{ display: "flex", flexDirection: "row", justifyContent: "center", marginTop: "0rem" }}>
                  <div style={{ width: "100%" }} className="p-inputgroup ">
                    {/* <Dropdown style={{ width: "100%" }} value={selectedClassesToSetTimePoint} options={this.getClassesOptions()} onChange={(e) => this.setState({ selectedClassesToSetTimePoint: e.value })} /> */}
                    <MultiSelect style={{ width: "100%" }} value={selectedClassesToSetTimePoint} options={this.getClassesOptions()} onChange={(e) => this.setState({ selectedClassesToSetTimePoint: e.value })} />
                    <Button className="separate-toggle-button" style={{ borderRadius: "0 4px 4px 0", width: "5rem", padding: "0rem" }} onClick={this.handleSetTimePointByClass} label={`Set T${timePoint}`} />
                  </div>
                </Col>
              </Col>
              <Col style={{ display: "flex", flexDirection: "column", justifyContent: "center", marginTop: "1rem", alignItems: "flex-start", flex: "unset" }}>
                {this.state.timePointClusters.length !== 0 && (
                  <>
                    <label htmlFor="">
                      <b>
                        <u>Time Points associated data</u>
                      </b>
                    </label>
                    {this.state.timePointClusters.map((cluster, index) => {
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
                              onClick={() => {
                                let newTimePointsClusters = deepCopy(timePointClusters)
                                newTimePointsClusters.splice(index, 1)
                                let newTimePoints = deepCopy(timePoints)
                                let indexOfTimePoint = newTimePoints.findIndex((timePoint) => timePoint.value === cluster.name)
                                console.log("indexOfTimePoint", indexOfTimePoint)
                                if (indexOfTimePoint !== -1 && cluster.name !== 1) {
                                  newTimePoints.splice(indexOfTimePoint, 1)
                                }
                                this.setState({ timePoints: newTimePoints })
                                this.setState({ timePointClusters: newTimePointsClusters })
                                this.removeTimePointFromJsonData(cluster.name)
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
              <Col style={{ display: "flex", flexDirection: "column", justifyContent: "center", marginTop: "1rem", alignItems: "flex-start", flex: "unset" }}>
                <Button label="Export timepoints to CSVs" disabled={timePoints.length <= 1} onClick={this.handleExportTimePoints} />
              </Col>
            </Row>
          </Col>
        </Row>
      </>
    )
  }
}

export default MEDcohortFigureClass
