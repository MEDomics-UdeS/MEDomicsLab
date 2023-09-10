import "reactflow/dist/style.css"
import React, { useContext, useEffect, useState } from "react"
import { PageInfosProvider, PageInfosContext } from "./pageInfosContext"
import { loadJsonPath } from "../../../utilities/fileManagementUtils"

/**
 *
 * @param {String} pageId Id of the page for multi-tabs support
 * @param {String} workflowType type of the workflow (e.g. "learning", "extraction", "optimize") this is used to load the correct sidebar
 * @param {JSX.Element} workflowJSX JSX element of the workflow
 *
 * @description This component is the base for all the flow pages. It contains the sidebar, the workflow and the backdrop.
 *
 */
const ModulePageWithProvider = ({
  children,
  pageId,
  configPath = "",
  tempPath
}) => {
  // here is the use of the context to update the flowInfos
  const { updatePageInfos } = useContext(PageInfosContext)
  const [config, setConfig] = useState({})

  useEffect(() => {
    const config = loadJsonPath(configPath)
    setConfig(config)
  }, [configPath])

  // this useEffect is used to update the flowInfos when the pageId or the workflowType changes
  useEffect(() => {
    updatePageInfos({
      id: pageId,
      configPath: configPath,
      config: config,
      savingPath: tempPath
    })
  }, [pageId, config])

  return <>{children}</>
}

/**
 *
 * @param {*} props all the props of the FlowPageBaseWithFlowInfos component
 * @description This component is composed of the FlowPageBaseWithFlowInfos component and the FlowInfosProvider component.
 * It is also the default export of this file. see components/learning/learningPage.jsx for an example of use.
 */
const ModulePage = (props) => {
  return (
    <PageInfosProvider>
      <ModulePageWithProvider {...props} />
    </PageInfosProvider>
  )
}
export default ModulePage
