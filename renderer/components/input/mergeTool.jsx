import React, { useState, useEffect, useContext, useRef } from "react"
import { DataContext } from "../workspace/dataContext"
import { Dropdown } from "primereact/dropdown"
import Row from "react-bootstrap/Row"
import Col from "react-bootstrap/Col"
import { PlusSquare, XSquare } from "react-bootstrap-icons"
import { MultiSelect } from "primereact/multiselect"
import { requestBackend } from "../../utilities/requests"
import { WorkspaceContext } from "../workspace/workspaceContext"
import MedDataObject from "../workspace/medDataObject"
import ProgressBarRequests from "../generalPurpose/progressBarRequests"
import { ErrorRequestContext } from "../generalPurpose/errorRequestContext"
import SaveDataset from "../generalPurpose/saveDataset"
import { cleanString, updateListOfDatasets } from "./simpleToolsUtils"

/**
 * Merging tool
 * @param {string} pageId - The id of the page
 * @param {string} configPath - The path of the config file
 * @returns the merging tool component
 * @summary This component is used to merge datasets together to create a new dataset
 */
const MergeTool = ({ pageId = "42", configPath = null }) => {
  const { port } = useContext(WorkspaceContext) // we get the port for server connexion
  const { setError } = useContext(ErrorRequestContext) // We get the setError function from the context
  const [listOfDatasets, setListOfDatasets] = useState([]) // The list of datasets to show in the dropdown
  const [dictOfDatasets, setDictOfDatasets] = useState({}) // The dict of datasets to show in the dropdown
  const { globalData } = useContext(DataContext) // We get the global data from the context to retrieve the directory tree of the workspace, thus retrieving the data files
  const [firstSelectedDataset, setFirstSelectedDataset] = useState(null) // The first selected dataset
  const [mergeOn, setMergeOn] = useState(null) // The column to merge on
  const [inError, setInError] = useState(false) // If the merge tool is in error
  const [firstDatasetHasChanged, setFirstDatasetHasChanged] = useState(false) // If the first dataset has changed
  const firstMultiselect = useRef(null) // The ref of the first multiselect
  const [newDatasetName, setNewDatasetName] = useState("") // The name of the new dataset
  const [newDatasetExtension, setNewDatasetExtension] = useState("csv") // The extension of the new dataset
  const [progress, setProgress] = useState({ now: 0, currentLabel: "" }) // The progress of the merging
  const [isProgressUpdating, setIsProgressUpdating] = useState(false) // If the progress is updating

  const errorType = {
    // The error types
    MERGE_ON_NOT_PRESENT: "The column to merge on is not present in this dataset",
    NAME_ALREADY_USED: "The name is already used",
    EMPTY_DATASET: "The dataset is empty",
    NO_DATASET_SELECTED: "No dataset selected was selected",
    MERGE_TYPE_NOT_SELECTED: "The merge type was not selected",
    MERGE_ON_NOT_SELECTED: "Merge on was not selected",
    NO_COLUMNS_SELECTED: "No other columns than the merge on column were selected"
  }

  const mergeOptions = [
    // The merge options
    { label: "Left", value: "left" },
    { label: "Right", value: "right" },
    { label: "Inner", value: "inner" },
    { label: "Outer", value: "outer" },
    { label: "Cross", value: "cross" }
  ]

  /**
   * This is a hook that is called when the dictOfDatasets is updated
   * It is used to update the options of the columns of the datasets
   * @returns nothing
   */
  useEffect(() => {
    Object.keys(dictOfDatasets).forEach((key) => {
      if (dictOfDatasets[key] !== null && dictOfDatasets !== undefined) {
        if (dictOfDatasets[key].options === null || dictOfDatasets[key].options === undefined) {
          // eslint-disable-next-line no-extra-semi
          ;(async () => {
            let newDictOfDatasets = { ...dictOfDatasets }
            let columnsOriginal = await globalData[dictOfDatasets[key].data].getColumnsOfTheDataObjectIfItIsATable()
            let columnsOptions = generateColumnsOptionsFromColumns(columnsOriginal)
            newDictOfDatasets[key].options = columnsOptions
            if (key !== "0") {
              if (dictOfDatasets[0].mergeOn) {
                // Check if the mergeOn column is present in the dataset
                if (!columnsOriginal.includes(dictOfDatasets[0].mergeOn)) {
                  newDictOfDatasets[key].isValid = false
                } else {
                  newDictOfDatasets[key].isValid = true
                }
              }
            }

            setDictOfDatasets(newDictOfDatasets)
          })()
        }
      }
    })
  }, [dictOfDatasets])

  /**
   * This function returns the list of datasets without the dataset already used
   * @param {string} index - The index of the dataset we are at
   * @returns the list of datasets without the dataset already used
   */
  const returnListWithoutDatasetAlreadyUsed = (index) => {
    let alreadySelectedDatasets = Object.entries(dictOfDatasets).map((arr) => {
      if (arr[1] && arr[1].data) {
        if (arr[0] !== index) {
          return arr[1].data
        }
      }
    })
    let options = listOfDatasets.filter((dataset) => !alreadySelectedDatasets.includes(dataset.key))
    return options
  }

  /**
   * This function is used to generate the options of the columns from the columns
   * @param {Array} columns - The columns to generate the options from
   * @returns the options of the columns
   * @description The options will be used in the dropdowns and the multiselects
   */
  const generateColumnsOptionsFromColumns = (columns) => {
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

  /**
   * This function is used to add the mergeOn columns to the selected columns if it is not already present in the selected columns
   * and if the mergeOn column is present in the dataset
   * @param {string} datasetKey - The key of the dataset
   * @param {Array} selectedColumns - The selected columns
   * @returns the new selected columns
   */
  const addMergeOnToSelectedColumnsIfPresent = (datasetKey, selectedColumns) => {
    let dataset = dictOfDatasets[datasetKey]
    let newSelectedColumns = selectedColumns

    if (mergeOn && datasetKey) {
      if (dataset && selectedColumns) {
        let options = Object.entries(dataset.options).map((arr) => arr[1].value)
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
   * This hook is called when the mergeOn is updated
   * It is used to check if the mergeOn column is present in the datasets
   * @returns nothing
   */
  useEffect(() => {
    Object.keys(dictOfDatasets).forEach((key) => {
      let datasetToVerify = dictOfDatasets[key]
      if (datasetToVerify) {
        if (datasetToVerify.options !== null && datasetToVerify.options !== undefined) {
          let isValid = datasetToVerify.options.map((option) => option.value).includes(mergeOn)
          let newDictOfDatasets = { ...dictOfDatasets }
          newDictOfDatasets[key].isValid = isValid
          setDictOfDatasets(newDictOfDatasets)
        }
      }
    })
  }, [mergeOn])

  /**
   * This hook is called when a lot of things are updated
   * It is used to check for errors
   * @returns nothing
   */
  useEffect(() => {
    let errors = errorCheck()
    if (errors.length > 0) {
      console.log("errors", errors)
      setInError(true)
    } else {
      setInError(false)
    }
  }, [dictOfDatasets, globalData, mergeOn, newDatasetName, newDatasetExtension])

  /**
   * This function is used to check for errors
   * @returns {Array} the list of errors
   */
  const errorCheck = () => {
    let error = []
    Object.keys(dictOfDatasets).forEach((key) => {
      if (dictOfDatasets[key]) {
        if (dictOfDatasets[key].data === null || dictOfDatasets[key].data === undefined) {
          error.push([errorType.NO_DATASET_SELECTED, dictOfDatasets[key]])
        }
        if (key !== "0") {
          if (dictOfDatasets[key].mergeType === null) {
            error.push([errorType.MERGE_TYPE_NOT_SELECTED, dictOfDatasets[key]])
          }
        }
        if (dictOfDatasets[key].selectedColumns === null || dictOfDatasets[key].selectedColumns === undefined || dictOfDatasets[key].selectedColumns.length === 1) {
          error.push([errorType.NO_COLUMNS_SELECTED, dictOfDatasets[key]])
        }
        if (dictOfDatasets[0].mergeOn === null || dictOfDatasets[0].mergeOn === undefined) {
          error.push([errorType.MERGE_ON_NOT_SELECTED, dictOfDatasets[key]])
        }
      }
    })
    return error
  }

  /**
   * This function is called to handle the first dataset change in the dropdown
   * @returns the columns to return (the selected columns of the first dataset or the options of the first dataset if the first dataset has changed)
   */
  const handleFirstDatasetChange = () => {
    let columnsToReturn = []
    let newOptions = dictOfDatasets[0].options.map((option) => {
      return option.value
    })
    if (firstDatasetHasChanged) {
      let newDictOfDatasets = { ...dictOfDatasets }
      newDictOfDatasets[0].selectedColumns = newOptions
      setFirstDatasetHasChanged(false)
      columnsToReturn = newOptions
    } else {
      columnsToReturn = dictOfDatasets[0].selectedColumns
    }
    return columnsToReturn
  }

  /**
   * This function is called when the user clicks on the merge button
   * It is used to merge the datasets, create a new dataset and update the workspace
   * @param {Boolean} overwrite - True if the dataset should be overwritten, false otherwise
   * @returns nothing
   * @todo Add the tags of the datasets to the new dataset
   */
  const merge = (overwrite = false) => {
    let newDatasetPathParent = globalData[globalData[dictOfDatasets[0].data].parentID].path
    let datasetName = overwrite ? dictOfDatasets[0].nameWithoutExtension + "." + newDatasetExtension : newDatasetName + "." + newDatasetExtension
    let finalDatasetPath = newDatasetPathParent + MedDataObject.getPathSeparator() + datasetName
    let mergedDatasetColumnsTags = {}
    let mergedDatasetTagsDict = {}
    let JSONToSend = { request: "mergeDatasets", pageId: pageId, configPath: configPath, finalDatasetExtension: newDatasetExtension, finalDatasetPath: finalDatasetPath, payload: {} }
    Object.keys(dictOfDatasets).forEach((key) => {
      if (dictOfDatasets[key]) {
        JSONToSend.payload[key] = {
          name: globalData[dictOfDatasets[key].data].name,
          path: globalData[dictOfDatasets[key].data].path,
          extension: globalData[dictOfDatasets[key].data].extension,
          mergeType: dictOfDatasets[key].mergeType,
          mergeOn: dictOfDatasets[0].mergeOn,
          selectedColumns: dictOfDatasets[key].selectedColumns
        }
        dictOfDatasets[key].selectedColumns.forEach((column) => {
          if (globalData[dictOfDatasets[key].data].metadata) {
            if (globalData[dictOfDatasets[key].data].metadata.columnsTag) {
              if (globalData[dictOfDatasets[key].data].metadata.columnsTag[column]) {
                mergedDatasetColumnsTags[column] = globalData[dictOfDatasets[key].data].metadata.columnsTag[column]
              }
            }
          }
        })
        if (globalData[dictOfDatasets[key].data].metadata.tagsDict) {
          mergedDatasetTagsDict = { ...mergedDatasetTagsDict, ...globalData[dictOfDatasets[key].data].metadata.tagsDict }
        }
      }
    })

    requestBackend(
      port,
      "/input/merge_datasets/" + pageId,
      JSONToSend,
      (jsonResponse) => {
        if (jsonResponse.error) {
          if (typeof jsonResponse.error == "string") {
            jsonResponse.error = JSON.parse(jsonResponse.error)
          }
          setError(jsonResponse.error)
        } else {
          setIsProgressUpdating(false)
          console.log("jsonResponse", jsonResponse)
          setProgress({ now: 100, currentLabel: "Merged complete ✅ : " + jsonResponse["finalDatasetPath"] })
          MedDataObject.updateWorkspaceDataObject()
        }
      },
      function (error) {
        setIsProgressUpdating(false)
        console.log("error", error)
      }
    )

    setIsProgressUpdating(true)
  }

  /**
   * This hook is called when the global data is updated
   * It is used to update the list of datasets
   * @returns nothing
   */
  useEffect(() => {
    if (globalData !== null) {
      updateListOfDatasets(globalData, firstSelectedDataset, setListOfDatasets, setFirstSelectedDataset)
    }
  }, [globalData])

  return (
    <>
      <div className="mergeToolMultiSelect">
        <Row className="justify-content-center ">
          <Col
            md={4}
            style={{
              display: "flex",
              flexDirection: "row",
              flexGrow: "1",
              alignItems: "center",
              justifyContent: "center",
              paddingInline: "0rem",
              marginTop: "0.75rem",
              border: "2px solid transparent"
            }}
          >
            <span className="p-float-label" style={{ width: "100%" }}>
              <Dropdown
                className="w-full md:w-14rem padding8px"
                filter
                panelClassName="mergeToolMultiSelect"
                label="Select the first dataset"
                placeholder="First dataset"
                value={firstSelectedDataset ? firstSelectedDataset.getUUID() : null}
                options={listOfDatasets}
                optionLabel="nameWithoutExtension"
                optionValue="key"
                style={firstSelectedDataset ? { border: "1px solid #ced4da" } : { border: "1px solid green" }}
                onChange={(e) => {
                  setFirstDatasetHasChanged(true) // We set the first dataset has changed to true
                  setFirstSelectedDataset(globalData[e.target.value]) // We set the first selected dataset
                  setNewDatasetName(globalData[e.target.value].nameWithoutExtension + "_merged") // We update the name under which to save the new dataset
                  let newDictOfDatasets = dictOfDatasets ? { ...dictOfDatasets } : {} // We create a new dict of datasets
                  delete newDictOfDatasets[0] // We delete the first dataset
                  newDictOfDatasets[0] = {
                    data: e.target.value,
                    nameWithoutExtension: globalData[e.target.value].nameWithoutExtension,
                    columns: globalData[e.target.value].getColumnsOfTheDataObjectIfItIsATable(),
                    mergeOn: null
                  } // We add the new first dataset
                  if (!dictOfDatasets[1] || Object.keys(dictOfDatasets[1]).length === 1) {
                    // If the second dataset is empty, we add a null value to the second dataset
                    newDictOfDatasets[1] = null
                  }
                  setDictOfDatasets(newDictOfDatasets) // We set the new dict of datasets
                }}
              />
              <label htmlFor="in">First dataset</label>
            </span>
          </Col>
          <Col
            md={4}
            style={{
              display: "flex",
              flexDirection: "row",
              flexGrow: "1",
              alignItems: "center",
              justifyContent: "center",
              paddingInline: "0rem",
              marginTop: "0.75rem",
              border: "2px solid transparent"
            }}
          >
            <span className="p-float-label" style={{ width: "100%" }}>
              <Dropdown // The dropdown to select the merge on column
                disabled={dictOfDatasets[0] ? false : true}
                filter
                required={dictOfDatasets[0] ? true : false}
                panelClassName="mergeToolMultiSelect"
                className="w-full md:w-14rem padding8px"
                optionLabel="label"
                value={dictOfDatasets[0] ? dictOfDatasets[0].mergeOn : null}
                optionValue="value"
                options={dictOfDatasets[0] && dictOfDatasets[0].options ? dictOfDatasets[0].options : []}
                label="Select the column to merge on"
                placeholder="Merge on..."
                style={dictOfDatasets[0] && dictOfDatasets[0].mergeOn ? { border: "1px solid #ced4da" } : { border: "1px solid green" }}
                onChange={(e) => {
                  let newDictOfDatasets = dictOfDatasets ? { ...dictOfDatasets } : {} // We create a new dict of datasets
                  newDictOfDatasets[0].mergeOn = e.target.value // We set the merge on column
                  setDictOfDatasets(newDictOfDatasets) // We set the new dict of datasets
                  setMergeOn(e.target.value) // We set the merge on column
                }}
              />
              <label htmlFor="in">Column to merge on</label>
            </span>
          </Col>
          <Col
            md={4}
            style={{
              display: "flex",
              flexDirection: "row",
              flexGrow: "1",
              alignItems: "center",
              justifyContent: "center",
              paddingInline: "0rem",
              marginTop: "0.75rem",
              border: "2px solid transparent"
            }}
          >
            <span className="p-float-label" style={{ width: "100%" }}>
              <MultiSelect // The multiselect to select the columns to merge of the first dataset
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
                    // If the first dataset is not null
                    let newDictOfDatasets = dictOfDatasets ? { ...dictOfDatasets } : {}
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
            // We map the dict of datasets other than the first dataset
            if (key == "0") {
              return <React.Fragment key={key}></React.Fragment>
            }

            let dataset
            if (dictOfDatasets[key] && dictOfDatasets[key].data) {
              dataset = globalData[dictOfDatasets[key].data]
            }
            let isValid = true
            if (dictOfDatasets[key] && dictOfDatasets[0].mergeOn) {
              if (dictOfDatasets[key].isValid !== undefined && dictOfDatasets[key].isValid !== null) {
                isValid = dictOfDatasets[key].isValid
              }
            }

            return (
              <Col className="card" lg={6} key={key + "COLPARENTS"} style={{ paddingBottom: "1rem" }}>
                <Row md={6} key={key + "rowParent"} className="justify-content-center" style={{ paddingTop: "1rem" }}>
                  <Col md={6} key={key + "col1"} style={{ display: "flex", flexDirection: "column", flexGrow: "1", alignItems: "center", justifyContent: "center", flexWrap: "nowrap" }}>
                    <Col key={key + "col2"} style={{ display: "flex", marginBottom: "1rem", flexDirection: "row", flexGrow: "0", alignItems: "center", justifyContent: "center", width: "100%" }}>
                      <h6 key={key + "h6"} style={{ padding: ".25rem", flexGrow: "1" }}>
                        {dictOfDatasets[key] && dictOfDatasets[key].data ? dataset.nameWithoutExtension : "Dataset #" + parseInt(key)}
                      </h6>
                      <a
                        key={key + "a1"}
                        onClick={() => {
                          const newDictOfDatasets = { ...dictOfDatasets } // We create a new dict of datasets
                          delete newDictOfDatasets[key] // We delete the dataset
                          setDictOfDatasets(newDictOfDatasets) // We set the new dict of datasets
                        }}
                      >
                        <XSquare key={key + "xsquare"} size={25} style={{ marginRight: "1rem" }} />
                      </a>
                    </Col>

                    <span key={key + "span 1"} className="p-float-label" style={{ width: "100%" }}>
                      <Dropdown
                        key={key + "dropdown1"}
                        className={`w-full md:w-14rem padding8px ${isValid ? "" : "p-invalid"}`}
                        panelClassName="mergeToolMultiSelect"
                        filter
                        label={`Select dataset #${parseInt(key)}`}
                        placeholder={`Dataset #${parseInt(key)}`}
                        value={dataset && dataset.getUUID() ? dataset.getUUID() : null}
                        options={returnListWithoutDatasetAlreadyUsed(key)}
                        optionLabel="nameWithoutExtension"
                        optionValue="key"
                        style={{ width: "100%" }}
                        onChange={(e) => {
                          // We change the dataset
                          const newDictOfDatasets = { ...dictOfDatasets }
                          newDictOfDatasets[key] = {
                            data: e.target.value,
                            nameWithoutExtension: globalData[e.target.value].nameWithoutExtension,
                            columns: globalData[e.target.value].getColumnsOfTheDataObjectIfItIsATable(),
                            selectedColumns: null,
                            mergeType: null,
                            isValid: false
                          }
                          setDictOfDatasets(newDictOfDatasets)
                        }}
                      />
                      <label key={key + "label dropdown"} htmlFor="in">
                        Dataset #{parseInt(key)}
                      </label>
                    </span>
                    <div key={key + "divider1"} className="divider" />
                    <span key={key + "span2"} className="p-float-label" style={{ width: "100%" }}>
                      <Dropdown
                        key={key + "dropdown2"}
                        disabled={dataset ? false : true}
                        className="w-full md:w-14rem padding8px"
                        panelClassName="mergeToolMultiSelect"
                        value={dictOfDatasets[key] ? dictOfDatasets[key].mergeType : null}
                        options={mergeOptions}
                        label="Select the merge type"
                        placeholder="Merge type"
                        style={{ width: "100%" }}
                        onChange={(e) => {
                          // We change the merge type of the dataset
                          let newDictOfDatasets = dictOfDatasets ? { ...dictOfDatasets } : {}
                          newDictOfDatasets[key].mergeType = e.target.value
                          setDictOfDatasets(newDictOfDatasets)
                        }}
                      />
                      <label key={key + "label2"} htmlFor="in">
                        Merge type
                      </label>
                    </span>
                    <div className="divider" key={key + "divider2"} />
                    <span className="p-float-label" key={key + "span3"} style={{ width: "100%" }}>
                      <MultiSelect
                        key={key + "multiselect1"}
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
                        onFocus={() => {
                          if (dictOfDatasets[key]) {
                            let newDictOfDatasets = dictOfDatasets ? { ...dictOfDatasets } : {}
                            newDictOfDatasets[key].selectedColumns = addMergeOnToSelectedColumnsIfPresent(
                              dictOfDatasets[key],
                              dictOfDatasets[key].selectedColumns ? dictOfDatasets[key].selectedColumns : []
                            )
                            setDictOfDatasets(newDictOfDatasets)
                          }
                        }}
                        onChange={(e) => {
                          // We change the selected columns of the dataset
                          if (isValid) {
                            // If the dataset is valid
                            let newDictOfDatasets = dictOfDatasets ? { ...dictOfDatasets } : {}
                            newDictOfDatasets[key].selectedColumns = e.target.value
                            setDictOfDatasets(newDictOfDatasets)
                          }
                        }}
                      />
                      <label htmlFor="in" key={key + "labelmultiselect"}>
                        Selected columns
                      </label>
                    </span>
                  </Col>
                </Row>
                <Row key={key + "lastRow"} className="justify-content-center">
                  {!isValid && (
                    <span key={key + "last_span"} style={{ color: "red", textAlign: "center" }}>
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
              // We add a new dataset that is null to the dict of datasets
              const newDictOfDatasets = { ...dictOfDatasets }
              newDictOfDatasets[Object.keys(dictOfDatasets).length] = null
              setDictOfDatasets(newDictOfDatasets)
            }}
            style={{ marginLeft: "1rem", display: "flex", flexDirection: "row", flexGrow: "-moz-initial" }}
          >
            <PlusSquare size={35} />
          </a>
        </Col>
        <SaveDataset
          newDatasetName={newDatasetName}
          newDatasetExtension={newDatasetExtension}
          selectedDataset={firstSelectedDataset}
          setNewDatasetName={setNewDatasetName}
          setNewDatasetExtension={setNewDatasetExtension}
          functionToExecute={merge}
          enabled={!inError && firstSelectedDataset && mergeOn && dictOfDatasets[1]}
        />
        <div className="progressBar-merge">
          {
            <ProgressBarRequests
              isUpdating={isProgressUpdating}
              setIsUpdating={setIsProgressUpdating}
              progress={progress}
              setProgress={setProgress}
              requestTopic={"input/progress/" + pageId}
              delayMS={500}
              style={{ width: "100% " }}
            />
          }
        </div>
      </div>
    </>
  )
}

export default MergeTool
