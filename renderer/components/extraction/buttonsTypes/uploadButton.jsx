import React, { useState } from "react";
import { Form, Row, Col, Button } from "react-bootstrap";

const UploadComponent = ({ id, data, type }) => {
  // Initialize filename to empty string
  const [file, setFile] = useState("");
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
          // If the file was uploaded successfully, change the filename in the node
          data.internal.settings["filename"] = file;
          // And set changeView to true to update the view
          data.internal.changeView = true;
          data.parentFct.updateNode({
            id: id,
            updatedData: data.internal,
          });
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
        <Col className="upload-button-col">
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
