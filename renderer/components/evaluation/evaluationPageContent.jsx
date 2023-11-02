import React, { useCallback, useContext, useEffect, useState, useRef } from "react"
import { PageInfosContext } from "../mainPages/moduleBasics/pageInfosContext"
import { Card } from "primereact/card"
import { Button } from "primereact/button"
import { PiFlaskFill } from "react-icons/pi"
import Input from "../learning/input"
import { Tag } from "primereact/tag"
import { Tooltip } from "primereact/tooltip"
import { DataContext } from "../workspace/dataContext"
import MedDataObject from "../workspace/medDataObject"
import { LoaderContext } from "../generalPurpose/loaderContext"
import { Col, Row } from "react-bootstrap"
import { toast } from "react-toastify"
import { modifyZipFileSync, customZipFile2Object } from "../../utilities/customZipFile"
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels"
import { TabView, TabPanel } from "primereact/tabview"
import PredictPanel from "./predictPanel"
import Dashboard from "./dashboard"
import fsprom from "fs/promises"
import fs from "fs"
import path from "path"
import { WorkspaceContext } from "../workspace/workspaceContext"
import { requestBackend } from "../../utilities/requests"

const ConfigPage = ({ pageId, config, chosenModel, setChosenModel, chosenDataset, setChosenDataset, modelHasWarning, setModelHasWarning, datasetHasWarning, setDatasetHasWarning, updateEvaluationConfig }) => {
  useEffect(() => {
    if (Object.keys(chosenModel).length > 0) {
      setModelHasWarning({ state: false, tooltip: "" })
    } else {
      setModelHasWarning({ state: true, tooltip: "No model selected" })
    }

    if (Object.keys(chosenDataset).length > 0) {
      setDatasetHasWarning({ state: false, tooltip: "" })
    } else {
      setDatasetHasWarning({ state: true, tooltip: "No dataset selected" })
    }
  }, [])

  const header = (
    <div className="center-page">
      <PiFlaskFill style={{ height: "6rem", width: "auto", color: "rgb(0, 50, 200, 0.8)" }} />
    </div>
  )
  const footer = (
    <>
      <Button label="Create evaluation" icon="pi pi-arrow-right" iconPos="right" disabled={modelHasWarning.state || datasetHasWarning.state} onClick={updateEvaluationConfig} />
    </>
  )
  return (
    <>
      {Object.keys(config).length == 0 && (
        <div className="center-page config-page">
          <Card title="Evaluation Page Configuration" subTitle="Please fill the following fields" style={{ width: "50%" }} footer={footer} header={header}>
            <div>
              {modelHasWarning.state && (
                <>
                  <Tag className={`model-warning-tag-${pageId}`} icon="pi pi-exclamation-triangle" severity="warning" value="" rounded data-pr-position="left" data-pr-showdelay={200} />
                  <Tooltip target={`.model-warning-tag-${pageId}`} autoHide={false}>
                    <span>{modelHasWarning.tooltip}</span>
                  </Tooltip>
                </>
              )}
              <Input name="Choose model to evaluate" settingInfos={{ type: "models-input", tooltip: "" }} currentValue={chosenModel} onInputChange={(data) => setChosenModel(data.value)} setHasWarning={setModelHasWarning} />
            </div>
            <div>
              {datasetHasWarning.state && (
                <>
                  <Tag className={`dataset-warning-tag-${pageId}`} icon="pi pi-exclamation-triangle" severity="warning" value="" rounded data-pr-position="left" data-pr-showdelay={200} />
                  <Tooltip target={`.dataset-warning-tag-${pageId}`} autoHide={false}>
                    <span>{datasetHasWarning.tooltip}</span>
                  </Tooltip>
                </>
              )}
              <Input name="Choose dataset" settingInfos={{ type: "data-input", tooltip: "" }} currentValue={chosenDataset} onInputChange={(data) => setChosenDataset(data.value)} setHasWarning={setDatasetHasWarning} />
            </div>
          </Card>
        </div>
      )}
    </>
  )
}

const EvaluationContent = ({ chosenConfig, pageId, config, updateWarnings, chosenModel, setChosenModel, updateEvaluationConfig, chosenDataset, setChosenDataset, modelHasWarning, setModelHasWarning, datasetHasWarning, setDatasetHasWarning }) => {
  const evaluationHeaderPanelRef = useRef(null)
  const [showHeader, setShowHeader] = useState(true)
  const [modelObjPathModule, setModelObjPathModule] = useState({ predict: "", dashboard: "" })

  useEffect(() => {
    updateWarnings()
  }, [])

  useEffect(() => {
    console.log("EvaluationContent config", config)
    setChosenDataset(config.dataset)
    setChosenModel(config.model)
  }, [config])

  useEffect(() => {
    console.log("chosenConfig", chosenConfig)
    if (chosenConfig && chosenConfig.model && chosenConfig.dataset) {
      modifyZipFileSync(chosenConfig.model.path, async (path) => {
        console.log("path:", path)
        return await unpickleMedmodel(path + "/model.pkl", pageId)
      }).then((modelObjPaths) => {
        console.log("modelObjPaths 2:", modelObjPaths)
        setModelObjPathModule({ predict: modelObjPaths[0], dashboard: modelObjPaths[1] })
      })
    }
  }, [chosenConfig])

  useEffect(() => {
    if (evaluationHeaderPanelRef.current) {
      if (showHeader) {
        document.getElementById(`data-panel-id-eval-header-${pageId}`).style.minHeight = "100px"
        evaluationHeaderPanelRef.current.expand()
      } else {
        document.getElementById(`data-panel-id-eval-header-${pageId}`).style.minHeight = "0px"
        evaluationHeaderPanelRef.current.collapse()
      }
    }
  }, [showHeader])

  const unpickleMedmodel = (fname, id) => {
    function writeFile(absPath, data) {
      return new Promise((resolve, reject) => {
        let dir = path.dirname(absPath)
        if (!fs.existsSync(dir)) {
          fsprom.mkdir(dir, { recursive: true }).then(() => {
            fsprom.writeFile(absPath, data).then(() => {
              console.log("written")
              resolve(absPath)
            })
          })
        } else {
          fsprom.writeFile(absPath, data).then(() => {
            console.log("written")
            resolve(absPath)
          })
        }
      })
    }
    return new Promise((resolve, reject) => {
      console.log("unpickling:", path.join(fname))
      // list all files in the directory
      fsprom.readdir(path.dirname(fname)).then((files) => {
        console.log("files:", files)
        fsprom
          .readFile(path.join(fname))
          .then((pkl) => {
            console.log("pkl:", pkl)
            let absPathPredict = path.resolve("tmp/model-" + id + "-predict.pkl")
            let absPathDashboard = path.resolve("tmp/model-" + id + "-dashboard.pkl")
            let absPaths = [absPathPredict, absPathDashboard]
            let promises = absPaths.map((absPath) => writeFile(absPath, pkl))
            Promise.all(promises).then((results) => {
              resolve(results)
            })
          })
          .catch((err) => {
            console.error("Error while reading file:", err)
            reject(err)
          })
      })
    })
  }

  return (
    <div className="evaluation-content">
      <PanelGroup style={{ height: "100%", display: "flex", flexGrow: 1 }} direction="vertical" id={pageId}>
        {/* Panel is used to create the flow, used to be able to resize it on drag */}
        <Panel order={1} ref={evaluationHeaderPanelRef} id={`eval-header-${pageId}`} defaultSize={10} minSize={10} maxSize={10} collapsible={true} collapsibleSize={10} className="smooth-transition evaluation-header-parent">
          <div className="evaluation-header">
            <PiFlaskFill style={{ height: "4rem", width: "4rem", color: "rgb(0, 50, 200, 0.8)" }} />
            <div style={{ width: "20rem" }}>
              {modelHasWarning.state && (
                <>
                  <Tag className={`model-warning-tag-${pageId}`} icon="pi pi-exclamation-triangle" severity="warning" value="" rounded data-pr-position="bottom" data-pr-showdelay={200} />
                  <Tooltip target={`.model-warning-tag-${pageId}`} autoHide={false}>
                    <span>{modelHasWarning.tooltip}</span>
                  </Tooltip>
                </>
              )}
              <Input name="Choose model to evaluate" settingInfos={{ type: "models-input", tooltip: "" }} currentValue={chosenModel} onInputChange={(data) => setChosenModel(data.value)} setHasWarning={setModelHasWarning} />
            </div>
            <div style={{ width: "20rem" }}>
              {datasetHasWarning.state && (
                <>
                  <Tag className={`dataset-warning-tag-${pageId}`} icon="pi pi-exclamation-triangle" severity="warning" value="" rounded data-pr-position="bottom" data-pr-showdelay={200} />
                  <Tooltip target={`.dataset-warning-tag-${pageId}`} autoHide={false}>
                    <span>{datasetHasWarning.tooltip}</span>
                  </Tooltip>
                </>
              )}
              <Input name="Choose dataset" settingInfos={{ type: "data-input", tooltip: "" }} currentValue={chosenDataset} onInputChange={(data) => setChosenDataset(data.value)} setHasWarning={setDatasetHasWarning} />
            </div>
            <Button style={{ width: "15rem" }} label="Update evaluation" icon="pi pi-refresh" iconPos="right" disabled={modelHasWarning.state || datasetHasWarning.state} onClick={updateEvaluationConfig} />
          </div>
        </Panel>
        <PanelResizeHandle />
        {/* Panel is used to create the results pane, used to be able to resize it on drag */}
        <Panel id={`eval-body-${pageId}`} minSize={30} order={2} collapsible={true} collapsibleSize={10} className="eval-body">
          <Button className={`btn-show-header ${showHeader ? "opened" : "closed"}`} onClick={() => setShowHeader(!showHeader)}>
            <hr />
            <i className="pi pi-chevron-down"></i>
            <hr />
          </Button>
          <div className="eval-body-content">
            <TabView renderActiveOnly={false}>
              <TabPanel key="Predict" header="Predict/Test">
                <PredictPanel chosenConfig={chosenConfig} modelObjPath={modelObjPathModule.predict} />
              </TabPanel>
              <TabPanel key="Dash" header="Dashboard">
                <Dashboard chosenConfig={chosenConfig} modelObjPath={modelObjPathModule.dashboard} />
              </TabPanel>
            </TabView>
          </div>
        </Panel>
      </PanelGroup>
    </div>
  )
}

const EvaluationPageContent = () => {
  const { config, pageId, configPath, reloadConfig } = useContext(PageInfosContext)
  const [chosenModel, setChosenModel] = useState(config && Object.keys(config).length > 0 ? config.model : {})
  const [chosenDataset, setChosenDataset] = useState(config && Object.keys(config).length > 0 ? config.dataset : {})
  const [modelHasWarning, setModelHasWarning] = useState({ state: false, tooltip: "" })
  const [datasetHasWarning, setDatasetHasWarning] = useState({ state: false, tooltip: "" })
  const { globalData, setGlobalData } = useContext(DataContext)
  const { setLoader } = useContext(LoaderContext)
  const [chosenConfig, setChosenConfig] = useState()
  const { port } = useContext(WorkspaceContext) // we get the port for server connexion

  useEffect(() => {
    ;(async () => {
      await updateWarnings()
    })()
  }, [chosenDataset])

  const updateEvaluationConfig = useCallback(() => {
    console.log("updateEvaluationConfig")
    let config = {
      model: chosenModel,
      dataset: chosenDataset
    }
    modifyZipFileSync(configPath, async (path) => {
      await MedDataObject.writeFileSync(config, path, "metadata", "json")
      toast.success("Config has been saved successfully")
      reloadConfig()
    }).then((res) => {
      console.log("res:", res)
      requestBackend(
        port,
        "evaluation/close_dashboard/dashboard/" + pageId,
        { pageId: pageId },
        (data) => {
          console.log("closeDashboard received data:", data)
        },
        (error) => {
          console.log("closeDashboard received error:", error)
        }
      )
      setChosenConfig(config)
    })
  }, [configPath, chosenModel, chosenDataset])

  useEffect(() => {
    console.log("new config", config)
    if (config) {
      setChosenConfig(config)
    }
  }, [config])

  const updateWarnings = async () => {
    console.log("updateWarnings-----------------------------")
    console.log("chosenModel", chosenModel)
    console.log("chosenDataset", chosenDataset)

    const checkWarnings = (columnsArray, modelData) => {
      let datasetColsString = JSON.stringify(columnsArray)
      let modelColsString = JSON.stringify(modelData)
      if (datasetColsString !== modelColsString) {
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

    if (Object.keys(chosenModel).length > 0 && Object.keys(chosenDataset).length > 0 && chosenModel.name != "No selection" && chosenDataset.name != "No selection") {
      //   getting colummns of the dataset
      setLoader(true)
      let { columnsArray } = await MedDataObject.getColumnsFromPath(chosenDataset.path, globalData, setGlobalData)
      setLoader(false)
      //   getting colummns of the model
      let modelDataObject = await MedDataObject.getObjectByPathSync(chosenModel.path, globalData)
      console.log("modelDataObject", modelDataObject)
      if (modelDataObject) {
        if (!modelDataObject.metadata.content) {
          try {
            customZipFile2Object(chosenModel.path).then((content) => {
              if (content && Object.keys(content).length > 0) {
                console.log("content", content)
                modelDataObject.metadata.content = content
                setGlobalData({ ...globalData })
                let modelData = content.columns
                checkWarnings(columnsArray, modelData)
              }
            })
          } catch (error) {
            console.log("error", error)
          }
        } else {
          let modelData = modelDataObject.metadata.content.columns
          checkWarnings(columnsArray, modelData)
        }
        console.log("modelDataObject.metadata.content", modelDataObject.metadata.content)
      }
    }
  }

  const getEvaluationStep = () => {
    if (Object.keys(config).length == 0) {
      return <ConfigPage chosenConfig={chosenConfig} pageId={pageId} config={config} setDatasetHasWarning={setDatasetHasWarning} datasetHasWarning={datasetHasWarning} setModelHasWarning={setModelHasWarning} modelHasWarning={modelHasWarning} updateEvaluationConfig={updateEvaluationConfig} updateWarnings={updateWarnings} configPath={configPath} reloadConfig={reloadConfig} chosenModel={chosenModel} setChosenModel={setChosenModel} chosenDataset={chosenDataset} setChosenDataset={setChosenDataset} />
    } else {
      return <EvaluationContent chosenConfig={chosenConfig} pageId={pageId} config={config} setDatasetHasWarning={setDatasetHasWarning} datasetHasWarning={datasetHasWarning} setModelHasWarning={setModelHasWarning} modelHasWarning={modelHasWarning} updateWarnings={updateWarnings} updateEvaluationConfig={updateEvaluationConfig} chosenDataset={chosenDataset} setChosenDataset={setChosenDataset} chosenModel={chosenModel} setChosenModel={setChosenModel} />
    }
  }

  return <>{chosenConfig && getEvaluationStep()}</>
}

export default EvaluationPageContent
