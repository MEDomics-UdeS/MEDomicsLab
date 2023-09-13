import React, { useContext, useState, useEffect, useCallback } from "react"
import Card from "react-bootstrap/Card"
import { Col } from "react-bootstrap"
import { FlowResultsContext } from "../../flow/context/flowResultsContext"
import { FlowInfosContext } from "../../flow/context/flowInfosContext"
import Button from "react-bootstrap/Button"
import * as Icon from "react-bootstrap-icons"
import { deepCopy } from "../../../utilities/staticFunctions"
import DataParamResults from "./node/dataParamResults"
import ModelsResults from "./node/modelsResults"
import { TabView, TabPanel } from "primereact/tabview"
import { Menubar } from "primereact/menubar"

/**
 *
 * @returns {JSX.Element} A results pane accessed by using the menu tree
 *
 * @description
 * This component is used to display the results of the pipeline according to the selected nodes.
 *
 */
const ResultsPane = () => {
  const { setShowResultsPane, what2show, flowResults } =
    useContext(FlowResultsContext)
  const { flowContent } = useContext(FlowInfosContext)

  const [body, setBody] = useState(<></>)
  const [title, setTitle] = useState("")

  const handleClose = () => setShowResultsPane(false)

  // callback function to update title and body when what2show changes
  useEffect(() => {
    console.log("results update", what2show, flowResults)
    if (what2show == "" || Object.keys(flowResults).length == 0) {
      setTitle("Results")
      setBody(
        <>
          <div style={{ textAlign: "center" }}>
            <h6>Nothing is selected or results are not generated yet </h6>
          </div>
        </>
      )
    } else {
      setTitle(createTitle())
      setBody(createBody())
    }
  }, [what2show, flowResults])

  useEffect(() => {
    console.log("results update - flowContent", flowContent, flowResults)
    // find selected ids
    let selectedIds = []
    flowContent.nodes.forEach((node) => {
      if (node.data.internal.results.checked) {
        selectedIds.push(node.id)
      }
    })
    console.log("selectedIds", selectedIds)

    // find all pipelines
    let pipelines = getAllPipelines(flowContent)
    console.log("pipelines", pipelines)
  }, [flowContent, flowResults])

  const getAllPipelines = (flowContent) => {
    let pipelines = []

    const getAllPipelinesRec = (currentPipe, nodeId) => {
      currentPipe = deepCopy(currentPipe)
      let foundSomething = false
      flowContent.edges.forEach((edge) => {
        let sourceNode = flowContent.nodes.find(
          (node) => node.id == edge.source
        )
        let targetNode = flowContent.nodes.find(
          (node) => node.id == edge.target
        )
        if (nodeId == edge.source) {
          foundSomething = true
          currentPipe.push(sourceNode.data.internal.name)
          getAllPipelinesRec(currentPipe, edge.target)
        }
      })

      if (!foundSomething) {
        // let sourceNode = flowContent.nodes.find((node) => node.id == nodeId)
        // currentPipe.push(sourceNode.data.internal.name)
        pipelines.push(currentPipe)
      }
    }

    flowContent.edges.forEach((edge) => {
      let sourceNode = flowContent.nodes.find((node) => node.id == edge.source)
      if (sourceNode.data.internal.type == "dataset") {
        let pipeline = []
        pipeline.push(sourceNode.data.internal.name)
        getAllPipelinesRec(pipeline, edge.target)
      }
    })
    return pipelines
  }

  /**
   *
   * @returns {string} A string containing the title of the results pane
   */
  const createTitle = () => {
    let selectedId = what2show.split("/")[what2show.split("/").length - 1]
    let selectedNode = flowContent.nodes.find((node) => node.id == selectedId)

    return selectedNode.data.internal.name
  }

  /**
   *
   * @returns {JSX.Element} A JSX element containing the body of the results pane
   */
  const createBody = useCallback(() => {
    let selectedId = what2show.split("/")[what2show.split("/").length - 1]
    let selectedNode = flowContent.nodes.find((node) => node.id == selectedId)
    console.log("selectedId", selectedId)
    let selectedResults = deepCopy(flowResults)
    what2show.split("/").forEach((id) => {
      selectedResults = checkIfObjectContainsId(selectedResults, id)
      if (selectedResults) {
        if (id == selectedId) {
          selectedResults = selectedResults.results
        } else {
          selectedResults = selectedResults.next_nodes
        }
      } else {
        console.log("id " + id + " not found in results")
        return <></>
      }
    })
    console.log("selected results", selectedResults, selectedNode)
    let toReturn = <></>

    let type = selectedNode.data.internal.type
    if (type == "dataset" || type == "clean") {
      toReturn = <DataParamResults selectedResults={selectedResults} />
    } else if (type == "create_model" || type == "compare_models") {
      console.log("create model / compare models")
      toReturn = <ModelsResults selectedResults={selectedResults} />
    }

    return toReturn
  }, [what2show, flowResults])

  /**
   *
   * @param {Object} obj
   * @param {string} id
   * @returns the sub-object corresponding at the id in the obj
   * @description equivalent to obj[id] but the id can be a substring of the key
   */
  const checkIfObjectContainsId = (obj, id) => {
    let res = false
    Object.keys(obj).forEach((key) => {
      if (key.includes(id)) {
        res = obj[key]
      }
    })
    return res
  }

  return (
    <>
      <Col className=" padding-0 results-Panel">
        <Card>
          <Card.Header>
            <h5>Results</h5>
            <Button
              variant="outline closeBtn closeBtn-resultsPane end-5"
              onClick={handleClose}
            >
              <Icon.X width="30px" height="30px" />
            </Button>
          </Card.Header>
          <Card.Body>{body}</Card.Body>
        </Card>
      </Col>
    </>
  )
}

export default ResultsPane
