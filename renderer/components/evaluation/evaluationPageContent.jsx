import React, { useCallback, useContext, useEffect, useState } from "react"
import { PageInfosContext } from "../mainPages/moduleBasics/pageInfosContext"
import { DataContext } from "../workspace/dataContext"
import MedDataObject from "../workspace/medDataObject"
import { LoaderContext } from "../generalPurpose/loaderContext"
import { Col, Row } from "react-bootstrap"
import { toast } from "react-toastify"
import { modifyZipFileSync, customZipFile2Object } from "../../utilities/customZipFile"
import { WorkspaceContext } from "../workspace/workspaceContext"
import { requestBackend } from "../../utilities/requests"
import PageConfig from "./pageConfig"
import PageEval from "./pageEval"
import { writeJsonSync } from "../../utilities/fileManagementUtils"

/**
 * @description - This component is the evaluation page content component, it handles medeval config and evaluation
 * @returns the evaluation page content
 */
const EvaluationPageContent = () => {
  const { config, pageId, configPath, setConfig } = useContext(PageInfosContext)
  const [chosenModel, setChosenModel] = useState(config && config.model && Object.keys(config.model).length > 0 ? config.model : {})
  const [chosenDataset, setChosenDataset] = useState(config && config.dataset && Object.keys(config.dataset).length > 0 ? config.dataset : {})
  const [modelHasWarning, setModelHasWarning] = useState({ state: false, tooltip: "" })
  const [datasetHasWarning, setDatasetHasWarning] = useState({ state: false, tooltip: "" })
  const { globalData, setGlobalData } = useContext(DataContext)
  const { setLoader } = useContext(LoaderContext)
  const { port } = useContext(WorkspaceContext) // we get the port for server connexion
  const [run, setRun] = useState(false)

  // handle updating the config when the chosen model changes
  useEffect(() => {
    console.log("chosenModel changed", chosenModel)
    updateConfig("model", chosenModel)
  }, [chosenModel])

  // handle updating the config when the chosen dataset changes
  useEffect(() => {
    console.log("chosenDataset changed", chosenDataset)
    updateConfig("dataset", chosenDataset)
  }, [chosenDataset])

  // when the config changes, we update the warnings
  useEffect(() => {
    console.log("new config", config)
    if (config) {
      if (Object.keys(config).length > 0) {
        console.log("config in if", Object.keys(config).length)
        updateWarnings(config.useMedStandard)
      }
    } else {
      let newConfig = {}
      setConfig(newConfig)
    }
  }, [config])

  /**
   * @description - This function is used to update the config
   */
  const updateConfig = useCallback(
    (type, data) => {
      console.log("updateConfig, current config:", config)
      let newConfig = { ...config }
      if (type == "model") {
        newConfig.model = data
      } else if (type == "dataset") {
        newConfig.dataset = data
      }
      setConfig(newConfig)
    },
    [config]
  )

  /**
   * @description - This function is used to update the config WHEN THE USER CLICKS ON THE UPDATE CONFIG BUTTON
   */
  const updateConfigClick = () => {
    console.log("updateEvaluationConfig", config)
    let newConfig = { ...config }
    newConfig.isSet = true
    modifyZipFileSync(configPath, async (path) => {
      await writeJsonSync(newConfig, path, "metadata", "json")
      toast.success("Config has been saved successfully")
    }).then((res) => {
      console.log("res:", res)
      requestBackend(
        port,
        "evaluation/close_dashboard/dashboard/" + pageId,
        { pageId: pageId },
        (data) => {
          console.log("closeDashboard received data:", data)
          setConfig(newConfig)
          setRun(!run)
        },
        (error) => {
          console.log("closeDashboard received error:", error)
        }
      )
    })
  }

  /**
   * @description - This function is used to update the warnings
   */
  const updateWarnings = async (useMedStandard) => {
    console.log("updateWarnings")

    /**
     *
     * @param {Array} datasetData An array of the columns of the dataset
     * @param {Array} modelData An array of the required columns of the model
     */
    const checkWarnings = async (datasetData, modelData, useMedStandard) => {
      // sort the arrays alphabetically and numerically
      let isValid = true
      let modelCols = modelData.columns

      let columnsArray_ = []
      let selectedDatasetsTx = []
      let modelDatasetsTx = []

      if (useMedStandard) {
        console.log("dataset infos", datasetData)
        console.log("model infos", modelData)

        let selectedDatasets = datasetData.selectedDatasets
        let wantedTags = modelData.selectedTags
        let wantedVariables = modelData.selectedVariables
        console.log("wantedTags", wantedTags)
        console.log("wantedVariables", wantedVariables)

        // getting a list of unique values ot T1, T2, ... representing selected datasets time points
        wantedVariables.forEach((wantedVariable) => {
          // getting last element of split list
          let datasetTx = wantedVariable.split("_")[wantedVariable.split("_").length - 1]
          // let datasetTx = wantedVariable.split("_")[-1]
          !modelDatasetsTx.includes(datasetTx) && modelDatasetsTx.push(datasetTx)
        })

        // verify if selected datasets are the wanted combinations of Tx

        selectedDatasets.forEach((dataset) => {
          let datasetTx = dataset.name.split("_")[0]
          !selectedDatasetsTx.includes(datasetTx) && selectedDatasetsTx.push(datasetTx)
        })

        console.log("modelDatasetsTx", modelDatasetsTx)
        console.log("selectedDatasetsTx", selectedDatasetsTx)
        var isValidDatasetsSelected = modelDatasetsTx.sort().join(",") == selectedDatasetsTx.sort().join(",")
        console.log("isValid", isValid)
      } else {
        let { columnsArray } = await MedDataObject.getColumnsFromPath(config.dataset.path, globalData, setGlobalData)
        columnsArray_ = columnsArray
        let datasetColsString = JSON.stringify(columnsArray.sort())
        let modelColsString = JSON.stringify(modelCols.sort())
        console.log("datasetColsString", datasetColsString)
        console.log("modelColsString", modelColsString)
        isValid = !(datasetColsString !== modelColsString && modelCols && columnsArray)
      }
      setLoader(false)

      if (!isValid || !isValidDatasetsSelected) {
        if (!isValidDatasetsSelected) {
          setDatasetHasWarning({
            state: true,
            tooltip: (
              <div className="evaluation-tooltip">
                <h4>This dataset does not respect the model format</h4>
                <p>You chose a wrong combination of timepoints (Tx)</p>
                <div style={{ maxHeight: "400px", overflowY: "auto", overflowX: "hidden" }}>
                  <Row>
                    <Col>
                      <p>Needed timepoints:</p>
                      <ul>
                        {modelDatasetsTx.sort().map((col) => {
                          return <li key={col}>{col}</li>
                        })}
                      </ul>
                    </Col>
                    <Col>
                      <p>Received timepoints:</p>
                      <ul>
                        {selectedDatasetsTx.sort().map((col) => {
                          return <li key={col}>{col}</li>
                        })}
                      </ul>
                    </Col>
                  </Row>
                </div>
              </div>
            )
          })
        } else {
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
                          {modelCols.map((col) => {
                            return <li key={col}>{col}</li>
                          })}
                        </ul>
                      </Col>
                      <Col>
                        <p>Received columns:</p>
                        <ul>
                          {columnsArray_.map((col) => {
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
        }
      } else {
        setModelHasWarning({ state: false, tooltip: "" })
        setDatasetHasWarning({ state: false, tooltip: "" })
      }
    }

    if (
      config &&
      config.model &&
      config.dataset &&
      Object.keys(config.model).length > 0 &&
      Object.keys(config.dataset).length > 0 &&
      config.model.name != "No selection" &&
      config.dataset.name != "No selection"
    ) {
      let modelDataObject = await MedDataObject.getObjectByPathSync(config.model.path, globalData)
      if (modelDataObject) {
        console.log("model columns already loaded ?", modelDataObject.metadata.content)
        if (!modelDataObject.metadata.content) {
          console.log("flag1 - true")
          if (!config.model.metadata) {
            console.log("flag2 - true")

            try {
              customZipFile2Object(config.model.path)
                .then(async (content) => {
                  console.log("finish customZipFile2Object", content)
                  if (content && Object.keys(content).length > 0) {
                    modelDataObject.metadata.content = content
                    setGlobalData({ ...globalData })
                    await checkWarnings(config.dataset, content, useMedStandard)
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

            modelDataObject.metadata.content = config.model.metadata
            setGlobalData({ ...globalData })
            let modelData = config.model.metadata
            await checkWarnings(config.dataset, modelData, useMedStandard)
          }
        } else {
          console.log("flag1 - false")

          let modelData = modelDataObject.metadata.content
          await checkWarnings(config.dataset, modelData, useMedStandard)
        }
        console.log("modelDataObject.metadata.content", modelDataObject.metadata.content)
      }
    }
  }

  /**
   *
   * @returns the evaluation step: either the config step or the evaluation step
   */
  const getEvaluationStep = () => {
    console.log("initializing evaluation step:", config, "mode:", config.isSet)
    if (config.isSet) {
      return (
        <PageEval
          useMedStandard={config.useMedStandard}
          run={run}
          pageId={pageId}
          config={config}
          updateWarnings={updateWarnings}
          setDatasetHasWarning={setDatasetHasWarning}
          datasetHasWarning={datasetHasWarning}
          setModelHasWarning={setModelHasWarning}
          modelHasWarning={modelHasWarning}
          updateConfigClick={updateConfigClick}
          setChosenModel={setChosenModel}
          setChosenDataset={setChosenDataset}
        />
      )
    } else {
      return (
        <PageConfig
          useMedStandard={config.useMedStandard}
          run={run}
          pageId={pageId}
          config={config}
          updateWarnings={updateWarnings}
          setDatasetHasWarning={setDatasetHasWarning}
          datasetHasWarning={datasetHasWarning}
          setModelHasWarning={setModelHasWarning}
          modelHasWarning={modelHasWarning}
          updateConfigClick={updateConfigClick}
          setChosenModel={setChosenModel}
          setChosenDataset={setChosenDataset}
        />
      )
    }
  }

  return <>{config && getEvaluationStep()}</>
}

export default EvaluationPageContent
