import React, { useEffect, useContext, useState } from "react"
import { requestBackend } from "../../utilities/requests"
import { WorkspaceContext } from "../workspace/workspaceContext"
import { PageInfosContext } from "../mainPages/moduleBasics/pageInfosContext"
import { ErrorRequestContext } from "../generalPurpose/errorRequestContext"
import ProgressBarRequests from "../generalPurpose/progressBarRequests"
import fs from "node:fs/promises"
import path from "node:path"
import { modifyZipFileSync } from "../../utilities/customZipFile"
import { div } from "@tensorflow/tfjs-node"

function unpickle(fname, dashboardName) {
  return new Promise((resolve, reject) => {
    console.log("unpickling:", path.join(fname))
    fs.readFile(path.join(fname)).then((pkl) => {
      console.log("pkl:", pkl)
      let absPath = path.resolve("model-" + dashboardName + ".pkl")
      console.log(absPath)
      fs.writeFile(absPath, pkl).then(() => {
        console.log("written")
        resolve(absPath)
      })
    })
  })
}

const Dashboard = ({ chosenConfig }) => {
  const { port } = useContext(WorkspaceContext) // we get the port for server connexion
  const { pageId } = useContext(PageInfosContext) // we get the pageId to send to the server
  const [isDashboardOpen, setIsDashboardOpen] = useState(false) // we use this to open and close the dashboard
  const [isDashboardMounted, setIsDashboardMounted] = useState(false) // we use this to mount and unmount the dashboard
  const { setError } = useContext(ErrorRequestContext)
  const [isUpdating, setIsUpdating] = useState(false) // we use this to know if the progress bar is updating or not
  const [url, setUrl] = useState(undefined) // we use this to store the url of the dashboard
  const [progressValue, setProgressValue] = useState(0) // we use this to store the progress value of the dashboard
  const [chosenModel, setChosenModel] = useState({}) // we use this to store the chosen model
  const [chosenDataset, setChosenDataset] = useState({}) // we use this to store the chosen dataset

  // handle the dashboard opening (mounting) and closing (unmounting)
  useEffect(() => {
    setIsDashboardMounted(true)
    return () => {
      requestBackend(
        port,
        "evaluation/close_dashboard/dashboard/" + pageId,
        { pageId: pageId, model: chosenModel, dataset: chosenDataset },
        (data) => {
          console.log("closeDashboard received data:", data)
        },
        (error) => {
          console.error(error)
        }
      )
      setIsUpdating(false)
    }
  }, [])

  useEffect(() => {
    console.log("chosenConfig:", chosenConfig)
    if (Object.keys(chosenConfig).length != 0) {
      if (Object.keys(chosenConfig.model).length != 0 && Object.keys(chosenConfig.dataset).length != 0) {
        setChosenModel(chosenConfig.model)
        setChosenDataset(chosenConfig.dataset)
        setIsDashboardOpen(true)
      }
    }
  }, [chosenConfig])

  // handle the dashboard opening (mounting) and closing (unmounting)
  useEffect(() => {
    if (isDashboardOpen && isDashboardMounted) {
      console.log("starting dashboard...")
      setIsUpdating(false)
      setProgressValue(0)
      requestBackend(
        port,
        "evaluation/close_dashboard/dashboard/" + pageId,
        { pageId: pageId, model: chosenModel, dataset: chosenDataset },
        async (data) => {
          console.log("closeDashboard received data:", data)
          setIsUpdating(true)
          setUrl(undefined)
          console.log("chosenModel:", chosenModel)
          modifyZipFileSync(chosenModel.path, (path) => {
            return new Promise((resolve, reject) => {
              unpickle(path + "/model.pkl", "dashboard" + pageId).then((model) => {
                chosenModel.modelObjPath = model
                resolve()
              })
            })
          }).then(() => {
            requestBackend(
              port,
              "evaluation/open_dashboard/dashboard/" + pageId,
              { pageId: pageId, model: chosenModel, dataset: chosenDataset, sampleSizeFrac: 0.005, dashboardName: chosenModel.name.split(".")[0] },
              (data) => {
                setIsUpdating(false)
                if (data.error) {
                  setError(data.error)
                } else {
                  // document.getElementById(`dashboard-html-${pageId}`).insertAdjacentHTML("afterend", data.results_html)
                }
                console.log("openDashboard received data:", data)
              },
              (error) => {
                console.log("openDashboard received error:", error)
              }
            )
          })
        },
        (error) => {
          console.log("closeDashboard received error:", error)
        }
      )
    }
  }, [isDashboardOpen, isDashboardMounted, chosenModel, chosenDataset])

  const onProgressDataReceived = (data) => {
    setProgressValue(data.now)
    if (data.dashboard_url) {
      setUrl(data.dashboard_url)
      setIsUpdating(false)
    }
  }

  return <>{url ? <iframe src={url} width="100%" height="100%" frameBorder="0"></iframe> : <ProgressBarRequests delayMS={1000} isUpdating={isUpdating} setIsUpdating={setIsUpdating} progress={{ now: progressValue }} setProgress={(prog) => setProgressValue(prog.now)} requestTopic={"evaluation/progress/dashboard/" + pageId} onDataReceived={onProgressDataReceived} />}</>
  // return (
  //   <>
  //     <div id={`dashboard-html-${pageId}`}></div>
  //     {!url && <ProgressBarRequests delayMS={1000} isUpdating={isUpdating} setIsUpdating={setIsUpdating} progress={{ now: progressValue }} setProgress={(prog) => setProgressValue(prog.now)} requestTopic={"evaluation/progress/dashboard/" + pageId} onDataReceived={onProgressDataReceived} />}
  //   </>
  // )
}

export default Dashboard
