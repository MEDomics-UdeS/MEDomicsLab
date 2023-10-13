import React, { useState, useEffect } from 'react';
import {Row, Col, Card, Form, Button, Offcanvas, Container, Alert} from 'react-bootstrap';
import { toast } from 'react-toastify';
import { axiosPostJson } from "../../utilities/requests"
import { ProgressBar } from 'react-bootstrap';
import Image from 'react-bootstrap/Image';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';
import Table from 'react-bootstrap/Table';
import ModulePage from './moduleBasics/modulePage';
/**
 * @param {Object} nodeForm form associated to the discretization node
 * @param {object} data data of the node
 * @param {Function} changeNodeForm function to change the node form
 * @returns {JSX.Element} A InputForm to display in the modal of an input node
 *
 * @description
 * This component is used to display a InputForm.
 */
const BatchExtractor = ({ reload, setReload }) => {
  const [progress, setProgress] = useState(0);
  const [refreshEnabled, setRefreshEnabled] = useState(false); // A boolean variable to control refresh
  const [selectedReadFolder, setSelectedReadFolder] = useState('');
  const [selectedSaveFolder, setSelectedSaveFolder] = useState('');
  const [selectedNBatch, setSelectedNBatch] = useState(12);
  const [selectedCSVFile, setSelectedCSVFile] = useState('');
  const [selectedSettingsFile, setSelectedSettingsFile] = useState('');
  const [nscans, setNscans] = useState(0); // Number of scans to be processed
  const [saveFolder, setSaveFolder] = useState(''); // Path of the folder where the results are saved
  const [showOffCanvas, setShowOffCanvas] = useState(false) // used to display the offcanvas
  const handleOffCanvasClose = () => setShowOffCanvas(false) // used to close the offcanvas
  const handleOffCanvasShow = () => setShowOffCanvas(true) // used to show the offcanvas

  const handleGoBackClick = () => {
    setReload(!reload);
  };

  const handleReadFolderChange = (event) => {
    var fileList = event.target.files
    if (fileList.length > 0) {
      fileList = fileList[0].path

      // The path of the image needs to be the path of the common folder of all the files
      // If the directory is constructed according to standard DICOM format, the path
      // of the image is the one containning the folders image and mask
      if (fileList.indexOf("\\") >= 0) {
        fileList = fileList.split("\\").slice(0, -1).join("\\")
      } else if (fileList.indexOf("/") >= 0) {
        fileList = fileList.split("/").slice(0, -1).join("/")
      } else {
        fileList = fileList.split("/").slice(0, -1).join("/")
      }
      setSelectedReadFolder(fileList)
    }
    else {
      setSelectedReadFolder(event.target.files.path)
    }
  };

  const handleSaveFolderChange = (event) => {
    var fileList = event.target.files
    if (fileList.length > 0) {
      fileList = fileList[0].path
      // The path of the image needs to be the path of the common folder of all the files
      // If the directory is constructed according to standard DICOM format, the path
      // of the image is the one containning the folders image and mask
      if (fileList.indexOf("\\") >= 0) {
        fileList = fileList.split("\\").slice(0, -1).join("\\")
      } else if (fileList.indexOf("/") >= 0) {
        fileList = fileList.split("/").slice(0, -1).join("/")
      } else {
        fileList = fileList.split("/").slice(0, -1).join("/")
      }
      setSelectedSaveFolder(fileList)
    }
    else {
      setSelectedSaveFolder(event.target.files.path)
    }
  };

  const handleNBatchChange = (event) => {
    const n_batch = event.target.value;
    setSelectedNBatch(parseInt(n_batch));
  };

  const handleSettingsFileChange = (event) => {
    var fileList = event.target.files
    if (fileList.length > 0) {
      fileList = fileList[0].path
      setSelectedSettingsFile(fileList)
    }
    else {
      setSelectedSettingsFile(event.target.files.path)
    }
  };

  const handleCSVFileChange = (event) => {
    var fileList = event.target.files
    if (fileList.length > 0) {
      fileList = fileList[0].path
      setSelectedCSVFile(fileList)
    }
    else {
      setSelectedCSVFile(event.target.files.path)
    }
  };

  const fs = require('fs');

  function countFoldersInPath(path) {
    try {
      let fileCount = 0;  
      const files = fs.readdirSync(path);
  
      for (const file of files) {
        const fullPath = `${path}/${file}`;
        const isDirectory = fs.statSync(fullPath).isDirectory();
  
        if (!isDirectory && fullPath.endsWith('.json')) {
          fileCount++; // Increment the count for the immediate subfolder
          }
      }
  
      return fileCount;
    } catch (error) {
      console.error('Error counting subfolders:', error);
      return 0; // Return 0 in case of an error
    }
  }

  const handleEditClick = () => {
  }

  const handleRunClick = () => {

    // Simulate page refresh
    setRefreshEnabled(true);

    // Create an object with the input values
    const requestData = {
      path_read: selectedReadFolder,
      path_params: selectedSettingsFile,
      path_csv: selectedCSVFile,
      path_save: selectedSaveFolder,
      n_batch: parseInt(selectedNBatch),
    };

     // Make a POST request to the backend API to count the final scans to be processed
     axiosPostJson(requestData, 'extraction/count/be')
     .then((response) => {
       // Handle the response from the backend if needed
       setNscans(response.n_scans);
       setSaveFolder(response.folder_save_path);
     })
     .catch((error) => {
       // Handle errors if the request fails
       console.error('Error:', error);
       toast.error('Error: ' + error.message)
       if (error.response.data){
         toast.error('Error while counting total scans to process: ' + error.response.data)
       }
     });

    // Make a POST request to the backend API
    axiosPostJson(requestData, 'extraction/run/be')
      .then((response) => {
        // Handle the response from the backend if needed
        console.log('Response from backend:', response);
        toast.success('Data processed!')
        setRefreshEnabled(false);
      })
      .catch((error) => {
        // Handle errors if the request fails
        console.error('Error:', error);
        toast.error('Error: ' + error.message)
        if (error.response.data){
          toast.error('Error message: ' + error.response.data)
        }
      });
  };

  // Function to fetch and update data (your front-end function)
  const fetchData = () => {

    // Simulate counting files
    var totalFiles = 0;
    if (saveFolder != '') {
      totalFiles = countFoldersInPath(saveFolder); // Replace with the actual total number of files
    }

    // Calculate the progress
    var newData = Math.round((totalFiles / nscans) * 100);
    if (totalFiles === 0) {
      setProgress(0);
      // setProgress({now: number, currentLabel: string})
    }
    else {
      setProgress(newData);
    }

    if (newData === 100) {
      setRefreshEnabled(false);
    }
  };

  useEffect(() => {
    if (refreshEnabled && progress !== 100) {
      // Call fetchData immediately when the component mounts
      fetchData();

      // Set up an interval to refresh the data every second (1000 milliseconds)
      const intervalId = setInterval(() => {
        fetchData();
      }, 1000);

      // Clean up the interval when the component unmounts
      return () => {
        clearInterval(intervalId);
    };
  }
  }, [refreshEnabled, nscans, saveFolder]); // The empty dependency array ensures this effect runs only once when the component mounts

  function JsonDataDisplay(JsonData){
    const DisplayData = [JsonData].map(
        info=>{
            return(
              info.map(infos=>{
                return(
                <tr>
                    <td>{infos.study}</td>
                    <td>{infos.institution}</td>
                    <td>{infos.scan_type}</td>
                    <td>{infos.roi_type}</td>
                    <td>{infos.count}</td>
                </tr>
                )
              }
              )
            )
        }
    ) 
    return(
      <div>
          <Table striped hover size="sm">
              <thead>
                  <tr>
                  <th>Study</th>
                  <th>Insitution</th>
                  <th>Scan type</th>
                  <th>ROI type</th>
                  <th>Count</th>
                  </tr>
              </thead>
              <tbody> 
                  {DisplayData}
              </tbody>
              </Table>
            
      </div>
    )
 }

  /**
   * @returns {JSX.Element} A tree menu or a warning message
   *
   * @description
   * This function is used to render the tree menu of the extraction node.
   */
  const renderTree = () => {
    // Check if data.internal.settings.results is available
    return (
      <Alert variant="danger" className="warning-message">
        <b>No results available</b>
      </Alert>
    )
    
  }

  return (
    <>
    <ModulePage pageId="batchExtractor_id">

    <div>
    <div data-bs-theme="blue" className='bg-blue p-2'>
      <OverlayTrigger
        placement="bottom"
        overlay={<Tooltip id="button-tooltip-2" data-pr-showdelay={500}>Go back to extraction menu</Tooltip>}
      >
        {({ ref, ...triggerHandler }) => (
          <Button
            variant="danger"
            {...triggerHandler}
            className="d-inline-flex align-items-center"
            onClick={handleGoBackClick}
          >
            <Image
              width="30"
              ref={ref}
              roundedCircle
              src="../icon/extraction_img/arrow-narrow-left.svg"
            />
          </Button>
        )}
      </OverlayTrigger>
    </div>
    <Card className="text-center">
      <Card.Body>
        <Card.Header>
            <h4>Batch Extractor - Radiomics</h4>
        </Card.Header>

      <Form method="post" encType="multipart/form-data" className="inputFile">
      {/* UPLOAD NPY DATASET FOLDER*/}
        <Row className="form-group-box">
          <Form.Label htmlFor="file">NPY dataset folder (MEDscan objects)</Form.Label>
          <Col style={{ width: "150px" }}>
            <Form.Group controlId="enterFile">
              <Form.Control
                name="path_read"
                type="file"
                webkitdirectory="true"
                directory="true"
                onChange={handleReadFolderChange}
              />
            </Form.Group>
          </Col>
        </Row>

        {/* UPLOAD SETTINGS FILE*/}
        <Row className="form-group-box">
            <Form.Label htmlFor="file">Settings File</Form.Label>
            <Col xs={11}>
              <Form.Group controlId="enterFile">
                <Form.Control
                  accept='.json'
                  name="path_params"
                  type="file"
                  onChange={handleSettingsFileChange}
                />
              </Form.Group>
            </Col>
            <Col>
              <Button
                variant="primary"
                name="EditSettingsButton"
                type="button"
                onClick={handleEditClick}
                disabled={(!selectedSettingsFile)}
                className="upload-button"
              >
                Edit
              </Button>
            </Col>
          </Row>
        </Form>  

        {/* UPLOAD CSV FILE*/}
        <Row className="form-group-box">
        <Form.Label htmlFor="file">Path to the CSV File</Form.Label>
          <Col style={{ width: "150px" }}>
            <Form.Group controlId="enterFile">
              <Form.Control
                name="path_csv"
                type="file"
                webkitdirectory="true"
                directory="true"
                onChange={handleCSVFileChange}
              />
            </Form.Group>
          </Col>
        </Row>

        {/* UPLOAD SAVING FOLDER*/}
        <Row className="form-group-box">
          <Form.Label htmlFor="file">Save folder</Form.Label>
          <Col style={{ width: "150px" }}>
            <Form.Group controlId="enterFile">
              <Form.Control
                name="path_save"
                type="file"
                webkitdirectory="true"
                directory="true"
                onChange={handleSaveFolderChange}
              />
            </Form.Group>
          </Col>
        </Row>

      {/* NUMBER OF BATCH*/}
      <Row className="form-group-box">
        <Col>
        <Form.Group controlId="n_batch" style={{ paddingTop: "10px" }}>
          <Form.Label>Number of cores to use :</Form.Label>
            <Form.Control
              name="n_batch"
              type="number"
              defaultValue={12}
              placeholder={"Default: " + 12}
              onChange={handleNBatchChange}
            />
        </Form.Group>
        </Col>
      </Row>

      {/* PROCESS BUTTON*/}
      <Row className="form-group-box">
        <Col>
          <div className="text-center"> {/* Center-align the button */}
              <Button
                variant="primary"
                name="ProcessButton"
                type="button"
                onClick={handleRunClick}
                disabled={(!selectedReadFolder || !selectedSaveFolder || refreshEnabled || !selectedSettingsFile)}
                className="small-results-button"
              >
                RUN
              </Button>
          </div>
          </Col>
        <Col>
        <Button
          variant="success"
          name="ShowSummaryButton"
          type="button"
          className="small-results-button"
          onClick={handleOffCanvasShow}
        >
          Show Results
        </Button>

        </Col>
        </Row>
      </Card.Body>
    </Card>
  
    {/* offcanvas of the node (panel coming from right when a node is clicked )*/}
    <Container>
      <Offcanvas
        show={showOffCanvas}
        onHide={handleOffCanvasClose}
        placement="end"
        scroll
        backdrop
      >
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Extraction results</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>{renderTree()}</Offcanvas.Body>
      </Offcanvas>
    </Container>

    {/* PROGRESS BAR*/}
    <br></br>
    {(progress === 0) && (refreshEnabled) &&(<Card>
        <Card.Body>
          <ProgressBar animated striped variant="success" now={100} label={'Preparing data...'} />
          {/* <ProgressBarRequests progress={progress} setProgress={setProgress} variant="success" /> */}

        </Card.Body>
      </Card>)}
    {progress !== 0 &&(<Card>
        <Card.Body>
          <ProgressBar animated striped variant="info" now={progress} label={`${progress}%`} />
          {/* <ProgressBarRequests progress={progress} setProgress={setProgress} variant="success" /> */}

        </Card.Body>
      </Card>)}

  </div>
  </ModulePage>

  </>
  );
}

export default BatchExtractor;
