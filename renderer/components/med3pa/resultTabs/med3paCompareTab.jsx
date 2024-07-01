// med3paCompareTab.jsx

import React, { useEffect } from "react"

const MED3paCompareTab = ({ loadedReferenceFiles, loadedTestFiles }) => {
  useEffect(() => {
    console.log("loadedReferenceFiles", loadedReferenceFiles, loadedTestFiles)
  }, [loadedReferenceFiles, loadedTestFiles])
  return (
    <div style={{ padding: "20px" }}>
      <h3>Compare Sets Results</h3>
      <p>Not implemented yet.</p>
    </div>
  )
}

export default MED3paCompareTab
