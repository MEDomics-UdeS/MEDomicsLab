import React, { useContext, useEffect, useState } from "react"
import { getCollectionData } from "../dbComponents/utils"
import { MEDDataObject } from "../workspace/NewMedDataObject"
import { DataContext } from "../workspace/dataContext"
import ModulePage from "./moduleBasics/modulePage"

/**
 *
 * @returns a page that shows the model informations
 */
const ModelViewer = ({ id }) => {
  //const { config, configPath } = useContext(PageInfosContext)
  const [data, setData] = useState(null)
  const { globalData } = useContext(DataContext)

  useEffect(() => {
    const getData = async () => {
      let metadataFileID = MEDDataObject.getChildIDWithName(globalData, id, "metadata.json")
      let localData = await getCollectionData(metadataFileID)
      setData(localData[0])
    }
    getData()
  }, [id])

  return (
    <>
      {data && (
        <>
          <h1>Model informations : {<strong>{id && globalData[id].name}</strong>}</h1>
          <h3>Required columns</h3>
          <ul>
            {data.columns.map((col, i) => (
              <li key={i}>{col}</li>
            ))}
          </ul>
          <h3>Model target</h3>
          <p>{data.target}</p>
          <h3>Preprocess steps</h3>
          <ol>
            {data.steps?.map((step, i) => (
              <li key={i}>{step.type}</li>
            ))}
          </ol>
          <h3>Machine learning type</h3>
          <p>{data.ml_type}</p>
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
        <ModelViewer id={pageId} />
      </ModulePage>
    </>
  )
}

export default ModelViewerWithContext
