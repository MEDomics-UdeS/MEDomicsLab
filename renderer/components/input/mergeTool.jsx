import React, { useState, useEffect, useContext, useRef } from "react"
import { AccordionTab } from "primereact/accordion"
import { DataContext } from "../workspace/dataContext"
import { Dropdown } from "primereact/dropdown"
import Row from "react-bootstrap/Row"
import Col from "react-bootstrap/Col"
import { PlusSquare, XSquare } from "react-bootstrap-icons"
import { Button } from "primereact/button"
import { MultiSelect } from "primereact/multiselect"
import { requestJson } from "../../utilities/requests"
import { WorkspaceContext } from "../workspace/workspaceContext"
import MedDataObject from "../workspace/medDataObject"
import { InputText } from "primereact/inputtext"

const MergeTool = ({ pageId = "42", configPath = null }) => {
  const { port } = useContext(WorkspaceContext) // we get the port for server connexion
  const [listOfDatasets, setListOfDatasets] = useState([])
  const [dictOfDatasets, setDictOfDatasets] = useState({})
  const { globalData } = useContext(DataContext)
  const [firstSelectedDataset, setFirstSelectedDataset] = useState(null)
  const [mergeOn, setMergeOn] = useState(null)
  const [inError, setInError] = useState(false)
  const [firstDatasetHasChanged, setFirstDatasetHasChanged] = useState(false)
  const firstMultiselect = useRef(null)
  const [newDatasetName, setNewDatasetName] = useState("")
  const [newDatasetExtension, setNewDatasetExtension] = useState(".csv")

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
        newDatasetList.push({ name: globalData[key].name, object: globalData[key], key: key })
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
    let alreadySelectedDatasets = Object.entries(dictOfDatasets).map((arr, i) => {
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

  const selectorElementWithoutSpecificDataset = (index) => {
    let alreadySelectedDatasets = Object.entries(dictOfDatasets).map((arr, i) => {
      if (i !== index) return arr[1]["_UUID"]
    })
    let options = listOfDatasets.filter((dataset) => !alreadySelectedDatasets.includes(dataset.key))
    let dropdown = (
      <Dropdown
        style={{ width: "100%" }}
        options={options}
        optionLabel="name"
        optionValue="key"
        placeholder="Select a dataset"
        value={dictOfDatasets[index] ? dictOfDatasets[index] : null}
        onChange={(e) => {
          let newDictOfDatasets = dictOfDatasets ? { ...dictOfDatasets } : {}
          // console.log("e", e.target.value, index)
          // newDictOfDatasets[index] = { data: globalData[e.target.value], columns: globalData[e.target.value].getColumnsOfTheDataObjectIfItIsATable() }
          // // console.log("newDictOfDatasets", newDictOfDatasets)
          // setDictOfDatasets(newDictOfDatasets)
        }}
      />
    )
    return (
      <Col style={{ display: "flex", flexDirection: "row", justifyContent: "center", flexGrow: 0, alignItems: "center" }} md={4}>
        {dropdown}
      </Col>
    )
  }

  const updateDatasetSelectorElement = (exceptedDatasets) => {
    let newDatasetSelector = <></>
    // setDatasetSelector(newDatasetSelector)
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

  const getColumnsAsOptionsFromDataset = (dataset) => {
    let options = []
    if (dataset) {
      if (typeof dataset === "string") {
        dataset = globalData[dataset]
      }
      dataset.getColumnsOfTheDataObjectIfItIsATable().then((columns) => {
        options = generateColumnsOptionsFromColumns(columns)
        return options
      })
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

  /**
   * return the options for the columns of a dataset
   * @param {MedDataObject} dataset - the dataset to get the columns from
   * @returns {Array<Object>} options - the options for the columns of a dataset
   */
  const returnColumnsOptions = async (dataset) => {
    let options = []
    if (dataset) {
      if (typeof dataset === "string") {
        dataset = globalData[dataset]
      }

      let columns = await dataset.getColumnsOfTheDataObjectIfItIsATable()
      let options2 = await columns.map((column) => {
        column = cleanString(column)
        return { label: column, value: column }
      })
      return options
    }
  }

  const verifyIfMergeOnColumnIsPresent = async (dataset) => {
    // let columns = dataset.getColumnsOfTheDataObjectIfItIsATable()
    // console.log("VERIFY dataset", dataset)
    // console.log("VERIFY COLUMNS", dictOfDatasets[0].mergeOn)
    if (dataset && dictOfDatasets[0].mergeOn) {
      let columns = await dataset.getColumnsOfTheDataObjectIfItIsATable()
      // console.log("VERIFY COLUMNS 2", columns)
      // console.log("VERIFY COLUMNS 3", columns.includes(dictOfDatasets[0].mergeOn))
      return columns.includes(dictOfDatasets[0].mergeOn)
    } else {
      return false
    }
  }

  const getColumnsFromDict = (index) => {
    let columns = []
    if (dictOfDatasets[index]) {
      columns = dictOfDatasets[index].columns
    }
    return columns
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

  useEffect(() => {
    // console.log("firstSelectedDataset", firstSelectedDataset)
    if (firstSelectedDataset) {
      // ;async () => {
      //   // let columnsOriginal = await globalData[firstSelectedDataset.getUUID()].getColumnsOfTheDataObjectIfItIsATable()
      //   // console.log("Columns", columnsOriginal)
      //   let columnsOptions = generateColumnsOptionsFromColumns(columnsOriginal)
      //   // console.log("columnsOptions", columnsOptions)
      //   let newDictOfDatasets = { ...dictOfDatasets }
      //   // newDictOfDatasets[0].options = columnsOptions
      //   newDictOfDatasets[0].selectedColumns = columnsOptions
      //   setDictOfDatasets(newDictOfDatasets)
      // }
    }
  }, [firstSelectedDataset])

  const handleFirstDatasetChange = () => {
    let columnsToReturn = []
    let newOptions = dictOfDatasets[0].options.map((option) => {
      return option.value
    })
    if (firstDatasetHasChanged) {
      // console.log("firstDatasetHasChanged HERE", firstDatasetHasChanged)
      // console.log("OPTIONS HERE", newOptions)

      let newDictOfDatasets = { ...dictOfDatasets }
      newDictOfDatasets[0].selectedColumns = newOptions
      // setDictOfDatasets(newDictOfDatasets)
      setFirstDatasetHasChanged(false)
      columnsToReturn = newOptions
    } else {
      columnsToReturn = dictOfDatasets[0].selectedColumns
    }
    if (mergeOn) {
      // console.log("MERGE ON ", columnsToReturn, dictOfDatasets[0].mergeOn)
      if (!columnsToReturn.includes(dictOfDatasets[0].mergeOn)) {
        // console.log("MERGE ON NOT PRESENT", columnsToReturn, dictOfDatasets[0].mergeOn)
        columnsToReturn.push(dictOfDatasets[0].mergeOn)
      }
    }
    return columnsToReturn
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

  return (
    <>
      <div className="mergeToolMultiSelect">
        <Row className="justify-content-center ">
          <Col md={4} style={{ display: "flex", flexDirection: "row", flexGrow: "1", alignItems: "center", justifyContent: "center", paddingInline: "0rem" }}>
            {/* <h6 style={{ padding: ".25rem", margin: "0rem", minWidth: "7rem" }}>Main dataset : </h6> */}
            <span className="p-float-label" style={{ width: "100%" }}>
              <Dropdown
                className="w-full md:w-14rem padding8px"
                filter
                panelClassName="mergeToolMultiSelect"
                label="Select the first dataset"
                placeholder="First dataset"
                value={firstSelectedDataset ? firstSelectedDataset.getUUID() : null}
                options={listOfDatasets}
                optionLabel="name"
                optionValue="key"
                style={firstSelectedDataset ? { border: "1px solid #ced4da" } : { border: "1px solid green" }}
                onChange={(e) => {
                  setFirstDatasetHasChanged(true)
                  setFirstSelectedDataset(globalData[e.target.value])
                  let newDictOfDatasets = dictOfDatasets ? { ...dictOfDatasets } : {}
                  delete newDictOfDatasets[0]
                  newDictOfDatasets[0] = { data: e.target.value, columns: globalData[e.target.value].getColumnsOfTheDataObjectIfItIsATable(), mergeOn: null }
                  if (!dictOfDatasets[1] || Object.keys(dictOfDatasets[1]).length === 1) {
                    // console.log("No other dataset")
                    newDictOfDatasets[1] = null
                  }

                  setDictOfDatasets(newDictOfDatasets)
                  // console.log("OPTIONS", returnColumnsOptions(globalData[e.target.value]))
                }}
              />
              <label htmlFor="in">First dataset</label>
            </span>
          </Col>
          <Col md={4} style={{ display: "flex", flexDirection: "row", flexGrow: "1", alignItems: "center", justifyContent: "center", paddingInline: "0.5rem" }}>
            {/* <h6 style={{ padding: ".25rem", margin: "0rem", marginLeft: "0rem", minWidth: "8rem" }}>Column to merge on :</h6> */}
            {/* {const columns = dataset ? globalData[dictOfDatasets[key].data].metadata.columns : null} */}
            <span className="p-float-label" style={{ width: "100%" }}>
              <Dropdown
                disabled={dictOfDatasets[0] ? false : true}
                filter
                panelClassName="mergeToolMultiSelect"
                className="w-full md:w-14rem padding8px"
                optionLabel="label"
                value={dictOfDatasets[0] ? dictOfDatasets[0].mergeOn : null}
                optionValue="value"
                options={dictOfDatasets[0] && dictOfDatasets[0].options ? dictOfDatasets[0].options : []}
                label="Select the column to merge on"
                placeholder="Merge on..."
                style={{ width: "100%" }}
                // style={{ minWidth: "7rem" }}
                onChange={(e) => {
                  let newDictOfDatasets = dictOfDatasets ? { ...dictOfDatasets } : {}
                  newDictOfDatasets[0].mergeOn = e.target.value
                  setDictOfDatasets(newDictOfDatasets)
                  setMergeOn(e.target.value)
                }}
              />
              <label htmlFor="in">Column to merge on</label>
            </span>
          </Col>
          <Col md={4} style={{ display: "flex", flexDirection: "row", flexGrow: "1", alignItems: "center", justifyContent: "center", paddingInline: "0rem" }}>
            <span className="p-float-label" style={{ width: "100%" }}>
              <MultiSelect
                selectAll={true}
                ref={firstMultiselect}
                optionDisabled={(option) => {
                  return option.value === mergeOn
                }}
                panelClassName="mergeToolMultiSelect"
                disabled={firstSelectedDataset && mergeOn ? false : true}
                className="w-full md:w-14rem  margintop8px "
                filter
                value={dictOfDatasets[0] && dictOfDatasets[0].options ? handleFirstDatasetChange() : null}
                display="chip"
                style={{ width: "100%" }}
                placeholder="Select columns to merge"
                options={dictOfDatasets[0] && dictOfDatasets[0].options ? dictOfDatasets[0].options : []}
                panelFooterTemplate={() => {
                  const length = dictOfDatasets[0] && dictOfDatasets[0].selectedColumns ? dictOfDatasets[0].selectedColumns.length : 0
                  return (
                    <div className="p-d-flex p-ai-center p-jc-between" style={{ marginLeft: "8px" }}>
                      <b>{length}</b> item{length > 1 ? "s" : ""} selected
                    </div>
                  )
                }}
                onChange={(e) => {
                  if (dictOfDatasets[0]) {
                    let newDictOfDatasets = dictOfDatasets ? { ...dictOfDatasets } : {}
                    // console.log("e", e, dictOfDatasets[0].options, dictOfDatasets[0].mergeOn)
                    newDictOfDatasets[0].selectedColumns = e.target.value
                    setDictOfDatasets(newDictOfDatasets)
                  }
                }}
              />
              <label htmlFor="in">Selected columns</label>
            </span>
          </Col>
        </Row>
        <Row className="justify-content-center">
          {Object.keys(dictOfDatasets).map((key) => {
            if (key == "0") {
              // console.log("key PREVENT", key)
              return <></>
            }

            // console.log("key", key)

            let dataset
            if (dictOfDatasets[key] && dictOfDatasets[key].data) {
              // console.log("dictOfDatasets[key].data", dictOfDatasets[key].data)
              // // console.log("globalData", globalData)
              dataset = globalData[dictOfDatasets[key].data]
            }
            // console.log("dataset", dataset)
            // console.log("LocalDataset", dictOfDatasets[key])
            // globalData[dictOfDatasets[key].data]
            const columns = dataset ? globalData[dictOfDatasets[key].data].metadata.columns : null
            // const isValid = verifyIfMergeOnColumnIsPresent(dataset) ? true : false
            let isValid = true
            if (dictOfDatasets[key] && dictOfDatasets[0].mergeOn) {
              if (dictOfDatasets[key].isValid !== undefined && dictOfDatasets[key].isValid !== null) {
                isValid = dictOfDatasets[key].isValid
                // console.log("isValid", isValid)
              }
            }

            return (
              <Col className="card" lg={6} key={key + "COLPARENTS"} style={{ paddingBottom: "1rem" }}>
                <Row md={6} key={key + "rowParent"} className="justify-content-center" style={{ paddingTop: "1rem" }}>
                  <Col md={6} key={key + "col1"} style={{ display: "flex", flexDirection: "column", flexGrow: "1", alignItems: "center", justifyContent: "center", flexWrap: "nowrap" }}>
                    <Col style={{ display: "flex", marginBottom: "1rem", flexDirection: "row", flexGrow: "0", alignItems: "center", justifyContent: "center" }}>
                      <h6 style={{ padding: ".25rem", flexGrow: "1" }}>{dictOfDatasets[key] && dictOfDatasets[key].data ? dataset.name : "Dataset #" + parseInt(key)}</h6>
                      <a
                        onClick={() => {
                          const newDictOfDatasets = { ...dictOfDatasets }
                          delete newDictOfDatasets[key]
                          setDictOfDatasets(newDictOfDatasets)
                        }}
                      >
                        <XSquare size={25} style={{ marginRight: "1rem" }} />
                      </a>
                    </Col>

                    {/* <Col md={} key={key + "col2"} style={{ display: "flex", flexDirection: "column", flexGrow: "1", alignItems: "center", justifyContent: "center", marginTop: "1rem" }}> */}
                    <span className="p-float-label" style={{ width: "100%" }}>
                      <Dropdown
                        className={`w-full md:w-14rem padding8px ${isValid ? "" : "p-invalid"}`}
                        panelClassName="mergeToolMultiSelect"
                        filter
                        label={`Select dataset #${parseInt(key)}`}
                        placeholder={`Dataset #${parseInt(key)}`}
                        value={dataset && dataset.getUUID() ? dataset.getUUID() : null}
                        options={returnListWithoutDatasetAlreadyUsed(key)}
                        optionLabel="name"
                        optionValue="key"
                        style={{ width: "100%" }}
                        onChange={(e) => {
                          const newDictOfDatasets = { ...dictOfDatasets }
                          newDictOfDatasets[key] = { data: e.target.value, columns: globalData[e.target.value].getColumnsOfTheDataObjectIfItIsATable(), selectedColumns: null, mergeType: null, isValid: false }

                          setDictOfDatasets(newDictOfDatasets)
                          // console.log(e)
                        }}
                      />
                      <label htmlFor="in">Dataset #{parseInt(key)}</label>
                    </span>
                    <div className="divider" />
                    <span className="p-float-label" style={{ width: "100%" }}>
                      <Dropdown
                        disabled={dataset ? false : true}
                        className="w-full md:w-14rem padding8px"
                        panelClassName="mergeToolMultiSelect"
                        value={dictOfDatasets[key] ? dictOfDatasets[key].mergeType : null}
                        options={mergeOptions}
                        label="Select the merge type"
                        placeholder="Merge type"
                        style={{ width: "100%" }}
                        onChange={(e) => {
                          let newDictOfDatasets = dictOfDatasets ? { ...dictOfDatasets } : {}
                          newDictOfDatasets[key].mergeType = e.target.value
                          setDictOfDatasets(newDictOfDatasets)
                        }}
                      />
                      <label htmlFor="in">Merge type</label>
                    </span>
                    <div className="divider" />
                    <span className="p-float-label" style={{ width: "100%" }}>
                      <MultiSelect
                        optionDisabled={(option) => {
                          return option.value === mergeOn
                        }}
                        panelClassName="mergeToolMultiSelect"
                        disabled={dataset ? false : true}
                        className="w-full md:w-14rem  margintop8px "
                        filter
                        value={dictOfDatasets[key] && isValid && dataset ? addMergeOnToSelectedColumnsIfPresent(key, dictOfDatasets[key].selectedColumns) : null}
                        display="chip"
                        style={{ width: "100%" }}
                        placeholder="Select columns to merge"
                        options={dictOfDatasets[key] && dictOfDatasets[key].options ? dictOfDatasets[key].options : []}
                        panelFooterTemplate={() => {
                          const length = dictOfDatasets[key] && dictOfDatasets[key].selectedColumns ? dictOfDatasets[key].selectedColumns.length : 0
                          return (
                            <div className="p-d-flex p-ai-center p-jc-between" style={{ marginLeft: "8px" }}>
                              <b>{length}</b> item{length > 1 ? "s" : ""} selected
                            </div>
                          )
                        }}
                        onFocus={(e) => {
                          // console.log("FOCUS", e)
                          if (dictOfDatasets[key]) {
                            // console.log("FOCUS INNER", e)
                            let newDictOfDatasets = dictOfDatasets ? { ...dictOfDatasets } : {}
                            newDictOfDatasets[key].selectedColumns = addMergeOnToSelectedColumnsIfPresent(dictOfDatasets[key], dictOfDatasets[key].selectedColumns ? dictOfDatasets[key].selectedColumns : [])
                            setDictOfDatasets(newDictOfDatasets)
                          }
                        }}
                        onChange={(e) => {
                          if (isValid) {
                            let newDictOfDatasets = dictOfDatasets ? { ...dictOfDatasets } : {}
                            // console.log("e", e, dictOfDatasets[key].options, dictOfDatasets[0].mergeOn)
                            newDictOfDatasets[key].selectedColumns = e.target.value
                            setDictOfDatasets(newDictOfDatasets)
                          }
                        }}
                      />
                      <label htmlFor="in">Selected columns</label>
                    </span>
                    {/* </Col> */}
                  </Col>
                </Row>
                <Row key={key + "lastRow"} className="justify-content-center">
                  {!isValid && (
                    <span style={{ color: "red", textAlign: "center" }}>
                      The column to merge on <b>({dictOfDatasets[0].mergeOn})</b> is not present in this dataset
                    </span>
                  )}
                </Row>
              </Col>
            )
          })}
        </Row>
        <Col style={{ display: "flex", flexDirection: "row", justifyContent: "center", flexGrow: 0, alignItems: "center", marginTop: "1rem" }} xs>
          <a
            onClick={() => {
              const newDictOfDatasets = { ...dictOfDatasets }
              newDictOfDatasets[Object.keys(dictOfDatasets).length] = null
              setDictOfDatasets(newDictOfDatasets)
            }}
            style={{ marginLeft: "1rem", display: "flex", flexDirection: "row", flexGrow: "-moz-initial" }}
          >
            <PlusSquare size={35} />
          </a>
        </Col>
        <Row className="justify-content-start">
          <Col style={{ display: "flex", flexDirection: "row", justifyContent: "center", flexGrow: 0, alignItems: "center", marginTop: "1rem" }} xs>
            <Button
              label="Merge"
              style={{ position: "relative", display: "flex", alignSelf: "end", alignItems: "flex-end", justifyContent: "flex-end", justifySelf: "flex-end" }}
              onClick={(e) => {
                let firstDatasetObject = globalData[dictOfDatasets[0].data]
                let newDatasetPathParent = globalData[globalData[dictOfDatasets[0].data].parentID].path
                let datasetName = newDatasetName.length > 0 ? newDatasetName : "mergedDataset"
                datasetName = datasetName + newDatasetExtension
                let newDatasetObject = new MedDataObject({
                  originalName: datasetName,
                  name: datasetName,
                  type: "file",
                  parentID: globalData[dictOfDatasets[0].data].parentID,
                  path: newDatasetPathParent + MedDataObject.getPathSeparator() + datasetName
                })
                // newDatasetObject.extension = "csv"

                let JSONToSend = { request: "mergeDatasets", pageId: pageId, configPath: configPath, finalDatasetExtension: newDatasetExtension, finalDatasetPath: newDatasetObject.path, payload: {} }
                Object.keys(dictOfDatasets).forEach((key) => {
                  if (dictOfDatasets[key]) {
                    JSONToSend.payload[key] = {
                      path: globalData[dictOfDatasets[key].data].path,
                      extension: globalData[dictOfDatasets[key].data].extension,
                      mergeType: dictOfDatasets[key].mergeType,
                      mergeOn: dictOfDatasets[0].mergeOn,
                      selectedColumns: dictOfDatasets[key].selectedColumns
                    }
                  }
                })
                newDatasetObject.relatedInformation = JSONToSend

                // console.log("JSONToSend", JSONToSend)
                requestJson(
                  port,
                  "/input/merge_datasets",
                  JSONToSend,
                  (jsonResponse) => {
                    console.log("jsonResponse", jsonResponse)
                  },
                  function (error) {
                    console.log("error", error)
                  }
                )
              }}
            />
          </Col>
          <Col style={{ display: "flex", flexDirection: "row", justifyContent: "center", flexGrow: 0, alignItems: "center", marginTop: "1rem" }} xs>
            <div className="p-input-group flex-1 dataset-name" style={{ display: "flex", flexDirection: "row" }}>
              <InputText
                placeholder="Dataset name"
                keyfilter={"alphanum"}
                onChange={(e) => {
                  setNewDatasetName(e.target.value)
                }}
              />
              <span className="p-inputgroup-addon">
                <Dropdown
                  // className="p-ml-2"
                  panelClassName="dataset-name"
                  value={newDatasetExtension}
                  options={[
                    { label: ".csv", value: ".csv" },
                    { label: ".json", value: ".json" },
                    { label: ".xlsx", value: ".xlsx" }
                  ]}
                  onChange={(e) => {
                    setNewDatasetExtension(e.target.value)
                  }}
                />
              </span>
            </div>
          </Col>
        </Row>
      </div>
    </>
  )
}

export default MergeTool
// export { MergeTool }
