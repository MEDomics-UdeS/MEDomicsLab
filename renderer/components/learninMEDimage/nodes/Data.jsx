import React from "react"
import Node from "../../flow/node"
import { Form, Row, Col } from "react-bootstrap"
import { InputText } from 'primereact/inputtext';
import {useState} from 'react';
import { Tooltip } from 'primereact/tooltip';
import { Checkbox } from 'primereact/checkbox';
import Card from 'react-bootstrap/Card';


/**
 * @param {string} id id of the node
 * @param {object} data data of the node
 * @param {string} type type of the node
 * @returns {JSX.Element} A SegmentationNode node
 *
 * @description
 * This component is used to display a SegmentationNode node.
 * it handles the display of the node and the modal
 */
const Data = ({ id, data, type }) => {  
  const [reload, setReload] = useState(false);
  const [featuresFiles, setFeaturesFiles] = useState([]);

  const handleSaveFolderChange = (event) => {
    const fs = require('fs');
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
      data.setupParam.possibleSettings.defaultSettings.path = fileList
      data.internal.settings.path = fileList
    }
    else {
      data.setupParam.possibleSettings.defaultSettings.path = event.target.files.path
      data.internal.settings.path = event.target.files.path
    }
    let files = fs.readdirSync(data.internal.settings.path)
    for (const i in files){
      console.log(files[i])
      if (files[i].endsWith(".csv")){
        featuresFiles.push(files[i])
      }
    }
    setReload(!reload);
  };

  return (
    <>
      <Node
        key={id}
        id={id}
        data={data}
        type={type}
        setupParam={data.setupParam}
        nodeSpecific={
          <>
            <Row className="form-group-box">
            <Col>
            {/* nameType */}
            <Form.Group controlId="nameType">
              <Tooltip target=".nameType"/>
              <Form.Label 
                  className="nameType" 
                  data-pr-tooltip="Type of the experiment. For Radiomics studies, must start with Radiomics. For example: RadiomicsMorph"
                  data-pr-position="bottom">
                      Name Type
              </Form.Label>
                <InputText
                    style={{width: "300px"}}
                    value={data.setupParam.possibleSettings.defaultSettings.nameType}
                    placeholder="Ex: RadiomicsMorph"
                    onChange={(event) => {
                      data.setupParam.possibleSettings.defaultSettings.nameType = event.target.value;
                      data.internal.settings.nameType = event.target.value;
                      setReload(!reload);
                    }}
                />
            </Form.Group>

            {/* path features */}
            <Form.Group controlId="FeaturePath">
            <Tooltip target=".FeaturePath"/>
            <Form.Label 
                className="FeaturePath" 
                data-pr-tooltip="Folder containing the features."
                data-pr-position="bottom">
                    Features Folder Name
            </Form.Label>
            <Col style={{ width: "300px" }}>
              <Form.Group controlId="enterFile">
                <Form.Control
                  name="FeaturePath"
                  type="file"
                  webkitdirectory="true"
                  directory="true"
                  onChange={handleSaveFolderChange}
                />
              </Form.Group>
            </Col>
            </Form.Group>

            {/* select features files */}
            {(featuresFiles.length > 0) && (
            <Form.Group controlId="selectFiles">
              <Tooltip target=".selectFiles"/>
              <Form.Label 
                  className="selectFiles" 
                  data-pr-tooltip="Select features files to use for model's training."
                  data-pr-position="bottom">
                      Select Features Files
              </Form.Label>
              <Card style={{ position: "relative" }}>
              {featuresFiles.map((file) => (
                <div key={file} style={{display: 'flex', justifyContent:'flex-start'}}>
                <Checkbox
                  onChange={(event) => {
                    console.log("event", event)
                    console.log("file", file)
                    // check if the file is already in the list if yes remove it
                    if (data.internal.settings.featuresFiles.includes(file)) {
                      console.log("remove")
                      data.internal.settings.featuresFiles.splice(data.internal.settings.featuresFiles.indexOf(file), 1);
                    } else {
                      data.internal.settings.featuresFiles.push(file);
                    }
                    setReload(!reload);
                  }}
                  checked={data.internal.settings.featuresFiles.includes(file)}
                />
                <label htmlFor={file} className="ml-2">{file}</label>
                </div>
              ))}
              </Card>
            </Form.Group>
            )}
            </Col>
            </Row>
          </>
        }
      />
    </>
  )
}

export default Data
