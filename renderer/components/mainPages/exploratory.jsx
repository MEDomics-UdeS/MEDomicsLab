import React, { useState } from "react"
import ModulePage from "./moduleBasics/modulePage"
import ListBoxSelector from "./dataComponents/listBoxSelector"
const ExploratoryPage = ({ pageId = "exploratory-12", configPath = null }) => {
  const [selectedDatasets, setSelectedDatasets] = useState([])

  return (
    <>
      <ModulePage pageId={pageId} configPath={configPath}>
        <h1>Exploratory Page</h1>

        <ListBoxSelector selectedDatasets={selectedDatasets} setSelectedDatasets={setSelectedDatasets} />
      </ModulePage>
    </>
  )
}

export default ExploratoryPage
