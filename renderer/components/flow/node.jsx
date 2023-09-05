import React, { useState, useEffect, useContext } from "react"
import { Button, Container } from "react-bootstrap"
import CloseButton from "react-bootstrap/CloseButton"
import Card from "react-bootstrap/Card"
import Offcanvas from "react-bootstrap/Offcanvas"
import { toast } from "react-toastify" // https://www.npmjs.com/package/react-toastify
import EditableLabel from "react-simple-editlabel"
import Handlers from "./handlers"
import { OffCanvasBackdropStyleContext } from "./context/offCanvasBackdropStyleContext"
import { FlowInfosContext } from "./context/flowInfosContext"
import { FlowFunctionsContext } from "./context/flowFunctionsContext"
import { PageInfosContext } from "../mainPages/moduleBasics/pageInfosContext"

/**
 *
 * @param {string} id used to identify the node
 * @param {object} data contains the data of the node.
 * @param {JSX.Element} nodeSpecific jsx element to display specific settings of the node inside the offcanvas
 * @param {JSX.Element} nodeBody jsx element to display the body of the node
 * @param {JSX.Element} defaultSettings jsx element to display default settings of the node inside the offcanvas
 *
 * @returns {JSX.Element} A node
 *
 * @description
 * This component is used to display a node.
 *
 * Note: all JSX.Element props are not mandatory
 * Note: see Powerpoint for additionnal
 */
const Node = ({ id, data, nodeSpecific, nodeBody, defaultSettings }) => {
  const [showOffCanvas, setShowOffCanvas] = useState(false) // used to display the offcanvas
  const handleOffCanvasClose = () => setShowOffCanvas(false) // used to close the offcanvas
  const handleOffCanvasShow = () => setShowOffCanvas(true) // used to show the offcanvas
  const [nodeName, setNodeName] = useState(data.internal.name) // used to store the name of the node
  const [offcanvasComp, setOffcanvasComp] = useState(null) // used to store the offcanvas container
  const { updateBackdropStyle } = useContext(OffCanvasBackdropStyleContext) // used to update the backdrop style
  const { flowInfos } = useContext(FlowInfosContext) // used to get the flow infos
  const { pageInfos } = useContext(PageInfosContext) // used to get the page infos
  const { updateNode, onDeleteNode, runNode } = useContext(FlowFunctionsContext) // used to get the function to update the node

  /**
   * @description
   * This function is used to update the internal data of the node.
   * It is called when the user changes the name of the node.
   * It calls the parent function wich is defined in the workflow component
   */
  useEffect(() => {
    data.internal.name = nodeName
    updateNode({
      id: id,
      updatedData: data.internal
    })
  }, [nodeName])

  /**
   * @description
   * This function is used to set the offcanvas container.
   * It is called when the node is created.
   * This is necessary because the offcanvas is not a child of the node, but it is controlled by the node.
   * This is done for styling purposes (having the backdrop over the entire workflow).
   */
  useEffect(() => {
    setOffcanvasComp(document.getElementById(pageInfos.id))
  }, [pageInfos])

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
    updateBackdropStyle(style)
  }, [showOffCanvas])

  /**
   *
   * @param {*} value new value of the node name
   * @description
   * This function is called when the user changes the name of the node (focus out of the input).
   * It checks if the name is over 15 characters and if it is, it displays a warning message.
   * It then updates the name of the node by calling setNodeName wich will call the corresponding useEffect above.
   */
  const newNameHasBeenWritten = (value) => {
    let newName = value
    if (value.length > 15) {
      newName = value.substring(0, 15)
      toast.warn(
        "Node name cannot be over 15 characters. Only the first 15 characters will be saved.",
        {
          position: "bottom-right",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
          toastId: "customId"
        }
      )
    }
    setNodeName(newName)
  }

  return (
    <>
      <div>
        {/* here are the handlers (connection points)*/}
        <Handlers
          id={id}
          setupParam={data.setupParam}
          tooltipBy={data.tooltipBy}
        />
        {/* here is the node (the Card element)*/}
        <Card key={id} id={id} className="text-left node">
          {/* header of the node (name of the node)*/}
          <Card.Header onClick={handleOffCanvasShow}>
            <img
              src={
                `/icon/${flowInfos.type}/` +
                `${data.internal.img.replaceAll(" ", "_")}`
              }
              alt={data.internal.img}
              className="icon-nodes"
            />
            {data.internal.name}
          </Card.Header>
          {/* body of the node*/}
          {nodeBody != undefined && <Card.Body>{nodeBody}</Card.Body>}
        </Card>
      </div>
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
            <Offcanvas.Title>
              <EditableLabel
                text={data.internal.name}
                labelClassName="node-editableLabel"
                inputClassName="node-editableLabel"
                inputWidth="20ch"
                inputHeight="25px"
                labelFontWeight="bold"
                inputFontWeight="bold"
                onFocusOut={(value) => {
                  newNameHasBeenWritten(value)
                }}
              />
            </Offcanvas.Title>
          </Offcanvas.Header>
          <Offcanvas.Body>
            <hr className="solid" />
            {/* here are the default settings of the node. if nothing is specified, nothing is displayed*/}
            {defaultSettings}
            {/* here are the node specific settings. if nothing is specified, nothing is displayed*/}
            {nodeSpecific}
          </Offcanvas.Body>
        </Offcanvas>
      </Container>
      {/* here are the buttons to delete and run the node*/}
      <CloseButton onClick={() => onDeleteNode(id)} />

      {/* if the node is a run node (by checking setupParam classes), a button to run the node is displayed*/}
      {data.setupParam.classes.split(" ").includes("run") && (
        <Button
          variant="success"
          className="btn-runNode"
          onClick={() => runNode(id)}
        >
          <img src={"/icon/run.svg"} alt="run" className="img-fluid" />
        </Button>
      )}
    </>
  )
}

export default Node
