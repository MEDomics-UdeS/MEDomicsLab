import React from "react"
import Button from "react-bootstrap/Button"

const ResultsButton = ({ results }) => {
  const showResults = () => {
    console.log("show results")
  }

  return (
    <>
      {results && (
        <Button className="results-button" onClick={showResults}>
          Show Results
        </Button>
      )}
    </>
  )
}

export default ResultsButton
