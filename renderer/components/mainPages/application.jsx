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
import { ToggleButton } from "primereact/togglebutton"
import MedDataObject from "../workspace/medDataObject"
import { customZipFile2Object } from "../../utilities/customZipFile"
import { DataContext } from "../workspace/dataContext"
import { Tag } from "primereact/tag"
import { Tooltip } from "primereact/tooltip"
import DataTableWrapper from "../dataTypeVisualisation/dataTableWrapper"
import { deepCopy } from "../../utilities/staticFunctions"

/**
 * 
 * @param {string} pageId The id of the page
 * @param {function} setRequestSettings The function to set the request settings
 * @param {Object} chosenModel The chosen model
 * @param {Object} modelMetadata The metadata of the chosen model
 * @param {function} updateWarnings The function to update the warnings
 * @param {string} mode The mode of the entry
 * @param {function} setMode The function to set the mode
 * @param {function} setIsValid2Predict The function to set the isValid2Predict
 * @param {Object} inputsData The inputs data
 * @param {function} setInputsData The function to set the inputs data
 * 
 * @returns {React.Component} The entry component 
 */
const Entry = ({ pageId, setRequestSettings, chosenModel, modelMetadata, updateWarnings, mode, setMode, setIsValid2Predict, inputsData, setInputsData }) => {
  const [inputTypeChecked, setInputTypeChecked] = useState(false)
  const [chosenDataset, setChosenDataset] = useState(null)
  const [datasetHasWarning, setDatasetHasWarning] = useState({ state: true, tooltip: "No dataset selected" })
  const [isColsValid, setIsColsValid] = useState(false)

  // when the inputs data change, update the isValid2Predict
  useEffect(() => {
    if (modelMetadata) {
      let columns = modelMetadata.columns
      let isValid = true
      console.log("inputsData", inputsData, columns)

      columns.forEach((columnName) => {
        if (columnName != modelMetadata.target) {
          if (inputsData[columnName]) {
            if (typeof inputsData[columnName] == "object") {
              if (!inputsData[columnName][0]) {
                isValid = false
              }
            }
          } else {
            isValid = false
          }
        }
      })
      setIsColsValid(isValid)
    }
  }, [inputsData])

  // when the chosen dataset changes, update the warnings
  useEffect(() => {
    console.log("chosenDataset", chosenDataset)
    updateWarnings(chosenDataset, setDatasetHasWarning)
  }, [chosenDataset])

  // when inputTypeChecked changes, update the mode
  useEffect(() => {
    setMode(inputTypeChecked ? "table" : "unique")
    inputTypeChecked ? setIsValid2Predict(!datasetHasWarning.state) : setIsValid2Predict(isColsValid)
  }, [inputTypeChecked])

  // when the datasetHasWarning changes, update the isValid2Predict
  useEffect(() => {
    mode == "table" && setIsValid2Predict(!datasetHasWarning.state)
  }, [datasetHasWarning])

  // when the isColsValid changes, update the isValid2Predict
  useEffect(() => {
    console.log("isColsValid", isColsValid, "mode", mode)
    mode == "unique" && setIsValid2Predict(isColsValid)
  }, [isColsValid])

  // when the chosen model changes, update the model metadata
  useEffect(() => {
    console.log("chosenModel", chosenModel)
    setInputsData({})
    updateWarnings(chosenDataset, setDatasetHasWarning)
  }, [chosenModel])

  // when the inputs data change, update the request settings
  useEffect(() => {
    setRequestSettings({
      model: chosenModel,
      dataset: chosenDataset,
      data: inputsData,
      type: mode
    })
  }, [chosenModel, chosenDataset, inputsData, mode])

  /**
   *
   * @param {Object} inputUpdate The input update
   */
  const handleInputUpdate = (inputUpdate) => {
    console.log("inputUpdate", inputUpdate)
    let newInputsData = { ...inputsData }
    newInputsData[inputUpdate.name] = [inputUpdate.value]
    setInputsData(newInputsData)
  }

  /**
   *
   * @param {Object} inputUpdate The input update
   */
  const onDatasetChange = (inputUpdate) => {
    console.log("inputUpdate", inputUpdate)
    setChosenDataset(inputUpdate.value)
  }

  return (
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
    </>
  )
}


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
  const { globalData, setGlobalData } = useContext(DataContext)
  const [modelHasWarning, setModelHasWarning] = useState({ state: true, tooltip: "No model selected" })
  const [predictionsColumns, setPredictionsColumns] = useState([])
  const [mode, setMode] = useState("unique")
  const [requestSettings, setRequestSettings] = useState({})

  // when the chosen model changes, update the model metadata
  useEffect(() => {
    console.log("chosenModel", chosenModel)
    chosenModel && setModelMetadata(chosenModel.metadata)
    updateWarnings()
  }, [chosenModel])

  /**
   *
   * @param {String} type The type of prediction to do
   */
  const handlePredictClick = () => {
    console.log("inputsData", inputsData)
    setLoader(true)
    requestBackend(
      port,
      "application/predict/" + pageId,
      requestSettings,
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
  const updateWarnings = async (chosenDataset, setDatasetHasWarning) => {
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
          if (!chosenModel.metadata) {
            try {
              customZipFile2Object(chosenModel.path)
                .then((content) => {
                  console.log("finish customZipFile2Object", content)
                  if (content && Object.keys(content).length > 0) {
                    modelDataObject.metadata.content = content
                    setGlobalData({ ...globalData })
                    let modelData = deepCopy(content.columns).filter((col) => col != content.target)
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
            modelDataObject.metadata.content = chosenModel.metadata
            setGlobalData({ ...globalData })
            let modelData = deepCopy(chosenModel.metadata.columns).filter((col) => col != chosenModel.metadata.target)
            checkWarnings(columnsArray, modelData)
          }
        } else {
          console.log("flag1 - false")

          let modelData = deepCopy(modelDataObject.metadata.content.columns).filter((col) => col != modelDataObject.metadata.content.target)  
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
            <Entry pageId={pageId} setRequestSettings={setRequestSettings} chosenModel={chosenModel} modelMetadata={modelMetadata} updateWarnings={updateWarnings} mode={mode} setMode={setMode} setIsValid2Predict={setIsValid2Predict} inputsData={inputsData} setInputsData={setInputsData} />
            <Button label="Predict" outlined severity="success" onClick={() => handlePredictClick()} disabled={!isValid2Predict} />
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
          </>
        )}
      </Stack>
    </>
  )
}

/**
 * 
 * @param {string} pageId The id of the page
 * @param {string} configPath The path of the config file
 *  
 * @returns {React.Component} The application page with module page
 */
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
