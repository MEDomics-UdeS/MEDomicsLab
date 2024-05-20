import React from "react"
import Node from "../../flow/node"
import { Form, Row, Col } from "react-bootstrap"
import { InputText } from 'primereact/inputtext';
import {useState} from 'react';
import { Tooltip } from 'primereact/tooltip';
import { InputSwitch } from 'primereact/inputswitch';


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
const Split = ({ id, data, type }) => {  
  const [reload, setReload] = useState(false);

  const handleCSVFileChange = (event) => {
    var fileList = event.target.files
    if (fileList.length > 0) {
      fileList = fileList[0].path
      data.setupParam.possibleSettings.defaultSettings.path_outcome_file = fileList
    }
    else {
      data.setupParam.possibleSettings.defaultSettings.path_outcome_file = event.target.files.path
    }
    setReload(!reload);
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
      data.setupParam.possibleSettings.defaultSettings.path_save_experiments = fileList
      data.internal.settings.path_save_experiments = fileList
    }
    else {
      data.setupParam.possibleSettings.defaultSettings.path_save_experiments = event.target.files.path
      data.internal.settings.path_save_experiments = event.target.files.path
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

              {/* Outcome Name */}
              <Form.Group controlId="outcomeName">
              <Tooltip target=".outcomeName"/>
              <Form.Label 
                  className="outcomeName" 
                  data-pr-tooltip="Name used to describe the problem studied."
                  data-pr-position="bottom">
                      Outcome Name
              </Form.Label>
                <InputText
                    style={{width: "300px"}}
                    value={data.setupParam.possibleSettings.defaultSettings.outcome_name}
                    placeholder="Ex: RCC_Subtype"
                    onChange={(event) => {
                      data.setupParam.possibleSettings.defaultSettings.outcome_name = event.target.value;
                      data.internal.settings.outcome_name = event.target.value;
                      setReload(!reload);
                    }}
                />
              </Form.Group>

              {/* Split Method */}
              <Form.Group controlId="splitMethod">
              <Tooltip target=".splitMethod"/>
              <Form.Label 
                  className="splitMethod" 
                  data-pr-tooltip="If activated a holdout set will be created. If not, all the data will be used for learning."
                  data-pr-position="bottom">
                      Create Holdout Set
              </Form.Label>
                <br></br>
                <InputSwitch 
                    checked={data.setupParam.possibleSettings.defaultSettings.method == 'random' ? true : false} 
                    onChange={(event) => {
                      data.setupParam.possibleSettings.defaultSettings.method = event.value ? 'random' : 'all_learn';
                        data.internal.settings.method = event.value ? 'random' : 'all_learn';
                        setReload(!reload);
                    }}
                />
              </Form.Group>

              {/* Path Outcome */}
              <Form.Group controlId="outcomeFile">
              <Tooltip target=".outcomeFile"/>
              <Form.Label 
                  className="outcomeFile" 
                  data-pr-tooltip="CSV file of the outcomes."
                  data-pr-position="bottom">
                      Outcomes CSV
              </Form.Label>
              <Col style={{ width: "300px" }}>
                <Form.Group controlId="enterFile">
                  <Form.Control
                    name="outcomeFile"
                    type="file"
                    accept=".csv, xls, xlsx, txt"
                    onChange={handleCSVFileChange}
                  />
                </Form.Group>
              </Col>
              </Form.Group>

              {/* Save Folder */}
              <Form.Group controlId="saveFolder">
              <Tooltip target=".saveFolder"/>
              <Form.Label 
                  className="saveFolder" 
                  data-pr-tooltip="Folder where the experiment will be saved (data & results). The folder should not be empty (bug)."
                  data-pr-position="bottom">
                      Save Folder
              </Form.Label>
              <Col style={{ width: "300px" }}>
                <Form.Group controlId="enterFolder">
                <input
                  name="saveFolder"
                  type="file"
                  webkitdirectory="true"
                  directory="true"
                  onChange={handleSaveFolderChange}
                />
                </Form.Group>
              </Col>
              </Form.Group>


            </Row>
          </>
        }
      />
    </>
  )
}

export default Split
