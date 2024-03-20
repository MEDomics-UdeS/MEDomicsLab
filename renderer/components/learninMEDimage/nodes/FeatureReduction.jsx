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
const FeatureReduction = ({ id, data, type }) => {

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
              {/* nSplits */}
              <Form.Group controlId="nSplits">
              <Tooltip target=".nSplits"/>
              <Form.Label 
                  className="nSplits" 
                  data-pr-tooltip="Number of FDA splits"
                  data-pr-position="bottom">
                      Number of Splits
              </Form.Label>
                <InputNumber
                    style={{width: "300px"}}
                    buttonLayout="horizontal"
                    value={data.setupParam.possibleSettings.defaultSettings.FDA.nSplits}
                    onValueChange={(event) => {
                      data.setupParam.possibleSettings.defaultSettings.FDA.nSplits = event.target.value;
                        setReload(!reload);
                    }}
                    mode="decimal"
                    showButtons
                    min={1}
                    step={1}
                    incrementButtonClassName="p-button-info"
                    decrementButtonClassName='p-button-info' 
                />
              </Form.Group>

              {/* corrType */}
              <Form.Group controlId="corrType">
              <Tooltip target=".corrType"/>
              <Form.Label 
                  className="corrType" 
                  data-pr-tooltip="Method to compute the correlation between features"
                  data-pr-position="bottom">
                      Correlation Method
              </Form.Label>
                <Dropdown 
                    style={{width: "300px"}}
                    value={data.setupParam.possibleSettings.defaultSettings.FDA.corrType}
                    options={[{ name: 'Spearman' }, { name: 'Pearson' }]}
                    optionLabel="name" 
                    placeholder={data.setupParam.possibleSettings.defaultSettings.FDA.corrType}
                    onChange={(event) => {
                      data.setupParam.possibleSettings.defaultSettings.FDA.corrType = event.target.value.name;
                      setReload(!reload);
                    }} 
                />
              </Form.Group>

              {/* threshStableStart */}
              <Form.Group controlId="threshStableStart">
              <Tooltip target=".threshStableStart"/>
              <Form.Label 
                  className="threshStableStart" 
                  data-pr-tooltip="Minimum correlation to outcome threshold to consider a feature as stable"
                  data-pr-position="bottom">
                      Stability Threshold
              </Form.Label>
                <InputNumber
                    style={{width: "300px"}}
                    buttonLayout="horizontal"
                    value={data.setupParam.possibleSettings.defaultSettings.FDA.threshStableStart}
                    onValueChange={(event) => {
                      data.setupParam.possibleSettings.defaultSettings.FDA.threshStableStart = event.target.value;
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

              {/* threshInterCorr */}
              <Form.Group controlId="threshInterCorr">
              <Tooltip target=".threshInterCorr"/>
              <Form.Label 
                  className="threshInterCorr" 
                  data-pr-tooltip="Minimum inter-correlation between features to consider them as redundant"
                  data-pr-position="bottom">
                      Inter-Correlation Threshold
              </Form.Label>
                <InputNumber
                    style={{width: "300px"}}
                    buttonLayout="horizontal"
                    value={data.setupParam.possibleSettings.defaultSettings.FDA.threshInterCorr}
                    onValueChange={(event) => {
                      data.setupParam.possibleSettings.defaultSettings.FDA.threshInterCorr = event.target.value;
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

              {/* minNfeatStable */}
              <Form.Group controlId="minNfeatStable">
              <Form.Label className="minNfeatStable">
                  Minimum Number of Stable Features
              </Form.Label>
                <InputNumber
                    style={{width: "300px"}}
                    buttonLayout="horizontal"
                    value={data.setupParam.possibleSettings.defaultSettings.FDA.minNfeatStable}
                    onValueChange={(event) => {
                      data.setupParam.possibleSettings.defaultSettings.FDA.minNfeatStable = event.target.value;
                        setReload(!reload);
                    }}
                    mode="decimal"
                    showButtons
                    min={1}
                    step={1}
                    incrementButtonClassName="p-button-info"
                    decrementButtonClassName='p-button-info' 
                />
              </Form.Group>

              {/* minNfeatInterCorr */}
              <Form.Group controlId="minNfeatInterCorr">
              <Form.Label className="minNfeatInterCorr">
                  Minimum Number of Inter-Correlated Features
              </Form.Label>
                <InputNumber
                    style={{width: "300px"}}
                    buttonLayout="horizontal"
                    value={data.setupParam.possibleSettings.defaultSettings.FDA.minNfeatInterCorr}
                    onValueChange={(event) => {
                      data.setupParam.possibleSettings.defaultSettings.FDA.minNfeatInterCorr = event.target.value;
                        setReload(!reload);
                    }}
                    mode="decimal"
                    showButtons
                    min={1}
                    step={1}
                    incrementButtonClassName="p-button-info"
                    decrementButtonClassName='p-button-info' 
                />
              </Form.Group>

              {/* minNfeat */}
              <Form.Group controlId="minNfeat">
              <Tooltip target=".minNfeat"/>
              <Form.Label 
                  className="minNfeat" 
                  data-pr-tooltip="The final number of features that will be used to train the model"
                  data-pr-position="bottom">
                      Final Number of Features
              </Form.Label>
                <InputNumber
                    style={{width: "300px"}}
                    buttonLayout="horizontal"
                    value={data.setupParam.possibleSettings.defaultSettings.FDA.minNfeat}
                    onValueChange={(event) => {
                      data.setupParam.possibleSettings.defaultSettings.FDA.minNfeat = event.target.value;
                        setReload(!reload);
                    }}
                    mode="decimal"
                    showButtons
                    min={1}
                    step={1}
                    incrementButtonClassName="p-button-info"
                    decrementButtonClassName='p-button-info' 
                />
              </Form.Group>

            </Row>
          </>
        }
      />
    </>
  )
}

export default FeatureReduction
