import React, { useContext } from "react"
import ProgressBar from "react-bootstrap/ProgressBar"
import useInterval from "@khalidalansi/use-interval"
import { requestJson } from "../../utilities/requests"
import { WorkspaceContext } from "../workspace/workspaceContext"
import { toast } from "react-toastify"

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
const ProgressBarRequests = ({ isUpdating, setIsUpdating, progress, setProgress, requestTopic, variant = "success", withLabel = true, delayMS = 400 }) => {
  const { port } = useContext(WorkspaceContext) // used to get the port
  useInterval(
    () => {
      requestJson(
        port,
        requestTopic,
        // eslint-disable-next-line camelcase
        {},
        (data) => {
          if ("now" in data) {
            setProgress({
              now: data.now,
              currentLabel: data.currentLabel && data.currentLabel
            })
            if (data.now == 100) {
              setIsUpdating(false)
              setProgress({
                now: data.now,
                currentLabel: "Done!"
              })
            }
          } else {
            toast.error("No 'now' key in the response")
            setProgress({
              now: 0,
              currentLabel: ""
            })
            setIsUpdating(false)
          }
        },
        (error) => {
          console.error(error)
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
        <ProgressBar variant={variant} animated now={progress.now} label={`${progress.now}%`} />
      </div>
    </>
  )
}

export default ProgressBarRequests
