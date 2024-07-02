import React, { useContext, useEffect, useState } from "react"
import Node from "../../flow/node"
import { Button } from "react-bootstrap"
import FlInput from "../flInput"
import { FlowFunctionsContext } from "../../flow/context/flowFunctionsContext"
import { DataContext } from "../../workspace/dataContext"
import { LoaderContext } from "../../generalPurpose/loaderContext"
import MedDataObject from "../../workspace/medDataObject"
import DataFilesLoader from "../dataFilesLoader"

export default function FlClientNode({ id, data }) {
  //states
  const [clientType, setNodeType] = useState("")
  const [showDataModal, setModalData] = useState(false)

  // context
  const { updateNode } = useContext(FlowFunctionsContext)
  const { globalData, setGlobalData } = useContext(DataContext)
  const { setLoader } = useContext(LoaderContext)

  useEffect(() => {
    setNodeType(data.internal.settings.nodeType || "")
  }, [])

  // context
  const onNodeTypeChange = (nodeType) => {
    data.internal.settings.nodeType = nodeType.value
    setNodeType(nodeType.value)

    // Update the node
    updateNode({
      id: id,
      updatedData: data.internal
    })
  }

  const onFileSelection = async (inputUpdate) => {
    data.internal.settings[inputUpdate.name] = inputUpdate.value
    if (inputUpdate.value.path != "") {
      setLoader(true)
      let { columnsArray, columnsObject } = await MedDataObject.getColumnsFromPath(inputUpdate.value.path, globalData, setGlobalData)
      let steps = await MedDataObject.getStepsFromPath(inputUpdate.value.path, globalData, setGlobalData)
      setLoader(false)
      steps && (data.internal.settings.steps = steps)
      data.internal.settings.columns = columnsObject
      data.internal.settings.target = columnsArray[columnsArray.length - 1]
    } else {
      delete data.internal.settings.target
      delete data.internal.settings.columns
    }

    // Update the node
    updateNode({
      id: id,
      updatedData: data.internal
    })
  }

  return (
    <>
      {/* build on top of the Node component */}

      <Node
        key={id}
        id={id}
        data={data}
        setupParam={data.setupParam}
        // the body of the node is a form select (particular to this node)
        nodeBody={
          <>
            {data.internal.settings.Node_Dataset?.path && (
              <DataFilesLoader
                title={"Client name: " + data.internal.name + " , Dataset: " + data.internal.settings.Node_Dataset.name}
                path={data.internal.settings.Node_Dataset.path}
                show={showDataModal}
                onHide={() => {
                  setModalData(false)
                }}
              />
            )}
          </>
        }
        // default settings are the default settings of the node, so mandatory settings
        defaultSettings={
          <>
            <FlInput
              name="Node's type"
              settingInfos={{
                type: "list",
                tooltip: "Specify the number of federated rounds",
                choices: [{ name: "Train node" }, { name: "Test Node" }, { name: "Hybrid (Train + Test)" }]
              }}
              currentValue={clientType}
              onInputChange={onNodeTypeChange}
              setHasWarning={() => {}}
            />
            <FlInput
              name="Node_Dataset"
              settingInfos={{
                type: "data-input",
                tooltip: "<p>Specify a data file (xlsx, csv, json)</p>"
              }}
              currentValue={data.internal.settings.Node_Dataset || {}}
              onInputChange={onFileSelection}
              setHasWarning={() => {}}
              acceptedExtensions={["csv"]}
            />
          </>
        }
        // node specific is the body of the node, so optional settings
        nodeSpecific={
          <>
            <div className="center">
              {data.internal.settings.Node_Dataset?.path && (
                <Button variant="light" className="width-100 btn-contour" onClick={() => setModalData(true)}>
                  View Dataset
                </Button>
              )}
            </div>
          </>
        }
      />
    </>
  )
}
