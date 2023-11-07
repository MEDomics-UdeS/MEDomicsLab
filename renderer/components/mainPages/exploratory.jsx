import React, { useState, useContext, useEffect, useCallback } from "react"
import ModulePage from "./moduleBasics/modulePage"
import { Card } from "primereact/card"
import Input from "../learning/input"
import { Tag } from "primereact/tag"
import { Tooltip } from "primereact/tooltip"
import { Button } from "primereact/button"
import { ToggleButton } from "primereact/togglebutton"
import { requestBackend } from "../../utilities/requests"
import { downloadFilePath } from "../../utilities/fileManagementUtils"
import { WorkspaceContext } from "../workspace/workspaceContext"
import { DataContext } from "../workspace/dataContext"
import { ErrorRequestContext } from "../generalPurpose/errorRequestContext"
import { LayoutModelContext } from "../layout/layoutContext"
import Path from "path"
import MedDataObject from "../workspace/medDataObject"
import ProgressBarRequests from "../generalPurpose/progressBarRequests"
import { LoaderContext } from "../generalPurpose/loaderContext"
import { Stack } from "react-bootstrap"
import { IoClose } from "react-icons/io5"
import { getId } from "../../utilities/staticFunctions"

/**
 *
 * @param {String} pageId The page id
 * @param {Number} port The port of the backend
 * @param {Function} setError The function to set the error
 *
 * @returns A card with the sweetviz module
 */
const SweetViz = ({ pageId, port, setError }) => {
  const [mainDataset, setMainDataset] = useState()
  const [compDataset, setCompDataset] = useState()
  const [mainDatasetHasWarning, setMainDatasetHasWarning] = useState({ state: false, tooltip: "" })
  const [compDatasetHasWarning, setCompDatasetHasWarning] = useState({ state: false, tooltip: "" })
  const [compareChecked, setCompareChecked] = useState(false)
  const [htmlFilePath, setHtmlFilePath] = useState("")
  const { dispatchLayout } = useContext(LayoutModelContext)
  const [isCalculating, setIsCalculating] = useState(false)
  const [progress, setProgress] = useState({ now: 0, currentLabel: 0 })
  const [mainDatasetTarget, setMainDatasetTarget] = useState()
  const [mainDatasetTargetChoices, setMainDatasetTargetChoices] = useState()
  const { setLoader } = useContext(LoaderContext)
  const { globalData, setGlobalData } = useContext(DataContext)

  /**
   *
   * @param {Object} inputUpdate The input update
   */
  const onTargetChange = (inputUpdate) => {
    setMainDatasetTarget(inputUpdate.value)
  }

  /**
   *
   * @param {Object} inputUpdate The input update
   *
   * @description
   * This function is used to update the node internal data when the files input changes.
   */
  const onDatasetChange = async (inputUpdate) => {
    setMainDataset(inputUpdate)
    if (inputUpdate.value.path != "") {
      setLoader(true)
      let { columnsArray, columnsObject } = await MedDataObject.getColumnsFromPath(inputUpdate.value.path, globalData, setGlobalData)
      setLoader(false)
      setMainDatasetTargetChoices(columnsObject)
      setMainDatasetTarget(columnsArray[columnsArray.length - 1])
    } else {
      console.log("no file selected")
    }
  }

  /**
   *
   * @param {String} filePath The file path to open
   * @returns The file path to open
   */
  const handleOpenFile = (filePath) => () => {
    const medObj = new MedDataObject({ path: filePath, type: "html", name: "SweetViz-report.html", _UUID: "SweetViz-report" })
    dispatchLayout({ type: "openHtmlViewer", payload: medObj })
  }

  /**
   *
   * @param {String} filePath The file path to download
   * @returns The file path to download
   */
  const handleDownloadFile = (filePath) => () => {
    downloadFilePath(filePath)
  }

  /**
   * @description This function is used to open the html viewer with the given file path
   */
  const generateReport = () => {
    // eslint-disable-next-line no-undef
    const savingPath = Path.join(process.cwd(), "tmp", "SweetViz_report.html")
    setIsCalculating(true)
    setHtmlFilePath("")
    requestBackend(
      port,
      "exploratory/start_sweetviz/" + pageId,
      { mainDataset: mainDataset.value, compDataset: compDataset && compareChecked ? compDataset.value : "", savingPath: savingPath, target: mainDatasetTarget },
      (response) => {
        console.log(response)
        if (response.error) {
          setError(response.error)
        } else {
          setHtmlFilePath(response.savingPath)
        }
        setIsCalculating(false)
      },
      (error) => {
        console.log(error)
      }
    )
  }

  return (
    <Card
      title={
        <>
          <div className="p-card-title">
            <a
              className="web-server-link"
              onClick={() => {
                require("electron").shell.openExternal("https://github.com/fbdesignpro/sweetviz")
              }}
            >
              SweetViz
            </a>
          </div>
        </>
      }
    >
      <Stack gap={2}>
        <div className="data-with-warning">
          {mainDatasetHasWarning.state && (
            <>
              <Tag className={`main-dataset-warning-tag-${pageId}`} icon="pi pi-exclamation-triangle" severity="warning" value="" rounded data-pr-position="left" data-pr-showdelay={200} />
              <Tooltip target={`.main-dataset-warning-tag-${pageId}`} autoHide={false}>
                <span>{mainDatasetHasWarning.tooltip}</span>
              </Tooltip>
            </>
          )}
          <div className="input-btn-group">
            <Input name="Choose main dataset" settingInfos={{ type: "data-input", tooltip: "" }} currentValue={mainDataset && mainDataset.value} onInputChange={onDatasetChange} setHasWarning={setMainDatasetHasWarning} />
            <Input
              disabled={mainDataset && mainDataset.path == ""}
              name="target"
              currentValue={mainDatasetTarget}
              settingInfos={{
                type: "list",
                tooltip: "<p>Specify the column name of the target variable</p>",
                choices: mainDatasetTargetChoices || {}
              }}
              onInputChange={onTargetChange}
              customProps={{
                filter: true
              }}
            />
            <Button onClick={generateReport} className="btn btn-primary" label="Generate report" icon="pi pi-chart-bar" iconPos="right" disabled={compareChecked || !mainDataset || mainDatasetHasWarning.state} />
          </div>
        </div>
        <ToggleButton className="add-compare" onLabel="Only use one dataset" offLabel="Compare with another dataset" checked={compareChecked} onChange={(e) => setCompareChecked(e.value)} />
        {compareChecked && (
          <div className="data-with-warning">
            {compDatasetHasWarning.state && (
              <>
                <Tag className={`comp-dataset-warning-tag-${pageId}`} icon="pi pi-exclamation-triangle" severity="warning" value="" rounded data-pr-position="left" data-pr-showdelay={200} />
                <Tooltip target={`.comp-dataset-warning-tag-${pageId}`} autoHide={false}>
                  <span>{compDatasetHasWarning.tooltip}</span>
                </Tooltip>
              </>
            )}
            <div className="input-btn-group">
              <Input name="Choose second dataset" settingInfos={{ type: "data-input", tooltip: "" }} currentValue={compDataset && compDataset.value} onInputChange={(data) => setCompDataset(data)} setHasWarning={setCompDatasetHasWarning} />
              <Button onClick={generateReport} className="btn btn-primary" label="Generate compare report" icon="pi pi-chart-bar" iconPos="right" disabled={!mainDataset || !compDataset || compDatasetHasWarning.state || mainDatasetHasWarning.state} />
            </div>
          </div>
        )}
        {isCalculating && !htmlFilePath && <ProgressBarRequests delayMS={100} progressBarProps={{ animated: true, variant: "success" }} isUpdating={isCalculating} setIsUpdating={setIsCalculating} progress={progress} setProgress={setProgress} requestTopic={"exploratory/progress/" + pageId} />}
        {htmlFilePath && (
          <div className="finish-btn-group">
            <Button onClick={handleOpenFile(htmlFilePath)} className="btn btn-primary" label="Open generated file" icon="pi pi-chart-bar" iconPos="right" severity="success" />
            <Button onClick={handleDownloadFile(htmlFilePath)} className="btn btn-primary" label="Save generated file" icon="pi pi-download" iconPos="right" severity="success" />
          </div>
        )}
      </Stack>
    </Card>
  )
}

/**
 *
 * @param {String} pageId The page id
 * @param {Number} port The port of the backend
 * @param {Function} setError The function to set the error
 * @returns
 */
const YDataProfiling = ({ pageId, port, setError }) => {
  const [mainDataset, setMainDataset] = useState()
  const [compDataset, setCompDataset] = useState()
  const [mainDatasetHasWarning, setMainDatasetHasWarning] = useState({ state: false, tooltip: "" })
  const [compDatasetHasWarning, setCompDatasetHasWarning] = useState({ state: false, tooltip: "" })
  const [compareChecked, setCompareChecked] = useState(false)
  const [htmlFilePath, setHtmlFilePath] = useState("")
  const { dispatchLayout } = useContext(LayoutModelContext)
  const [isCalculating, setIsCalculating] = useState(false)
  const [progress, setProgress] = useState({ now: 0, currentLabel: 0 })

  /**
   *
   * @param {String} filePath The file path to open
   * @returns
   */
  const handleOpenFile = (filePath) => () => {
    const medObj = new MedDataObject({ path: filePath, type: "html", name: "ydata-profiling-report.html", _UUID: "ydata-profiling-report" })
    dispatchLayout({ type: "openHtmlViewer", payload: medObj })
  }

  /**
   *
   * @param {String} filePath The file path to download
   * @returns
   */
  const handleDownloadFile = (filePath) => () => {
    downloadFilePath(filePath)
  }

  /**
   * @description This function is used to open the html viewer with the given file path
   */
  const generateReport = () => {
    // eslint-disable-next-line no-undef
    const savingPath = Path.join(process.cwd(), "tmp", "ydata_report.html")
    setIsCalculating(true)
    setHtmlFilePath("")
    requestBackend(
      port,
      "exploratory/start_ydata_profiling/" + pageId,
      { mainDataset: mainDataset.value, compDataset: compDataset && compareChecked ? compDataset.value : "", savingPath: savingPath },
      (response) => {
        console.log(response)
        if (response.error) {
          setError(response.error)
        } else {
          setHtmlFilePath(response.savingPath)
        }
        setIsCalculating(false)
      },
      (error) => {
        console.log(error)
      }
    )
  }

  return (
    <Card
      title={
        <>
          <div className="p-card-title">
            <a
              className="web-server-link"
              onClick={() => {
                require("electron").shell.openExternal("https://docs.profiling.ydata.ai")
              }}
            >
              ydata-profiling
            </a>
          </div>
        </>
      }
    >
      <Stack gap={2}>
        <div className="data-with-warning">
          {mainDatasetHasWarning.state && (
            <>
              <Tag className={`main-dataset-warning-tag-${pageId}`} icon="pi pi-exclamation-triangle" severity="warning" value="" rounded data-pr-position="left" data-pr-showdelay={200} />
              <Tooltip target={`.main-dataset-warning-tag-${pageId}`} autoHide={false}>
                <span>{mainDatasetHasWarning.tooltip}</span>
              </Tooltip>
            </>
          )}
          <div className="input-btn-group">
            <Input name="Choose main dataset" settingInfos={{ type: "data-input", tooltip: "" }} currentValue={mainDataset && mainDataset.value} onInputChange={(data) => setMainDataset(data)} setHasWarning={setMainDatasetHasWarning} />
            <Button onClick={generateReport} className="btn btn-primary" label="Generate report" icon="pi pi-chart-bar" iconPos="right" disabled={compareChecked || !mainDataset || mainDatasetHasWarning.state} />
          </div>
        </div>
        <ToggleButton className="add-compare" onLabel="Only use one dataset" offLabel="Compare with another dataset" checked={compareChecked} onChange={(e) => setCompareChecked(e.value)} />
        {compareChecked && (
          <div className="data-with-warning">
            {compDatasetHasWarning.state && (
              <>
                <Tag className={`comp-dataset-warning-tag-${pageId}`} icon="pi pi-exclamation-triangle" severity="warning" value="" rounded data-pr-position="left" data-pr-showdelay={200} />
                <Tooltip target={`.comp-dataset-warning-tag-${pageId}`} autoHide={false}>
                  <span>{compDatasetHasWarning.tooltip}</span>
                </Tooltip>
              </>
            )}
            <div className="input-btn-group">
              <Input name="Choose second dataset" settingInfos={{ type: "data-input", tooltip: "" }} currentValue={compDataset && compDataset.value} onInputChange={(data) => setCompDataset(data)} setHasWarning={setCompDatasetHasWarning} />
              <Button onClick={generateReport} className="btn btn-primary" label="Generate compare report" icon="pi pi-chart-bar" iconPos="right" disabled={!mainDataset || !compDataset || compDatasetHasWarning.state || mainDatasetHasWarning.state} />
            </div>
          </div>
        )}
        {isCalculating && !htmlFilePath && <ProgressBarRequests delayMS={100} progressBarProps={{ animated: true, variant: "success" }} isUpdating={isCalculating} setIsUpdating={setIsCalculating} progress={progress} setProgress={setProgress} requestTopic={"exploratory/progress/" + pageId} />}
        {htmlFilePath && (
          <div className="finish-btn-group">
            <Button onClick={handleOpenFile(htmlFilePath)} className="btn btn-primary" label="Open generated file" icon="pi pi-chart-bar" iconPos="right" severity="success" />
            <Button onClick={handleDownloadFile(htmlFilePath)} className="btn btn-primary" label="Save generated file" icon="pi pi-download" iconPos="right" severity="success" />
          </div>
        )}
      </Stack>
    </Card>
  )
}

const DTaleProcess = ({ uniqueId, pageId, port, setError, onDelete }) => {
  const [mainDataset, setMainDataset] = useState()
  const [mainDatasetHasWarning, setMainDatasetHasWarning] = useState({ state: false, tooltip: "" })
  const [isCalculating, setIsCalculating] = useState(false)
  const [progress, setProgress] = useState({ now: 0, currentLabel: 0 })
  const [serverPath, setServerPath] = useState("")
  const { dispatchLayout } = useContext(LayoutModelContext)

  const shutdownDTale = (serverPath) => {
    console.log("shutting down dtale: ", serverPath)
    if (serverPath != "") {
      fetch(serverPath + "/shutdown", {
        mode: "no-cors",
        credentials: "include",
        method: "GET"
      })
        .then((response) => console.log(response))
        .catch((error) => console.log(error))
    }
  }

  /**
   * @description This function is used to open the html viewer with the given file path
   */
  const generateReport = () => {
    shutdownDTale(serverPath)
    requestBackend(
      port,
      "removeId/" + uniqueId + "/" + pageId + "-" + Path.basename(mainDataset.value.path),
      { dataset: mainDataset.value },
      (response) => {
        console.log(response)
        setIsCalculating(true)
        setServerPath("")
        requestBackend(
          port,
          "exploratory/start_dtale/" + uniqueId + "/" + pageId + "-" + Path.basename(mainDataset.value.path),
          { dataset: mainDataset.value },
          (response) => {
            console.log(response)
            if (response.error) {
              setError(response.error)
            }
            setServerPath("")
          },
          (error) => {
            console.log(error)
            setIsCalculating(false)
          }
        )
      },
      (error) => {
        console.log(error)
      }
    )
  }

  /**
   *
   * @param {Object} data Data received from the server on progress update
   */
  const onProgressDataReceived = (data) => {
    if (data.web_server_url) {
      setServerPath(data.web_server_url)
      setIsCalculating(false)
    }
  }

  const handleOpenWebServer = (urlPath, uniqueId) => {
    const medObj = new MedDataObject({ path: urlPath, type: "html", name: "d-tale1", _UUID: uniqueId })
    dispatchLayout({ type: "openInIFrame", payload: medObj })
  }
  return (
    <>
      <div className="data-with-warning">
        {mainDatasetHasWarning.state && (
          <>
            <Tag className={`main-dataset-warning-tag-${pageId}`} icon="pi pi-exclamation-triangle" severity="warning" value="" rounded data-pr-position="left" data-pr-showdelay={200} />
            <Tooltip target={`.main-dataset-warning-tag-${pageId}`} autoHide={false}>
              <span>{mainDatasetHasWarning.tooltip}</span>
            </Tooltip>
          </>
        )}
        <div className="input-btn-group">
          <Input name="Choose main dataset" settingInfos={{ type: "data-input", tooltip: "" }} currentValue={mainDataset && mainDataset.value} onInputChange={(data) => setMainDataset(data)} setHasWarning={setMainDatasetHasWarning} />
          <Button onClick={generateReport} className="btn btn-primary" label="Generate report" icon="pi pi-chart-bar" iconPos="right" disabled={!mainDataset || mainDatasetHasWarning.state} />
          {serverPath && <Button onClick={() => handleOpenWebServer(serverPath, uniqueId)} className="btn btn-primary" label="Open D-Tale" icon="pi pi-table" iconPos="right" severity="success" />}
          <IoClose
            className="btn-close-output-card"
            onClick={(e) => {
              onDelete(uniqueId)
              shutdownDTale(serverPath)
            }}
          />
        </div>
      </div>
      {isCalculating && <ProgressBarRequests delayMS={1000} progressBarProps={{ animated: true, variant: "success" }} isUpdating={isCalculating} setIsUpdating={setIsCalculating} progress={progress} setProgress={setProgress} requestTopic={"exploratory/progress/" + uniqueId + "/" + pageId + "-" + Path.basename(mainDataset.value.path)} onDataReceived={onProgressDataReceived} />}
    </>
  )
}

/**
 *
 * @param {String} pageId The page id
 * @param {Number} port The port of the backend
 * @param {Function} setError The function to set the error
 *
 * @returns the exploratory page with the module page
 */
const DTale = ({ pageId, port, setError }) => {
  const [processes, setProcesses] = useState([])

  useEffect(() => {
    handleAddDTaleComp()
  }, [])

  useEffect(() => {
    console.log("processes", processes)
  }, [processes])

  const onDelete = (uniqueId) => {
    console.log("deleting", uniqueId)
    let newProcesses = []
    processes.forEach((processId) => {
      if (processId != uniqueId) {
        newProcesses.push(processId)
      }
    })
    console.log("newProcesses", newProcesses)
    setProcesses(newProcesses)
  }

  const handleAddDTaleComp = () => {
    let newId = getId()
    console.log(newId)
    processes.push(newId)
    setProcesses([...processes])
  }

  return (
    <Card
      style={{ marginBottom: "1rem" }}
      title={
        <>
          <div className="p-card-title">
            <a
              className="web-server-link"
              onClick={() => {
                require("electron").shell.openExternal("https://github.com/man-group/dtale")
              }}
            >
              D-Tale
            </a>
          </div>
        </>
      }
    >
      <Stack gap={2}>
        {processes.map((id) => (
          <DTaleProcess onDelete={onDelete} uniqueId={id} key={id} port={port} pageId={pageId} setError={setError} />
        ))}
        <Button className="add-compare" label="Add new D-Tale analysis" onClick={handleAddDTaleComp} />
      </Stack>
    </Card>
  )
}

/**
 *
 * @returns the exploratory page
 */
const ExploratoryPage = () => {
  const { port } = useContext(WorkspaceContext)
  const { setError } = useContext(ErrorRequestContext)

  return (
    <>
      <div className="exploratory">
        <SweetViz pageId="SweetViz" port={port} setError={setError} />
        <YDataProfiling pageId="ydata-profiling" port={port} setError={setError} />
        <DTale pageId="D-Tale" port={port} setError={setError} />
      </div>
    </>
  )
}

/**
 *
 * @param {String} pageId The page id
 * @returns the exploratory page with the module page
 */
const ExploratoryPageWithModulePage = ({ pageId = "exploratory-id", configPath = null }) => {
  return (
    <ModulePage pageId={pageId} configPath={configPath} shadow>
      <ExploratoryPage pageId={pageId} configPath={configPath} />
    </ModulePage>
  )
}

export default ExploratoryPageWithModulePage
