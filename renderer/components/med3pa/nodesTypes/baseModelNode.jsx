/* eslint-disable camelcase */
import React, { useState, useContext, useEffect } from "react"
import Node from "../../flow/node"
import { Button, OverlayTrigger, Tooltip } from "react-bootstrap"
import * as Icon from "react-bootstrap-icons"
import { FlowFunctionsContext } from "../../flow/context/flowFunctionsContext"
import { LoaderContext } from "../../generalPurpose/loaderContext"
import FlInput from "../paInput"

export default function BaseModelNode({ id, data }) {
  const [showDetails, setShowDetails] = useState(false)
  const [hovered, setHovered] = useState(false)
  const { updateNode } = useContext(FlowFunctionsContext)
  const { setLoader } = useContext(LoaderContext)

  useEffect(() => {
    const filterSettings = () => {
      const filteredSettings = Object.keys(data.internal.settings)
        .filter((key) => ["file"].includes(key))
        .reduce((obj, key) => {
          obj[key] = data.internal.settings[key]
          return obj
        }, {})

      return filteredSettings
    }

    const updateSettings = () => {
      const filteredSettings = filterSettings()
      data.internal.settings = filteredSettings

      updateNode({
        id: id,
        updatedData: data.internal
      })
    }

    if (data.internal.settings.file) {
      data.internal.hasWarning = { state: false, tooltip: <p>No Base Model selected</p> }
    } else {
      data.internal.hasWarning = { state: true }
    }

    updateSettings()
  }, [id, data.internal, updateNode])

  const handleWarning = (hasWarning) => {
    data.internal.hasWarning = hasWarning
    updateNode({
      id: id,
      updatedData: data.internal
    })
  }

  const onFilesChange = async (inputUpdate) => {
    data.internal.settings[inputUpdate.name] = inputUpdate.value
    if (inputUpdate.value.path !== "") {
      setLoader(false)
    } else {
      setLoader(true)
    }
    updateNode({
      id: id,
      updatedData: data.internal
    })
  }

  const toggleShowDetails = () => {
    setShowDetails(!showDetails)
  }

  return (
    <Node
      key={id}
      id={id}
      data={data}
      setupParam={data.setupParam}
      nodeBody={
        <>
          <div className="center">
            <Button variant="light" className="width-100 btn-contour">
              {data.internal.settings.target ? `Change Selected Base Model` : `Select Base Model`}
            </Button>
            <p style={{ textAlign: "center", marginTop: "10px", fontSize: "12px" }}>This node is responsible for loading the Base Model (.pkl).</p>
          </div>
          {data.internal.settings.file && (
            <div className="center">
              <Button
                variant="light"
                className="width-100 btn-contour"
                onClick={toggleShowDetails}
                style={{
                  backgroundColor: "transparent",
                  border: "none",
                  padding: 0,
                  textAlign: "left",
                  display: "flex",
                  alignItems: "center"
                }}
              >
                <div
                  className="d-flex align-items-center"
                  style={{
                    transition: "color 0.3s",
                    cursor: "pointer",
                    marginLeft: "auto"
                  }}
                  onMouseEnter={() => setHovered(true)}
                  onMouseLeave={() => setHovered(false)}
                >
                  <span
                    className="ms-2"
                    style={{
                      fontSize: "0.8rem",
                      color: hovered ? "black" : "#999" // Lighter color
                    }}
                  >
                    {showDetails ? "Hide Details" : "Show Details"}
                  </span>
                  {showDetails ? <Icon.Dash style={{ color: hovered ? "black" : "#999", marginRight: "5px" }} /> : <Icon.Plus style={{ color: hovered ? "black" : "#999", marginRight: "5px" }} />}
                </div>
              </Button>
            </div>
          )}
          {showDetails && (
            <div className="border border-light p-3 mb-3">
              <hr className="my-2" />
              <br />
              <div className="mb-3">
                <div className="d-flex justify-content-between">
                  <div className="col-sm-6">
                    <p className="fw-bold mb-0" style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      Name
                    </p>
                  </div>
                  <div className="col-sm-6">
                    <OverlayTrigger placement="top" overlay={<Tooltip id="tooltip">{data.internal.settings.file?.name}</Tooltip>}>
                      <p className="fw-bold mb-0 text-end" style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {data.internal.settings.file?.name}
                      </p>
                    </OverlayTrigger>
                  </div>
                </div>
                <div className="d-flex justify-content-between">
                  <div className="col-sm-6">
                    <p className="fw-bold mb-0" style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      Path
                    </p>
                  </div>
                  <div className="col-sm-6">
                    <OverlayTrigger placement="top" overlay={<Tooltip id="tooltip">{data.internal.settings.file?.path}</Tooltip>}>
                      <p className="fw-bold mb-0 text-end" style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {data.internal.settings.file?.path}
                      </p>
                    </OverlayTrigger>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      }
      defaultSettings={
        <FlInput
          name="file"
          settingInfos={{
            type: "models-input",
            tooltip: "<p>Specify a model file (model)</p>"
          }}
          currentValue={data.internal.settings.file || {}}
          onInputChange={onFilesChange}
          setHasWarning={handleWarning}
        />
      }
    />
  )
}
