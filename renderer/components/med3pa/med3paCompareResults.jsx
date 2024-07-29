/* eslint-disable camelcase */
import React from "react"
import ObjectComparison from "./compareResultsComponents/objectComparison"

/**
 *
 * @param {object} file The file data containing objects to be compared.
 * @returns {JSX.Element} A JSX element rendering comparisons for each object in the file.
 *
 * @description
 *  MED3paCompareResults component for displaying comparisons of objects in a file.
 */
const MED3paCompareResults = ({ file }) => {
  if (!file) {
    return <div>No data available for comparison.</div>
  }

  // Check if both profiles_comparaison keys exist
  const { profiles_metrics_comparaison, profiles_detectron_comparaison, ...restOfFile } = file

  // Combine the two profiles into one if both exist
  const combinedProfiles =
    profiles_metrics_comparaison && profiles_detectron_comparaison
      ? {
          profiles_comparaison: {
            profiles_metrics_comparaison,
            profiles_detectron_comparaison
          }
        }
      : {}

  // Conditionally process file only if both profiles exist
  const processedFile = Object.keys(combinedProfiles).length > 0 ? { ...restOfFile, ...combinedProfiles } : file

  return (
    <div style={{ padding: "20px" }}>
      {Object.keys(processedFile).map((key, index) => (
        <div className="row" style={{ overflowY: "hidden" }} key={index}>
          <ObjectComparison loadedFile={processedFile[key]} type={key} />
        </div>
      ))}
    </div>
  )
}

export default MED3paCompareResults
