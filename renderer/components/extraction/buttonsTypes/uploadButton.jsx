import React, { useState } from "react";
import { Form, Row, Col, Button } from "react-bootstrap";

const UploadComponent = () => {
  const [file, setFile] = useState(null);
  const [uploadEnabled, setUploadEnabled] = useState(false);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
    setUploadEnabled(true);
  };

  const handleUpload = () => {
    if (file) {
      const form_data = new FormData();
      form_data.append("file", file);

      // POST request to /extraction/upload for current node by sending form data of node
      // TODO: Vérifier les headers
      fetch("/extraction/upload", {
        method: "POST",
        headers: {
          Accept: "multipart/form-data",
        },
        body: form_data,
      })
        .then(function (response) {
          if (response.ok) {
            return response.json();
          } else {
            // If the response from post shows an error, alert the user
            alert("Something is wrong " + response.errors); // TODO: Error message
          }
        })
        .then(function (json_response) {
          console.log(
            "The file " + json_response.name + " was uploaded successfully"
          );

          // TODO: Add your logic here for handling the response and updating the React component state

          // Clear the file input
          setFile(null);
        });
    }
  };

  return (
    <Form method="post" encType="multipart/form-data" className="inputFile">
      <Row>
        <Form.Label htmlFor="file">MEDImage Object :</Form.Label>
        <Col>
          <Form.Group controlId="enterFile">
            <Form.Control
              name="file"
              type="file"
              accept=".npy"
              onChange={handleFileChange}
            />
          </Form.Group>
        </Col>
        <Col className="fit-content-card ">
          <Form.Group controlId="uploadButton">
            <Button
              type="button"
              variant="primary"
              onClick={handleUpload}
              disabled={!uploadEnabled}
            >
              Upload
            </Button>
          </Form.Group>
        </Col>
      </Row>
    </Form>
  );
};

export default UploadComponent;
