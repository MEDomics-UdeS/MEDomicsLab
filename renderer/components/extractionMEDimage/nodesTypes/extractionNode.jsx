/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useContext } from "react"
import { Offcanvas, Container, Alert } from "react-bootstrap"
import TreeMenu from "react-simple-tree-menu"
import { FlowInfosContext } from "../../flow/context/flowInfosContext"
import GroupNode from "../../flow/groupNode"

/**
 * @param {string} id id of the node
 * @param {object} data data of the node
 * @returns {JSX.Element} A extractionNode node
 *
 * @description
 * This component is used to display a extractionNode node.
 * It uses the GroupNode structure in /flow to display the node that contains a subflow.
 */
const ExtractionNode = ({ id, data }) => {
  const [showOffCanvas, setShowOffCanvas] = useState(false) // used to display the offcanvas
  const handleOffCanvasClose = () => setShowOffCanvas(false) // used to close the offcanvas
  const handleOffCanvasShow = () => setShowOffCanvas(true) // used to show the offcanvas

  const [offcanvasComp, setOffcanvasComp] = useState(null) // used to store the offcanvas container
  const { flowInfos } = useContext(FlowInfosContext) // used to get the flow infos

  /**
   * @description
   * This function is used to set the offcanvas container.
   * It is called when the node is created.
   * This is necessary because the offcanvas is not a child of the node, but it is controlled by the node.
   * This is done for styling purposes (having the backdrop over the entire workflow).
   */
  useEffect(() => {
    setOffcanvasComp(document.getElementById(flowInfos.id))
  }, [flowInfos])

  /**
   * @description
   * This function is used to display the offcanvas.
   * It is called when the user clicks on the node.
   * by changing the z-index of the offcanvas, it appears over/under the workflow.
   */
  useEffect(() => {
    let style = {}
    if (showOffCanvas) {
      style = { transition: "none", zIndex: "2" }
    } else {
      style = { transition: "z-index 0.5s ease-in", zIndex: "-1" }
    }
  }, [showOffCanvas])

  /**
   * @param {Object} data results of the extraction node in the form of a dictionary
   * @returns {Object} nodes of the tree menu
   *
   * @description
   * This function is used to convert the results of the extraction node into nodes that can
   * can be used in a tree menu.
   */
  const convertDataToNodes = (data) => {
    const nodes = []
    Object.keys(data).forEach((key) => {
      if (key !== "contextChecked"){
        const node = { key, label: key }
        const value = data[key]
        if (typeof value === "object" && value !== null) {
          node.nodes = convertDataToNodes(value)
        } else {
          // Add the value to the node if it is not an object
          node.label = `${key} : ${value}`
        }
        nodes.push(node)
      }
    })
    return nodes
  }

  /**
   * @returns {JSX.Element} A tree menu or a warning message
   *
   * @description
   * This function is used to render the tree menu of the extraction node.
   */
  const renderTree = () => {
    // Check if data.internal.settings.results is available
    if (data.internal.results && Object.keys(data.internal.results).length > 1) {
      const nodes = convertDataToNodes(data.internal.results)

      return (
        <div className="tree-menu-container">
          <TreeMenu
            data={nodes}
            debounceTime={125}
            hasSearch={false}
            className="results"
          />
        </div>
      )
    } else {
      // Show the warning message if data.internal.settings.results is undefined or empty
      return (
        <Alert variant="danger" className="warning-message">
          <b>No results available</b>
        </Alert>
      )
    }
  }

  return (
    <>
      <button
        className="small-results-button"
        onClick={handleOffCanvasShow}
      >
        Show Results
      </button>
      <GroupNode
        id={showOffCanvas ? "MAIN" : id}
        data={data}
        nodeBody={
          <>
            {/* offcanvas of the node (panel coming from right when a node is clicked )*/}
            <Container>
              <Offcanvas
                show={showOffCanvas}
                onHide={handleOffCanvasClose}
                placement="end"
                scroll
                backdrop
                container={offcanvasComp}
              >
                <Offcanvas.Header closeButton>
                  <Offcanvas.Title>Extraction results</Offcanvas.Title>
                </Offcanvas.Header>
                <Offcanvas.Body>{renderTree()}</Offcanvas.Body>
              </Offcanvas>
            </Container>
          </>
        }
      ></GroupNode>
    </>
  )
}
export default ExtractionNode
