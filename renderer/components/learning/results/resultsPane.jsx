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
import PipelinesResults from "./pipelinesResults"
import { Accordion, AccordionTab } from "primereact/accordion"

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
  const [selectedPipelines, setSelectedPipelines] = useState([])

  const [body, setBody] = useState(<></>)
  const [title, setTitle] = useState("")

  const handleClose = () => setShowResultsPane(false)

  // callback function to update title and body when what2show changes
  useEffect(() => {
    // console.log("results update", what2show, flowResults)
    // if (what2show == "" || Object.keys(flowResults).length == 0) {
    //   setTitle("Results")
    //   setBody(PipelineResult
    //     <>
    //       <div style={{ textAlign: "center" }}>
    //         <h6>Nothing is selected or results are not generated yet </h6>
    //       </div>
    //     </>
    //   )
    // } else {
    //   setTitle(createTitle())
    //   setBody(createBody())
    // }
  }, [what2show, flowResults])

  useEffect(() => {
    console.log("results update - flowContent", flowContent, flowResults)
    if (flowContent.nodes) {
      // find selected ids
      let selectedIds = []
      flowContent.nodes.forEach((node) => {
        if (node.data.internal.results.checked) {
          selectedIds.push(node.id)
        }
      })
      console.log("selectedIds", selectedIds)

      // find all pipelines
      let pipelines = findAllPaths(flowContent)
      console.log("pipelines", pipelines)

      // find pipelines that includes all the selected ids
      let selectedPipelines = []
      pipelines.forEach((pipeline) => {
        let found = true
        selectedIds.forEach((id) => {
          if (!pipeline.includes(id)) {
            found = false
          }
        })
        if (found) {
          selectedPipelines.push(pipeline)
        }
      })
      console.log("selectedPipelines", selectedPipelines)
      setSelectedPipelines(selectedPipelines)
    }
  }, [flowContent, flowResults])

  useEffect(() => {
    console.log("selectedPipelines", selectedPipelines)
  }, [selectedPipelines])

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

    console.log("graph", graph)

    function explore(node, path) {
      if (!graph[node]) {
        // If there are no outgoing links from this node, add the path to the result
        result.push(path)
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

    // Start exploring from all nodes that start with "0"
    Object.keys(graph).forEach((id) => {
      let sourceNode = flowContent.nodes.find((node) => node.id == id)
      if (sourceNode.data.internal.type == "dataset") {
        explore(id, [id])
      }
    })

    return result
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
          <Card.Body>
            <PipelinesResults pipelines={selectedPipelines} />
          </Card.Body>
        </Card>
      </Col>
    </>
  )
}

export default ResultsPane
