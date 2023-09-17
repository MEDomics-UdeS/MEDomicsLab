import React, { useContext, useState, useEffect, useCallback } from "react"
import Card from "react-bootstrap/Card"
import { Col } from "react-bootstrap"
import { FlowResultsContext } from "../../flow/context/flowResultsContext"
import { FlowInfosContext } from "../../flow/context/flowInfosContext"
import Button from "react-bootstrap/Button"
import * as Icon from "react-bootstrap-icons"
import PipelinesResults from "./pipelinesResults"
import { RadioButton } from "primereact/radiobutton"

/**
 *
 * @returns {JSX.Element} A results pane accessed by using the menu tree
 *
 * @description
 * This component is used to display the results of the pipeline according to the selected nodes.
 *
 */
const ResultsPane = () => {
  const { setShowResultsPane, flowResults } = useContext(FlowResultsContext)
  const { flowContent } = useContext(FlowInfosContext)
  const [selectedPipelines, setSelectedPipelines] = useState([])
  const [selectionMode, setSelectionMode] = useState("Compare Mode")

  const handleClose = () => setShowResultsPane(false)

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
            <div className="flex justify-content-center">
              <div className="gap-3 results-header">
                <div className="flex align-items-center">
                  <h5>Results</h5>
                </div>
                {selectedPipelines.length > 1 && (
                  <>
                    <div className="flex align-items-center">
                      <RadioButton
                        inputId="compareMode"
                        name="selectionModeGroup"
                        value="Compare Mode"
                        onChange={(e) => setSelectionMode(e.value)}
                        checked={selectionMode == "Compare Mode"}
                      />
                      <label htmlFor="compareMode" className="ml-2">
                        Compare Mode
                      </label>
                    </div>
                    <div className="flex align-items-center">
                      <RadioButton
                        inputId="singleSelection"
                        name="pizza"
                        value="Single Selection"
                        onChange={(e) => setSelectionMode(e.value)}
                        checked={selectionMode == "Single Selection"}
                      />
                      <label htmlFor="singleSelection" className="ml-2">
                        Single Selection
                      </label>
                    </div>
                  </>
                )}
              </div>
            </div>
            <Button
              variant="outline closeBtn closeBtn-resultsPane end-5"
              onClick={handleClose}
            >
              <Icon.X width="30px" height="30px" />
            </Button>
          </Card.Header>
          <Card.Body>
            <PipelinesResults
              pipelines={selectedPipelines}
              selectionMode={selectionMode}
            />
          </Card.Body>
        </Card>
      </Col>
    </>
  )
}

export default ResultsPane