import React, { useEffect, useContext, useState } from "react"
import { requestBackend } from "../../utilities/requests"
import { WorkspaceContext } from "../workspace/workspaceContext"
import { PageInfosContext } from "../mainPages/moduleBasics/pageInfosContext"
import { ErrorRequestContext } from "../generalPurpose/errorRequestContext"
import ProgressBarRequests from "../generalPurpose/progressBarRequests"

const Dashboard = ({ chosenConfig, modelObjPath }) => {
  const { port } = useContext(WorkspaceContext) // we get the port for server connexion
  const { pageId } = useContext(PageInfosContext) // we get the pageId to send to the server
  const [isDashboardOpen, setIsDashboardOpen] = useState(false) // we use this to open and close the dashboard
  const [isDashboardMounted, setIsDashboardMounted] = useState(false) // we use this to mount and unmount the dashboard
  const { setError } = useContext(ErrorRequestContext)
  const [isUpdating, setIsUpdating] = useState(false) // we use this to know if the progress bar is updating or not
  const [url, setUrl] = useState(undefined) // we use this to store the url of the dashboard
  const [progressValue, setProgressValue] = useState(0) // we use this to store the progress value of the dashboard
  const [isRunning, setIsRunning] = useState(false) // we use this to know if the dashboard is running or not

  // handle the dashboard opening (mounting) and closing (unmounting)
  useEffect(() => {
    setIsDashboardMounted(true)
    return () => {
      requestBackend(
        port,
        "evaluation/close_dashboard/dashboard/" + pageId,
        { pageId: pageId },
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
    console.log("dashboard chosenConfig changed:", chosenConfig)
    if (Object.keys(chosenConfig).length != 0) {
      if (Object.keys(chosenConfig.model).length != 0 && Object.keys(chosenConfig.dataset).length != 0) {
        setIsDashboardOpen(true)
        console.log("isDashboardOpen:", isDashboardOpen)
      }
    }
  }, [chosenConfig])

  // handle the dashboard opening (mounting) and closing (unmounting)
  useEffect(() => {
    console.log("isDashboardOpen:", isDashboardOpen)
    console.log("isDashboardMounted:", isDashboardMounted)
    console.log("isRunning:", isRunning)
    if (isDashboardOpen && isDashboardMounted && !isRunning && modelObjPath != "") {
      console.log("closing previous dashboard...")

      setIsRunning(true)
      setIsUpdating(false)
      setProgressValue(0)
      requestBackend(
        port,
        "evaluation/close_dashboard/dashboard/" + pageId,
        { pageId: pageId },
        (data) => {
          console.log("closeDashboard received data:", data)
          setIsUpdating(true)
          setUrl(undefined)
          console.log("starting dashboard...")
          console.log("modelObjPath dashboard", modelObjPath)
          console.log("chosenConfig:", chosenConfig)

          requestBackend(
            port,
            "evaluation/open_dashboard/dashboard/" + pageId,
            { pageId: pageId, model: chosenConfig.model, dataset: chosenConfig.dataset, sampleSizeFrac: 0.005, dashboardName: chosenConfig.model.name.split(".")[0], modelObjPath: modelObjPath },
            (data) => {
              console.log("openDashboard received data:", data)
              setIsUpdating(false)
              if (data.error) {
                setError(data.error)
              } else {
                setIsDashboardOpen(false)
              }
              setIsRunning(false)
            },
            (error) => {
              console.log("openDashboard received error:", error)
              setIsDashboardOpen(false)
              setIsRunning(false)
            }
          )
        },
        (error) => {
          console.log("closeDashboard received error:", error)
        }
      )
    }
  }, [isDashboardOpen, isDashboardMounted, chosenConfig, modelObjPath, isRunning])

  const onProgressDataReceived = (data) => {
    setProgressValue(data.now)
    if (data.dashboard_url) {
      setUrl(data.dashboard_url)
      setIsUpdating(false)
    }
  }

  return <>{url ? <iframe src={url} width="100%" height="100%" frameBorder="0"></iframe> : <ProgressBarRequests delayMS={1000} isUpdating={isUpdating} setIsUpdating={setIsUpdating} progress={{ now: progressValue }} setProgress={(prog) => setProgressValue(prog.now)} requestTopic={"evaluation/progress/dashboard/" + pageId} onDataReceived={onProgressDataReceived} />}</>
}

export default Dashboard
