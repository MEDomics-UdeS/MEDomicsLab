import React, { useCallback, useContext, useEffect, useState, useRef } from "react"
import { Button } from "primereact/button"
import { PiFlaskFill } from "react-icons/pi"
import Input from "../learning/input"
import { Tag } from "primereact/tag"
import { Tooltip } from "primereact/tooltip"
import { toast } from "react-toastify"
import { modifyZipFileSync } from "../../utilities/customZipFile"
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels"
import { TabView, TabPanel } from "primereact/tabview"
import PredictPanel from "./predictPanel"
import Dashboard from "./dashboard"
import fsprom from "fs/promises"
import fs from "fs"
import Path from "path"
import { WorkspaceContext } from "../workspace/workspaceContext"
import { requestBackend } from "../../utilities/requests"
import { ErrorRequestContext } from "../generalPurpose/errorRequestContext"

/**
 *@param {Object} run Object containing the run state and the run function
 * @param {String} pageId Id of the page for multi-tabs support
 * @param {Object} config Configuration of the page
 * @param {Function} updateWarnings Function to update the warnings
 * @param {Function} setChosenModel Function to set the chosen model
 * @param {Function} setChosenDataset Function to set the chosen dataset
 * @param {Object} modelHasWarning Object containing the model warning state and tooltip
 * @param {Function} setModelHasWarning Function to set the model warning state and tooltip
 * @param {Object} datasetHasWarning Object containing the dataset warning state and tooltip
 * @param {Function} setDatasetHasWarning Function to set the dataset warning state and tooltip
 * @param {Function} updateConfigClick Function to update the config on click
 *
 * @returns the evaluation page content
 */
const PageEval = ({ run, pageId, config, setChosenModel, updateConfigClick, setChosenDataset, modelHasWarning, setModelHasWarning, datasetHasWarning, setDatasetHasWarning, useMedStandard }) => {
  const evaluationHeaderPanelRef = useRef(null)
  const [showHeader, setShowHeader] = useState(true)
  const [isDashboardUpdating, setIsDashboardUpdating] = useState(false)
  const [isPredictUpdating, setIsPredictUpdating] = useState(false)
  const [predictedData, setPredictedData] = useState(undefined) // we use this to store the predicted data
  const { port } = useContext(WorkspaceContext) // we get the port for server connexion
  const { setError } = useContext(ErrorRequestContext)

  // close everything when the page is closed
  useEffect(() => {
    return () => {
      requestBackend(
        port,
        "removeId/" + "dashboard/" + pageId,
        { pageId: pageId },
        (data) => {
          if (data.error) {
            console.error(data)
          }
          console.log("closing", data, "with id:", pageId)
        },
        (error) => {
          console.error(error)
        }
      )
      requestBackend(
        port,
        "removeId/" + "predict/" + pageId,
        { pageId: pageId },
        (data) => {
          if (data.error) {
            console.error(data)
          }
          console.log("closing", data, "with id:", pageId)
        },
        (error) => {
          console.error(error)
        }
      )
    }
  }, [])

  // when the run changes, we start the evaluation processes
  useEffect(() => {
    console.log("run changed-*-**-*--*-*-*-*-*-*-**-*--*-*-*")
    createCopiesModel().then((modelObjCopies) => {
      startCalls2Server(modelObjCopies)
    })
  }, [run])

  /**
   *
   * @param {Object} modelObjCopies Object containing the paths of the copies of the model
   * @description - This function is used to start the evaluation processes
   */
  const startCalls2Server = useCallback(
    (modelObjCopies) => {
      // start predict
      setIsPredictUpdating(true)
      requestBackend(
        port,
        "evaluation/predict_test/predict/" + pageId,
        { pageId: pageId, model: config.model, dataset: config.dataset, modelObjPath: modelObjCopies.predict, useMedStandard: useMedStandard },
        (data) => {
          setIsPredictUpdating(false)
          if (data.error) {
            if (typeof data.error == "string") {
              data.error = JSON.parse(data.error)
            }
            setError(data.error)
          } else {
            setPredictedData(data)
          }
          console.log("predict_test received data:", data)
        },
        (error) => {
          console.error(error)
          setIsPredictUpdating(false)
        }
      )

      // start dashboard
      requestBackend(
        port,
        "evaluation/close_dashboard/dashboard/" + pageId,
        { pageId: pageId },
        (data) => {
          console.log("closeDashboard received data:", data)
          setIsDashboardUpdating(true)
          console.log("starting dashboard...")
          // TODO: @NicoLongfield - Let choose sample size
          requestBackend(
            port,
            "evaluation/open_dashboard/dashboard/" + pageId,
            {
              pageId: pageId,
              model: config.model,
              dataset: config.dataset,
              sampleSizeFrac: 1,
              dashboardName: config.model.name.split(".")[0],
              modelObjPath: modelObjCopies.dashboard,
              useMedStandard: useMedStandard
            },
            (data) => {
              console.log("openDashboard received data:", data)
              setIsDashboardUpdating(false)
              if (data.error) {
                if (typeof data.error == "string") {
                  data.error = JSON.parse(data.error)
                }
                setError(data.error)
              }
            },
            (error) => {
              console.log("openDashboard received error:", error)
              setIsDashboardUpdating(false)
            }
          )
        },
        (error) => {
          console.log("closeDashboard received error:", error)
        }
      )
    },
    [config]
  )

  // handle resizing of the header when clicking on the button
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

  /**
   * @description - This function is used to create two copies of the model, one for the predict and one for the dashboard. This is because the dashboard and the predict processes are running in parallel and they need to have their own copy of the model.
   */
  const createCopiesModel = useCallback(() => {
    let modelPath = config.model.path
    console.log("creating copies of the model of path:", modelPath)
    return new Promise((resolve, reject) => {
      const unpickleMedmodel = (fname, id) => {
        function writeFile(absPath, data) {
          return new Promise((resolve, reject) => {
            try {
              let dir = Path.dirname(absPath)
              console.log("dir:", dir)
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
            } catch (err) {
              toast.error("Error while writing file (unpickling): " + err)
              reject(err)
            }
          })
        }
        return new Promise((resolve, reject) => {
          console.log("unpickling:", Path.join(fname))
          try {
            // list all files in the directory
            fsprom.readdir(Path.dirname(fname)).then((files) => {
              console.log("files:", files)
              fsprom
                .readFile(Path.join(fname))
                .then((pkl) => {
                  console.log("pkl:", pkl)
                  let absPathPredict = Path.resolve("tmp/predict-" + id + "-model.pkl")
                  let absPathDashboard = Path.resolve("tmp/dashboard-" + id + "-model.pkl")
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
          } catch (err) {
            toast.error("Error while reading file (unpickling): " + err)
            reject(err)
          }
        })
      }

      modifyZipFileSync(modelPath, async (path) => {
        console.log("path:", path)
        return await unpickleMedmodel(path + "/model.pkl", pageId)
      })
        .then((modelObjPaths) => {
          console.log("modelObjPaths 2:", modelObjPaths)
          resolve({ predict: modelObjPaths[0], dashboard: modelObjPaths[1] })
        })
        .catch((err) => {
          toast.error("Error while creating copies of the model: " + err)
          reject(err)
        })
    })
  }, [config.model.path])

  return (
    <div className="evaluation-content">
      <PanelGroup style={{ height: "100%", display: "flex", flexGrow: 1 }} direction="vertical" id={pageId}>
        {/* Panel is used to create the flow, used to be able to resize it on drag */}
        {!useMedStandard && (
          <>
            <Panel
              order={1}
              ref={evaluationHeaderPanelRef}
              id={`eval-header-${pageId}`}
              defaultSize={10}
              minSize={10}
              maxSize={10}
              collapsible={true}
              collapsibleSize={10}
              className="smooth-transition evaluation-header-parent"
            >
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
                  <Input
                    name="Choose model to evaluate"
                    settingInfos={{ type: "models-input", tooltip: "" }}
                    currentValue={config.model}
                    onInputChange={(data) => setChosenModel(data.value)}
                    setHasWarning={setModelHasWarning}
                  />
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
                  <Input
                    name="Choose dataset"
                    settingInfos={{ type: "data-input", tooltip: "" }}
                    currentValue={config.dataset}
                    onInputChange={(data) => setChosenDataset(data.value)}
                    setHasWarning={setDatasetHasWarning}
                  />
                </div>
                <Button
                  style={{ width: "15rem" }}
                  label="Update evaluation"
                  icon="pi pi-refresh"
                  iconPos="right"
                  disabled={modelHasWarning.state || datasetHasWarning.state}
                  onClick={updateConfigClick}
                />
              </div>
            </Panel>
            <PanelResizeHandle />
          </>
        )}
        {/* Panel is used to create the results pane, used to be able to resize it on drag */}
        <Panel id={`eval-body-${pageId}`} minSize={30} order={2} collapsible={true} collapsibleSize={10} className="eval-body">
          {!useMedStandard && (
            <Button className={`btn-show-header ${showHeader ? "opened" : "closed"}`} onClick={() => setShowHeader(!showHeader)}>
              <hr />
              <i className="pi pi-chevron-down"></i>
              <hr />
            </Button>
          )}

          <div className="eval-body-content">
            <TabView renderActiveOnly={false}>
              <TabPanel key="Predict" header="Predict/Test">
                <PredictPanel isUpdating={isPredictUpdating} setIsUpdating={setIsPredictUpdating} data={predictedData} />
              </TabPanel>
              <TabPanel key="Dash" header="Dashboard">
                <Dashboard isUpdating={isDashboardUpdating} setIsUpdating={setIsDashboardUpdating} />
              </TabPanel>
            </TabView>
          </div>
        </Panel>
      </PanelGroup>
    </div>
  )
}

export default PageEval
