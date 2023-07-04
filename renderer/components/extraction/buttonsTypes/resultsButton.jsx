import React from "react";
import Button from "react-bootstrap/Button";

const ResultsButton = ({ results }) => {
  return (
    <>
      {results && (
        <Button variant="success" className="results-button">
          Show Results
        </Button>
      )}
    </>
  );
};

export default ResultsButton;
