export const nodeInformation = ["Node%", "Population%", "Mean confidence level", "Positive%"]
export const shiftInformation = ["Shift Probability", "Test Statistic"]

// Function to format numbers with three decimal places
export const formatValue = (value) => {
  if (value === null) return null
  if (typeof value === "number" && !Number.isInteger(value)) {
    value = value.toFixed(3)
  }
  return value.toString()
}

export const isLost = (obj) => {
  return !(
    obj &&
    (Object.prototype.hasOwnProperty.call(obj, "nodeInformation") || Object.prototype.hasOwnProperty.call(obj, "detectronResults") || Object.prototype.hasOwnProperty.call(obj, "metrics"))
  )
}

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
      console.log("DOES IT EXIST", newItem.nodeInformation[nodeParams.selectedParameter])
      console.log("SEE HERE NODE INFORMATION", newItem.nodeInformation)

      if (parseFloat(newItem.nodeInformation[nodeParams.selectedParameter]) >= customThreshold) {
        newItem.className = "panode-threshold"
      }
      return newItem
    } else if (nodeParams.focusView === "Covariate-shift probabilities") {
      newItem.detectronResults = {}
      if (item.detectron_results && item.detectron_results["Tests Results"]) {
        newItem.className = "with-icon-success"
        const shiftInfo = item.detectron_results["Tests Results"].find((elem) => elem.Strategy === nodeParams.detectronStrategy)
        if (item.className === "panode-lost") return newItem
        newItem.detectronResults = { "Shift Probability": shiftInfo.shift_probability, "Test Statistic": shiftInfo.test_statistic }

        if (parseFloat(newItem.detectronResults[nodeParams.selectedParameter]) >= customThreshold / 100) {
          newItem.className += "panode-threshold"
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
        if (item.metrics && item.metrics[metric.name]) {
          newItem.metrics[metric.name] = item.metrics[metric.name]
        }
      }
      if (newItem.metrics[nodeParams.selectedParameter] >= customThreshold / 100) {
        newItem.className = "panode-threshold"
      }
      return newItem
    }
  })

  return filteredData
}

// Function to check if path1 is a subpath of path2
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

export const filterMetrics = (data, nodeParams) => {
  if (!data) return data

  const dataCopy = JSON.parse(JSON.stringify(data))
  const filteredData = Object.keys(dataCopy).map((key) => {
    const item = dataCopy[key]
    if (item.metrics) {
      const filteredMetrics = Object.keys(item.metrics)
        .filter((metricKey) => {
          return nodeParams.metrics.some((nameObj) => nameObj.name === metricKey)
        })
        .reduce((obj, key) => {
          obj[key] = item.metrics[key]
          return obj
        }, {})

      return { ...item, metrics: filteredMetrics }
    }
    return item
  })

  return filteredData
}
