/* eslint-disable camelcase */
import React, { useState, useContext, useEffect } from "react"
import Node from "../../../flow/node"
import { Button, OverlayTrigger, Tooltip } from "react-bootstrap"
import * as Icon from "react-bootstrap-icons"
import { FlowFunctionsContext } from "../../../flow/context/flowFunctionsContext"
import { LoaderContext } from "../../../generalPurpose/loaderContext"

import FlInput from "../../baseComponents/paInput"

/**
 *
 * @param {string} id id of the node
 * @param {Object} data data of the node
 * @returns {JSX.Element} A BaseModel node
 *
 *
 * @description
 * This component is used to display a BaseModel node.
 * It manages the display of the node.
 * The node  takes a .pkl file as an input
 */
export default function BaseModelNode({ id, data }) {
  const [showDetails, setShowDetails] = useState(false) // Show and hide settings details of the node
  const [hovered, setHovered] = useState(false)
  const { updateNode } = useContext(FlowFunctionsContext)
  const { setLoader } = useContext(LoaderContext)

  // Set up node's data internal settings when creating node
  useEffect(() => {
    /**
     *
     * @returns {Object} An object containing only the filtered settings.
     *
     *
     * @description
     * This function filters the `data.internal.settings` object to include only the settings
     * with keys that are specified in the filter array. It creates a new object containing
     * only these filtered settings and returns it.
     */
    const filterSettings = () => {
      const filteredSettings = Object.keys(data.internal.settings)
        .filter((key) => ["file"].includes(key))
        .reduce((obj, key) => {
          obj[key] = data.internal.settings[key]
          return obj
        }, {})

      return filteredSettings
    }

    /**
     *
     *
     * @description
     * This function updates the `data.internal.settings` with the filtered settings, and manages warnings
     * based on the presence of the 'file' setting.
     */
    const updateSettings = () => {
      const filteredSettings = filterSettings()
      data.internal.settings = filteredSettings
      if (data.internal.settings.file) {
        data.internal.hasWarning = { state: false }
      } else {
        data.internal.hasWarning = { state: true, tooltip: <p>No Base Model selected</p> }
      }
      updateNode({
        id: id,
        updatedData: data.internal
      })
    }

    updateSettings()
  }, [])

  /**
   *
   * @param {Object} hasWarning The warning object
   *
   *
   * @description
   * This function is used to update the node internal data when a warning is triggered from the Input component.
   */
  const handleWarning = (hasWarning) => {
    data.internal.hasWarning = hasWarning
    updateNode({
      id: id,
      updatedData: data.internal
    })
  }

  /**
   *
   * @param {Object} inputUpdate The input update
   *
   *
   * @description
   * This function is used to update the node internal data when the files input changes.
   */
  const onFilesChange = async (inputUpdate) => {
    data.internal.settings[inputUpdate.name] = inputUpdate.value
    if (data.internal.settings.file) {
      data.internal.hasWarning = { state: false }
    }
    if (inputUpdate.value.path !== "") {
      setLoader(false)
    } else {
      data.internal.hasWarning = { state: true, tooltip: <p>No Base Model selected</p> }
      setLoader(true)
      setTimeout(() => {
        setLoader(false)
      }, 1000) // Reset loader to true after 1 second
    }
    updateNode({
      id: id,
      updatedData: data.internal
    })
  }

  /**
   *
   *
   * @description
   * This function switches the state of `showDetails` between `true` and `false`
   */
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
                      color: hovered ? "black" : "#999"
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
            type: "basemodel-input",
            tooltip: "<p>Specify a base model file (model)</p>"
          }}
          currentValue={data.internal.settings.file || {}}
          onInputChange={onFilesChange}
          setHasWarning={handleWarning}
        />
      }
    />
  )
}
