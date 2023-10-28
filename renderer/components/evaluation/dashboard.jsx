import React, { useEffect, useContext, useState } from "react"
import { requestBackend } from "../../utilities/requests"
import { WorkspaceContext } from "../workspace/workspaceContext"
import { PageInfosContext } from "../mainPages/moduleBasics/pageInfosContext"
import { ErrorRequestContext } from "../generalPurpose/errorRequestContext"
import useInterval from "@khalidalansi/use-interval"
import { ProgressBar } from "primereact/progressbar"
import ProgressBarRequests from "../generalPurpose/progressBarRequests"

const Dashboard = ({ chosenModel, chosenDataset }) => {
  const { port } = useContext(WorkspaceContext) // we get the port for server connexion
  const { pageId } = useContext(PageInfosContext) // we get the pageId to send to the server
  const [isDashboardOpen, setIsDashboardOpen] = useState(false) // we use this to open and close the dashboard
  const [isDashboardMounted, setIsDashboardMounted] = useState(false) // we use this to mount and unmount the dashboard
  const { setError } = useContext(ErrorRequestContext)
  const [isUpdating, setIsUpdating] = useState(false) // we use this to know if the progress bar is updating or not
  const [loaded, setLoaded] = useState(false) // we use this to know if the dashboard is loaded or not
  const [url, setUrl] = useState(undefined) // we use this to store the url of the dashboard
  const [progressValue, setProgressValue] = useState(0) // we use this to store the progress value of the dashboard

  // handle the dashboard opening (mounting) and closing (unmounting)
  useEffect(() => {
    setIsDashboardMounted(true)
    return () => {
      requestBackend(
        port,
        "evaluation/close_dashboard/" + pageId,
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
    if (Object.keys(chosenModel).length != 0 && Object.keys(chosenDataset).length != 0) {
      setIsDashboardOpen(true)
    }
  }, [chosenModel, chosenDataset])

  // handle the dashboard opening (mounting) and closing (unmounting)
  useEffect(() => {
    if (isDashboardOpen && isDashboardMounted) {
      console.log("starting dashboard...")
      console.log("pageId:", pageId)
      console.log("chosenModel:", chosenModel)
      console.log("chosenDataset:", chosenDataset)
      setIsUpdating(true)
      requestBackend(
        port,
        "evaluation/open_dashboard/" + pageId,
        { pageId: pageId, model: chosenModel, dataset: chosenDataset, sampleSizeFrac: 0.01, dashboardName: chosenModel.name.split(".")[0] },
        (data) => {
          if (data.error) {
            setError(data.error)
          }
          console.log("openDashboard received data:", data)
        },
        (error) => {
          console.error(error)
        }
      )
    }
  }, [isDashboardOpen, isDashboardMounted])

  useInterval(
    () => {
      requestBackend(
        port,
        "evaluation/progress/" + pageId,
        { pageId: pageId },
        (data) => {
          console.log("progress received data:", data)
          setProgressValue(data.now)
          if (data.dashboard_url) {
            setUrl(data.dashboard_url)
            setIsUpdating(false)
          }
        },
        (error) => {
          console.error(error)
          setIsUpdating(false)
        }
      )
    },
    isUpdating ? 1000 : null
  )

  return <>{url ? <iframe src={url} width="100%" height="100%" frameBorder="0" onLoad={() => setLoaded(true)}></iframe> : <ProgressBar value={progressValue} />}</>
}

export default Dashboard
