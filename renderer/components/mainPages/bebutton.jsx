import React from "react"
import Card from "react-bootstrap/Card";
import { Button } from "react-bootstrap";

const BatchExtractorButton = ({ reload, setReload }) => {

    const handleClick = () => {
        setReload(!reload);
    };

  return (
    <>
        
            <Button className="box-button" onClick={handleClick}>
            BatchExtractor
            </Button>
         
    </>
  )
}

export default BatchExtractorButton