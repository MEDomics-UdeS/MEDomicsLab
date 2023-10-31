import React, { useEffect, useContext, useState } from "react"
import { Button } from "primereact/button"
import { requestBackend } from "../../utilities/requests"
import { WorkspaceContext } from "../workspace/workspaceContext"
import { PageInfosContext } from "../mainPages/moduleBasics/pageInfosContext"
import { ErrorRequestContext } from "../generalPurpose/errorRequestContext"
import useInterval from "@khalidalansi/use-interval"
import ProgressBarRequests from "../generalPurpose/progressBarRequests"
import DataTableWrapperBPClass from "../dataTypeVisualisation/dataTableWrapperBPClass"
import MedDataObject from "../workspace/medDataObject"

const PredictPanel = ({ chosenConfig }) => {
  const { port } = useContext(WorkspaceContext) // we get the port for server connexion
  const { pageId } = useContext(PageInfosContext) // we get the pageId to send to the server
  const [progressValue, setProgressValue] = useState(0) // we use this to store the progress value of the dashboard
  const [isUpdating, setIsUpdating] = useState(false) // we use this to know if the progress bar is updating or not
  const [predictedData, setPredictedData] = useState(undefined) // we use this to store the predicted data
  const [isPredictOpen, setIsPredictOpen] = useState(false) // we use this to open and close the dashboard
  const [isPredictMounted, setIsPredictMounted] = useState(false) // we use this to mount and unmount the dashboard
  const [chosenModel, setChosenModel] = useState({}) // we use this to store the chosen model
  const [chosenDataset, setChosenDataset] = useState({}) // we use this to store the chosen dataset
  const { setError } = useContext(ErrorRequestContext)

  // handle the dashboard opening (mounting) and closing (unmounting)
  useEffect(() => {
    setIsPredictMounted(true)
  }, [])

  useEffect(() => {
    if (Object.keys(chosenConfig).length != 0) {
      if (Object.keys(chosenConfig.model).length != 0 && Object.keys(chosenConfig.dataset).length != 0) {
        setChosenModel(chosenConfig.model)
        setChosenDataset(chosenConfig.dataset)
        setIsPredictOpen(true)
      }
    }
  }, [chosenConfig])

  // handle the dashboard opening (mounting) and closing (unmounting)
  useEffect(() => {
    if (isPredictOpen && isPredictMounted) {
      setIsUpdating(true)
      requestBackend(
        port,
        "evaluation/predict_test/predict/" + pageId,
        { pageId: pageId, model: chosenModel, dataset: chosenDataset, mlType: chosenModel.mlType },
        (data) => {
          setIsUpdating(false)
          if (data.error) {
            setError(data.error)
          } else {
            setPredictedData(data)
          }
          console.log("openDashboard received data:", data)
        },
        (error) => {
          console.error(error)
          setIsUpdating(false)
        }
      )
    }
  }, [isPredictOpen, isPredictMounted, chosenModel, chosenDataset])

  const onProgressDataReceived = (data) => {
    setProgressValue(data.now)
    if (data.now >= 100) {
      setIsUpdating(false)
    }
  }

  return (
    <div>
      <h1>Predictions: </h1>
      {predictedData ? (
        <>
          <div style={{ overflow: "auto", height: "500px" }}>
            <DataTableWrapperBPClass
              data={predictedData.data}
              config={{
                extension: "csv",
                name: "predictedData",
                path: chosenModel.path.replace(".medmodel", ".csv")
              }}
            />
          </div>
        </>
      ) : (
        <ProgressBarRequests isUpdating={isUpdating} setIsUpdating={setIsUpdating} progress={{ now: progressValue }} setProgress={(prog) => setProgressValue(prog.now)} requestTopic={"evaluation/progress/predict/" + pageId} onDataReceived={onProgressDataReceived} />
      )}
    </div>
  )
}

export default PredictPanel
