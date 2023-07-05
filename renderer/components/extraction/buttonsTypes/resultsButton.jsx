import React from "react";
import Button from "react-bootstrap/Button";

const ResultsButton = ({ results }) => {
  return (
    <>{results && <Button className="results-button">Show Results</Button>}</>
  );
};

export default ResultsButton;
