import React, {useState, useEffect} from "react"
import Card from "react-bootstrap/Card";
import { Button, Container } from "react-bootstrap";

const DataManagerButton = ({ reload, setReload }) => {

    const handleClick = () => {
        setReload(!reload);
    };

  return (
    <>
        {/* <div>
        {/*DataManager*/}
        {/* <Card className="box-button-card"> */}
          {/* <Card.Body> */} 
            <Button className="box-button" onClick={handleClick}>
            DataManager
            </Button>
          {/* </Card.Body>
        </Card>
        </div> */}
    </>
  )
}

export default DataManagerButton