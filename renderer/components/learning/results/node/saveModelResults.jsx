import React from "react"
import { toast } from "react-toastify"
import { Tooltip } from "primereact/tooltip"

/**
 *
 * @param {Object} selectedResults The selected results
 * @returns {JSX.Element} The AnalyseResults component
 */
const SaveModelResults = ({ selectedResults }) => {
  return (
    <div className="height-100 width-100 list-model-download-container">
      {Object.entries(selectedResults.data).map(([modelName, path]) => {
        return (
          <div
            key={modelName}
            className="link"
            onClick={() => {
              navigator.clipboard.writeText(path)
              toast.success("Path copied to clipboard")
            }}
          >
            <h5 className="text">{modelName}</h5>
            <p className="tooltip-id">{path}</p>
            <Tooltip target=".tooltip-id" showDelay={500} position="top">
              <h6>
                Press <strong>SHIFT + MOUSE SCROLL</strong> to see the complete path{" "}
              </h6>
            </Tooltip>
          </div>
        )
      })}
    </div>
  )
}

export default SaveModelResults
