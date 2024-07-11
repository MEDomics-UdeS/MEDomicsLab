import React, { useState, useContext } from "react"
import { Tag } from "primereact/tag"
import { Tooltip } from "primereact/tooltip"
import { Button } from "primereact/button"
import { ToggleButton } from "primereact/togglebutton"
import { Card } from "primereact/card"
import { LayoutModelContext } from "../layout/layoutContext"
import MedDataObject from "../workspace/medDataObject"
import { downloadFilePath } from "../../utilities/fileManagementUtils"
import { requestBackend } from "../../utilities/requests"
import Path from "path"
import { Stack } from "react-bootstrap"
import Input from "../learning/input"
import ProgressBarRequests from "../generalPurpose/progressBarRequests"

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
    console.log("open file", filePath)
    const medObj = new MedDataObject({ path: filePath, type: "html", name: "ydata-profiling-report.html", _UUID: "ydata-profiling-report" })
    dispatchLayout({ type: "openHtmlViewer", payload: medObj })
  }

  /**
   *
   * @param {String} filePath The file path to download
   * @returns
   */
  const handleDownloadFile = (filePath) => () => {
    console.log("download file", filePath)
    downloadFilePath(filePath)
  }

  /**
   * @description This function is used to open the html viewer with the given file path
   */
  const generateReport = () => {
    // eslint-disable-next-line no-undef
    console.log("process.execPath", process.execPath)
    const basePath = process.env.NODE_ENV == "production" ? process.resourcesPath : process.cwd()
    const savingPath = Path.join(basePath, "tmp", "ydata_report.html")
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
            <Input
              name="Choose main dataset"
              settingInfos={{ type: "data-input", tooltip: "" }}
              currentValue={mainDataset && mainDataset.value}
              onInputChange={(data) => setMainDataset(data)}
              setHasWarning={setMainDatasetHasWarning}
            />
            <Button
              onClick={generateReport}
              className="btn btn-primary"
              label="Generate report"
              icon="pi pi-chart-bar"
              iconPos="right"
              disabled={compareChecked || !mainDataset || mainDatasetHasWarning.state}
            />
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
              <Input
                name="Choose second dataset"
                settingInfos={{ type: "data-input", tooltip: "" }}
                currentValue={compDataset && compDataset.value}
                onInputChange={(data) => setCompDataset(data)}
                setHasWarning={setCompDatasetHasWarning}
              />
              <Button
                onClick={generateReport}
                className="btn btn-primary"
                label="Generate compare report"
                icon="pi pi-chart-bar"
                iconPos="right"
                disabled={!mainDataset || !compDataset || compDatasetHasWarning.state || mainDatasetHasWarning.state}
              />
            </div>
          </div>
        )}
        {isCalculating && !htmlFilePath && (
          <ProgressBarRequests
            delayMS={500}
            progressBarProps={{ animated: true, variant: "success" }}
            isUpdating={isCalculating}
            setIsUpdating={setIsCalculating}
            progress={progress}
            setProgress={setProgress}
            requestTopic={"exploratory/progress/" + pageId}
          />
        )}
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

export default YDataProfiling
