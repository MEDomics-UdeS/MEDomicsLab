import React, { useState, useContext } from "react"
import ProgressBar from "react-bootstrap/ProgressBar"
import useInterval from "@khalidalansi/use-interval"
import { requestJson } from "../../utilities/requests"

import { PageInfosContext } from "../mainPages/moduleBasics/pageInfosContext"

const ProgressBarRequests = ({ isUpdating, setIsUpdating }) => {
  // const [isUpdating, setIsUpdating] = useState(true);
  const { pageInfos } = useContext(PageInfosContext) // used to get the flow infos
  const [progress, setProgress] = useState({
    now: 0,
    currentName: ""
  })

  useInterval(
    () => {
      requestJson(
        5000,
        "/learning/progress",
        { experimentId: pageInfos.id },
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
        () => console.log("Error")
      )
    },
    isUpdating ? 200 : null
  )

  return (
    <>
      <label>{progress.currentName || ""}</label>
      <ProgressBar
        variant="success"
        animated
        now={progress.now}
        label={`${progress.now}%`}
      />
    </>
  )
}

export default ProgressBarRequests
