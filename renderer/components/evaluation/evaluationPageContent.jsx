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
import { modifyZipFileSync } from "../../utilities/customZipFile"
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels"
import { TabView, TabPanel } from "primereact/tabview"
import ShapValues from "./shapValues"
import Dashboard from "./dashboard"
import { customZipFile2Object } from "../../utilities/customZipFile"

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
                  <Tooltip target={`.model-warning-tag-${pageId}`}>
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
                  <Tooltip target={`.dataset-warning-tag-${pageId}`}>
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

const EvaluationContent = ({ pageId, config, updateWarnings, chosenModel, setChosenModel, updateEvaluationConfig, chosenDataset, setChosenDataset, modelHasWarning, setModelHasWarning, datasetHasWarning, setDatasetHasWarning }) => {
  const evaluationHeaderPanelRef = useRef(null)
  const [showHeader, setShowHeader] = useState(true)

  useEffect(() => {
    updateWarnings()
  }, [])

  useEffect(() => {
    console.log("EvaluationContent config", config)
    setChosenDataset(config.dataset)
    setChosenModel(config.model)
  }, [config])

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
                  <Tooltip target={`.model-warning-tag-${pageId}`}>
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
                  <Tooltip target={`.dataset-warning-tag-${pageId}`}>
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
              <TabPanel key="shap" header="Shap values">
                <ShapValues />
              </TabPanel>
              <TabPanel key="Dash" header="Dashboard">
                <Dashboard />
              </TabPanel>
              {/* <TabPanel
                headerTemplate={() => {
                  return <Button className="btn-add-eval" label="Add evaluation" icon="pi pi-plus" iconPos="right" severity="success" text onClick={() => console.log("heyyy")} />
                }}
                headerClassName="flex align-items-center"
              /> */}
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

  useEffect(() => {
    updateWarnings()
  }, [chosenModel, chosenDataset, globalData])

  const updateEvaluationConfig = useCallback(() => {
    let config = {
      model: chosenModel,
      dataset: chosenDataset
    }
    modifyZipFileSync(configPath, async (path) => {
      await MedDataObject.writeFileSync(config, path, "metadata", "json")
      toast.success("Config has been saved successfully")
      reloadConfig()
    })
  }, [configPath, chosenModel, chosenDataset])

  const updateWarnings = async () => {
    console.log("chosenModel", chosenModel)
    console.log("chosenDataset", chosenDataset)
    if (Object.keys(chosenModel).length > 0 && Object.keys(chosenDataset).length > 0 && chosenModel.name != "No selection" && chosenDataset.name != "No selection") {
      //   getting colummns of the dataset
      setLoader(true)
      let { columnsArray } = await MedDataObject.getColumnsFromPath(chosenDataset.path, globalData, setGlobalData)
      setLoader(false)
      let datasetColsString = JSON.stringify(columnsArray)
      //   getting colummns of the model
      let modelColsString = ""
      let modelData = []
      let modelDataObject = await MedDataObject.getObjectByPathSync(chosenModel.path, globalData)
      console.log("modelDataObject", modelDataObject)
      if (!modelDataObject.metadata.content) {
        let content = await customZipFile2Object(chosenModel.path)
        console.log("content", content)
        console.log("loaded config", content.model_required_cols)
        modelDataObject.metadata.content = content.model_required_cols
      }
      console.log("modelDataObject", modelDataObject)
      modelData = modelDataObject.metadata.content.columns
      console.log("modelData", modelData)
      modelColsString = JSON.stringify(modelData)
      console.log("datasetColsString", datasetColsString)
      console.log("modelColsString", modelColsString)
      // setGlobalData({ ...globalData })
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
  }

  const getEvaluationStep = () => {
    if (Object.keys(config).length == 0) {
      return <ConfigPage pageId={pageId} config={config} setDatasetHasWarning={setDatasetHasWarning} datasetHasWarning={datasetHasWarning} setModelHasWarning={setModelHasWarning} modelHasWarning={modelHasWarning} updateEvaluationConfig={updateEvaluationConfig} updateWarnings={updateWarnings} configPath={configPath} reloadConfig={reloadConfig} chosenModel={chosenModel} setChosenModel={setChosenModel} chosenDataset={chosenDataset} setChosenDataset={setChosenDataset} />
    } else {
      return <EvaluationContent pageId={pageId} config={config} setDatasetHasWarning={setDatasetHasWarning} datasetHasWarning={datasetHasWarning} setModelHasWarning={setModelHasWarning} modelHasWarning={modelHasWarning} updateWarnings={updateWarnings} updateEvaluationConfig={updateEvaluationConfig} chosenDataset={chosenDataset} setChosenDataset={setChosenDataset} chosenModel={chosenModel} setChosenModel={setChosenModel} />
    }
  }

  return <>{config && getEvaluationStep()}</>
}

export default EvaluationPageContent
