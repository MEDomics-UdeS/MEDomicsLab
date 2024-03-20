import "reactflow/dist/style.css"
import React, { useContext, useEffect, useState } from "react"
import { PageInfosProvider, PageInfosContext } from "./pageInfosContext"
import { loadJsonPath } from "../../../utilities/fileManagementUtils"
import { ErrorRequestProvider } from "../../flow/context/errorRequestContext"
import ErrorRequestDialog from "../../flow/errorRequestDialog"
import { customZipFile2Object } from "../../../utilities/customZipFile"

const ZipFileExtensions = ["medml", "medimg"]

/**
 *
 * @param {String} pageId Id of the page for multi-tabs support
 * @param {String} configPath Path to the config file
 * @param {ReactNode} children Children of the component
 *
 * @description This component is the base for all the flow pages. It contains the sidebar, the workflow and the backdrop.
 *
 */
const ModulePageWithProvider = ({ children, pageId, configPath = "" }) => {
  // here is the use of the context to update the flowInfos
  const { setupPageInfos } = useContext(PageInfosContext)
  const [config, setConfig] = useState({})

  useEffect(() => {
    if (configPath !== "" && configPath !== undefined && configPath !== null) {
      let config = {}
      let extension = configPath.split(".")[configPath.split(".").length - 1]
      if (ZipFileExtensions.includes(extension)) {
        customZipFile2Object(configPath).then((content) => {
          config = content.metadata
          console.log("loaded config", config)
          console.log("config", config)
          setConfig(config)
        })
      } else {
        config = loadJsonPath(configPath)
        console.log("loaded config", config)
        console.log("config", config)
        setConfig(config)
      }
    }
  }, [configPath])

  // this useEffect is used to update the flowInfos when the pageId or the workflowType changes
  useEffect(() => {
    setupPageInfos({
      id: pageId,
      configPath: configPath,
      config: config,
      setConfig: setConfig
    })
  }, [pageId, config])

  return (
    <>
      <div id={pageId} className="module-page">
        {children}
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
    <ErrorRequestProvider>
      <PageInfosProvider>
        <ModulePageWithProvider {...props} />
      </PageInfosProvider>
    </ErrorRequestProvider>
  )
}
export default ModulePage
