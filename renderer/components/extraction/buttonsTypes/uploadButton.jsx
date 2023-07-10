import React, { useState, useCallback } from "react";
import { Form, Row, Col, Button } from "react-bootstrap";
import { toast } from "react-toastify";
import { requestJson, axiosPostJson } from "../../../utilities/requests";

const UploadComponent = ({ id, data, type }) => {
  // Initialize filename to empty string
  const [file, setFile] = useState("");
  const [uploadEnabled, setUploadEnabled] = useState(false);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
    setUploadEnabled(true);
  };

  const handleUpload = useCallback(() => {
    if (file && file !== "") {
      const form_data = new FormData();
      form_data.append("file", file);

      // POST request to /extraction/upload for current node by sending form data of node
      axiosPostJson(form_data, "extraction/upload")
        .then((response) => {
          console.log("Response:", response);
          // If the file was uploaded successfully, change the filename in the node
          data.internal.settings["filename"] = file;
          // And set changeView to true to update the view
          data.internal.changeView = true;
          data.parentFct.updateNode({
            id: id,
            updatedData: data.internal,
          });
        })
        .catch((error) => {
          console.error("Error:", error);
          toast.warn("Could not load file.");
        });
    }
  }, [file]);

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
