import React, { useContext, useEffect } from "react"
import ModulePage from "./moduleBasics/modulePage"
import { PageInfosContext } from "./moduleBasics/pageInfosContext"
import Path from "path"

/**
 *
 * @returns a page that shows the model informations
 */
const ModelViewer = () => {
  const { config, configPath } = useContext(PageInfosContext)
  useEffect(() => {
    console.log("model config", config)
  }, [config])

  return (
    <>
      {config && (
        <>
          <h1>
            Model informations : <strong>{configPath && Path.basename(configPath)}</strong>
          </h1>
          <h3>Required columns</h3>
          <ul>
            {config.columns.map((col, i) => (
              <li key={i}>{col}</li>
            ))}
          </ul>
          <h3>Model target</h3>
          <p>{config.target}</p>
          <h3>Preprocess steps</h3>
          <ol>
            {config.steps.map((step, i) => (
              <li key={i}>{step.type}</li>
            ))}
          </ol>
          <h3>Machine learning type</h3>
          <p>{config.ml_type}</p>
        </>
      )}
    </>
  )
}

/**
 * @param {String} pageId Id of the page for multi-tabs support
 * @param {String} configPath Path to the config file
 *
 * @description This component is the base for all the flow pages. It contains the sidebar, the workflow and the backdrop.
 */
const ModelViewerWithContext = ({ pageId, configPath = null }) => {
  return (
    <>
      <ModulePage pageId={pageId} configPath={configPath} shadow>
        <ModelViewer />
      </ModulePage>
    </>
  )
}

export default ModelViewerWithContext
