export const nodeInformation = ["Node%", "Population%", "Mean Confidence Level", "Positive%"]
export const shiftInformation = ["Shift Probability", "Test Statistic"]
// Function to format numbers with three decimal places
export const formatValue = (value) => {
  if (!value) return null
  if (typeof value === "number" && !Number.isInteger(value)) {
    value = value.toFixed(3)
  }
  return value.toString()
}
export const filterData = (data, treeParams, nodeParams) => {
  let filteredData = []
  if (!data) return data
  // Iterate over the top-level keys
  for (const topKey in data) {
    const topLevel = data[topKey]

    // Check if the top-level key meets the minSamplesRatio condition
    if (parseInt(topKey) === treeParams.minSamplesRatio) {
      // Iterate over the second-level keys
      for (const subKey in topLevel) {
        // Check if the sub-level key meets the declarationRate condition
        if (parseInt(subKey) === treeParams.declarationRate) {
          // Apply additional filtering based on maxDepth
          const filteredItems = topLevel[subKey].filter((item) => item.path.length <= treeParams.maxDepth)
          filteredData = filteredData.concat(filteredItems)
        }
      }
    }
  }

  // Further filter the items based on nodeParams.focusView
  filteredData = filteredData.map((item) => {
    const newItem = { id: item.id, path: item.path } // Keep id and path
    newItem.className = ""
    let customThreshold = nodeParams.customThreshold

    if (nodeParams.focusView === "Node information") {
      // Remove metrics and detectron_results
      newItem.nodeInformation = item["node information"]

      if (parseFloat(newItem.nodeInformation[nodeParams.selectedParameter]) >= customThreshold) {
        console.log("bilalou:", newItem.nodeInformation[nodeParams.selectedParameter])
        newItem.className = "panode-threshold"
      }
      return newItem
    } else if (nodeParams.focusView === "Covariate-shift probabilities") {
      // Keep only detectron_results
      newItem.detectronResults = {}
      if (item.detectron_results && item.detectron_results["Tests Results"]) {
        // eslint-disable-next-linecamelcase, camelcase
        newItem.className = "with-icon-success"
        // eslint-disable-next-line camelcase
        const shiftInfo = item.detectron_results["Tests Results"].find((elem) => elem.Strategy === nodeParams.detectronStrategy)

        newItem.detectronResults = { "Shift Probability": shiftInfo.shift_probability, "Test Statistic": shiftInfo.test_statistic }
        if (parseFloat(newItem.detectronResults[nodeParams.selectedParameter]) >= customThreshold / 100) {
          newItem.className += "panode-threshold"
        }
      } else {
        // Handle the case where item.detectron_results['Tests Results'] is null or undefined
        newItem.className = "with-icon-fail"
        newItem.detectronResults = null // Or set to some default value or handle the absence accordingly
      }
      return newItem
    } else {
      // Keep only the metrics defined in nodeParams.metrics
      newItem.metrics = {}

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
export const filterLost = (data, treeParams) => {
  // Iterate over the top-level keys of the 'data' object
  if (!data) return data
  for (const topKey in data) {
    const topLevel = data[topKey]

    // Check if the top-level key matches 'treeParams.minSamplesRatio'
    if (parseInt(topKey) === treeParams.minSamplesRatio) {
      return [topLevel]
    }
  }

  return null
}

export const filterUniqueLostProfiles = (data) => {
  // Initialize a Map to store unique objects based on id
  let uniqueEntries = new Set()

  // Get the array of objects for the current key
  let entries = data[0]

  // Iterate over each key in entries in reverse order
  Object.keys(entries)
    .reverse()
    .forEach((key) => {
      // Track seen ids for the current key

      // Filter and update the array entries[key]
      entries[key] = entries[key].filter((obj) => {
        let id = obj.id // Extract id from the object

        if (!uniqueEntries.has(id)) {
          // If id hasn't been seen before, mark it as seen and add the object to uniqueEntries
          uniqueEntries.add(id)

          return true // Keep the object in entries[key]
        }
        return false // Filter out the duplicate object from entries[key]
      })
    })

  // Return the modified entries array

  return entries
}

export const filterMetrics = (data, nodeParams) => {
  if (!data) {
    return data // Return original data if it's null or undefined
  }

  let filteredData = Object.keys(data).map((key) => {
    const item = data[key]
    if (item.metrics) {
      // Filter item.metrics based on nodeParams.metrics
      const filteredMetrics = Object.keys(item.metrics)
        .filter((metricKey) => {
          return nodeParams.metrics.some((nameObj) => nameObj.name === metricKey)
        })
        .reduce((obj, key) => {
          obj[key] = item.metrics[key]
          return obj
        }, {})

      return {
        ...item,
        metrics: filteredMetrics
      }
    } else {
      return item // Return item as-is if metrics are not present
    }
  })

  return filteredData
}
