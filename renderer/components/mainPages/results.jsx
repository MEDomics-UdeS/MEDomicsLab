import React from "react"
import LearningPage from "./learning"

const ResultsPage = () => {
  return (
    <>
      <div style={{ display: "flex", flexWrap: "wrap" }}>
        <div style={{ width: "50%" }}>
          <LearningPage pageId="1" />
        </div>
        <div style={{ width: "50%" }}>
          {" "}
          <LearningPage pageId="2" />
        </div>
        <div style={{ width: "50%" }}>
          <LearningPage pageId="3" />
        </div>
        <div style={{ width: "50%" }}>
          {" "}
          <LearningPage pageId="4" />
        </div>
      </div>
    </>
  )
}

export default ResultsPage
