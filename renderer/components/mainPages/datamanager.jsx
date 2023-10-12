import React, { useState, useEffect } from 'react';
import {Row, Col, Card, Form, Button, Offcanvas, Container, Alert} from 'react-bootstrap';
import { toast } from 'react-toastify';
import { axiosPostJson } from "../../utilities/requests"
import { ProgressBar } from 'react-bootstrap';
import Image from 'react-bootstrap/Image';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';
import Table from 'react-bootstrap/Table';

/**
 * @param {Object} nodeForm form associated to the discretization node
 * @param {object} data data of the node
 * @param {Function} changeNodeForm function to change the node form
 * @returns {JSX.Element} A InputForm to display in the modal of an input node
 *
 * @description
 * This component is used to display a InputForm.
 */
const DataManager = ({ reload, setReload }) => {
  const [progress, setProgress] = useState(0);
  const [refreshEnabled, setRefreshEnabled] = useState(false); // A boolean variable to control refresh
  const [selectedDcmFolder, setSelectedDcmFolder] = useState('');
  const [selectedNiftiFolder, setSelectedNiftiFolder] = useState('');
  const [selectedSaveFolder, setSelectedSaveFolder] = useState('');
  const [selectedSave, setSelectedSave] = useState(true);
  const [selectedNBatch, setSelectedNBatch] = useState(12);
  const [selectedCSVFile, setSelectedCSVFile] = useState('');
  const [wildcardWindow, setWildcardWindow] = useState('');
  const [wildcardDim, setWildcardDim] = useState('');
  const [summary, setSummary] = useState(''); // A string variable to store the summary of the node
  const [showOffCanvas, setShowOffCanvas] = useState(false) // used to display the offcanvas
  const handleOffCanvasClose = () => setShowOffCanvas(false) // used to close the offcanvas
  const handleOffCanvasShow = () => setShowOffCanvas(true) // used to show the offcanvas

  const handleGoBackClick = () => {
    console.log("Go back to extraction menu", reload)
    setReload(!reload);
  };

  const handleDcmFolderChange = (event) => {
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
      setSelectedDcmFolder(fileList)
    }
    else {
      setSelectedDcmFolder(event.target.files.path)
    }
  };

  const handleNiftiFolderChange = (event) => {
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
      setSelectedNiftiFolder(fileList)
    }
    else {
      setSelectedNiftiFolder(event.target.files.path)
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

  const handleSaveChange = (event) => {
    const save = (event.target.value === 'true');
    setSelectedSave(save);
  };

  const handleNBatchChange = (event) => {
    const n_batch = event.target.value;
    setSelectedNBatch(parseInt(n_batch));
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
      let folderCount = 0;
  
      const files = fs.readdirSync(path);
  
      for (const file of files) {
        const fullPath = `${path}/${file}`;
        const isDirectory = fs.statSync(fullPath).isDirectory();
  
        if (isDirectory) {
          if (fullPath.split('/').at(-1).split('-').length > 1) {

          }
          else {
          folderCount++; // Increment the count for the immediate subfolder
          }
  
          // Recursively count subfolders within this subfolder
          folderCount += countFoldersInPath(fullPath);
        }
      }
  
      return folderCount;
    } catch (error) {
      console.error('Error counting subfolders:', error);
      return 0; // Return 0 in case of an error
    }
  }

  /**
   * Count the number of .npy files in a folder.
   * @param {string} folderPath - The path of the folder to search for .npy files.
   * @returns {number} - The number of .npy files found.
   */
  function countNpyFilesInFolder(folderPath) {
    try {
      let npyFiles = 0;
      const files = fs.readdirSync(folderPath);
      for (const file of files) {
        if (file.split('.').pop() === 'npy') {
          npyFiles++;
        }
      }
      return npyFiles;
    } catch (error) {
      console.error('Error counting .npy files:', error);
      return 0;
    }
  }

  const handleProcessClick = () => {
    
    // Simulate page refresh
    setRefreshEnabled(true);

    // Create an object with the input values
    const requestData = {
      path_dicoms: selectedDcmFolder,
      path_niftis: selectedNiftiFolder,
      path_save: selectedSaveFolder,
      save: selectedSave,
      n_batch: parseInt(selectedNBatch),
    };
    // Make a POST request to the backend API
    axiosPostJson(requestData, 'extraction/run/dm')
      .then((response) => {
        // Handle the response from the backend if needed
        console.log('Response from backend:', response);
        setSummary(response);
        toast.success('Data processed!')
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

  const handleRunClick = () => {
    
    // Create an object with the input values
    const requestData = {
      path_dicoms: selectedDcmFolder,
      path_niftis: selectedNiftiFolder,
      path_save: selectedSaveFolder,
      save: selectedSave,
      path_csv: selectedCSVFile,
      wildcards_dimensions: wildcardDim,
      wildcards_window: wildcardWindow,
      n_batch: parseInt(selectedNBatch),
    };
    // Make a POST request to the backend API
    axiosPostJson(requestData, 'extraction/run/dm/prechecks')
      .then((response) => {
        // Handle the response from the backend if needed
        console.log('Response from backend:', response);
        toast.success('Pre-checks done!')
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
    // Call your front-end function to fetch data
    var npyFiles = countNpyFilesInFolder(selectedSaveFolder);

    // Simulate counting files
    var totalFiles = 0;
    if (selectedDcmFolder != '') {
      totalFiles = countFoldersInPath(selectedDcmFolder); // Replace with the actual total number of files
    } else if (!selectedNiftiFolder) {
      totalFiles = countFoldersInPath(selectedNiftiFolder); // Replace with the actual total number of files
    }

    // Calculate the progress
    const newData = Math.round((npyFiles / totalFiles) * 100);
    
    // Update the component's state with the new data
    setProgress(newData);

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
  }, [refreshEnabled]); // The empty dependency array ensures this effect runs only once when the component mounts

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
    if (summary) {
      return (
        <div className="tree-menu-container">
          {JsonDataDisplay(summary)}
        </div>
      )
    } else {
      // Show the warning message if data.internal.settings.results is undefined or empty
      return (
        <Alert variant="danger" className="warning-message">
          <b>No summary available</b>
        </Alert>
      )
    }
  }

  return (
    <>
    <div>
    <div data-bs-theme="blue" className='bg-blue p-2'>
      <OverlayTrigger
        placement="bottom"
        overlay={<Tooltip id="button-tooltip-2">Go back to extraction menu</Tooltip>}
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
              src="../icon/extraction/arrow-narrow-left.svg"
            />
          </Button>
        )}
      </OverlayTrigger>
    </div>
    <Card>
      <Card.Body>
        <Card.Header>
            <h4>Data Manager - Process data</h4>
        </Card.Header>

      <Form method="post" encType="multipart/form-data" className="inputFile">
      {/* UPLOAD DICOM DATASET FOLDER*/}
        <Row className="form-group-box">
          <Form.Label htmlFor="file">DICOM dataset folder</Form.Label>
          <Col style={{ width: "150px" }}>
            <Form.Group controlId="enterFile">
              <Form.Control
                name="path_dicoms"
                type="file"
                webkitdirectory="true"
                directory="true"
                onChange={handleDcmFolderChange}
              />
            </Form.Group>
          </Col>
        </Row>

        {/* UPLOAD NIfTI DATASET FOLDER*/}
        <Row className="form-group-box">
          <Form.Label htmlFor="file">NIfTI dataset folder</Form.Label>
          <Col style={{ width: "150px" }}>
            <Form.Group controlId="enterFile">
              <Form.Control
                name="path_niftis"
                type="file"
                webkitdirectory="true"
                directory="true"
                onChange={handleNiftiFolderChange}
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
      </Form>

      {/* SAVE OR NO*/}
      <Row className="form-group-box">
        <Col>
        <Form.Group controlId="save" style={{ paddingTop: "10px" }}>
          <Form.Label>Save:</Form.Label>
            <Form.Control
              as="select"
              name="save"
              value={selectedSave}
              onChange={handleSaveChange}
            >
              <option value="false">False</option>
              <option value="true">True</option>
            </Form.Control>
        </Form.Group>
        </Col>
      {/* NUMBER OF BATCH*/}
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
                onClick={handleProcessClick}
                disabled={(!selectedDcmFolder || !selectedSaveFolder || refreshEnabled) && (!selectedNiftiFolder || !selectedSaveFolder)}
                className="small-results-button"
              >
                Process
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
          Show Summary
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
          <Offcanvas.Title>Data processing summary</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>{renderTree()}</Offcanvas.Body>
      </Offcanvas>
    </Container>

    {/* PROGRESS BAR*/}
    <br></br>
    {(progress === 0) && (refreshEnabled) &&(<Card>
        <Card.Body>
          <ProgressBar animated striped variant="success" now={100} label={'Reading data and associating RT objects to imaging volumes...'} />
        </Card.Body>
      </Card>)}
    {progress !== 0 &&(<Card>
        <Card.Body>
          <ProgressBar animated striped variant="info" now={progress} label={`${progress}%`} />
        </Card.Body>
      </Card>)}
    <br></br>


    {/* RADIOMICS PRE-CHECKS*/}
    <Card>
      <Card.Body>
        <Card.Header>
            <h4>Data Manager - Radiomics Pre-checks</h4>
        </Card.Header>

        <Form method="post" encType="multipart/form-data" className="inputFile">
        {/* UPLOAD CSV FILE*/}
          <Row className="form-group-box">
            <Form.Label htmlFor="file">CSV File</Form.Label>
            <Col style={{ width: "150px" }}>
              <Form.Group controlId="enterFile">
                <Form.Control
                  name="path_csv"
                  type="file"
                  onChange={handleCSVFileChange}
                />
              </Form.Group>
            </Col>
          </Row>
        </Form>      
      
      {/* WILD CARDS*/}
      <Row className="form-group-box">
        <Col>
          <Form.Group controlId="name_save">
            <Form.Label column>Window's wildcard:</Form.Label>
              <Form.Control
                name="windowwildcard"
                type="text"
                value={wildcardWindow}
                placeholder={
                  'For ex: *CTscan.npy, STS*MRscan.npy'
                }
                onChange={(event) => setWildcardWindow(event.target.value)}
              />
          </Form.Group>
        </Col>
        <Col>
          <Form.Group controlId="name_save">
            <Form.Label column>Dimension's wildcard:</Form.Label>
              <Form.Control
                name="dimwildcard"
                type="text"
                value={wildcardDim}
                placeholder={
                  'For ex: *CTscan.npy, STS*MRscan.npy'
                }
                onChange={(event) => setWildcardDim(event.target.value)}
              />
          </Form.Group>
        </Col>
      </Row>
          
      {/* RUN PRE-CHECKS BUTTON*/}
      <Row className="form-group-box">
          <div className="text-center"> {/* Center-align the button */}
              <Button
                variant="primary"
                name="RunButton"
                type="button"
                onClick={handleRunClick}
                disabled={(!selectedCSVFile)}
                className="upload-button"
              >
                RUN
              </Button>
          </div>
        </Row>
      </Card.Body>
    </Card>

  </div>
  </>
  );
}

export default DataManager;
