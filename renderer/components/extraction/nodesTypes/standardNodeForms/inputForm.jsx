import React, { useState, useCallback, useEffect } from 'react';
import { Form, Row, Col, Button, Card } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { axiosPostJson } from '../../../../utilities/requests';

const InputForm = ({ nodeForm, changeNodeForm, enableView }) => {
  // Hook to keep the state of the upload button up to date with nodeForm.filename
  const [selectedFile, setSelectedFile] = useState('');
  useEffect(() => {
    console.log('Selected File:', selectedFile);
    console.log('Node Form:', nodeForm);
  }, [selectedFile, nodeForm]);

  // Upon selection of a file by the user, update the nodeForm.filename
  const handleFileChange = (event) => {
    // If the user selected a file, set filePath to the path of the file
    if (event.target.files && event.target.files.length !== 0) {
      let filePath = event.target.files[0].path;
      setSelectedFile(filePath);
    } else {
      setSelectedFile(null);
    }
  };

  // Function to send a POST request to /extraction/upload when the user
  // clicks on the upload button
  const handleUpload = useCallback(() => {
    // Check if the filename is not empty
    if (selectedFile && selectedFile !== '') {
      // Create a new form with the path to the file to upload
      //const formData = new FormData();
      let formData = JSON.stringify({ file: selectedFile });

      // POST request to /extraction/upload for current node by sending form data of node
      axiosPostJson(formData, 'extraction/upload')
        .then((response) => {
          // The response of the request should be the filename of the uploaded file, and
          // the rois list for the image. Since the nodeForm was already updated with the user
          // we only need to update the rois list
          // Modify the event object
          changeNodeForm({
            target: { name: 'rois', value: response.rois_list }
          });
          changeNodeForm({
            target: { name: 'filename', value: response.name }
          });

          // Enable the view button
          enableView(true);
        })
        .catch((error) => {
          // If there is an error, write it in the console and notify the user
          console.error('Error:', error);
          toast.warn('Could not load file.');

          // Disable the view button
          enableView(false);
        });
    }
  }, [nodeForm, selectedFile, changeNodeForm]);

  return (
    <Form method="post" encType="multipart/form-data" className="inputFile">
      <Row className="form-group-box">
        <Form.Label htmlFor="file">MEDImage Object (.npy)</Form.Label>
        <Col style={{ width: '150px' }}>
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
              disabled={!selectedFile}
              className="upload-button"
            >
              Upload
            </Button>
          </Form.Group>
        </Col>
      </Row>
      {nodeForm.filename && nodeForm.filename !== '' && (
        <Card className="cute-box">
          <Card.Body>
            <Card.Text>Uploaded file: {nodeForm.filename}</Card.Text>
          </Card.Body>
        </Card>
      )}
    </Form>
  );
};

export default InputForm;
