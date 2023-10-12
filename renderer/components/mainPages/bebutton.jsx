import React from "react"
import Card from "react-bootstrap/Card";
import { Button } from "react-bootstrap";

const BatchExtractorButton = ({ reload, setReload }) => {

    const handleClick = () => {
        setReload(!reload);
    };

  return (
    <>
        <div>
        {/*BatchExtractor*/}
        <Card className="box-button-card">
          <Card.Body>
            <Button className="box-button" onClick={handleClick}>
            BatchExtractor
            </Button>
          </Card.Body>
        </Card>
        </div>
    </>
  )
}

export default BatchExtractorButton