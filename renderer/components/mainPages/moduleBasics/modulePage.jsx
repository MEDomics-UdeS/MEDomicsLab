import "reactflow/dist/style.css"
import React, { useCallback, useContext, useEffect, useState } from "react"
import { PageInfosProvider, PageInfosContext } from "./pageInfosContext"
import { loadJsonPath } from "../../../utilities/fileManagementUtils"
import { ErrorRequestProvider } from "../../generalPurpose/errorRequestContext"
import ErrorRequestDialog from "../../flow/errorRequestDialog"
import { customZipFile2Object } from "../../../utilities/customZipFile"
import { LoaderProvider, LoaderContext } from "../../generalPurpose/loaderContext"
import ReactLoading from "react-loading"
import { DataContext } from "../../workspace/dataContext"

/**
 *
 * @param {String} pageId Id of the page for multi-tabs support
 * @param {String} configPath Path to the config file
 * @param {ReactNode} children Children of the component
 *
 * @description This component is the base for all the flow pages. It contains the sidebar, the workflow and the backdrop.
 *
 */
const ModulePageWithProvider = ({ children, pageId, configPath = "null", shadow = false, additionnalClassName = "", scrollable = true }) => {
  // here is the use of the context to update the flowInfos
  const { setPageId, setConfigPath, config } = useContext(PageInfosContext)
  const { loader } = useContext(LoaderContext)
  const { globalData, setGlobalData } = useContext(DataContext)
  // this useEffect is used to update the flowInfos when the pageId or the workflowType changes
  useEffect(() => {
    setPageId(pageId)
    setConfigPath(configPath)
  }, [pageId, configPath])

  // useEffect(() => {
  //   if (config && Object.keys(config).length > 0) {
  //     updateConfig(config)
  //   }
  // }, [config])

  // const updateConfig = useCallback(
  //   (config) => {
  //     if (globalData[pageId]) {
  //       let newGlobalData = { ...globalData }
  //       newGlobalData[pageId] = config
  //       setGlobalData(newGlobalData)
  //     }
  //   },
  //   [globalData, setGlobalData, pageId]
  // )

  return (
    <>
      <div id={pageId} className={`module-page ${shadow ? "with-shadow" : ""} ${additionnalClassName}`}>
        {loader && (
          <>
            <div className="module-loading">
              <ReactLoading className="loader" type={"spin"} color={"#00000090"} height={200} width={200} />
            </div>
          </>
        )}

        <div className={`width-100 height-100 module-page-subdiv`} style={scrollable ? { overflow: "auto" } : {}}>
          {children}
        </div>
      </div>

      <ErrorRequestDialog />
    </>
  )
}

/**
 *
 * @param {String} pageId Id of the page for multi-tabs support
 * @param {String} configPath Path to the config file
 * @param {ReactNode} children Children of the component
 *
 * @description This component is composed of the FlowPageBaseWithFlowInfos component and the FlowInfosProvider component.
 * It is also the default export of this file. see components/learning/learningPage.jsx for an example of use.
 */
const ModulePage = (props) => {
  return (
    <LoaderProvider>
      <ErrorRequestProvider>
        <PageInfosProvider>
          <ModulePageWithProvider {...props} />
        </PageInfosProvider>
      </ErrorRequestProvider>
    </LoaderProvider>
  )
}
export default ModulePage
