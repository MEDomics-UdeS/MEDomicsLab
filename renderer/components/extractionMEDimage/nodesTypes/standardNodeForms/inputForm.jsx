import React, { useCallback, useContext, useState } from "react"
import { Button, Card, Col, Form, Row } from "react-bootstrap"
import { toast } from "react-toastify"
import { requestBackend } from "../../../../utilities/requests"
import { ErrorRequestContext } from "../../../generalPurpose/errorRequestContext"
import { WorkspaceContext } from "../../../workspace/workspaceContext"

/**
 * @param {Object} nodeForm form associated to the discretization node
 * @param {Function} changeNodeForm function to change the node form
 * @param {Function} enableView function to enable the view button of the node
 * @returns {JSX.Element} A InputForm to display in the modal of an input node
 *
 * @description
 * This component is used to display a InputForm.
 */
const InputForm = ({ nodeForm, changeNodeForm, enableView }) => {
  // Hook to keep the path of the selected file before upload
  const [selectedFile, setSelectedFile] = useState("")
  const { port } = useContext(WorkspaceContext)
  const { setError, setShowError } = useContext(ErrorRequestContext)
  const pageId = "extractionMEDimage" // pageId is used to identify the page in the backend

  /**
   * @param {Event} event event given change of the file in the form
   *
   * @description
   * This function is used to handle a file change when uploading a file to the input node.
   */
  const handleFileChange = (event) => {
    // If the user selected a file, set filePath to the path of the file
    if (event.target.files && event.target.files.length !== 0) {
      let filePath = event.target.files[0].path
      setSelectedFile(filePath)
    } else {
      setSelectedFile(null)
    }
  }

  /**
   * @param {Event} event event given change of the folder in the form
   *
   * @description
   * This function is used to handle a folder change when uploading a folder to the input node.
   */
  const handleFolderChange = (event) => {
    const fileList = event.target.files
    if (fileList.length > 0) {
      const selectedFile = fileList[0]

      // The path of the image needs to be the path of the common folder of all the files
      // If the directory is constructed according to standard DICOM format, the path
      // of the image is the one containning the folders image and mask
      let selectedImageFolder = "/" + selectedFile.path.split("/").slice(1, -2).join("/")
      setSelectedFile(selectedImageFolder)
    }
  }

  /**
   * @param {String} fileType type of the file to upload (file or folder)
   *
   * @description
   * This function is used to send a POST request to /extraction_MEDimage/upload when the user
   * clicks on the upload button.
   */
  const handleUpload = useCallback(
    (fileType) => {
      // TODO : Check if the upload button clicked corresponds to the filetype
      // Check if the filename is not empty
      if (selectedFile && selectedFile !== "") {
        // Create a new form with the path to the file to upload
        let formData = { file: selectedFile, type: fileType }

        // POST request to /extraction_MEDimage/upload/ for current node by sending form data of node
        requestBackend(
          port, 
          "/extraction_MEDimage/upload/" + pageId,
          formData, 
          (response) => {
            console.log("response", response)
            if (response.error) {
              // show error message
              toast.error(response.error)
              console.log("error", response.error)

              // check if error has message or not
              if (response.error.message){
                console.log("error message", response.error.message)
                setError(response.error)
              } else {
                console.log("error no message", response.error)
                setError({
                  "message": response.error
                })
              }
              setShowError(true)
            } else {
              // The response of the request should be the filename of the uploaded file, and
              // the rois list for the image. Since the nodeForm was already updated with the user
              // we only need to update the rois list
              // Modify the event object
              console.log("response", response)
              changeNodeForm({
                target: { name: "rois", value: response.rois_list }
              })
              changeNodeForm({
                target: { name: "filepath", value: response.name }
              })

              // Enable the view button
              enableView(true)

              // Toast success message
              toast.success("File uploaded successfully")
            }
          }
        )
      }
    },
    [nodeForm, selectedFile, changeNodeForm]
  )

  return (
    <Form method="post" encType="multipart/form-data" className="inputFile">
      <Row className="form-group-box">
        <Form.Label htmlFor="file">MEDscan Object (.npy)</Form.Label>
        <Col style={{ width: "150px" }}>
          <Form.Group controlId="enterFile">
            <Form.Control name="file" type="file" accept=".npy" onChange={handleFileChange} />
          </Form.Group>
        </Col>
        <Col className="upload-button-col">
          <Form.Group controlId="uploadButton">
            <Button name="uploadButtonFile" type="button" variant="primary" onClick={() => handleUpload("file")} disabled={!selectedFile} className="upload-button">
              Upload
            </Button>
          </Form.Group>
        </Col>
      </Row>
      <Row className="form-group-box">
        <Form.Label htmlFor="file">DICOM image (folder)</Form.Label>
        <Col style={{ width: "150px" }}>
          <Form.Group controlId="enterFile">
            <Form.Control name="file" type="file" webkitdirectory="true" directory="true" onChange={handleFolderChange} />
          </Form.Group>
        </Col>
        <Col className="upload-button-col">
          <Form.Group controlId="uploadButton">
            <Button name="uploadButtonFolder" type="button" variant="primary" onClick={() => handleUpload("folder")} disabled={!selectedFile} className="upload-button">
              Upload
            </Button>
          </Form.Group>
        </Col>
      </Row>
      {nodeForm.filepath && nodeForm.filepath !== "" && (
        <Card className="cute-box">
          <Card.Body>
            <Card.Text>
              <strong>Uploaded image:</strong> {nodeForm.filepath.slice(0, -4)}
            </Card.Text>
          </Card.Body>
        </Card>
      )}
    </Form>
  )
}

export default InputForm
