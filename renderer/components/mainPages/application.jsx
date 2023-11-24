import React, { useEffect, useState } from "react"
import ModulePage from "./moduleBasics/modulePage"
import { Col, Row, Stack } from "react-bootstrap"
import Input from "../learning/input"
import { Button } from "primereact/button"
import { requestBackend } from "../../utilities/requests"
import { useContext } from "react"
import { WorkspaceContext } from "../workspace/workspaceContext"
import { ErrorRequestContext } from "../generalPurpose/errorRequestContext"
import { LoaderContext } from "../generalPurpose/loaderContext"
import Image from "next/image"
import { ToggleButton } from "primereact/togglebutton"
import MedDataObject from "../workspace/medDataObject"
import { customZipFile2Object } from "../../utilities/customZipFile"
import { DataContext } from "../workspace/dataContext"
import { Tag } from "primereact/tag"
import { Tooltip } from "primereact/tooltip"
import DataTableWrapper from "../dataTypeVisualisation/dataTableWrapper"
import os from "os"
/**
 *
 * @param {String} pageId The id of the page
 * @returns {React.Component} The application page
 */
const ApplicationPage = ({ pageId }) => {
  const [chosenModel, setChosenModel] = useState("")
  const [modelMetadata, setModelMetadata] = useState(null)
  const [inputsData, setInputsData] = useState({})
  const [predictions, setPredictions] = useState(null)
  const [isValid2Predict, setIsValid2Predict] = useState(false)
  const { port } = useContext(WorkspaceContext)
  const { setError } = useContext(ErrorRequestContext)
  const { setLoader } = useContext(LoaderContext)
  const [quebecFlagDisplay, setQuebecFlagDisplay] = useState(false)
  const [quebecFlagDisplayHeight, setQuebecFlagDisplayHeight] = useState("0px")
  const [inputTypeChecked, setInputTypeChecked] = useState(false)
  const [chosenDataset, setChosenDataset] = useState(null)
  const { globalData, setGlobalData } = useContext(DataContext)
  const [datasetHasWarning, setDatasetHasWarning] = useState({ state: true, tooltip: "No dataset selected" })
  const [modelHasWarning, setModelHasWarning] = useState({ state: true, tooltip: "No model selected" })
  const [predictionsColumns, setPredictionsColumns] = useState([])

  // when the chosen model changes, update the model metadata
  useEffect(() => {
    console.log("chosenModel", chosenModel)
    chosenModel && setModelMetadata(chosenModel.metadata)
    updateWarnings()
  }, [chosenModel])

  // when the chosen dataset changes, update the warnings
  useEffect(() => {
    console.log("chosenDataset", chosenDataset)
    updateWarnings()
  }, [chosenDataset])

  // when the inputs data change, update the isValid2Predict
  useEffect(() => {
    if (modelMetadata) {
      let columns = modelMetadata.columns
      let isValid = true
      columns.forEach((columnName) => {
        if (columnName != modelMetadata.target) {
          if (!inputsData[columnName]) {
            isValid = false
          }
        }
      })
      setIsValid2Predict(isValid)
    }
  }, [inputsData])

  // START - QUEBEC FLAG DISPLAY
  let globalVar = true
  let sequence = []

  // handle hiding and showing the quebec flag
  const handleQuebecFlagDisplay = () => {
    globalVar = !globalVar
    setQuebecFlagDisplay(!globalVar)
    if (!globalVar) {
      setQuebecFlagDisplayHeight("100%")
    } else {
      // wait 4s before hiding the flag
      setTimeout(() => {
        setQuebecFlagDisplayHeight("0px")
      }, 4000)
    }
  }
  //  handle when user press ctrl+m+e+d
  const handleKeyDown = (event) => {
    if (event.key == "Control") {
      sequence = ["Control"]
    } else if (event.key == "m" && sequence[0] == "Control") {
      sequence = ["Control", "m"]
    } else if (event.key == "e" && sequence[1] == "m") {
      sequence = ["Control", "m", "e"]
    } else if (event.key == "d" && sequence[2] == "e") {
      handleQuebecFlagDisplay()
      sequence = []
    } else {
      sequence = []
    }
  }
  // handle when user release ctrl
  const handleKeyUp = (event) => {
    if (event.key == "Control") {
      sequence = []
    }
  }
  // This is a useEffect that will be called when a key is pressed
  useEffect(() => {
    // attach the event listener
    document.addEventListener("keydown", handleKeyDown)
    document.addEventListener("keyup", handleKeyUp)
    // remove the event listener
    return () => {
      document.removeEventListener("keydown", handleKeyDown)
      document.removeEventListener("keyup", handleKeyUp)
    }
  }, [])
  // END - QUEBEC FLAG DISPLAY

  const handleInputUpdate = (inputUpdate) => {
    console.log("inputUpdate", inputUpdate)
    let newInputsData = { ...inputsData }
    newInputsData[inputUpdate.name] = [inputUpdate.value]
    setInputsData(newInputsData)
  }

  /**
   *
   * @param {String} type The type of prediction to do
   */
  const handlePredictClick = (type) => {
    console.log("inputsData", inputsData)
    setLoader(true)
    requestBackend(
      port,
      "application/predict/" + pageId,
      {
        model: chosenModel,
        dataset: chosenDataset,
        data: inputsData,
        type: type
      },
      (response) => {
        console.log("response", response)
        if (response.error) {
          setError(response.error)
          setPredictions(null)
        } else {
          setPredictions(response)
        }
        setLoader(false)
      },
      () => {
        setPredictions(null)
        setLoader(false)
      }
    )
  }

  /**
   *
   * @param {Object} inputUpdate The input update
   */
  const onDatasetChange = (inputUpdate) => {
    console.log("inputUpdate", inputUpdate)
    setChosenDataset(inputUpdate.value)
  }

  // when predictions change, update the columns
  useEffect(() => {
    if (predictions && predictions.resultDataset) {
      console.log("predictions.resultDataset", predictions.resultDataset)
      let predictionsColumns = []
      let columns = Object.keys(predictions.resultDataset[0])
      columns.forEach((col) => {
        let colInfos = {}
        colInfos.title = col
        colInfos.props = {}
        if (col == "pred_" + modelMetadata.target) {
          colInfos.props.frozen = true
          colInfos.props.alignFrozen = "right"
        }
        predictionsColumns.push(colInfos)
      })
      setPredictionsColumns(predictionsColumns)
      console.log(predictions.resultDataset)
    }
  }, [predictions])

  /**
   * @description - This function is used to update the warnings
   */
  const updateWarnings = async () => {
    console.log("updateWarnings")
    setPredictions(null)

    /**
     *
     * @param {Array} columnsArray An array of the columns of the dataset
     * @param {Array} modelData An array of the required columns of the model
     */
    const checkWarnings = (columnsArray, modelData) => {
      let datasetColsString = JSON.stringify(columnsArray)
      let modelColsString = JSON.stringify(modelData)
      if (datasetColsString !== modelColsString && modelData && columnsArray) {
        setDatasetHasWarning({
          state: true,
          tooltip: (
            <>
              <div className="evaluation-tooltip">
                <h4>This dataset does not respect the model format</h4>
                {/* here is a list of the needed columns */}
                <div style={{ maxHeight: "400px", overflowY: "auto", overflowX: "hidden" }}>
                  <Row>
                    <Col>
                      <p>Needed columns:</p>
                      <ul>
                        {modelData.map((col) => {
                          return <li key={col}>{col}</li>
                        })}
                      </ul>
                    </Col>
                    <Col>
                      <p>Received columns:</p>
                      <ul>
                        {columnsArray.map((col) => {
                          return <li key={col}>{col}</li>
                        })}
                      </ul>
                    </Col>
                  </Row>
                </div>
              </div>
            </>
          )
        })
      } else {
        setModelHasWarning({ state: false, tooltip: "" })
      }
    }

    if (chosenModel && chosenDataset && Object.keys(chosenModel).length > 0 && Object.keys(chosenDataset).length > 0 && chosenModel.name != "No selection" && chosenDataset.name != "No selection") {
      //   getting colummns of the dataset
      setLoader(true)
      let { columnsArray } = await MedDataObject.getColumnsFromPath(chosenDataset.path, globalData, setGlobalData)
      setLoader(false)
      //   getting colummns of the model
      let modelDataObject = await MedDataObject.getObjectByPathSync(chosenModel.path, globalData)
      if (modelDataObject) {
        console.log("model columns already loaded ?", modelDataObject.metadata.content)
        if (!modelDataObject.metadata.content) {
          console.log("flag1 - true")
          if (!chosenModel.metadata) {
            console.log("flag2 - true")

            try {
              customZipFile2Object(chosenModel.path)
                .then((content) => {
                  console.log("finish customZipFile2Object", content)
                  if (content && Object.keys(content).length > 0) {
                    modelDataObject.metadata.content = content
                    setGlobalData({ ...globalData })
                    let modelData = content.columns
                    checkWarnings(columnsArray, modelData)
                  }
                })
                .catch((error) => {
                  console.log("error", error)
                })
            } catch (error) {
              console.log("error", error)
            }
          } else {
            console.log("flag2 - false")

            modelDataObject.metadata.content = chosenModel.metadata
            setGlobalData({ ...globalData })
            let modelData = chosenModel.metadata.columns
            checkWarnings(columnsArray, modelData)
          }
        } else {
          console.log("flag1 - false")

          let modelData = modelDataObject.metadata.content.columns
          checkWarnings(columnsArray, modelData)
        }
        console.log("modelDataObject.metadata.content", modelDataObject.metadata.content)
      }
    }
  }

  return (
    <>
      <Stack gap={2}>
        <div className="data-input-tag-right">
          {modelHasWarning.state && (
            <>
              <Tag className={`app-model-warning-tag-${pageId}`} icon="pi pi-exclamation-triangle" severity="warning" value="" rounded data-pr-position="bottom" data-pr-showdelay={200} />
              <Tooltip target={`.app-model-warning-tag-${pageId}`} autoHide={false}>
                <span>{modelHasWarning.tooltip}</span>
              </Tooltip>
            </>
          )}
          <Input name="Choose model" settingInfos={{ type: "models-input", tooltip: "" }} setHasWarning={setModelHasWarning} currentValue={chosenModel} onInputChange={(data) => setChosenModel(data.value)} />
        </div>
        {modelMetadata && (
          <>
            <ToggleButton onLabel="File entry" offLabel="Columns entry" onIcon="pi pi-file-import" offIcon="pi pi-th-large" checked={inputTypeChecked} onChange={(e) => setInputTypeChecked(e.value)} />
            {!inputTypeChecked ? (
              <div className="columns-filling">
                {modelMetadata.columns.map((columnName, index) => {
                  if (columnName != modelMetadata.target) {
                    return <Input key={index} name={columnName} settingInfos={{ type: "string", tooltip: "" }} currentValue={inputsData[columnName] ? inputsData[columnName] : ""} onInputChange={handleInputUpdate} />
                  }
                })}
              </div>
            ) : (
              <div className="data-input-tag-right">
                {datasetHasWarning.state && (
                  <>
                    <Tag className={`app-dataset-warning-tag-${pageId}`} icon="pi pi-exclamation-triangle" severity="warning" value="" rounded data-pr-position="bottom" data-pr-showdelay={200} />
                    <Tooltip target={`.app-dataset-warning-tag-${pageId}`} autoHide={false}>
                      <span>{datasetHasWarning.tooltip}</span>
                    </Tooltip>
                  </>
                )}
                <Input
                  name="files"
                  settingInfos={{
                    type: "data-input",
                    tooltip: "<p>Specify a data file (csv)</p>"
                  }}
                  currentValue={chosenDataset || {}}
                  onInputChange={onDatasetChange}
                  setHasWarning={setDatasetHasWarning}
                />
              </div>
            )}
            {!inputTypeChecked ? (
              <Row className="predictions-row">
                <Col md>
                  <Button label="Predict" outlined severity="success" onClick={() => handlePredictClick("unique")} disabled={!isValid2Predict} />
                </Col>
                <Col md>
                  <div className="pred-text" style={{ opacity: predictions && predictions.prediction ? "1" : "0.5" }}>
                    <h4>
                      {modelMetadata.target}: {predictions && predictions.prediction ? predictions.prediction : "NaN"}
                    </h4>
                  </div>
                </Col>
              </Row>
            ) : (
              <>
                {/* <div className="div-predictions-file"> */}
                <Button label="Predict" outlined severity="success" onClick={() => handlePredictClick("table")} disabled={datasetHasWarning.state || modelHasWarning.state} />
                {predictions && predictions.resultDataset && (
                  <DataTableWrapper
                    data={predictions.resultDataset}
                    tablePropsData={{
                      scrollable: true,
                      scrollHeight: "flex",
                      size: "small",
                      paginator: true,
                      rows: 10
                    }}
                    columns={predictionsColumns}
                  />
                )}
                {/* </div> */}
              </>
            )}
          </>
        )}
        <Image className="quebec-flag" src="/images/QUEBEC-FLAG.jpg" alt="Quebec flag" width="750" height="500" style={{ opacity: quebecFlagDisplay ? "1" : "0", height: quebecFlagDisplayHeight }} />
      </Stack>
    </>
  )
}

const ApplicationPageWithModulePage = ({ pageId = "application-456", configPath = null }) => {
  return (
    <>
      <ModulePage pageId={pageId} configPath={configPath} shadow>
        <div style={{ padding: "0.5rem" }}>
          <ApplicationPage pageId={pageId} configPath={configPath} />
        </div>
      </ModulePage>
    </>
  )
}

export default ApplicationPageWithModulePage
