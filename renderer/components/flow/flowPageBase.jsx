import "reactflow/dist/style.css"
import React, { useContext, useEffect, useRef } from "react"
import SidebarAvailableNodes from "./sidebarAvailableNodes"
import { ReactFlowProvider } from "reactflow"
import { OffCanvasBackdropStyleProvider } from "./context/offCanvasBackdropStyleContext"
import Backdrop from "./backdrop"
import { FlowInfosProvider, FlowInfosContext } from "./context/flowInfosContext"
import {
  FlowResultsContext,
  FlowResultsProvider
} from "./context/flowResultsContext"
import { FlowFunctionsProvider } from "./context/flowFunctionsContext"
import { PageInfosContext } from "../mainPages/moduleBasics/pageInfosContext"
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels"
import ResultsPane from "../learning/results/resultsPane"

/**
 *
 * @param {String} pageId Id of the page for multi-tabs support
 * @param {String} workflowType type of the workflow (e.g. "learning", "extraction", "optimize") this is used to load the correct sidebar
 * @param {JSX.Element} workflowJSX JSX element of the workflow
 *
 * @description This component is the base for all the flow pages. It contains the sidebar, the workflow and the backdrop.
 *
 */
const FlowPageBaseWithFlowInfos = ({ children, workflowType }) => {
  // here is the use of the context to update the flowInfos
  const { updateFlowInfos, showAvailableNodes } = useContext(FlowInfosContext)
  const { showResultsPane, setShowResultsPane } = useContext(FlowResultsContext)
  const { pageInfos } = useContext(PageInfosContext)
  const sidebarPanelRef = useRef(null)
  const resultsPanelRef = useRef(null)

  // this useEffect is used to update the flowInfos when the pageId or the workflowType changes
  useEffect(() => {
    updateFlowInfos({
      type: workflowType
    })
  }, [workflowType])

  // useeffect to collapse the sidebar when showAvailableNodes is false and expand it when it is true
  useEffect(() => {
    if (sidebarPanelRef.current) {
      if (showAvailableNodes) {
        document.getElementById("data-panel-id-sidebar").style.minWidth =
          "210px"
        sidebarPanelRef.current.expand()
      } else {
        document.getElementById("data-panel-id-sidebar").style.minWidth = "0px"
        sidebarPanelRef.current.collapse()
      }
    }
  }, [showAvailableNodes])

  useEffect(() => {
    console.log("showResultsPane", showResultsPane)
    if (resultsPanelRef.current) {
      if (showResultsPane) {
        resultsPanelRef.current.expand()
      } else {
        resultsPanelRef.current.collapse()
      }
    }
  }, [showResultsPane])

  return (
    <>
      {/* here we use the context to provide the style for the backdrop */}
      <OffCanvasBackdropStyleProvider>
        <PanelGroup
          className="width-100 height-100 "
          style={{ overflow: "hidden" }}
          direction="horizontal"
        >
          <Panel
            ref={sidebarPanelRef}
            id="sidebar"
            minSize={17.5}
            maxSize={17.5}
            defaultSize={0}
            order={1}
            collapsible={true}
            collapsibleSize={5}
            className="smooth-transition"
          >
            <SidebarAvailableNodes
              title="Available Nodes"
              sidebarType={workflowType}
            />
          </Panel>
          <PanelResizeHandle />
          <Panel minSize={25} order={2}>
            <PanelGroup
              className="width-100 height-100 panel-group"
              style={{ overflow: "hidden" }}
              direction="vertical"
            >
              <Panel order={1}>
                <ReactFlowProvider>{children}</ReactFlowProvider>
              </Panel>
              <PanelResizeHandle
                className="resize-handle-results"
                onFocusOut={() => {
                  console.log("onFocusOut")
                }}
              />
              <Panel
                ref={resultsPanelRef}
                id="results"
                maxSize={75}
                minSize={30}
                defaultSize={0}
                order={2}
                collapsible={true}
                collapsibleSize={50}
                onResize={(size) => {
                  size > 5
                    ? setShowResultsPane(true)
                    : setShowResultsPane(false)
                }}
              >
                <ResultsPane />
              </Panel>
            </PanelGroup>
          </Panel>
          <Backdrop pageId={pageInfos.id} />
        </PanelGroup>
      </OffCanvasBackdropStyleProvider>
    </>
  )
}

/**
 *
 * @param {*} props all the props of the FlowPageBaseWithFlowInfos component
 * @description This component is composed of the FlowPageBaseWithFlowInfos component and the FlowInfosProvider component.
 * It is also the default export of this file. see components/learning/learningPage.jsx for an example of use.
 */
const FlowPageBase = (props) => {
  return (
    <FlowResultsProvider>
      <FlowInfosProvider>
        <FlowFunctionsProvider>
          <FlowPageBaseWithFlowInfos {...props} />
        </FlowFunctionsProvider>
      </FlowInfosProvider>
    </FlowResultsProvider>
  )
}
export default FlowPageBase
