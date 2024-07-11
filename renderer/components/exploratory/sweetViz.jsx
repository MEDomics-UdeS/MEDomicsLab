import React, { useState, useContext } from "react"
import { LayoutModelContext } from "../layout/layoutContext"
import MedDataObject from "../workspace/medDataObject"
import { requestBackend } from "../../utilities/requests"
import { downloadFilePath } from "../../utilities/fileManagementUtils"
import Path from "path"
import { Stack } from "react-bootstrap"
import { Tag } from "primereact/tag"
import { Tooltip } from "primereact/tooltip"
import { Card } from "primereact/card"
import Input from "../learning/input"
import { Button } from "primereact/button"
import { ToggleButton } from "primereact/togglebutton"
import ProgressBarRequests from "../generalPurpose/progressBarRequests"
import { getCollectionColumns } from "../mongoDB/mongoDBUtils"

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
    if (inputUpdate.value.id != "") {
      let columns = await getCollectionColumns(inputUpdate.value.id)
      console.log("here", columns)
      let columnsDict = {}
      columns.forEach((column) => {
        columnsDict[column] = column
      })
      setMainDatasetTargetChoices(columnsDict)
      setMainDatasetTarget(columnsDict[columns[columns.length - 1]])
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
    const basePath = process.env.NODE_ENV == "production" ? process.resourcesPath : process.cwd()
    const savingPath = Path.join(basePath, "tmp", "SweetViz_report.html")
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
            <Input
              name="Choose main dataset"
              settingInfos={{ type: "data-input", tooltip: "" }}
              currentValue={mainDataset && mainDataset.value}
              onInputChange={onDatasetChange}
              setHasWarning={setMainDatasetHasWarning}
            />
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

export default SweetViz
