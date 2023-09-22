import React from "react"
import DatasetSelector from "./dataComponents/datasetSelector"
import ModulePage from "./moduleBasics/modulePage"
/**
 * @description - This component is the input page of the application
 * @returns the input page component
 */
const InputPage = ({ pageId = "42" }) => {
  // eslint-disable-next-line no-unused-vars
  const [data, setData] = React.useState([])
  return (
    <>
      <ModulePage pageId={pageId}>
        <h1>INPUT MODULE</h1>
        <DatasetSelector multiSelect={true} />
      </ModulePage>
    </>
  )
}

export default InputPage
