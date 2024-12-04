import uuid from "react-native-uuid"

/**
 * @returns {string} new id
 *
 * @description
 * This function returns a new id for a node.
 */
export const getId = () => `node_${uuid.v4()}`

export const deepCopy = (obj) => (obj ? JSON.parse(JSON.stringify(obj)) : null)

/**
 *
 * @param {*} array input array
 * @returns an array without duplicates
 */
export const removeDuplicates = (array) => {
  var a = array.concat()
  for (var i = 0; i < a.length; ++i) {
    for (var j = i + 1; j < a.length; ++j) {
      if (a[i].targetId == a[j].targetId && a[i].sourceId == a[j].sourceId) a.splice(j--, 1)
    }
  }

  return a
}

/**
 * @param {Array} list1
 * @param {Array} list2
 * @returns {Array} mergedArray
 *
 * @description
 * This function merges two arrays without duplicates.
 * It uses the Set data structure to remove duplicates.
 */
export const mergeWithoutDuplicates = (list1, list2) => {
  // Create a new Set by combining both lists
  const mergedSet = new Set([...list1, ...list2])

  // Convert the Set back to an array
  const mergedArray = Array.from(mergedSet)

  return mergedArray
}
