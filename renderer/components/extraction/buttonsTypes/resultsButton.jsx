import React from "react"
import Button from "react-bootstrap/Button"

/**
 * @param {Object} A dictionary containing the results
 * @returns {JSX.Element} A ResultsButton node
 *
 * @description
 * This component is used to display the ResultsButton.
 * The state of the button is determined by the results property.
 */
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
