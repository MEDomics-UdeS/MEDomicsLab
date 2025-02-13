import { Button } from "primereact/button"
import { Dialog } from 'primereact/dialog'
import { Dropdown } from "primereact/dropdown"
import { Galleria } from 'primereact/galleria'
import { Image } from "primereact/image"
import { InputText } from 'primereact/inputtext'
import { MultiSelect } from 'primereact/multiselect'
import { Tooltip } from 'primereact/tooltip'
import React, { useContext, useEffect, useState } from 'react'
import { Alert, Card, Col, Container, Form, Offcanvas, ProgressBar, Row } from 'react-bootstrap'
import Table from 'react-bootstrap/Table'
import { toast } from 'react-toastify'
import { requestBackend } from "../../utilities/requests"
import { ErrorRequestContext } from "../generalPurpose/errorRequestContext"
import { DataContext } from "../workspace/dataContext"
import { WorkspaceContext } from "../workspace/workspaceContext"
import DocLink from "../extractionMEDimage/docLink"

/**
 * @param {Object} nodeForm form associated to the discretization node
 * @param {object} data data of the node
 * @param {Function} changeNodeForm function to change the node form
 * @returns {JSX.Element} A InputForm to display in the modal of an input node
 *
 * @description
 * This component is used to display a InputForm.
 */
const DataManager = ({ pageId, configPath = "" }) => {
  const { port } = useContext(WorkspaceContext)
  const { setError } = useContext(ErrorRequestContext)
  const { globalData } = useContext(DataContext) // Get the workspace data
  const [progress, setProgress] = useState(0)
  const [refreshEnabled, setRefreshEnabled] = useState(false) // A boolean variable to control refresh
  const [refreshEnabledPreChecks, setRefreshEnabledPreChecks] = useState(false) // A boolean variable to control refresh for preChecks
  const [selectedDcmFolder, setSelectedDcmFolder] = useState('')
  const [listWSFolders, setListWSFolders] = useState([])
  const [listCSVFiles, setListCSVFiles] = useState([])
  const [selectedNiftiFolder, setSelectedNiftiFolder] = useState('')
  const [selectedSaveFolder, setSelectedSaveFolder] = useState('')
  const [selectedSavePreChecksFolder, setSelectedSavePreChecksFolder] = useState('')
  const [selectedNpyFolder, setSelectedNpyFolder] = useState('')
  const [selectedNBatch, setSelectedNBatch] = useState(12)
  const [selectedCSVFile, setSelectedCSVFile] = useState('')
  const [selectedPreChecksOptions, setSelectedPreChecksOptions] = useState(null)
  const [selectedInstitutions, setSelectedInstitutions] = useState([])
  const [selectedStudies, setSelectedStudies] = useState([])
  const [selectedModalities, setSelectedModalities] = useState([])
  const [costumWildCard, setCostumWildCard] = useState(null) // A boolean variable to control refresh
  const [summary, setSummary] = useState('') // A string variable to store the summary of the node
  const [showOffCanvas, setShowOffCanvas] = useState(false) // used to display the offcanvas
  const [showPreChecksImages, setShowPreChecksImages] = useState(false) // used to display the offcanvas
  const handleOffCanvasClose = () => setShowOffCanvas(false) // used to close the offcanvas
  const handleOffCanvasShow = () => setShowOffCanvas(true) // used to show the offcanvas
  const [preChecksImages, setPreChecksImages] = useState([]) // used to display the offcanvas  

  useEffect(() => {
    updateWSfolder()
    updateCSVFilesList()
  }, [])
  
  useEffect(() => {
    updateWSfolder()
    }, [globalData])

  const updateWSfolder = () => {
    if (globalData !== undefined) {
      let keys = Object.keys(globalData)
      let wsFolders = []
      keys.forEach((key) => {
        if (globalData[key].type === "directory" && !globalData[key].name.startsWith(".")) {
          wsFolders.push({ name: globalData[key].name, value: globalData[key].path })
        }
      })
      setListWSFolders(wsFolders)
    }
  }

  const updateCSVFilesList = () => {
    if (globalData !== undefined) {
      let keys = Object.keys(globalData)
      let csvFiles = []
      keys.forEach((key) => {
        if (globalData[key].type === "csv") {
          csvFiles.push({ name: globalData[key].name, value: globalData[key].path })
        }
      })
      setListCSVFiles(csvFiles)
    }
  }

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
    // Update npy folder automatically
    setSelectedNpyFolder(selectedSaveFolder);
  };

  const handleNBatchChange = (event) => {
    const nBatch = event.target.value;
    setSelectedNBatch(parseInt(nBatch));
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

  const handleNpyFolderChange = (event) => {
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
      setSelectedNpyFolder(fileList)
    }
    else {
      setSelectedNpyFolder(event.target.files.path)
    }
  };

  const itemTemplate = (item) => {
    const nativeImage = require("electron").nativeImage
    const image = nativeImage.createFromPath(item.itemImageSrc)
    return <Image src={image.toDataURL()} height="500" alt={item.alt} preview downloadable/>
  }

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


  /**
   * @returns {JSX.Element} A tree menu or a warning message
   * @param {Object} JsonData - The data to display in the tree menu
   * @description This function is used to render the tree menu of the extraction node.
  */
  const getFinalWildCards = () => {
    let finalWildCards = new Array();
    if (selectedStudies === null && selectedInstitutions === null && selectedModalities === null) {
      toast.error('Please select at least a study, an institution or a modality');
      return;
    }
    else {
      let studies = selectedStudies;
      let institutions = selectedInstitutions;
      let modalities = selectedModalities;
      
      if (studies === null || studies.length === 0) {
        studies = [{label: ''}];
      }
      if (institutions === null || institutions.length === 0) {
        institutions = [{label: ''}];
      }
      if (modalities === null || modalities.length === 0) {
        modalities = [{label: ''}];
      }

      for (let i = 0; i < studies.length; i++) {
        for (let j = 0; j < institutions.length; j++) {
          for (let k = 0; k < modalities.length; k++) {
            if (institutions[j].label === '' && modalities[k].label === '') {
              finalWildCards.push(studies[i].label + '*.npy');
            }
            else if (studies[i].label === '' && modalities[k].label === '') {
              finalWildCards.push('*' + institutions[j].label + '*.npy');
            }
            else if (studies[i].label === '' && institutions[j].label === '') {
              finalWildCards.push('*' + modalities[k].label + '*.npy');
            }
            else if (studies[i].label === '') {
              finalWildCards.push('*' + institutions[j].label + '*' + modalities[k].label + '*.npy');
            }
            else if (institutions[j].label === '') {
              finalWildCards.push(studies[i].label + '*' + '*' + modalities[k].label + '*.npy');
            }
            else if (modalities[k].label === '') {
              finalWildCards.push(studies[i].label + '*' + institutions[j].label + '*.npy');
            }
            else{
              finalWildCards.push(studies[i].label + '-' + institutions[j].label + '*' + modalities[k].label + '*.npy');
            }
          }
        }
      }
    }
    return finalWildCards;
  }

  /**
   * @returns {JSX.Element} A tree menu or a warning message
   * @param {Object} JsonData - The data to display in the tree menu
   * @description This function is used to render the tree menu of the extraction node.
  */
  const updateWildCards = (JsonData) => {
    // Initialization
    let studies = new Array();
    let institutions = new Array();
    let modalities = new Array();
    // get unique studies
    try {
      JsonData.map((value, key) => (studies.push(value.study)));
      studies = [...new Set(studies)];
      // Delete the empty string
      studies = studies.filter(function (el) {
        return el != "";
      });
      studies = studies.map((value, key) => ({ label: value}));
    } catch (error) {
      console.error('Error counting studies:', error);
    }
  
    // get unique institutions
    try {
      JsonData.map((value, _) => (institutions.push(value.institution)));
      institutions = [...new Set(institutions)];
      // Delete the empty string
      institutions = institutions.filter(function (el) {
        return el != "";
      });
      institutions = institutions.map((value, key) => ({ label: value}));
    } catch (error) {
      console.error('Error counting institutions:', error);
    }

    // get unique modalities
    try {
      JsonData.map((value, _) => (modalities.push(value.scan_type)));
      modalities = [...new Set(modalities)];
      // Delete the empty string
      modalities = modalities.filter(function (el) {
        return el != "";
      });
      modalities = modalities.map((value, key) => ({ label: value}));
      console.log("modalities: ", modalities);
    } catch (error) {
      console.error('Error counting modalities:', error);
    }

    // Update pre checks options
    let preChecksOptions = new Object();
    preChecksOptions.studies = studies;
    preChecksOptions.institutions = institutions;
    preChecksOptions.modalities = modalities;
    setSelectedPreChecksOptions(preChecksOptions);

  }

  /**
   * @description Handles the click on the process button of the DICOM or NIfTI data.
  */
  const handleProcessClick = () => {
    // Create an object with the input values
    let requestData = {
      pathDicoms: selectedDcmFolder,
      pathNiftis: selectedNiftiFolder,
      pathSave: selectedSaveFolder,
      nBatch: parseInt(selectedNBatch),
    }

    // Simulate page refresh
    setRefreshEnabled(true)
    setProgress(0)

    // Make a POST request to the backend API
    requestBackend(
      port, 
      '/extraction_MEDimage/run_all/dm',
      requestData, 
      (response) => {
        console.log("response", response)
        setRefreshEnabled(false)
        if (response.error) {          
          setProgress(0)
          toast.error(response.error.message)
          setError(response.error)
          console.log("error", response.error)

        } else {
          // Handle the response from the backend if needed
          console.log('Response from backend:', response)
          setProgress(100)

          // Update summary
          setSummary(response);

          // Update wildcards
          updateWildCards(response);

          // Update npy folder
          setSelectedNpyFolder(selectedSaveFolder);

          toast.success('Data processed!')
        }
      },
      (error) => {
        toast.error("Error processing data : ", error)
        // Update progress
        setRefreshEnabled(false)
        setProgress(0)
      }
    )
  };

  /**
   * @description Handles the click on the run button for the pre-checks
  */
  const handleRunClick = () => {

    // Get the final wildcards
    let finalwildcard = null;
    if (!costumWildCard) {
      finalwildcard = getFinalWildCards();
    } else if (!costumWildCard.endsWith('.npy')) {
      finalwildcard = costumWildCard + '.npy';
    } else {
      finalwildcard = costumWildCard;
    }

    //Check if npy folder is defined
    if (selectedNpyFolder === null && selectedSaveFolder === null) {
      console.log(selectedNpyFolder);
      console.log(selectedSaveFolder);
      toast.error('Please select a npy folder');
      return;
    }

    // refresh
    setRefreshEnabledPreChecks(true);
    
    // Create an object with the input values
    let requestData = {
      pathDicoms: selectedDcmFolder,
      pathNiftis: selectedNiftiFolder,
      pathNpy: selectedNpyFolder,
      pathSave: selectedSavePreChecksFolder,
      pathCSV: selectedCSVFile,
      wildcards_dimensions: finalwildcard,
      wildcards_window: finalwildcard,
      nBatch: parseInt(selectedNBatch),
    };
    console.log("requestData: ", requestData);
    
    // Make a POST request to the backend API
    requestBackend(
      port, 
      '/extraction_MEDimage/run_all/prechecks', 
      requestData, (response) => {
        console.log("response", response)
        if (response.error) {
          // Handle errors if the request fails
          console.log("Error on response pre checks")
          setRefreshEnabledPreChecks(false)
          toast.error('Error: ' + response.error)
        } else {
          // Handle the response from the backend if needed
          console.log('Response from backend:', response);
          toast.success('Pre-checks done!')
          // refresh
          setRefreshEnabledPreChecks(false);
          // set images
          let imagesPreCheck = new Array();
          response["url_list"].map((value, key) => (imagesPreCheck.push({itemImageSrc: value, alt: response["list_titles"][key]})));
          setPreChecksImages(imagesPreCheck);
        }
      })
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

  useEffect(() => {
    if (!refreshEnabledPreChecks ) {
      setRefreshEnabledPreChecks(false);
    };
  }, [refreshEnabledPreChecks]); // The empty dependency array ensures this effect runs only once when the component mounts

  /**
   * @returns {JSX.Element} A tree menu or a warning message
   * @param {Object} JsonData - The data to display in the tree menu
   * @description This function is used to render the tree menu of the extraction node.
  */
  function JsonDataDisplay(JsonData){
    const DisplayData = [JsonData].map(
        info=>{
            return(
              info.map((infos, index)=>{
                return(
                <tr key={index}>
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
      <div className="tree-menu-container">
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
      let summaryTable = null
      try{
        summaryTable = JsonDataDisplay(summary)
      } catch (error) {
        console.error('Error displaying summary:', error)
        summaryTable = <Alert variant="danger" className="warning-message">
          <b>No summary available</b>
        </Alert>
      }
      return summaryTable
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
    {console.log("selected save folder", selectedSaveFolder)}
    <div>
    <Card>
      <Card.Body>
        <Card.Header>
            <h4>Data Manager - Process data</h4>
            <DocLink 
              linkString={"https://medimage.readthedocs.io/en/latest/tutorials.html#datamanager"} 
              name={"What is DataManager?"} 
              image={"https://www.svgrepo.com/show/521262/warning-circle.svg"} 
            />
        </Card.Header>
      <Form className="inputFile">
      {/* UPLOAD DICOM DATASET FOLDER*/}
        <Row className="form-group-box">
          <Tooltip target=".dcm-path"/>
          <Form.Label 
            className="dcm-path" 
            data-pr-tooltip="Path to the DICOM dataset folder you want to process"
            data-pr-position="bottom"
            htmlFor="file">
              DICOM dataset folder
          </Form.Label>
          <Col style={{ width: "150px" }}>
            <h6>Load from workspace</h6>
            <Dropdown
              style={{ maxWidth: "100%", height: "auto", width: "auto" }}
              filter
              value={selectedDcmFolder}
              onChange={(e) => setSelectedDcmFolder(e.value)}
              options={listWSFolders}
              optionLabel="name"
              display="chip"
              placeholder="Select a folder"
            />
          </Col>
          <Col style={{ width: "150px" }}>
            <h6>Load from a local path</h6>
            <Form.Group controlId="enterFile">
              <Form.Control
                name="pathDicoms"
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
          <Tooltip target=".nifti-path"/>
          <Form.Label 
            className="nifti-path" 
            data-pr-tooltip="Path to the NIfTI dataset folder you want to process" 
            data-pr-position="bottom"
            htmlFor="file">
              NIfTI dataset folder
          </Form.Label>
          <Col style={{ width: "150px" }}>
            <h6>Load from workspace</h6>
            <Dropdown
              style={{ maxWidth: "100%", height: "auto", width: "auto" }}
              filter
              value={selectedNiftiFolder}
              onChange={(e) => setSelectedNiftiFolder(e.value)}
              options={listWSFolders}
              optionLabel="name"
              display="chip"
              placeholder="Select a folder"
            />
          </Col>
          <Col style={{ width: "150px" }}>
            <h6>Load from a local path</h6>
            <Form.Group controlId="enterFile">
              <Form.Control
                name="pathNiftis"
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
          <Tooltip target=".save-path"/>
          <Form.Label 
            className="save-path" 
            data-pr-tooltip="Folder to where the processed data will be saved"
            data-pr-position="bottom"
            htmlFor="file">
              Saving Options
          </Form.Label>
          <Col style={{ width: "150px" }}>
            <h6>Save in workspace</h6>
            <Dropdown
              style={{ maxWidth: "100%", height: "auto", width: "auto" }}
              filter
              value={selectedSaveFolder}
              onChange={(e) => setSelectedSaveFolder(e.value)}
              options={listWSFolders}
              optionLabel="name"
              display="chip"
              placeholder="Select Saving Folder"
            />
          </Col>
          <Col style={{ width: "150px" }}>
            <h6>Save in a local path</h6>
            <Form.Group controlId="enterFile">
              <Form.Control
                name="pathSave"
                type="file"
                webkitdirectory="true"
                directory="true"
                onChange={handleSaveFolderChange}
              />
            </Form.Group>
          </Col>
          {/* NUMBER OF BATCH*/}
          <Col>
            <Tooltip target=".nbatch"/>
            <h6 
              className="nbatch"
              data-pr-tooltip="Number of cores to use for the parallel processing"
              data-pr-position="bottom"
              >
              Number of cores to use :
            </h6>
            <Form.Control
              name="nBatch"
              type="number"
              defaultValue={12}
              placeholder={"Default: " + 12}
              onChange={handleNBatchChange}
            />
          </Col>
        </Row>
      </Form>

      {/* PROCESS BUTTON*/}
      <Row className="form-group-box">
        <Col>
            <Button
              severity="success"
              label="Process"
              name="ProcessButton"
              onClick={handleProcessClick}
              disabled={(!selectedDcmFolder || !selectedSaveFolder || refreshEnabled) && (!selectedNiftiFolder || !selectedSaveFolder)}
              icon="pi pi-wrench"
              raised
              rounded
              loading={refreshEnabled}
            />
          </Col>
        <Col>
          <Button
            severity="secondary"
            label="Show Summary"
            name="ShowSummaryButton"
            onClick={handleOffCanvasShow}
            icon="pi pi-list"
            raised
            rounded
          />
        </Col>
      </Row>

        {/* PROGRESS BAR*/}
        {(refreshEnabled || progress === 100 || progress !== 0) && (
        <React.Fragment>
          <br />
          <br />
          <br />
          <br />
        </React.Fragment>
        )}
        <Row className="text-center">
          {(progress === 0) && (refreshEnabled) &&(
            <div className="progress-bar-requests">
                <ProgressBar animated striped variant="danger" now={100} label="Reading data and associating mask objects to imaging volumes"/>
            </div>)}
          {progress !== 0 && progress !== 100 &&(<div className="progress-bar-requests">
                <label>Processing</label>
                <ProgressBar animated striped variant="info" now={progress} label={`${progress}%`} />
            </div>)}
          {progress === 100 &&(<div className="progress-bar-requests">
              <label>Done!</label>
              <ProgressBar animated striped variant="success" now={progress} label={`${progress}%`} />
          </div>)}
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

    {/* RADIOMICS PRE-CHECKS*/}
    <Card>
      <Card.Body>
        <Card.Header>
            <h4>Data Manager - Radiomics Pre-checks</h4>
            <DocLink 
              linkString={"https://medomics-udes.gitbook.io/medimage-app-docs/radiomics/data-processing/radiomics-pre-checks"} 
              name={"What are Radiomics Pre-Checks?"} 
              image={"https://www.svgrepo.com/show/521262/warning-circle.svg"} 
            />
        </Card.Header>

        <Row className="form-group-box">
          <h6>Use Workspace Data</h6>
          <Col style={{ width: "150px" }}>
            <Tooltip target=".csv-file-ws"/>
            <h6 
              className="csv-file-ws"
              data-pr-tooltip="CSV file containing the scans to check and their associated ROI (Region of Interest)"
              data-pr-position="bottom"
            >
              CSV from workspace
            </h6>
            <Dropdown
              style={{ maxWidth: "100%", height: "auto", width: "auto" }}
              filter
              value={selectedCSVFile}
              onChange={(e) => setSelectedCSVFile(e.value)}
              options={listCSVFiles}
              optionLabel="name"
              display="chip"
              placeholder="Select a file"
            />
          </Col>
          <Col style={{ width: "150px" }}>
            <Tooltip target=".npy-dataset-ws"/>
            <h6 
              className="npy-dataset-ws"
              data-pr-tooltip="Folder containing the .npy files to check"
              data-pr-position="bottom"
            >
              NPY dataset from workspace
            </h6>
            <Dropdown
              style={{ maxWidth: "100%", height: "auto", width: "auto" }}
              filter
              value={selectedNpyFolder}
              onChange={(e) => setSelectedNpyFolder(e.value)}
              options={listWSFolders}
              optionLabel="name"
              display="chip"
              placeholder="Select a folder"
            />
          </Col>
          <Col style={{ width: "150px" }}>
            <Tooltip target=".npy-dataset-ws"/>
            <h6 
              className="npy-dataset-ws"
              data-pr-tooltip="Folder containing the .npy files to check"
              data-pr-position="bottom"
            >
              Save in workspace
            </h6>
            <Dropdown
              style={{ maxWidth: "100%", height: "auto", width: "auto" }}
              filter
              value={selectedSavePreChecksFolder}
              onChange={(e) => setSelectedSavePreChecksFolder(e.value)}
              options={listWSFolders}
              optionLabel="name"
              display="chip"
              placeholder="Select Saving Folder"
            />
          </Col>

          {/* ADD SEPERATOR*/}
          <hr style={{display:"inline-block", marginTop:"15px"}}></hr>
          <h6>Or - Use Local Data</h6>

          <Col style={{ width: "150px" }}>
            <Form method="post" encType="multipart/form-data" className="inputFile">
              {/* UPLOAD CSV FILE*/}
              <Tooltip target=".csv-file"/>
              <Form.Label 
                className="csv-file" 
                data-pr-tooltip="CSV file containing the scans to check and their associated ROI (Region of Interest)"
                data-pr-position="bottom"
                htmlFor="file">
                  Local CSV File
              </Form.Label>
              <Form.Group controlId="enterFile">
                <Form.Control
                  name="pathCSV"
                  type="file"
                  onChange={handleCSVFileChange}
                />
              </Form.Group>
            </Form>
          </Col>

          {/* UPLOAD SAVING FOLDER*/}
          <Col style={{ width: "150px" }}>
            <Form method="post" encType="multipart/form-data" className="inputFile">
              <Tooltip target=".npy-path"/>
              <Form.Label 
                className="npy-path" 
                data-pr-tooltip="Path to the folder containing the .npy files to check (If empty, path save will be used)"
                data-pr-position="bottom"
                htmlFor="file">
                  NPY dataset folder
              </Form.Label>
              <Form.Group controlId="enterFile">
                <Form.Control
                  name="pathNpy"
                  type="file"
                  webkitdirectory="true"
                  directory="true"
                  onChange={handleNpyFolderChange}
                />
              </Form.Group>
            </Form>
          </Col>
      </Row>   
      
      {/* WILD CARDS*/}
      <Form>
          <Row className="form-group-box">
            <Tooltip target=".checks-options"/>
            <Form.Label 
              className="checks-options" 
              data-pr-tooltip="Options to select the scans to check (institutions, modalities, etc.).
               If empty, use a costum wildcard (e.g. 'STS*CECT*.npy')"
              data-pr-position="bottom"
              htmlFor="file">
                Pre-checks options
            </Form.Label>
            <Col>
              <MultiSelect 
                value={selectedStudies} 
                onChange={(e) => setSelectedStudies(e.value)} 
                options={selectedPreChecksOptions === null ? [] : selectedPreChecksOptions.studies} 
                optionLabel="label" 
                display="chip"
                placeholder="Select studies" 
                className="w-full md:w-20rem" 
              />
            </Col>
            <Col>
              <MultiSelect 
                value={selectedInstitutions} 
                onChange={(e) => setSelectedInstitutions(e.value)} 
                options={selectedPreChecksOptions === null ? [] : selectedPreChecksOptions.institutions}
                optionLabel="label" 
                display="chip"
                placeholder="Select institutions" 
                className="w-full md:w-20rem" 
              />
            </Col>
            <Col>
              <MultiSelect 
                value={selectedModalities} 
                onChange={(e) => setSelectedModalities(e.value)} 
                options={selectedPreChecksOptions === null ? [] : selectedPreChecksOptions.modalities} 
                optionLabel="label" 
                display="chip"
                placeholder="Select Modalities" 
                className="w-full md:w-20rem" 
              />
            </Col>
            <Col>
              <InputText placeholder="Costum (optional)" onChange={(e) => setCostumWildCard(e.target.value)}/>
            </Col>
          </Row>
        </Form>
      
      {/* RUN PRE-CHECKS BUTTON*/}
      <Row className="form-group-box">
        <Col>
          <Button
            severity="success"
            label="RUN"
            name="RunButton"
            onClick={handleRunClick}
            disabled={
              (!selectedCSVFile || refreshEnabledPreChecks) || 
              (selectedModalities.length === 0 && selectedInstitutions.length === 0 && selectedStudies.length === 0 && !costumWildCard)}
            icon="pi pi-play"
            raised
            rounded
            loading={refreshEnabledPreChecks}
          />
        </Col>
        <Col>
          <Button
            severity="secondary"
            label="Show results"
            name="ShowResultsButton"
            onClick={() => setShowPreChecksImages(true)}
            icon="pi pi-images"
            raised
            rounded
          />
        </Col>
        </Row>
      </Card.Body>
    </Card>
    
    {/*PreChecks images dialog*/}
    <Dialog 
      header="Radiomics Pre-Checks Results" 
      visible={showPreChecksImages} 
      style={{ width: '50vw' }}
      position={'right'}
      onHide={() => setShowPreChecksImages(false)}
    >
      {((preChecksImages.length !== 0) && 
        (<Galleria value={preChecksImages} style={{ maxWidth: '640px' }} showThumbnails={false} showIndicators item={itemTemplate} />)
      )}
      {((preChecksImages.length === 0) && 
        (<Alert variant="danger" className="warning-message">
          <b>No results available</b>
        </Alert>)
      )}
    </Dialog>

  </div>
  </>
  );
}

export default DataManager;
