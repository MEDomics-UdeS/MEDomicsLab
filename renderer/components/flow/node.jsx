import React, { useState, useEffect, useContext, useRef } from "react"
import { Button } from "react-bootstrap"
import CloseButton from "react-bootstrap/CloseButton"
import Card from "react-bootstrap/Card"
import { toast } from "react-toastify" // https://www.npmjs.com/package/react-toastify
import EditableLabel from "react-simple-editlabel"
import Handlers from "./handlers"
import { FlowInfosContext } from "./context/flowInfosContext"
import { FlowFunctionsContext } from "./context/flowFunctionsContext"
import { FlowResultsContext } from "./context/flowResultsContext"
import * as Icon from "react-bootstrap-icons"
import NodeWrapperResults from "./nodeWrapperResults"
import { OverlayPanel } from "primereact/overlaypanel"
import { Stack } from "react-bootstrap"
// keep this import for the code editor (to be implemented)
// import dynamic from "next/dynamic"
// const CodeEditor = dynamic(() => import("./codeEditor"), {
//   ssr: false
// })

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
const NodeObject = ({ id, data, nodeSpecific, nodeBody, defaultSettings }) => {
  const [nodeName, setNodeName] = useState(data.internal.name) // used to store the name of the node
  const { flowInfos } = useContext(FlowInfosContext) // used to get the flow infos
  const { showResultsPane } = useContext(FlowResultsContext) // used to get the flow results
  const { updateNode, onDeleteNode, runNode } = useContext(FlowFunctionsContext) // used to get the function to update the node
  const op = useRef(null)

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
        <Card
          key={id}
          id={id}
          // if the node has run and the results pane is displayed, the node is displayed normally
          // if the node has not run and the results pane is displayed, the node is displayed with a notRun class (see .css file)
          className={`text-left node ${
            data.internal.hasRun && showResultsPane
              ? ""
              : showResultsPane
              ? "notRun"
              : ""
          }`}
        >
          {/* header of the node (name of the node)*/}
          <Card.Header onClick={(e) => op.current.toggle(e)}>
            <img
              src={
                `/icon/${flowInfos.type}/` +
                `${data.internal.img.replaceAll(" ", "_")}`
              }
              alt={data.internal.img}
              className="icon-nodes"
            />
            {/* here are the buttons to delete and run the node*/}
            <CloseButton
              onClick={() => onDeleteNode(id)}
              disabled={showResultsPane}
            />

            {/* if the node is a run node (by checking setupParam classes), a button to run the node is displayed*/}
            {data.setupParam.classes.split(" ").includes("run") && (
              <>
                <Button
                  variant="success"
                  className="btn-runNode"
                  onClick={() => runNode(id)}
                  disabled={showResultsPane}
                >
                  <img src={"/icon/run.svg"} alt="run" className="img-fluid" />
                </Button>
              </>
            )}
            {data.internal.name}
          </Card.Header>
          {/* body of the node*/}
          {nodeBody != undefined && <Card.Body>{nodeBody}</Card.Body>}
        </Card>
      </div>
      {/* here is an overlay panel that is displayed when the user clicks on the node name. It contains the settings of the node*/}
      <OverlayPanel className="options-overlayPanel" ref={op}>
        <Stack direction="vertical" gap={1}>
          <div className="header">
            <Icon.Pencil width="18px" height="18px" />
            <EditableLabel
              text={data.internal.name}
              labelClassName="node-editableLabel"
              inputClassName="node-editableLabel"
              inputWidth="20ch"
              inputHeight="1.5rem"
              labelFontWeight="bold"
              inputFontWeight="bold"
              onFocusOut={(value) => {
                newNameHasBeenWritten(value)
              }}
            />
          </div>
          <hr className="solid" />
          {/* here are the default settings of the node. if nothing is specified, nothing is displayed*/}
          {defaultSettings}
          {/* here are the node specific settings. if nothing is specified, nothing is displayed*/}
          {nodeSpecific}

          {/* note : quand on va implémenter codeeditor */}
          {/* <CodeEditor data={data} /> */}
        </Stack>
      </OverlayPanel>
    </>
  )
}

/**
 *
 * @param {Object} props all the props of the Node component
 * @returns {JSX.Element} A node
 *
 * @description
 * This component is used to display a node.
 * It is a wrapper of the NodeObject for implementation of results related features.
 */
const Node = (props) => {
  return (
    <>
      <NodeWrapperResults {...props}>
        <NodeObject {...props} />
      </NodeWrapperResults>
    </>
  )
}

export default Node
