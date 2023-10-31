import React, { useContext, useEffect } from "react"
import ProgressBar from "react-bootstrap/ProgressBar"
import useInterval from "@khalidalansi/use-interval"
import { requestBackend, requestJson } from "../../utilities/requests"
import { WorkspaceContext } from "../workspace/workspaceContext"
import { toast } from "react-toastify"
import MEDconfig, { SERVER_CHOICE } from "../../../medomics.dev"
import { PageInfosContext } from "../mainPages/moduleBasics/pageInfosContext"
const isFlask = MEDconfig.serverChoice == SERVER_CHOICE.FLASK

/**
 *
 * @param {boolean} isUpdating is the progress bar updating *set to true to start requesting the progress
 * @param {function} setIsUpdating set the updating state
 * @param {object} progress the progress object : {now: number, currentName: string} *currentName can be ignored when withLabel is false
 * @param {function} setProgress set the progress object
 * @param {string} requestTopic the topic to request the progress from
 * @param {string} variant the variant of the progress bar
 * @param {boolean} withLabel should the progress bar have a label to follow the progress
 * @param {number} delayMS the delay in ms between each request

 * @returns a progress bar that shows the progress of the current flow
 */
const ProgressBarRequests = ({ isUpdating, setIsUpdating, progress, setProgress, requestTopic, withLabel = true, delayMS = 1000, progressBarProps = { animated: true, variant: "success" }, onDataReceived }) => {
  const { port } = useContext(WorkspaceContext) // used to get the port
  const { pageId } = useContext(PageInfosContext) // used to get the pageId

  useInterval(
    () => {
      requestBackend(
        port,
        requestTopic,
        { pageId: pageId },
        (data) => {
          if ("now" in data) {
            setProgress({
              now: data.now,
              currentLabel: data.currentLabel && data.currentLabel
            })
            if (onDataReceived) {
              onDataReceived(data)
            } else {
              if (data.now >= 100) {
                setProgress({
                  now: 100,
                  currentLabel: "Done!"
                })
                setIsUpdating(false)
              }
            }
          } else {
            console.log("An error occured during: ", requestTopic)
            console.log("data:", data)
            toast.error("No 'now' key in the response: " + JSON.stringify(data))
            setProgress({
              now: 0,
              currentLabel: ""
            })
            setIsUpdating(false)
          }
        },
        (error) => {
          console.log("An error occured during: ", requestTopic)
          setIsUpdating(false)
        }
      )
    },
    isUpdating ? delayMS : null
  )

  return (
    <>
      <div className="progress-bar-requests">
        {withLabel && <label>{progress.currentLabel || ""}</label>}
        <ProgressBar {...progressBarProps} now={progress.now >= 100 ? 100 : progress.now} label={`${progress.now >= 100 ? 100 : progress.now}%`} />
      </div>
    </>
  )
}

export default ProgressBarRequests
