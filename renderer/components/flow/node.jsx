import React, { useState, useEffect, useContext, useRef } from "react"
import { Card } from "primereact/card"
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
import { IoClose } from "react-icons/io5"
import { BsPlay } from "react-icons/bs"
import { Tooltip } from "primereact/tooltip"
import { AiOutlineInfoCircle } from "react-icons/ai"
import { defaultValueFromType } from "../../utilities/learning/inputTypesUtils"
import { deepCopy } from "../../utilities/staticFunctions"
import { Tag } from "primereact/tag"
import { shell } from "electron"
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
const NodeObject = ({ id, data, nodeSpecific, nodeBody, defaultSettings, onClickCustom, isGroupNode }) => {
  const [nodeName, setNodeName] = useState(data.internal.name) // used to store the name of the node
  const { flowInfos, canRun } = useContext(FlowInfosContext) // used to get the flow infos
  const { showResultsPane } = useContext(FlowResultsContext) // used to get the flow results
  const { updateNode, onDeleteNode, runNode } = useContext(FlowFunctionsContext) // used to get the function to update the node
  const op = useRef(null)

  // update warnings when the node is loaded
  useEffect(() => {
    updateHasWarning(data)
  }, [])

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
      toast.warn("Node name cannot be over 15 characters. Only the first 15 characters will be saved.", {
        position: "bottom-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
        toastId: "customId"
      })
    }
    setNodeName(newName)
  }

  return (
    <>
      <div className="node">
        {data.internal.hasWarning.state && (
          <>
            <Tag className="node-warning-tag" icon="pi pi-exclamation-triangle" severity="warning" value="" rounded data-pr-position="left" data-pr-showdelay={200} />
            <Tooltip target=".node-warning-tag">
              <span>{data.internal.hasWarning.tooltip}</span>
            </Tooltip>
          </>
        )}
        {/* here are the handlers (connection points)*/}
        <Handlers id={id} setupParam={data.setupParam} tooltipBy={data.tooltipBy} />
        {/* here is the node (the Card element)*/}
        <Card
          key={id}
          id={id}
          pt={{
            body: { className: `${nodeBody ? "padding-0_2rem-important" : "padding-0-important"}` }
          }}
          onClick={(e) => (onClickCustom ? onClickCustom(e) : op.current.toggle(e))}
          // if the node has run and the results pane is displayed, the node is displayed normally
          // if the node has not run and the results pane is displayed, the node is displayed with a notRun class (see .css file)
          className={`text-left ${data.internal.hasRun && showResultsPane ? "" : showResultsPane ? "notRun" : ""}`}
          header={
            <>
              <div className="align-center">
                <img src={`/icon/${flowInfos.type}/` + `${data.internal.img.replaceAll(" ", "_")}`} alt={data.internal.img} className="icon-nodes" />
                {data.internal.name}
              </div>

              <div className="btn-node-div">
                {/* here are the buttons to delete and run the node*/}
                <IoClose
                  className="btn-close-node"
                  onClick={(e) => {
                    if (!showResultsPane) {
                      e.stopPropagation()
                      onDeleteNode(id)
                    }
                  }}
                  disabled={showResultsPane}
                />

                {/* if the node is a run node (by checking setupParam classes), a button to run the node is displayed*/}
                {data.setupParam.classes.split(" ").includes("run") && (
                  <>
                    <BsPlay
                      className="btn-run-node"
                      onClick={(e) => {
                        if (canRun && !showResultsPane) {
                          e.stopPropagation()
                          runNode(id)
                        }
                      }}
                      disabled={showResultsPane || !canRun}
                    />
                  </>
                )}
              </div>
            </>
          }
        >
          {/* body of the node*/}
          {nodeBody && <>{nodeBody}</>}
        </Card>
      </div>
      {!isGroupNode && (
        <>
          {/* here is an overlay panel that is displayed when the user clicks on the node name. It contains the settings of the node*/}
          <OverlayPanel className="options-overlayPanel" ref={op} onMouseLeave={(e) => op.current.hide(e)}>
            <Stack direction="vertical" gap={1}>
              <div className="header">
                <div className="editable-node-name">
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
                <AiOutlineInfoCircle
                  className="btn-info-node"
                  onClick={() => {
                    shell.openExternal("http://google.com")
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
      )}
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

/**
 *
 * @param {Object} data data of a node
 * @description
 * This function is used to update the hasWarning state of a node.
 * It is called only at the creation of the node.
 */
export const updateHasWarning = (data) => {
  data.internal.hasWarning = { state: false }
  if ("default" in data.setupParam.possibleSettings) {
    Object.entries(data.setupParam.possibleSettings.default).map(([settingName, setting]) => {
      if (settingName in data.internal.settings) {
        let value = deepCopy(data.internal.settings[settingName])
        let defaultVal = deepCopy(defaultValueFromType[setting.type])
        if (typeof data.internal.settings[settingName] === "object") {
          value = JSON.stringify(data.internal.settings[settingName])
          defaultVal = JSON.stringify(defaultValueFromType[setting.type])
        }
        if (value == defaultVal) {
          data.internal.hasWarning = { state: true, tooltip: <p>Please fill all the mandatory fields</p> }
        }
      } else {
        data.internal.hasWarning = { state: true, tooltip: <p>Please fill all the mandatory fields</p> }
      }
    })
  }
}
