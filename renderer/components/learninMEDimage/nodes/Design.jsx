import React from "react"
import Node from "../../flow/node"
import { Form, Row, Col } from "react-bootstrap"
import { InputText } from 'primereact/inputtext';
import {useState} from 'react';
import { Tooltip } from 'primereact/tooltip';
import { Dropdown } from 'primereact/dropdown';
import { InputNumber } from 'primereact/inputnumber';
import { InputSwitch } from 'primereact/inputswitch';
import { Button } from 'primereact/button';


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
const Design = ({ id, data, type }) => {  
  const [reload, setReload] = useState(false);

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
              {/* Experiment Name */}
              <Form.Group controlId="expName">
              <Tooltip target=".expName"/>
              <Form.Label 
                  className="expName" 
                  data-pr-tooltip="Name of the experiment. Must respect the following norm: Problem_RadiomicsLevel_Modality. For example: LungCancer_Morph_CT"
                  data-pr-position="bottom">
                      Experiment Name
              </Form.Label>
                <InputText
                    style={{width: "300px"}}
                    value={data.setupParam.possibleSettings.defaultSettings.expName}
                    placeholder="Ex: Problem_RadiomicsLevel_Modality"
                    onChange={(event) => {
                      data.setupParam.possibleSettings.defaultSettings.expName = event.target.value;
                      data.internal.settings.expName = event.target.value;
                      setReload(!reload);
                    }}
                />
              </Form.Group>

              {/* Split Type */}
              <Form.Group controlId="splitType">
              <Tooltip target=".splitType"/>
              <Form.Label 
                  className="splitType" 
                  data-pr-tooltip="Splitting type of the data for ML phase. Random, institution-based or cross-validation."
                  data-pr-position="bottom">
                      Split Type
              </Form.Label>
                <Dropdown 
                    style={{width: "300px"}}
                    value={data.setupParam.possibleSettings.defaultSettings.testSets[0]}
                    options={[{ name: 'Random' }, { name: 'Institution' }, { name: 'Cross-Validation' }]}
                    optionLabel="name" 
                    placeholder={data.setupParam.possibleSettings.defaultSettings.testSets[0]}
                    onChange={(event) => {
                      if (event.target.value.name === "Cross-Validation") {
                        data.setupParam.possibleSettings.defaultSettings.testSets[0] = 'cv';
                        data.internal.settings.testSets[0] = 'cv';
                      } else {
                      data.setupParam.possibleSettings.defaultSettings.testSets[0] = event.target.value.name;
                      data.internal.settings.testSets[0] = event.target.value.name;
                      }
                      setReload(!reload);
                    }} 
                />
              </Form.Group>

              {/* OTHER PARAMS IF SPLIT TYPE IS RANDOM */}
              {data.setupParam.possibleSettings.defaultSettings.testSets[0] === "Random" &&
              <>
              {/* Split Method */}
              <Form.Group controlId="splitMethod">
              <Tooltip target=".splitMethod"/>
              <Form.Label 
                  className="splitMethod" 
                  data-pr-tooltip="Method to randomly split the data. Only 'SubSampling' is available for now."
                  data-pr-position="bottom">
                      Split Method
              </Form.Label>
                <Dropdown 
                    style={{width: "300px"}}
                    value={data.setupParam.possibleSettings.defaultSettings.Random.method}
                    options={[{ name: 'SubSampling' }]}
                    optionLabel="name" 
                    placeholder={data.setupParam.possibleSettings.defaultSettings.Random.method}
                    onChange={(event) => {
                      data.setupParam.possibleSettings.defaultSettings.Random.method = event.target.value.name;
                      data.internal.settings.Random.method = event.target.value.name;
                      setReload(!reload);
                    }} 
                        />
              </Form.Group>

              {/* Number of splits */}
              <Form.Group controlId="nSplits">
              <Tooltip target=".nSplits"/>
              <Form.Label 
                  className="nSplits" 
                  data-pr-tooltip="Number of splits to perform."
                  data-pr-position="bottom">
                      Splits Number
              </Form.Label>
                <InputNumber
                    style={{width: "300px"}}
                    buttonLayout="horizontal"
                    value={data.setupParam.possibleSettings.defaultSettings.Random.nSplits}
                    onValueChange={(event) => {
                      data.setupParam.possibleSettings.defaultSettings.Random.nSplits = event.target.value;
                      data.internal.settings.Random.nSplits = event.target.value;
                      setReload(!reload);
                    }}
                    mode="decimal"
                    showButtons
                    min={1}
                    incrementButtonClassName="p-button-info"
                    decrementButtonClassName='p-button-info' 
                />

              </Form.Group>

              {/* Flag by institution or not */}
              <Form.Group controlId="stratifyInstitutions">
              <Tooltip target=".stratifyInstitutions"/>
              <Form.Label 
                  className="stratifyInstitutions" 
                  data-pr-tooltip="If True, the train and test sets will have the same proportion of events from each institution."
                  data-pr-position="bottom">
                      Flag by Institution
              </Form.Label>
              <br></br>
                <InputSwitch 
                    checked={data.setupParam.possibleSettings.defaultSettings.Random.stratifyInstitutions} 
                    onChange={(event) => {
                        data.setupParam.possibleSettings.defaultSettings.Random.stratifyInstitutions = event.target.value;
                        data.internal.settings.Random.stratifyInstitutions = event.target.value;
                        setReload(!reload);
                    }}
                />
              </Form.Group>

              {/* Test proportion */}
              <Form.Group controlId="testProportion">
              <Tooltip target=".testProportion"/>
              <Form.Label 
                  className="testProportion" 
                  data-pr-tooltip="Percentage of the data to use for testing."
                  data-pr-position="bottom">
                      Train/Test Proportion
              </Form.Label>
                <InputNumber
                    style={{width: "300px"}}
                    buttonLayout="horizontal"
                    value={data.setupParam.possibleSettings.defaultSettings.Random.testProportion}
                    onValueChange={(event) => {
                        data.setupParam.possibleSettings.defaultSettings.Random.testProportion = event.target.value;
                        data.internal.settings.Random.testProportion = event.target.value;
                        setReload(!reload);
                    } }
                    mode="decimal"
                    showButtons
                    min={0.01}
                    max={0.99}
                    step={0.01}
                    incrementButtonClassName="p-button-info"
                    decrementButtonClassName='p-button-info' 
                />

              </Form.Group>

              {/* Seed */}
              <Form.Group controlId="seed">
              <Tooltip target=".seed"/>
              <Form.Label 
                  className="seed" 
                  data-pr-tooltip="Seed for the random generator."
                  data-pr-position="bottom">
                      Random Seed
              </Form.Label>
                <InputNumber
                    style={{width: "300px"}}
                    buttonLayout="horizontal"
                    value={data.setupParam.possibleSettings.defaultSettings.Random.seed}
                    onValueChange={(event) => {
                        data.setupParam.possibleSettings.defaultSettings.Random.seed = event.target.value;
                        data.internal.settings.Random.seed = event.target.value;
                        setReload(!reload);
                    } }
                    mode="decimal"
                    min={1}
                />

              </Form.Group>


              </>
            }

            {/* OTHER PARAMS IF SPLIT TYPE IS CV */}
            {data.setupParam.possibleSettings.defaultSettings.testSets[0] === "cv" &&
              <>

              {/* Number of splits */}
              <Form.Group controlId="nSplits">
              <Tooltip target=".nSplits"/>
              <Form.Label 
                  className="nSplits" 
                  data-pr-tooltip="Number of folds for the cross-validation (referred to as K)."
                  data-pr-position="bottom">
                      Number of folds
              </Form.Label>
                <InputNumber
                    style={{width: "300px"}}
                    buttonLayout="horizontal"
                    value={data.setupParam.possibleSettings.defaultSettings.cv.nSplits}
                    onValueChange={(event) => {
                      data.setupParam.possibleSettings.defaultSettings.cv.nSplits = event.target.value;
                      data.internal.settings.cv.nSplits = event.target.value;
                      setReload(!reload);
                    }}
                    mode="decimal"
                    showButtons
                    min={1}
                    incrementButtonClassName="p-button-info"
                    decrementButtonClassName='p-button-info' 
                />

              </Form.Group>
              {/* Seed */}
              <Form.Group controlId="seed">
              <Tooltip target=".seed"/>
              <Form.Label 
                  className="seed" 
                  data-pr-tooltip="Seed for the random generator."
                  data-pr-position="bottom">
                      Random Seed
              </Form.Label>
                <InputNumber
                    style={{width: "300px"}}
                    buttonLayout="horizontal"
                    value={data.setupParam.possibleSettings.defaultSettings.cv.seed}
                    onValueChange={(event) => {
                        data.setupParam.possibleSettings.defaultSettings.cv.seed = event.target.value;
                        data.internal.settings.cv.seed = event.target.value;
                        setReload(!reload);
                    } }
                    mode="decimal"
                    min={1}
                />

              </Form.Group>
              </>
            }
            </Row>
          </>
        }
      />
    </>
  )
}

export default Design
