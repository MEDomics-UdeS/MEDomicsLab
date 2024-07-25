/**
 * JavaScript file containing utility functions and variables used across multiple tabs.
 *
 * Functions and variables in this file are intended to be reused in different tab components
 * to ensure consistency and reduce code duplication.
 */

import { loadJsonPath } from "../../../utilities/fileManagementUtils"
import chroma from "chroma-js"
import fs from "fs"
import path from "path"
export const nodeInformation = ["Node%", "Population%", "Mean confidence level", "Positive%"] //Static Node information
export let shiftInformation = [] //Dynamic Shift Information (Depends on Detectron Strategy)

/**
 *
 *
 * @param {number | string | null} value The value to format. Can be a number, a string, or null.
 * @returns {string | null} The formatted value as a string or null if the input is null.
 *
 *
 * @description
 * The function formats the given value as a string.
 */
export const formatValue = (value) => {
  if (value === null) return null
  if (typeof value === "number" && !Number.isInteger(value)) {
    value = value.toFixed(3)
  }
  return value.toString()
}

/**
 *
 * @param {Object} obj The object to check.
 * @returns {boolean} Returns true if the object is "lost" (i.e., does not contain profile information); otherwise, false.
 *
 *
 * @description
 * The function checks if the given object is considered "lost" based on its properties.
 * - An object is considered "lost" if it does not have any of the following properties:
 *   - "nodeInformation"
 *   - "detectronResults"
 *   - "metrics"
 */
export const isLost = (obj) => {
  return !(
    obj &&
    (Object.prototype.hasOwnProperty.call(obj, "nodeInformation") || Object.prototype.hasOwnProperty.call(obj, "detectronResults") || Object.prototype.hasOwnProperty.call(obj, "metrics"))
  )
}
/**
 *
 * @param {string} dirPath The path to the directory containing JSON files.
 * @returns {Object} The returned JSON Object
 *
 * @description
 * The function loads JSON files from a specified directory and returns their contents.
 */
export const loadJsonFiles = async (dirPath) => {
  if (!dirPath) return {}

  const readJsonFiles = (currentPath) => {
    let filenames
    try {
      filenames = fs.readdirSync(currentPath)
    } catch (error) {
      console.error("Error reading directory:", error)
      return {}
    }

    return filenames.reduce((acc, filename) => {
      const fullPath = path.join(currentPath, filename)
      if (filename.endsWith(".json")) {
        const fileContent = loadJsonPath(fullPath)
        if (fileContent) {
          acc[filename.replace(".json", "")] = fileContent
        }
      }
      return acc
    }, {})
  }

  try {
    const loadedFiles = readJsonFiles(dirPath)

    return loadedFiles
  } catch (error) {
    console.error("Error loading JSON files:", error)
    return {}
  }
}
/**
 *
 * @param {number} value The value for which to generate a color. Should be between 0 and `max`.
 * @param {number} max The maximum value for scaling the color. Defines the end of the color scale range.
 * @returns {string} The hex color code corresponding to the provided value.
 *
 * @description
 * The function generates a color based on a value within a specified range using chroma.js.
 */
function getColor(value, max) {
  // Define a color scale from red to green
  const scale = chroma.scale(["red", "yellow", "green"]).domain([0, max])
  return scale(value).hex()
}
/**
 *
 * @param {number} step The interval between range values, representing percentages (e.g., 10, 20, etc.).
 * @returns {Array<Object>} - An array of range objects, each containing a description, minimum value, and color.
 *
 * @description
 * The function creates ranges from 0% to 100% with intervals defined by the `step` parameter.
 * It returns an array of these range objects, useful for visualizing data with a gradient scale.
 */
export function calculateRanges(step) {
  const ranges = []
  const total = 100

  // If step is greater than or equal to 50, create two intervals
  if (step >= 50 && step < 100) {
    ranges.push({
      description: `0%`,
      rangemin: 0,
      rangemax: step,

      color: getColor(0, total) // Color for the first interval
    })

    ranges.push({
      description: `${step}%`,
      rangemin: step,
      rangemax: total,

      color: getColor(total, total) // Color for the second interval
    })
  } else if (step === 100) {
    ranges.push({
      description: `${0}%`,
      rangemin: 0,
      rangemax: total,

      color: getColor(0, total) // Color for the second interval
    })
  } else {
    // For step values less than 50, create intervals based on the step value
    for (let i = 0; i < total; i += step) {
      const next = Math.min(i + step, total)

      ranges.push({
        description: i % 10 === 0 ? `${i}%` : null,
        rangemin: i,
        rangemax: next,

        color: getColor(i, total)
      })
    }
  }
  // Ensure the final range covers the last interval up to 100%
  ranges.push({
    description: "100%"
  })

  return ranges
}
/**
 *
 * @param {number} nodeInf The value to be checked against the range intervals.
 * @param {number} step The interval size used to define the range boundaries.
 * @returns {Object|undefined} The range object that matches the value, or `undefined` if no match is found.
 *
 *
 * @description
 *  The function retrieves the range object that corresponds to a given value based on the defined step intervals.
 */
export function getRange(nodeInf, step) {
  const ranges = calculateRanges(step)

  const range = ranges.find((range) => {
    const condition = range.rangemin <= nodeInf && nodeInf <= range.rangemax

    return condition
  })

  return range
}

/**
 *
 * @param {Array} data The data to be filtered and formatted.
 * @param {Array} lostData The data representing lost items.
 * @param {Object} nodeParams Node Parameters used for filtering and formatting the data.
 * @param {number} maxDepth The maximum depth for Profiles Tree
 * @returns {Array} The filtered and formatted data.
 *
 *
 * @description
 * The function creates deep copies of `data` and `lostData`, and filters them based on `maxDepth`.
 * Further filters and formats items based on `nodeParams.focusView`:
 *   - **Node information**: Adds node information and colors based on the selected parameter's value.
 *   - **Covariate-shift probabilities**: Adds detectron results, calculates probabilities, and colors based on the selected parameter.
 *   - **Metrics**: Adds metrics information and colors based on the selected parameter's value.
 */
export const filterData = (data, lostData, nodeParams, maxDepth) => {
  if (!data) return data

  // Create deep copies of data and lostData
  let dataCopy = JSON.parse(JSON.stringify(data))
    .map((item) => ({
      ...item,
      className: ""
    }))
    .filter((item) => item.path.length <= parseInt(maxDepth))
  let lostDataCopy = JSON.parse(JSON.stringify(lostData))
    .map((item) => ({
      ...item,
      className: "panode-lost"
    }))
    .filter((item) => item.path.length <= parseInt(maxDepth))

  let filteredData = [...dataCopy, ...lostDataCopy]

  // Further filter the items based on nodeParams.focusView
  filteredData = filteredData.map((item) => {
    const newItem = { id: item.id, path: item.path, className: item.className }
    let customThreshold = nodeParams.customThreshold

    if (nodeParams.focusView === "Node information") {
      if (item.className === "panode-lost") return newItem
      newItem.nodeInformation = item["node information"]
      if (parseFloat(newItem.nodeInformation[nodeParams.selectedParameter])) {
        newItem.className = getRange(parseFloat(newItem.nodeInformation[nodeParams.selectedParameter]), customThreshold).color
      }
      return newItem
    } else if (nodeParams.focusView === "Covariate-shift probabilities") {
      newItem.detectronResults = {}
      if (item.detectron_results && item.detectron_results["Tests Results"]) {
        newItem.className = "with-icon-success"
        const shiftInfo = item.detectron_results["Tests Results"].find((elem) => elem.Strategy === nodeParams.detectronStrategy)
        if (item.className === "panode-lost") return newItem

        // Filter keys containing "value", "statistic", or "probability"
        const filteredKeys = Object.keys(shiftInfo).filter((key) => key.toLowerCase().includes("value") || key.toLowerCase().includes("statistic") || key.toLowerCase().includes("probability"))

        // Construct newItem.detectronResults with filtered keys
        newItem.detectronResults = {}
        shiftInformation = []
        newItem.detectronResults["sample_size"] = item.detectron_results["Tested Profile size"]
        filteredKeys.forEach((key) => {
          // Check if the key includes "probability" or "value"
          if (key.toLowerCase().includes("probability")) {
            // Transform key to "stability percentage"
            let transformedKey = key.toLowerCase().includes("probability") ? "Stability%" : key

            // Calculate and assign the transformed value
            newItem.detectronResults[transformedKey] = ((1 - shiftInfo[key]) * 100).toFixed(2)

            // Push transformed key to shiftInformation array
            shiftInformation.push(transformedKey)
          } else if (key.toLowerCase().includes("value")) {
            newItem.detectronResults[key] = shiftInfo[key]
            shiftInformation.push(key)
          }
        })

        if (parseFloat(newItem.detectronResults[nodeParams.selectedParameter])) {
          if (nodeParams.selectedParameter.includes("value")) {
            newItem.className = getRange(parseFloat(newItem.detectronResults[nodeParams.selectedParameter]) * 100, customThreshold).color
          } else {
            newItem.className = getRange(parseFloat(newItem.detectronResults[nodeParams.selectedParameter]), customThreshold).color
          }
        }
      } else {
        newItem.className = "with-icon-fail"
        newItem.detectronResults = null
      }
      return newItem
    } else {
      newItem.metrics = {}
      if (item.className === "panode-lost") return newItem
      for (const metric of nodeParams.metrics) {
        if (item.metrics) {
          newItem.metrics[metric.name] = item.metrics[metric.name] !== null ? item.metrics[metric.name] : "-"
        }
      }
      if (parseFloat(newItem.metrics[nodeParams.selectedParameter]) || newItem.metrics[nodeParams.selectedParameter] === 0) {
        newItem.className = getRange(parseFloat(newItem.metrics[nodeParams.selectedParameter]) * 100, customThreshold).color
      }
      return newItem
    }
  })

  return filteredData
}

/**
 *
 * @param {Array} path1 The first path to be checked.
 * @param {Array} path2 The second path to be checked against.
 * @returns {boolean}  `true` if `path1` is a subpath of `path2`, otherwise `false`.
 *
 *
 * @description
 * The function checks if `path1` is a subpath of `path2`.
 */
export const isSubPath = (path1, path2) => {
  if (path1.length > path2.length) {
    return false
  }
  for (let i = 0; i < path1.length; i++) {
    if (path1[i] !== path2[i]) {
      return false
    }
  }
  return true
}

/**
 *
 * @param {Object} data The data object containing arrays of lost profiles.
 * @returns {Object|null} The filtered data object with unique lost profiles, or `null` if the input is falsy.
 *
 *
 * @description
 * The function filters out duplicate entries in `data` based on their `id`.
 */
export const filterUniqueLostProfiles = (data) => {
  if (!data) return null

  const dataCopy = JSON.parse(JSON.stringify(data))
  let uniqueEntries = new Set()

  Object.keys(dataCopy)
    .reverse()
    .forEach((key) => {
      dataCopy[key] = dataCopy[key].filter((obj) => {
        let id = obj.id
        if (!uniqueEntries.has(id)) {
          uniqueEntries.add(id)
          return true
        }
        return false
      })
    })

  return dataCopy
}

/**
 *
 * @param {Object} data The data object containing metrics to be filtered.
 * @param {Object} nodeParams The parameters used to filter the metrics.
 * @returns {Object} The filtered data object with metrics based on the provided criteria.
 *
 *
 * @description
 * The function filters metrics based on `nodeParams.metrics`:
 *   - If `nodeParams.metrics` is provided, it includes only those metrics specified.
 *   - If `nodeParams.metrics` is not provided, it includes only a predefined set of metrics, excluding "LogLoss".
 */
export const filterMetrics = (data, nodeParams) => {
  if (!data) return data

  const dataCopy = JSON.parse(JSON.stringify(data))
  const filteredData = Object.keys(dataCopy).map((key) => {
    const item = dataCopy[key]
    if (item.metrics) {
      let filteredMetrics
      if (nodeParams.metrics) {
        filteredMetrics = Object.keys(item.metrics)
          .filter((metricKey) => {
            return nodeParams.metrics.some((nameObj) => nameObj.name === metricKey)
          })
          .reduce((obj, key) => {
            obj[key] = item.metrics[key]
            return obj
          }, {})
      } else {
        // nodeParams.metrics is falsy, so exclude "logLoss"
        const initMetrics = ["Auc", "Accuracy", "Recall", "F1Score"]
        filteredMetrics = Object.keys(item.metrics)
          .filter((metricKey) => initMetrics.includes(metricKey) && metricKey !== "LogLoss")
          .reduce((obj, key) => {
            obj[key] = item.metrics[key]
            return obj
          }, {})
      }

      return { ...item, metrics: filteredMetrics }
    }
    return item
  })

  return filteredData
}
