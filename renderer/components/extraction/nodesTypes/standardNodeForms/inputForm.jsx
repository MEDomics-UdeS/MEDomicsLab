import React, { useState, useCallback, useEffect } from "react";
import { Form, Row, Col, Button } from "react-bootstrap";
import { toast } from "react-toastify";
import { axiosPostJson } from "../../../../utilities/requests";

const InputForm = ({ nodeForm, changeNodeForm, data, enableView }) => {
  const [file, setFile] = useState(nodeForm.filename || "");
  const [uploadEnabled, setUploadEnabled] = useState(false);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
    setUploadEnabled(true);
  };

  const handleUpload = useCallback(
    (event) => {
      if (file && file !== "") {
        const form_data = new FormData();
        form_data.append("file", file);
        // POST request to /extraction/upload for current node by sending form data of node
        axiosPostJson(form_data, "extraction/upload")
          .then((response) => {
            // The response of the request should be the filename of the uploaded file, and
            // the rois list for the image. We need to update the nodeForm with these values.
            // TODO : Not the greatest way to update the event, should create another changeNodeForm function that
            // takes the name of the field to change and the value to change it to.
            const modifiedEventFilename = {
              ...event, // Copy all properties of the original event
              target: {
                ...event.target,
                name: "filename",
                value: response.filename,
              },
            };
            changeNodeForm(modifiedEventFilename);

            const modifiedEventRoisList = {
              ...event, // Copy all properties of the original event
              target: {
                ...event.target,
                name: "rois",
                value: response.rois_list,
              },
            };
            changeNodeForm(modifiedEventRoisList);

            // Enable the view button
            enableView(true);
          })
          .catch((error) => {
            console.error("Error:", error);
            toast.warn("Could not load file.");
          });
      }
    },
    [file]
  );

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
      {data.internal.settings.filename &&
        data.internal.settings.filename !== "" && (
          <div>Selected file: {data.internal.settings.filename}</div>
        )}
    </Form>
  );
};

export default InputForm;
