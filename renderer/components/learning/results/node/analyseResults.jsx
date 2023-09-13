import React, { useEffect, useState } from "react"

const AnalyseResults = ({ selectedResults }) => {
  const [nodeSelection, setNodeSelection] = useState(null)

  useEffect(() => {
    console.log("selectedResults", selectedResults)
    if (selectedResults) {
      setNodeSelection(selectedResults)
    }
  }, [selectedResults])

  return (
    <div>
      <h1>Analyse Results</h1>
    </div>
  )
}

export default AnalyseResults
