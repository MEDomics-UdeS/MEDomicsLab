import React, { useState, useContext, useEffect } from "react"
import Node from "../../flow/node"

import { Button } from "react-bootstrap"
import * as Icon from "react-bootstrap-icons"
import { FlowFunctionsContext } from "../../flow/context/flowFunctionsContext"
import { Stack } from "react-bootstrap"
import { DataContext } from "../../workspace/dataContext"
import MedDataObject from "../../workspace/medDataObject"
import { LoaderContext } from "../../generalPurpose/loaderContext"
import ModalSettingsChooser from "../../learning/modalSettingsChooser"
import FlInput from "../paInput"

export default function DatasetLoaderNode({ id, data }) {
  const [modalShow, setModalShow] = useState(false)

  const { updateNode } = useContext(FlowFunctionsContext)
  const { globalData, setGlobalData } = useContext(DataContext)
  const { setLoader } = useContext(LoaderContext)
  const [settings, setSettings] = useState(data.internal.settings)

  useEffect(() => {
    if (Object.keys(settings).length < Object.keys(data.setupParam.possibleSettings.datasets[data.internal.contentType].files).length * 3) {
      data.internal.hasWarning = { state: true, tooltip: <p>Select all dataset types</p> }
    } else {
      data.internal.hasWarning = { state: false }
    }
    updateNode({
      id: id,
      updatedData: { ...data.internal, settings: settings }
    })
  }, [settings]) // eslint-disable-line react-hooks/exhaustive-deps

  const onInputChange = (inputUpdate) => {
    const newSettings = { ...settings, [inputUpdate.name]: inputUpdate.value }
    if (["files", "target"].includes(inputUpdate.name)) {
      setGlobalData({ ...globalData })
    }

    setSettings(newSettings)
  }

  const handleWarning = (hasWarning) => {
    updateNode({
      id: id,
      updatedData: {
        ...data.internal,
        hasWarning: hasWarning
      }
    })
  }

  const onFilesChange = async (inputUpdate) => {
    const newSettings = { ...settings, [inputUpdate.name]: inputUpdate.value }
    const fileIndex = parseInt(inputUpdate.name.split("_")[1])
    if (inputUpdate.value.path !== "") {
      setLoader(true)
      const { columnsArray, columnsObject } = await MedDataObject.getColumnsFromPath(inputUpdate.value.path, globalData, setGlobalData)
      const steps = await MedDataObject.getStepsFromPath(inputUpdate.value.path, globalData, setGlobalData)
      setLoader(false)
      if (steps) newSettings.steps = steps

      // Update the columns property for the specific file index
      newSettings[`columns_${fileIndex}`] = columnsObject

      // Update target variable for the corresponding file
      newSettings[`target_${fileIndex}`] = columnsArray[columnsArray.length - 1]
    }
    if (newSettings[`target_${fileIndex}`] === "") {
      delete newSettings[`target_${fileIndex}`].target
      delete newSettings[`columns_${fileIndex}`]
    }
    setSettings(newSettings)
  }

  const getDatasetFields = (datasets, contentType) => {
    if (!datasets[contentType]) return null
    return datasets[contentType].files.map((file, index) => (
      <React.Fragment key={index}>
        <p className="text-muted">Please Select {file.name}</p>
        <FlInput
          name={`file_${index}`}
          settingInfos={{
            type: "data-input",
            tooltip: datasets[contentType].tooltip
          }}
          currentValue={settings[`file_${index}`] || ""}
          onInputChange={onFilesChange}
          setHasWarning={handleWarning}
        />
        <FlInput
          name={`target_${index}`}
          settingInfos={{
            type: "list",
            tooltip: "<p>Specify the column name of the target variable</p>",
            choices: settings[`columns_${index}`]
              ? Object.entries(settings[`columns_${index}`]).map(([option]) => {
                  return {
                    name: option
                  }
                })
              : []
          }}
          currentValue={settings[`target_${index}`] || ""}
          onInputChange={onInputChange}
          setHasWarning={handleWarning}
        />
      </React.Fragment>
    ))
  }

  return (
    <>
      <Node
        key={id}
        id={id}
        data={data}
        setupParam={data.setupParam}
        nodeBody={
          <div className="center">
            <Button variant="light" className="width-100 btn-contour">
              {settings.target ? `Change Selected ${data.internal.contentType} Datasets` : `Select ${data.internal.contentType} Datasets`}
            </Button>
            <p style={{ textAlign: "center", marginTop: "10px", fontSize: "12px" }}>
              This node simplifies the process by
              <br></br>automatically providing the dataset types
              <br></br>required for each ML model when connected.
            </p>
          </div>
        }
        defaultSettings={
          <Stack id="default" direction="vertical" gap={1}>
            {getDatasetFields(data.setupParam.possibleSettings.datasets, data.internal.contentType)}
          </Stack>
        }
        nodeSpecific={
          <>
            <Button variant="light" className="width-100 btn-contour" onClick={() => setModalShow(true)}>
              <Icon.Plus width="30px" height="30px" className="img-fluid" />
            </Button>
            <ModalSettingsChooser show={modalShow} onHide={() => setModalShow(false)} options={data.setupParam.possibleSettings.options} data={data} id={id} />
            {data.internal.checkedOptions.map((optionName) => (
              <FlInput
                key={optionName}
                name={optionName}
                settingInfos={data.setupParam.possibleSettings.options[optionName]}
                currentValue={settings[optionName]}
                onInputChange={(value) => onInputChange({ name: optionName, value })}
              />
            ))}
          </>
        }
      />
    </>
  )
}
