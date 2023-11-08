import React, { useEffect, useState } from "react"
import ModulePage from "./moduleBasics/modulePage"
import { Col, Row, Stack } from "react-bootstrap"
import Input from "../learning/input"
import { Button } from "primereact/button"
import { requestBackend } from "../../utilities/requests"
import { useContext } from "react"
import { WorkspaceContext } from "../workspace/workspaceContext"
import { ErrorRequestContext } from "../generalPurpose/errorRequestContext"
import { LoaderContext } from "../generalPurpose/loaderContext"
import Image from "next/image"

const ApplicationPage = ({ pageId, configPath }) => {
  const [chosenModel, setChosenModel] = useState("")
  const [modelMetadata, setModelMetadata] = useState(null)
  const [inputsData, setInputsData] = useState({})
  const [predictions, setPredictions] = useState(null)
  const [isValid2Predict, setIsValid2Predict] = useState(false)
  const { port } = useContext(WorkspaceContext)
  const { setError } = useContext(ErrorRequestContext)
  const { setLoader } = useContext(LoaderContext)
  const [quebecFlagDisplay, setQuebecFlagDisplay] = useState(false)

  useEffect(() => {
    console.log("chosenModel", chosenModel)
    chosenModel && setModelMetadata(chosenModel.metadata)
  }, [chosenModel])

  useEffect(() => {
    if (modelMetadata) {
      let columns = modelMetadata.columns
      let isValid = true
      columns.forEach((columnName) => {
        if (columnName != modelMetadata.target) {
          if (!inputsData[columnName]) {
            isValid = false
          }
        }
      })
      setIsValid2Predict(isValid)
    }
  }, [inputsData])

  useEffect(() => {
    console.log("quebecFlagDisplay changed", quebecFlagDisplay)
  }, [quebecFlagDisplay])

  let globalVar = true
  const handleQuebecFlagDisplay = () => {
    globalVar = !globalVar
    setQuebecFlagDisplay(!globalVar)
  }

  let sequence = ["Control", "m", "e", "d"]

  //  handle when user press ctrl+m+e+d
  const handleKeyDown = (event) => {
    if (event.key == "Control") {
      sequence = ["Control"]
    } else if (event.key == "m" && sequence[0] == "Control") {
      sequence = ["Control", "m"]
    } else if (event.key == "e" && sequence[1] == "m") {
      sequence = ["Control", "m", "e"]
    } else if (event.key == "d" && sequence[2] == "e") {
      handleQuebecFlagDisplay()
      sequence = []
    } else {
      sequence = []
    }
  }

  const handleKeyUp = (event) => {
    if (event.key == "Control") {
      sequence = []
    }
  }

  // This is a useEffect that will be called when a key is pressed
  useEffect(() => {
    // attach the event listener
    document.addEventListener("keydown", handleKeyDown)
    document.addEventListener("keyup", handleKeyUp)
    // remove the event listener
    return () => {
      document.removeEventListener("keydown", handleKeyDown)
      document.removeEventListener("keyup", handleKeyUp)
    }
  }, [])

  const handleInputUpdate = (inputUpdate) => {
    console.log("inputUpdate", inputUpdate)
    let newInputsData = { ...inputsData }
    newInputsData[inputUpdate.name] = [inputUpdate.value]
    setInputsData(newInputsData)
  }

  const handlePredictClick = () => {
    console.log("inputsData", inputsData)
    setLoader(true)
    requestBackend(
      port,
      "application/predict/" + pageId,
      {
        model: chosenModel,
        data: inputsData
      },
      (response) => {
        console.log("response", response)
        if (response.error) {
          setError(response.error)
          setPredictions(null)
        } else {
          setPredictions(response)
        }
        setLoader(false)
      },
      (error) => {
        setPredictions(null)
        setLoader(false)
      }
    )
  }

  return (
    <>
      <Stack gap={2}>
        <Input name="Choose model" settingInfos={{ type: "models-input", tooltip: "" }} currentValue={chosenModel} onInputChange={(data) => setChosenModel(data.value)} />
        {modelMetadata && (
          <>
            <div className="columns-filling">
              {modelMetadata.columns.map((columnName, index) => {
                if (columnName != modelMetadata.target) {
                  return <Input key={index} name={columnName} settingInfos={{ type: "string", tooltip: "" }} currentValue={inputsData[columnName] ? inputsData[columnName] : ""} onInputChange={handleInputUpdate} />
                }
              })}
            </div>
            <Row className="predictions-row">
              <Col md>
                <Button label="Predict" outlined severity="success" onClick={handlePredictClick} disabled={!isValid2Predict} />
              </Col>
              <Col md>
                <div className="pred-text" style={{ opacity: predictions ? "1" : "0.5" }}>
                  <h4>
                    {modelMetadata.target}: {predictions ? predictions.prediction : "NaN"}
                  </h4>
                </div>
              </Col>
            </Row>
          </>
        )}
        <Image className="quebec-flag" src="/images/QUEBEC-FLAG.jpg" alt="Quebec flag" width="750" height="500" style={{ opacity: quebecFlagDisplay ? "1" : "0" }} />
      </Stack>
    </>
  )
}

const ApplicationPageWithModulePage = ({ pageId = "application-456", configPath = null }) => {
  return (
    <>
      <ModulePage pageId={pageId} configPath={configPath} shadow>
        <div style={{ padding: "0.5rem" }}>
          <ApplicationPage pageId={pageId} configPath={configPath} />
        </div>
      </ModulePage>
    </>
  )
}

export default ApplicationPageWithModulePage
