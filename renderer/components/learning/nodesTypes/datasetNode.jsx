import React, { useState, useContext, useEffect } from "react"
import Node from "../../flow/node"
import Input from "../input"
import { Button } from "react-bootstrap"
import ModalSettingsChooser from "../modalSettingsChooser"
import * as Icon from "react-bootstrap-icons"
import { FlowFunctionsContext } from "../../flow/context/flowFunctionsContext"
import { Stack } from "react-bootstrap"
import Form from "react-bootstrap/Form"
import Path from "path"
import { DataContext } from "../../workspace/dataContext"
import MedDataObject from "../../workspace/medDataObject"

/**
 *
 * @param {string} id id of the node
 * @param {object} data data of the node
 * @returns {JSX.Element} A StandardNode node
 *
 * @description
 * This component is used to display a StandardNode node.
 * it handles the display of the node and the modal
 *
 */
const DatasetNode = ({ id, data }) => {
  const [modalShow, setModalShow] = useState(false) // state of the modal
  const [selection, setSelection] = useState(data.internal.selection)
  const { updateNode } = useContext(FlowFunctionsContext)
  const { globalData, setGlobalData } = useContext(DataContext)

  // update the node internal data when the selection changes
  useEffect(() => {
    data.internal.selection = selection
    data.internal.hasWarning = { state: true, tooltip: <p>Some default feilds are missing</p> }
    updateNode({
      id: id,
      updatedData: data.internal
    })
  }, [selection])

  // update the node internal data when the selection changes
  useEffect(() => {
    if (data.internal.settings.files && data.internal.settings.files.path == "") {
      data.internal.hasWarning = { state: true, tooltip: <p>No file selected</p> }
    } else {
      data.internal.hasWarning = { state: false }
    }
    updateNode({
      id: id,
      updatedData: data.internal
    })
  }, [])

  // update the node when the selection changes
  const onSelectionChange = (e) => {
    setSelection(e.target.value)
    data.internal.settings = {}
    data.internal.checkedOptions = []
    e.stopPropagation()
    e.preventDefault()
    console.log("onselectionchange", e.target.value)
  }

  /**
   *
   * @param {Object} inputUpdate The input update
   *
   * @description
   * This function is used to update the node internal data when an input changes.
   * Custom to this node, it also updates the global data when the files input changes.
   */
  const onInputChange = (inputUpdate) => {
    data.internal.settings[inputUpdate.name] = inputUpdate.value
    if (inputUpdate.name == "files" || inputUpdate.name == "target") {
      setGlobalData({ ...globalData })
    }
    updateNode({
      id: id,
      updatedData: data.internal
    })
  }

  /**
   *
   * @param {Object} hasWarning The warning object
   *
   * @description
   * This function is used to update the node internal data when a warning is triggered from the Input component.
   */
  const handleWarning = (hasWarning) => {
    data.internal.hasWarning = hasWarning
    updateNode({
      id: id,
      updatedData: data.internal
    })
  }

  /**
   * Loads the data from the file associated with the `MedDataObject` instance.
   */
  const loadDataFromDisk = async (filePath) => {
    let extension = Path.extname(filePath).slice(1)
    console.log("extension: ", extension)
    // let path = this.path
    let data = undefined
    const dfd = require("danfojs-node")

    // let filePath = Path.(this.path)
    if (extension === "xlsx") {
      data = await dfd.readExcel(filePath)
    } else if (extension === "csv") {
      data = await dfd.readCSV(filePath)
    } else if (extension === "json") {
      data = await dfd.readJSON(filePath)
    }
    return data
  }

  /**
   * GetsTheColumnsOfTheDataObjectIfItIsATable
   * @returns {Array} - The columns of the data object if it is a table.
   */
  const getColumnsOfTheDataObjectIfItIsATable = async (path) => {
    let newColumns = []
    const data = await loadDataFromDisk(path)
    console.log("data: ", data)
    if (data.$columns) {
      newColumns = data.$columns
    }
    return newColumns
  }

  /**
   *
   * @param {Object} inputUpdate The input update
   *
   * @description
   * This function is used to update the node internal data when the files input changes.
   */
  const onFilesChange = async (inputUpdate) => {
    data.internal.settings[inputUpdate.name] = inputUpdate.value
    if (inputUpdate.value.path != "") {
      let { columnsArray, columnsObject } = await getColumnsFromPath(inputUpdate.value.path)
      data.internal.settings.columns = columnsObject
      data.internal.settings.target = columnsArray[columnsArray.length - 1]
    } else {
      delete data.internal.settings.target
      delete data.internal.settings.columns
    }
    updateNode({
      id: id,
      updatedData: data.internal
    })
  }

  /**
   *
   * @param {String} path A path to a MedDataObject
   * @returns {Object, Object} - {columnsArray, columnsObject} - The columns of the data object if it is a table.
   */
  const getColumnsFromPath = async (path) => {
    let dataObject = MedDataObject.checkIfMedDataObjectInContextbyPath(path, globalData)
    let columnsArray = []
    if (dataObject.metadata.columns) {
      columnsArray = dataObject.metadata.columns
    } else {
      columnsArray = await getColumnsOfTheDataObjectIfItIsATable(path)
      dataObject.metadata.columns = columnsArray
      setGlobalData({ ...globalData })
    }
    let columnsObject = {}
    columnsArray.forEach((element) => {
      columnsObject[element] = element
    })

    return { columnsArray: columnsArray, columnsObject: columnsObject }
  }

  return (
    <>
      {/* build on top of the Node component */}
      <Node
        key={id}
        id={id}
        data={data}
        setupParam={data.setupParam}
        // the body of the node is a form select (particular to this node)
        nodeBody={
          <>
            <Form.Select
              aria-label="machine learning model"
              onChange={onSelectionChange}
              defaultValue={data.internal.selection}
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
              }}
            >
              <option
                key="medomics"
                value="medomics"
                // selected={optionName === selection}
              >
                MEDomics Lab standard
              </option>
              <option
                key="custom"
                value="custom"
                // selected={optionName === selection}
              >
                Custom data file
              </option>
            </Form.Select>
          </>
        }
        // default settings are the default settings of the node, so mandatory settings
        defaultSettings={
          <>
            <Stack id="default" direction="vertical" gap={1}>
              {(() => {
                switch (data.internal.selection) {
                  case "medomics":
                    return <></>
                  case "custom":
                    return (
                      <>
                        <Input
                          name="files"
                          settingInfos={{
                            type: "data-input",
                            tooltip: "<p>Specify a data file (xlsx, csv, json)</p>"
                          }}
                          currentValue={data.internal.settings.files || {}}
                          onInputChange={onFilesChange}
                          setHasWarning={handleWarning}
                        />
                        <Input
                          disabled={data.internal.settings.files && data.internal.settings.files.path == ""}
                          name="target"
                          currentValue={data.internal.settings.target}
                          settingInfos={{
                            type: "list",
                            tooltip: "<p>Specify the column name of the target variable</p>",
                            choices: data.internal.settings.columns || {}
                          }}
                          onInputChange={onInputChange}
                        />
                      </>
                    )
                  default:
                    return null
                }
              })()}
            </Stack>
          </>
        }
        // node specific is the body of the node, so optional settings
        nodeSpecific={
          <>
            {/* the button to open the modal (the plus sign)*/}
            <Button variant="light" className="width-100 btn-contour" onClick={() => setModalShow(true)}>
              <Icon.Plus width="30px" height="30px" className="img-fluid" />
            </Button>
            {/* the modal component*/}
            <ModalSettingsChooser show={modalShow} onHide={() => setModalShow(false)} options={data.setupParam.possibleSettings.options} data={data} id={id} />
            {/* the inputs for the options */}
            {data.internal.checkedOptions.map((optionName) => {
              return <Input key={optionName} name={optionName} settingInfos={data.setupParam.possibleSettings.options[optionName]} currentValue={data.internal.settings[optionName]} onInputChange={onInputChange} />
            })}
          </>
        }
      />
    </>
  )
}

export default DatasetNode
