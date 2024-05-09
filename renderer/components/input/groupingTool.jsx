import React, { useState, useEffect, useContext, useRef } from "react"
import { DataContext } from "../workspace/dataContext"
import Row from "react-bootstrap/Row"
import Col from "react-bootstrap/Col"
import { PlusSquare, XSquare, PencilSquare, Check2Square, Eraser, Fonts } from "react-bootstrap-icons"
import { Button } from "primereact/button"
import { MultiSelect } from "primereact/multiselect"
import { Chips } from "primereact/chips"
import { Chip } from "primereact/chip"
import { ColorPicker } from "primereact/colorpicker"
import { confirmPopup } from "primereact/confirmpopup"
import { TreeSelect } from "primereact/treeselect"
import { Tag } from "primereact/tag"
import { ToggleButton } from "primereact/togglebutton"
import { confirmDialog } from "primereact/confirmdialog"
import { deepCopy } from "../../utilities/staticFunctions"
import { cleanString } from "./simpleToolsUtils"
import { generateRandomColor } from "./taggingUtils"
import { Message } from "primereact/message"

/**
 * GroupingTool
 * @returns {JSX.Element}
 * @summary This component is used to group/tag the columns of selected datasets
 */
const GroupingTool = () => {
  const { globalData, setGlobalData } = useContext(DataContext) // Global data
  const firstMultiselect = useRef(null) // Reference to the first multiselect
  const secondMultiselect = useRef(null) // Reference to the second multiselect

  const [listOfDatasets, setListOfDatasets] = useState([]) // List of datasets to be displayed in the multiselect
  const [selectedDatasets, setSelectedDatasets] = useState({}) // List of selected datasets
  const [tagsDict, setTagsDict] = useState({}) // Dictionary of tags
  const [editingTag, setEditingTag] = useState(null) // Tag being edited
  const [tempTag, setTempTag] = useState("") // Temporary tag
  const [selectedNodes, setSelectedNodes] = useState(null) // Selected nodes in the tree
  const [nodes, setNodes] = useState([]) // Nodes in the tree
  const [selectedTags, setSelectedTags] = useState([]) // Selected tags
  const [tagsPresentInSelectedDatasets, setTagsPresentInSelectedDatasets] = useState([]) // Tags present in selected datasets
  // eslint-disable-next-line no-unused-vars
  const [overwrite, setOverwrite] = useState(false) // Setting to overwrite the tags already present in the datasets
  const [overwriteWasAsked, setOverwriteWasAsked] = useState(false) // Variable to know if the user was asked to overwrite the tags

  /**
   * Update the list of datasets
   * @summary This function is used to update the list of datasets
   * @returns {void}
   */
  const updateListOfDatasets = () => {
    let newDatasetList = []
    Object.keys(globalData).forEach((key) => {
      if (globalData[key].extension === "csv") {
        newDatasetList.push({ name: globalData[key].name, key: key })
      }
    })
    setListOfDatasets(newDatasetList)
  }

  /**
   * Get the columns tagging
   * @param {object} dataObject - Data object
   * @returns  {object} - Columns tagging
   */
  function getColumnsTagging(dataObject) {
    if (!dataObject?.metadata.columnsTag) {
      return {}
    } else {
      return dataObject.metadata.columnsTag
    }
  }

  /**
   * Add tags dict to tags dict
   * @param {object} tagsDictToAdd - Tags dict to add
   * @param {object} tagsDict - Tags dict
   * @returns {object} - Tags dict
   */
  function addTagsDictToTagsDict(tagsDictToAdd) {
    let newTagsDict = { ...tagsDict }
    Object.keys(tagsDictToAdd).forEach((tag) => {
      if (!newTagsDict[tag]) {
        newTagsDict[tag] = tagsDictToAdd[tag]
      }
    })
    setTagsDict(newTagsDict)
    return newTagsDict
  }

  /**
   * Get the tags dict from the data object's metadata
   * @param {object} dataObject - Data object
   * @returns  {object} - tags dict
   */
  function getDatasetTagsDict(dataObject) {
    if (dataObject.metadata.tagsDict === null || dataObject.metadata.tagsDict === undefined) {
      return {}
    } else {
      addTagsDictToTagsDict(dataObject.metadata.tagsDict)
      return dataObject.metadata.tagsDict
    }
  }

  /**
   * Get the columns from a promise
   * @param {object} dataObject - Data object
   * @returns {array} - Columns
   * @summary This function is used to get the columns from a promise - async function
   */
  async function getColumnsFromPromise(dataObject) {
    if (dataObject) {
      let promise = new Promise((resolve) => {
        resolve(dataObject.getColumnsOfTheDataObjectIfItIsATable())
      })
      let columns = await promise
      return columns
    } else {
      return []
    }
  }

  /**
   * Add tags to tags already in selected datasets
   * @param {array} tagsToAdd - Tags to add
   * @returns {object} - Tags already in selected datasets
   * @summary This function is used to add tags to tags already in selected datasets
   */
  const addTagsToTagsAlreadyInSelectedDatasets = (tagsToAdd) => {
    let newTags = { ...tagsPresentInSelectedDatasets }
    let newTagsDict = { ...tagsDict }
    tagsToAdd.forEach((tag) => {
      if (newTags[tag]) {
        newTags[tag] = [...newTags[tag], ...tagsToAdd]
      } else {
        newTags[tag] = tagsToAdd
      }
    })
    setTagsDict(newTagsDict)
    setTagsPresentInSelectedDatasets(newTags)
  }

  /**
   * Confirm danger
   * @param {object} event - Event
   * @param {function} acceptCB - Accept callback
   * @param {function} rejectCB - Reject callback
   * @param {string} message - Message
   * @returns {void}
   */
  const confirmDanger = (event, acceptCB, rejectCB, message) => {
    if (message === undefined) {
      message = "Do you want to proceed with the deletion?"
    }

    confirmPopup({
      target: event.currentTarget,
      message: message,
      icon: "pi pi-info-circle",
      acceptClassName: "p-button-danger",
      accept: acceptCB,
      reject: rejectCB
    })
  }

  /**
   * Confirm info
   * @param {object} event - Event
   * @param {function} acceptCB - Accept callback
   * @param {function} rejectCB - Reject callback
   * @param {string} message - Message
   * @returns {void}
   */
  const confirmInfo = (event, acceptCB, rejectCB, message) => {
    if (message === undefined) {
      message = "Do you want to proceed with the tagging?"
    }
    confirmPopup({
      target: event.currentTarget,
      message: message,
      icon: "pi pi-exclamation-triangle",
      accept: acceptCB,
      reject: rejectCB
    })
  }

  /**
   * Confirm info dialog
   * @param {object} event - Event
   * @param {function} acceptCB - Accept callback
   * @param {function} rejectCB - Reject callback
   * @param {string} message - Message
   * @returns {void}
   */
  const confirmInfoDialog = (event, acceptCB, rejectCB, message) => {
    if (message === undefined) {
      message = "Do you want to overwrite the tags?"
    }
    confirmDialog({
      message: message,
      header: "Confirmation",
      icon: "pi pi-exclamation-triangle",
      accept: acceptCB,
      reject: rejectCB
    })
  }

  /**
   * Handle tags creation
   * @param {object} e - Event
   * @returns {void}
   * @summary This function is used to handle the creation of tags
   */
  const handleTagsCreation = (e) => {
    let innerTagsList = e.value
    if (innerTagsList.length > 0) {
      let newTagsDict = {}
      innerTagsList.forEach((tag) => {
        if (tagsDict[tag]) {
          newTagsDict[tag] = tagsDict[tag]
        } else {
          newTagsDict[tag] = { fontColor: "white", color: generateRandomColor(), datasets: {}, protect: true }
        }
      })
      setTagsDict(newTagsDict)
    }
  }

  /**
   * Identify column key to dataset key
   * @param {string} columnKey - Column key
   * @returns {object} - Column key to dataset key
   * @summary This function is used to identify the column key to dataset key
   */
  const identifyColumnKeyToDatasetKey = (columnKey) => {
    let columnKeySplitted = columnKey.split("_@_")
    if (columnKeySplitted.length === 2) {
      let column = columnKeySplitted[0]
      let datasetKey = columnKeySplitted[1]
      return { column: column, datasetKey: datasetKey }
    } else {
      return { column: null, datasetKey: columnKeySplitted[0] }
    }
  }

  /**
   * Get selected tags and selected columns
   * @returns {object} - Selected tags and selected columns
   * @summary This function is used to get the selected tags and selected columns
   */
  const getSelectedTagsAndSelectedColumns = () => {
    let datasetsConcerned = []
    let columnsConcerned = {}
    let tagsConcerned = selectedTags
    if (selectedNodes !== null && selectedNodes !== undefined && Object.keys(selectedNodes).length > 0) {
      Object.keys(selectedNodes).forEach((node) => {
        let nodeKeys = identifyColumnKeyToDatasetKey(node)
        if (nodeKeys) {
          let column = nodeKeys.column
          let datasetKey = nodeKeys.datasetKey
          if (datasetsConcerned.includes(datasetKey) === false) {
            datasetsConcerned.push(datasetKey)
          }

          if (column !== null) {
            let columnsAlreadyThere = columnsConcerned[datasetKey]
            if (columnsAlreadyThere) {
              columnsAlreadyThere.push(column)
              columnsConcerned[datasetKey] = columnsAlreadyThere
            } else {
              columnsConcerned[datasetKey] = [column]
            }
          }
        }
      })
    }
    return { datasetsConcerned: datasetsConcerned, columnsConcerned: columnsConcerned, tagsConcerned: tagsConcerned }
  }

  /**
   * Add tags to array if not present
   * @param {array} tagsToAdd - Tags to add
   * @param {string} datasetKey - Dataset key
   * @returns {object} - Tags present in selected datasets
   */
  const addTagsToArrayIfNotPresent = (tagsToAdd, datasetKey) => {
    let newTags = { ...tagsPresentInSelectedDatasets }
    let tagsPresentList = Object.keys(tagsPresentInSelectedDatasets)
    tagsToAdd.forEach((tag) => {
      if (!tagsPresentList.includes(tag)) {
        newTags[tag] = [datasetKey]
      } else {
        let datasetsAlreadyThere = newTags[tag]
        if (!datasetsAlreadyThere.includes(datasetKey)) {
          datasetsAlreadyThere.push(datasetKey)
          newTags[tag] = datasetsAlreadyThere
        }
      }
    })
    setTagsPresentInSelectedDatasets(newTags)
    return newTags
  }

  /**
   * Add array of strings to array of strings if not present
   * @param {array} stringsToAdd - Strings to add
   * @param {array} array - Array
   * @returns {array} - Array of strings
   */
  const addArrayOfStringsToArrayOfStringsIfNotPresent = (stringsToAdd, array) => {
    let newArray = array
    // Check if array contains an array of strings
    if (array[0] && typeof array[0] === "string") {
      stringsToAdd.forEach((stringToAdd) => {
        if (!array.includes(stringToAdd)) {
          newArray.push(stringToAdd)
        }
      })
      return newArray
    }
    if (Array.isArray(array) && array.length === 0) {
      return stringsToAdd
    }
    return array
  }

  /**
   * Apply the tags to the selected columns and updates the nodes
   */
  const updateNodeTags = () => {
    /* We ensure that the variables related to the overwrite logic are initialised */
    if (overwriteWasAsked) {
      setOverwriteWasAsked(false)
      setOverwrite(null)
    }

    /* We create a promise to update the nodes */
    // eslint-disable-next-line no-async-promise-executor
    new Promise(async (resolveMaster) => {
      /* We get the selected tags and selected columns */
      let { datasetsConcerned, columnsConcerned, tagsConcerned } = getSelectedTagsAndSelectedColumns()

      /**
       * Confirm overwrite - This function is used to asked the user if he wants to overwrite the tags
       * @returns {void}
       *
       */
      const confirmOverwrite = () =>
        new Promise((resolve) => {
          confirmInfoDialog(
            null,
            () => {
              setOverwrite(true)
              setOverwriteWasAsked(true)
              resolve(true)
            },
            () => {
              setOverwrite(false)
              setOverwriteWasAsked(true)
              resolve(false)
            },
            "Do you want to overwrite the tags?"
          )
        })

      /**
       * Handle applying overwrite
       * This function is called after the user has been asked if he wants to overwrite the tags
       * @param {boolean} overwriteLocal - Overwrite local
       * @param {object} child - Child
       * @param {object} columnsTag - Columns tag
       * @param {string} column - Column
       * @returns {array} - Array of two elements : [0] : child tags, [1] : columns tag
       */
      const handleApplyingOverwrite = async (overwriteLocal, child, columnsTag) => {
        if (columnsTag === undefined) {
          columnsTag = []
        }
        let newChildTags = deepCopy(child.tags)
        let newColumnsTag = deepCopy(columnsTag)

        if (overwriteLocal === true || newColumnsTag === 0) {
          newChildTags = sortTheArrayOfStringsAlphabetically(tagsConcerned)
          newColumnsTag = sortTheArrayOfStringsAlphabetically(tagsConcerned)
        } else {
          newChildTags = sortTheArrayOfStringsAlphabetically(addArrayOfStringsToArrayOfStringsIfNotPresent(tagsConcerned, newChildTags))
          newColumnsTag = sortTheArrayOfStringsAlphabetically(addArrayOfStringsToArrayOfStringsIfNotPresent(tagsConcerned, newColumnsTag))
        }
        return [newChildTags, newColumnsTag]
      }

      let globalDataCopy = { ...globalData }
      let overwriteLocal = false
      /* We ask the user if he wants to overwrite the tags */
      if (await confirmOverwrite()) {
        overwriteLocal = true
      } else {
        overwriteLocal = false
      }
      /* We create a promise for each node and we wait for every promise to be resolved */
      await Promise.all(
        nodes.map(async (node) => {
          // We iterate through the nodes, which are the columns or the datasets
          let nodeKeys = identifyColumnKeyToDatasetKey(node.key) // We identify the column key and the dataset key
          let dataset = globalDataCopy[nodeKeys.datasetKey] // We get the dataset
          let columnsTag = { ...getColumnsTagging(dataset) } // We get the columns tagging

          if (nodeKeys.column === null) {
            // If the node is a dataset, not a column, we iterate through the children that are the columns
            for (let child of node.children) {
              // IMPORTANT : For an async function, we need to use a for loop, not a forEach loop
              let childKeys = identifyColumnKeyToDatasetKey(child.key) // We identify the column key and the dataset key
              let dataset = globalDataCopy[nodeKeys.datasetKey] // We get the dataset
              if (childKeys) {
                let column = childKeys.column // We get the column
                let newColumnTagList = columnsTag[column] // We create a new column tag array
                let datasetKey = childKeys.datasetKey // We get the dataset key
                if (datasetsConcerned.includes(datasetKey)) {
                  // If the dataset key is in the list of the selected datasets
                  console.log("datasetKey", datasetKey)
                  let columnsToCheck = columnsConcerned[datasetKey] // We get the columns to check
                  if (columnsToCheck.includes(column)) {
                    // If the column is in the list of the columns to check
                    if (child.tags) {
                      // If the child has tags already
                      let res = await handleApplyingOverwrite(overwriteLocal, child, newColumnTagList) // We apply the tagging
                      child.tags = res[0] // We update the child tags in the nodes
                      newColumnTagList = res[1]
                      if (dataset.metadata.columnsTag !== undefined) {
                        if (dataset.metadata.columnsTag[column] !== undefined) {
                          dataset.metadata.columnsTag[column] = res[1] // We update the columns tagging in the dataset
                        } else {
                          dataset.metadata.columnsTag = { ...dataset.metadata.columnsTag, [column]: res[1] }
                        }
                      } else {
                        dataset.metadata = { ...dataset.metadata, columnsTag: { [column]: res[1] } }
                      }
                    } else {
                      // If the child has no tags, we apply the tagging directly
                      child.tags = sortTheArrayOfStringsAlphabetically(tagsConcerned)
                      columnsTag[column] = sortTheArrayOfStringsAlphabetically(tagsConcerned)
                      if (dataset.metadata.columnsTag !== undefined) {
                        if (dataset.metadata.columnsTag[column] !== undefined) {
                          dataset.metadata.columnsTag[column] = sortTheArrayOfStringsAlphabetically(tagsConcerned) // We update the columns tagging in the dataset
                        } else {
                          dataset.metadata.columnsTag = { ...dataset.metadata.columnsTag, [column]: sortTheArrayOfStringsAlphabetically(tagsConcerned) }
                        }
                      } else {
                        dataset.metadata = { ...dataset.metadata, columnsTag: { [column]: sortTheArrayOfStringsAlphabetically(tagsConcerned) } }
                      }
                    }
                    dataset.metadata.tagsDict = { ...tagsDict } // We update the tags dict in the dataset
                    globalDataCopy[nodeKeys.datasetKey] = dataset
                  }
                }
              }
            }
          }
          // resolveToCall() // We resolve the promise
          // })
        })
      ).then((res) => {
        setGlobalData(globalDataCopy) // We update the global data
        setOverwriteWasAsked(false) // We reset the overwrite was asked variable
        setOverwrite(null) // We reset the overwrite variable
        resolveMaster(res) // We resolve the master promise which can be used to chain other promises after the update of the nodes
      })
    })
  }

  /**
   * Sort the array of strings alphabetically
   * @param {array} array - Array
   * @returns {array} - Sorted array
   * @summary This function is used to sort the strings in an array alphabetically
   */
  const sortTheArrayOfStringsAlphabetically = (array) => {
    if (Array.isArray(array) === false) {
      // If the array is not an array, we return the array
      if (array === undefined) {
        return []
      } else {
        return array
      }
    }
    let newArray = array
    newArray.sort((a, b) => {
      if (a < b) {
        return -1
      }
      if (a > b) {
        return 1
      }
      return 0
    })
    return newArray
  }

  /**
   * Add tag to tags dict
   * @param {string} tag - Tag
   * @param {string} color - Color
   * @param {object} newTagsDict - New tags dict
   * @param {boolean} protect - Protect
   * @returns {object} - New tags dict
   * @summary This function is used to add a tag to the tags dict
   */
  const addTagToTagsDict = (tag, color, newTagsDict, protect) => {
    if (newTagsDict[tag]) {
      // If the tag is already in the tags dict
      // NO OP
    } else {
      newTagsDict[tag] = { color: color, fontColor: "black", datasets: {}, protect: protect !== "undefined" ? protect : false }
    }
    return newTagsDict
  }

  /**
   * Template for the tags in the multiselect tags alone - used primarily to add colors to the tags
   * @param {object} option - Option
   * @returns {JSX.Element} - JSX element - tag template
   * @summary --> itemName [tag1] [tag2]
   */
  const tagTemplate = (option) => {
    let style = { backgroundColor: option.color, color: tagsDict[option.label].fontColor }
    return (
      <div className="flex align-items-center">
        <Tag className={option.color} style={style}>
          {option.label}
        </Tag>
      </div>
    )
  }

  /**
   * Template for the tags in the multiselect - tags following the items
   * @param {object} option - Option
   * @returns {JSX.Element} - JSX element - tag template
   * @summary --> option.label [tag1] [tag2]
   */
  const columnSelectionTemplate = (option) => {
    return (
      <div className="flex align-items-center">
        <span>{option.label}</span>
        {option.tags && // If the option has tags
          option.tags.map((tag) => {
            return (
              <Tag className={tag.color} key={tag} style={{ backgroundColor: tagsDict[tag].color, color: tagsDict[tag].fontColor }}>
                {tag}
              </Tag>
            )
          })}
      </div>
    )
  }

  /**
   * Template for the chips being shown in the input field of the multiselect
   * @param {object} option - Option
   * @returns {JSX.Element} - JSX element - chip template
   */
  const customChip = (option) => {
    let style = { padding: "0px 5px", backgroundColor: tagsDict[option].color, color: tagsDict[option].fontColor }

    return <Chip className="custom-token" label={option} style={style}></Chip>
  }

  /**
   * Template for the chips being shown in the input field of the multiselect
   * @param {object} option - Option
   * @returns {JSX.Element} - JSX element - chip template
   */
  const customChipRemovable = (option) => {
    if (option !== undefined) {
      let style = { padding: "0px 5px", backgroundColor: tagsDict[option].color, color: tagsDict[option].fontColor }
      return <Chip className="custom-token" label={option} style={style}></Chip>
    } else {
      return <></>
    }
  }

  /**
   * Function to update the tags dict with the tags already present in the selected datasets
   * @returns {void}
   */
  const updateTagsDictWithAlreadyPresentTags = () => {
    let newTagsDict = { ...tagsDict }
    Object.keys(tagsPresentInSelectedDatasets).forEach((tag) => {
      if (!newTagsDict[tag]) {
        newTagsDict = addTagToTagsDict(tag, generateRandomColor(), newTagsDict, false)
      }
    })
    setTagsDict(newTagsDict)
  }

  /**
   * Function to update the tags present in the selected datasets
   * @returns {void}
   * @note we update primarily the datasets with their associated tags, but HERE, we update the tags with their associated datasets
   */
  const updateTagsPresentInSelectedDatasets = () => {
    let selectedKeys = Object.keys(selectedDatasets) // We get the selected keys
    let tagsArray = Object.entries(tagsPresentInSelectedDatasets) // We get the tags array
    let newTagsPresentInSelectedDatasets = { ...tagsPresentInSelectedDatasets } // We create a new tags present in selected datasets dict
    tagsArray.forEach((tag) => {
      // We iterate through the tags array
      let datasets = tag[1] // We get the datasets
      if (datasets) {
        // If the datasets exist
        let datasetsToRemove = [] // We create a new datasets to remove array
        datasets.forEach((dataset) => {
          // We iterate through the datasets
          if (!selectedKeys.includes(dataset)) {
            datasetsToRemove.push(dataset) // We add the dataset to the datasets to remove array
          }
        })
        datasetsToRemove.forEach((dataset) => {
          // We iterate through the datasets to remove
          let index = datasets.indexOf(dataset) // We get the index of the dataset
          datasets.splice(index, 1) // We remove the dataset from the datasets
        })
        newTagsPresentInSelectedDatasets[tag[0]] = datasets // We update the new tags present in selected datasets dict
      } else {
        delete newTagsPresentInSelectedDatasets[tag[0]] // We delete the tag from the new tags present in selected datasets dict
      }
    })
    setTagsPresentInSelectedDatasets(newTagsPresentInSelectedDatasets)
  }

  /**
   * Function that is called when the global data is updated
   * @returns {void}
   * @summary This function is used to update the list of datasets when the global data is updated
   */
  useEffect(() => {
    if (globalData !== null) {
      updateListOfDatasets()
    }
  }, [globalData])

  /**
   * Function that is called when the selected datasets are updated
   * @returns {void}
   * @summary This function is used to update the nodes when the selected datasets are updated
   *           It also updates the tags already present in the selected datasets
   *           It also updates the tags dict
   * @note We get the columns names here and we create the nodes for the tree
   */
  useEffect(() => {
    let newNodes = [] // We create a new nodes array
    let tagsToAdd = [] // We create a new tags to add array
    Object.keys(selectedDatasets).forEach((key) => {
      // We iterate through the selected datasets
      let dataset = selectedDatasets[key] // We get the dataset
      let datasetChildren = [] // We create a new dataset children array
      if (dataset) {
        // If the dataset exists
        getColumnsFromPromise(globalData[key]).then((columns) => {
          let columnsTag = getColumnsTagging(globalData[key]) // We get the columns tagging
          // We get the columns from the promise
          columns.forEach((column) => {
            // We iterate through the columns
            column = cleanString(column) // We clean the column name, remove the spaces and the quotes
            if (columnsTag[column]) {
              // If the column is already tagged
              addTagsToArrayIfNotPresent(columnsTag[column], key) // We add the tags to the tags already present in the selected datasets
              columnsTag[column].forEach((tag) => {
                // We iterate through the tags
                if (!tagsToAdd.includes(tag)) {
                  // If the tag is not in the tags to add array
                  tagsToAdd.push(tag) // We add the tag to the tags to add array
                }
              })
              addTagsToTagsAlreadyInSelectedDatasets(tagsToAdd) // We add the tags to the tags already in the selected datasets
              datasetChildren.push({ key: column + "_@_" + key, label: column, value: column, checked: true, partialChecked: false, tags: columnsTag[column] })
            } else {
              // If the column is not tagged
              datasetChildren.push({ key: column + "_@_" + key, label: column, value: column, checked: true, partialChecked: false, tags: [] })
            }
          })
        })
      }
      newNodes.push({ key: key, label: dataset.name, value: dataset.name, children: datasetChildren, checked: false, partialChecked: false }) // We push the dataset to the nodes
    })
    setNodes(newNodes) // We update the nodes
  }, [selectedDatasets, globalData])

  /**
   * Function that is called when the tags present in selected datasets are updated
   * @returns {void}
   * @summary This function is used to update the tags dict when the tags present in selected datasets are updated
   */
  useEffect(() => {
    updateTagsDictWithAlreadyPresentTags()
  }, [tagsPresentInSelectedDatasets])

  /**
   * Function that is called when the selected datasets are updated
   * @returns {void}
   * @summary This function is used to update the tags present in selected datasets when the selected datasets are updated
   */
  useEffect(() => {
    updateTagsPresentInSelectedDatasets()
  }, [selectedDatasets])

  return (
    <>
      <div className="margin-top-15 margin-bottom-15 center">
        <Message text="The Grouping/Tagging tool enables you to create and apply tags to dataset columns." />
      </div>
      <div className="groupingTool mergeToolMultiSelect">
        {/* Merge tool multiselect is here to use the same class inheritance - CSS*/}
        <Row className="justify-content-center ">
          <Col lg={4} style={{ display: "flex", flexDirection: "column", flexGrow: "1", alignItems: "start", justifyContent: "start", paddingInline: "0rem", marginInline: "0.5rem" }}>
            <h6 style={{ paddingBottom: "0.25rem", margin: "0rem", marginInline: "0.5rem", height: "1.5rem" }}> Select the datasets you want to tag</h6>
            <MultiSelect // Multiselect to select the datasets (.csv, .json & .xlsx files)
              display="chip"
              ref={firstMultiselect}
              className="w-full md:w-14rem margintop8px"
              value={
                Object.keys(selectedDatasets).length !== 0
                  ? Object.entries(selectedDatasets).map((arr) => {
                      return { name: arr[1].name, key: arr[0] }
                    })
                  : null
              }
              options={listOfDatasets}
              onChange={async (e) => {
                let newSelectedDatasetsDict = {}
                e.value.forEach((value) => {
                  if (value.key !== undefined) {
                    getDatasetTagsDict(globalData[value.key])
                    newSelectedDatasetsDict[value.key] = { name: value.name, columns: getColumnsFromPromise(globalData[value.key]), selectedColumns: null, mergeType: null, isValid: false }
                  }
                })
                setSelectedDatasets(newSelectedDatasetsDict)
              }}
              optionLabel="name"
              placeholder="Select a dataset"
              style={{ width: "100%", marginRight: "0.5rem" }}
            />
            {/* Map the selected datasets in a list */}
            <ul style={{ padding: "0rem", columnCount: "2", columnFill: "balance", maxHeight: "15rem", overflow: "auto", maxWidth: "100%" }}>
              {Object.keys(selectedDatasets).map((key, index) => {
                // We iterate through the selected datasets
                return (
                  <li key={index} style={{ display: "flex", flexDirection: "row" }}>
                    <div className="listItem" key={index} style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
                      <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{selectedDatasets[key].name}</span> {/* We display the name of the dataset */}
                      <div className="icon-button-div">
                        <a // We add an icon to remove the tags from the dataset
                          value={key}
                          style={{ marginLeft: "1rem" }}
                          onClick={(e) => {
                            confirmInfo(
                              e,
                              () => {
                                // If the user confirms the removal of the tags from the dataset
                                let selectedDatasetsCopy = { ...selectedDatasets } // We create a copy of the selected datasets
                                selectedDatasetsCopy[key].columns = getColumnsFromPromise(globalData[key]) // We get the columns from the promise
                                let newGlobalData = { ...globalData } // We create a copy of the global data
                                if (newGlobalData[key]) {
                                  if (newGlobalData[key].metadata) {
                                    if (newGlobalData[key].metadata.columnsTag) {
                                      delete newGlobalData[key].metadata.columnsTag
                                      setGlobalData(newGlobalData)
                                    }
                                  }
                                }
                              },
                              () => {
                                console.log("Removal of the tags from the dataset cancelled")
                              },
                              "Do you want to proceed with the removal of the tags from the dataset?"
                            )
                          }}
                        >
                          <Eraser size={20} />
                        </a>
                        <a // We add an icon to remove the dataset from the selected datasets
                          value={key}
                          style={{ marginLeft: "0.1rem" }}
                          onClick={() => {
                            let newSelectedDatasetsDict = { ...selectedDatasets }
                            delete newSelectedDatasetsDict[key]
                            setSelectedDatasets(newSelectedDatasetsDict)
                          }}
                        >
                          <XSquare size={20} />
                        </a>
                      </div>
                    </div>
                  </li>
                )
              })}
            </ul>
          </Col>
          <Col lg={4} style={{ display: "flex", flexDirection: "column", flexGrow: "1", alignItems: "flex-start", justifyContent: "flex-start", paddingInline: "0rem" }}>
            <div style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "center", width: "100%", flexWrap: "nowrap", height: "1.5rem" }}>
              <h6 style={{ paddingBottom: "0.25rem", margin: "0rem", marginInline: "1rem" }}> Create your tags</h6>
              <Button // Button to add the default tags
                className="checkmarkButton"
                style={{ width: "fit-content", height: "fit-content", padding: "0.15rem", margin: "0px" }}
                onClick={() => {
                  let newTagsDict = { ...tagsDict }
                  newTagsDict = addTagToTagsDict("demographics", "#4c9eff", newTagsDict, true)
                  newTagsDict = addTagToTagsDict("radiographics", "#4ec9b0", newTagsDict, true)
                  newTagsDict = addTagToTagsDict("radiomics", "#f9b115", newTagsDict, true)
                  newTagsDict = addTagToTagsDict("pathology", "#f93e3e", newTagsDict, true)
                  newTagsDict = addTagToTagsDict("therapy", "#a832a8", newTagsDict, true)
                  setTagsDict(newTagsDict)
                }}
              >
                {<PlusSquare size={15} />}
              </Button>
            </div>

            <Chips // Chips to display the tags
              className="w-full md:w-14rem margintop8px small-token token-bg-transparent"
              value={Object.keys(tagsDict)}
              removable={false}
              onChange={(e) => {
                handleTagsCreation(e)
              }}
              itemTemplate={customChip}
            />
          </Col>
          <Col md={3} style={{ display: "flex", flexDirection: "column", flexGrow: "1", alignItems: "center", justifyContent: "center", paddingInline: "0.5rem" }}>
            <h6>
              <u>
                <b>Tags</b>
              </u>
            </h6>
            <ul style={{ padding: "0rem", width: "100%" }}>
              {Object.keys(tagsDict).map((tag, key) => {
                // We iterate through the tags dict
                return (
                  <li key={key} style={{ display: "flex", flexDirection: "row" }}>
                    <div key={key} style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "space-between", width: "100%", flexWrap: "wrap" }}>
                      {editingTag === tag ? ( // If the tag is being edited (renamed)
                        <input
                          value={tempTag}
                          onChange={(e) => setTempTag(e.target.value)}
                          onBlur={() => {
                            let newTagsDict = { ...tagsDict }
                            delete newTagsDict[tag]
                            newTagsDict[tempTag] = tagsDict[tag]
                            setTagsDict(newTagsDict)
                            setEditingTag(null)
                          }}
                          onKeyDown={(e) => {
                            // If the user presses enter, we rename the tag
                            if (e.key === "Enter") {
                              let newTagsDict = { ...tagsDict }
                              delete newTagsDict[tag]
                              newTagsDict[tempTag] = tagsDict[tag]
                              setTagsDict(newTagsDict)
                              setEditingTag(null)
                            }
                          }}
                        />
                      ) : (
                        <span style={{ paddingRight: "0.5rem", whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden" }}>{tag}</span> // If the tag is not being edited (renamed), we display the tag name
                      )}
                      <div style={{ marginLeft: "auto", display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "space-between", flexWrap: "nowrap" }}>
                        <ColorPicker // Color picker to change the color of the tag
                          key={key}
                          value={tagsDict[tag].color}
                          onChange={(e) => {
                            let newTagsDict = { ...tagsDict }
                            newTagsDict[tag].color = "#" + e.value
                            setTagsDict(newTagsDict)
                          }}
                        />
                        <ToggleButton // Toggle button to change the font color of the tag
                          style={{ marginLeft: "0.25rem" }}
                          className="toggle-font-color-button"
                          onChange={() => {
                            let newTagsDict = { ...tagsDict }
                            newTagsDict[tag].fontColor = newTagsDict[tag].fontColor === "black" ? "white" : "black"
                            setTagsDict(newTagsDict)
                          }}
                          checked={tagsDict[tag].fontColor === "black"}
                          offLabel=""
                          onLabel=""
                          onIcon={(options) => <Fonts size={20} color="black" {...options.iconProps} />}
                          offIcon={(options) => <Fonts size={20} color="white" {...options.iconProps} />}
                        />
                        <a // Icon to edit/rename the tag
                          value={tag}
                          style={{ marginLeft: "0.25rem" }}
                          onClick={() => {
                            setTempTag(tag)
                            setEditingTag(tag)
                          }}
                        >
                          <PencilSquare size={20} />
                        </a>
                        <a // Icon to delete the tag
                          value={tag}
                          style={{ marginLeft: "0.25rem" }}
                          onClick={(e) => {
                            let newTagsDict = { ...tagsDict }
                            confirmDanger(
                              e,
                              () => {
                                delete newTagsDict[tag]
                                setTagsDict(newTagsDict)
                              },
                              () => {
                                console.log("Canceled deletion of the tag")
                              }
                            )
                          }}
                        >
                          <XSquare size={20} />
                        </a>
                      </div>
                    </div>
                  </li>
                )
              })}
            </ul>
          </Col>
        </Row>
        <Row className="justify-content-center">
          <Col md={4} style={{ display: "flex", flexDirection: "column", flexGrow: "1", alignItems: "start", justifyContent: "start", paddingInline: "0rem", marginInline: "0.5rem" }}>
            <h5>Columns</h5>
            {/* Tree select to select the columns */}
            <TreeSelect
              className="small-token"
              nodeTemplate={columnSelectionTemplate}
              panelClassName="groupingToolTree"
              filter
              value={selectedNodes}
              options={nodes}
              metaKeySelection={false}
              selectionMode="checkbox"
              display="chip"
              onChange={(e) => setSelectedNodes(e.value)}
            />
          </Col>
          <Col lg={6} style={{ display: "flex", flexDirection: "column", flexGrow: "1", alignItems: "start", justifyContent: "start", paddingInline: "0rem" }}>
            <h5>Set/Modify Tag</h5>
            <div style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "space-between", width: "100%", flexWrap: "nowrap" }}>
              <p style={{ paddingRight: "0.5rem", minWidth: "fit-content", margin: "0px" }}>Add tag</p>
              <MultiSelect // Multiselect to select the tags to add to the selected columns
                ref={secondMultiselect}
                selectedItemTemplate={customChipRemovable}
                itemTemplate={tagTemplate}
                display="chip"
                className=" md:w-14rem margintop8px groupingTool small-token"
                value={selectedTags}
                options={Object.entries(tagsDict).map((arr) => {
                  return { label: arr[0], value: arr[0], color: arr[1].color }
                })}
                onChange={(e) => {
                  setSelectedTags(e.value)
                }}
                optionLabel="label"
                placeholder="Select a tag"
                style={{ flexGrow: "1", marginRight: "0.5rem", overflow: "hidden" }}
              />
              <Button // Button to add the selected tags to the selected columns
                className="p-button-success checkmarkButton"
                style={{ width: "fit-content", height: "fit-content", padding: "0.25rem", margin: "0px", flexShrink: "0" }}
                onClick={(e) => {
                  setOverwriteWasAsked(false)
                  setOverwrite(null)
                  confirmInfo(
                    e,
                    async () => {
                      await updateNodeTags()
                    },
                    () => {
                      console.log("Canceled adding tags to the columns")
                    }
                  )
                }}
              >
                {<Check2Square size={30} />}
              </Button>
            </div>
          </Col>
        </Row>
      </div>
    </>
  )
}

export default GroupingTool
