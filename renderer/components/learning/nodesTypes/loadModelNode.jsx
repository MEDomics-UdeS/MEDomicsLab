import React, { useState, useContext, useEffect } from "react"
import Node from "../../flow/node"
import Input from "../input"
import { Button } from "react-bootstrap"
import ModalSettingsChooser from "../modalSettingsChooser"
import * as Icon from "react-bootstrap-icons"
import { FlowFunctionsContext } from "../../flow/context/flowFunctionsContext"
import { Stack } from "react-bootstrap"
import { DataContext } from "../../workspace/dataContext"
import MedDataObject from "../../workspace/medDataObject"
import { FlowInfosContext } from "../../flow/context/flowInfosContext"

/**
 *
 * @param {string} id id of the node
 * @param {object} data data of the node
 * @param {string} type type of the node
 * @returns {JSX.Element} A StandardNode node
 *
 * @description
 * This component is used to display a StandardNode node.
 * it handles the display of the node and the modal
 *
 */
const LoadModelNode = ({ id, data }) => {
  const [modalShow, setModalShow] = useState(false) // state of the modal
  const { updateNode } = useContext(FlowFunctionsContext)
  const [modelInfo, setModelInfo] = useState(null) // state of the modal
  const { globalData } = useContext(DataContext)
  const { flowContent } = useContext(FlowInfosContext)

  // update the node internal data when the selection changes
  useEffect(() => {
    if (globalData && modelInfo) {
      let modelDataObject = MedDataObject.checkIfMedDataObjectInContextbyPath(data.internal.settings.model_to_load.path, globalData)
      if (modelDataObject && modelDataObject.metadata.content) {
        let modelData = modelDataObject.metadata.content.model_required_cols
        console.log("modelData", modelData)
        checkPreviousDatasetFormat(modelData)
      }
    }
  }, [globalData, modelInfo])

  /**
   *
   * @param {Object} inputUpdate an object containing the name of the input and its new value
   */
  const onInputChange = (inputUpdate) => {
    data.internal.settings[inputUpdate.name] = inputUpdate.value
    if ("model_to_load" in data.internal.settings) {
      setModelInfo(data.internal.settings.model_to_load)
    }
    updateNode({
      id: id,
      updatedData: data.internal
    })
  }

  /**
   *
   * @param {Object} flowContent the flow content
   * @returns {Array} an array of all the pipelines in the flow
   */
  function findAllPaths(flowContent) {
    let links = flowContent.edges
    // Create a graph as an adjacency list
    const graph = {}

    // Populate the graph based on the links
    links.forEach((link) => {
      const { source, target } = link

      if (!graph[source]) {
        graph[source] = []
      }

      graph[source].push(target)
    })

    function explore(node, path) {
      if (!graph[node]) {
        // If there are no outgoing links from this node, add the path to the result
        let isValid = true
        path.forEach((id) => {
          let node = flowContent.nodes.find((node) => node.id == id)
          if (node.type == "groupNode") {
            isValid = false
          }
        })
        isValid =
          isValid &&
          flowContent.nodes
            .find((node) => node.id == path[path.length - 1])
            .data.setupParam.classes.split(" ")
            .includes("endNode")
        isValid && result.push(path)
        return
      }

      graph[node].forEach((neighbor) => {
        // Avoid cycles by checking if the neighbor is not already in the path
        if (!path.includes(neighbor)) {
          explore(neighbor, [...path, neighbor])
        }
      })
    }

    const result = []

    Object.keys(graph).forEach((id) => {
      let sourceNode = flowContent.nodes.find((node) => node.id == id)
      if (sourceNode.data.setupParam.classes.split(" ").includes("startNode")) {
        explore(id, [id])
      }
    })

    return result
  }

  /**
   *
   * @param {Object} modelData the model data
   *
   * @description
   * This function is used to check if the dataset connected to the model respects the model format
   */
  const checkPreviousDatasetFormat = (modelData) => {
    let pipelines = findAllPaths(flowContent)
    pipelines.forEach((pipeline) => {
      console.log("pipeline", pipeline)
      if (pipeline.includes(id)) {
        console.log("id", id)
        console.log(flowContent)
        let datasetNode = flowContent.nodes.find((node) => node.id == pipeline[0])
        console.log("datasetNode", datasetNode)

        let datasetNodeModelData = datasetNode.data.internal.settings
        console.log("datasetNodeModelData", datasetNodeModelData)
        let datasetNodeModelDataFormatted = {}
        if (datasetNodeModelData.columns && datasetNodeModelData.target) {
          datasetNodeModelDataFormatted = { columns: Object.keys(datasetNodeModelData.columns), target: datasetNodeModelData.target }
        }
        console.log("datasetNodeModelDataFormatted", datasetNodeModelDataFormatted)
        console.log("modelData", modelData)
        if (JSON.stringify(datasetNodeModelDataFormatted) == JSON.stringify(modelData)) {
          datasetNode.data.internal.hasWarning = { state: false }
        } else {
          datasetNode.data.internal.hasWarning = {
            state: true,
            tooltip: (
              <>
                <h4>This dataset does not respect the model format</h4>
                <p>Needed columns:</p>
                {/* here is a list of the needed columns */}
                <ul>
                  {modelData.columns.map((col) => {
                    return <li key={col}>{col}</li>
                  })}
                </ul>
                <p>Needed target:</p>
                {/* here is the required target */}
                <ul>
                  <li>{modelData.target}</li>
                </ul>
              </>
            )
          }
        }
        updateNode({
          id: datasetNode.id,
          updatedData: datasetNode.data.internal
        })
      }
    })
  }

  /**
   *
   * @param {Object} hasWarning an object containing the state of the warning and the tooltip
   */
  const handleWarning = (hasWarning) => {
    data.internal.hasWarning = hasWarning
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
        // no body for this node (particular to this node)
        // default settings are the default settings of the node, so mandatory settings
        defaultSettings={
          <>
            {"default" in data.setupParam.possibleSettings && (
              <>
                <Stack direction="vertical" gap={1}>
                  {Object.entries(data.setupParam.possibleSettings.default).map(([settingName, setting]) => {
                    return <Input setHasWarning={handleWarning} key={settingName} name={settingName} settingInfos={setting} currentValue={data.internal.settings[settingName]} onInputChange={onInputChange} />
                  })}
                </Stack>
              </>
            )}
          </>
        }
        // node specific is the body of the node, so optional settings
        nodeSpecific={
          <>
            {/* the button to open the modal (the plus sign)*/}
            <Button variant="light" className="width-100 btn-contour" onClick={() => setModalShow(true)}>
              <Icon.Plus width="30px" height="30px" className="img-fluid" />
            </Button>
            {/* the modal component*/}
            <ModalSettingsChooser show={modalShow} onHide={() => setModalShow(false)} options={data.setupParam.possibleSettings.options} data={data} id={id} />
            {/* the inputs for the options */}
            {data.internal.checkedOptions.map((optionName) => {
              return <Input key={optionName} name={optionName} settingInfos={data.setupParam.possibleSettings.options[optionName]} currentValue={data.internal.settings[optionName]} onInputChange={onInputChange} />
            })}
          </>
        }
      />
    </>
  )
}

export default LoadModelNode
