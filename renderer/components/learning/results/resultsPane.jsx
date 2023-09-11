import React, { useContext, useState, useEffect, useCallback } from "react"
import Card from "react-bootstrap/Card"
import { Col } from "react-bootstrap"
import { FlowResultsContext } from "../../flow/context/flowResultsContext"
import Button from "react-bootstrap/Button"
import * as Icon from "react-bootstrap-icons"
import { deepCopy } from "../../../utilities/staticFunctions"
import DatasetCleanResults from "./type/datasetCleanResults"

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

  /**
   *
   * @returns {string} A string containing the title of the results pane
   */
  const createTitle = () => {
    let pipeFlowListId = what2show.split("/")
    let title = "Results for pipeline: "
    pipeFlowListId.forEach((id) => {
      title +=
        " --> " +
        flowResults.nodes.find((node) => node.id == id).data.internal.name
    })
    return title
  }

  /**
   *
   * @returns {JSX.Element} A JSX element containing the body of the results pane
   */
  const createBody = useCallback(() => {
    let selectedId = what2show.split("/")[what2show.split("/").length - 1]
    let selectedNode = flowResults.nodes.find((node) => node.id == selectedId)
    console.log("selectedId", selectedId)
    let selectedResults = deepCopy(flowResults.results)
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
      toReturn = <DatasetCleanResults selectedResults={selectedResults} />
    } else if (type == "create_model") {
      console.log("create model")
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
            <h5>{title}</h5>
            <Button
              variant="outline closeBtn-availableNodes end-5"
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
