import React from "react"
import Node from "../../flow/node"
import { Form, Row } from "react-bootstrap"
import {useState} from 'react';
import { Tooltip } from 'primereact/tooltip';
import { Dropdown } from 'primereact/dropdown';
import { InputNumber } from 'primereact/inputnumber';


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
const Cleaning = ({ id, data, type }) => {

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
              {/* missingCutoffps */}
              <Form.Group controlId="missingCutoffps">
              <Tooltip target=".missingCutoffps"/>
              <Form.Label 
                  className="missingCutoffps" 
                  data-pr-tooltip="Maximum percentage cut-offs of missing features per sample"
                  data-pr-position="bottom">
                      Missing Cut Off/Sample
              </Form.Label>
                <InputNumber
                    style={{width: "300px"}}
                    buttonLayout="horizontal"
                    value={data.setupParam.possibleSettings.defaultSettings.default.feature.continuous.missingCutoffps}
                    onValueChange={(event) => {
                      data.setupParam.possibleSettings.defaultSettings.default.feature.continuous.missingCutoffps = event.target.value;
                        setReload(!reload);
                    }}
                    mode="decimal"
                    showButtons
                    min={0.01}
                    max={0.99}
                    step={0.01}
                    incrementButtonClassName="p-button-info"
                    decrementButtonClassName='p-button-info' 
                />
              </Form.Group>

              {/* missingCutoffpf */}
              <Form.Group controlId="missingCutoffpf">
              <Tooltip target=".missingCutoffpf"/>
              <Form.Label 
                  className="missingCutoffpf" 
                  data-pr-tooltip="Maximal percentage cut-offs of missing patient samples per feature"
                  data-pr-position="bottom">
                      Missing Patients Cut Off/Feature
              </Form.Label>
                <InputNumber
                    style={{width: "300px"}}
                    buttonLayout="horizontal"
                    value={data.setupParam.possibleSettings.defaultSettings.default.feature.continuous.missingCutoffpf}
                    onValueChange={(event) => {
                      data.setupParam.possibleSettings.defaultSettings.default.feature.continuous.missingCutoffpf = event.target.value;
                        setReload(!reload);
                    }}
                    mode="decimal"
                    showButtons
                    min={0.01}
                    max={0.99}
                    step={0.01}
                    incrementButtonClassName="p-button-info"
                    decrementButtonClassName='p-button-info' 
                />
              </Form.Group>

              {/* covCutoff */}
              <Form.Group controlId="covCutoff">
              <Tooltip target=".covCutoff"/>
              <Form.Label 
                  className="covCutoff" 
                  data-pr-tooltip="minimal coefficient of variation cut-offs over samples per feature"
                  data-pr-position="bottom">
                      Minimum variation percentage/feature
              </Form.Label>
                <InputNumber
                    style={{width: "300px"}}
                    buttonLayout="horizontal"
                    value={data.setupParam.possibleSettings.defaultSettings.default.feature.continuous.covCutoff}
                    onValueChange={(event) => {
                      data.setupParam.possibleSettings.defaultSettings.default.feature.continuous.covCutoff = event.target.value;
                        setReload(!reload);
                    }}
                    mode="decimal"
                    showButtons
                    min={0.01}
                    max={0.99}
                    step={0.01}
                    incrementButtonClassName="p-button-info"
                    decrementButtonClassName='p-button-info' 
                />
              </Form.Group>

              {/* imputation */}
              <Form.Group controlId="imputation">
              <Form.Label className="imputation">
                  Imputation Method
              </Form.Label>
                <Dropdown 
                    style={{width: "300px"}}
                    value={data.setupParam.possibleSettings.defaultSettings.default.feature.continuous.imputation}
                    options={[{ name: 'random' }, { name: 'mean' }, {name: 'median'}]}
                    optionLabel="name" 
                    placeholder={data.setupParam.possibleSettings.defaultSettings.default.feature.continuous.imputation}
                    onChange={(event) => {
                      data.setupParam.possibleSettings.defaultSettings.default.feature.continuous.imputation = event.target.value.name;
                      setReload(!reload);
                    }} 
                />
              </Form.Group>

            </Row>
          </>
        }
      />
    </>
  )
}

export default Cleaning
