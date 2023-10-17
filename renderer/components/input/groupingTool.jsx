import React, { useState, useEffect, useContext, useRef } from "react"
import { AccordionTab } from "primereact/accordion"
import { DataContext } from "../workspace/dataContext"
import { Dropdown } from "primereact/dropdown"
import Row from "react-bootstrap/Row"
import Col from "react-bootstrap/Col"
import { PlusSquare, XSquare, PencilSquare } from "react-bootstrap-icons"
import { Button } from "primereact/button"
import { MultiSelect } from "primereact/multiselect"
import { requestJson } from "../../utilities/requests"
import { WorkspaceContext } from "../workspace/workspaceContext"
import MedDataObject from "../workspace/medDataObject"
import { InputText } from "primereact/inputtext"
import ProgressBarRequests from "../flow/progressBarRequests"
import { Chips } from "primereact/chips"
import ListBoxSelector from "../mainPages/dataComponents/listBoxSelector"
import { ColorPicker } from "primereact/colorpicker"
import { ConfirmPopup, confirmPopup } from "primereact/confirmpopup"
import { TreeSelect } from "primereact/treeselect"

const GroupingTool = ({ pageId = "42-grouping", configPath = null }) => {
  const { port } = useContext(WorkspaceContext) // we get the port for server connexion
  const [listOfDatasets, setListOfDatasets] = useState([])
  const [dictOfDatasets, setDictOfDatasets] = useState({})
  const { globalData } = useContext(DataContext)
  const [selectedDatasets, setSelectedDatasets] = useState({})
  const [firstSelectedDataset, setFirstSelectedDataset] = useState(null)
  const [mergeOn, setMergeOn] = useState(null)
  const [inError, setInError] = useState(false)
  const [firstDatasetHasChanged, setFirstDatasetHasChanged] = useState(false)
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

  useEffect(() => {
    Object.keys(dictOfDatasets).forEach((key) => {
      if (dictOfDatasets[key] !== null && dictOfDatasets !== undefined) {
        if (dictOfDatasets[key].options === null || dictOfDatasets[key].options === undefined) {
          ;(async () => {
            let newDictOfDatasets = { ...dictOfDatasets }
            let columnsOriginal = await globalData[dictOfDatasets[key].data].getColumnsOfTheDataObjectIfItIsATable()
            // console.log("Columns", columnsOriginal)
            let columnsOptions = generateColumnsOptionsFromColumns(columnsOriginal)
            // console.log("newDictOfDatasets", newDictOfDatasets, key)
            newDictOfDatasets[key].options = columnsOptions
            if (key !== "0") {
              if (dictOfDatasets[0].mergeOn) {
                // Check if the mergeOn column is present in the dataset
                if (!columnsOriginal.includes(dictOfDatasets[0].mergeOn)) {
                  // console.log("MERGE ON NOT PRESENT")
                  newDictOfDatasets[key].isValid = false
                } else {
                  // console.log("MERGE ON PRESENT")
                  newDictOfDatasets[key].isValid = true
                }
              }
            }
            // if (key === "0" && firstDatasetHasChanged) {
            //   // console.log("firstDatasetHasChanged", firstDatasetHasChanged)
            //   newDictOfDatasets[key].selectedColumns = columnsOptions
            //   setFirstDatasetHasChanged(false)
            // }
            // }
            setDictOfDatasets(newDictOfDatasets)
          })()
        }
      }
    })
  }, [dictOfDatasets])

  const returnListWithoutDatasetAlreadyUsed = (index) => {
    // Object.keys(dictOfDatasets).forEach((key) => {

    // console.log("DictOfDatasets", dictOfDatasets)
    let alreadySelectedDatasets = Object.entries(dictOfDatasets).map((arr) => {
      // console.log("arr", arr, i, index)
      if (arr[1] && arr[1].data) {
        if (arr[0] !== index) {
          return arr[1].data
        }
      }
    })
    // console.log("alreadySelectedDatasets", alreadySelectedDatasets)
    let options = listOfDatasets.filter((dataset) => !alreadySelectedDatasets.includes(dataset.key))
    // console.log("options", options)
    return options
  }

  const cleanString = (string) => {
    // if String has spaces or "", erase them
    if (string.includes(" ") || string.includes('"')) {
      string = string.replaceAll(" ", "")
      string = string.replaceAll('"', "")
    }
    return string
  }

  const generateColumnsOptionsFromColumns = (columns) => {
    // console.log("columns", columns)
    let options = []
    if (columns === null || columns === undefined) {
      return options
    } else {
      columns.forEach((column) => {
        column = cleanString(column)
        options.push({ label: column, value: column })
      })
      return options
    }
  }

  const addMergeOnToSelectedColumnsIfPresent = (datasetKey, selectedColumns) => {
    let dataset = dictOfDatasets[datasetKey]
    let newSelectedColumns = selectedColumns
    // console.log("datasetKey", datasetKey)

    if (mergeOn && datasetKey) {
      if (dataset && selectedColumns) {
        let options = Object.entries(dataset.options).map((arr) => arr[1].value)
        // console.log("HERE options", options)
        if (!selectedColumns.includes(mergeOn)) {
          if (options.includes(mergeOn)) {
            newSelectedColumns.push(mergeOn)
          }
        }
      }
    }

    return newSelectedColumns
  }

  useEffect(() => {
    // console.log("mergeOn", mergeOn)
    Object.keys(dictOfDatasets).forEach((key) => {
      let datasetToVerify = dictOfDatasets[key]
      if (datasetToVerify) {
        if (datasetToVerify.options !== null && datasetToVerify.options !== undefined) {
          let isValid = datasetToVerify.options.map((option) => option.value).includes(mergeOn)
          // console.log("isValid", isValid)
          let newDictOfDatasets = { ...dictOfDatasets }
          newDictOfDatasets[key].isValid = isValid
          setDictOfDatasets(newDictOfDatasets)
        }
      }
    })
  }, [mergeOn])

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
    // // console.log("dictOfDatasets", dictOfDatasets)
    // // console.log("REF", firstMultiselect.current)
  }, [dictOfDatasets])

  useEffect(() => {
    console.log("newDatasetName", newDatasetName)
  }, [newDatasetName])

  useEffect(() => {
    console.log("newDatasetExtension", newDatasetExtension)
  }, [newDatasetExtension])

  useEffect(() => {
    console.log("selectedDatasets", selectedDatasets)
    let newNodes = []
    console.log("selectedDatasets", selectedDatasets)
    Object.keys(selectedDatasets).forEach((key) => {
      let dataset = selectedDatasets[key]
      let datasetChildren = []
      if (dataset) {
        if (dataset.selectedColumns) {
          dataset.selectedColumns.forEach((column) => {
            datasetChildren.push({ label: column, value: column })
          })
        }
      }
      newNodes.push({ label: dataset.name, value: dataset.name, children: datasetChildren })
    })
    setNodes(newNodes)
  }, [selectedDatasets])

  const confirmDelete = (event, acceptCB, rejectCB) => {
    confirmPopup({
      target: event.currentTarget,
      message: "Do you want to proceed?",
      icon: "pi pi-exclamation-triangle",
      acceptClassName: "p-button-danger",
      accept: acceptCB,
      reject: rejectCB
    })
  }

  const handleTagsCreation = (e) => {
    let tagsList = e.value
    if (tagsList.length > 0) {
      let newTagsDict = {}
      tagsList.forEach((tag) => {
        if (tagsDict[tag]) {
          newTagsDict[tag] = tagsDict[tag]
        } else {
          newTagsDict[tag] = { color: "#000000", datasets: {} }
        }
      })
      setTagsDict(newTagsDict)
    }
  }

  return (
    <>
      <div className="groupingTool mergeToolMultiSelect">
        <Row className="justify-content-center ">
          <Col md={4} style={{ display: "flex", flexDirection: "row", flexGrow: "1", alignItems: "center", justifyContent: "start", paddingInline: "0rem" }}>
            <Col md={4} style={{ display: "flex", flexDirection: "column", flexGrow: "1", alignItems: "start", justifyContent: "start", paddingInline: "0rem" }}>
              <h6> Select the datasets you want to tag</h6>
              <MultiSelect
                display="chip"
                ref={firstMultiselect}
                className="w-full md:w-14rem margintop8px"
                value={
                  Object.keys(selectedDatasets).length !== 0
                    ? Object.entries(selectedDatasets).map((arr) => {
                        console.log("arr", arr)
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
                      let columns = getColumnsFromPromise(globalData[value.key])
                      // console.log("columns", columns)
                      newSelectedDatasetsDict[value.key] = { name: value.name, columns: getColumnsFromPromise(globalData[value.key]), selectedColumns: null, mergeType: null, isValid: false }
                    }
                  })
                  setSelectedDatasets(newSelectedDatasetsDict)
                }}
                optionLabel="name"
                placeholder="Select a dataset"
                style={{ width: "100%", marginRight: "0.5rem" }}
              />
            </Col>
            <Col md={4} style={{ display: "flex", flexDirection: "column", flexGrow: "1", alignItems: "start", justifyContent: "start", paddingInline: "0rem" }}>
              <h5 style={{ paddingBottom: "0rem" }}> Create your tags</h5>
              <Chips
                value={Object.keys(tagsDict)}
                removable={false}
                onChange={(e) => {
                  handleTagsCreation(e)
                }}
              />
            </Col>
            <Col md={2} style={{ display: "flex", flexDirection: "column", flexGrow: "1", alignItems: "start", justifyContent: "start", paddingInline: "0.5rem" }}>
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
                        <div style={{ right: "0px", display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap" }}>
                          <ColorPicker
                            key={key}
                            value={tagsDict[tag].color}
                            onChange={(e) => {
                              let newTagsDict = { ...tagsDict }
                              newTagsDict[tag].color = e.value
                              setTagsDict(newTagsDict)
                            }}
                          />
                          <a
                            value={tag}
                            style={{ marginLeft: "1rem" }}
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
                            style={{ marginLeft: "1rem" }}
                            onClick={(e) => {
                              let newTagsDict = { ...tagsDict }
                              confirmDelete(
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
          </Col>
        </Row>
        <Row className="justify-content-center">
          <Col md={4} style={{ display: "flex", flexDirection: "column", flexGrow: "1", alignItems: "start", justifyContent: "start", paddingInline: "0rem" }}>
            <h5>Columns</h5>
            <TreeSelect value={selectedNodes} options={nodes} metaKeySelection={false} selectionMode="checkbox" display="chip" selectionKeys={selectedNodes} onChange={(e) => setSelectedNodes(e.value)} style={{ width: "100%", marginRight: "0.5rem" }} />
          </Col>
          <Col md={4} style={{ display: "flex", flexDirection: "column", flexGrow: "1", alignItems: "start", justifyContent: "start", paddingInline: "0rem" }}>
            <h5></h5>
          </Col>
        </Row>

        <Row className="justify-content-start">
          <Col style={{ display: "flex", flexDirection: "row", justifyContent: "center", flexGrow: 0, alignItems: "center", marginTop: "1rem" }} xs></Col>

          <div className="progressBar-merge">{<ProgressBarRequests isUpdating={isProgressUpdating} setIsUpdating={setIsProgressUpdating} progress={progress} setProgress={setProgress} requestTopic={"input/progress/" + pageId} delayMS={50} />}</div>
        </Row>
      </div>
    </>
  )
}

export default GroupingTool
