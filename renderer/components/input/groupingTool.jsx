import React, { useState, useEffect, useContext, useRef, useTimeout } from "react"
import { AccordionTab } from "primereact/accordion"
import { DataContext } from "../workspace/dataContext"
import { Dropdown } from "primereact/dropdown"
import Row from "react-bootstrap/Row"
import Col from "react-bootstrap/Col"
import { PlusSquare, XSquare, PencilSquare, Check2Square, Eraser, Fonts, Pass } from "react-bootstrap-icons"
import { Button } from "primereact/button"
import { MultiSelect } from "primereact/multiselect"
import { WorkspaceContext } from "../workspace/workspaceContext"
import ProgressBarRequests from "../flow/progressBarRequests"
import { Chips } from "primereact/chips"
import { Chip } from "primereact/chip"
import { ColorPicker } from "primereact/colorpicker"
import { ConfirmPopup, confirmPopup } from "primereact/confirmpopup"
import { TreeSelect } from "primereact/treeselect"
import { Tag } from "primereact/tag"
import { ToggleButton } from "primereact/togglebutton"
import { confirmDialog } from "primereact/confirmdialog"

const GroupingTool = ({ pageId = "42-grouping", configPath = null }) => {
  const { port } = useContext(WorkspaceContext) // we get the port for server connexion
  const [listOfDatasets, setListOfDatasets] = useState([])
  const [dictOfDatasets, setDictOfDatasets] = useState({})
  const { globalData, setGlobalData } = useContext(DataContext)
  const [selectedDatasets, setSelectedDatasets] = useState({})
  const firstMultiselect = useRef(null)
  const [newDatasetName, setNewDatasetName] = useState("")
  const [newDatasetExtension, setNewDatasetExtension] = useState(".csv")
  const [progress, setProgress] = useState({ now: 0, currentLabel: "" })
  const [isProgressUpdating, setIsProgressUpdating] = useState(false)
  const [tagsDict, setTagsDict] = useState({})
  const [tagsList, setTagsList] = useState([])
  const [editingTag, setEditingTag] = useState(null)
  const [tempTag, setTempTag] = useState("")
  const [selectedNodes, setSelectedNodes] = useState(null)
  const [nodes, setNodes] = useState([])
  const [selectedTags, setSelectedTags] = useState([])
  const [tagsPresentInSelectedDatasets, setTagsPresentInSelectedDatasets] = useState([])
  const [overwrite, setOverwrite] = useState(false)
  const [overwriteWasAsked, setOverwriteWasAsked] = useState(false)

  const mergeOptions = [
    { label: "Left", value: "left" },
    { label: "Right", value: "right" },
    { label: "Inner", value: "inner" },
    { label: "Outer", value: "outer" },
    { label: "Cross", value: "cross" }
  ]
  const updateListOfDatasets = () => {
    let newDatasetList = []
    Object.keys(globalData).forEach((key) => {
      if (globalData[key].extension === "csv") {
        newDatasetList.push({ name: globalData[key].name, key: key })
      }
    })
    setListOfDatasets(newDatasetList)
  }

  const cleanString = (string) => {
    // if String has spaces or "", erase them
    if (string.includes(" ") || string.includes('"')) {
      string = string.replaceAll(" ", "")
      string = string.replaceAll('"', "")
    }
    return string
  }

  function getColumnsTagging(dataObject) {
    if (dataObject.metadata.columnsTag === null || dataObject.metadata.columnsTag === undefined) {
      return {}
    } else {
      return dataObject.metadata.columnsTag
    }
  }

  async function getColumnsFromPromise(dataObject) {
    let promise = new Promise((resolve, reject) => {
      resolve(dataObject.getColumnsOfTheDataObjectIfItIsATable())
    })
    let columns = await promise
    return columns
  }

  useEffect(() => {
    // console.log("listOfDatasets", listOfDatasets)
  }, [listOfDatasets])

  useEffect(() => {
    if (globalData !== null) {
      updateListOfDatasets()
      // updateDatasetSelectorElement()
    }
  }, [globalData])

  useEffect(() => {
    console.log("Overwrite was asked", overwriteWasAsked)
  }, [overwriteWasAsked])

  const addTagsToTagsAlreadyInSelectedDatasets = (tagsToAdd) => {
    let newTags = { ...tagsPresentInSelectedDatasets }
    tagsToAdd.forEach((tag) => {})
    setTagsPresentInSelectedDatasets
  }

  useEffect(() => {
    let newNodes = []
    let tagsToAdd = []
    Object.keys(selectedDatasets).forEach((key) => {
      let dataset = selectedDatasets[key]
      let datasetChildren = []
      if (dataset) {
        let columnsTag = getColumnsTagging(globalData[key])
        getColumnsFromPromise(globalData[key]).then((columns) => {
          columns.forEach((column) => {
            column = cleanString(column)
            if (columnsTag[column]) {
              console.log("columnsTag[column]", columnsTag[column])
              addTagsToArrayIfNotPresent(columnsTag[column], key)
              console.log("tagsToAdd", tagsToAdd)
              datasetChildren.push({ key: column + "_|_" + key, label: column, value: column, checked: true, partialChecked: false, tags: columnsTag[column] })
            } else {
              datasetChildren.push({ key: column + "_|_" + key, label: column, value: column, checked: true, partialChecked: false, tags: [] })
            }
          })
        })
      }
      newNodes.push({ key: key, label: dataset.name, value: dataset.name, children: datasetChildren, checked: false, partialChecked: false })
    })
    setNodes(newNodes)
    console.log("tagsToAdd", tagsToAdd)
    if (tagsToAdd.length > 0) {
      let tagsAlreadyThere = Object.keys(tagsDict)
      let tagsThatWillBeAdded = returnArrayOfElementsNotPresentInArray(tagsAlreadyThere, tagsToAdd)
      let newTagsDict = { ...tagsDict }
      tagsThatWillBeAdded.forEach((tag) => {
        console.log("TAG BEING ADDED", tag)
        newTagsDict = addTagToTagsDict(tag, generateRandomColor(), newTagsDict)
      })
      setTagsDict(newTagsDict)
    }
  }, [selectedDatasets])

  const returnArrayOfElementsNotPresentInArray = (oldArray, arrayOfNewElements) => {
    let newArray = []
    arrayOfNewElements.forEach((element) => {
      if (!oldArray.includes(element)) {
        newArray.push(element)
      }
    })
    return newArray
  }

  const generateRandomColor = () => {
    let color = "#" + Math.floor(Math.random() * 16777215).toString(16)
    return color
  }

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

  const handleTagsCreation = (e) => {
    let innerTagsList = e.value
    if (innerTagsList.length > 0) {
      let newTagsDict = {}
      innerTagsList.forEach((tag) => {
        if (tagsDict[tag]) {
          newTagsDict[tag] = tagsDict[tag]
        } else {
          newTagsDict[tag] = { fontColor: "white", color: "#000000", datasets: {}, protect: true }
        }
      })
      setTagsDict(newTagsDict)
    }
  }

  const identifyColumnKeyToDatasetKey = (columnKey) => {
    let columnKeySplitted = columnKey.split("_|_")
    if (columnKeySplitted.length === 2) {
      let column = columnKeySplitted[0]
      let datasetKey = columnKeySplitted[1]
      return { column: column, datasetKey: datasetKey }
    } else {
      return { column: null, datasetKey: columnKeySplitted[0] }
    }
  }

  const getSelectedTagsAndSelectedColumns = () => {
    let datasetsConcerned = []
    let columnsConcerned = {}
    let tagsConcerned = selectedTags
    console.log("tagsConcerned", tagsConcerned, selectedTags)

    Object.keys(selectedNodes).forEach((node) => {
      let nodeKeys = identifyColumnKeyToDatasetKey(node)
      if (nodeKeys) {
        let column = nodeKeys.column
        let datasetKey = nodeKeys.datasetKey
        datasetsConcerned.push(datasetKey)
        let columnsAlreadyThere = columnsConcerned[datasetKey]
        if (columnsAlreadyThere) {
          columnsAlreadyThere.push(column)
          columnsConcerned[datasetKey] = columnsAlreadyThere
        } else {
          columnsConcerned[datasetKey] = [column]
        }
      }
    })
    return { datasetsConcerned: datasetsConcerned, columnsConcerned: columnsConcerned, tagsConcerned: tagsConcerned }
  }

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

  const addArrayOfStringsToArrayOfStringsIfNotPresent = (stringsToAdd, array) => {
    let newArray = array
    stringsToAdd.forEach((stringToAdd) => {
      if (!array.includes(stringToAdd)) {
        newArray.push(stringToAdd)
      }
    })

    return newArray
  }

  const updateNodeTags = () => {
    if (overwriteWasAsked) {
      setOverwriteWasAsked(false)
      setOverwrite(false)
    }

    new Promise((resolveMaster, reject) => {
      let { datasetsConcerned, columnsConcerned, tagsConcerned } = getSelectedTagsAndSelectedColumns()
      let newNodes = [...nodes]

      const confirmOverwrite = () =>
        new Promise((resolve, reject) => {
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

      const handleOverwrite = async (child, columnsTag, column) => {
        if (await confirmOverwrite()) {
          child.tags = tagsConcerned
          columnsTag[column] = tagsConcerned
        } else {
          child.tags = addArrayOfStringsToArrayOfStringsIfNotPresent(tagsConcerned, child.tags)
          columnsTag[column] = addArrayOfStringsToArrayOfStringsIfNotPresent(tagsConcerned, columnsTag[column])
        }
        return columnsTag[column]
      }

      let globalDataCopy = { ...globalData }
      let overwriteWasAskedLocal = false
      let result = () =>
        new Promise((resolveToCall, reject) => {
          newNodes.forEach(async (node) => {
            let nodeKeys = identifyColumnKeyToDatasetKey(node.key)
            console.log("nodeKeys", nodeKeys)
            let dataset = globalDataCopy[nodeKeys.datasetKey]
            let columnsTag = getColumnsTagging(dataset)
            if (nodeKeys.column === null) {
              node.children.forEach(async (child) => {
                let childKeys = identifyColumnKeyToDatasetKey(child.key)
                if (childKeys) {
                  let column = childKeys.column
                  let datasetKey = childKeys.datasetKey
                  if (datasetsConcerned.includes(datasetKey)) {
                    let columnsToCheck = columnsConcerned[datasetKey]
                    if (columnsToCheck.includes(column)) {
                      if (child.tags) {
                        if (child.tags.length > 0) {
                          if (!overwriteWasAskedLocal) {
                            columnsTag[column] = await handleOverwrite(child, columnsTag, column)
                            overwriteWasAskedLocal = true
                            resolveToCall(columnsTag[column])
                          } else {
                            if (overwrite) {
                              child.tags = tagsConcerned
                              columnsTag[column] = tagsConcerned
                            } else {
                              child.tags = addArrayOfStringsToArrayOfStringsIfNotPresent(tagsConcerned, child.tags)
                              columnsTag[column] = addArrayOfStringsToArrayOfStringsIfNotPresent(tagsConcerned, columnsTag[column])
                            }
                          }
                        } else {
                          child.tags = tagsConcerned
                          columnsTag[column] = tagsConcerned
                        }
                      } else {
                        child.tags = tagsConcerned
                        columnsTag[column] = tagsConcerned
                      }
                    }
                  }
                }
              })
            }
            dataset.metadata.columnsTag = columnsTag
            globalDataCopy[nodeKeys.datasetKey] = dataset
          })
          setGlobalData(globalDataCopy)
          setNodes(newNodes)
          setOverwriteWasAsked(false)
          setOverwrite(false)
        })
      result().then((res) => {
        resolveMaster(res)
        // applyTagging(res)
      })
    })
  }

  const applyTagging = async () => {
    console.log("APPLY TAGGING")
    let globalDataCopy = { ...globalData }
    let { datasetsConcerned, columnsConcerned, tagsConcerned } = getSelectedTagsAndSelectedColumns()
    datasetsConcerned.forEach((datasetKey) => {
      let dataset = globalDataCopy[datasetKey]
      let columnsTag = getColumnsTagging(dataset)
      if (columnsTag) {
        columnsConcerned[datasetKey].forEach((column) => {
          let tagsAlreadyThere = columnsTag[column]
          if (tagsAlreadyThere && tagsAlreadyThere.length > 0) {
            if (overwriteWasAsked && !overwrite) {
              addTagsToArrayIfNotPresent(tagsAlreadyThere, tagsConcerned)
              columnsTag[column] = tagsAlreadyThere
            } else if (overwriteWasAsked && overwrite) {
              columnsTag[column] = tagsConcerned
            }
          } else {
            columnsTag[column] = tagsConcerned
          }
        })
      } else {
        columnsConcerned[datasetKey].forEach((column) => {
          columnsTag[column] = tagsConcerned
        })
      }
      dataset.metadata.columnsTag = columnsTag
      globalDataCopy[datasetKey] = dataset
    })
    setGlobalData(globalDataCopy)
    setOverwriteWasAsked(false)
    setOverwrite(false)
  }

  useEffect(() => {
    console.log("tagsDict", tagsDict)
    let newTagsList = []
    Object.keys(tagsDict).forEach((tag) => {
      newTagsList.push({ label: tag, value: tag, color: tagsDict[tag].color })
    })
    setTagsList(newTagsList)
  }, [tagsDict])

  useEffect(() => {
    console.log("selectedTags", selectedTags)
  }, [selectedTags])

  useEffect(() => {
    console.log("selectedNodes", selectedNodes)
    console.log("nodes", nodes)
  }, [selectedNodes])

  const addTagToTagsDict = (tag, color, newTagsDict, protect) => {
    if (newTagsDict[tag]) {
      console.log("tag already present")
    } else {
      newTagsDict[tag] = { color: color, fontColor: "black", datasets: {}, protect: protect !== "undefined" ? protect : false }
    }
    return newTagsDict
  }

  async function getTagDict() {
    setTimeout(() => {
      return { ...tagsDict }
    }, 1000)
  }

  const getColorFromTag = (tag, tagDict) => {
    return tagDict[tag].color
  }

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

  const columnSelectionTemplate = (option) => {
    // let tagsDictCopy = { ...tagsDict }

    return (
      <div className="flex align-items-center">
        <span>{option.label}</span>
        {option.tags &&
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

  const customChip = (option) => {
    let style = { padding: "0px 5px", backgroundColor: tagsDict[option].color, color: tagsDict[option].fontColor }
    console.log("OPTIONS", option)

    return <Chip className="custom-token" label={option} style={style}></Chip>
  }

  const customChipRemovable = (option) => {
    console.log("OPTIONS REMOVABLE", option)
    if (option !== undefined) {
      let style = { padding: "0px 5px", backgroundColor: tagsDict[option].color, color: tagsDict[option].fontColor }
      return <Chip className="custom-token" label={option} removable style={style}></Chip>
    } else {
      return <></>
    }
  }

  useEffect(() => {
    console.log("globalData", globalData)
  }, [globalData])

  const updateTagsDictWithAlreadyPresentTags = () => {
    let newTagsDict = { ...tagsDict }
    Object.keys(tagsPresentInSelectedDatasets).forEach((tag) => {
      if (!newTagsDict[tag]) {
        newTagsDict = addTagToTagsDict(tag, generateRandomColor(), newTagsDict, false)
      }
    })

    setTagsDict(newTagsDict)
  }

  useEffect(() => {
    console.log("tagsPresentInSelectedDatasets", tagsPresentInSelectedDatasets)
    // Object.keys(tagsPresentInSelectedDatasets)
    updateTagsDictWithAlreadyPresentTags()
  }, [tagsPresentInSelectedDatasets])

  useEffect(() => {
    updateTagsPresentInSelectedDatasets()
    console.log("selectedDatasets", selectedDatasets)
  }, [selectedDatasets])

  const updateTagsPresentInSelectedDatasets = () => {
    let selectedKeys = Object.keys(selectedDatasets)
    let tagsArray = Object.entries(tagsPresentInSelectedDatasets)
    let newTagsPresentInSelectedDatasets = { ...tagsPresentInSelectedDatasets }
    tagsArray.forEach((tag) => {
      let datasets = tag[1]
      if (datasets) {
        let datasetsToRemove = []
        datasets.forEach((dataset) => {
          if (!selectedKeys.includes(dataset)) {
            datasetsToRemove.push(dataset)
          }
        })
        datasetsToRemove.forEach((dataset) => {
          let index = datasets.indexOf(dataset)
          datasets.splice(index, 1)
        })
        newTagsPresentInSelectedDatasets[tag[0]] = datasets
      } else {
        delete newTagsPresentInSelectedDatasets[tag[0]]
      }
    })

    setTagsPresentInSelectedDatasets(newTagsPresentInSelectedDatasets)
    console.log("newTagsPresentInSelectedDatasets", newTagsPresentInSelectedDatasets)
  }

  return (
    <>
      <div className="groupingTool mergeToolMultiSelect">
        <Row className="justify-content-center ">
          {/* <Col style={{ display: "flex", flexDirection: "row", flexGrow: "1", alignItems: "start", justifyContent: "start", paddingInline: "0rem" }}> */}
          <Col lg={4} style={{ display: "flex", flexDirection: "column", flexGrow: "1", alignItems: "start", justifyContent: "start", paddingInline: "0rem", marginInline: "0.5rem" }}>
            <h6 style={{ paddingBottom: "0.25rem", margin: "0rem", marginInline: "0.5rem", height: "1.5rem" }}> Select the datasets you want to tag</h6>
            <MultiSelect
              display="chip"
              ref={firstMultiselect}
              className="w-full md:w-14rem margintop8px"
              value={
                Object.keys(selectedDatasets).length !== 0
                  ? Object.entries(selectedDatasets).map((arr) => {
                      // console.log("arr", arr)
                      return { name: arr[1].name, key: arr[0] }
                    })
                  : null
              }
              options={listOfDatasets}
              onChange={async (e) => {
                let newSelectedDatasetsDict = {}
                console.log("e", e)
                e.value.forEach((value) => {
                  if (value.key !== undefined) {
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
                return (
                  <li key={index} style={{ display: "flex", flexDirection: "row" }}>
                    <div className="listItem" key={index} style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
                      <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{selectedDatasets[key].name}</span>
                      <div className="icon-button-div">
                        <a
                          value={key}
                          style={{ marginLeft: "1rem" }}
                          onClick={(e) => {
                            confirmInfo(
                              e,
                              () => {
                                let newGlobalData = { ...globalData }
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
                        <a
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
              <Button
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

            <Chips
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
            <ul style={{ padding: "0rem" }}>
              {Object.keys(tagsDict).map((tag, key) => {
                return (
                  <li key={key} style={{ display: "flex", flexDirection: "row" }}>
                    <div key={key} style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "space-between", width: "100%", flexWrap: "wrap" }}>
                      {editingTag === tag ? (
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
                        <span style={{ paddingRight: "0.5rem" }}>{tag}</span>
                      )}
                      <div style={{ right: "0px", display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "space-between", flexWrap: "nowrap" }}>
                        <ColorPicker
                          key={key}
                          value={tagsDict[tag].color}
                          onChange={(e) => {
                            let newTagsDict = { ...tagsDict }
                            newTagsDict[tag].color = "#" + e.value
                            console.log("newTagsDict", newTagsDict)
                            setTagsDict(newTagsDict)
                          }}
                        />
                        <ToggleButton
                          style={{ marginLeft: "0.25rem" }}
                          className="toggle-font-color-button"
                          onChange={(e) => {
                            console.log("e", e.value)
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
                        <a
                          value={tag}
                          style={{ marginLeft: "0.25rem" }}
                          onClick={(e) => {
                            // RENAME TAG
                            setTempTag(tag)
                            setEditingTag(tag)
                            // let newTagsDict = { ...tagsDict }
                          }}
                        >
                          <PencilSquare size={20} />
                        </a>
                        <a
                          value={tag}
                          style={{ marginLeft: "0.25rem" }}
                          onClick={(e) => {
                            let newTagsDict = { ...tagsDict }
                            confirmDanger(
                              e,
                              () => {
                                console.log("tag", tag)

                                delete newTagsDict[tag]
                                setTagsDict(newTagsDict)
                              },
                              () => {
                                console.log("NO")
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
          {/* </Col> */}
        </Row>
        <Row className="justify-content-center">
          <Col md={4} style={{ display: "flex", flexDirection: "column", flexGrow: "1", alignItems: "start", justifyContent: "start", paddingInline: "0rem", marginInline: "0.5rem" }}>
            <h5>Columns</h5>
            <TreeSelect className="small-token" nodeTemplate={columnSelectionTemplate} panelClassName="groupingToolTree" filter value={selectedNodes} options={nodes} metaKeySelection={false} selectionMode="checkbox" display="chip" selectionKeys={selectedNodes} onChange={(e) => setSelectedNodes(e.value)} />
          </Col>
          <Col lg={6} style={{ display: "flex", flexDirection: "column", flexGrow: "1", alignItems: "start", justifyContent: "start", paddingInline: "0rem" }}>
            <h5>Set/Modify Tag</h5>
            <div style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "space-between", width: "100%", flexWrap: "nowrap" }}>
              {/* <Row className="justify-content-center width-100" style={{ display: "flex", flexDirection: "row" }}> */}
              {/* <Col sm> */}
              <p style={{ paddingRight: "0.5rem", minWidth: "fit-content", margin: "0px" }}>Add tag</p>
              {/* </Col> */}
              {/* <Col md={"auto"} > */}
              <MultiSelect
                selectedItemTemplate={customChipRemovable}
                removable={true}
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
                style={{}}
              />
              {/* </Col>
              <Col sm> */}
              {/* Checkmark button to apply */}
              <Button
                className="p-button-success checkmarkButton"
                style={{ width: "fit-content", height: "fit-content", padding: "0.25rem", margin: "0px" }}
                onClick={(e) => {
                  setOverwriteWasAsked(false)
                  console.log("overWrite", overwrite)
                  console.log("overwriteWasAsked", overwriteWasAsked)
                  confirmInfo(
                    e,
                    async () => {
                      let res = await updateNodeTags()
                      console.log("I have waited", res)
                    },
                    () => {
                      console.log("NO")
                    }
                  )
                }}
              >
                {<Check2Square size={30} />}
              </Button>
              {/* </Col> */}
              {/* </Row> */}
            </div>
          </Col>
        </Row>

        <Row className="justify-content-start">
          <Col lg={6} style={{ display: "flex", flexDirection: "row", justifyContent: "center", flexGrow: 0, alignItems: "center", marginTop: "1rem" }} xs></Col>

          <div className="progressBar-merge">{<ProgressBarRequests isUpdating={isProgressUpdating} setIsUpdating={setIsProgressUpdating} progress={progress} setProgress={setProgress} requestTopic={"input/progress/" + pageId} delayMS={50} />}</div>
        </Row>
      </div>
    </>
  )
}

export default GroupingTool
