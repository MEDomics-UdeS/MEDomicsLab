import React, { useState, useContext } from "react"
import ProgressBar from "react-bootstrap/ProgressBar"
import useInterval from "@khalidalansi/use-interval"
import { requestJson } from "../../utilities/requests"
import { WorkspaceContext } from "../workspace/workspaceContext"
import { PageInfosContext } from "../mainPages/moduleBasics/pageInfosContext"

/**
 * 
 * @param {boolean} isUpdating is the progress bar updating
 * @param {function} setIsUpdating set the updating state 
 * @returns a progress bar that shows the progress of the current flow
 */
const ProgressBarRequests = ({ isUpdating, setIsUpdating }) => {
  const { pageId } = useContext(PageInfosContext) // used to get the flow infos
  const [progress, setProgress] = useState({
    now: 0,
    currentName: ""
  })
  const { port } = useContext(WorkspaceContext) // used to get the port

  useInterval(
    () => {
      requestJson(
        port,
        "/learning/progress/" + pageId,
        // eslint-disable-next-line camelcase
        { scene_id: pageId },
        (data) => {
          setProgress({
            now: data.progress,
            currentName: data.cur_node
          })
          if (data.progress === 100) {
            setIsUpdating(false)
            setProgress({
              now: data.progress,
              currentName: "Done!"
            })
          }
        },
        (error) => {
          console.error(error)
          setIsUpdating(false)
        }
      )
    },
    isUpdating ? 400 : null
  )

  return (
    <>
      <label>{progress.currentName || ""}</label>
      <ProgressBar variant="success" animated now={progress.now} label={`${progress.now}%`} />
    </>
  )
}

export default ProgressBarRequests
