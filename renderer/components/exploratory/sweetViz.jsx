import React, { useState, useContext } from "react"
import { LayoutModelContext } from "../layout/layoutContext"
import { MEDDataObject } from "../workspace/NewMedDataObject"
import { requestBackend } from "../../utilities/requests"
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
import { randomUUID } from "crypto"
import { insertMEDDataObjectIfNotExists } from "../mongoDB/mongoDBUtils"
import { DataContext } from "../workspace/dataContext"

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
  const { dispatchLayout } = useContext(LayoutModelContext)
  const [isCalculating, setIsCalculating] = useState(false)
  const [progress, setProgress] = useState({ now: 0, currentLabel: 0 })
  const [mainDatasetTarget, setMainDatasetTarget] = useState()
  const [mainDatasetTargetChoices, setMainDatasetTargetChoices] = useState()
  const [report, setReport] = useState(null)
  const { globalData } = useContext(DataContext)

  var path = require("path")

  /**
   * @description Change the selected target
   * @param {Object} inputUpdate The input update
   */
  const onTargetChange = (inputUpdate) => {
    setMainDatasetTarget(inputUpdate.value)
  }

  /**
   * @description This function is used to update the main dataset, target and target choices
   * @param {Object} inputUpdate The input update
   */
  const onDatasetChange = async (inputUpdate) => {
    setMainDataset(inputUpdate)
    if (inputUpdate.value.id != "") {
      let columns = await getCollectionColumns(inputUpdate.value.id)
      let columnsDict = {}
      columns.forEach((column) => {
        columnsDict[column] = column
      })
      setMainDatasetTargetChoices(columnsDict)
      setMainDatasetTarget(columnsDict[columns[columns.length - 1]])
    }
  }

  /**
   * @description Load the generated report in database
   */
  const setReportInDB = async (htmlFilePath) => {
    let globalDataCopy = { ...globalData }
    const sweetvizFolder = new MEDDataObject({
      id: randomUUID(),
      name: "sweetviz_reports",
      type: "directory",
      parentID: "DATA",
      childrenIDs: [],
      inWorkspace: false
    })
    const parentId = await insertMEDDataObjectIfNotExists(sweetvizFolder)
    // Append the new object to a local global data copy to avoid calling MEDDataObject.updateWorkspaceDataObject() twice
    if (parentId == sweetvizFolder.id) {
      globalDataCopy[parentId] = sweetvizFolder
      console.log("COPY", globalDataCopy)
    }
    let medObjectName =
      compDataset && compareChecked ? path.basename(mainDataset.value.name, ".csv") + "_" + path.basename(compDataset.name, ".csv") + ".html" : path.basename(mainDataset.value.name, ".csv") + ".html"
    medObjectName = MEDDataObject.getUniqueNameForCopy(globalDataCopy, medObjectName, parentId)
    const newReport = new MEDDataObject({
      id: randomUUID(),
      name: medObjectName,
      type: "html",
      parentID: parentId,
      childrenIDs: [],
      inWorkspace: false
    })
    console.log("path", htmlFilePath)
    await insertMEDDataObjectIfNotExists(newReport, htmlFilePath)
    setReport(newReport)
    MEDDataObject.updateWorkspaceDataObject()
  }

  /**
   *
   * @param {String} filePath The file path to open
   * @returns The file path to open
   */
  const handleOpenFile = (localReport) => () => {
    const objectToRet = {
      index: localReport.id,
      data: localReport.name,
      extension: localReport.type
    }
    dispatchLayout({ type: "openHtmlViewer", payload: objectToRet })
  }

  /**
   * @description This function is used to open the html viewer with the given file path
   */
  const generateReport = () => {
    const basePath = process.env.NODE_ENV == "production" ? process.resourcesPath : process.cwd()
    const savingPath = Path.join(basePath, "tmp", "SweetViz_report.html")
    setIsCalculating(true)
    setReport(null)
    requestBackend(
      port,
      "exploratory/start_sweetviz/" + pageId,
      { mainDataset: mainDataset.value, compDataset: compDataset && compareChecked ? compDataset : "", savingPath: savingPath, target: mainDatasetTarget },
      (response) => {
        console.log(response)
        if (response.error) {
          setError(response.error)
        } else {
          setReportInDB(response.savingPath)
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
              currentValue={mainDataset && mainDataset.value.id}
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
                onInputChange={(data) => setCompDataset(data.value)}
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
        {isCalculating && !report && (
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
        {report && (
          <div className="finish-btn-group">
            <Button onClick={handleOpenFile(report)} className="btn btn-primary" label="Open generated file" icon="pi pi-chart-bar" iconPos="right" severity="success" />
          </div>
        )}
      </Stack>
    </Card>
  )
}

export default SweetViz
