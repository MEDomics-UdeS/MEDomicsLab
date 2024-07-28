import React from "react"
import ObjectComparison from "./compareResultsComponents/objectComparison"

/**
 *
 * @param {object} file The file data containing objects to be compared.
 * @returns {JSX.Element} A JSX element rendering comparisons for each object in the file.
 *
 *
 * @description
 *  MED3paCompareResults component for displaying comparisons of objects in a file.
 */
const MED3paCompareResults = ({ file }) => {
  if (!file) {
    return <div>No data available for comparison.</div>
  }

  return (
    <div className="container">
      {Object.keys(file).map((key, index) => (
        <div className="row" style={{ overflowY: "hidden" }} key={index}>
          <ObjectComparison loadedFile={file[key]} type={key} />
        </div>
      ))}
    </div>
  )
}

export default MED3paCompareResults
